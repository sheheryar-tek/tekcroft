import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "images");
const BODY = path.join(ROOT, "lib", "artificial-intelligence-services-body.html");
const CSS_FILES = [
  path.join(ROOT, "app", "artificial-intelligence-services.css"),
  path.join(ROOT, "app", "artificial-intelligence-services-unlock.css"),
];
const SRC =
  "C:/Users/Super/.cursor/projects/c-Tekcroft/assets/c__Users_Super_AppData_Roaming_Cursor_User_workspaceStorage_c6f7834920c05ebddafe800bc4c493a3_images_11-2e158b7d-1dba-4ba1-bbb9-dc7194da2805.jpg";
const MAX = 80 * 1024;
const SLUG = "ais-faq";
const ALT =
  "Thoughtful woman surrounded by question marks, representing common AI services questions";
const TITLE = "AI Services FAQs — answers to the questions clients ask most";

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
const file = `/images/${name}`;
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

const cssBlock = `
/* Single FAQ aside photo (AI Services) */
:root{ --faq-shot:url("${file}"); }
#faq .faq-aside::before{ content:none; }
#faq .faq-pic{position:absolute; inset:0; background:none; opacity:1;}
#faq .faq-pic > img{position:absolute; inset:0; width:100%; height:100%;
  object-fit:cover; object-position:center top; display:block;}
html[data-design="raw"] #faq .faq-pic{position:absolute !important; inset:0 !important; background:none !important; opacity:1 !important;}
html[data-design="raw"] #faq .faq-pic > img{position:absolute !important; inset:0 !important; width:100% !important; height:100% !important;
  object-fit:cover !important; object-position:center top !important; display:block !important;}
`;

for (const CSS of CSS_FILES) {
  let css = fs.readFileSync(CSS, "utf8");
  if (css.includes("#faq .faq-pic > img")) {
    css = css.replace(
      /:root\{\s*--faq-shot:url\("\/images\/ais-faq-[a-f0-9]+\.webp"\);\s*\}/,
      `:root{ --faq-shot:url("${file}"); }`
    );
    fs.writeFileSync(CSS, css);
    console.log(path.basename(CSS), "refreshed --faq-shot");
    continue;
  }
  const marker = "/* === faq-pics === */";
  const idx = css.indexOf(marker);
  if (idx >= 0) {
    css = css.slice(0, idx) + cssBlock + "\n" + css.slice(idx);
  } else {
    css = css.trimEnd() + "\n" + cssBlock + "\n";
  }
  fs.writeFileSync(CSS, css);
  console.log("updated", path.basename(CSS));
}

fs.writeFileSync(
  path.join(ROOT, "scripts", "_ais-faq-map.json"),
  JSON.stringify(
    {
      file,
      alt: ALT,
      title: TITLE,
      kb: +(out.length / 1024).toFixed(1),
      w: meta.width,
      h: meta.height,
      q: quality,
    },
    null,
    2
  ) + "\n"
);
console.log("done");
