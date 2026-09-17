/**
 * Slim service-page CSS/JS: reuse app/tekcroft.css for shared chrome.
 * Page files keep only section-specific styles + chrome JS (no mega-menu).
 * Mega-menu loads deferred via Homepage component + public/tekcroft-mm.js.
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const IMG = path.join(ROOT, "public", "images");

const SHARED = {
  "logo-ink": "/images/logo-ink.webp",
  "logo-white": "/images/logo-white.webp",
  mark: "/images/mark.webp",
  "mark-white": "/images/mark-white.webp",
  "cn-shot": "/images/cn-shot.webp",
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

const NAV_PATCH = {
  links: `    <div class="nav-links">
      <a href="/">HOME</a>
      <a href="/#about">ABOUT US</a>
      <button class="mm-trigger" id="mmTrigger" type="button" aria-expanded="false" aria-haspopup="true" aria-controls="mmPanel">SERVICES<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button>
      <a href="/#work">CASE STUDIES</a>
      <a href="/blog">BLOG</a>
      <a href="/contact">CONTACT US</a>
    </div>`,
  mnavJump: `  <div class="mnav js-mnav">
    <a href="/">HOME</a>
    <a href="/#about">ABOUT US</a>
    <div id="mmMobile"></div>
    <a href="/#work">CASE STUDIES</a>
    <a href="/blog">BLOG</a>
    <a href="/contact">CONTACT US</a>
    <button class="btn btn-primary" type="button" data-jump>Get a Free Proposal</button>
  </div>`,
  mnavModal: `  <div class="mnav js-mnav">
    <a href="/">HOME</a>
    <a href="/#about">ABOUT US</a>
    <div id="mmMobile"></div>
    <a href="/#work">CASE STUDIES</a>
    <a href="/blog">BLOG</a>
    <a href="/contact">CONTACT US</a>
    <button class="btn btn-primary" type="button" data-modal>Get a Free Proposal</button>
  </div>`,
};

function patchNav(body, mnav) {
  body = body.replace(
    /<div class="nav-links">[\s\S]*?<\/div>\s*<div class="nav-right">/,
    `${NAV_PATCH.links}\n    <div class="nav-right">`
  );
  body = body.replace(
    /<div class="mnav js-mnav">[\s\S]*?<\/div>\s*(?=<\/div>\s*<\/nav>)/,
    `${mnav}\n`
  );
  return body;
}

const PERF_TAIL = `
/* page perf helpers — design unchanged */
.sec{ content-visibility:auto; contain-intrinsic-size:auto 800px; }
.ct-hero, .hs, #hero-1, #top, #faq, #why, #services-2 {
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
.ct-way-v{
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
.cta3 h2{
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
.sp-top h3{
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

async function buildContact() {
  const SRC = "c:\\Users\\Super\\Desktop\\TK FINAL\\Contact\\tekcroft-contact.html";
  const html = fs.readFileSync(SRC, "utf8");
  let css = extractStyles(html, [
    "ct-styles",
    "ct-hero-life",
    "cta3-styles",
    "foot-lift",
  ]);
  css = await rewriteUrls(css, "contact");
  css =
    `/* Contact page-only styles — shared chrome in tekcroft.css */\n` +
    css +
    PERF_TAIL +
    `
/* LCP: photo as <img>, not only CSS background */
.ct-shot{ background:none !important; overflow:hidden; }
.ct-shot img{
  width:100%; height:100%; object-fit:cover; object-position:50% 24%;
  display:block; transform:inherit;
}
`;
  fs.writeFileSync(path.join(ROOT, "app", "contact.css"), css);

  let body = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)[1]
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .trim();
  body = patchNav(body, NAV_PATCH.mnavJump);

  // Discover ct-shot file from css var
  const shot = (css.match(/--ct-shot:url\("([^"]+)"\)/) || [])[1] ||
    "/images/contact-ct-shot-cd2bc2b893.webp";
  body = body.replace(
    /<span class="ct-shot" aria-hidden="true"><\/span>/,
    `<span class="ct-shot" aria-hidden="true"><img src="${shot}" alt="" width="1600" height="900" decoding="async" fetchpriority="high"></span>`
  );
  fs.writeFileSync(path.join(ROOT, "lib", "contact-body.html"), body);
  fs.writeFileSync(
    path.join(ROOT, "lib", "contact-lcp.json"),
    JSON.stringify({ preload: shot }, null, 2)
  );

  const js = extractScripts(html, ["tb-script", "ft-script", "ct-hero-script"]);
  fs.writeFileSync(path.join(ROOT, "public", "tekcroft-contact.js"), js);

  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  const descMatch = html.match(/<meta name="description" content="([^"]*)"/i);
  fs.writeFileSync(
    path.join(ROOT, "lib", "contact-meta.json"),
    JSON.stringify(
      {
        title: titleMatch ? titleMatch[1].trim() : "Contact Us | Tekcroft",
        description: descMatch ? descMatch[1] : "",
        canonical: "https://www.tekcroft.com/contact",
      },
      null,
      2
    )
  );
  console.log("contact css", (css.length / 1024).toFixed(0), "KB; js", (js.length / 1024).toFixed(0), "KB");
}

async function buildEcommerce() {
  const SRC =
    "c:\\Users\\Super\\Desktop\\TK FINAL\\Services\\tekcroft-ecommerce-seo.html";
  const html = fs.readFileSync(SRC, "utf8");
  let css = extractStyles(html, [
    "hs-styles",
    "tb-styles",
    "hero-copy-styles",
    "svc-styles",
    "mpc-styles",
    "pf-styles",
    "wy-styles",
    "pb-styles",
    "faq-pics",
    "rhythm-styles",
    "hs-form-theme",
    "cn-refine",
  ]);
  // Only the ecommerce list layout rules at the end of cn-styles (not the
  // whole block from the first .svc-cn, which re-applies glass).
  const cn = html.match(/<style id="cn-styles">([\s\S]*?)<\/style>/i);
  if (cn) {
    const svcBit = cn[1].match(
      /\.svc-cn \.cn-card\{[\s\S]*?@media \(max-width:860px\)\{[\s\S]*?\}\s*\}/
    );
    if (svcBit) css += `\n\n/* === cn svc-cn layout === */\n${svcBit[0].trim()}`;
  }
  css = await rewriteUrls(css, "ecom");
  // FAQ white ground (user request) — keep
  css += `
#faq.faq{ background:#FFFFFF; --ground:#FFFFFF; --panel:var(--bg-alt); }
html[data-theme="dark"] #faq.faq{ background:var(--surface); --ground:var(--surface); }
#services-2.svc-cn{
  background:#FFFFFF !important; --ground:#FFFFFF; --panel:var(--bg-alt); border-block:0;
}
html[data-theme="dark"] #services-2.svc-cn{
  background:var(--surface) !important; --ground:var(--surface);
}
/* Homepage flat console — no glass (wins over any cn-styles leftovers) */
#services-2 .cn-plate::before{ display:none !important; }
#services-2 .cn-plate::after{
  background:
    radial-gradient(780px 440px at 50% 48%, rgba(0,0,0,.50) 0%, transparent 72%),
    linear-gradient(180deg, rgba(0,0,0,.72) 0%, rgba(0,0,0,.58) 42%,
                    rgba(0,0,0,.90) 100%) !important;}
#services-2 .cn-tab{
  background:transparent !important; backdrop-filter:none !important;
  -webkit-backdrop-filter:none !important; box-shadow:none !important;
  color:rgba(255,255,255,.70) !important;}
#services-2 .cn-tab.on{ color:#fff !important; background:transparent !important; text-shadow:none !important; }
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
  css =
    `/* Ecommerce SEO page-only — shared chrome in tekcroft.css */\n` +
    css +
    PERF_TAIL;
  fs.writeFileSync(path.join(ROOT, "app", "ecommerce-seo.css"), css);

  let body = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)[1]
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .trim();
  body = patchNav(body, NAV_PATCH.mnavJump);
  // hero img → shared optimized hero
  body = body.replace(
    /<div class="hs-bg" aria-hidden="true">[\s\S]*?<\/div>/,
    `<div class="hs-bg" aria-hidden="true"><img src="/images/hero-1.webp" width="1920" height="1080" alt="" decoding="async" fetchpriority="high"></div>`
  );
  body = body.replace(
    /<svg class="eh-sprite"/,
    '<svg class="eh-sprite" width="0" height="0" style="position:absolute;width:0;height:0;overflow:hidden"'
  );

  // externalize remaining body data uris
  let i = 0;
  body = await replaceAsync(body, /src="(data:image\/[^"]+)"/gi, async (m) => {
    i++;
    const file = await saveDataUri(m[1], `img${i}`, "ecom");
    return `src="${file}"`;
  });
  fs.writeFileSync(path.join(ROOT, "lib", "ecommerce-seo-body.html"), body);
  fs.writeFileSync(
    path.join(ROOT, "lib", "ecommerce-seo-lcp.json"),
    JSON.stringify({ preload: "/images/hero-1.webp" }, null, 2)
  );

  const js = extractScripts(html, [
    "tb-script",
    "eg-script",
    "ft-script",
    "faq-script",
    "cn-script",
    "pf-script",
  ]);
  fs.writeFileSync(path.join(ROOT, "public", "tekcroft-ecommerce-seo.js"), js);

  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  const descMatch = html.match(/<meta name="description" content="([^"]*)"/i);
  fs.writeFileSync(
    path.join(ROOT, "lib", "ecommerce-seo-meta.json"),
    JSON.stringify(
      {
        title: titleMatch ? titleMatch[1].trim() : "Ecommerce SEO Services | Tekcroft",
        description: descMatch ? descMatch[1] : "",
        canonical: "https://www.tekcroft.com/services/ecommerce-seo",
      },
      null,
      2
    )
  );
  console.log("ecommerce css", (css.length / 1024).toFixed(0), "KB; js", (js.length / 1024).toFixed(0), "KB");
}

/** Prefix selectors with a scope id so page rules beat shared homepage CSS. */
function scopeSelectors(cssText, scope) {
let out = "";
  let i = 0;
  const skipWsComments = () => {
    while (i < cssText.length) {
      if (/\s/.test(cssText[i])) {
        out += cssText[i];
        i++;
        continue;
      }
      if (cssText.startsWith("/*", i)) {
        const end = cssText.indexOf("*/", i + 2);
        const stop = end < 0 ? cssText.length : end + 2;
        out += cssText.slice(i, stop);
        i = stop;
        continue;
      }
      break;
    }
  };
  while (i < cssText.length) {
    skipWsComments();
    if (i >= cssText.length) break;

    if (cssText.startsWith("@keyframes", i) || cssText.startsWith("@-webkit-keyframes", i)) {
      const open = cssText.indexOf("{", i);
      let depth = 0;
      let j = open;
      for (; j < cssText.length; j++) {
        if (cssText[j] === "{") depth++;
        else if (cssText[j] === "}") {
          depth--;
          if (depth === 0) {
            j++;
            break;
          }
        }
      }
      out += cssText.slice(i, j);
      i = j;
      continue;
    }
    if (cssText.startsWith("@media", i) || cssText.startsWith("@supports", i)) {
      const open = cssText.indexOf("{", i);
      out += cssText.slice(i, open + 1);
      i = open + 1;
      let depth = 1;
      const start = i;
      while (i < cssText.length && depth > 0) {
        if (cssText.startsWith("/*", i)) {
          const end = cssText.indexOf("*/", i + 2);
          i = end < 0 ? cssText.length : end + 2;
          continue;
        }
        if (cssText[i] === "{") depth++;
        else if (cssText[i] === "}") depth--;
        i++;
      }
      const inner = cssText.slice(start, i - 1);
      out += scopeSelectors(inner, scope) + "}";
      continue;
    }
    const open = cssText.indexOf("{", i);
    if (open < 0) {
      out += cssText.slice(i);
      break;
    }
    const selectors = cssText
      .slice(i, open)
      .replace(/\/\*[\s\S]*?\*\//g, " ")
      .trim();
    let depth = 0;
    let j = open;
    for (; j < cssText.length; j++) {
      if (cssText[j] === "{") depth++;
      else if (cssText[j] === "}") {
        depth--;
        if (depth === 0) {
          j++;
          break;
        }
      }
    }
    const block = cssText.slice(open, j);
    // Preserve comments that sat between previous rule and this selector
    const rawSel = cssText.slice(i, open);
    const leadingComments = [...rawSel.matchAll(/\/\*[\s\S]*?\*\//g)]
      .map((m) => m[0])
      .join("");
    if (leadingComments) out += leadingComments;
    if (!selectors || selectors.startsWith("@")) {
      out += selectors + block;
    } else {
      const scoped = selectors
        .split(",")
        .map((sel) => {
          sel = sel.trim();
          if (!sel) return sel;
          if (sel.startsWith(":root") || sel.startsWith("html")) {
            return sel.replace(/(html(?:\[[^\]]*\])?)\s+/, `$1 ${scope} `);
          }
          if (sel === ".wn" || sel.startsWith(".wn.") || sel.startsWith(".wn:")) {
            return `${scope}${sel}`;
          }
          if (sel.startsWith(".wn")) {
            return `${scope} ${sel}`;
          }
          return `${scope} ${sel}`;
        })
        .join(", ");
      out += scoped + block;
    }
    i = j;
  }
  return out;
}


async function buildSeoAudit() {
  const SRC =
    "c:\\Users\\Super\\Desktop\\TK FINAL\\Services\\SEO AUDIT\\tekcroft-seo-audit (5).html";
  const html = fs.readFileSync(SRC, "utf8");

  // Tokens the standalone HTML keeps in tk-core; tekcroft.css does not define them.
  const tk = html.match(/<style id="tk-core">([\s\S]*?)<\/style>/i);
  let tokens = `/* === audit tokens (from tk-core) === */\n:root{\n  --veil:rgba(0,0,0,.78);\n  --disc:hsl(var(--brand-h) 92% 95%);\n}\nhtml[data-theme="dark"]{\n  --disc:rgba(0,150,213,.16);\n}\n`;
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

  let css = extractStyles(html, [
    "hs-styles",
    "tb-styles",
    "hero-copy-styles",
    "svc-styles",
    "mpc-styles",
    "pf-styles",
    "wa-styles",
    "vs-styles",
    "bl-styles",
    "wc-styles",
    "wk-styles",
    "faq-pics",
    "rhythm-styles",
    "hs-form-theme",
    "cn-styles",
    "cn-refine",
    "consistency",
    "foot-lift",
    "foot-final",
  ]);

  // Who Needs reuses .wn-* class names that homepage Why-Choose also uses in
  // tekcroft.css. Scope the audit block under #who so those rules cannot win.
  const wn = html.match(/<style id="wn-styles">([\s\S]*?)<\/style>/i);
  if (wn) {
    css += `\n\n/* === wn-styles (scoped #who — beat homepage .wn) === */\n${scopeSelectors(
      wn[1].trim(),
      "#who"
    )}`;
  }

  css = tokens + "\n" + css;
  css = await rewriteUrls(css, "audit");

  css += `
/* Neutralize homepage Why-Choose .wn chrome that still matches #who descendants */
#who.wn{
  display:block !important;
  grid-template-columns:none !important;
  align-items:stretch !important;
  gap:0 !important;
  margin-top:0 !important;
  position:relative;
  overflow:hidden;
}
#who .wn-body{
  background:transparent !important;
  border-radius:0 !important;
  box-shadow:none !important;
}
#who .wn-card{
  margin-top:0 !important;
}
#who .wn-bar i{
  display:inline-block !important;
  height:8px !important;
  width:8px !important;
  transform:none !important;
  background:#FF5F57 !important;
}
#who .wn-bar i:nth-child(2){ background:#FEBC2E !important; }
#who .wn-bar i:nth-child(3){ background:#28C840 !important; }
html[data-theme="light"] #who .wn-card{
  background:var(--surface) !important;
}

