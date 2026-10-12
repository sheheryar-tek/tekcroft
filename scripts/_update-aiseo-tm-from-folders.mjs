import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE =
  "C:/Users/Super/Downloads/AI SEO-20261012T093258Z-1-001/AI SEO/Services";
const OUT = path.join(ROOT, "public", "images");
const BODY = path.join(ROOT, "lib", "ai-seo-body.html");
const MAX = 80 * 1024;

const PANELS = [
  {
    i: 0,
    folder: "AI Visibility Audit & Prompt Research",
    file: "2.jpg",
    alt: "AI Visibility Audit & Prompt Research",
  },
  {
    i: 1,
    folder: "Google AI Overviews & AI Mode Optimization",
    file: "3.jpg",
    alt: "Google AI Overviews & AI Mode Optimization",
  },
  {
    i: 2,
    folder: "ChatGPT, Gemini, Perplexity & Claude Optimization",
    file: "2.jpg",
    alt: "ChatGPT, Gemini, Perplexity & Claude Optimization",
  },
  {
    i: 3,
    folder: "Answer Engine Optimization",
    file: "2.jpg",
    alt: "Answer Engine Optimization (AEO) & Voice Search",
  },
  {
    i: 4,
    folder: "AI Content Optimization",
    file: "1.jpg",
    alt: "AI Content Optimization",
  },
  {
    i: 5,
    folder: "Entity, Technical & Brand Accuracy Optimization",
    file: "1.jpg",
    alt: "Entity, Technical & Brand Accuracy Optimization",
  },
  {
    i: 6,
    folder: "Off-Site Authority & Third-Party Mentions",
    file: "1.jpg",
    alt: "Off-Site Authority & Third-Party Mentions",
  },
  {
    i: 7,
    folder: "AI Traffic Conversion & Attribution",
    file: "1.jpg",
    alt: "AI Traffic Conversion & Attribution",
  },
  {
    i: 8,
    folder: "AI-Powered SEO Automation",
    file: "1.jpg",
    alt: "AI-Powered SEO Automation",
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
        .resize({ width: w, height: Math.round((w * 616) / 1024), fit: "cover", position: "centre" })
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
    .filter((n) => /^aiseo-tm-\d{2}-[a-f0-9]+\.webp$/i.test(n))
);

const results = [];
let html = fs.readFileSync(BODY, "utf8");

for (const p of PANELS) {
  const src = path.join(findDesktop(p.folder), p.file);
  if (!fs.existsSync(src)) throw new Error("missing " + src);
  const { buf, w, q, meta, hash } = await toWebp(src);
  const name = `aiseo-tm-${String(p.i + 1).padStart(2, "0")}-${hash}.webp`;
  fs.writeFileSync(path.join(OUT, name), buf);
  const file = `/images/${name}`;
  const altEsc = p.alt.replace(/&/g, "&amp;");
  const re = new RegExp(
    `<span class="tm-bg" aria-hidden="true"><img src="/images/aiseo-tm-${String(p.i + 1).padStart(2, "0")}-[a-f0-9]+\\.webp"[^>]*></span>`
  );
  // replace just the img inside matching tm-bg for this panel index by sequential replace of old map
  const imgRe = new RegExp(
    `src="/images/aiseo-tm-${String(p.i + 1).padStart(2, "0")}-[a-f0-9]+\\.webp" width="\\d+" height="\\d+" alt="[^"]*" title="[^"]*"`
  );
  if (!imgRe.test(html)) throw new Error("html match failed for panel " + (p.i + 1));
  html = html.replace(
    imgRe,
    `src="/images/${name}" width="${meta.width}" height="${meta.height}" alt="${altEsc}" title="${altEsc}"`
  );
  results.push({
    i: p.i,
    file,
    alt: p.alt,
    kb: +(buf.length / 1024).toFixed(1),
    width: meta.width,
    height: meta.height,
    enc: `w${w}q${q}`,
    src: `${p.folder}/Desktop/${p.file}`,
  });
  console.log(`P${p.i + 1}`, name, results.at(-1).kb + "KB", p.src || p.file);
}

fs.writeFileSync(BODY, html);
fs.writeFileSync(
  path.join(ROOT, "scripts", "_aiseo-tm-image-map.json"),
  JSON.stringify(results, null, 2)
);

for (const n of oldFiles) {
  if (!results.some((r) => r.file.endsWith(n))) {
    fs.unlinkSync(path.join(OUT, n));
    console.log("deleted", n);
  }
}

console.log("done");
