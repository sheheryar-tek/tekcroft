import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";

const BASE =
  "C:/Users/Super/Downloads/navigate-20261016T100457Z-1-001/navigate/Al Development and Automation";
const OUT = "c:/Tekcroft/public/images";
const MAX = 80 * 1024;

const MAP = [
  {
    folder: "Al Development Services",
    file: "1.jpg",
    slug: "mm-ai-dev",
    key: "aiDev",
    title: "AI Development Services",
    alt: "Engineers wiring AI models into a production software stack",
  },
  {
    folder: "Al Chatbot Development Services",
    file: "1.jpg",
    slug: "mm-ai-chatbot",
    key: "aiChatbot",
    title: "AI Chatbot Development Services",
    alt: "Team building an AI chatbot that answers customers around the clock",
  },
  {
    folder: "Al Agent Development Services",
    file: "1.jpg",
    slug: "mm-ai-agent",
    key: "aiAgent",
    title: "AI Agent Development Services",
    alt: "Specialists designing AI agents that run multi-step work end to end",
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

const parentSrc = path.join(BASE, "Al Development Services", "2.jpg");
const parentBuf = fs.existsSync(parentSrc)
  ? fs.readFileSync(parentSrc)
  : fs.readFileSync(path.join(BASE, "Al Development Services", "1.jpg"));
const parent = await encodeUnder(parentBuf);
const parentHash = crypto
  .createHash("sha1")
  .update(parent.buf)
  .digest("hex")
  .slice(0, 10);
const parentName = `mm-ai-cat-${parentHash}.webp`;
for (const f of fs.readdirSync(OUT)) {
  if (/^mm-ai-cat-[a-f0-9]+\.webp$/i.test(f) && f !== parentName) {
    fs.unlinkSync(path.join(OUT, f));
  }
}
fs.writeFileSync(path.join(OUT, parentName), parent.buf);
const parentMeta = await sharp(parent.buf).metadata();
results.ai = {
  file: `/images/${parentName}`,
  title: "Artificial Intelligence Services",
  alt: "AI team collaborating on intelligent products and automation systems",
  w: parentMeta.width,
  h: parentMeta.height,
  kb: +(parent.bytes / 1024).toFixed(1),
  q: parent.q,
};
console.log(parentName, results.ai.kb + "KB", `q${parent.q}`);

fs.writeFileSync(
  path.join("c:/Tekcroft/scripts/_mm-ai-images.json"),
  JSON.stringify(results, null, 2)
);
console.log("wrote scripts/_mm-ai-images.json");