/* Beat homepage section fills (.revs/.wk/.bl-sec/.faq) so the page rhythm
   can alternate white ↔ tint like ecommerce-seo / homepage. */
#proof,
#who,
#services-2,
#marketplaces,
#vs,
#process,
#whyus,
#receive,
#reviews,
#work,
#faq,
#contact{
  background:var(--ground) !important;
  border-block:0 !important;
}
#services-2.svc-cn{ border-block:0; }
#services-2 .cn-plate::before{ display:none !important; }
#services-2 .cn-plate::after{
  background:
    radial-gradient(780px 440px at 50% 48%, rgba(0,0,0,.50) 0%, transparent 72%),
    linear-gradient(180deg, rgba(0,0,0,.72) 0%, rgba(0,0,0,.58) 42%,
                    rgba(0,0,0,.90) 100%) !important;}
#services-2 .cn-tab{
  background:transparent !important; backdrop-filter:none !important;
  -webkit-backdrop-filter:none !important; box-shadow:none !important;
  color:rgba(255,255,255,.70) !important;}
#services-2 .cn-tab.on{ color:#fff !important; background:transparent !important; text-shadow:none !important; }
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
  css =
    `/* SEO Audit Services — design from tekcroft-seo-audit HTML; chrome in tekcroft.css */\n` +
    css +
    PERF_TAIL;
  fs.writeFileSync(path.join(ROOT, "app", "seo-audit-services.css"), css);

  let body = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)[1]
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .trim();
  body = patchNav(body, NAV_PATCH.mnavJump);
  body = body.replace(
    /<div class="hs-bg" aria-hidden="true">[\s\S]*?<\/div>/,
    `<div class="hs-bg" aria-hidden="true"><img src="/images/hero-1.webp" width="1920" height="1080" alt="" decoding="async" fetchpriority="high"></div>`
  );
  body = body.replace(
    /<svg class="eh-sprite"/,
    '<svg class="eh-sprite" width="0" height="0" style="position:absolute;width:0;height:0;overflow:hidden"'
  );

  let i = 0;
  body = await replaceAsync(body, /src="(data:image\/[^"]+)"/gi, async (m) => {
    i++;
    const file = await saveDataUri(m[1], `img${i}`, "audit");
    return `src="${file}"`;
  });
  fs.writeFileSync(path.join(ROOT, "lib", "seo-audit-services-body.html"), body);
  fs.writeFileSync(
    path.join(ROOT, "lib", "seo-audit-services-lcp.json"),
    JSON.stringify({ preload: "/images/hero-1.webp" }, null, 2)
  );

  const js = extractScripts(html, [
    "tb-script",
    "eg-script",
    "ft-script",
    "faq-script",
    "cn-script",
    "pf-script",
    "wc-script",
    "wk-script",
  ]);
  fs.writeFileSync(path.join(ROOT, "public", "tekcroft-seo-audit-services.js"), js);

  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  const descMatch = html.match(/<meta name="description" content="([^"]*)"/i);
  fs.writeFileSync(
    path.join(ROOT, "lib", "seo-audit-services-meta.json"),
    JSON.stringify(
      {
        title: titleMatch ? titleMatch[1].trim() : "SEO Audit Services | Tekcroft",
        description: descMatch ? descMatch[1] : "",
        canonical: "https://www.tekcroft.com/services/seo-audit-services",
      },
      null,
      2
    )
  );
  console.log(
    "seo-audit css",
    (css.length / 1024).toFixed(0),
    "KB; js",
    (js.length / 1024).toFixed(0),
    "KB"
  );
}

