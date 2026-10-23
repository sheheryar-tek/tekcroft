import fs from "fs";
import path from "path";
import sharp from "sharp";

const base =
  "C:/Users/Super/Downloads/First Sketch to Long‑Term Support-20261023T101530Z-1-001/First Sketch to Long‑Term Support";
const outDir = path.join(process.cwd(), "public", "images", "mobile-app");

/** One image per tab — matched to step content */
const picks = [
  { src: path.join(base, "1", "2.jpg"), out: "journey-00.webp", label: "design/wireframes" },
  { src: path.join(base, "2", "2.jpg"), out: "journey-02.webp", label: "native/cross-platform build" },
  { src: path.join(base, "3", "1.jpg"), out: "journey-03.webp", label: "backend/APIs/payments" },
  { src: path.join(base, "4", "2.jpg"), out: "journey-04.webp", label: "testing/launch" },
  { src: path.join(base, "5", "2.jpg"), out: "journey-05.webp", label: "monitoring/support" },
];

async function toWebpUnder80k(src, dest) {
  let quality = 72;
  let width = 900;
  let buf;
  for (let i = 0; i < 14; i++) {
    buf = await sharp(src)
      .rotate()
      .resize({ width, height: width, fit: "cover", position: "centre" })
      .webp({ quality, effort: 6 })
      .toBuffer();
    if (buf.length <= 80 * 1024) break;
    if (quality > 42) quality -= 6;
    else width = Math.max(560, Math.round(width * 0.9));
  }
  fs.writeFileSync(dest, buf);
  return { bytes: buf.length, quality, width };
}

for (const p of picks) {
  if (!fs.existsSync(p.src)) throw new Error("missing " + p.src);
  const dest = path.join(outDir, p.out);
  const r = await toWebpUnder80k(p.src, dest);
  console.log(
    `${p.out} ← ${p.label}: ${(r.bytes / 1024).toFixed(1)}KB q=${r.quality} w=${r.width}`
  );
}
