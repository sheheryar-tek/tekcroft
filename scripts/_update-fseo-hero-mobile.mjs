import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "images");
const MAX = 80 * 1024;
const SRC =
  "C:/Users/Super/.cursor/projects/c-Tekcroft/assets/c__Users_Super_AppData_Roaming_Cursor_User_workspaceStorage_c6f7834920c05ebddafe800bc4c493a3_images_1-9e3c2911-b94e-4e94-b3f8-e38dc627157e.jpg";

const ALT =
  "Multi-Location SEO Services That Drive Rankings and Qualified Leads";

async function encodePortrait() {
  const buf = fs.readFileSync(SRC);
  // Source is already portrait (~571×1024). Keep native width; tune quality only.
  let width = 571;
  let quality = 70;
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
    else break;
  }

  if (out.length > MAX) {
    throw new Error(
      `fseo-hero-m still over 80KB: ${(out.length / 1024).toFixed(1)}KB`
    );
  }

  const hash = crypto.createHash("sha1").update(out).digest("hex").slice(0, 10);
  const name = `fseo-hero-m-${hash}.webp`;
  for (const f of fs.readdirSync(OUT)) {
    if (/^fseo-hero-m-.*\.webp$/i.test(f) && f !== name) {
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

const bodyPath = path.join(ROOT, "lib", "franchise-seo-body.html");
let body = fs.readFileSync(bodyPath, "utf8");

const deskMatch = body.match(
  /<img src="(\/images\/fseo-hero-[^"]+\.webp)" width="(\d+)" height="(\d+)"/
);
if (!deskMatch) throw new Error("desktop fseo-hero img not found");
const desk = {
  file: deskMatch[1],
  w: deskMatch[2],
  h: deskMatch[3],
};

const picture = `<picture>
      <source media="(max-width:960px)" srcset="${mob.file}" type="image/webp" width="${mob.w}" height="${mob.h}">
      <img src="${desk.file}" width="${desk.w}" height="${desk.h}" alt="${ALT}" title="${ALT}" decoding="async" fetchpriority="high">
    </picture>`;

const re =
  /(<div class="hs-bg" aria-hidden="true">)[\s\S]*?(<\/div>\s*<div class="hs-veil")/;
if (!re.test(body)) throw new Error("hs-bg block not found");
body = body.replace(re, `$1\n    ${picture}\n  $2`);
fs.writeFileSync(bodyPath, body);
console.log("updated franchise-seo-body.html");

fs.writeFileSync(
  path.join(ROOT, "lib", "franchise-seo-lcp.json"),
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
console.log("updated franchise-seo-lcp.json");

const mapPath = path.join(ROOT, "scripts", "_fseo-hero-map.json");
let map = {};
if (fs.existsSync(mapPath)) {
  try {
    map = JSON.parse(fs.readFileSync(mapPath, "utf8"));
  } catch {
    map = {};
  }
}
map["fseo-hero-m"] = mob;
fs.writeFileSync(mapPath, JSON.stringify(map, null, 2) + "\n");
console.log("done");
