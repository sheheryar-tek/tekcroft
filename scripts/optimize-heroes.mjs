/**
 * Re-encode hero WebPs smaller while keeping visual quality / aspect ratio.
 * Targets substantially under prior ~88–100KB sizes without changing pixels' framing.
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.join(ROOT, "public", "images");
const MAX = 72 * 1024;

async function opt(name, maxW) {
  const src = path.join(dir, name);
  if (!fs.existsSync(src)) {
    console.warn("skip missing", name);
    return;
  }
  const buf = fs.readFileSync(src);
  const meta = await sharp(buf).metadata();
  let best = null;

  for (const width of [maxW, maxW - 100, maxW - 200, 1100, 1000].filter(
    (w, i, a) => w >= 900 && a.indexOf(w) === i
  )) {
    for (let q = 76; q >= 58; q -= 2) {
      const out = await sharp(buf)
        .rotate()
        .resize({
          width,
          withoutEnlargement: true,
          fit: "inside",
        })
        .webp({ quality: q, effort: 6, smartSubsample: true })
        .toBuffer();
      if (out.length <= MAX) {
        best = { out, q, width, bytes: out.length };
        break;
      }
      if (!best || out.length < best.bytes) {
        best = { out, q, width, bytes: out.length };
      }
    }
    if (best && best.bytes <= MAX) break;
  }

  if (!best) throw new Error("failed " + name);
  fs.writeFileSync(src, best.out);
  const outMeta = await sharp(best.out).metadata();
  console.log(
    `${name}: ${(buf.length / 1024).toFixed(1)} → ${(best.bytes / 1024).toFixed(1)} KB ` +
      `@w${best.width} q${best.q} (${meta.width}x${meta.height} → ${outMeta.width}x${outMeta.height})`
  );
}

await opt("home-hero-1.webp", 1400);
await opt("home-hero-2.webp", 1200);
await opt("home-hero-3.webp", 1200);
await opt("home-hero-4.webp", 1200);
console.log("done");
