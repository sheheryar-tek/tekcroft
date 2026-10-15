/**
 * Extract Artificial Intelligence Services HTML → Next.js App Router assets.
 * Run: node scripts/extract-artificial-intelligence-services.mjs
 *
 * Keeps proof-v3 + build-v3 only; strips review switcher and unused variants.
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const IMG = path.join(ROOT, "public", "images");
const SRC =
  process.env.TEKCROFT_AIS_HTML ||
  "C:/Users/Super/Downloads/tekcroft-artificial-intelligence-services (3).html";
const PREFIX = "ais";
const MAX_BYTES = 100 * 1024;

fs.mkdirSync(IMG, { recursive: true });

const SHARED = {
  "logo-ink": "/images/logo-ink.webp",
  "logo-white": "/images/logo-white.webp",
  mark: "/images/mark.webp",
  "mark-white": "/images/mark-white.webp",
  "faq-shot": "/images/faq-shot.webp",
  "cta-shot": "/images/cta-shot.webp",
  "cta-shot-2": "/images/cta-shot-2.webp",
  "hero-1": "/images/hero-1.webp",
};

const CHEVRON = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'%3E%3Cpath d='M1 1.5 6 6.5l5-5' stroke='%236B7684' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`;

/** Page-specific styles (excludes tk-core, mm-styles, foot-styles, faq-styles, bvsw). */
const STYLE_IDS = [
  "hs-styles",
  "tb-styles",
  "hero-copy-styles",
  "svc-styles",
  "mpc-styles",
  "pf-styles",
  "cn-styles",
  "cn-refine",
  "faq-pics",
  "rhythm-styles",
  "eg-styles",
  "wc-styles",
  "wk-styles",
  "sg-styles",
  "cn-subs",
  "wc-five",
  "pf-three",
  "hx-styles",
  "gt-styles",
  "foot-lift",
  "hs-form-theme",
  "foot-final",
  "consistency",
  "hx-trace",
  "consistency-2",
  "hero-form-glass",
  "mm-veil-lighter",
  "mm-bottom-copy",
  "mm-core-pills",
  "mm-core-strong",
  "mm-spacing",
  "mm-core-v3",
  "mm-core-fit",
  "mm-current",
  "tm-styles",
  "tm-extra-styles",
  "ai-delivers",
  "b5-styles",
  "ai-tx-styles",
  "ig-styles",
  "gv-styles",
  "ai-process-fix",
  "ind-marks",
  "pf-cs",
  "ind-photos",
  "ind-hues",
  "pf-ai",
  "ind-ai",
  "wy-styles",
  "em-styles",
  "faq-ai",
  "cta-ai",
  "s5-styles",
  "hs-logos-styles",
  "sw-styles",
  "ais-eyebrow",
];

