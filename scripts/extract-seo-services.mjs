/**
 * Extract tekcroft-seo-services.html → /services/seo-services
 * - Images → public/images/seo-services/
 * - CSS scoped under #seo-services-page (no cross-page leak)
 * - Site nav + site-footer.html (file chrome not copied as shared)
 * - Page JS without mm-script (Homepage loads shared mega menu)
 * Run: node scripts/extract-seo-services.mjs
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC =
  process.env.TEKCROFT_SEO_SERVICES_HTML ||
  "C:/Users/Super/Downloads/tekcroft-seo-services.html";
const IMG_DIR = path.join(ROOT, "public", "images", "seo-services");
const PREFIX = "seo-svc";
const SCOPE = "#seo-services-page";

fs.mkdirSync(IMG_DIR, { recursive: true });

/** Style blocks that are mega-menu / footer chrome — skip (site handles these) */
const SKIP_STYLE_IDS = new Set([
  "mm-styles",
  "mm-veil-lighter",
  "mm-bottom-copy",
  "mm-core-pills",
  "mm-core-strong",
  "mm-spacing",
  "mm-core-v3",
  "mm-core-fit",
  "mm-current",
  "mm-cta2",
  "foot-styles",
  "foot-lift",
  "foot-final",
]);

/** Scripts handled by Homepage / shared mm — skip */
const SKIP_SCRIPT_IDS = new Set([
  "mm-script",
  "mm-core-icons",
  "mm-current-js",
]);

function hashBuf(buf) {
  return crypto.createHash("sha1").update(buf).digest("hex").slice(0, 10);
}

async function saveDataUri(dataUri, hint) {
  const m = dataUri.match(/^data:image\/([\w+.-]+);base64,(.+)$/i);
  if (!m) return null;
  const subtype = m[1].toLowerCase();
  const buf = Buffer.from(m[2], "base64");
  const h = hashBuf(buf);

  if (subtype.includes("svg")) {
    const file = `${PREFIX}-${hint}-${h}.svg`;
    const dest = path.join(IMG_DIR, file);
    if (!fs.existsSync(dest)) fs.writeFileSync(dest, buf);
    return `/images/seo-services/${file}`;
  }

  const maxW = hint.includes("hero")
    ? 1920
    : hint.includes("shot") || hint.includes("cta") || hint.includes("faq")
      ? 1400
      : hint.startsWith("css") || hint.startsWith("img")
        ? 1200
        : 800;
  const file = `${PREFIX}-${hint}-${h}.webp`;
  const dest = path.join(IMG_DIR, file);
  if (!fs.existsSync(dest)) {
    let quality = 82;
    let out;
    let width = maxW;
    for (;;) {
      let pipeline = sharp(buf, { failOn: "none" }).rotate();
      const meta = await sharp(buf, { failOn: "none" }).metadata();
      if ((meta.width || width) > width) {
        pipeline = sharp(buf, { failOn: "none" })
          .rotate()
          .resize({ width, withoutEnlargement: true });
      }
      out = await pipeline.webp({ quality, effort: 6 }).toBuffer();
      if (out.length <= 80 * 1024 || quality <= 50) break;
      if (quality > 60) quality -= 6;
      else if (width > 720) {
        width -= 80;
        quality = 72;
      } else quality -= 4;
    }
    fs.writeFileSync(dest, out);
  }
  return `/images/seo-services/${file}`;
}

async function replaceAsync(str, re, fn) {
  const parts = [];
  let last = 0;
  let m;
  const r = new RegExp(
    re.source,
    re.flags.includes("g") ? re.flags : re.flags + "g"
  );
  while ((m = r.exec(str))) {
    parts.push(str.slice(last, m.index));
    parts.push(await fn(m));
    last = m.index + m[0].length;
  }
  parts.push(str.slice(last));
  return parts.join("");
}

