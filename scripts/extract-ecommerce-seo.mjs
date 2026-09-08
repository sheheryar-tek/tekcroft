/**
 * Faithful extract of tekcroft-ecommerce-seo.html → Next.js assets.
 * No redesign: all original styles + body + scripts (images externalized).
 * Run: node scripts/extract-ecommerce-seo.mjs
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC =
  process.env.TEKCROFT_ECOM_HTML ||
  "c:\\Users\\Super\\Desktop\\TK FINAL\\Services\\tekcroft-ecommerce-seo.html";

const IMG = path.join(ROOT, "public", "images");
fs.mkdirSync(IMG, { recursive: true });

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
  "mm-team": "/images/mm-team.webp",
  "mm-keys": "/images/mm-keys.webp",
  "mm-laptops": "/images/mm-laptops.webp",
  "mm-devs": "/images/mm-devs.webp",
  "mm-meeting": "/images/mm-meeting.webp",
  "mm-table": "/images/mm-table.webp",
  "mm-docs": "/images/mm-docs.webp",
  "mm-mentor": "/images/mm-mentor.webp",
};

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
    const file = `ecom-${hint}-${h}.svg`;
    const dest = path.join(IMG, file);
    if (!fs.existsSync(dest)) fs.writeFileSync(dest, buf);
    return `/images/${file}`;
  }

  // tiny decorative / icon: keep small
  const maxW = hint.startsWith("logo") || hint === "mark" ? 480 : hint.startsWith("hero") ? 1920 : hint.startsWith("mm-") || hint.includes("shot") ? 1200 : 512;
  const file = `ecom-${hint}-${h}.webp`;
  const dest = path.join(IMG, file);
  if (!fs.existsSync(dest)) {
    let img = sharp(buf, { failOn: "none" }).rotate();
    const meta = await img.metadata();
    const w = meta.width || maxW;
    if (w > maxW) img = sharp(buf, { failOn: "none" }).rotate().resize({ width: maxW, withoutEnlargement: true });
    const out = await img.webp({ quality: 84, effort: 6 }).toBuffer();
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

console.log("Reading:", SRC);
const html = fs.readFileSync(SRC, "utf8");

// ── ALL original styles (same order as source) ──────────────────────────
const styleBlocks = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map(
  (m) => m[1]
);
let css =
  `/* Exact extract from tekcroft-ecommerce-seo.html — do not redesign */\n` +
  styleBlocks.join("\n\n");

// Named CSS vars → shared webp when we already have them
let namedIdx = 0;
css = await replaceAsync(
  css,
  /(--([a-z0-9-]+))\s*:\s*url\(\s*["']?(data:image\/[a-zA-Z0-9+.-]+;base64,[A-Za-z0-9+/=]+)["']?\s*\)/gi,
  async (m) => {
    const prop = m[2];
    const base = prop.replace(/-\d+$/, "");
    if (SHARED[prop] && fs.existsSync(path.join(ROOT, "public", SHARED[prop].replace(/^\//, "")))) {
      return `${m[1]}:url("${SHARED[prop]}")`;
    }
    if (SHARED[base] && fs.existsSync(path.join(ROOT, "public", SHARED[base].replace(/^\//, "")))) {
      return `${m[1]}:url("${SHARED[base]}")`;
    }
    namedIdx++;
    const file = await saveDataUri(m[3], prop || `var${namedIdx}`);
    return `${m[1]}:url("${file}")`;
  }
);

// Remaining anonymous url("data:...")
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

const outCss = path.join(ROOT, "app", "ecommerce-seo.css");
// Source HTML leaves a few literal [B64] placeholders — restore homepage SVGs
css = css.replaceAll(
  'url("[B64]")',
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'%3E%3Cpath d='M1 1.5 6 6.5l5-5' stroke='%236B7684' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`
);
const STAR =
  'url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20d%3D%22M12%201.6c.7%205.9%203.8%209%209.7%209.7-5.9.7-9%203.8-9.7%209.7-.7-5.9-3.8-9-9.7-9.7C8.2%2010.6%2011.3%207.5%2012%201.6Z%22%2F%3E%3C%2Fsvg%3E")';
