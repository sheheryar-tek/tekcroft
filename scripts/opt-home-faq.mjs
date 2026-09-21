/**
 * Encode homepage FAQ aside images (<100KB WebP).
 * One related shot per question; unused uploads stay out of public/.
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const ASSETS =
  "C:/Users/Super/.cursor/projects/c-Tekcroft/assets";
const OUT = "c:/Tekcroft/public/images";

/** Source token → FAQ index (related to that question) */
const MAP = {
  // 01 What does a digital marketing company do? — SEO listings / visibility work
  "home-faq-1.webp": "c5ac49d1",
  // 02 How much does it cost? — scope & timeline planning
  "home-faq-2.webp": "687944a0",
  // 03 How do I choose the right company? — review real team work
  "home-faq-3.webp": "c379fd14",
  // 04 Agency vs freelancer? — full Design / Develop / Launch team
  "home-faq-4.webp": "2bd278ea",
  // 05 How long for results? — growth chart / Strategy · Content · Growth
  "home-faq-5.webp": "37fa605d",
  // 06 Small businesses or larger? — local storefront / Riverside Coffee
  "home-faq-6.webp": "75ff6b81",
  // 07 Multiple channels together? — multi-platform social / channels
  "home-faq-7.webp": "2a0c4508",
};

function srcFor(token) {
  const hit = fs.readdirSync(ASSETS).find((f) => f.includes(token));
  if (!hit) throw new Error("missing asset " + token);
  return path.join(ASSETS, hit);
}

async function encodeUnder(buf, maxBytes) {
  let lo = 48,
    hi = 82,
    best = null;
  for (let i = 0; i < 10; i++) {
    const q = Math.round((lo + hi) / 2);
    const out = await sharp(buf)
      .rotate()
      .resize({ width: 900, height: 1200, fit: "cover", withoutEnlargement: true })
      .webp({ quality: q, effort: 6 })
      .toBuffer();
    if (out.length <= maxBytes) {
      best = out;
      lo = q + 1;
    } else {
      hi = q - 1;
    }
  }
  if (best) return best;
  return sharp(buf)
    .rotate()
    .resize({ width: 720, height: 960, fit: "cover", withoutEnlargement: true })
    .webp({ quality: 55, effort: 6 })
    .toBuffer();
}

const max = 100 * 1024;
for (const [name, token] of Object.entries(MAP)) {
  const src = srcFor(token);
  const buf = fs.readFileSync(src);
  let out = await encodeUnder(buf, max);
  if (out.length > max) {
    out = await sharp(buf)
      .rotate()
      .resize({ width: 640, height: 860, fit: "cover", withoutEnlargement: true })
      .webp({ quality: 48, effort: 6 })
      .toBuffer();
  }
  const dest = path.join(OUT, name);
  fs.writeFileSync(dest, out);
  console.log(
    name,
    (out.length / 1024).toFixed(1) + "KB",
    out.length <= max ? "OK" : "OVER",
    "←",
    path.basename(src).slice(-40)
  );
}
