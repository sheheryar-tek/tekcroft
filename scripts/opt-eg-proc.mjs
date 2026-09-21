import fs from "fs";
import path from "path";
import sharp from "sharp";

const ASSETS =
  "C:/Users/Super/.cursor/projects/c-Tekcroft/assets";
const OUT = "c:/Tekcroft/public/images";

const MAP = [
  // 01 Audit & Research
  { id: "8fc55516", out: "eg-proc-1.webp" },
  // 02 Strategy & Roadmap
  { id: "64777a12", out: "eg-proc-2.webp" },
  // 03 Launch & Build
  { id: "faf4c5fd", out: "eg-proc-3.webp" },
  // 04 Measure & Refine
  { id: "b0f6e7f5", out: "eg-proc-4.webp" },
];

async function encodeUnder(buf, maxBytes) {
  let lo = 60,
    hi = 92,
    best = null;
  while (lo <= hi) {
    const q = Math.floor((lo + hi) / 2);
    const out = await sharp(buf)
      .resize({ width: 720, height: 720, fit: "cover", position: "centre" })
      .webp({ quality: q, effort: 6, smartSubsample: true })
      .toBuffer();
    if (out.length <= maxBytes) {
      best = { buf: out, q, bytes: out.length };
      lo = q + 1;
    } else hi = q - 1;
  }
  if (!best) throw new Error("fit fail");
  return best;
}

const MAX = 100 * 1024;
for (const p of MAP) {
  const file = fs.readdirSync(ASSETS).find((f) => f.includes(p.id));
  if (!file) throw new Error("missing " + p.id);
  const r = await encodeUnder(fs.readFileSync(path.join(ASSETS, file)), MAX);
  fs.writeFileSync(path.join(OUT, p.out), r.buf);
  console.log(p.out, (r.bytes / 1024).toFixed(1) + "KB q" + r.q);
}
