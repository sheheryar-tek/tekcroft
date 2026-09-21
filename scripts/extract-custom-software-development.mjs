/**
 * Extract Custom Software Development standalone HTML → Next.js App Router assets.
 * Run: node scripts/extract-custom-software-development.mjs
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const IMG = path.join(ROOT, "public", "images");
const SRC =
  process.env.TEKCROFT_CSD_HTML ||
  "c:\\Users\\Super\\Desktop\\TK FINAL\\Services\\Custom Software Development\\tekcroft-custom-software.html";
const PREFIX = "csd";
const MAX_BYTES = 100 * 1024;

fs.mkdirSync(IMG, { recursive: true });

const SHARED = {
  "logo-ink": "/images/logo-ink.webp",
  "logo-white": "/images/logo-white.webp",
  mark: "/images/mark.webp",
  "mark-white": "/images/mark-white.webp",
  "cn-shot": "/images/cn-seo.webp",
  "faq-shot": "/images/faq-shot.webp",
  "cta-shot": "/images/cta-shot.webp",
  "cta-shot-2": "/images/cta-shot-2.webp",
  "hero-1": "/images/hero-1.webp",
};

const CHEVRON = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'%3E%3Cpath d='M1 1.5 6 6.5l5-5' stroke='%236B7684' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`;

/** Page-specific style blocks (excludes tk-core, mm-styles, foot-styles, faq-styles). */
const STYLE_IDS = [
  "hs-styles",
  "tb-styles",
  "hero-copy-styles",
  "svc-styles",
  "cn-styles",
  "cn-refine",
  "faq-pics",
  "rhythm-styles",
  "foot-lift",
  "hs-form-theme",
  "foot-final",
  "consistency",
  "svc-copy",
  "pf-styles",
  "ind-marks",
  "eg-styles",
  "cn-three",
  "pf-cs",
  "hs-fit",
  "hs-stat",
  "svc-app",
  "wc-styles",
  "wc-five",
  "wc-app",
  "dv-styles",
  "fw-styles",
  "pr-styles",
  "rhythm-app",
  "cta-nda",
  "fw-foot",
  "tk-styles",
  "wk-styles",
  "wk-shots",
  "wc-six",
  "ind-photos",
  "ind-hues",
];

const SCRIPT_IDS = [
  "tb-script",
  "ft-script",
  "faq-script",
  "cn-script",
  "pf-script",
  "eg-script",
  "wc-script",
  "wk-script",
  "wc-six-script",
];

const writtenFiles = new Set();

function hashBuf(buf) {
  return crypto.createHash("sha1").update(buf).digest("hex").slice(0, 10);
}

function hintMaxWidth(hint) {
  const h = String(hint || "");
  if (h.includes("hero")) return 1600;
  if (h.includes("shot") || h.includes("cs-") || h.startsWith("wk") || h.includes("photo"))
    return 1400;
  if (h.includes("faq") || h.includes("cta") || h.includes("cn")) return 1200;
  if (h.includes("logo") || h.includes("mark") || h.includes("mk") || h.includes("ic"))
    return 480;
  return 900;
}

async function encodeUnderLimit(buf, hint) {
  let width = hintMaxWidth(hint);
  const meta = await sharp(buf, { failOn: "none" }).metadata();
  if (meta.width && meta.width < width) width = meta.width;

  for (let attempt = 0; attempt < 10; attempt++) {
    let lo = 38;
    let hi = 84;
    let best = null;
    while (lo <= hi) {
      const q = Math.floor((lo + hi) / 2);
      let pipeline = sharp(buf, { failOn: "none" }).rotate();
      if ((meta.width || width) > width) {
        pipeline = pipeline.resize({ width, withoutEnlargement: true });
      }
      const out = await pipeline.webp({ quality: q, effort: 6 }).toBuffer();
      if (out.length <= MAX_BYTES) {
        best = out;
        lo = q + 1;
      } else {
        hi = q - 1;
      }
    }
    if (best) return best;
    width = Math.max(320, Math.floor(width * 0.82));
  }

  return sharp(buf, { failOn: "none" })
    .rotate()
    .resize({ width: 640, withoutEnlargement: true })
    .webp({ quality: 48, effort: 6 })
    .toBuffer();
}