async function buildTechnicalSeo() {
  const SRC =
    "c:\\Users\\Super\\Desktop\\TK FINAL\\Services\\Technical SEO Service\\tekcroft-technical-seo (10).html";
  const html = fs.readFileSync(SRC, "utf8");

  const tk = html.match(/<style id="tk-core">([\s\S]*?)<\/style>/i);
  let tokens = `/* === technical-seo tokens (from tk-core) === */\n:root{\n  --veil:rgba(0,0,0,.78);\n  --disc:hsl(var(--brand-h) 92% 95%);\n}\nhtml[data-theme="dark"]{\n  --disc:rgba(0,150,213,.16);\n}\n`;
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

  let css = extractStyles(html, [
    "hs-styles",
    "tb-styles",
    "hero-copy-styles",
    "svc-styles",
    "mpc-styles",
    "pf-styles",
    "eg-styles",
    "wc-styles",
    "wk-styles",
    "sg-styles",
    "cn-subs",
    "wc-five",
    "pf-three",
    "hx-styles",
    "gt-styles",
    "faq-pics",
    "rhythm-styles",
    "hs-form-theme",
    "cn-styles",
    "cn-refine",
    "consistency",
    "consistency-2",
    "hx-trace",
    "foot-lift",
    "foot-final",
  ]);

  css = tokens + "\n" + css;
  css = await rewriteUrls(css, "tech");

  css += `
/* Beat homepage section fills so this page's rhythm --ground wins */
#proof,
#signs,
#services-2,
#whyus,
#process,
#get,
#crawl-check,
#platforms,
#ai,
#work,
#reviews,
#faq,
#contact{
  background:var(--ground) !important;
  border-block:0 !important;
}
#services-2.svc-cn{ border-block:0; }
#services-2 .cn-plate::before{ display:none !important; }
#services-2 .cn-plate::after{
  background:
    radial-gradient(780px 440px at 50% 48%, rgba(0,0,0,.50) 0%, transparent 72%),
    linear-gradient(180deg, rgba(0,0,0,.72) 0%, rgba(0,0,0,.58) 42%,
                    rgba(0,0,0,.90) 100%) !important;}
#services-2 .cn-tab{
  background:transparent !important; backdrop-filter:none !important;
  -webkit-backdrop-filter:none !important; box-shadow:none !important;
  color:rgba(255,255,255,.70) !important;}
#services-2 .cn-tab.on{ color:#fff !important; background:transparent !important; text-shadow:none !important; }
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
  css =
    `/* Technical SEO Services — design from tekcroft-technical-seo HTML; chrome in tekcroft.css */\n` +
    css +
    PERF_TAIL;
  fs.writeFileSync(path.join(ROOT, "app", "technical-seo.css"), css);

  let body = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)[1]
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .trim();
  body = patchNav(body, NAV_PATCH.mnavJump);
  body = body.replace(
    /<div class="hs-bg" aria-hidden="true">[\s\S]*?<\/div>/,
    `<div class="hs-bg" aria-hidden="true"><img src="/images/hero-1.webp" width="1920" height="1080" alt="" decoding="async" fetchpriority="high"></div>`
  );
  body = body.replace(
    /<svg class="eh-sprite"/,
    '<svg class="eh-sprite" width="0" height="0" style="position:absolute;width:0;height:0;overflow:hidden"'
  );

  let i = 0;
  body = await replaceAsync(body, /src="(data:image\/[^"]+)"/gi, async (m) => {
    i++;
    const file = await saveDataUri(m[1], `img${i}`, "tech");
    return `src="${file}"`;
  });
  fs.writeFileSync(path.join(ROOT, "lib", "technical-seo-body.html"), body);
  fs.writeFileSync(
    path.join(ROOT, "lib", "technical-seo-lcp.json"),
    JSON.stringify({ preload: "/images/hero-1.webp" }, null, 2)
  );

  let js = extractScripts(html, [
    "tb-script",
    "walk-script",
    "ft-script",
    "faq-script",
    "cn-script",
    "wc-script",
    "wk-script",
    "pf-script",
    "hx-wire-script",
  ]);
  // Harden FAQ like other service pages (document delegation)
  const faqHard = `
/* === faq-script (hardened) === */
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
})();
`;
  js = js.replace(
    /\/\* === faq-script === \*\/[\s\S]*?(?=\/\* === |\Z)/,
    faqHard.trim() + "\n\n"
  );
  fs.writeFileSync(path.join(ROOT, "public", "tekcroft-technical-seo.js"), js);

  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  const descMatch = html.match(/<meta name="description" content="([^"]*)"/i);
  fs.writeFileSync(
    path.join(ROOT, "lib", "technical-seo-meta.json"),
    JSON.stringify(
      {
        title: titleMatch
          ? titleMatch[1].trim()
          : "Technical SEO Services | Tekcroft",
        description: descMatch ? descMatch[1] : "",
        canonical: "https://www.tekcroft.com/services/technical-seo",
      },
      null,
      2
    )
  );
  console.log(
    "technical-seo css",
    (css.length / 1024).toFixed(0),
    "KB; js",
    (js.length / 1024).toFixed(0),
    "KB"
  );
}

async function buildLocalSeo() {
  const SRC =
    "c:\\Users\\Super\\Desktop\\TK FINAL\\Services\\Local SEO Services\\tekcroft-local-seo (4).html";
  const html = fs.readFileSync(SRC, "utf8");

  const tk = html.match(/<style id="tk-core">([\s\S]*?)<\/style>/i);
  let tokens = `/* === local-seo tokens (from tk-core) === */\n:root{\n  --veil:rgba(0,0,0,.78);\n  --disc:hsl(var(--brand-h) 92% 95%);\n}\nhtml[data-theme="dark"]{\n  --disc:rgba(0,150,213,.16);\n}\n`;
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

  let css = extractStyles(html, [
    "hs-styles",
    "tb-styles",
    "hero-copy-styles",
    "svc-styles",
    "svc-copy",
    "ws-styles",
    "cl-styles",
    "pf-styles",
    "vs-styles",
    "ind-marks",
    "lo-styles",
    "eg-styles",
    "eg-four",
    "lp-styles",
    "wc-styles",
    "faq-pics",
    "rhythm-styles",
    "hs-form-theme",
    "cn-styles",
    "cn-refine",
    "consistency",
    "foot-lift",
    "foot-final",
  ]);

  css = tokens + "\n" + css;
  css = await rewriteUrls(css, "local");

  css += `