css = css.replace(
  /(\.ftm \.marq-track i\{[^}]*?)(-webkit-)?mask:url\("data:image\/svg\+xml[^"]+"\) center \/ contain no-repeat;\s*(-webkit-)?mask:url\("data:image\/svg\+xml[^"]+"\) center \/ contain no-repeat;/s,
  `$1-webkit-mask:${STAR} center / contain no-repeat;\n          mask:${STAR} center / contain no-repeat;`
);
fs.writeFileSync(outCss, css);
console.log("CSS:", outCss, `${(css.length / 1024).toFixed(0)} KB`);

// ── Body exactly as original (scripts stripped only) ────────────────────
const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
if (!bodyMatch) throw new Error("No body");
let body = bodyMatch[1].replace(/<script\b[\s\S]*?<\/script>/gi, "").trim();

let imgN = 0;
body = await replaceAsync(
  body,
  /src="(data:image\/[^"]+)"/gi,
  async (m) => {
    imgN++;
    const file = await saveDataUri(m[1], `img${imgN}`);
    return `src="${file}"`;
  }
);

// Hide sprite without changing markup structure
body = body.replace(
  /<svg class="eh-sprite"/,
  '<svg class="eh-sprite" width="0" height="0" style="position:absolute;width:0;height:0;overflow:hidden"'
);

// Same nav as homepage (site-wide). Subpages use /#… for home sections.
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

const outHtml = path.join(ROOT, "lib", "ecommerce-seo-body.html");
fs.writeFileSync(outHtml, body);
console.log("Body:", outHtml, `${(body.length / 1024).toFixed(0)} KB`);

// ── All inline scripts including mega menu (page-local, faithful) ───────
const scripts = [
  ...html.matchAll(
    /<script(?![^>]*type=["']application\/ld\+json)([^>]*)>([\s\S]*?)<\/script>/gi
  ),
].filter((m) => !/src=/i.test(m[1] || ""));

const bundled = scripts.map((m, i) => {
  const id = (m[1].match(/id=["']([^"']+)["']/) || [])[1] || `block-${i}`;
  let code = m[2];
  // Only functional hook from prior work: Ecommerce SEO item → this route
  if (id === "mm-script") {
    code = code.replace(
      /\{name:"Ecommerce SEO Services", href:"\/#services"/g,
      '{name:"Ecommerce SEO Services", href:"/services/ecommerce-seo"'
    );
    code = code.replace(
      /title:"SEO \(Core, Technical & Ecommerce\)"/g,
      'title:"SEO"'
    );
  }
  return `/* === ${id} === */\n${code}`;
});

// Externalize any leftover data URIs inside JS (mm BGs)
let js = bundled.join("\n\n");
let jsImg = 0;
js = await replaceAsync(
  js,
  /"(data:image\/[a-zA-Z0-9+.-]+;base64,[A-Za-z0-9+/=]+)"/g,
  async (m) => {
    jsImg++;
    // Prefer shared mm-* if comment/key nearby is hard; just save
    const file = await saveDataUri(m[1], `js${jsImg}`);
    return `"${file}"`;
  }
);

const outJs = path.join(ROOT, "public", "tekcroft-ecommerce-seo.js");
fs.writeFileSync(outJs, js);
console.log("JS:", outJs, `${(js.length / 1024).toFixed(0)} KB`, `(${scripts.length} blocks)`);

// Meta
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

// Page must not inherit conflicting homepage-only overrides; map next/font
fs.appendFileSync(
  outCss,
  `

/* next/font bridge (same faces as original Inter + Sora) */
:root{
  --font: var(--font-inter), -apple-system, BlinkMacSystemFont, sans-serif;
  --font-display: var(--font-sora), var(--font-inter), sans-serif;
}
.eh-sprite{position:absolute!important;width:0!important;height:0!important;overflow:hidden!important;}
.sec, #ai-ecosystem, #why {
  content-visibility: visible !important;
  contain-intrinsic-size: auto none !important;
}
/* Match homepage nav (shared site chrome) */
.nav-links{ gap:22px !important; text-transform:uppercase; letter-spacing:.04em; }
.mm-trigger{ text-transform:uppercase; letter-spacing:.04em; }
.mnav > a, .mnav .mm-acc{ text-transform:uppercase; letter-spacing:.04em; }
.mnav .mm-accp a, .mnav .btn{ text-transform:none; letter-spacing:0; }
`
);

console.log("Done.");
