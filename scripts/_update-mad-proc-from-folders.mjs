import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE =
  "C:/Users/Super/Downloads/mobile-app-development-20261013T132412Z-1-001/mobile-app-development/Process Section";
const OUT = path.join(ROOT, "public", "images");
const BODY = path.join(ROOT, "lib", "mobile-app-development-body.html");
const CSS = path.join(ROOT, "app", "mobile-app-development.css");
const MAX = 80 * 1024;

/** Match #process eg-card order (data-at 0..5) — 6 stages */
const STEPS = [
  {
    slug: "mad-proc-discovery",
    folder: "Discovery & Scoping",
    label: "Discovery & Scoping",
  },
  { slug: "mad-proc-design", folder: "Design", label: "Design" },
  {
    slug: "mad-proc-development",
    folder: "Development",
    label: "Development",
  },
  { slug: "mad-proc-qa", folder: "QA & Testing", label: "QA & Testing" },
  { slug: "mad-proc-launch", folder: "Launch", label: "Launch" },
  { slug: "mad-proc-support", folder: "Support", label: "Support" },
];

function pickSrc(folder) {
  const dir = path.join(BASE, folder);
  if (!fs.existsSync(dir)) throw new Error("missing folder " + folder);
  const files = fs
    .readdirSync(dir)
    .filter((n) => /\.(jpe?g|png|webp)$/i.test(n))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  if (!files.length) throw new Error("no images in " + dir);
  const preferred = files.find((f) => /^2\./i.test(f));
  return path.join(dir, preferred || files[0]);
}

async function encodeUnder(srcPath) {
  let best = null;
  for (const size of [720, 640, 560, 480]) {
    let lo = 48,
      hi = 88;
    while (lo <= hi) {
      const q = Math.floor((lo + hi) / 2);
      const out = await sharp(srcPath)
        .rotate()
        .resize({ width: size, height: size, fit: "cover", position: "centre" })
        .webp({ quality: q, effort: 6, smartSubsample: true })
        .toBuffer();
      if (out.length <= MAX) {
        best = { buf: out, q, size, bytes: out.length };
        lo = q + 1;
      } else hi = q - 1;
    }
    if (best && best.bytes < 70 * 1024) break;
  }
  if (!best) throw new Error("could not fit " + srcPath);
  return best;
}

const old = new Set(
  fs
    .readdirSync(OUT)
    .filter((n) => /^mad-proc-[a-z]+-[a-f0-9]+\.webp$/i.test(n))
);

const results = [];
const pics = [];

for (const s of STEPS) {
  const src = pickSrc(s.folder);
  const r = await encodeUnder(src);
  const hash = crypto.createHash("sha1").update(r.buf).digest("hex").slice(0, 10);
  const name = `${s.slug}-${hash}.webp`;
  fs.writeFileSync(path.join(OUT, name), r.buf);
  old.delete(name);
  const altEsc = s.label
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
  pics.push(
    `<span class="eg-pic"><img src="/images/${name}" width="${r.size}" height="${r.size}" alt="${altEsc}" title="${altEsc}" decoding="async" loading="lazy"></span>`
  );
  results.push({
    slug: s.slug,
    file: `/images/${name}`,
    label: s.label,
    kb: +(r.bytes / 1024).toFixed(1),
    q: r.q,
    w: r.size,
    src: path.relative(BASE, src).replace(/\\/g, "/"),
  });
  console.log(name, results.at(-1).kb + "KB", path.basename(src));
}

let html = fs.readFileSync(BODY, "utf8");
const faceRe =
  /(<div class="eg-face">)([\s\S]*?)(<\/div>\s*<\/div>\s*<div class="eg-list">)/;
if (!faceRe.test(html)) throw new Error("eg-face block not found");

html = html.replace(faceRe, (_, open, inner, close) => {
  const rest = inner.replace(/<span class="eg-pic">[\s\S]*?<\/span>\s*/g, "");
  return `${open}\n          ${pics.join(
    "\n          "
  )}\n${rest.trimStart()}${close}`;
});

fs.writeFileSync(BODY, html);
console.log("updated body html");

let css = fs.readFileSync(CSS, "utf8");
const cssBlock = `
/* Per-step disc photos (6 stages) — Our process */
#process .eg-face{background:#0A0C0E; isolation:isolate;}
#process .eg-face::before{display:none;}
#process .eg-face::after{z-index:1;}
#process .eg-pic{
  position:absolute; inset:0; z-index:0;
  background:none;
  opacity:0; visibility:hidden;
  transition:opacity .45s var(--ease), visibility 0s linear .45s;
}
#process .eg[data-at="0"] .eg-pic:nth-child(1),
#process .eg[data-at="1"] .eg-pic:nth-child(2),
#process .eg[data-at="2"] .eg-pic:nth-child(3),
#process .eg[data-at="3"] .eg-pic:nth-child(4),
#process .eg[data-at="4"] .eg-pic:nth-child(5),
#process .eg[data-at="5"] .eg-pic:nth-child(6),
#process .eg:not([data-at]) .eg-pic:nth-child(1){
  opacity:1; visibility:visible; transition-delay:0s;
}
#process .eg-pic > img{
  position:absolute; inset:0; width:100%; height:100%;
  object-fit:cover; object-position:center; display:block;
}
#process .eg-face > *:not(.eg-pic){position:relative; z-index:2;}
`;

if (!css.includes("#process .eg-pic > img")) {
  const marker = ".eg-face > *{position:relative; z-index:1;}";
  const idx = css.indexOf(marker);
  if (idx < 0) {
    const lock = "/* === SITE CONSISTENCY LOCK";
    const lockIdx = css.indexOf(lock);
    if (lockIdx >= 0) {
      css = css.slice(0, lockIdx) + cssBlock + "\n" + css.slice(lockIdx);
    } else {
      css += "\n" + cssBlock;
    }
  } else {
    css =
      css.slice(0, idx + marker.length) +
      cssBlock +
      css.slice(idx + marker.length);
  }
  fs.writeFileSync(CSS, css);
  console.log("updated CSS");
} else if (!css.includes('#process .eg[data-at="5"] .eg-pic:nth-child(6)')) {
  css = css.replace(
    /#process \.eg\[data-at="4"\] \.eg-pic:nth-child\(5\),\s*#process \.eg:not\(\[data-at\]\) \.eg-pic:nth-child\(1\)\{/,
    `#process .eg[data-at="4"] .eg-pic:nth-child(5),
#process .eg[data-at="5"] .eg-pic:nth-child(6),
#process .eg:not([data-at]) .eg-pic:nth-child(1){`
  );
  fs.writeFileSync(CSS, css);
  console.log("upgraded CSS to 6 steps");
} else {
  console.log("CSS already has eg-pic rules");
}

for (const n of old) {
  fs.unlinkSync(path.join(OUT, n));
  console.log("deleted", n);
}

fs.writeFileSync(
  path.join(ROOT, "scripts", "_mad-proc-map.json"),
  JSON.stringify(results, null, 2) + "\n"
);
console.log("done");