/** Prefix selectors so page CSS cannot leak sitewide */
function scopeCss(css, scope) {
  const blocks = [];
  let i = 0;
  const n = css.length;

  function skipComment(s, idx) {
    if (s.startsWith("/*", idx)) {
      const end = s.indexOf("*/", idx + 2);
      return end < 0 ? s.length : end + 2;
    }
    return idx;
  }

  while (i < n) {
    while (i < n && /\s/.test(css[i])) i++;
    // Preserve standalone comments; never treat them as selectors
    while (i < n && css.startsWith("/*", i)) {
      const c0 = i;
      i = skipComment(css, i);
      blocks.push(css.slice(c0, i));
      while (i < n && /\s/.test(css[i])) i++;
    }
    if (i >= n) break;

    // @keyframes / @font-face / @media / @supports
    if (css[i] === "@") {
      const start = i;
      // find opening {
      while (i < n && css[i] !== "{") {
        if (css.startsWith("/*", i)) i = skipComment(css, i);
        else i++;
      }
      if (i >= n) break;
      const header = css
        .slice(start, i)
        .replace(/\/\*[\s\S]*?\*\//g, " ")
        .trim();
      let depth = 0;
      const bodyStart = i;
      for (; i < n; i++) {
        if (css.startsWith("/*", i)) {
          i = skipComment(css, i) - 1;
          continue;
        }
        if (css[i] === "{") depth++;
        else if (css[i] === "}") {
          depth--;
          if (depth === 0) {
            i++;
            break;
          }
        }
      }
      const inner = css.slice(bodyStart + 1, i - 1);
      if (/^@(media|supports|layer)\b/i.test(header)) {
        blocks.push(`${header}{\n${scopeCss(inner, scope)}\n}`);
      } else {
        // keyframes / font-face — keep as-is
        blocks.push(css.slice(start, i));
      }
      continue;
    }

    // rule — build selector without including comment text (comma-split
    // otherwise treats comment prose as selectors and injects the scope)
    let selBuf = "";
    while (i < n && css[i] !== "{") {
      if (css.startsWith("/*", i)) {
        const c0 = i;
        i = skipComment(css, i);
        if (!selBuf.trim()) blocks.push(css.slice(c0, i));
        continue;
      }
      selBuf += css[i];
      i++;
    }
    if (i >= n) break;
    const selector = selBuf.trim();
    let depth = 0;
    const bodyStart = i;
    for (; i < n; i++) {
      if (css.startsWith("/*", i)) {
        i = skipComment(css, i) - 1;
        continue;
      }
      if (css[i] === "{") depth++;
      else if (css[i] === "}") {
        depth--;
        if (depth === 0) {
          i++;
          break;
        }
      }
    }
    const body = css.slice(bodyStart, i);
    if (!selector) continue;

    const parts = [];
    let buf = "";
    let paren = 0;
    for (let k = 0; k < selector.length; k++) {
      const ch = selector[k];
      if (ch === "(" || ch === "[") paren++;
      else if (ch === ")" || ch === "]") paren = Math.max(0, paren - 1);
      if (ch === "," && paren === 0) {
        parts.push(buf.trim());
        buf = "";
      } else buf += ch;
    }
    if (buf.trim()) parts.push(buf.trim());

    const scoped = parts
      .filter(Boolean)
      .map((s) => {
        if (s.startsWith("@")) return s; // should not happen in rule selectors
        if (s === ":root" || s === "html") return scope;
        if (s === "body") return scope;
        if (/^html\[/.test(s)) {
          return s.replace(/^html((?:\[[^\]]*\])*)/, `html$1 ${scope}`);
        }
        if (s.startsWith(scope)) return s;
        return `${scope} ${s}`;
      })
      .join(",\n");
    blocks.push(`${scoped}${body}`);
  }
  return blocks.join("\n\n");
}

console.log("Reading:", SRC);
const html = fs.readFileSync(SRC, "utf8");

// ── Styles (skip mega-menu / footer chrome blocks) ─────────────────────
const styleRe =
  /<style([^>]*)>([\s\S]*?)<\/style>/gi;
const styleParts = [];
let sm;
while ((sm = styleRe.exec(html))) {
  const id = (sm[1].match(/\bid=["']([^"']+)["']/) || [])[1] || "";
  if (id && SKIP_STYLE_IDS.has(id)) {
    console.log("skip style", id);
    continue;
  }
  styleParts.push(`/* === ${id || "style"} === */\n${sm[2]}`);
}

let css =
  `/* SEO Services page — scoped under ${SCOPE}. Extracted from tekcroft-seo-services.html */\n` +
  styleParts.join("\n\n");

let namedIdx = 0;
css = await replaceAsync(
  css,
  /(--([a-z0-9-]+))\s*:\s*url\(\s*["']?(data:image\/[a-zA-Z0-9+.-]+;base64,[A-Za-z0-9+/=]+)["']?\s*\)/gi,
  async (m) => {
    namedIdx++;
    const prop = m[2] || `var${namedIdx}`;
    const file = await saveDataUri(m[3], prop);
    return `${m[1]}:url("${file}")`;
  }
);

let anon = 0;
css = await replaceAsync(
  css,
  /url\(\s*["']?(data:image\/[a-zA-Z0-9+.-]+;base64,[A-Za-z0-9+/=]+)["']?\s*\)/gi,
  async (m) => {
    anon++;
    const file = await saveDataUri(m[1], `css${anon}`);
    return `url("${file}")`;
  }
);

css = css.replaceAll(
  'url("[B64]")',
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'%3E%3Cpath d='M1 1.5 6 6.5l5-5' stroke='%236B7684' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`
);

console.log("Scoping CSS…");
css = scopeCss(css, SCOPE);
css += `

/* next/font bridge */
${SCOPE}{
  --font: var(--font-inter), -apple-system, BlinkMacSystemFont, sans-serif;
  --font-display: var(--font-sora), var(--font-inter), sans-serif;
}
${SCOPE} .eh-sprite{
  position:absolute!important;width:0!important;height:0!important;overflow:hidden!important;
}
`;

const outCss = path.join(ROOT, "app", "seo-services.css");
fs.writeFileSync(outCss, css);
console.log("CSS:", outCss, `${(css.length / 1024).toFixed(0)} KB`);

// ── Body ───────────────────────────────────────────────────────────────
const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
if (!bodyMatch) throw new Error("No body");
let body = bodyMatch[1].replace(/<script\b[\s\S]*?<\/script>/gi, "").trim();

let imgN = 0;
body = await replaceAsync(body, /src="(data:image\/[^"]+)"/gi, async (m) => {
  imgN++;
  const file = await saveDataUri(m[1], `img${imgN}`);
  return `src="${file}"`;
});

body = body.replace(
  /<svg class="eh-sprite"/,
  '<svg class="eh-sprite" width="0" height="0" style="position:absolute;width:0;height:0;overflow:hidden"'
);

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
body = body.replace(
  /<div class="nav-links">[\s\S]*?<\/div>\s*<div class="nav-right">/,
  `${NAV_LINKS}\n    <div class="nav-right">`
);
body = body.replace(
  /<div class="mnav js-mnav">[\s\S]*?<\/div>\s*(?=<\/div>\s*<\/nav>)/,
  `${MNAV}\n`
);

// Replace file footer with shared site footer
const siteFooter = fs
  .readFileSync(path.join(ROOT, "lib", "site-footer.html"), "utf8")
  .trim();
body = body.replace(
  /(?:<!--[^\n]*FOOTER[^\n]*-->\s*)?(?:<div class="ftm"[\s\S]*?<\/footer>|<footer class="ft4"[\s\S]*?<\/footer>)/i,
  siteFooter
);

// Wrap page content only — keep shared <nav> outside so page CSS cannot leak into header
const navChunk = body.match(/^[\s\S]*?<\/nav>\s*/);
if (navChunk) {
  const navHtml = navChunk[0];
  const rest = body.slice(navHtml.length);
  body = `${navHtml}<div id="seo-services-page" class="seo-services-page">\n${rest}\n</div>\n`;
} else {
  body = `<div id="seo-services-page" class="seo-services-page">\n${body}\n</div>\n`;
}

const outHtml = path.join(ROOT, "lib", "seo-services-body.html");
fs.writeFileSync(outHtml, body);
console.log("Body:", outHtml, `${(body.length / 1024).toFixed(0)} KB`);

// ── Scripts (no mega-menu) ─────────────────────────────────────────────
const scripts = [
  ...html.matchAll(
    /<script(?![^>]*\btype=["']application\/ld\+json)([^>]*)>([\s\S]*?)<\/script>/gi
  ),
].filter((m) => !/\bsrc=/i.test(m[1] || ""));

const bundled = [];
for (let i = 0; i < scripts.length; i++) {
  const m = scripts[i];
  const id = (m[1].match(/\bid=["']([^"']+)["']/) || [])[1] || `block-${i}`;
  if (SKIP_SCRIPT_IDS.has(id)) {
    console.log("skip script", id);
    continue;
  }
  let code = m[2];
  bundled.push(`/* === ${id} === */\n${code}`);
}

let js = bundled.join("\n\n");
let jsImg = 0;
js = await replaceAsync(
  js,
  /"(data:image\/[a-zA-Z0-9+.-]+;base64,[A-Za-z0-9+/=]+)"/g,
  async (m) => {
    jsImg++;
    const file = await saveDataUri(m[1], `js${jsImg}`);
    return `"${file}"`;
  }
);

const outJs = path.join(ROOT, "public", "tekcroft-seo-services.js");
fs.writeFileSync(outJs, js);
console.log("JS:", outJs, `${(js.length / 1024).toFixed(0)} KB`);

// Meta — keep description entities decoded for Next metadata API
const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
const descMatch = html.match(
  /<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i
);
const decodeEntities = (s) =>
  s
    .replace(/&rsquo;/g, "\u2019")
    .replace(/&lsquo;/g, "\u2018")
    .replace(/&rdquo;/g, "\u201D")
    .replace(/&ldquo;/g, "\u201C")
    .replace(/&amp;/g, "&")
    .replace(/&mdash;/g, "\u2014")
    .replace(/&ndash;/g, "\u2013")
    .replace(/&#8209;/g, "\u2011");

fs.writeFileSync(
  path.join(ROOT, "lib", "seo-services-meta.json"),
  JSON.stringify(
    {
      title: titleMatch
        ? decodeEntities(titleMatch[1].trim())
        : "Expert Search Engine Optimization Services for US Businesses",
      description: descMatch
        ? decodeEntities(descMatch[1])
        : "Get found by Google and answer engines. Tekcroft's digital marketing, web development, and SEO experts help you generate more revenue for your business.",
      canonical: "https://www.tekcroft.com/services/seo-services",
      keywords: "SEO Services",
    },
    null,
    2
  ) + "\n"
);

const heroSrc =
  (body.match(/class="hs-bg"[\s\S]*?<img[^>]+src="([^"]+)"/i) ||
    body.match(/fetchpriority="high"[^>]*src="([^"]+)"/i) ||
    body.match(/src="([^"]+)"[^>]*fetchpriority="high"/i) ||
    [])[1] || "/images/seo-services/seo-svc-hero.webp";
fs.writeFileSync(
  path.join(ROOT, "lib", "seo-services-lcp.json"),
  JSON.stringify({ preload: heroSrc }, null, 2) + "\n"
);

// asset-manifest
const manifestPath = path.join(ROOT, "lib", "asset-manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
manifest.seoServices = "/tekcroft-seo-services.js";
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");

console.log("Done.");
console.log("Images dir:", IMG_DIR);
console.log("LCP:", heroSrc);
