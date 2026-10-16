import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "images");
const MAX = 80 * 1024;
const SRC =
  "C:/Users/Super/.cursor/projects/c-Tekcroft/assets/c__Users_Super_AppData_Roaming_Cursor_User_workspaceStorage_c6f7834920c05ebddafe800bc4c493a3_images_3-fb1d9895-4443-44a1-9d4e-94557d149e0d.jpg";

async function encodePortrait() {
  const buf = fs.readFileSync(SRC);
  const meta0 = await sharp(buf, { failOn: "none" }).metadata();
  let width = Math.min(meta0.width || 720, 720);
  let quality = 72;
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
    if (quality > 42) quality -= 2;
    else if (width > 480) {
      width -= 40;
      quality = 68;
    } else break;
  }

  if (out.length > MAX) {
    throw new Error(
      `ecom-seo-hero-m still over 80KB: ${(out.length / 1024).toFixed(1)}KB`
    );
  }

  const hash = crypto.createHash("sha1").update(out).digest("hex").slice(0, 10);
  const name = `ecom-seo-hero-m-${hash}.webp`;
  for (const f of fs.readdirSync(OUT)) {
    if (/^ecom-seo-hero-m-.*\.webp$/i.test(f) && f !== name) {
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

const mob = await encodePortrait();
console.log("mob", mob);

const bodyPath = path.join(ROOT, "lib", "ecommerce-seo-body.html");
let body = fs.readFileSync(bodyPath, "utf8");

const deskMatch = body.match(
  /<img src="(\/images\/ecom-seo-hero-[^"]+\.webp)" width="(\d+)" height="(\d+)"[^>]*>/
);
if (!deskMatch) throw new Error("desktop ecom-seo-hero img not found");

const altMatch = deskMatch[0].match(/alt="([^"]*)"/);
const titleMatch = deskMatch[0].match(/title="([^"]*)"/);
const ALT = (altMatch && altMatch[1]) || "Ecommerce SEO Services To Maximize Sales";
const TITLE = (titleMatch && titleMatch[1]) || ALT;

const desk = {
  file: deskMatch[1],
  w: deskMatch[2],
  h: deskMatch[3],
};

const picture = `<picture>
      <source media="(max-width:960px)" srcset="${mob.file}" type="image/webp" width="${mob.w}" height="${mob.h}">
      <img src="${desk.file}" width="${desk.w}" height="${desk.h}" alt="${ALT}" title="${TITLE}" decoding="async" fetchpriority="high">
    </picture>`;

const re =
  /(<div class="hs-bg" aria-hidden="true">)[\s\S]*?(<\/div>\s*<div class="hs-veil")/;
if (!re.test(body)) throw new Error("hs-bg block not found");
body = body.replace(re, `$1\n    ${picture}\n  $2`);
fs.writeFileSync(bodyPath, body);
console.log("updated ecommerce-seo-body.html");

fs.writeFileSync(
  path.join(ROOT, "lib", "ecommerce-seo-lcp.json"),
  JSON.stringify(
    {
      preload: desk.file,
      preloadMobile: mob.file,
      mobileMedia: "(max-width:960px)",
      desktopMedia: "(min-width:961px)",
    },
    null,
    2
  ) + "\n"
);
console.log("updated ecommerce-seo-lcp.json");
console.log("done");
