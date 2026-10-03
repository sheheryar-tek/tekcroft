/**
 * Encode on-page SEO FAQ aside image → WebP under 80KB
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "images");
const MAX = 80 * 1024;

const SRC =
  "C:/Users/Super/.cursor/projects/c-Tekcroft/assets/c__Users_Super_AppData_Roaming_Cursor_User_workspaceStorage_c6f7834920c05ebddafe800bc4c493a3_images_20-490b387d-cd10-49e9-8a93-83b6081a1f33.png";

async function encodeUnder(buf, maxBytes) {
  let lo = 48,
    hi = 82,
    best = null;
  for (let i = 0; i < 10; i++) {
    const q = Math.round((lo + hi) / 2);
    const out = await sharp(buf)
      .rotate()
      .resize({
        width: 900,
        height: 1200,
        fit: "cover",
        withoutEnlargement: true,
      })
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

fs.mkdirSync(OUT, { recursive: true });
const buf = fs.readFileSync(SRC);
let out = await encodeUnder(buf, MAX);
if (out.length > MAX) {
  out = await sharp(buf)
    .rotate()
    .resize({ width: 640, height: 860, fit: "cover", withoutEnlargement: true })
    .webp({ quality: 48, effort: 6 })
    .toBuffer();
}
const hash = crypto.createHash("sha1").update(out).digest("hex").slice(0, 10);
const name = `onpage-faq-${hash}.webp`;
const dest = path.join(OUT, name);
fs.writeFileSync(dest, out);
const meta = await sharp(out).metadata();
console.log(
  JSON.stringify(
    {
      file: `/images/${name}`,
      kb: +(out.length / 1024).toFixed(1),
      w: meta.width,
      h: meta.height,
      ok: out.length <= MAX,
    },
    null,
    2
  )
);
