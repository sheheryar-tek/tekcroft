import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "images");
const BODY = path.join(ROOT, "lib", "local-seo-body.html");
const CSS = path.join(ROOT, "app", "local-seo.css");
const MAX = 80 * 1024;
const SRC =
  "C:/Users/Super/Downloads/Local SEO-20261012T103632Z-1-001/Local SEO/FAQ/Mobile/1.jpg";
const ALT = "Local SEO Services FAQs";

async function encode() {
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
  const hash = crypto.createHash("sha1").update(out).digest("hex").slice(0, 10);
  const name = `localseo-faq-${hash}.webp`;
  for (const f of fs.readdirSync(OUT)) {
    if (/^localseo-faq-.*\.webp$/i.test(f) && f !== name) {
      fs.unlinkSync(path.join(OUT, f));
      console.log("deleted", f);
    }
  }
  fs.writeFileSync(path.join(OUT, name), out);
  return {
    file: `/images/${name}`,
    kb: +(out.length / 1024).toFixed(1),
    q: quality,
    w: meta.width,
    h: meta.height,
  };
}

const r = await encode();
console.log(r);

let html = fs.readFileSync(BODY, "utf8");
const altEsc = ALT.replace(/&/g, "&amp;");
const pics = `        <span class="faq-pics" aria-hidden="true">
          <span class="faq-pic"><img src="${r.file}" width="${r.w}" height="${r.h}" alt="${altEsc}" title="${altEsc}" decoding="async" loading="lazy"></span>
        </span>`;

const re =
  /<span class="faq-pics" aria-hidden="true">[\s\S]*?<\/span>\s*(?=<span class="faq-aside-eyebrow")/;
if (!re.test(html)) throw new Error("faq-pics block not found");
html = html.replace(re, pics + "\n        ");
fs.writeFileSync(BODY, html);
console.log("updated local-seo-body.html");

let css = fs.readFileSync(CSS, "utf8");
const cssBlock = `
/* Single FAQ photo — same overlay strength as other service pages. */
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
  const marker = ".faq-wrap:not([data-at]) .faq-pic:nth-child(1){ opacity:1; }";
  const idx = css.indexOf(marker);
  if (idx < 0) throw new Error("CSS marker not found");
  css =
    css.slice(0, idx + marker.length) +
    cssBlock +
    css.slice(idx + marker.length);
  fs.writeFileSync(CSS, css);
  console.log("updated local-seo.css");
} else {
  console.log("local-seo.css already has faq img rules");
}

fs.writeFileSync(
  path.join(ROOT, "scripts", "_localseo-faq-map.json"),
  JSON.stringify(r, null, 2) + "\n"
);
console.log("done");
