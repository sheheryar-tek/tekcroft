/**
 * Extract AI SEO Services standalone HTML → Next.js App Router assets.
 * Run: node scripts/extract-ai-seo.mjs
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const IMG = path.join(ROOT, "public", "images");
const SRC =
  process.env.TEKCROFT_AISEO_HTML ||
  "c:\\Users\\Super\\Downloads\\tekcroft-ai-seo (1).html";
const PREFIX = "aiseo";

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
  "shot-1": "/images/shot-1.webp",
  "shot-2": "/images/shot-2.webp",
  "shot-3": "/images/shot-3.webp",
  "shot-4": "/images/shot-4.webp",
};

const CHEVRON = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'%3E%3Cpath d='M1 1.5 6 6.5l5-5' stroke='%236B7684' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`;

function hashBuf(buf) {
  return crypto.createHash("sha1").update(buf).digest("hex").slice(0, 10);
}

async function saveDataUri(dataUri, hint, prefix) {
  const m = dataUri.match(/^data:image\/([\w+.-]+);base64,(.+)$/i);
  if (!m) return null;
  const subtype = m[1].toLowerCase();
  const buf = Buffer.from(m[2], "base64");
  const h = hashBuf(buf);
  if (subtype.includes("svg")) {
    const file = `${prefix}-${hint}-${h}.svg`;
    const dest = path.join(IMG, file);
    if (!fs.existsSync(dest)) fs.writeFileSync(dest, buf);
    return `/images/${file}`;
  }
  const maxW = hint.includes("shot") || hint.includes("hero") ? 1600 : 512;
  const file = `${prefix}-${hint}-${h}.webp`;
  const dest = path.join(IMG, file);
  if (!fs.existsSync(dest)) {
    let q = 78;
    let out;
    for (;;) {
      let img = sharp(buf, { failOn: "none" }).rotate();
      const meta = await sharp(buf, { failOn: "none" }).metadata();
      if ((meta.width || maxW) > maxW) {
        img = img.resize({ width: maxW, withoutEnlargement: true });
      }
      out = await img.webp({ quality: q, effort: 6 }).toBuffer();
      if (out.length <= 45 * 1024 || q <= 60) break;
      q -= 6;
    }
    fs.writeFileSync(dest, out);
  }
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

async function rewriteUrls(css, prefix) {
  css = await replaceAsync(
    css,
    /(--([a-z0-9-]+))\s*:\s*url\(\s*["']?(data:image\/[a-zA-Z0-9+.-]+;base64,[A-Za-z0-9+/=]+)["']?\s*\)/gi,
    async (m) => {
      const prop = m[2];
      const base = prop.replace(/-\d+$/, "");
      if (SHARED[prop] || SHARED[base]) {
        return `${m[1]}:url("${SHARED[prop] || SHARED[base]}")`;
      }
      const file = await saveDataUri(m[3], prop, prefix);
      return `${m[1]}:url("${file}")`;
    }
  );
  let n = 0;
  css = await replaceAsync(
    css,
    /url\(\s*["']?(data:image\/[a-zA-Z0-9+.-]+;base64,[A-Za-z0-9+/=]+)["']?\s*\)/gi,
    async (m) => {
      n++;
      const file = await saveDataUri(m[1], `css${n}`, prefix);
      return `url("${file}")`;
    }
  );
  return css.replaceAll('url("[B64]")', CHEVRON);
}

function extractStyles(html, ids) {
  const parts = [];
  for (const id of ids) {
    const m = html.match(new RegExp(`<style id="${id}">([\\s\\S]*?)</style>`, "i"));
    if (m) parts.push(`/* === ${id} === */\n${m[1].trim()}`);
    else console.warn("missing style", id);
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

const NAV_LINKS = `    <div class="nav-links">
      <a href="/">HOME</a>
      <a href="/#about">ABOUT US</a>
      <button class="mm-trigger" id="mmTrigger" type="button" aria-expanded="false" aria-haspopup="true" aria-controls="mmPanel">SERVICES<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button>
      <a href="/#work">CASE STUDIES</a>
      <a href="/blog">BLOG</a>
      <a href="/contact">CONTACT US</a>
    </div>`;

const MNAV = `  <div class="mnav js-mnav">
    <a href="/">HOME</a>
    <a href="/#about">ABOUT US</a>
    <div id="mmMobile"></div>
    <a href="/#work">CASE STUDIES</a>
    <a href="/blog">BLOG</a>
    <a href="/contact">CONTACT US</a>
    <button class="btn btn-primary" type="button" data-jump>Get a Free Proposal</button>
  </div>`;

const slimSrc = fs.readFileSync(
  path.join(ROOT, "scripts", "slim-service-pages.mjs"),
  "utf8"
);
const perfMatch = slimSrc.match(
  /const PERF_TAIL = `([\s\S]*?)`;\r?\n\r?\nasync function buildContact/
);
if (!perfMatch) throw new Error("PERF_TAIL not found in slim-service-pages.mjs");
const PERF_TAIL = perfMatch[1];

const STYLE_IDS = [
  "hs-styles",
  "tb-styles",
  "hero-copy-styles",
  "pf-styles",
  "pf-three",
  "eg-styles",
  "wk-styles",
  "faq-pics",
  "rhythm-styles",
  "hs-form-theme",
  "consistency",
  "consistency-2",
  "foot-lift",
  "foot-final",
  "tm-styles",
  "tm-fit",
  "tm-fill",
  "tm-viz",
  "tm-viz-fix",
  "ai-hero-points",
  "ai-sections",
];

const SCRIPT_IDS = [
  "wy-script",
  "tb-script",
  "walk-script",
  "ft-script",
  "faq-script",
  "wk-script",
  "pf-script",
  "tm-script",
];

const html = fs.readFileSync(SRC, "utf8");
console.log("source MB", (html.length / 1024 / 1024).toFixed(2));

const tk = html.match(/<style id="tk-core">([\s\S]*?)<\/style>/i);
let tokens = `/* === ai-seo tokens (from tk-core) === */\n:root{\n  --veil:rgba(0,0,0,.78);\n  --disc:hsl(var(--brand-h) 92% 95%);\n}\nhtml[data-theme="dark"]{\n  --disc:rgba(0,150,213,.16);\n}\n`;
if (tk) {
  const veil = tk[1].match(/--veil\s*:\s*([^;]+);/);
  const discLight = [...tk[1].matchAll(/--disc\s*:\s*([^;]+);/g)];
  if (veil) tokens = tokens.replace(/--veil:[^;]+;/, `--veil:${veil[1]};`);
  if (discLight[0])
    tokens = tokens.replace(
      /:root\{[\s\S]*?--disc:[^;]+;/,
      (m) => m.replace(/--disc:[^;]+;/, `--disc:${discLight[0][1]};`)
    );
  if (discLight[1])
    tokens = tokens.replace(
      /html\[data-theme="dark"\]\{[\s\S]*?--disc:[^;]+;/,
      (m) => m.replace(/--disc:[^;]+;/, `--disc:${discLight[1][1]};`)
    );
}

let css = extractStyles(html, STYLE_IDS);
css = tokens + "\n" + css;
css = await rewriteUrls(css, PREFIX);
css =
  `/* AI SEO Services — design from tekcroft-ai-seo HTML; chrome in tekcroft.css */\n` +
  css +
  PERF_TAIL;

const MARK =
  "/* === SITE CONSISTENCY LOCK (do not edit here — edit site-consistency.css) === */";
const lock = fs
  .readFileSync(path.join(ROOT, "app", "site-consistency.css"), "utf8")
  .trim();
css = css.trimEnd() + "\n\n" + MARK + "\n" + lock + "\n";
fs.writeFileSync(path.join(ROOT, "app", "ai-seo.css"), css);

let body = html
  .match(/<body[^>]*>([\s\S]*)<\/body>/i)[1]
  .replace(/<script\b[\s\S]*?<\/script>/gi, "")
  .trim();

body = body.replace(
  /<div class="nav-links">[\s\S]*?<\/div>\s*<div class="nav-right">/,
  `${NAV_LINKS}\n    <div class="nav-right">`
);
body = body.replace(
  /<div class="mnav js-mnav">[\s\S]*?<\/div>\s*(?=<\/div>\s*<\/nav>)/,
  `${MNAV}\n`
);
body = body.replace(
  /<div class="hs-bg" aria-hidden="true">[\s\S]*?<\/div>/,
  `<div class="hs-bg" aria-hidden="true"><img src="/images/hero-1.webp" width="1920" height="1080" alt="" decoding="async" fetchpriority="high"></div>`
);

let i = 0;
body = await replaceAsync(body, /src="(data:image\/[^"]+)"/gi, async (m) => {
  i++;
  const file = await saveDataUri(m[1], `img${i}`, PREFIX);
  return `src="${file}"`;
});

const ld = html.match(
  /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i
);
if (ld) {
  const faqEnd = body.search(/id=["']faq["'][\s\S]*?<\/section>/i);
  if (faqEnd >= 0) {
    const close = body.indexOf("</section>", faqEnd) + "</section>".length;
    const block = `\n\n<script type="application/ld+json">\n${ld[1].trim()}\n</script>\n`;
    body = body.slice(0, close) + block + body.slice(close);
  }
}

fs.writeFileSync(path.join(ROOT, "lib", "ai-seo-body.html"), body);
fs.writeFileSync(
  path.join(ROOT, "lib", "ai-seo-lcp.json"),
  JSON.stringify({ preload: "/images/hero-1.webp" }, null, 2)
);

let js = extractScripts(html, SCRIPT_IDS);

/* Harden FAQ like other service pages */
const faqHard = `/* === faq-script (hardened) === */
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

js = js.replace(
  /\/\* === faq-script === \*\/[\s\S]*?(?=\/\* === |\Z)/,
  faqHard.trim() + "\n\n"
);
fs.writeFileSync(path.join(ROOT, "public", "tekcroft-ai-seo.js"), js);

const desc =
  "Ranking on Google no longer guarantees your brand shows up when buyers ask AI for recommendations. Our AI SEO services build the content, citations, and authority that ChatGPT, Gemini, and AI Overviews draw from.";

fs.writeFileSync(
  path.join(ROOT, "lib", "ai-seo-meta.json"),
  JSON.stringify(
    {
      title: "AI SEO Services | Tekcroft",
      description: desc,
      canonical: "https://www.tekcroft.com/services/ai-seo-services",
    },
    null,
    2
  )
);

console.log(
  "ai-seo css",
  (css.length / 1024).toFixed(0),
  "KB; js",
  (js.length / 1024).toFixed(0),
  "KB; body",
  (body.length / 1024).toFixed(0),
  "KB"
);
