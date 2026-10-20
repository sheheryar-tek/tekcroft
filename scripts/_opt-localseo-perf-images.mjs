/**
 * Re-encode local-seo LCP/hero + TM WebPs smaller (design/framing unchanged).
 * Targets PSI "Improve image delivery" without visual redesign.
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIR = path.join(ROOT, "public", "images");
const BODY = path.join(ROOT, "lib", "local-seo-body.html");
const LCP = path.join(ROOT, "lib", "local-seo-lcp.json");

const TARGETS = [
  { name: "localseo-hero-m-737baaa4d6.webp", maxW: 720, maxBytes: 48 * 1024 },
  { name: "localseo-hero-e58f55594e.webp", maxW: 1100, maxBytes: 52 * 1024 },
  { name: "localseo-tm-02-0d89b2092c.webp", maxW: 1000, maxBytes: 42 * 1024 },
  { name: "localseo-tm-03-0666aff927.webp", maxW: 1000, maxBytes: 42 * 1024 },
  { name: "localseo-tm-04-db57674d38.webp", maxW: 900, maxBytes: 40 * 1024 },
  { name: "localseo-tm-05-ca61b129dc.webp", maxW: 1000, maxBytes: 42 * 1024 },
  { name: "localseo-tm-01-5ee32d3de1.webp", maxW: 1000, maxBytes: 42 * 1024 },
  { name: "localseo-tm-06-7a6cfafc87.webp", maxW: 1000, maxBytes: 42 * 1024 },
];

async function encode(buf, maxW, maxBytes) {
  let best = null;
  const widths = [maxW, maxW - 80, maxW - 160, 800, 720].filter(
    (w, i, a) => w >= 640 && a.indexOf(w) === i
  );
  for (const width of widths) {
    for (let q = 74; q >= 52; q -= 2) {
      const out = await sharp(buf, { failOn: "none" })
        .rotate()
        .resize({ width, withoutEnlargement: true, fit: "inside" })
        .webp({ quality: q, effort: 6, smartSubsample: true })
        .toBuffer();
      if (!best || out.length < best.bytes) best = { out, q, width, bytes: out.length };
      if (out.length <= maxBytes) return best;
    }
  }
  return best;
}

let html = fs.readFileSync(BODY, "utf8");
let lcp = JSON.parse(fs.readFileSync(LCP, "utf8"));

for (const t of TARGETS) {
  const src = path.join(DIR, t.name);
  if (!fs.existsSync(src)) {
    console.warn("missing", t.name);
    continue;
  }
  const buf = fs.readFileSync(src);
  const before = buf.length;
  const best = await encode(buf, t.maxW, t.maxBytes);
  if (!best) throw new Error("encode failed " + t.name);
  // Keep same filename (hashed names already in HTML) — overwrite in place
  fs.writeFileSync(src, best.out);
  const meta = await sharp(best.out).metadata();
  console.log(
    `${t.name}: ${(before / 1024).toFixed(1)} → ${(best.bytes / 1024).toFixed(1)} KB ` +
      `@w${best.width} q${best.q} (${meta.width}x${meta.height})`
  );
}

console.log("done (paths unchanged)");
