import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "images");
const MAX = 80 * 1024;
const DESK_SRC =
  "C:/Users/Super/.cursor/projects/c-Tekcroft/assets/c__Users_Super_AppData_Roaming_Cursor_User_workspaceStorage_c6f7834920c05ebddafe800bc4c493a3_images_3-51477ac3-c029-46be-8fab-3dda76c830d9.jpg";
const MOB_SRC =
  "C:/Users/Super/.cursor/projects/c-Tekcroft/assets/c__Users_Super_AppData_Roaming_Cursor_User_workspaceStorage_c6f7834920c05ebddafe800bc4c493a3_images_3-f764a21d-9bb5-4cc7-ad8d-8f9615d55f02.jpg";

const ALT = "Mobile App Development Services | Tekcroft";

async function encode(srcPath, { maxW, coverWH = null }) {
  const buf = fs.readFileSync(srcPath);
  let width = maxW;
  let quality = 82;
  let out;
  let meta;

  for (;;) {
    let img = sharp(buf, { failOn: "none" }).rotate();
    if (coverWH) {
      img = img.resize({
        width: coverWH[0],
        height: coverWH[1],
        fit: "cover",
        position: "centre",
      });
    } else {
      img = img.resize({ width, withoutEnlargement: true });
    }
    out = await img.webp({ quality, effort: 6, smartSubsample: true }).toBuffer();
    meta = await sharp(out).metadata();
    if (out.length <= MAX) break;
    if (quality > 55) quality -= 6;
    else if (!coverWH && width > 720) {
      width -= 80;
      quality = 78;
    } else if (quality > 40) quality -= 5;
    else break;
  }

  if (out.length > MAX) {
    throw new Error(`still over 80KB: ${(out.length / 1024).toFixed(1)}KB`);
  }

  const hash = crypto.createHash("sha1").update(out).digest("hex").slice(0, 10);
  return { out, meta, quality, hash };
}

function writeNamed(prefix, { out, meta, quality, hash }) {
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

// Also remove legacy single mad-hero-* if prefixes differ after rename
const desk = writeNamed("mad-hero", await encode(DESK_SRC, { maxW: 1400 }));
console.log("desk", desk);

const mobMeta = await sharp(MOB_SRC).metadata();
const mobW = Math.min(mobMeta.width || 571, 720);
const mob = writeNamed(
  "mad-hero-m",
  await encode(MOB_SRC, { maxW: mobW })
);
console.log("mob", mob);

// Drop any leftover mad-hero that isn't the new desk/mob pair
for (const f of fs.readdirSync(OUT)) {
  if (!/^mad-hero/i.test(f)) continue;
  if (f === path.basename(desk.file) || f === path.basename(mob.file)) continue;
  fs.unlinkSync(path.join(OUT, f));
  console.log("deleted leftover", f);
}

const bodyPath = path.join(ROOT, "lib", "mobile-app-development-body.html");
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
console.log("updated body");

fs.writeFileSync(
  path.join(ROOT, "lib", "mobile-app-development-lcp.json"),
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
console.log("updated lcp");

fs.writeFileSync(
  path.join(ROOT, "scripts", "_mad-hero-map.json"),
  JSON.stringify({ "mad-hero": desk, "mad-hero-m": mob, alt: ALT }, null, 2) +
    "\n"
);
console.log("done");
