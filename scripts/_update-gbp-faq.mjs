import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "images");
const BODY = path.join(
  ROOT,
  "lib",
  "google-business-profile-optimization-body.html"
);
const CSS = path.join(ROOT, "app", "google-business-profile-optimization.css");
const SRC =
  "C:/Users/Super/.cursor/projects/c-Tekcroft/assets/c__Users_Super_AppData_Roaming_Cursor_User_workspaceStorage_c6f7834920c05ebddafe800bc4c493a3_images_1-9b57483a-681c-4bb4-8000-70bda5217945.jpg";
const MAX = 80 * 1024;
const ALT = "Google Business Profile Optimization FAQs";

const buf = fs.readFileSync(SRC);
let width = 900;
let quality = 82;
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
  if (quality > 55) quality -= 6;
  else if (width > 560) {
    width -= 60;
    quality = 78;
  } else if (quality > 40) quality -= 5;
  else break;
}
if (out.length > MAX) throw new Error("still over 80KB");

const hash = crypto.createHash("sha1").update(out).digest("hex").slice(0, 10);
const name = `gbp-faq-${hash}.webp`;
for (const f of fs.readdirSync(OUT)) {
  if (/^gbp-faq-.*\.webp$/i.test(f) && f !== name) {
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
html = html.replace(
  /<span class="faq-pics" aria-hidden="true">[\s\S]*?<\/span>\s*(?=<span class="faq-aside-eyebrow")/,
  faqPics + "\n        "
);
fs.writeFileSync(BODY, html);
console.log("updated body");

let css = fs.readFileSync(CSS, "utf8");
const cssBlock = `
/* Single FAQ aside photo */
:root{ --faq-shot:url("${r.file}"); }
#faq .faq-pic{position:absolute; inset:0; background:none; opacity:1;}
#faq .faq-pic > img{position:absolute; inset:0; width:100%; height:100%;
  object-fit:cover; object-position:center; display:block;}
#faq .faq-aside::after{
  background:
    radial-gradient(780px 440px at 50% 48%, rgba(0,0,0,.45) 0%, transparent 72%),
    linear-gradient(180deg, rgba(0,0,0,.42) 0%, rgba(0,0,0,.52) 42%,
                    rgba(0,0,0,.92) 100%);}
`;
if (!css.includes("#faq .faq-pic > img")) {
  css = cssBlock + "\n" + css;
  fs.writeFileSync(CSS, css);
  console.log("updated CSS");
} else {
  // refresh --faq-shot path if block already exists
  css = css.replace(
    /:root\{\s*--faq-shot:url\("\/images\/gbp-faq-[a-f0-9]+\.webp"\);\s*\}/,
    `:root{ --faq-shot:url("${r.file}"); }`
  );
  fs.writeFileSync(CSS, css);
  console.log("CSS already had faq img rules; refreshed path");
}

fs.writeFileSync(
  path.join(ROOT, "scripts", "_gbp-faq-map.json"),
  JSON.stringify(r, null, 2) + "\n"
);
console.log("done");