/* Complete section grounds — source rhythm omitted some ids on this page */
#proof,#industries,#reviews,#process,#faq{
  --ground:var(--bg-alt); --panel:var(--surface);
}
#what,#services-2,#pack,#apart,#contact{
  --ground:var(--surface); --panel:var(--bg-alt);
}
#clients{ --ground:var(--bg); --panel:var(--surface); }
/* Comparison table sits on the dark photo section but the card itself is white */
#fit{
  --ground:var(--bg-alt);
  --panel:#FFFFFF;
  --vs-veil:rgba(0,0,0,.78);
}
html[data-theme="dark"] #fit{
  --panel:var(--surface);
}

/* Table colors match the reference: white card, brand-blue frame,
   green yes discs, red no, amber partial */
#fit .vs-table{
  background:#FFFFFF;
  border-color:#E8EEF3;
  box-shadow:0 22px 48px -28px rgba(12,28,50,.28);
}
html[data-theme="dark"] #fit .vs-table{ background:var(--surface); border-color:var(--border); }
#fit .vs-table th,
#fit .vs-table td{ border-bottom-color:#EEF2F6; }
#fit .vs-h-blank{ color:#8B95A5; }
#fit .vs-k{ color:#0C1C32; }
#fit .vs-h{ color:#0C1C32; }
#fit .vs-hic{
  background:hsl(198 100% 94%);
  color:var(--primary);
}
#fit .vs-h.is-us .vs-hic{
  background:var(--primary);
  color:#fff;
}
#fit .vs-v{ color:#5B6575; }
#fit .c-us .vs-v{ color:#0C1C32; font-weight:600; }
#fit .vs-m.is-yes{ color:#2FBF6B; }
#fit .c-us .vs-m{
  background:#E7F8EE;
  color:#2FBF6B;
}
#fit .vs-m.is-no{ color:#E24B43; }
#fit .vs-m.is-part{ color:#F0A11A; }
#fit .vs-halo{
  border-color:var(--primary);
  background:hsl(198 100% 50% / .04);
  box-shadow:0 20px 40px -28px hsl(198 100% 32% / .55);
}
#fit .vs-badge{
  background:var(--primary);
  color:#fff;
}
html[data-theme="dark"] #fit .vs-k,
html[data-theme="dark"] #fit .vs-h,
html[data-theme="dark"] #fit .c-us .vs-v{ color:var(--text); }
html[data-theme="dark"] #fit .vs-v{ color:var(--text-2); }
html[data-theme="dark"] #fit .vs-h-blank{ color:var(--subtle); }
html[data-theme="dark"] #fit .c-us .vs-m{
  background:rgba(47,191,107,.22);
  color:#3DDB7E;
}
html[data-theme="dark"] #fit .vs-m.is-yes{ color:#3DDB7E; }