async function saveDataUri(dataUri, hint) {
  const m = dataUri.match(/^data:image\/([\w+.-]+);base64,(.+)$/i);
  if (!m) return null;
  const subtype = m[1].toLowerCase();
  const buf = Buffer.from(m[2], "base64");
  const h = hashBuf(buf);
  const safeHint = String(hint || "img")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);

  if (subtype.includes("svg")) {
    const file = `${PREFIX}-${safeHint}-${h}.svg`;
    const dest = path.join(IMG, file);
    if (!fs.existsSync(dest)) fs.writeFileSync(dest, buf);
    writtenFiles.add(file);
    return `/images/${file}`;
  }

  const file = `${PREFIX}-${safeHint}-${h}.webp`;
  const dest = path.join(IMG, file);
  if (!fs.existsSync(dest)) {
    const out = await encodeUnderLimit(buf, safeHint);
    fs.writeFileSync(dest, out);
  }
  writtenFiles.add(file);
  return `/images/${file}`;
}

async function replaceAsync(str, re, fn) {
  const parts = [];
  let last = 0;
  let m;
  const r = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");
  while ((m = r.exec(str))) {
    parts.push(str.slice(last, m.index));
    parts.push(await fn(m));
    last = m.index + m[0].length;
  }
  parts.push(str.slice(last));
  return parts.join("");
}

