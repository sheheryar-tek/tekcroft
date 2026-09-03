/**
 * Re-encode hero WebPs smaller while keeping visual quality.
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.join(ROOT, "public", "images");

async function opt(name, width, quality) {
  const src = path.join(dir, name);
  const buf = fs.readFileSync(src);
  const out = await sharp(buf)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality, effort: 6, smartSubsample: true })
    .toBuffer();
  fs.writeFileSync(src, out);
  console.log(
    `${name}: ${(buf.length / 1024).toFixed(1)} → ${(out.length / 1024).toFixed(1)} KB @w${width} q${quality}`
  );
}

await opt("hero-1.webp", 960, 72);
await opt("hero-2.webp", 800, 70);
