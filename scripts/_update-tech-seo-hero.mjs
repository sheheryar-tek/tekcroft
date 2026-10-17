import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "images");
const MAX = 80 * 1024;

const DESK_SRC =
  "C:/Users/Super/.cursor/projects/c-Tekcroft/assets/c__Users_Super_AppData_Roaming_Cursor_User_workspaceStorage_c6f7834920c05ebddafe800bc4c493a3_images_Tekcroft-Technical-SEO-01-Hero-Option-01-1920x1080-5e7c2f25-72e6-484c-a77a-acac71f3ccde.jpg";
const MOB_SRC =
  "C:/Users/Super/.cursor/projects/c-Tekcroft/assets/c__Users_Super_AppData_Roaming_Cursor_User_workspaceStorage_c6f7834920c05ebddafe800bc4c493a3_images_create_this_pciture_in_potraite_2K_20261008191411-7ac3b6ce-6117-4756-8a14-12fc330c5d23.jpg";

const ALT =
  "Technical SEO specialist reviewing crawl diagnostics, indexing gaps, and a prioritized fix plan";
const TITLE = "Technical SEO Services";

for (const [label, src] of [
  ["desktop", DESK_SRC],
  ["mobile", MOB_SRC],
]) {
  if (!fs.existsSync(src)) throw new Error(`missing ${label} source: ${src}`);
}

async function encode(src, { maxW, prefix, qualityStart = 82 }) {
  const buf = fs.readFileSync(src);
  const meta0 = await sharp(buf, { failOn: "none" }).metadata();
  let width = Math.min(meta0.width || maxW, maxW);
  let quality = qualityStart;
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
    if (quality > 48) quality -= 4;
    else if (width > 480) {
      width -= 40;
      quality = Math.max(quality, 62);
    } else if (quality > 40) quality -= 4;
    else break;
  }

  if (out.length > MAX) {
    throw new Error(
      `${prefix} still over 80KB: ${(out.length / 1024).toFixed(1)}KB`
    );
  }

  const hash = crypto.createHash("sha1").update(out).digest("hex").slice(0, 10);
  const name = `${prefix}-${hash}.webp`;
  // Exact prefix + hash only (so tech-seo-hero does not delete tech-seo-hero-m)
  const re = new RegExp(
    `^${prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}-[a-f0-9]{10}\\.webp$`,
    "i"
  );
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

const desk = await encode(DESK_SRC, {
  maxW: 1600,
  prefix: "tech-seo-hero",
  qualityStart: 82,
});
console.log("desk", desk);

const mob = await encode(MOB_SRC, {
  maxW: 720,
  prefix: "tech-seo-hero-m",
  qualityStart: 72,
});
console.log("mob", mob);

const altEsc = ALT.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
const titleEsc = TITLE.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

const picture = `<picture>
      <source media="(max-width:960px)" srcset="${mob.file}" type="image/webp" width="${mob.w}" height="${mob.h}">
      <img src="${desk.file}" width="${desk.w}" height="${desk.h}" alt="${altEsc}" title="${titleEsc}" decoding="async" fetchpriority="high">
    </picture>`;

const bodyPath = path.join(ROOT, "lib", "technical-seo-body.html");
let body = fs.readFileSync(bodyPath, "utf8");
const re =
  /(<div class="hs-bg" aria-hidden="true">)\s*(?:<picture>[\s\S]*?<\/picture>|<img[\s\S]*?>)\s*(<\/div>\s*<div class="hs-veil")/;
if (!re.test(body)) throw new Error("hs-bg block not found");
body = body.replace(re, `$1\n    ${picture}\n  $2`);
fs.writeFileSync(bodyPath, body);
console.log("updated technical-seo-body.html");

fs.writeFileSync(
  path.join(ROOT, "lib", "technical-seo-lcp.json"),
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
console.log("updated technical-seo-lcp.json");
console.log("done");