async function rewriteUrls(css) {
  css = await replaceAsync(
    css,
    /(--([a-z0-9-]+))\s*:\s*url\(\s*["']?(data:image\/[a-zA-Z0-9+.-]+;base64,[A-Za-z0-9+/=]+)["']?\s*\)/gi,
    async (m) => {
      const prop = m[2];
      const base = prop.replace(/-\d+$/, "");
      if (SHARED[prop] || SHARED[base]) {
        const shared = SHARED[prop] || SHARED[base];
        if (fs.existsSync(path.join(ROOT, "public", shared.replace(/^\//, "")))) {
          return `${m[1]}:url("${shared}")`;
        }
      }
      const file = await saveDataUri(m[3], prop);
      return `${m[1]}:url("${file}")`;
    }
  );

  let n = 0;
  css = await replaceAsync(
    css,
    /url\(\s*["']?(data:image\/[a-zA-Z0-9+.-]+;base64,[A-Za-z0-9+/=]+)["']?\s*\)/gi,
    async (m) => {
      n++;
      const file = await saveDataUri(m[1], `css${n}`);
      return `url("${file}")`;
    }
  );
  return css.replaceAll('url("[B64]")', CHEVRON);
}

function extractStyles(html, ids) {
  const parts = [];
  for (const id of ids) {
    const m = html.match(new RegExp(`<style id="${id}">([\\s\\S]*?)</style>`, "i"));
    if (m) {
      let block = m[1].trim();
      // Source tk-styles has a stray closing brace after the 900px media query.
      if (id === "tk-styles") {
        block = block.replace(
          /(\.tk-items\{padding-left:0; border-left:0; padding-top:16px; border-top:1px solid var\(--border-soft\);\}\s*\}\s*)\}(\s*@media \(prefers-reduced-motion:reduce\))/,
          "$1$2"
        );
      }
      parts.push(`/* === ${id} === */\n${block}`);
    } else console.warn("missing style", id);
  }
  return parts.join("\n\n");
}

function extractScripts(html, ids) {
  const all = [
    ...html.matchAll(
      /<script(?![^>]*type=["']application\/ld\+json)([^>]*)>([\s\S]*?)<\/script>/gi
    ),
  ].filter((m) => !/src=/i.test(m[1] || ""));

  const out = [];
  for (const m of all) {
    const id = (m[1].match(/id=["']([^"']+)["']/) || [])[1] || "chrome";
    if (id === "mm-script") continue;
    if (id !== "chrome" && !ids.includes(id)) continue;
    out.push(`/* === ${id} === */\n${m[2]}`);
  }
  return out.join("\n\n");
}

const FAQ_HARD = `/* === faq-script (hardened) === */
(function(){
  function panelFor(btn){
    var id = btn.getAttribute("aria-controls");
    return id ? document.getElementById(id) : null;
  }
  function closeAll(list){
    list.querySelectorAll(".faq-q").forEach(function(b){
      b.setAttribute("aria-expanded", "false");
      var p = panelFor(b);
      if (p){ p.setAttribute("data-open", "false"); p.classList.remove("is-open"); }
    });
  }
  document.addEventListener("click", function(e){
    var t = e.target;
    if (t && t.nodeType === 3) t = t.parentElement;
    if (!t || typeof t.closest !== "function") return;
    var btn = t.closest(".faq-q");
    if (!btn) return;
    var list = btn.closest(".faq-list");
    if (!list) return;
    var panel = panelFor(btn);
    if (!panel) return;
    var isOpen = btn.getAttribute("aria-expanded") === "true";
    closeAll(list);
    if (!isOpen){
      btn.setAttribute("aria-expanded", "true");
      panel.setAttribute("data-open", "true");
      panel.classList.add("is-open");
      var wrap = list.closest(".faq-wrap");
      if (wrap){
        var qs = Array.prototype.slice.call(list.querySelectorAll(".faq-q"));
        wrap.dataset.at = String(qs.indexOf(btn) + 1);
      }
    }
  });
})();`;

const TYPE_SCALE = `
/* page perf helpers — design unchanged */
.sec{ content-visibility:auto; contain-intrinsic-size:auto 800px; }
.ct-hero, .hs, #hero-1, #top, #faq, #why, #services-2, #tech, #work, #reviews {
  content-visibility:visible !important; contain-intrinsic-size:auto none !important;
}
.nav-links{ gap:22px !important; text-transform:uppercase; letter-spacing:.04em; }
.mm-trigger{ text-transform:uppercase; letter-spacing:.04em; }
.mnav > a, .mnav .mm-acc{ text-transform:uppercase; letter-spacing:.04em; }
.mnav .mm-accp a, .mnav .btn{ text-transform:none; letter-spacing:0; }

/* === type-scale lock === */
/*
  Inter reading text = 16px (--body) everywhere.
  Sora = headings only.

  Still smaller on purpose (not reading paragraphs):
  - nav / mega-menu / buttons → chrome, not body copy
  - eyebrows, badges, step numbers, uppercase track labels → hierarchy labels
  - form labels, errors, helper notes → UI chrome
  - footer link lists, map overlay labels → micro chrome
  - chart legends, review metadata (avatar/date/tag) → data UI, not prose
*/
h1, h2, h3, h4, h5, h6{
  font-family:var(--font-display);
}
.hs-lede,
.sec-lede,
.hero .lede,
.mp-say > p,
.wy-say > p,
.wc-say > p,
.gw-say > p,
.wn-say p,
.cg-say > p,
.fw1-lede,
.fw2-lede,
.fw2-lede + .fw2-lede,
.av1-copy p,
.eg-sec .sec-lede,
.ct-next-head p,
.cta3 > p,
.pf-head .sec-lede,
.lo-say .sec-lede,
.lp-say .sec-lede,
.hx .sec-lede,
.sh-close p,
.sh-band p,
.faq-a p,
.faq-aside p,
.faq-cta p,
.faq-card p,
.eg-card p,
.eg-exp-head p,
.eg-exp-list p,
.eg-exp-note,
.eg-note,
.lp-note,
.pf-card > p,
.ws-item p,
.gw-block p,
.gw-cta-say p,
.gw-checks li,
.wc-card p,
.wk-say p,
.wc-panel > p,
.wn-panel > p,
#who .wn-card p,
#who .wn-close-t p,
.wy-txt > span,
.wa-note,
.ax-close-b,
.modal-done p,
.pb-d,
.pb-good .pb-d,
.pb-close-t p,
.hx-card p,
.gt-card p,
.sg-item p,
.sp-list div > span,
.fw1-list li,
.lo-strip div > span,
.cn-list li,
.cn-subs em,
.gr-text,
.bpx-stage p,
.bl-note,
.vs-v,
.vs-cta-t > p,
.cl-foot p,
.wl-row:not(.wl-head) .wl-cell:nth-child(2),
.wl-row:not(.wl-head) .wl-cell:nth-child(3),
.wl-foot p,
.tb-wall > p.tb-claim,
.tb-fig .tb-cap,
.hs-done p,
.hs-sub,
.ct-c > p,
.ct-step-d,
.ct-way-v,
.tk .sec-lede,
.pr-note,
.pr-notes,
.wk-card p{
  font-family:var(--font);
  font-size:var(--body);
}
.eg-sec h2,
.gw-say h2,
.mp-say h2,
.pf-head h2,
.wy-say h2,
.hx .sec-head h2,
.sg-head h2,
.ct-side h2,
.ct-next-head h2,
.cta3 h2,
.tk-head h2,
.wk-say h2,
.wc-say h2,
.pr-head h2,
.revs .sec-head h2{
  font-family:var(--font-display);
  font-size:var(--h2);
  letter-spacing:-0.04em;
}
.ct-hero h1{
  font-family:var(--font-display);
  font-size:var(--h1);
}
.hs-h1{
  font-family:var(--font-display);
}
.ws-item h3,
.eg-card h3,
.gw-block h3,
.pf-card h3,
.sp-top h3,
.tk-item strong,
.wk-card h3,
.wc-card h3{
  font-family:var(--font-display);
  font-size:var(--h3);
}
@media (max-width:640px){
  .hs-lede,
  .cta3 > p,
  .faq-a p,
  .eg-card p{font-size:var(--body);}
  .cta3 h2{font-size:var(--h2);}
}
@media (max-width:560px){
  .faq-a p{font-size:var(--body);}
}

/* Dark mode: process / expect cards stay on theme surface (all service pages) */
html[data-theme="dark"] #process .eg-card,
html[data-theme="dark"] #process .eg-card::after,
html[data-theme="dark"] #process .eg-exp,
html[data-theme="dark"] #process .eg-exp-list li::before{
  background:var(--surface);
  border-color:var(--border);
}
html[data-theme="dark"] #process .eg-when,
html[data-theme="dark"] #process .eg-exp-note{
  background:var(--brand-soft);
}
html[data-theme="dark"] #process .eg-card h3,
html[data-theme="dark"] #process .eg-exp-lab{
  color:var(--text);
}
html[data-theme="dark"] #process .eg-card p,
html[data-theme="dark"] #process .eg-exp-head p,
html[data-theme="dark"] #process .eg-exp-list p,
html[data-theme="dark"] #process .eg-exp-note{
  color:var(--text-2);
  font-size:var(--body);
}

/* fig-af: upright + smaller — no italic/skew on %, +, $M+ */
.tb-fig b .fig-af{
  font-style:normal !important;
  transform:none !important;
  font-size:.70em;
  font-weight:800;
  vertical-align:0.12em;
}
`;

const GROUNDS = `
/* Section grounds — strict white / tint / white / tint after the dark hero */
#proof,
#tech,
#process,
#work,
#pricing,
#faq{
  --ground:var(--bg-alt);
  --panel:var(--surface);
}
#services-2,
#industries,
#reviews,
#whyus,
#contact{
  --ground:var(--surface);
  --panel:var(--bg-alt);
}

html[data-theme="dark"] #process .eg-card,
html[data-theme="dark"] #pricing .pr-table,
html[data-theme="dark"] #pricing .pr-row{
  background:var(--surface);
  border-color:var(--border);
  color:var(--text);
}

#proof,
#services-2,
#tech,
#industries,
#process,
#reviews,
#work,
#pricing,
#whyus,
#faq,
#contact{
  background:var(--ground) !important;
  border-block:0 !important;
}
#services-2.svc-cn{ border-block:0; }
#services-2 .cn-plate::before{ display:none !important; }
#services-2 .cn-plate::after{
  background:
    radial-gradient(120% 90% at 12% 0%, hsl(var(--brand-h) 100% 50% / .22), transparent 55%),
    linear-gradient(180deg, #0b1220 0%, #070b14 100%) !important;
}
html[data-theme="dark"] #services-2 .cn-plate::after{
  background:
    radial-gradient(120% 90% at 12% 0%, hsl(var(--brand-h) 100% 50% / .18), transparent 55%),
    linear-gradient(180deg, #0a0a0a 0%, #050505 100%) !important;
}
#services-2 .cn-tab{
  color:rgba(255,255,255,.70) !important;
  background:transparent !important;
  text-shadow:none !important;
}
#services-2 .cn-tab.on{ color:#fff !important; background:transparent !important; }
#services-2 .cn-lift{
  background:var(--primary) !important; backdrop-filter:none !important;
  -webkit-backdrop-filter:none !important;
  box-shadow:0 14px 30px -14px hsl(var(--brand-h) 100% 34% / .75) !important;}
#services-2 .cn-go{
  background:transparent !important; box-shadow:none !important;
  backdrop-filter:none !important; -webkit-backdrop-filter:none !important; opacity:0;}
#services-2 .cn-tab.on .cn-go{
  opacity:1 !important; background:#0a1a29 !important; color:#fff !important;
  backdrop-filter:none !important; -webkit-backdrop-filter:none !important; box-shadow:none !important;}
#services-2 .cn-sheet{ background:#fff !important; }
html[data-theme="dark"] #services-2 .cn-sheet{ background:var(--n875) !important; }
@media (max-width:1040px){
  #services-2 .cn-tab.on{ background:var(--primary) !important; color:#fff !important; }
  #services-2 .cn-go, #services-2 .cn .cn-go{
    opacity:1 !important; background:var(--primary) !important; color:#fff !important;
    transform:none !important; visibility:visible !important;}
  html[data-theme="dark"] #services-2 .cn-go{ background:rgba(255,255,255,.14) !important; }
  #services-2 .cn-tab.on .cn-go{
    opacity:1 !important; background:#fff !important; color:var(--primary) !important;
    transform:none !important;}
  #services-2 .cn-tab:not(.on):hover .cn-go,
  #services-2 .cn-tab:not(.on):focus-visible .cn-go{
    opacity:1 !important; background:var(--primary) !important; transform:none !important;}
  #services-2 .cn-go::before, #services-2 .cn-go::after{
    content:"" !important; position:absolute !important; top:50% !important; left:50% !important;
    background:currentColor !important; border-radius:2px !important;
    transform:translate(-50%,-50%) !important; display:block !important;}
  #services-2 .cn-go::before{width:13px !important; height:2px !important;}
  #services-2 .cn-go::after{width:2px !important; height:13px !important;}
  #services-2 .cn-tab.on .cn-go::after{transform:translate(-50%,-50%) scaleY(0) !important;}
  #services-2 .cn-go svg{display:none !important;}
}
`;

function madNav() {
  const mad = fs.readFileSync(
    path.join(ROOT, "lib", "mobile-app-development-body.html"),
    "utf8"
  );
  const m = mad.match(/<nav class="nav"[\s\S]*?<\/nav>/i);
  if (!m) throw new Error("MAD nav not found");
  return m[0];
}

function pruneUnusedImages(css, body) {
  const blob = css + "\n" + body;
  const refs = new Set(
    [...blob.matchAll(/\/images\/(csd-[a-z0-9._-]+\.(?:webp|svg))/gi)].map((m) => m[1])
  );
  let removed = 0;
  for (const file of fs.readdirSync(IMG)) {
    if (!file.startsWith("csd-")) continue;
    if (refs.has(file)) continue;
    fs.unlinkSync(path.join(IMG, file));
    writtenFiles.delete(file);
    removed++;
  }
  return { refs: refs.size, removed };
}

console.log("Reading:", SRC);
const html = fs.readFileSync(SRC, "utf8");

let css = extractStyles(html, STYLE_IDS);
css = await rewriteUrls(css);
css =
  `/* Custom Software Development — design from source HTML; chrome in tekcroft.css */\n` +
  css +
  GROUNDS +
  TYPE_SCALE;
fs.writeFileSync(path.join(ROOT, "app", "custom-software-development.css"), css);
console.log("CSS written", `${(css.length / 1024).toFixed(0)} KB`);

let rawBody = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)[1]
  .replace(/<script\b[\s\S]*?<\/script>/gi, "")
  .trim();

const navEnd = rawBody.search(/<\/nav>/i);
if (navEnd < 0) throw new Error("CSD nav end not found");
const afterNav = rawBody.slice(navEnd + "</nav>".length).trim();
let body = `${madNav()}\n\n${afterNav}`;

let heroSrc = null;
const heroData = body.match(
  /<div class="hs-bg"[^>]*>[\s\S]*?src="(data:image\/[^"]+)"/i
);
if (heroData) {
  heroSrc = await saveDataUri(heroData[1], "hero");
} else {
  // maybe already a path, or CSS background only
  const heroPath = body.match(
    /<div class="hs-bg"[^>]*>[\s\S]*?src="(\/images\/[^"]+)"/i
  );
  if (heroPath) heroSrc = heroPath[1];
}
if (!heroSrc) {
  // try hs-styles background
  const bg = css.match(/\.hs-bg[^}]*url\("(\/images\/csd-[^"]+)"/i);
  if (bg) heroSrc = bg[1];
}

if (heroSrc) {
  body = body.replace(
    /<div class="hs-bg" aria-hidden="true">[\s\S]*?<\/div>/,
    `<div class="hs-bg" aria-hidden="true"><img src="${heroSrc}" width="1920" height="1080" alt="" decoding="async" fetchpriority="high"></div>`
  );
}

body = body.replace(
  /<svg class="eh-sprite"/,
  '<svg class="eh-sprite" width="0" height="0" style="position:absolute;width:0;height:0;overflow:hidden"'
);

let i = 0;
body = await replaceAsync(body, /src="(data:image\/[^"]+)"/gi, async (m) => {
  i++;
  const file = await saveDataUri(m[1], `img${i}`);
  return `src="${file}"`;
});

