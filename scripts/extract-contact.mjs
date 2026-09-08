/**
 * Faithful extract of tekcroft-contact.html → Next.js assets.
 * No redesign. Homepage nav applied for site chrome.
 * Run: node scripts/extract-contact.mjs
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC =
  process.env.TEKCROFT_CONTACT_HTML ||
  "c:\\Users\\Super\\Desktop\\TK FINAL\\Contact\\tekcroft-contact.html";

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

const STAR =
  'url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20d%3D%22M12%201.6c.7%205.9%203.8%209%209.7%209.7-5.9.7-9%203.8-9.7%209.7-.7-5.9-3.8-9-9.7-9.7C8.2%2010.6%2011.3%207.5%2012%201.6Z%22%2F%3E%3C%2Fsvg%3E")';
const CHEVRON =
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'%3E%3Cpath d='M1 1.5 6 6.5l5-5' stroke='%236B7684' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`;

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
    const file = `contact-${hint}-${h}.svg`;
    const dest = path.join(IMG, file);
    if (!fs.existsSync(dest)) fs.writeFileSync(dest, buf);
    return `/images/${file}`;
  }

  const maxW =
    hint.startsWith("logo") || hint === "mark"
      ? 480
      : hint.startsWith("hero")
        ? 1920
        : hint.startsWith("mm-") || hint.includes("shot")
          ? 1200
          : 800;
  const file = `contact-${hint}-${h}.webp`;
  const dest = path.join(IMG, file);
  if (!fs.existsSync(dest)) {
    let pipeline = sharp(buf, { failOn: "none" }).rotate();
    const meta = await pipeline.metadata();
    const w = meta.width || maxW;
    if (w > maxW) {
      pipeline = sharp(buf, { failOn: "none" })
        .rotate()
        .resize({ width: maxW, withoutEnlargement: true });
    }
    const out = await pipeline.webp({ quality: 84, effort: 6 }).toBuffer();
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

const styleBlocks = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map(
  (m) => m[1]
);
let css =
  `/* Exact extract from tekcroft-contact.html — do not redesign */\n` +
  styleBlocks.join("\n\n");

css = await replaceAsync(
  css,
  /(--([a-z0-9-]+))\s*:\s*url\(\s*["']?(data:image\/[a-zA-Z0-9+.-]+;base64,[A-Za-z0-9+/=]+)["']?\s*\)/gi,
  async (m) => {
    const prop = m[2];
    const base = prop.replace(/-\d+$/, "");
    if (SHARED[prop] && fs.existsSync(path.join(ROOT, "public", SHARED[prop].slice(1)))) {
      return `${m[1]}:url("${SHARED[prop]}")`;
    }
    if (SHARED[base] && fs.existsSync(path.join(ROOT, "public", SHARED[base].slice(1)))) {
      return `${m[1]}:url("${SHARED[base]}")`;
    }
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

css = css.replaceAll('url("[B64]")', CHEVRON);
css = css.replace(
  /(\.ftm \.marq-track i\{[^}]*?)(-webkit-)?mask:url\("data:image\/svg\+xml[^"]+"\) center \/ contain no-repeat;\s*(-webkit-)?mask:url\("data:image\/svg\+xml[^"]+"\) center \/ contain no-repeat;/s,
  `$1-webkit-mask:${STAR} center / contain no-repeat;\n          mask:${STAR} center / contain no-repeat;`
);

css += `

/* next/font bridge */
:root{
  --font: var(--font-inter), -apple-system, BlinkMacSystemFont, sans-serif;
  --font-display: var(--font-sora), var(--font-inter), sans-serif;
}
.sec{ content-visibility: visible !important; contain-intrinsic-size: auto none !important; }
.nav-links{ gap:22px !important; text-transform:uppercase; letter-spacing:.04em; }
.mm-trigger{ text-transform:uppercase; letter-spacing:.04em; }
.mnav > a, .mnav .mm-acc{ text-transform:uppercase; letter-spacing:.04em; }
.mnav .mm-accp a, .mnav .btn{ text-transform:none; letter-spacing:0; }
`;

const outCss = path.join(ROOT, "app", "contact.css");
fs.writeFileSync(outCss, css);
console.log("CSS:", outCss, `${(css.length / 1024).toFixed(0)} KB`);

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
  /<div class="nav-links">[\s\S]*?<\/div>\s*<div class="nav-right">/,
  `${NAV_LINKS}\n    <div class="nav-right">`
);
body = body.replace(
  /<div class="mnav js-mnav">[\s\S]*?<\/div>\s*(?=<\/div>\s*<\/nav>)/,
  `${MNAV}\n`
);

const outHtml = path.join(ROOT, "lib", "contact-body.html");
fs.writeFileSync(outHtml, body);
console.log("Body:", outHtml, `${(body.length / 1024).toFixed(0)} KB`);

const scripts = [
  ...html.matchAll(
    /<script(?![^>]*type=["']application\/ld\+json)([^>]*)>([\s\S]*?)<\/script>/gi
  ),
].filter((m) => !/src=/i.test(m[1] || ""));

const bundled = scripts.map((m, i) => {
  const id = (m[1].match(/id=["']([^"']+)["']/) || [])[1] || `block-${i}`;
  let code = m[2];
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

const outJs = path.join(ROOT, "public", "tekcroft-contact.js");
fs.writeFileSync(outJs, js);
console.log("JS:", outJs, `${(js.length / 1024).toFixed(0)} KB`, `(${scripts.length} blocks)`);

const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
const descMatch = html.match(/<meta name="description" content="([^"]*)"/i);
fs.writeFileSync(
  path.join(ROOT, "lib", "contact-meta.json"),
  JSON.stringify(
    {
      title: titleMatch ? titleMatch[1].trim() : "Contact Us | Tekcroft",
      description: descMatch
        ? descMatch[1]
        : "Contact Tekcroft for SEO, development, and growth strategy.",
      canonical: "https://www.tekcroft.com/contact",
    },
    null,
    2
  )
);

console.log("Done.");
