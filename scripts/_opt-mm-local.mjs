import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";

const BASE =
  "C:/Users/Super/Downloads/navigate-20261016T100457Z-1-001/navigate/Local SEO";
const OUT = "c:/Tekcroft/public/images";
const MAX = 80 * 1024;

const MAP = [
  {
    folder: "Local SEO Services",
    file: "1.jpg",
    slug: "mm-local",
    key: "localSeo",
    title: "Local SEO Services",
    alt: "Local SEO team planning map-based rankings and service-area visibility",
  },
  {
    folder: "Google Business Profile Optimization Services",
    file: "1.jpg",
    slug: "mm-local-gbp",
    key: "localGbp",
    title: "Google Business Profile Optimization Services",
    alt: "Specialist optimizing a Google Business Profile listing for calls and visits",
  },
  {
    folder: "Franchise SEO Services",
    file: "1.jpg",
    slug: "mm-local-franchise",
    key: "localFranchise",
    title: "Franchise SEO Services",
    alt: "Franchise SEO planners aligning multi-location search strategy across sites",
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

// Parent Local SEO cover — second Local SEO Services shot when available
const parentSrc = path.join(BASE, "Local SEO Services", "2.jpg");
const parentBuf = fs.existsSync(parentSrc)
  ? fs.readFileSync(parentSrc)
  : fs.readFileSync(path.join(BASE, "Local SEO Services", "1.jpg"));
const parent = await encodeUnder(parentBuf);
const parentHash = crypto
  .createHash("sha1")
  .update(parent.buf)
  .digest("hex")
  .slice(0, 10);
const parentName = `mm-local-cat-${parentHash}.webp`;
for (const f of fs.readdirSync(OUT)) {
  if (/^mm-local-cat-[a-f0-9]+\.webp$/i.test(f) && f !== parentName) {
    fs.unlinkSync(path.join(OUT, f));
  }
}
fs.writeFileSync(path.join(OUT, parentName), parent.buf);
const parentMeta = await sharp(parent.buf).metadata();
results.local = {
  file: `/images/${parentName}`,
  title: "Local SEO",
  alt: "Local SEO specialists mapping neighborhood rankings and location strategy",
  w: parentMeta.width,
  h: parentMeta.height,
  kb: +(parent.bytes / 1024).toFixed(1),
  q: parent.q,
};
console.log(parentName, results.local.kb + "KB", `q${parent.q}`);

fs.writeFileSync(
  path.join("c:/Tekcroft/scripts/_mm-local-images.json"),
  JSON.stringify(results, null, 2)
);
console.log("wrote scripts/_mm-local-images.json");