fs.writeFileSync(path.join(ROOT, "lib", "custom-software-development-body.html"), body);
fs.writeFileSync(
  path.join(ROOT, "lib", "custom-software-development-lcp.json"),
  JSON.stringify({ preload: heroSrc || "/images/hero-1.webp" }, null, 2)
);
console.log("Body written; LCP:", heroSrc);

let js = extractScripts(html, SCRIPT_IDS);
js = js.replace(
  /\/\* === faq-script === \*\/[\s\S]*?(?=\/\* === |\Z)/,
  FAQ_HARD.trim() + "\n\n"
);
fs.writeFileSync(
  path.join(ROOT, "public", "tekcroft-custom-software-development.js"),
  js
);
console.log("JS written", `${(js.length / 1024).toFixed(0)} KB`);

const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
const descMatch = html.match(
  /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i
);
fs.writeFileSync(
  path.join(ROOT, "lib", "custom-software-development-meta.json"),
  JSON.stringify(
    {
      title:
        (titleMatch && titleMatch[1].trim()) ||
        "Custom Software Development Services | Tekcroft",
      description:
        (descMatch && descMatch[1].trim()) ||
        "Custom software built around your real workflows — new builds or taking over software someone else started.",
      canonical: "https://www.tekcroft.com/services/software-development-services",
    },
    null,
    2
  )
);

const pruned = pruneUnusedImages(css, body);
const kept = [];
for (const file of fs.readdirSync(IMG)) {
  if (!file.startsWith("csd-")) continue;
  const st = fs.statSync(path.join(IMG, file));
  kept.push({ file, kb: +(st.size / 1024).toFixed(1) });
}
kept.sort((a, b) => b.kb - a.kb);
const max = kept[0];
console.log(
  `Images: ${kept.length} kept (refs ${pruned.refs}), pruned ${pruned.removed}; max ${
    max ? max.file + " " + max.kb + "KB" : "n/a"
  }`
);
if (max && max.kb > 100) {
  console.warn("WARNING: image over 100KB:", max.file, max.kb);
}
console.log("Done.");
