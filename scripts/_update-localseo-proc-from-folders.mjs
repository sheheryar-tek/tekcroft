import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE =
  "C:/Users/Super/Downloads/Local SEO-20261012T103632Z-1-001/Local SEO/process section";
const OUT = path.join(ROOT, "public", "images");
const BODY = path.join(ROOT, "lib", "local-seo-body.html");
const CSS = path.join(ROOT, "app", "local-seo.css");
const MAX = 80 * 1024;

const STEPS = [
  {
    slug: "localseo-proc-audit",
    folder: "Free Audit & Competitor Gap Analysis",
    label: "Free Audit & Competitor Gap Analysis",
  },
  {
    slug: "localseo-proc-strategy",
    folder: "Custom Local SEO Strategy",
    label: "Custom Local SEO Strategy",
  },
  {
    slug: "localseo-proc-execution",
    folder: "Execution GBP, Citations, Content, Links",
    label: "Execution: GBP, Citations, Content, Links",
  },
  {
    slug: "localseo-proc-reporting",
    folder: "Transparent Monthly Reporting",
    label: "Transparent Monthly Reporting",
  },
];

function pickSrc(folder) {
  const dir = path.join(BASE, folder);
  const files = fs
    .readdirSync(dir)
    .filter((n) => /\.(jpe?g|png|webp)$/i.test(n))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  if (!files.length) throw new Error("no images in " + dir);
  const preferred = files.find((f) => /^1\./i.test(f));
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
    .filter((n) => /^localseo-proc-[a-z]+-[a-f0-9]+\.webp$/i.test(n))
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
  const altEsc = s.label.replace(/&/g, "&amp;");
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
  // strip any prior eg-pic spans, keep labels/numbers
  const rest = inner.replace(/<span class="eg-pic">[\s\S]*?<\/span>\s*/g, "");
  return `${open}\n          ${pics.join(
    "\n          "
  )}\n${rest.trimStart()}${close}`;
});

fs.writeFileSync(BODY, html);
console.log("updated local-seo-body.html");

let css = fs.readFileSync(CSS, "utf8");
const cssBlock = `
/* Per-step disc photos (4 stages) — replace single --shot-3 ::before */
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
  // append near end of file after eg section — find .eg-face::before in local-seo
  const marker = ".eg-face > *{position:relative; z-index:1;}";
  const idx = css.indexOf(marker);
  if (idx < 0) throw new Error("CSS marker not found");
  css =
    css.slice(0, idx + marker.length) +
    cssBlock +
    css.slice(idx + marker.length);
  fs.writeFileSync(CSS, css);
  console.log("updated local-seo.css");
} else {
  console.log("local-seo.css already has eg-pic rules");
}

for (const n of old) {
  fs.unlinkSync(path.join(OUT, n));
  console.log("deleted", n);
}

fs.writeFileSync(
  path.join(ROOT, "scripts", "_localseo-proc-map.json"),
  JSON.stringify(results, null, 2) + "\n"
);
console.log("done");
