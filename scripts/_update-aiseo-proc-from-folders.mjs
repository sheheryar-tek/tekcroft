import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE =
  "C:/Users/Super/Downloads/AI SEO-20261012T093258Z-1-001/AI SEO/Process Section";
const OUT = path.join(ROOT, "public", "images");
const BODY = path.join(ROOT, "lib", "ai-seo-body.html");
const MAX = 80 * 1024;

const STEPS = [
  {
    slug: "aiseo-proc-discovery",
    folder: "Prompt Discovery & AI Visibility Baseline",
    file: "1.jpg",
    label: "Prompt Discovery & AI Visibility Baseline",
  },
  {
    slug: "aiseo-proc-influence",
    folder: "Source Influence Mapping",
    file: "1.jpg",
    label: "Source Influence Mapping",
  },
  {
    slug: "aiseo-proc-citation",
    folder: "On-Site Citation Optimization",
    file: "2.jpg",
    label: "On-Site Citation Optimization",
  },
  {
    slug: "aiseo-proc-outreach",
    folder: "Third-Party Source Outreach",
    file: "1.jpg",
    label: "Third-Party Source Outreach",
  },
  {
    slug: "aiseo-proc-tracking",
    folder: "Recommendation Tracking & Iteration",
    file: "1.jpg",
    label: "Recommendation Tracking & Iteration",
  },
];

async function encodeUnder(srcPath) {
  let best = null;
  for (const size of [720, 640, 560, 480]) {
    let lo = 48,
      hi = 88;
    while (lo <= hi) {
      const q = Math.floor((lo + hi) / 2);
      const out = await sharp(srcPath)
        .rotate()
        .resize({ width: size, height: size, fit: "cover", position: "centre" })
        .webp({ quality: q, effort: 6, smartSubsample: true })
        .toBuffer();
      if (out.length <= MAX) {
        best = { buf: out, q, size, bytes: out.length };
        lo = q + 1;
      } else hi = q - 1;
    }
    if (best && best.bytes < 70 * 1024) break;
  }
  if (!best) throw new Error("could not fit " + srcPath);
  return best;
}

const old = new Set(
  fs.readdirSync(OUT).filter((n) => /^aiseo-proc-[a-z]+-[a-f0-9]+\.webp$/i.test(n))
);

let html = fs.readFileSync(BODY, "utf8");
const results = [];

for (const s of STEPS) {
  const src = path.join(BASE, s.folder, s.file);
  if (!fs.existsSync(src)) throw new Error("missing " + src);
  const r = await encodeUnder(src);
  const hash = crypto.createHash("sha1").update(r.buf).digest("hex").slice(0, 10);
  const name = `${s.slug}-${hash}.webp`;
  fs.writeFileSync(path.join(OUT, name), r.buf);
  const altEsc = s.label.replace(/&/g, "&amp;");
  const re = new RegExp(
    `src="/images/${s.slug}-[a-f0-9]+\\.webp" width="\\d+" height="\\d+" alt="[^"]*" title="[^"]*"`
  );
  if (!re.test(html)) throw new Error("html match failed for " + s.slug);
  html = html.replace(
    re,
    `src="/images/${name}" width="${r.size}" height="${r.size}" alt="${altEsc}" title="${altEsc}"`
  );
  results.push({
    slug: s.slug,
    file: `/images/${name}`,
    label: s.label,
    kb: +(r.bytes / 1024).toFixed(1),
    q: r.q,
    w: r.size,
    src: `${s.folder}/${s.file}`,
  });
  console.log(name, results.at(-1).kb + "KB", s.file);
}

fs.writeFileSync(BODY, html);
fs.writeFileSync(
  path.join(ROOT, "scripts", "_aiseo-proc-map.json"),
  JSON.stringify(results, null, 2)
);

for (const n of old) {
  if (!results.some((r) => r.file.endsWith("/" + n))) {
    fs.unlinkSync(path.join(OUT, n));
    console.log("deleted", n);
  }
}
console.log("done");
