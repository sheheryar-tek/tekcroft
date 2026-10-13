import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "images");
const MAX = 80 * 1024;

const SRC =
  "C:/Users/Super/.cursor/projects/c-Tekcroft/assets/c__Users_Super_AppData_Roaming_Cursor_User_workspaceStorage_c6f7834920c05ebddafe800bc4c493a3_images_4-e5cf639b-f8ca-45e2-a675-c0c8c8b9819b.jpg";

const ALT =
  "Get Found More Easily on Google Maps and Local Search Results";

async function encodeLandscape(src, prefix, startW) {
  const buf = fs.readFileSync(src);
  let width = startW;
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
    else if (width > 720) {
      width -= 80;
      quality = 78;
    } else if (quality > 40) quality -= 5;
    else break;
  }

  if (out.length > MAX) {
    throw new Error(`${prefix} still over 80KB: ${(out.length / 1024).toFixed(1)}KB`);
  }

  const hash = crypto.createHash("sha1").update(out).digest("hex").slice(0, 10);
  const name = `${prefix}-${hash}.webp`;
  for (const f of fs.readdirSync(OUT)) {
    if (new RegExp(`^${prefix}-.*\\.webp$`, "i").test(f) && f !== name) {
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

async function encodePortraitCrop(src, prefix) {
  const buf = fs.readFileSync(src);
  let quality = 82;
  let out;
  let meta;
  const w = 900;
  const h = 1200;

  for (;;) {
    out = await sharp(buf, { failOn: "none" })
      .rotate()
      .resize({ width: w, height: h, fit: "cover", position: "centre" })
      .webp({ quality, effort: 6, smartSubsample: true })
      .toBuffer();
    meta = await sharp(out).metadata();
    if (out.length <= MAX) break;
    if (quality > 40) quality -= 6;
    else break;
  }

  if (out.length > MAX) {
    throw new Error(`${prefix} still over 80KB: ${(out.length / 1024).toFixed(1)}KB`);
  }

  const hash = crypto.createHash("sha1").update(out).digest("hex").slice(0, 10);
  const name = `${prefix}-${hash}.webp`;
  for (const f of fs.readdirSync(OUT)) {
    if (new RegExp(`^${prefix}-.*\\.webp$`, "i").test(f) && f !== name) {
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

const desk = await encodeLandscape(SRC, "gbp-hero", 1024);
const mob = await encodePortraitCrop(SRC, "gbp-hero-m");
console.log("desk", desk);
console.log("mob", mob);

const bodyPath = path.join(
  ROOT,
  "lib",
  "google-business-profile-optimization-body.html"
);
let body = fs.readFileSync(bodyPath, "utf8");

const picture = `<picture>
      <source media="(max-width:960px)" srcset="${mob.file}" type="image/webp" width="${mob.w}" height="${mob.h}">
      <img src="${desk.file}" width="${desk.w}" height="${desk.h}" alt="${ALT}" title="${ALT}" decoding="async" fetchpriority="high">
    </picture>`;

const re =
  /(<div class="hs-bg" aria-hidden="true">)[\s\S]*?(<\/div>\s*<div class="hs-veil")/;
if (!re.test(body)) throw new Error("hs-bg block not found");
body = body.replace(re, `$1\n    ${picture}\n  $2`);
fs.writeFileSync(bodyPath, body);
console.log("updated body html");

fs.writeFileSync(
  path.join(ROOT, "lib", "google-business-profile-optimization-lcp.json"),
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
console.log("updated lcp json");

fs.writeFileSync(
  path.join(ROOT, "scripts", "_gbp-hero-map.json"),
  JSON.stringify({ "gbp-hero": desk, "gbp-hero-m": mob }, null, 2) + "\n"
);
console.log("done");
