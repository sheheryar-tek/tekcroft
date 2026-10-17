import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "images");
const BODY = path.join(ROOT, "lib", "technical-seo-body.html");
const CSS = path.join(ROOT, "app", "technical-seo.css");
const MAX = 80 * 1024;
const SRC =
  "C:/Users/Super/.cursor/projects/c-Tekcroft/assets/c__Users_Super_AppData_Roaming_Cursor_User_workspaceStorage_c6f7834920c05ebddafe800bc4c493a3_images_Tekcroft-Technical-SEO-02-Warning-Signs-Option-02-1920x1080.jpg_2K_20261008181542-fac778f7-adca-4411-b46f-67557e1b648e.jpg";

const ALT = "Signs Your Website Needs Technical SEO Services";
const TITLE = ALT;

if (!fs.existsSync(SRC)) throw new Error("missing source: " + SRC);

const buf = fs.readFileSync(SRC);
let width = 1000;
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
  if (quality > 52) quality -= 4;
  else if (width > 560) {
    width -= 40;
    quality = 70;
  } else if (quality > 40) quality -= 4;
  else break;
}
if (out.length > MAX) throw new Error("still over 80KB: " + out.length);

const hash = crypto.createHash("sha1").update(out).digest("hex").slice(0, 10);
const name = `tech-signs-${hash}.webp`;
for (const f of fs.readdirSync(OUT)) {
  if (/^tech-signs-[a-f0-9]{10}\.webp$/i.test(f) && f !== name) {
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

const altEsc = ALT.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
const titleEsc = TITLE.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

let body = fs.readFileSync(BODY, "utf8");
const mediaRe =
  /<div class="sg-media rv" style="--d:140ms">\s*<span class="sg-shot"[^>]*>[\s\S]*?<\/span>\s*<\/div>/;
if (!mediaRe.test(body)) throw new Error("sg-media block not found");
body = body.replace(
  mediaRe,
  `<div class="sg-media rv" style="--d:140ms">
        <span class="sg-shot"><img src="${r.file}" width="${r.w}" height="${r.h}" alt="${altEsc}" title="${titleEsc}" decoding="async" loading="lazy"></span>
      </div>`
);
fs.writeFileSync(BODY, body);
console.log("updated body");

let css = fs.readFileSync(CSS, "utf8");
const cssBlock = `#signs .sg-shot{
  position:relative;
  overflow:hidden;
  background:var(--n200);
}
#signs .sg-shot > img{
  position:absolute; inset:0; width:100%; height:100%;
  object-fit:cover; object-position:center 28%; display:block;
}
`;

if (css.includes("#signs .sg-shot{")) {
  css = css.replace(
    /#signs \.sg-shot\{[\s\S]*?\}\n/,
    cssBlock
  );
  // If old rule was only background one-liner, also handle if img rules already exist
  if (!css.includes("#signs .sg-shot > img{")) {
    // already included in cssBlock when replace matched single block
  }
} else {
  css += "\n" + cssBlock;
}

// Clean up duplicate img rule if replace left orphan from prior
if ((css.match(/#signs \.sg-shot > img\{/g) || []).length > 1) {
  let seen = 0;
  css = css.replace(/#signs \.sg-shot > img\{[\s\S]*?\}\n/g, (m) => {
    seen += 1;
    return seen === 1 ? m : "";
  });
}

fs.writeFileSync(CSS, css);
console.log("updated css");
console.log("done");
