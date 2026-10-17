import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "images");
const CSS = path.join(ROOT, "app", "on-page-seo.css");
const SRC =
  "C:/Users/Super/.cursor/projects/c-Tekcroft/assets/c__Users_Super_AppData_Roaming_Cursor_User_workspaceStorage_c6f7834920c05ebddafe800bc4c493a3_images_create_this_picture_in_color_2K_20261008190831-f6bd678e-e3c8-4ba6-8efd-2a8a0e40591d.jpg";
const MAX = 80 * 1024;

if (!fs.existsSync(SRC)) throw new Error("missing " + SRC);

const buf = fs.readFileSync(SRC);
let best = null;

for (const w of [1600, 1400, 1280, 1200, 1100, 1024, 960, 880]) {
  let lo = 40,
    hi = 78;
  while (lo <= hi) {
    const q = Math.floor((lo + hi) / 2);
    const out = await sharp(buf, { failOn: "none" })
      .rotate()
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: q, effort: 6, smartSubsample: true })
      .toBuffer();
    if (out.length <= MAX) {
      best = { buf: out, w, q, bytes: out.length };
      lo = q + 1;
    } else hi = q - 1;
  }
  if (best && best.bytes < 72 * 1024) break;
}
if (!best) throw new Error("could not fit under 80KB");

const meta = await sharp(best.buf).metadata();
const hash = crypto.createHash("sha1").update(best.buf).digest("hex").slice(0, 10);
const name = `onpage-fit-${hash}.webp`;

for (const f of fs.readdirSync(OUT)) {
  if (/^onpage-fit-[a-f0-9]+\.webp$/i.test(f) && f !== name) {
    fs.unlinkSync(path.join(OUT, f));
    console.log("deleted", f);
  }
}
fs.writeFileSync(path.join(OUT, name), best.buf);
const url = `/images/${name}`;
console.log({
  file: url,
  kb: +(best.bytes / 1024).toFixed(1),
  w: meta.width,
  h: meta.height,
  q: best.q,
});

let css = fs.readFileSync(CSS, "utf8");

const re =
  /#fit\{\s*--ground:var\(--bg-alt\);\s*--panel:var\(--surface\);\s*--vs-veil:rgba\(0,0,0,\.78\);(?:\s*--shot-3:url\("[^"]+"\);)?\s*\}/;

const next = `#fit{ --ground:var(--bg-alt); --panel:var(--surface);
  --vs-veil:rgba(0,0,0,.78);
  --shot-3:url("${url}"); }`;

if (re.test(css)) {
  css = css.replace(re, next);
  console.log("updated #fit token block");
} else if (/--shot-3:url\("\/images\/onpage-fit-[a-f0-9]+\.webp"\)/.test(css)) {
  css = css.replace(
    /--shot-3:url\("\/images\/onpage-fit-[a-f0-9]+\.webp"\)/,
    `--shot-3:url("${url}")`
  );
  console.log("replaced existing onpage-fit shot");
} else {
  const marker = "#fit{ --ground:var(--bg-alt); --panel:var(--surface);";
  const idx = css.indexOf(marker);
  if (idx < 0) throw new Error("no #fit marker");
  const end = css.indexOf("}", idx);
  const block = css.slice(idx, end + 1);
  if (block.includes("--shot-3:")) {
    css =
      css.slice(0, idx) +
      block.replace(/--shot-3:url\("[^"]+"\)/, `--shot-3:url("${url}")`) +
      css.slice(end + 1);
  } else {
    css = css.slice(0, end) + `\n  --shot-3:url("${url}"); ` + css.slice(end);
  }
  console.log("patched #fit block");
}

fs.writeFileSync(CSS, css);
console.log("done");
