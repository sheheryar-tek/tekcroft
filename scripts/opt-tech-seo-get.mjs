import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";

const SRC_HTML =
  "C:/Users/Super/Downloads/Technical SEO Deliverables Section (3).html";
const OUT_DIR = "c:/Tekcroft/public/images";
const MAX = 80 * 1024;

const html = fs.readFileSync(SRC_HTML, "utf8");
const m = html.match(/src="(data:image\/jpeg;base64,[^"]+)"/);
if (!m) throw new Error("no data uri");
const buf = Buffer.from(m[1].replace(/^data:image\/jpeg;base64,/, ""), "base64");

async function encodeUnder(input) {
  let lo = 48,
    hi = 88,
    best = null;
  while (lo <= hi) {
    const q = Math.floor((lo + hi) / 2);
    const out = await sharp(input)
      .resize({ width: 880, height: 1100, fit: "cover", position: "attention" })
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

const r = await encodeUnder(buf);
const hash = crypto.createHash("sha1").update(r.buf).digest("hex").slice(0, 10);
const name = `tech-get-deliverables-${hash}.webp`;
fs.writeFileSync(path.join(OUT_DIR, name), r.buf);
console.log(name, (r.bytes / 1024).toFixed(1) + "KB q" + r.q);
fs.writeFileSync(
  "c:/Tekcroft/scripts/tech-get-deliverables.json",
  JSON.stringify({ file: name, w: 880, h: 1100 }, null, 2)
);
