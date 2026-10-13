import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE =
  "C:/Users/Super/Downloads/mobile-app-development-20261013T132412Z-1-001/mobile-app-development/Services";
const OUT = path.join(ROOT, "public", "images");
const BODY = path.join(ROOT, "lib", "mobile-app-development-body.html");
const CSS = path.join(ROOT, "app", "mobile-app-development.css");
const MAX = 80 * 1024;

/** Match #services-2 tm-item order (data-at / data-i 0..4) */
const PANELS = [
  { i: 0, folder: "Roadmap & User Flows", alt: "Roadmap & User Flows" },
  {
    i: 1,
    folder: "Native & Cross-Platform Development",
    alt: "Native & Cross-Platform Development",
  },
  { i: 2, folder: "Infrastructure & APIs", alt: "Infrastructure & APIs" },
  {
    i: 3,
    folder: "Testing & Store Submission",
    alt: "Testing & Store Submission",
  },
  { i: 4, folder: "Post-Launch Support", alt: "Post-Launch Support" },
];

function findDesktop(folder) {
  const dir = path.join(BASE, folder);
  if (!fs.existsSync(dir)) throw new Error("missing folder " + folder);
  const sub = fs
    .readdirSync(dir, { withFileTypes: true })
    .find((d) => d.isDirectory() && /^desktop$/i.test(d.name));
  if (!sub) throw new Error("no Desktop in " + folder);
  return path.join(dir, sub.name);
}

function pickSrc(folder) {
  const desk = findDesktop(folder);
  const files = fs
    .readdirSync(desk)
    .filter((n) => /\.(jpe?g|png|webp)$/i.test(n))
    .filter((n) => /^\d+\./i.test(n))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  if (!files.length) throw new Error("no numbered images in " + desk);
  const preferred = files.find((f) => /^2\./i.test(f));
  return path.join(desk, preferred || files[0]);
}

async function toWebp(srcPath) {
  let best = null;
  for (const [w, qStart] of [
    [1400, 72],
    [1200, 68],
    [1100, 62],
    [1024, 56],
    [960, 50],
    [880, 46],
  ]) {
    let lo = 40,
      hi = qStart;
    while (lo <= hi) {
      const q = Math.floor((lo + hi) / 2);
      const buf = await sharp(srcPath)
        .rotate()
        .resize({
          width: w,
          height: Math.round((w * 616) / 1024),
          fit: "cover",
          position: "centre",
        })
        .webp({ quality: q, effort: 6, smartSubsample: true })
        .toBuffer();
      if (buf.length <= MAX) {
        best = { buf, w, q, bytes: buf.length };
        lo = q + 1;
      } else hi = q - 1;
    }
    if (best && best.bytes < 70 * 1024) break;
  }
  if (!best) throw new Error("could not fit " + srcPath);
  const meta = await sharp(best.buf).metadata();
  const hash = crypto.createHash("sha256").update(best.buf).digest("hex").slice(0, 10);
  return { ...best, meta, hash };
}

const oldFiles = new Set(
  fs
    .readdirSync(OUT)
    .filter((n) => /^mad-tm-\d{2}-[a-f0-9]+\.webp$/i.test(n))
);

const results = [];
let html = fs.readFileSync(BODY, "utf8");

for (const p of PANELS) {
  const src = pickSrc(p.folder);
  if (!fs.existsSync(src)) throw new Error("missing " + src);
  const { buf, w, q, meta, hash } = await toWebp(src);
  const name = `mad-tm-${String(p.i + 1).padStart(2, "0")}-${hash}.webp`;
  fs.writeFileSync(path.join(OUT, name), buf);
  oldFiles.delete(name);
  const altEsc = p.alt
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
  const img = `<img src="/images/${name}" width="${meta.width}" height="${meta.height}" alt="${altEsc}" title="${altEsc}" decoding="async" loading="lazy">`;

  const itemRe = new RegExp(
    `(<div class="tm-item[^"]*"[^>]*data-i="${p.i}"[^>]*>\\s*)<span class="tm-bg" aria-hidden="true">[\\s\\S]*?<\\/span>\\s*(?=<span class="tm-slim")`,
    "m"
  );
  if (!itemRe.test(html)) {
    throw new Error("html match failed for panel " + (p.i + 1));
  }
  html = html.replace(
    itemRe,
    `$1<span class="tm-bg" aria-hidden="true">${img}<span class="tm-veil"></span></span>\n          `
  );

  results.push({
    i: p.i,
    file: `/images/${name}`,
    alt: p.alt,
    kb: +(buf.length / 1024).toFixed(1),
    q,
    w: meta.width,
    h: meta.height,
    src: path.relative(BASE, src).replace(/\\/g, "/"),
  });
  console.log(name, results.at(-1).kb + "KB", path.basename(src));
}

fs.writeFileSync(BODY, html);
console.log("updated body");

let css = fs.readFileSync(CSS, "utf8");
css = css.replace(
  /#services-2 \.tm-bg\{background:[^;]+;\}/g,
  "#services-2 .tm-bg{background:none !important;}"
);
const cssBlock = `
/* Mobile App TM panel photos (#services-2) */
#services-2 .tm-bg{background:none !important;}
#services-2 .tm-bg > img{position:absolute; inset:0; width:100%; height:100%; object-fit:cover; display:block;}
#services-2 .tm-veil{z-index:1;}
`;
if (!css.includes("Mobile App TM panel photos")) {
  const anchor = ".tm-item.on .tm-bg{opacity:1;}";
  const onBg = css.indexOf(anchor);
  if (onBg >= 0) {
    css =
      css.slice(0, onBg + anchor.length) +
      cssBlock +
      css.slice(onBg + anchor.length);
  } else {
    const lock = "/* === SITE CONSISTENCY LOCK";
    const lockI = css.indexOf(lock);
    if (lockI >= 0) css = css.slice(0, lockI) + cssBlock + "\n" + css.slice(lockI);
    else css += "\n" + cssBlock;
  }
}
fs.writeFileSync(CSS, css);
console.log("updated CSS");

for (const n of oldFiles) {
  fs.unlinkSync(path.join(OUT, n));
  console.log("deleted", n);
}

fs.writeFileSync(
  path.join(ROOT, "scripts", "_mad-tm-map.json"),
  JSON.stringify(results, null, 2) + "\n"
);
console.log("done");
