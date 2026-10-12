import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";

const OUT = "public/images";
const SRC =
  "C:/Users/Super/Downloads/Local SEO-20261012T103632Z-1-001/Local SEO/Behined the picture/4.jpg";
const BODY = "lib/local-seo-body.html";
const MAX = 80 * 1024;

const buf = fs.readFileSync(SRC);
let best = null;
for (const [w, h] of [
  [1600, 900],
  [1400, 788],
  [1200, 675],
  [1100, 619],
  [1000, 562],
]) {
  let lo = 40,
    hi = 78;
  while (lo <= hi) {
    const q = Math.floor((lo + hi) / 2);
    const out = await sharp(buf)
      .rotate()
      .resize({ width: w, height: h, fit: "cover", position: "centre" })
      .webp({ quality: q, effort: 6, smartSubsample: true })
      .toBuffer();
    if (out.length <= MAX) {
      best = { out, w, h, q, kb: +(out.length / 1024).toFixed(1) };
      lo = q + 1;
    } else hi = q - 1;
  }
  if (best && best.kb < 72) break;
}
if (!best) throw new Error("could not fit");

const hash = crypto.createHash("sha1").update(best.out).digest("hex").slice(0, 10);
const name = `localseo-vs-${hash}.webp`;
for (const f of fs.readdirSync(OUT)) {
  if (/^localseo-vs-.*\.webp$/i.test(f) && f !== name) {
    fs.unlinkSync(path.join(OUT, f));
    console.log("deleted", f);
  }
}
fs.writeFileSync(path.join(OUT, name), best.out);
console.log({ file: `/images/${name}`, ...best, out: undefined });

let html = fs.readFileSync(BODY, "utf8");
html = html.replace(
  /src="\/images\/localseo-vs-[a-f0-9]+\.webp" width="\d+" height="\d+"/,
  `src="/images/${name}" width="${best.w}" height="${best.h}"`
);
fs.writeFileSync(BODY, html);
console.log("body ok");
