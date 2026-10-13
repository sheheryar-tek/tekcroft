import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "images");
const BODY = path.join(
  ROOT,
  "lib",
  "google-business-profile-optimization-body.html"
);
const CSS = path.join(ROOT, "app", "google-business-profile-optimization.css");
const SRC =
  "C:/Users/Super/.cursor/projects/c-Tekcroft/assets/c__Users_Super_AppData_Roaming_Cursor_User_workspaceStorage_c6f7834920c05ebddafe800bc4c493a3_images_2-4f2bcec2-f9d8-4751-9c90-4bbc8463b56c.jpg";
const MAX = 80 * 1024;
const ALT = "Which One Is Best for GBP Optimization: DIY or Professional Service";

const buf = fs.readFileSync(SRC);
let best = null;
for (const [w, h] of [
  [1600, 900],
  [1400, 788],
  [1200, 675],
  [1100, 619],
  [1000, 562],
]) {
  let lo = 40,
    hi = 78;
  while (lo <= hi) {
    const q = Math.floor((lo + hi) / 2);
    const out = await sharp(buf, { failOn: "none" })
      .rotate()
      .resize({ width: w, height: h, fit: "cover", position: "centre" })
      .webp({ quality: q, effort: 6, smartSubsample: true })
      .toBuffer();
    if (out.length <= MAX) {
      best = { out, w, h, q, kb: +(out.length / 1024).toFixed(1) };
      lo = q + 1;
    } else hi = q - 1;
  }
  if (best && best.kb < 72) break;
}
if (!best) throw new Error("could not fit under 80KB");

const hash = crypto.createHash("sha1").update(best.out).digest("hex").slice(0, 10);
const name = `gbp-vs-${hash}.webp`;
for (const f of fs.readdirSync(OUT)) {
  if (/^gbp-vs-.*\.webp$/i.test(f) && f !== name) {
    fs.unlinkSync(path.join(OUT, f));
    console.log("deleted", f);
  }
}
fs.writeFileSync(path.join(OUT, name), best.out);
console.log({ file: `/images/${name}`, kb: best.kb, q: best.q, w: best.w, h: best.h });

const altEsc = ALT.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
const vsBg = `<div class="vs-bg" aria-hidden="true"><img src="/images/${name}" width="${best.w}" height="${best.h}" alt="${altEsc}" title="${altEsc}" decoding="async" loading="lazy"></div>`;

let html = fs.readFileSync(BODY, "utf8");
html = html.replace(
  /<section class="sec vs" id="fit"[^>]*>\s*(?:<div class="vs-bg"[^>]*>[\s\S]*?<\/div>\s*)?<div class="wrap">/,
  `<section class="sec vs" id="fit">\n  ${vsBg}\n<div class="wrap">`
);
fs.writeFileSync(BODY, html);
console.log("updated body");

let css = fs.readFileSync(CSS, "utf8");
const cssBlock = `
/* Know the difference — section photo (not shared --shot-3) */
#fit.vs{background:transparent !important;}
#fit.vs::before{content:none !important; background:none !important;}
#fit.vs > .vs-bg{
  position:absolute; inset:0; z-index:0; pointer-events:none; overflow:hidden;}
#fit.vs > .vs-bg img{
  position:absolute; inset:0; width:100%; height:100%;
  object-fit:cover; object-position:center; display:block;}
#fit.vs::after{z-index:1;}
#fit.vs > .wrap{position:relative; z-index:2;}
`;
if (!css.includes("#fit.vs > .vs-bg img")) {
  css += cssBlock;
  fs.writeFileSync(CSS, css);
  console.log("updated CSS");
} else {
  console.log("CSS already has vs-bg rules");
}

fs.writeFileSync(
  path.join(ROOT, "scripts", "_gbp-vs-map.json"),
  JSON.stringify(
    {
      file: `/images/${name}`,
      kb: best.kb,
      q: best.q,
      w: best.w,
      h: best.h,
    },
    null,
    2
  ) + "\n"
);
console.log("done");