const SCRIPT_IDS = [
  "s5-script",
  "tm-script",
  "b5-script",
  "ai-tx-noscroll",
  "ig-script",
  "gv-script",
  "wy-script",
  "tb-script",
  "walk-script",
  "ft-script",
  "faq-script",
  "cn-script",
  "wc-script",
  "wk-script",
  "pf-script",
  "hx-wire-script",
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

async function rewriteUrls(css) {
  // Collect unique data URIs with a linear scan (avoid ReDoS on huge base64).
  const found = [];
  const re = /url\(\s*["']?(data:image\/[a-zA-Z0-9+.+-]*;base64,[A-Za-z0-9+/=]+)["']?\s*\)/gi;
  let m;
  while ((m = re.exec(css))) {
    found.push(m[1]);
  }
  const uniq = [...new Set(found)];
  console.log("encoding", uniq.length, "unique data URIs");
  const map = new Map();
  let n = 0;
  for (const dataUri of uniq) {
    n++;
    // Prefer shared logo/mark when the surrounding CSS var matches
    let hint = `css${n}`;
    const idx = css.indexOf(dataUri);
    if (idx > 0) {
      const ahead = css.slice(Math.max(0, idx - 80), idx);
      const prop = (ahead.match(/--([a-z0-9-]+)\s*:\s*url\(\s*["']?$/) || [])[1];
      if (prop) {
        const base = prop.replace(/-\d+$/, "");
        if (SHARED[prop] || SHARED[base]) {
          const shared = SHARED[prop] || SHARED[base];
          if (fs.existsSync(path.join(ROOT, "public", shared.replace(/^\//, "")))) {
            map.set(dataUri, shared);
            console.log(" ", n, "shared", prop, "->", shared);
            continue;
          }
        }
        hint = prop;
      }
    }
    console.log(" ", n, "encode", hint, `${(dataUri.length / 1024).toFixed(0)}KB`);
    const file = await saveDataUri(dataUri, hint);
    map.set(dataUri, file);
  }
  for (const [dataUri, file] of map) {
    css = css.split(dataUri).join(file);
  }
  css = css.replace(/url\(\s*["']?(\/images\/[^"')]+)["']?\s*\)/gi, 'url("$1")');
  return css.replaceAll('url("[B64]")', CHEVRON);
}

function extractStyles(html, ids) {
  const parts = [];
  for (const id of ids) {
    const re = new RegExp(`<style id="${id}">([\\s\\S]*?)</style>`, "gi");
    const matches = [...html.matchAll(re)];
    if (!matches.length) {
      console.warn("missing style", id);
      continue;
    }
    matches.forEach((m, i) => {
      const block = m[1].trim();
      const label = matches.length > 1 ? `${id}-${i + 1}` : id;
      parts.push(`/* === ${label} === */\n${block}`);
    });
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
    if (id === "mm-script" || id === "bvsw-script" || id === "mm-core-icons" || id === "mm-current-js")
      continue;
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

const PERF = `
/* page perf helpers — design unchanged */
.sec{ content-visibility:auto; contain-intrinsic-size:auto 800px; }
.ct-hero, .hs, #hero-1, #top, #faq, #why, #proof-v3, #build-v3, #model, #tech-v4, #integ, #govern, #process, #industries, #models, #contact {
  content-visibility:visible !important; contain-intrinsic-size:auto none !important;
}
.nav-links{ gap:22px !important; text-transform:uppercase; letter-spacing:.04em; }
.mm-trigger{ text-transform:uppercase; letter-spacing:.04em; }
.mnav > a, .mnav .mm-acc{ text-transform:uppercase; letter-spacing:.04em; }
.mnav .mm-accp a, .mnav .btn{ text-transform:none; letter-spacing:0; }
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

function stripVariants(body) {
  body = body.replace(/<section[^>]*id=["']proof["'][^>]*>[\s\S]*?<\/section>/i, "");
  body = body.replace(/<section[^>]*id=["']proof-v2["'][^>]*>[\s\S]*?<\/section>/i, "");
  body = body.replace(/<section[^>]*id=["']build-v2["'][^>]*>[\s\S]*?<\/section>/i, "");
  body = body.replace(/<div class="bvsw"[\s\S]*?<\/div>/i, "");
  // Keep selected variants always visible
  body = body.replace(/\sdata-svar=["'][^"']*["']/gi, "");
  body = body.replace(/\sdata-bvar=["'][^"']*["']/gi, "");
  body = body.replace(/\sdata-tvar=["'][^"']*["']/gi, "");
  return body;
}

function scrubVariantCss(css) {
  css = css.replace(/\[data-svar\][^{]*\{[^}]*\}/gi, "");
  css = css.replace(/\[data-bvar\][^{]*\{[^}]*\}/gi, "");
  css = css.replace(/\[data-tvar\][^{]*\{[^}]*\}/gi, "");
  css = css.replace(/\.bvsw[^{]*\{[^}]*\}/gi, "");
  css = css.replace(/\.bvsw\s+[^{]+\{[^}]*\}/gi, "");
  css = css.replace(/\.bvsw\s+\.sep[^{]*\{[^}]*\}/gi, "");
  return css;
}

function pruneUnusedImages(css, body) {
  const blob = css + "\n" + body;
  const refs = new Set(
    [...blob.matchAll(/\/images\/(ais-[a-z0-9._-]+\.(?:webp|svg))/gi)].map((m) => m[1])
  );
  let removed = 0;
  for (const file of fs.readdirSync(IMG)) {
    if (!file.startsWith("ais-")) continue;
    if (refs.has(file)) continue;
    fs.unlinkSync(path.join(IMG, file));
    writtenFiles.delete(file);
    removed++;
  }
  return { refs: refs.size, removed };
}

console.log("Reading:", SRC);
const html = fs.readFileSync(SRC, "utf8");

console.log("extracting styles…");
let css = extractStyles(html, STYLE_IDS);
console.log("scrubbing variants…");
css = scrubVariantCss(css);
css = await rewriteUrls(css);
css =
  `/* Artificial Intelligence Services — design from source HTML; chrome in tekcroft.css */\n` +
  css +
  PERF;
fs.writeFileSync(path.join(ROOT, "app", "artificial-intelligence-services.css"), css);
console.log("CSS written", `${(css.length / 1024).toFixed(0)} KB`);

let rawBody = html
  .match(/<body[^>]*>([\s\S]*)<\/body>/i)[1]
  .replace(/<script\b[\s\S]*?<\/script>/gi, "")
  .trim();

const navEnd = rawBody.search(/<\/nav>/i);
if (navEnd < 0) throw new Error("AIS nav end not found");
const afterNav = rawBody.slice(navEnd + "</nav>".length).trim();
let body = `${madNav()}\n\n${afterNav}`;
body = stripVariants(body);

body = body.replace(
  /<svg class="eh-sprite"/,
  '<svg class="eh-sprite" width="0" height="0" style="position:absolute;width:0;height:0;overflow:hidden"'
);

const bodyUris = [];
{
  const re = /src="(data:image\/[^"]+)"/gi;
  let bm;
  while ((bm = re.exec(body))) bodyUris.push(bm[1]);
}
const bodyUniq = [...new Set(bodyUris)];
console.log("encoding", bodyUniq.length, "body data URIs");
const bodyMap = new Map();
let bi = 0;
for (const dataUri of bodyUniq) {
  bi++;
  console.log(" ", bi, "body", `${(dataUri.length / 1024).toFixed(0)}KB`);
  bodyMap.set(dataUri, await saveDataUri(dataUri, `img${bi}`));
}
for (const [dataUri, file] of bodyMap) {
  body = body.split(`src="${dataUri}"`).join(`src="${file}"`);
}

let heroSrc = null;
const heroPath = body.match(
  /<div class="hs-bg"[^>]*>[\s\S]*?src="(\/images\/[^"]+)"/i
);
if (heroPath) heroSrc = heroPath[1];
if (!heroSrc) {
  const bg = css.match(/\.hs-bg[^}]*url\("(\/images\/ais-[^"]+)"/i);
  if (bg) heroSrc = bg[1];
}
if (heroSrc) {
  body = body.replace(
    /<div class="hs-bg" aria-hidden="true">[\s\S]*?<\/div>/,
    `<div class="hs-bg" aria-hidden="true"><img src="${heroSrc}" width="1920" height="1080" alt="" decoding="async" fetchpriority="high"></div>`
  );
}

fs.writeFileSync(path.join(ROOT, "lib", "artificial-intelligence-services-body.html"), body);
fs.writeFileSync(
  path.join(ROOT, "lib", "artificial-intelligence-services-lcp.json"),
  JSON.stringify({ preload: heroSrc || "/images/hero-1.webp" }, null, 2) + "\n"
);
console.log("Body written; LCP:", heroSrc);

let js = extractScripts(html, SCRIPT_IDS);
js = js.replace(
  /\/\* === faq-script === \*\/[\s\S]*?(?=\/\* === |\Z)/,
  FAQ_HARD.trim() + "\n\n"
);
fs.writeFileSync(path.join(ROOT, "public", "tekcroft-artificial-intelligence-services.js"), js);
console.log("JS written", `${(js.length / 1024).toFixed(0)} KB`);

const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
const descMatch = html.match(
  /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i
);
fs.writeFileSync(
  path.join(ROOT, "lib", "artificial-intelligence-services-meta.json"),
  JSON.stringify(
    {
      title:
        (titleMatch && titleMatch[1].trim()) ||
        "Artificial Intelligence Services to Fit Your Workflows",
      description:
        (descMatch && descMatch[1].trim()) ||
        "Tekcroft helps businesses scale by applying AI innovation to drive optimal results and reduce operational costs. Get Your AI Business Solution Now.",
      canonical:
        "https://www.tekcroft.com/services/artificial-intelligence-services",
    },
    null,
    2
  ) + "\n"
);

const pruned = pruneUnusedImages(css, body);
const kept = [];
for (const file of fs.readdirSync(IMG)) {
  if (!file.startsWith("ais-")) continue;
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

// Sanity: kept sections present, deleted gone
const must = [
  "proof-v3",
  "build-v3",
  "model",
  "tech-v4",
  "integ",
  "govern",
  "process",
  "industries",
  "why",
  "models",
  "faq",
  "contact",
];
for (const id of must) {
  if (!body.includes(`id="${id}"`)) console.warn("MISSING section", id);
}
if (/\sid=["']proof["']/.test(body)) console.warn("OLD proof still present");
if (body.includes("proof-v2")) console.warn("proof-v2 still present");
if (body.includes("build-v2")) console.warn("build-v2 still present");
if (body.includes("bvsw")) console.warn("bvsw still present");
if (body.includes("data-svar") || body.includes("data-bvar")) {
  console.warn("variant attrs still present");
}

// Keep AIS out of site-consistency lock; rebuild unlock sheet for raw design
await import("./_build-ais-unlock.mjs");
console.log("Done.");
