import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "images");
const MAX = 80 * 1024;
const SRC =
  "C:/Users/Super/.cursor/projects/c-Tekcroft/assets/c__Users_Super_AppData_Roaming_Cursor_User_workspaceStorage_c6f7834920c05ebddafe800bc4c493a3_images_4-aea5ebfe-aa7c-454a-bf26-f0afacf0f044.jpg";

const ALT =
  "Best Local SEO Services That Turn Search Traffic Into Real Customers";
const DESKTOP = "/images/localseo-hero-e58f55594e.webp";

async function encode() {
  const buf = fs.readFileSync(SRC);
  let width = 571;
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
    else if (width > 400) {
      width -= 40;
      quality = 78;
    } else if (quality > 40) quality -= 5;
    else break;
  }

  const hash = crypto.createHash("sha1").update(out).digest("hex").slice(0, 10);
  const name = `localseo-hero-m-${hash}.webp`;
  for (const f of fs.readdirSync(OUT)) {
    if (/^localseo-hero-m-.*\.webp$/i.test(f) && f !== name) {
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

const bodyPath = path.join(ROOT, "lib", "local-seo-body.html");
let body = fs.readFileSync(bodyPath, "utf8");

const picture = `<picture>
      <source media="(max-width:960px)" srcset="${r.file}" type="image/webp" width="${r.w}" height="${r.h}">
      <img src="${DESKTOP}" width="1024" height="571" alt="${ALT}" title="${ALT}" decoding="async" fetchpriority="high">
    </picture>`;

const re =
  /(<div class="hs-bg" aria-hidden="true">)[\s\S]*?(<\/div>\s*<div class="hs-veil")/;
if (!re.test(body)) throw new Error("hs-bg block not found");
body = body.replace(re, `$1\n    ${picture}\n  $2`);
fs.writeFileSync(bodyPath, body);
console.log("updated local-seo-body.html");

fs.writeFileSync(
  path.join(ROOT, "lib", "local-seo-lcp.json"),
  JSON.stringify(
    {
      preload: DESKTOP,
      preloadMobile: r.file,
      mobileMedia: "(max-width:960px)",
      desktopMedia: "(min-width:961px)",
    },
    null,
    2
  ) + "\n"
);
console.log("updated local-seo-lcp.json");
