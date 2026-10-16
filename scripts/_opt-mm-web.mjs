import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";

const BASE =
  "C:/Users/Super/Downloads/navigate-20261016T100457Z-1-001/navigate/Web and Software Development";
const OUT = "c:/Tekcroft/public/images";
const MAX = 80 * 1024;

const MAP = [
  {
    folder: "Web Design and Development Services",
    file: "1.jpg",
    slug: "mm-web",
    key: "webDesign",
    title: "Web Design and Development Services",
    alt: "Designers and developers building a conversion-focused website interface",
  },
  {
    folder: "Custom Software Development Services",
    file: "1.jpg",
    slug: "mm-web-software",
    key: "webSoftware",
    title: "Custom Software Development Services",
    alt: "Engineers building custom software platforms and internal business tools",
  },
  {
    folder: "Mobile App Development Services",
    file: "1.jpg",
    slug: "mm-web-mobile",
    key: "webMobile",
    title: "Mobile App Development Services",
    alt: "Mobile app developers shipping iOS and Android from one shared codebase",
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

const parentSrc = path.join(BASE, "Web Design and Development Services", "2.jpg");
const parentBuf = fs.existsSync(parentSrc)
  ? fs.readFileSync(parentSrc)
  : fs.readFileSync(path.join(BASE, "Web Design and Development Services", "1.jpg"));
const parent = await encodeUnder(parentBuf);
const parentHash = crypto
  .createHash("sha1")
  .update(parent.buf)
  .digest("hex")
  .slice(0, 10);
const parentName = `mm-web-cat-${parentHash}.webp`;
for (const f of fs.readdirSync(OUT)) {
  if (/^mm-web-cat-[a-f0-9]+\.webp$/i.test(f) && f !== parentName) {
    fs.unlinkSync(path.join(OUT, f));
  }
}
fs.writeFileSync(path.join(OUT, parentName), parent.buf);
const parentMeta = await sharp(parent.buf).metadata();
results.web = {
  file: `/images/${parentName}`,
  title: "Web and Software Development",
  alt: "Web and software team collaborating on product and application development",
  w: parentMeta.width,
  h: parentMeta.height,
  kb: +(parent.bytes / 1024).toFixed(1),
  q: parent.q,
};
console.log(parentName, results.web.kb + "KB", `q${parent.q}`);

fs.writeFileSync(
  path.join("c:/Tekcroft/scripts/_mm-web-images.json"),
  JSON.stringify(results, null, 2)
);
console.log("wrote scripts/_mm-web-images.json");
