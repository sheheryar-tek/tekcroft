import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC =
  "C:/Users/Super/Downloads/Technical-SEO-20261017T080858Z-1-001/Technical-SEO/Deliverables/Tekcroft-Technical-SEO-18-Deliverables-Option-02-1920x1080.jpg";
const OUT = path.join(ROOT, "public", "images");
const BODY = path.join(ROOT, "lib", "technical-seo-body.html");
const MAX = 80 * 1024;
const ALT = "What You Actually Get From Our Technical SEO Services";

async function toWebp() {
  let best = null;
  for (const [w, h, qStart] of [
    [880, 1100, 78],
    [800, 1000, 72],
    [720, 900, 66],
    [640, 800, 60],
  ]) {
    let lo = 40,
      hi = qStart;
    while (lo <= hi) {
      const q = Math.floor((lo + hi) / 2);
      const buf = await sharp(SRC)
        .rotate()
        .resize({ width: w, height: h, fit: "cover", position: "attention" })
        .webp({ quality: q, effort: 6, smartSubsample: true })
        .toBuffer();
      if (buf.length <= MAX) {
        best = { buf, w, h, q, bytes: buf.length };
        lo = q + 1;
      } else {
        hi = q - 1;
      }
    }
    if (best) break;
  }
  if (!best) throw new Error("could not fit under 80KB");
  return best;
}

const best = await toWebp();
const hash = crypto.createHash("sha256").update(best.buf).digest("hex").slice(0, 10);
const name = `tech-get-deliverables-${hash}.webp`;
fs.writeFileSync(path.join(OUT, name), best.buf);

for (const f of fs.readdirSync(OUT)) {
  if (/^tech-get-deliverables/i.test(f) && f !== name) {
    fs.unlinkSync(path.join(OUT, f));
    console.log("deleted", f);
  }
}

const href = "/images/" + name;
let html = fs.readFileSync(BODY, "utf8");
const re =
  /(<div class="yg-photo">)\s*(?:<picture>[\s\S]*?<\/picture>|<img\b[^>]*>)\s*(<div class="yg-cap">)/;
if (!re.test(html)) throw new Error("yg-photo media not found");

html = html.replace(
  re,
  `$1
        <img src="${href}" width="${best.w}" height="${best.h}" alt="${ALT}" title="${ALT}" decoding="async" loading="lazy">
        $2`
);
fs.writeFileSync(BODY, html);
console.log(name, (best.bytes / 1024).toFixed(1) + "KB", `${best.w}x${best.h}`, "q" + best.q);
console.log("done");