#proof,
#what,
#services-2,
#industries,
#pack,
#reviews,
#apart,
#process,
#clients,
#fit,
#faq,
#contact{
  background:var(--ground) !important;
  border-block:0 !important;
}
#services-2.svc-cn{ border-block:0; }
#services-2 .cn-plate::before{ display:none !important; }
#services-2 .cn-plate::after{
  background:
    radial-gradient(780px 440px at 50% 48%, rgba(0,0,0,.50) 0%, transparent 72%),
    linear-gradient(180deg, rgba(0,0,0,.72) 0%, rgba(0,0,0,.58) 42%,
                    rgba(0,0,0,.90) 100%) !important;}
#services-2 .cn-tab{
  background:transparent !important; backdrop-filter:none !important;
  -webkit-backdrop-filter:none !important; box-shadow:none !important;
  color:rgba(255,255,255,.70) !important;}
#services-2 .cn-tab.on{ color:#fff !important; background:transparent !important; text-shadow:none !important; }
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
  css =
    `/* Local SEO Services — design from tekcroft-local-seo HTML; chrome in tekcroft.css */\n` +
    css +
    PERF_TAIL;
  fs.writeFileSync(path.join(ROOT, "app", "local-seo.css"), css);

  let body = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)[1]
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .trim();
  body = patchNav(body, NAV_PATCH.mnavJump);
  body = body.replace(
    /<div class="hs-bg" aria-hidden="true">[\s\S]*?<\/div>/,
    `<div class="hs-bg" aria-hidden="true"><img src="/images/hero-1.webp" width="1920" height="1080" alt="" decoding="async" fetchpriority="high"></div>`
  );
  body = body.replace(
    /<svg class="eh-sprite"/,
    '<svg class="eh-sprite" width="0" height="0" style="position:absolute;width:0;height:0;overflow:hidden"'
  );

  let i = 0;
  body = await replaceAsync(body, /src="(data:image\/[^"]+)"/gi, async (m) => {
    i++;
    const file = await saveDataUri(m[1], `img${i}`, "local");
    return `src="${file}"`;
  });
  fs.writeFileSync(path.join(ROOT, "lib", "local-seo-body.html"), body);
  fs.writeFileSync(
    path.join(ROOT, "lib", "local-seo-lcp.json"),
    JSON.stringify({ preload: "/images/hero-1.webp" }, null, 2)
  );

  let js = extractScripts(html, [
    "tb-script",
    "ft-script",
    "faq-script",
    "cn-script",
    "ws-script",
    "pf-script",
    "eg-script",
  ]);
  const faqHard = `
/* === faq-script (hardened) === */
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
})();
`;
  js = js.replace(
    /\/\* === faq-script === \*\/[\s\S]*?(?=\/\* === |\Z)/,
    faqHard.trim() + "\n\n"
  );
  fs.writeFileSync(path.join(ROOT, "public", "tekcroft-local-seo.js"), js);

  // Source <title>/<description> were left as On-Page copy; page content is Local SEO.
  const ledeMatch = html.match(/class="hs-lede[^"]*"[^>]*>([\s\S]*?)<\/p>/i);
  let description =
    "TekCroft's local SEO services fix Google Business Profile gaps, inconsistent citations, and thin content that hold back local rankings.";
  if (ledeMatch) {
    description = ledeMatch[1]
      .replace(/<[^>]+>/g, "")
      .replace(/&rsquo;/g, "'")
      .replace(/&mdash;/g, "—")
      .replace(/&amp;/g, "&")
      .replace(/\s+/g, " ")
      .trim();
  }
  fs.writeFileSync(
    path.join(ROOT, "lib", "local-seo-meta.json"),
    JSON.stringify(
      {
        title: "Local SEO Services | Tekcroft",
        description,
        canonical: "https://www.tekcroft.com/services/local-seo",
      },
      null,
      2
    )
  );
  console.log(
    "local-seo css",
    (css.length / 1024).toFixed(0),
    "KB; js",
    (js.length / 1024).toFixed(0),
    "KB"
  );
}

