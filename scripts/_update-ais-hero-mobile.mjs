import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "images");
const BODY = path.join(ROOT, "lib", "artificial-intelligence-services-body.html");
const LCP = path.join(ROOT, "lib", "artificial-intelligence-services-lcp.json");
const MAX = 80 * 1024;
const SLUG = "ais-img1-m";
const SRC =
  "C:/Users/Super/.cursor/projects/c-Tekcroft/assets/c__Users_Super_AppData_Roaming_Cursor_User_workspaceStorage_c6f7834920c05ebddafe800bc4c493a3_images_3-fc432eab-4461-4907-92f8-3e8627ae7013.jpg";

const ALT =
  "AI development team reviewing a machine-learning workflow and analytics dashboard on a large monitor in a modern office";
const TITLE =
  "AI Development Services: Build, Integrate, and Scale With Confidence";

if (!fs.existsSync(SRC)) throw new Error("missing source: " + SRC);

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
const mob = {
  file: `/images/${name}`,
  kb: +(out.length / 1024).toFixed(1),
  w: meta.width,
  h: meta.height,
  q: quality,
};
console.log("mob", mob);

const deskMatch = fs
  .readFileSync(BODY, "utf8")
  .match(/src="(\/images\/ais-img1-[a-f0-9]+\.webp)"[^>]*width="(\d+)"[^>]*height="(\d+)"/);
if (!deskMatch) throw new Error("desktop hero img not found");
const desk = { file: deskMatch[1], w: +deskMatch[2], h: +deskMatch[3] };

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

const picture = `<picture>
      <source media="(max-width:960px)" srcset="${mob.file}" type="image/webp" width="${mob.w}" height="${mob.h}">
      <img src="${desk.file}" width="${desk.w}" height="${desk.h}" alt="${esc(ALT)}" title="${esc(TITLE)}" decoding="async" fetchpriority="high">
    </picture>`;

let html = fs.readFileSync(BODY, "utf8");
const re =
  /<div class="hs-bg"[^>]*>\s*(?:<picture>[\s\S]*?<\/picture>|<img[^>]*>)\s*<\/div>/;
if (!re.test(html)) throw new Error("hs-bg block not found");
html = html.replace(re, `<div class="hs-bg">${picture}</div>`);
fs.writeFileSync(BODY, html);
console.log("updated body");

fs.writeFileSync(
  LCP,
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
console.log("done");
