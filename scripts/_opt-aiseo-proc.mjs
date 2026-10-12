import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";

const ASSETS =
  "C:/Users/Super/.cursor/projects/c-Tekcroft/assets";
const OUT = "c:/Tekcroft/public/images";
const MAX = 80 * 1024;

const MAP = [
  {
    id: "images_3-4beed736",
    slug: "aiseo-proc-discovery",
    label: "Prompt Discovery & AI Visibility Baseline",
  },
  {
    id: "images_24-f0899bf6",
    slug: "aiseo-proc-influence",
    label: "Source Influence Mapping",
  },
  {
    id: "images_10-462f93fc",
    slug: "aiseo-proc-citation",
    label: "On-Site Citation Optimization",
  },
  {
    id: "images_21-9d933831",
    slug: "aiseo-proc-outreach",
    label: "Third-Party Source Outreach",
  },
  {
    id: "images_4-a76a0fb1",
    slug: "aiseo-proc-tracking",
    label: "Recommendation Tracking & Iteration",
  },
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
  if (!best) {
    // fallback: smaller resize
    for (const w of [640, 560, 480]) {
      for (let q = 70; q >= 40; q -= 4) {
        const out = await sharp(buf)
          .resize({ width: w, height: w, fit: "cover", position: "centre" })
          .webp({ quality: q, effort: 6, smartSubsample: true })
          .toBuffer();
        if (out.length <= MAX) {
          return { buf: out, q, bytes: out.length, w };
        }
      }
    }
    throw new Error("could not fit under 80KB");
  }
  return best;
}

const results = [];
for (const p of MAP) {
  const file = fs.readdirSync(ASSETS).find((f) => f.includes(p.id));
  if (!file) throw new Error("missing " + p.id);
  const r = await encodeUnder(fs.readFileSync(path.join(ASSETS, file)));
  const hash = crypto.createHash("sha1").update(r.buf).digest("hex").slice(0, 10);
  const name = `${p.slug}-${hash}.webp`;
  fs.writeFileSync(path.join(OUT, name), r.buf);
  results.push({
    ...p,
    file: `/images/${name}`,
    kb: +(r.bytes / 1024).toFixed(1),
    q: r.q,
    w: r.w || 720,
  });
  console.log(name, (r.bytes / 1024).toFixed(1) + "KB q" + r.q + (r.w ? " w" + r.w : ""));
}
fs.writeFileSync(
  path.join("c:/Tekcroft/scripts/_aiseo-proc-map.json"),
  JSON.stringify(results, null, 2)
);
console.log("wrote scripts/_aiseo-proc-map.json");
