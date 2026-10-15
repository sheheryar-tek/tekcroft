import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "images");
const BODY = path.join(ROOT, "lib", "ai-chatbot-development-body.html");
const LCP = path.join(ROOT, "lib", "ai-chatbot-development-lcp.json");
const MAX = 80 * 1024;
const SRC =
  "C:/Users/Super/.cursor/projects/c-Tekcroft/assets/c__Users_Super_AppData_Roaming_Cursor_User_workspaceStorage_c6f7834920c05ebddafe800bc4c493a3_images_3-a0a39e02-8464-460b-8b5e-0c6ab4a96ade.jpg";

const ALT =
  "AI Chatbot Development Services with conversational AI dashboards and human handoff support";
const TITLE = "AI Chatbot Development Services | TekCroft";

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
    throw new Error(`acb-hero still over 80KB: ${(out.length / 1024).toFixed(1)}KB`);
  }

  const hash = crypto.createHash("sha1").update(out).digest("hex").slice(0, 10);
  const name = `acb-hero-${hash}.webp`;
  for (const f of fs.readdirSync(OUT)) {
    if (/^acb-hero-.*\.webp$/i.test(f) && f !== name) {
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

let body = fs.readFileSync(BODY, "utf8");
const imgTag = `<img src="${r.file}" width="${r.w}" height="${r.h}" alt="${ALT.replace(/"/g, "&quot;")}" title="${TITLE.replace(/"/g, "&quot;")}" decoding="async" fetchpriority="high">`;
const re =
  /(<div class="hs-bg" aria-hidden="true">)[\s\S]*?(<\/div>\s*<div class="hs-veil")/;
if (!re.test(body)) throw new Error("hs-bg block not found");
body = body.replace(re, `$1${imgTag}$2`);
fs.writeFileSync(BODY, body);
console.log("updated body");

fs.writeFileSync(LCP, JSON.stringify({ preload: r.file }, null, 2) + "\n");
console.log("updated lcp");
console.log("done");
