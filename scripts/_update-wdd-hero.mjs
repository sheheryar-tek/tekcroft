import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "images");
const MAX = 80 * 1024;
const SRC =
  "C:/Users/Super/.cursor/projects/c-Tekcroft/assets/c__Users_Super_AppData_Roaming_Cursor_User_workspaceStorage_c6f7834920c05ebddafe800bc4c493a3_images_1-3d171fca-d06d-4ad5-816d-90b29fc07033.jpg";

const ALT =
  "Web Design and Development Services That Drive Leads and Revenue";

async function encode() {
  const buf = fs.readFileSync(SRC);
  let width = 1400;
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
    throw new Error(`wdd-hero still over 80KB: ${(out.length / 1024).toFixed(1)}KB`);
  }

  const hash = crypto.createHash("sha1").update(out).digest("hex").slice(0, 10);
  const name = `wdd-hero-${hash}.webp`;
  for (const f of fs.readdirSync(OUT)) {
    if (/^wdd-hero-.*\.webp$/i.test(f) && f !== name) {
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

const bodyPath = path.join(ROOT, "lib", "web-design-and-development-body.html");
let body = fs.readFileSync(bodyPath, "utf8");

const imgTag = `<img src="${r.file}" width="${r.w}" height="${r.h}" alt="${ALT}" title="${ALT}" decoding="async" fetchpriority="high">`;

const re =
  /(<div class="hs-bg" aria-hidden="true">)[\s\S]*?(<\/div>\s*<div class="hs-veil")/;
if (!re.test(body)) throw new Error("hs-bg block not found");
body = body.replace(re, `$1${imgTag}$2`);
fs.writeFileSync(bodyPath, body);
console.log("updated web-design-and-development-body.html");

fs.writeFileSync(
  path.join(ROOT, "lib", "web-design-and-development-lcp.json"),
  JSON.stringify({ preload: r.file }, null, 2) + "\n"
);
console.log("updated web-design-and-development-lcp.json");

fs.writeFileSync(
  path.join(ROOT, "scripts", "_wdd-hero-map.json"),
  JSON.stringify({ "wdd-hero": r }, null, 2) + "\n"
);
console.log("done");
