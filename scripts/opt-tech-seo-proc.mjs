import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";

const ASSETS =
  "C:/Users/Super/.cursor/projects/c-Tekcroft/assets";
const OUT = "c:/Tekcroft/public/images";
const MAX = 80 * 1024;

const MAP = [
  { id: "713a6c0c", slug: "tech-proc-audit" },
  { id: "1d4ab0d3", slug: "tech-proc-prioritize" },
  { id: "93ff3f6e", slug: "tech-proc-fix" },
  { id: "70390d3e", slug: "tech-proc-monitor" },
];

async function encodeUnder(buf) {
  let lo = 48,
    hi = 88,
    best = null;
  while (lo <= hi) {
    const q = Math.floor((lo + hi) / 2);
    const out = await sharp(buf)
      .resize({ width: 720, height: 720, fit: "cover", position: "centre" })
      .webp({ quality: q, effort: 6, smartSubsample: true })
      .toBuffer();
    if (out.length <= MAX) {
      best = { buf: out, q, bytes: out.length };
      lo = q + 1;
    } else hi = q - 1;
  }
  if (!best) throw new Error("could not fit under 80KB");
  return best;
}

const names = {};
for (const p of MAP) {
  const file = fs.readdirSync(ASSETS).find((f) => f.includes(p.id));
  if (!file) throw new Error("missing " + p.id);
  const r = await encodeUnder(fs.readFileSync(path.join(ASSETS, file)));
  const hash = crypto.createHash("sha1").update(r.buf).digest("hex").slice(0, 10);
  const name = `${p.slug}-${hash}.webp`;
  fs.writeFileSync(path.join(OUT, name), r.buf);
  names[p.slug] = name;
  console.log(name, (r.bytes / 1024).toFixed(1) + "KB q" + r.q);
}
fs.writeFileSync(
  path.join("c:/Tekcroft/scripts/tech-proc-images.json"),
  JSON.stringify(names, null, 2)
);
