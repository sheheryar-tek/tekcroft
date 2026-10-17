import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "images");
const MAX = 80 * 1024;
const ASSETS =
  "C:/Users/Super/.cursor/projects/c-Tekcroft/assets";

const DESK_SRC = path.join(
  ASSETS,
  "c__Users_Super_AppData_Roaming_Cursor_User_workspaceStorage_c6f7834920c05ebddafe800bc4c493a3_images_Tekcroft-On-Page-SEO-01-Hero-Option-01-1920x1080-2e7f68e5-f70e-43ee-b925-9f257452559b.jpg"
);
const MOB_SRC = path.join(
  ASSETS,
  "c__Users_Super_AppData_Roaming_Cursor_User_workspaceStorage_c6f7834920c05ebddafe800bc4c493a3_images_create_this_picture_in_potraite_2K_20261008190841-469f868f-9ec4-45a2-9eea-e828a75be1d5.jpg"
);

const ALT =
  "On-page SEO specialist reviewing service page titles, H1 headings, and search intent during an audit";
const TITLE = "On-Page SEO Services";

if (!fs.existsSync(DESK_SRC)) throw new Error("missing desktop: " + DESK_SRC);
if (!fs.existsSync(MOB_SRC)) throw new Error("missing mobile: " + MOB_SRC);

async function encodeLandscape(srcPath, slug) {
  const buf = fs.readFileSync(srcPath);
  let width = 1600;
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
    else if (width > 900) {
      width -= 80;
      quality = 78;
    } else if (quality > 40) quality -= 5;
    else break;
  }

  if (out.length > MAX) {
    throw new Error(
      `${slug} still over 80KB: ${(out.length / 1024).toFixed(1)}KB`
    );
  }

  const hash = crypto.createHash("sha1").update(out).digest("hex").slice(0, 10);
  const name = `${slug}-${hash}.webp`;
  const re = new RegExp(`^${slug}-[a-f0-9]+\\.webp$`, "i");
  for (const f of fs.readdirSync(OUT)) {
    if (re.test(f) && f !== name) {
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

async function encodePortrait(srcPath, slug) {
  const buf = fs.readFileSync(srcPath);
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
      `${slug} still over 80KB: ${(out.length / 1024).toFixed(1)}KB`
    );
  }

  const hash = crypto.createHash("sha1").update(out).digest("hex").slice(0, 10);
  const name = `${slug}-${hash}.webp`;
  const re = new RegExp(`^${slug}-.*\\.webp$`, "i");
  for (const f of fs.readdirSync(OUT)) {
    if (re.test(f) && f !== name) {
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

const desk = await encodeLandscape(DESK_SRC, "on-page-seo-hero");
const mob = await encodePortrait(MOB_SRC, "on-page-seo-hero-m");
console.log("desk", desk);
console.log("mob", mob);

const altEsc = ALT.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
const titleEsc = TITLE.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

const picture = `<picture>
      <source media="(max-width:960px)" srcset="${mob.file}" type="image/webp" width="${mob.w}" height="${mob.h}">
      <img src="${desk.file}" width="${desk.w}" height="${desk.h}" alt="${altEsc}" title="${titleEsc}" decoding="async" fetchpriority="high">
    </picture>`;

const bodyPath = path.join(ROOT, "lib", "on-page-seo-body.html");
let body = fs.readFileSync(bodyPath, "utf8");
const re =
  /(<div class="hs-bg" aria-hidden="true">)\s*(?:<picture>[\s\S]*?<\/picture>|<img[\s\S]*?>)\s*(<\/div>\s*<div class="hs-veil")/;
if (!re.test(body)) throw new Error("hs-bg block not found");
body = body.replace(re, `$1\n    ${picture}\n  $2`);
fs.writeFileSync(bodyPath, body);
console.log("updated on-page-seo-body.html");

fs.writeFileSync(
  path.join(ROOT, "lib", "on-page-seo-lcp.json"),
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
console.log("updated on-page-seo-lcp.json");
console.log("done");
