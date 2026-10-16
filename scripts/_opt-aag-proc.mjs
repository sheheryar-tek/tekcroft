import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";

const BASE =
  "C:/Users/Super/Downloads/ai-agent-development-services-20261016T081828Z-1-001/ai-agent-development-services/Process Section";
const OUT = "c:/Tekcroft/public/images";
const MAX = 80 * 1024;

const MAP = [
  {
    folder: "Discovery & Requirements",
    slug: "aag-proc-discovery",
    file: "1.jpg",
  },
  {
    folder: "Architecture & Data Readiness",
    slug: "aag-proc-architecture",
    file: "1.jpg",
  },
  {
    folder: "Build & Integration",
    slug: "aag-proc-build",
    file: "1.jpg",
  },
  {
    folder: "Evaluation & Guardrails",
    slug: "aag-proc-evaluation",
    file: "1.jpg",
  },
  {
    folder: "Deployment & Support",
    slug: "aag-proc-deployment",
    file: "1.jpg",
  },
];

async function encodeUnder(buf) {
  let lo = 42,
    hi = 86,
    best = null;
  while (lo <= hi) {
    const q = Math.floor((lo + hi) / 2);
    const out = await sharp(buf, { failOn: "none" })
      .rotate()
      .resize({ width: 720, height: 720, fit: "cover", position: "centre" })
      .webp({ quality: q, effort: 6, smartSubsample: true })
      .toBuffer();
    if (out.length <= MAX) {
      best = { buf: out, q, bytes: out.length };
      lo = q + 1;
    } else hi = q - 1;
  }
  if (!best) {
    // fallback: smaller canvas
    const out = await sharp(buf, { failOn: "none" })
      .rotate()
      .resize({ width: 640, height: 640, fit: "cover", position: "centre" })
      .webp({ quality: 48, effort: 6, smartSubsample: true })
      .toBuffer();
    if (out.length > MAX) throw new Error("could not fit under 80KB");
    best = { buf: out, q: 48, bytes: out.length };
  }
  return best;
}

const names = {};
for (const p of MAP) {
  const src = path.join(BASE, p.folder, p.file);
  if (!fs.existsSync(src)) throw new Error("missing " + src);
  const r = await encodeUnder(fs.readFileSync(src));
  const hash = crypto.createHash("sha1").update(r.buf).digest("hex").slice(0, 10);
  const name = `${p.slug}-${hash}.webp`;
  for (const f of fs.readdirSync(OUT)) {
    if (new RegExp(`^${p.slug}-[a-f0-9]+\\.webp$`, "i").test(f) && f !== name) {
      fs.unlinkSync(path.join(OUT, f));
    }
  }
  fs.writeFileSync(path.join(OUT, name), r.buf);
  const meta = await sharp(r.buf).metadata();
  names[p.slug] = { name, bytes: r.bytes, q: r.q, w: meta.width, h: meta.height };
  console.log(
    name,
    (r.bytes / 1024).toFixed(1) + "KB",
    "q" + r.q,
    `${meta.width}x${meta.height}`
  );
}

fs.writeFileSync(
  path.join("c:/Tekcroft/scripts/_aag-proc-images.json"),
  JSON.stringify(names, null, 2)
);
console.log("wrote scripts/_aag-proc-images.json");
