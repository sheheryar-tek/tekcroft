import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE =
  "C:/Users/Super/Downloads/Google-Business-Profile-Optimization-20261012T123510Z-1-001/Google-Business-Profile-Optimization/Services";
const OUT = path.join(ROOT, "public", "images");
const BODY = path.join(
  ROOT,
  "lib",
  "google-business-profile-optimization-body.html"
);
const CSS = path.join(ROOT, "app", "google-business-profile-optimization.css");
const MAX = 80 * 1024;

const PANELS = [
  {
    i: 0,
    folder: "NAP (Name, Address, Phone) Standardization",
    alt: "NAP (Name, Address, Phone) Standardization",
  },
  {
    i: 1,
    folder: "Category & Service Mapping",
    alt: "Category & Service Mapping",
  },
  {
    i: 2,
    folder: "Google Business Profile Description & Keyword Placement",
    alt: "Google Business Profile Description & Keyword Placement",
  },
  {
    i: 3,
    folder: "Google Business Profile Photos Optimization",
    alt: "Google Business Profile Photos Optimization",
  },
  {
    i: 4,
    folder: "Google Business Profile Posts Management",
    alt: "Google Business Profile Posts Management",
  },
  {
    i: 5,
    folder: "Google Business Profile Review Management",
    alt: "Google Business Profile Review Management",
  },
  {
    i: 6,
    folder: "Q&A Management",
    alt: "Q&A Management",
  },
  {
    i: 7,
    folder: "Services & Products Listings",
    alt: "Services & Products Listings",
  },
  {
    i: 8,
    folder: "Fake & Duplicate Listing Protection",
    alt: "Fake & Duplicate Listing Protection",
  },
];

function findDesktop(folder) {
  const dir = path.join(BASE, folder);
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
    .filter((n) => /^gbp-tm-\d{2}-[a-f0-9]+\.webp$/i.test(n))
);

const results = [];
let html = fs.readFileSync(BODY, "utf8");

for (const p of PANELS) {
  const src = pickSrc(p.folder);
  if (!fs.existsSync(src)) throw new Error("missing " + src);
  const { buf, w, q, meta, hash } = await toWebp(src);
  const name = `gbp-tm-${String(p.i + 1).padStart(2, "0")}-${hash}.webp`;
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
    width: meta.width,
    height: meta.height,
    enc: `w${w}q${q}`,
    src: path.relative(BASE, src).replace(/\\/g, "/"),
  });
  console.log(
    `P${p.i + 1}`,
    name,
    results[results.length - 1].kb + "KB",
    path.basename(src)
  );
}

for (const f of oldFiles) {
  fs.unlinkSync(path.join(OUT, f));
  console.log("deleted", f);
}

fs.writeFileSync(BODY, html);
console.log("updated body html");

let css = fs.readFileSync(CSS, "utf8");
const cssBlock = `
/* GBP TM panel photos (#gbp-process) */
#gbp-process .tm-bg{background:none;}
#gbp-process .tm-bg > img{position:absolute; inset:0; width:100%; height:100%; object-fit:cover; display:block;}
#gbp-process .tm-veil{z-index:1;}
`;
if (!css.includes("#gbp-process .tm-bg > img")) {
  const anchor = ".tm-item.on .tm-bg{opacity:1;}";
  const tmBg = css.indexOf(".tm-bg{position:absolute; inset:0; opacity:0;");
  const onBg = css.indexOf(anchor, tmBg);
  if (onBg < 0) throw new Error("CSS on .tm-bg not found near TM");
  css =
    css.slice(0, onBg + anchor.length) +
    cssBlock +
    css.slice(onBg + anchor.length);
  fs.writeFileSync(CSS, css);
  console.log("updated CSS");
} else {
  console.log("CSS already has tm img rules");
}

fs.writeFileSync(
  path.join(ROOT, "scripts", "_gbp-tm-image-map.json"),
  JSON.stringify(results, null, 2) + "\n"
);
console.log("done");
