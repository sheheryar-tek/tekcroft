import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "images", "seo-services");
const CSS = path.join(ROOT, "app", "seo-services.css");
const SRC =
  "C:/Users/Super/.cursor/projects/c-Tekcroft/assets/c__Users_Super_AppData_Roaming_Cursor_User_workspaceStorage_c6f7834920c05ebddafe800bc4c493a3_images_1-216b32be-1a42-47ee-9b73-9c9c97cf0d71.jpg";
const MAX = 80 * 1024;
const SLUG = "seo-svc-cta-shot";

if (!fs.existsSync(SRC)) throw new Error("missing source: " + SRC);
fs.mkdirSync(OUT, { recursive: true });

const buf = fs.readFileSync(SRC);
let width = 1400;
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
const file = `/images/seo-services/${name}`;
console.log(file, +(out.length / 1024).toFixed(1) + "KB", `${meta.width}x${meta.height}`, "q" + quality);

let css = fs.readFileSync(CSS, "utf8");
const next = css
  .replace(
    /--cta-shot:url\("\/images\/seo-services\/seo-svc-cta-shot-[a-f0-9]+\.webp"\);/g,
    `--cta-shot:url("${file}");`
  );
if (next === css) throw new Error("--cta-shot path not updated");
fs.writeFileSync(CSS, next);
console.log("updated seo-services.css");
console.log("done");
