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
const SLUG = "ais-img1";
const SRC =
  "C:/Users/Super/.cursor/projects/c-Tekcroft/assets/c__Users_Super_AppData_Roaming_Cursor_User_workspaceStorage_c6f7834920c05ebddafe800bc4c493a3_images_1-d4206bf2-404e-427a-9b48-e655381f133c.jpg";

const ALT =
  "AI development team reviewing a machine-learning workflow and analytics dashboard on a large monitor in a modern office";
const TITLE =
  "AI Development Services: Build, Integrate, and Scale With Confidence";

if (!fs.existsSync(SRC)) throw new Error("missing source: " + SRC);

const buf = fs.readFileSync(SRC);
let width = 1600;
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
  if (quality > 55) quality -= 6;
  else if (width > 900) {
    width -= 80;
    quality = 74;
  } else if (quality > 40) quality -= 5;
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
const imgRe =
  /<div class="hs-bg"[^>]*>\s*<img[^>]*>\s*<\/div>/;
if (!imgRe.test(html)) throw new Error("hs-bg img not found");

html = html.replace(
  imgRe,
  `<div class="hs-bg"><img src="${file}" width="${meta.width}" height="${meta.height}" alt="${esc(ALT)}" title="${esc(TITLE)}" decoding="async" fetchpriority="high"></div>`
);
fs.writeFileSync(BODY, html);
console.log("updated body");

fs.writeFileSync(LCP, JSON.stringify({ preload: file }, null, 2) + "\n");
console.log("updated lcp json");
console.log("done");