async function buildOnPageSeo() {
  const SRC =
    "c:\\Users\\Super\\Desktop\\TK FINAL\\Services\\ONpage\\tekcroft-onpage-seo (6).html";
  const html = fs.readFileSync(SRC, "utf8");

  const tk = html.match(/<style id="tk-core">([\s\S]*?)<\/style>/i);
  let tokens = `/* === on-page-seo tokens (from tk-core) === */\n:root{\n  --veil:rgba(0,0,0,.78);\n  --disc:hsl(var(--brand-h) 92% 95%);\n}\nhtml[data-theme="dark"]{\n  --disc:rgba(0,150,213,.16);\n}\n`;
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

  let css = extractStyles(html, [
    "hs-styles",
    "tb-styles",
    "hero-copy-styles",
    "svc-styles",
    "svc-copy",
    "ws-styles",
    "cl-styles",
    "av1-styles",
    "pf-styles",
    "sp-styles",
    "vs-styles",
    "ind-marks",
    "fw-styles",
    "eg-styles",
    "eg-four",
    "faq-pics",
    "rhythm-styles",
    "hs-form-theme",
    "cn-styles",
    "cn-refine",
    "consistency",
    "foot-lift",
    "foot-final",
  ]);

  css = tokens + "\n" + css;
  css = await rewriteUrls(css, "onpage");

  css += `
/* Rhythm omitted #apart; keep alternation + beat homepage fills */
#apart{ --ground:var(--surface); --panel:var(--bg-alt); }
#proof,
#services-2,
#industries,
#scope,
#apart,
#framework,
#process,
#ai-search,
#clients,
#fit,
#faq,
#contact{
  background:var(--ground) !important;
  border-block:0 !important;
}
#services-2.svc-cn{ border-block:0; }
#services-2 .cn-plate::before{ display:none !important; }
#services-2 .cn-plate::after{
  background:
    radial-gradient(780px 440px at 50% 48%, rgba(0,0,0,.50) 0%, transparent 72%),
    linear-gradient(180deg, rgba(0,0,0,.72) 0%, rgba(0,0,0,.58) 42%,
                    rgba(0,0,0,.90) 100%) !important;}
#services-2 .cn-tab{
  background:transparent !important; backdrop-filter:none !important;
  -webkit-backdrop-filter:none !important; box-shadow:none !important;
  color:rgba(255,255,255,.70) !important;}
#services-2 .cn-tab.on{ color:#fff !important; background:transparent !important; text-shadow:none !important; }
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
  css =
    `/* On-Page SEO Services — design from tekcroft-onpage-seo HTML; chrome in tekcroft.css */\n` +
    css +
    PERF_TAIL;
  fs.writeFileSync(path.join(ROOT, "app", "on-page-seo.css"), css);

  let body = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)[1]
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .trim();
  body = patchNav(body, NAV_PATCH.mnavJump);
  body = body.replace(
    /<div class="hs-bg" aria-hidden="true">[\s\S]*?<\/div>/,
    `<div class="hs-bg" aria-hidden="true"><img src="/images/hero-1.webp" width="1920" height="1080" alt="" decoding="async" fetchpriority="high"></div>`
  );
  body = body.replace(
    /<svg class="eh-sprite"/,
    '<svg class="eh-sprite" width="0" height="0" style="position:absolute;width:0;height:0;overflow:hidden"'
  );

  let i = 0;
  body = await replaceAsync(body, /src="(data:image\/[^"]+)"/gi, async (m) => {
    i++;
    const file = await saveDataUri(m[1], `img${i}`, "onpage");
    return `src="${file}"`;
  });
  fs.writeFileSync(path.join(ROOT, "lib", "on-page-seo-body.html"), body);
  fs.writeFileSync(
    path.join(ROOT, "lib", "on-page-seo-lcp.json"),
    JSON.stringify({ preload: "/images/hero-1.webp" }, null, 2)
  );

  let js = extractScripts(html, [
    "tb-script",
    "ft-script",
    "faq-script",
    "cn-script",
    "fwv-script",
    "ws-script",
    "av1-script",
    "pf-script",
    "eg-script",
  ]);
  const faqHard = `
/* === faq-script (hardened) === */
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
})();
`;
  js = js.replace(
    /\/\* === faq-script === \*\/[\s\S]*?(?=\/\* === |\Z)/,
    faqHard.trim() + "\n\n"
  );
  fs.writeFileSync(path.join(ROOT, "public", "tekcroft-on-page-seo.js"), js);

  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  const descMatch = html.match(/<meta name="description" content="([^"]*)"/i);
  fs.writeFileSync(
    path.join(ROOT, "lib", "on-page-seo-meta.json"),
    JSON.stringify(
      {
        title: titleMatch
          ? titleMatch[1].trim()
          : "On-Page SEO Services | Tekcroft",
        description: descMatch ? descMatch[1] : "",
        canonical: "https://www.tekcroft.com/services/on-page-seo",
      },
      null,
      2
    )
  );
  console.log(
    "on-page-seo css",
    (css.length / 1024).toFixed(0),
    "KB; js",
    (js.length / 1024).toFixed(0),
    "KB"
  );
}

async function buildGbp() {
  const SRC =
    "c:\\Users\\Super\\Desktop\\TK FINAL\\Services\\Google Business Profile Optimization\\tekcroft-gmb (5).html";
  const html = fs.readFileSync(SRC, "utf8");

  const tk = html.match(/<style id="tk-core">([\s\S]*?)<\/style>/i);
  let tokens = `/* === gbp tokens (from tk-core) === */\n:root{\n  --veil:rgba(0,0,0,.78);\n  --disc:hsl(var(--brand-h) 92% 95%);\n}\nhtml[data-theme="dark"]{\n  --disc:rgba(0,150,213,.16);\n}\n`;
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

  let css = extractStyles(html, [
    "hs-styles",
    "tb-styles",
    "hero-copy-styles",
    "svc-styles",
    "svc-copy",
    "ws-styles",
    "ws-four",
    "cl-styles",
    "pf-styles",
    "pf-gbp",
    "vs-styles",
    "vs-two",
    "ind-marks",
    "lo-styles",
    "eg-styles",
    "eg-four",
    "eg-expect",
    "lp-styles",
    "wc-styles",
    "gw-styles",
    "gw-photo",
    "cn-three",
    "faq-pics",
    "rhythm-styles",
    "hs-form-theme",
    "cn-styles",
    "cn-refine",
    "consistency",
    "foot-lift",
    "foot-final",
  ]);

  // Source CSS still targets #what; the section id on this page is #gbp-what
  css = css.replace(/#what\b/g, "#gbp-what");

  css = tokens + "\n" + css;
  css = await rewriteUrls(css, "gbp");

  css += `
