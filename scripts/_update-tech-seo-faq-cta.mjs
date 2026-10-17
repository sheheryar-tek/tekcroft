/**
 * Technical SEO: FAQ aside + CTA band photos (WebP <80KB).
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE =
  "C:/Users/Super/Downloads/Technical-SEO-20261017T080858Z-1-001/Technical-SEO";
const OUT = path.join(ROOT, "public", "images");
const BODY = path.join(ROOT, "lib", "technical-seo-body.html");
const CSS = path.join(ROOT, "app", "technical-seo.css");
const MAX = 80 * 1024;

const FAQ_SRC = path.join(
  BASE,
  "FAQ/destop/Tekcroft-Technical-SEO-22-FAQ-Option-02-1080x1080.jpg_2K_20261008170503.jpg"
);
const CTA_SRC = path.join(
  BASE,
  "CTA/Tekcroft-Technical-SEO-23-CTA-Option-02-1920x1080.jpg"
);

const FAQ_ALT = "Technical SEO Services FAQs";
const CTA_ALT = "Find and Fix What’s Holding Your Website Back";

async function encodeCover(src, maxW, maxH) {
  let best = null;
  const starts = maxH
    ? [
        [maxW, maxH, 78],
        [Math.round(maxW * 0.9), Math.round(maxH * 0.9), 72],
        [Math.round(maxW * 0.8), Math.round(maxH * 0.8), 66],
      ]
    : [
        [maxW, null, 78],
        [maxW - 100, null, 72],
        [maxW - 200, null, 66],
        [900, null, 60],
      ];

  for (const [w, h, qStart] of starts) {
    let lo = 40,
      hi = qStart;
    while (lo <= hi) {
      const q = Math.floor((lo + hi) / 2);
      let img = sharp(src).rotate();
      img = h
        ? img.resize({ width: w, height: h, fit: "cover", position: "attention" })
        : img.resize({ width: w, withoutEnlargement: true });
      const buf = await img
        .webp({ quality: q, effort: 6, smartSubsample: true })
        .toBuffer();
      if (buf.length <= MAX) {
        best = { buf, w, h, q, bytes: buf.length };
        lo = q + 1;
      } else {
        hi = q - 1;
      }
    }
    if (best) break;
  }
  if (!best) throw new Error("could not fit under 80KB: " + src);
  const meta = await sharp(best.buf).metadata();
  return { ...best, width: meta.width, height: meta.height };
}

function writeHashed(slug, buf) {
  const hash = crypto.createHash("sha256").update(buf).digest("hex").slice(0, 10);
  const name = `${slug}-${hash}.webp`;
  fs.writeFileSync(path.join(OUT, name), buf);
  for (const f of fs.readdirSync(OUT)) {
    if (f.startsWith(slug + "-") && f.endsWith(".webp") && f !== name) {
      fs.unlinkSync(path.join(OUT, f));
      console.log("deleted", f);
    }
  }
  return { name, href: "/images/" + name, bytes: buf.length };
}

function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

if (!fs.existsSync(FAQ_SRC)) throw new Error("missing FAQ src: " + FAQ_SRC);
if (!fs.existsSync(CTA_SRC)) throw new Error("missing CTA src: " + CTA_SRC);

fs.mkdirSync(OUT, { recursive: true });

const faqEnc = await encodeCover(FAQ_SRC, 900, 1024);
const faq = writeHashed("tech-faq", faqEnc.buf);
console.log(
  "faq",
  faq.name,
  (faq.bytes / 1024).toFixed(1) + "KB",
  `${faqEnc.width}x${faqEnc.height}`,
  "q" + faqEnc.q
);

const ctaDeskEnc = await encodeCover(CTA_SRC, 1400, null);
const ctaDesk = writeHashed("tech-cta", ctaDeskEnc.buf);
console.log(
  "cta desk",
  ctaDesk.name,
  (ctaDesk.bytes / 1024).toFixed(1) + "KB",
  `${ctaDeskEnc.width}x${ctaDeskEnc.height}`,
  "q" + ctaDeskEnc.q
);

const ctaMobEnc = await encodeCover(CTA_SRC, 900, 1200);
const ctaMob = writeHashed("tech-cta-m", ctaMobEnc.buf);
console.log(
  "cta mob",
  ctaMob.name,
  (ctaMob.bytes / 1024).toFixed(1) + "KB",
  `${ctaMobEnc.width}x${ctaMobEnc.height}`,
  "q" + ctaMobEnc.q
);

let html = fs.readFileSync(BODY, "utf8");

const faqRe =
  /<span class="faq-pic"><img\b[^>]*><\/span>/;
if (!faqRe.test(html)) throw new Error("faq-pic img not found");
html = html.replace(
  faqRe,
  `<span class="faq-pic"><img src="${faq.href}" width="${faqEnc.width}" height="${faqEnc.height}" alt="${esc(FAQ_ALT)}" title="${esc(FAQ_ALT)}" decoding="async" loading="lazy"></span>`
);

const ctaSecRe =
  /(<section class="sec cta" id="contact"[^>]*>\s*<div class="wrap">)\s*/;
if (!ctaSecRe.test(html)) throw new Error("cta section not found");
html = html.replace(
  ctaSecRe,
  `$1
    <img class="cta-shot" src="${ctaDesk.href}" width="${ctaDeskEnc.width}" height="${ctaDeskEnc.height}" alt="${esc(CTA_ALT)}" title="${esc(CTA_ALT)}" decoding="async" loading="lazy">
`
);

// Avoid duplicating cta-shot if re-run
html = html.replace(
  /(<section class="sec cta" id="contact"[^>]*>\s*<div class="wrap">)\s*(?:<img class="cta-shot"\b[^>]*>\s*)+/,
  `$1
    <img class="cta-shot" src="${ctaDesk.href}" width="${ctaDeskEnc.width}" height="${ctaDeskEnc.height}" alt="${esc(CTA_ALT)}" title="${esc(CTA_ALT)}" decoding="async" loading="lazy">
`
);

fs.writeFileSync(BODY, html);
console.log("body updated");

let css = fs.readFileSync(CSS, "utf8");
const ctaBlock = `/* CTA band photo — desktop landscape / mobile portrait */
#contact.cta{ --cta-shot:url("${ctaDesk.href}"); }
@media (max-width:960px){
  #contact.cta{ --cta-shot:url("${ctaMob.href}"); }
}
/* SEO alt/title carrier — visual comes from wrap::before */
#contact .cta-shot{
  position:absolute !important; width:1px !important; height:1px !important;
  padding:0 !important; margin:-1px !important; overflow:hidden !important;
  clip:rect(0,0,0,0) !important; white-space:nowrap !important; border:0 !important;
}
`;

if (css.includes("/* CTA band photo")) {
  css = css.replace(
    /\/\* CTA band photo[\s\S]*?#contact \.cta-shot\{[\s\S]*?border:0 !important;\s*\}\s*/,
    ctaBlock
  );
} else {
  const anchor = "#contact.sec,";
  if (!css.includes(anchor)) throw new Error("css anchor missing");
  css = css.replace(anchor, ctaBlock + "\n" + anchor);
}
fs.writeFileSync(CSS, css);
console.log("css updated");
console.log("done");
