import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";

const BASE =
  "C:/Users/Super/Downloads/navigate-20261016T100457Z-1-001/navigate/SEO";
const OUT = "c:/Tekcroft/public/images";
const MAX = 80 * 1024;

const MAP = [
  {
    folder: "Ecommerce SEO Services",
    slug: "mm-seo-ecommerce",
    key: "seoEcommerce",
    title: "Ecommerce SEO Services",
    alt: "Team reviewing ecommerce SEO analytics and product category rankings on a desktop dashboard",
  },
  {
    folder: "SEO Audit Services",
    slug: "mm-seo-audit",
    key: "seoAudit",
    title: "SEO Audit Services",
    alt: "Specialists reviewing an SEO audit report with crawl and ranking findings on screen",
  },
  {
    folder: "On-Page SEO Services",
    slug: "mm-seo-onpage",
    key: "seoOnpage",
    title: "On-Page SEO Services",
    alt: "Marketer optimizing on-page SEO titles, content structure, and internal links",
  },
  {
    folder: "Technical SEO Services",
    slug: "mm-seo-technical",
    key: "seoTechnical",
    title: "Technical SEO Services",
    alt: "Engineer fixing technical SEO issues for crawling, speed, and indexing",
  },
  {
    folder: "AI SEO Services",
    slug: "mm-seo-ai",
    key: "seoAi",
    title: "AI SEO Services",
    alt: "Team analyzing AI search visibility and citation opportunities for AI SEO",
  },
];

async function encodeUnder(buf) {
  let width = 760;
  let quality = 78;
  let best = null;
  for (;;) {
    const out = await sharp(buf, { failOn: "none" })
      .rotate()
      .resize({
        width,
        height: Math.round((width * 507) / 760),
        fit: "cover",
        position: "centre",
        withoutEnlargement: true,
      })
      .webp({ quality, effort: 6, smartSubsample: true })
      .toBuffer();
    if (out.length <= MAX) {
      best = { buf: out, q: quality, bytes: out.length, w: width };
      if (quality < 86 && width >= 760) {
        quality += 2;
        continue;
      }
      break;
    }
    if (quality > 52) quality -= 6;
    else if (width > 560) {
      width -= 40;
      quality = 72;
    } else if (quality > 40) quality -= 4;
    else break;
  }
  if (!best || best.bytes > MAX) throw new Error("could not fit under 80KB");
  return best;
}

const results = {};
for (const p of MAP) {
  const src = path.join(BASE, p.folder, "1.jpg");
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
  results[p.key] = {
    file: `/images/${name}`,
    title: p.title,
    alt: p.alt,
    w: meta.width,
    h: meta.height,
    kb: +(r.bytes / 1024).toFixed(1),
    q: r.q,
  };
  console.log(name, results[p.key].kb + "KB", `q${r.q}`, `${meta.width}x${meta.height}`);
}

// Parent SEO Services — reuse ecommerce visual as category cover (no parent folder provided)
const parentSrc = path.join(BASE, "Ecommerce SEO Services", "2.jpg");
const parentBuf = fs.existsSync(parentSrc)
  ? fs.readFileSync(parentSrc)
  : fs.readFileSync(path.join(BASE, "Ecommerce SEO Services", "1.jpg"));
const parent = await encodeUnder(parentBuf);
const parentHash = crypto
  .createHash("sha1")
  .update(parent.buf)
  .digest("hex")
  .slice(0, 10);
const parentName = `mm-seo-${parentHash}.webp`;
for (const f of fs.readdirSync(OUT)) {
  if (/^mm-seo-[a-f0-9]+\.webp$/i.test(f) && f !== parentName) {
    fs.unlinkSync(path.join(OUT, f));
  }
}
fs.writeFileSync(path.join(OUT, parentName), parent.buf);
const parentMeta = await sharp(parent.buf).metadata();
results.seo = {
  file: `/images/${parentName}`,
  title: "SEO Services",
  alt: "SEO specialists reviewing search performance dashboards for TekCroft SEO services",
  w: parentMeta.width,
  h: parentMeta.height,
  kb: +(parent.bytes / 1024).toFixed(1),
  q: parent.q,
};
console.log(parentName, results.seo.kb + "KB", `q${parent.q}`);

fs.writeFileSync(
  path.join("c:/Tekcroft/scripts/_mm-seo-images.json"),
  JSON.stringify(results, null, 2)
);
console.log("wrote scripts/_mm-seo-images.json");
