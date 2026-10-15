/**
 * AI Chatbot #stack ("Our stack"): encode photo to WebP <80KB and use
 * as .vs section background via scoped --shot-3 (same pattern as MAD #fit).
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "images");
const CSS = path.join(ROOT, "app", "ai-chatbot-development.css");
const BODY = path.join(ROOT, "lib", "ai-chatbot-development-body.html");
const SRC =
  "C:/Users/Super/.cursor/projects/c-Tekcroft/assets/c__Users_Super_AppData_Roaming_Cursor_User_workspaceStorage_c6f7834920c05ebddafe800bc4c493a3_images_2__2_-a701e8f7-62e9-4a68-9157-ed6650b59da3.jpg";
const MAX = 80 * 1024;

const ALT =
  "Engineer configuring AI models, data pipelines, and chatbot frameworks on a multi-monitor stack";
const TITLE = "Technology, Models & Compliance We Work With";

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
const name = `acb-stack-${hash}.webp`;

for (const f of fs.readdirSync(OUT)) {
  if (/^acb-stack-[a-f0-9]+\.webp$/i.test(f) && f !== name) {
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
  /#stack\{\s*--ground:var\(--bg-alt\);\s*--panel:var\(--surface\);\s*--vs-veil:rgba\(0,0,0,\.78\);(?:\s*--shot-3:url\("[^"]+"\);)?\s*\}/;

const next = `#stack{ --ground:var(--bg-alt); --panel:var(--surface);
  --vs-veil:rgba(0,0,0,.78);
  --shot-3:url("${url}"); }`;

if (re.test(css)) {
  css = css.replace(re, next);
  console.log("updated #stack token block");
} else if (/--shot-3:url\("\/images\/acb-stack-[a-f0-9]+\.webp"\)/.test(css)) {
  css = css.replace(
    /--shot-3:url\("\/images\/acb-stack-[a-f0-9]+\.webp"\)/,
    `--shot-3:url("${url}")`
  );
  console.log("replaced existing acb-stack shot");
} else {
  const marker = "#stack{ --ground:var(--bg-alt); --panel:var(--surface);";
  const idx = css.indexOf(marker);
  if (idx < 0) throw new Error("no #stack marker");
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
  console.log("patched #stack block");
}

const hideCss = `
/* ACB #stack bg alt/title carrier — visual comes from .vs::before */
#stack .stack-shot{
  position:absolute !important; width:1px !important; height:1px !important;
  padding:0 !important; margin:-1px !important; overflow:hidden !important;
  clip:rect(0,0,0,0) !important; white-space:nowrap !important; border:0 !important;
}
`;
if (!css.includes("#stack .stack-shot{")) {
  const lock = "/* === SITE CONSISTENCY LOCK";
  const lockIdx = css.indexOf(lock);
  if (lockIdx >= 0) css = css.slice(0, lockIdx) + hideCss + "\n" + css.slice(lockIdx);
  else css += "\n" + hideCss;
}

fs.writeFileSync(CSS, css);

let html = fs.readFileSync(BODY, "utf8");
const shot = `<img class="stack-shot" src="${url}" width="${meta.width}" height="${meta.height}" alt="${ALT.replace(/"/g, "&quot;")}" title="${TITLE.replace(/"/g, "&quot;")}" decoding="async" loading="lazy">`;

if (/<img class="stack-shot"[\s\S]*?>/.test(html)) {
  html = html.replace(/<img class="stack-shot"[\s\S]*?>/, shot);
} else {
  html = html.replace(
    /(<section class="sec vs" id="stack">\s*<div class="wrap">)/,
    `$1\n    ${shot}`
  );
}
fs.writeFileSync(BODY, html);
console.log("updated body");

fs.writeFileSync(
  path.join(ROOT, "scripts", "_acb-stack-map.json"),
  JSON.stringify(
    {
      file: url,
      kb: +(best.bytes / 1024).toFixed(1),
      alt: ALT,
      title: TITLE,
    },
    null,
    2
  ) + "\n"
);
console.log("done");