/* Complete section grounds — white / tint alternation like other service pages */
#proof,#services-2,#apart,#faq{
  --ground:var(--bg-alt); --panel:var(--surface);
}
#gbp-what,#industries,#process,#reviews,#contact{
  --ground:var(--surface); --panel:var(--bg-alt);
}
#fit{
  --ground:var(--bg-alt);
  --panel:#FFFFFF;
  --vs-veil:rgba(0,0,0,.78);
}
html[data-theme="dark"] #fit{ --panel:var(--surface); }

/* Process + GBP cards: white in light, theme surface in dark (readable text) */
#process .eg-card,
#process .eg-card::after{
  background:#fff;
  border-color:var(--border);
}
#process .eg-card.on{
  border-color:var(--primary);
}
#process .eg-when{
  color:var(--primary);
  background:var(--brand-soft);
}
#process .eg-exp{
  background:#fff;
  border-color:var(--border);
}
#process .eg-exp-list::before{
  background:linear-gradient(90deg, var(--primary), hsl(var(--brand-h) 100% 50% / .15));
}
#process .eg-exp-list li::before{
  background:#fff;
  border-color:var(--primary);
}
#process .eg-exp-list b{ color:var(--primary); }
#process .eg-exp-note{
  background:var(--brand-soft);
  border-top-color:var(--border-soft);
  color:var(--text-2);
}
#process .eg-exp-note svg{ color:var(--primary); }

#gbp-what .gw-block{
  background:#fff;
  border-color:var(--border);
}
#gbp-what .gw-ic{
  background:#fff;
  color:var(--primary);
}
#gbp-what .gw-n,
#gbp-what .gw-block p b,
#gbp-what .gw-eyebrow,
#gbp-what .gw-say h2 em,
#gbp-what .gw-say > p b{
  color:var(--primary);
}
#gbp-what .gw-rule{ background:var(--primary); }
#gbp-what .gw-block:hover .gw-ic{
  background:var(--primary);
  color:#fff;
}

