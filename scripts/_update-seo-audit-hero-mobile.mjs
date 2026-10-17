import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "images");
const MAX = 80 * 1024;
const SRC =
  "C:/Users/Super/.cursor/projects/c-Tekcroft/assets/c__Users_Super_AppData_Roaming_Cursor_User_workspaceStorage_c6f7834920c05ebddafe800bc4c493a3_images_create_this_picture_in_size_2K_20261008185234-d5603390-305a-4c06-9433-1e277c73c520.jpg";

if (!fs.existsSync(SRC)) throw new Error("missing source: " + SRC);

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
      `seo-audit-hero-m still over 80KB: ${(out.length / 1024).toFixed(1)}KB`
    );
  }

  const hash = crypto.createHash("sha1").update(out).digest("hex").slice(0, 10);
  const name = `seo-audit-hero-m-${hash}.webp`;
  for (const f of fs.readdirSync(OUT)) {
    if (/^seo-audit-hero-m-.*\.webp$/i.test(f) && f !== name) {
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

const bodyPath = path.join(ROOT, "lib", "seo-audit-services-body.html");
let body = fs.readFileSync(bodyPath, "utf8");

const deskMatch = body.match(
  /<img src="(\/images\/seo-audit-hero-[^"]+\.webp)" width="(\d+)" height="(\d+)"[^>]*>/
);
if (!deskMatch) throw new Error("desktop seo-audit-hero img not found");

const altMatch = deskMatch[0].match(/alt="([^"]*)"/);
const titleMatch = deskMatch[0].match(/title="([^"]*)"/);
const ALT =
  (altMatch && altMatch[1]) ||
  "The SEO Audit Services That Tell You What To Fix First";
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
  /(<div class="hs-bg" aria-hidden="true">)\s*(?:<picture>[\s\S]*?<\/picture>|<img[\s\S]*?>)\s*(<\/div>\s*<div class="hs-veil")/;
if (!re.test(body)) throw new Error("hs-bg block not found");
body = body.replace(re, `$1\n    ${picture}\n  $2`);
fs.writeFileSync(bodyPath, body);
console.log("updated seo-audit-services-body.html");

fs.writeFileSync(
  path.join(ROOT, "lib", "seo-audit-services-lcp.json"),
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
console.log("updated seo-audit-services-lcp.json");
console.log("done");
