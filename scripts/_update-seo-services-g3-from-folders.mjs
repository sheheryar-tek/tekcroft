import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE =
  "C:/Users/Super/Downloads/seo-services-20261019T072642Z-1-001/seo-services/SEO Built Around Your Business Goals";
const OUT = path.join(ROOT, "public", "images", "seo-services");
const BODY = path.join(ROOT, "lib", "seo-services-body.html");
const MAX = 80 * 1024;

// Tab order matches g3-list data-k and stacked g3-pic imgs
const TABS = [
  {
    slug: "seo-svc-img3",
    folder: "More qualified traffic",
    file: "2.jpg",
    className: "on",
    alt: "SEO specialist reviewing search results, target audience segments, and a conversion funnel to attract more qualified traffic",
    title: "More qualified traffic — reach people searching for what you sell",
  },
  {
    slug: "seo-svc-img4",
    folder: "More leads and sales",
    file: "1.jpg",
    className: "",
    alt: "Business owner managing inbound enquiries and lead messages on a laptop CRM dashboard in a modern office",
    title: "More leads and sales — turn organic visibility into enquiries and orders",
  },
  {
    slug: "seo-svc-img5",
    folder: "A stronger search presence",
    file: "2.jpg",
    className: "",
    alt: "SEO specialist reviewing AI response cards and source previews to strengthen search presence across traditional and AI search",
    title: "A stronger search presence — visibility in traditional and AI search",
  },
];

function escAttr(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
}

async function encodeUnder(srcPath) {
  // Portrait crop matches .g3-pic aspect-ratio ~4/4.4
  let best = null;
  for (const w of [960, 880, 800, 720, 640]) {
    const h = Math.round((w * 4.4) / 4);
    let lo = 42,
      hi = 82;
    while (lo <= hi) {
      const q = Math.floor((lo + hi) / 2);
      const buf = await sharp(srcPath)
        .rotate()
        .resize({ width: w, height: h, fit: "cover", position: "centre" })
        .webp({ quality: q, effort: 6, smartSubsample: true })
        .toBuffer();
      if (buf.length <= MAX) {
        best = { buf, w, h, q, bytes: buf.length };
        lo = q + 1;
      } else hi = q - 1;
    }
    if (best && best.bytes < 70 * 1024) break;
  }
  if (!best) throw new Error("could not fit " + srcPath);
  const meta = await sharp(best.buf).metadata();
  return { ...best, meta };
}

fs.mkdirSync(OUT, { recursive: true });

const old = new Set(
  fs
    .readdirSync(OUT)
    .filter((n) => /^seo-svc-img[345]-[a-f0-9]+\.webp$/i.test(n))
);

const imgs = [];
for (const t of TABS) {
  const src = path.join(BASE, t.folder, t.file);
  if (!fs.existsSync(src)) throw new Error("missing " + src);
  const r = await encodeUnder(src);
  const hash = crypto.createHash("sha1").update(r.buf).digest("hex").slice(0, 10);
  const name = `${t.slug}-${hash}.webp`;
  fs.writeFileSync(path.join(OUT, name), r.buf);
  old.delete(name);

  const cls = t.className ? ` class="${t.className}"` : ` class=""`;
  imgs.push(
    `<img${cls} src="/images/seo-services/${name}" width="${r.meta.width}" height="${r.meta.height}" alt="${escAttr(t.alt)}" title="${escAttr(t.title)}" decoding="async" loading="lazy">`
  );
  console.log(
    t.slug,
    name,
    +(r.bytes / 1024).toFixed(1) + "KB",
    `${t.folder}/${t.file}`,
    `w${r.w}q${r.q}`
  );
}

for (const f of old) {
  fs.unlinkSync(path.join(OUT, f));
  console.log("deleted", f);
}

let html = fs.readFileSync(BODY, "utf8");
const re =
  /<figure class="g3-pic rv">[\s\S]*?<\/figure>/;
if (!re.test(html)) throw new Error("g3-pic figure not found");
html = html.replace(
  re,
  `<figure class="g3-pic rv">${imgs.join("")}</figure>`
);
fs.writeFileSync(BODY, html);
console.log("updated seo-services-body.html");
console.log("done");