/* Dark mode: never keep white plates under light theme ink */
html[data-theme="dark"] #process .eg-card,
html[data-theme="dark"] #process .eg-card::after,
html[data-theme="dark"] #process .eg-exp,
html[data-theme="dark"] #process .eg-exp-list li::before,
html[data-theme="dark"] #gbp-what .gw-block{
  background:var(--surface);
  border-color:var(--border);
}
html[data-theme="dark"] #process .eg-when,
html[data-theme="dark"] #process .eg-exp-note{
  background:var(--brand-soft);
}
html[data-theme="dark"] #gbp-what .gw-ic{
  background:var(--gw-soft);
  color:var(--primary);
}
html[data-theme="dark"] #process .eg-card h3,
html[data-theme="dark"] #process .eg-exp-lab,
html[data-theme="dark"] #gbp-what .gw-block h3{
  color:var(--text);
}
html[data-theme="dark"] #process .eg-card p,
html[data-theme="dark"] #process .eg-exp-head p,
html[data-theme="dark"] #process .eg-exp-list p,
html[data-theme="dark"] #process .eg-exp-note,
html[data-theme="dark"] #gbp-what .gw-block p{
  color:var(--text-2);
}

#proof,
#gbp-what,
#services-2,
#industries,
#apart,
#process,
#fit,
#reviews,
#faq,
#contact{
  background:var(--ground) !important;
  border-block:0 !important;
}
#services-2.svc-cn{ border-block:0; }
#services-2 .cn-plate::before{ display:none !important; }
#services-2 .cn-plate::after{
  background:
    radial-gradient(780px 440px at 50% 48%, rgba(0,0,0,.50) 0%, transparent 72%),
    linear-gradient(180deg, rgba(0,0,0,.72) 0%, rgba(0,0,0,.58) 42%,
                    rgba(0,0,0,.90) 100%) !important;}
#services-2 .cn-tab{
  background:transparent !important; backdrop-filter:none !important;
  -webkit-backdrop-filter:none !important; box-shadow:none !important;
  color:rgba(255,255,255,.70) !important;}
#services-2 .cn-tab.on{ color:#fff !important; background:transparent !important; text-shadow:none !important; }
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
  css =
    `/* Google Business Profile Optimization — design from tekcroft-gmb HTML; chrome in tekcroft.css */\n` +
    css +
    PERF_TAIL;
  fs.writeFileSync(
    path.join(ROOT, "app", "google-business-profile-optimization.css"),
    css
  );

  let body = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)[1]
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .trim();
  body = patchNav(body, NAV_PATCH.mnavJump);
  body = body.replace(
    /<div class="hs-bg" aria-hidden="true">[\s\S]*?<\/div>/,
    `<div class="hs-bg" aria-hidden="true"><img src="/images/hero-1.webp" width="1920" height="1080" alt="" decoding="async" fetchpriority="high"></div>`
  );
  body = body.replace(
    /<svg class="eh-sprite"/,
    '<svg class="eh-sprite" width="0" height="0" style="position:absolute;width:0;height:0;overflow:hidden"'
  );

  let i = 0;
  body = await replaceAsync(body, /src="(data:image\/[^"]+)"/gi, async (m) => {
    i++;
    const file = await saveDataUri(m[1], `img${i}`, "gbp");
    return `src="${file}"`;
  });
  fs.writeFileSync(
    path.join(ROOT, "lib", "google-business-profile-optimization-body.html"),
    body
  );
  fs.writeFileSync(
    path.join(ROOT, "lib", "google-business-profile-optimization-lcp.json"),
    JSON.stringify({ preload: "/images/hero-1.webp" }, null, 2)
  );

  let js = extractScripts(html, [
    "tb-script",
    "ft-script",
    "faq-script",
    "cn-script",
    "ws-script",
    "pf-script",
    "eg-script",
  ]);
  const faqHard = `
/* === faq-script (hardened) === */
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
})();
`;
  js = js.replace(
    /\/\* === faq-script === \*\/[\s\S]*?(?=\/\* === |\Z)/,
    faqHard.trim() + "\n\n"
  );
  fs.writeFileSync(
    path.join(ROOT, "public", "tekcroft-google-business-profile-optimization.js"),
    js
  );

  // Source <title>/<description> were left as On-Page copy; use hero lede + GBP title.
  const ledeMatch = html.match(/class="hs-lede[^"]*"[^>]*>([\s\S]*?)<\/p>/i);
  let description =
    "Tekcroft's Google Business Profile optimization service is built to get you into the Google 3-pack and keep you there — more Maps visibility, calls, and direction requests.";
  if (ledeMatch) {
    description = ledeMatch[1]
      .replace(/<[^>]+>/g, "")
      .replace(/&rsquo;/g, "'")
      .replace(/&ldquo;/g, '"')
      .replace(/&rdquo;/g, '"')
      .replace(/&mdash;/g, "—")
      .replace(/&amp;/g, "&")
      .replace(/\s+/g, " ")
      .trim();
  }
  fs.writeFileSync(
    path.join(ROOT, "lib", "google-business-profile-optimization-meta.json"),
    JSON.stringify(
      {
        title: "Google Business Profile Optimization | Tekcroft",
        description,
        canonical:
          "https://www.tekcroft.com/services/google-business-profile-optimization",
      },
      null,
      2
    )
  );
  console.log(
    "gbp css",
    (css.length / 1024).toFixed(0),
    "KB; js",
    (js.length / 1024).toFixed(0),
    "KB"
  );
}

const target = process.argv[2] || "all";
if (target === "all") {
  await buildContact();
  await buildEcommerce();
  await buildSeoAudit();
  await buildTechnicalSeo();
  await buildLocalSeo();
  await buildOnPageSeo();
  await buildGbp();
} else if (target === "contact") {
  await buildContact();
} else if (target === "ecommerce") {
  await buildEcommerce();
} else if (target === "seo-audit") {
  await buildSeoAudit();
} else if (target === "technical-seo") {
  await buildTechnicalSeo();
} else if (target === "local-seo") {
  await buildLocalSeo();
} else if (target === "on-page-seo") {
  await buildOnPageSeo();
} else if (target === "gbp" || target === "google-business-profile-optimization") {
  await buildGbp();
} else {
  console.error("Unknown target:", target);
  process.exit(1);
}
console.log("Done slim service pages.");
