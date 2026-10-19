import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "images", "seo-services");
const BODY = path.join(ROOT, "lib", "seo-services-body.html");
const CSS = path.join(ROOT, "app", "seo-services.css");
const SRC =
  "C:/Users/Super/.cursor/projects/c-Tekcroft/assets/c__Users_Super_AppData_Roaming_Cursor_User_workspaceStorage_c6f7834920c05ebddafe800bc4c493a3_images_6-1591a9ec-adc3-4cd8-8610-be3c9f22b3c4.jpg";
const MAX = 80 * 1024;
const SLUG = "seo-svc-faq-shot";
const ALT =
  "Woman thinking with chalk question marks overhead, representing common SEO questions clients ask";
const TITLE = "SEO FAQs — answers to the questions clients ask most";

if (!fs.existsSync(SRC)) throw new Error("missing source: " + SRC);
fs.mkdirSync(OUT, { recursive: true });

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
if (out.length > MAX) {
  throw new Error("still over 80KB: " + (out.length / 1024).toFixed(1) + "KB");
}

const hash = crypto.createHash("sha1").update(out).digest("hex").slice(0, 10);
const name = `${SLUG}-${hash}.webp`;
const reOld = new RegExp(`^${SLUG}-[a-f0-9]+\\.webp$`, "i");
for (const f of fs.readdirSync(OUT)) {
  if (reOld.test(f) && f !== name) {
    fs.unlinkSync(path.join(OUT, f));
    console.log("deleted", f);
  }
}
fs.writeFileSync(path.join(OUT, name), out);
const file = `/images/seo-services/${name}`;
console.log(file, +(out.length / 1024).toFixed(1) + "KB", `${meta.width}x${meta.height}`, "q" + quality);

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

let html = fs.readFileSync(BODY, "utf8");
const faqPics = `        <span class="faq-pics" aria-hidden="true">
          <span class="faq-pic"><img src="${file}" width="${meta.width}" height="${meta.height}" alt="${esc(ALT)}" title="${esc(TITLE)}" decoding="async" loading="lazy"></span>
        </span>`;
const faqRe =
  /<span class="faq-pics" aria-hidden="true">[\s\S]*?<\/span>\s*(?=<button class="btn btn-primary")/;
if (!faqRe.test(html)) throw new Error("faq-pics block not found");
html = html.replace(faqRe, faqPics + "\n        ");
fs.writeFileSync(BODY, html);
console.log("updated body");

let css = fs.readFileSync(CSS, "utf8");
css = css.replace(
  /#seo-services-page\{\s*--faq-shot:url\("\/images\/seo-services\/seo-svc-faq-shot-[a-f0-9]+\.webp"\);\s*\}/,
  `#seo-services-page{ --faq-shot:url("${file}"); }`
);

const imgRules = `
/* Single FAQ aside photo */
#seo-services-page .faq-aside::before{ content:none; }
#seo-services-page #faq .faq-pic{position:absolute; inset:0; background:none; opacity:1;}
#seo-services-page #faq .faq-pic > img{position:absolute; inset:0; width:100%; height:100%;
  object-fit:cover; object-position:center top; display:block;}
`;

if (!css.includes("#seo-services-page #faq .faq-pic > img")) {
  const marker = "#seo-services-page{ --faq-shot:url(";
  const idx = css.indexOf(marker);
  if (idx < 0) throw new Error("--faq-shot block not found for insert");
  const end = css.indexOf("}", idx);
  css = css.slice(0, end + 1) + "\n" + imgRules + css.slice(end + 1);
  console.log("added FAQ img CSS rules");
} else {
  console.log("FAQ img CSS rules already present");
}

fs.writeFileSync(CSS, css);
console.log("updated CSS");
console.log("done");
