import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "images");
const BODY = path.join(ROOT, "lib", "ecommerce-seo-body.html");
const SRC =
  "C:/Users/Super/.cursor/projects/c-Tekcroft/assets/c__Users_Super_AppData_Roaming_Cursor_User_workspaceStorage_c6f7834920c05ebddafe800bc4c493a3_images_create_this_picture_in_color_2K_20261008184644-fad7c615-be67-4e2d-9d5a-4ae8651e723a.jpg";
const MAX = 80 * 1024;
const ALT = "What Clients Usually Ask Us About Ecommerce SEO";

if (!fs.existsSync(SRC)) throw new Error("missing source: " + SRC);

const buf = fs.readFileSync(SRC);
let width = 720;
let quality = 78;
let out;
let meta;

for (;;) {
  out = await sharp(buf, { failOn: "none" })
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality, effort: 6, smartSubsample: true })
    .toBuffer();
  meta = await sharp(out).metadata();
  if (out.length <= MAX) break;
  if (quality > 55) quality -= 4;
  else if (width > 480) {
    width -= 40;
    quality = 72;
  } else if (quality > 40) quality -= 4;
  else break;
}
if (out.length > MAX) throw new Error("still over 80KB");

const hash = crypto.createHash("sha1").update(out).digest("hex").slice(0, 10);
const name = `ecom-faq-${hash}.webp`;
for (const f of fs.readdirSync(OUT)) {
  if (/^ecom-faq-.*\.webp$/i.test(f) && f !== name) {
    fs.unlinkSync(path.join(OUT, f));
    console.log("deleted", f);
  }
}
fs.writeFileSync(path.join(OUT, name), out);
const r = {
  file: `/images/${name}`,
  kb: +(out.length / 1024).toFixed(1),
  q: quality,
  w: meta.width,
  h: meta.height,
};
console.log(r);

let html = fs.readFileSync(BODY, "utf8");
const faqPics = `        <span class="faq-pics" aria-hidden="true">
          <span class="faq-pic"><img src="${r.file}" width="${r.w}" height="${r.h}" alt="${ALT}" title="${ALT}" decoding="async" loading="lazy"></span>
        </span>`;
if (
  !/<span class="faq-pics" aria-hidden="true">[\s\S]*?<\/span>\s*(?=<span class="faq-aside-eyebrow")/.test(
    html
  )
) {
  throw new Error("faq-pics block not found");
}
html = html.replace(
  /<span class="faq-pics" aria-hidden="true">[\s\S]*?<\/span>\s*(?=<span class="faq-aside-eyebrow")/,
  faqPics + "\n        "
);
fs.writeFileSync(BODY, html);
console.log("updated ecommerce-seo-body.html");
console.log("done");
