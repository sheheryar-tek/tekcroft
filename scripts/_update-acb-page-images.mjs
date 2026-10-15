/**
 * AI Chatbot Development page: encode pack photos to WebP <80KB and wire
 * hero, #services-2 ACV panels, #process discs, FAQ aside, and CTA band.
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE =
  "C:/Users/Super/Downloads/AI Development and Automation-20261014T075843Z-1-001/AI Development and Automation/ai-chatbot-development-services";
const OUT = path.join(ROOT, "public", "images");
const BODY = path.join(ROOT, "lib", "ai-chatbot-development-body.html");
const CSS = path.join(ROOT, "app", "ai-chatbot-development.css");
const LCP = path.join(ROOT, "lib", "ai-chatbot-development-lcp.json");
const MAX = 80 * 1024;

const SERVICES = [
  { i: 0, folder: "AI Chatbot Consulting", alt: "AI Chatbot Consulting" },
  {
    i: 1,
    folder: "Custom AI Chatbot Development",
    alt: "Custom AI Chatbot Development",
  },
  {
    i: 2,
    folder: "Conversational AI and RAG Development",
    alt: "Conversational AI and RAG Development",
  },
  {
    i: 3,
    folder: "Chatbot Integration Services",
    alt: "Chatbot Integration Services",
  },
  {
    i: 4,
    folder: "Multilingual Chatbot Development",
    alt: "Multilingual Chatbot Development",
  },
  {
    i: 5,
    folder: "Chatbot Maintenance and Support",
    alt: "Chatbot Maintenance and Support",
  },
];

const PROCESS = [
  {
    i: 0,
    folder: "Discovery and Requirements Mapping",
    slug: "acb-proc-discovery",
    alt: "Team mapping chatbot requirements and system workflows before build",
    title: "Discovery and Requirements Mapping",
  },
  {
    i: 1,
    folder: "Conversation Design and Escalation Logic",
    slug: "acb-proc-design",
    alt: "Conversation design board with escalation paths for human handoff",
    title: "Conversation Design and Escalation Logic",
  },
  {
    i: 2,
    folder: "Development, RAG Setup and Model Integration",
    slug: "acb-proc-build",
    alt: "Engineers integrating RAG and model stack for a custom chatbot",
    title: "Development, RAG Setup and Model Integration",
  },
  {
    i: 3,
    folder: "Testing, QA and Deployment",
    slug: "acb-proc-qa",
    alt: "QA testing chatbot conversations before production deployment",
    title: "Testing, QA and Deployment",
  },
  {
    i: 4,
    folder: "Ongoing Monitoring, Retraining and Maintenance",
    slug: "acb-proc-monitor",
    alt: "Monitoring chatbot performance and retraining on live conversation data",
    title: "Ongoing Monitoring, Retraining and Maintenance",
  },
];

function esc(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
}

function writeHashed(slug, buf) {
  const hash = crypto.createHash("sha256").update(buf).digest("hex").slice(0, 10);
  const name = `${slug}-${hash}.webp`;
  const dest = path.join(OUT, name);
  fs.writeFileSync(dest, buf);
  for (const f of fs.readdirSync(OUT)) {
    if (f.startsWith(slug + "-") && f.endsWith(".webp") && f !== name) {
      fs.unlinkSync(path.join(OUT, f));
      console.log("deleted", f);
    }
  }
  return { name, href: "/images/" + name, bytes: buf.length };
}

async function encodeCover(srcPath, { w, h, qStart = 72 }) {
  let best = null;
  const sizes = [
    [w, qStart],
    [Math.round(w * 0.9), qStart - 4],
    [Math.round(w * 0.8), qStart - 8],
    [Math.round(w * 0.72), qStart - 12],
    [Math.round(w * 0.64), qStart - 16],
  ];
  for (const [ww, qs] of sizes) {
    const hh = Math.round((ww * h) / w);
    let lo = 38,
      hi = qs;
    while (lo <= hi) {
      const q = Math.floor((lo + hi) / 2);
      const buf = await sharp(srcPath)
        .rotate()
        .resize({
          width: ww,
          height: hh,
          fit: "cover",
          position: "centre",
        })
        .webp({ quality: q, effort: 6, smartSubsample: true })
        .toBuffer();
      if (buf.length <= MAX) {
        best = { buf, w: ww, h: hh, q };
        lo = q + 1;
      } else hi = q - 1;
    }
    if (best && best.buf.length < 70 * 1024) break;
  }
  if (!best) throw new Error("could not fit " + srcPath);
  const meta = await sharp(best.buf).metadata();
  return { ...best, meta };
}

async function encodeWidth(srcPath, maxW = 1400) {
  let width = maxW;
  let quality = 82;
  let buf;
  for (;;) {
    buf = await sharp(srcPath)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality, effort: 6, smartSubsample: true })
      .toBuffer();
    if (buf.length <= MAX) break;
    if (quality > 55) quality -= 6;
    else if (width > 720) {
      width -= 80;
      quality = 78;
    } else if (quality > 40) quality -= 5;
    else break;
  }
  if (buf.length > MAX) throw new Error("over 80KB: " + srcPath);
  const meta = await sharp(buf).metadata();
  return { buf, meta, w: width, q: quality };
}

function pickNumbered(dir, prefer = "1") {
  if (!fs.existsSync(dir)) throw new Error("missing " + dir);
  const files = fs
    .readdirSync(dir)
    .filter((n) => /\.(jpe?g|png|webp)$/i.test(n))
    .filter((n) => /^\d+(\s*\(\d+\))?\./i.test(n))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  if (!files.length) throw new Error("no images in " + dir);
  const preferred = files.find((f) => new RegExp(`^${prefer}\\.`, "i").test(f));
  return path.join(dir, preferred || files[0]);
}

function findDesktop(folder) {
  const dir = path.join(BASE, "Services", folder);
  if (!fs.existsSync(dir)) throw new Error("missing service " + folder);
  const sub = fs
    .readdirSync(dir, { withFileTypes: true })
    .find((d) => d.isDirectory() && /^desktop$/i.test(d.name));
  if (!sub) throw new Error("no Desktop in " + folder);
  return path.join(dir, sub.name);
}

fs.mkdirSync(OUT, { recursive: true });
let html = fs.readFileSync(BODY, "utf8");
let css = fs.readFileSync(CSS, "utf8");
const map = {};

/* ── Hero ─────────────────────────────────────────────────────────── */
{
  const src = pickNumbered(path.join(BASE, "Hero Banner", "Desktop"), "1");
  const { buf, meta, w, q } = await encodeWidth(src, 1400);
  const written = writeHashed("acb-hero", buf);
  const ALT = "AI Chatbot Development Services | TekCroft";
  const img = `<img src="${written.href}" width="${meta.width}" height="${meta.height}" alt="${esc(ALT)}" title="${esc(ALT)}" decoding="async" fetchpriority="high">`;
  const re =
    /(<div class="hs-bg" aria-hidden="true">)[\s\S]*?(<\/div>\s*<div class="hs-veil")/;
  if (!re.test(html)) throw new Error("hs-bg not found");
  html = html.replace(re, `$1${img}$2`);
  fs.writeFileSync(LCP, JSON.stringify({ preload: written.href }, null, 2) + "\n");
  map.hero = { ...written, kb: +(written.bytes / 1024).toFixed(1), enc: `w${w}q${q}`, src: path.basename(src) };
  console.log("hero", written.name, map.hero.kb + "KB");
}

/* ── Services ACV ─────────────────────────────────────────────────── */
{
  const results = [];
  for (const p of SERVICES) {
    const src = pickNumbered(findDesktop(p.folder), "2");
    const { buf, meta, w, q } = await encodeCover(src, {
      w: 1400,
      h: Math.round((1400 * 616) / 1024),
    });
    const slug = `acb-ac-${String(p.i + 1).padStart(2, "0")}`;
    // writeHashed cleans prior hashes for exact slug; use padded slug
    const hash = crypto.createHash("sha256").update(buf).digest("hex").slice(0, 10);
    const name = `${slug}-${hash}.webp`;
    fs.writeFileSync(path.join(OUT, name), buf);
    for (const f of fs.readdirSync(OUT)) {
      if (f.startsWith(slug + "-") && f.endsWith(".webp") && f !== name) {
        fs.unlinkSync(path.join(OUT, f));
      }
    }
    const href = "/images/" + name;
    const img = `<img src="${href}" width="${meta.width}" height="${meta.height}" alt="${esc(p.alt)}" title="${esc(p.alt)}" decoding="async" loading="lazy">`;
    const itemRe = new RegExp(
      `(<div class="ac-item[^"]*"[^>]*data-i="${p.i}"[^>]*>\\s*<span class="ac-bg" aria-hidden="true">)\\s*(?:<img\\b[^>]*>|<span class="ac-fb"><\\/span>)`,
      "m"
    );
    if (!itemRe.test(html)) throw new Error("ac panel match failed " + p.i);
    html = html.replace(itemRe, `$1${img}`);
    results.push({
      i: p.i,
      file: href,
      alt: p.alt,
      kb: +(buf.length / 1024).toFixed(1),
      enc: `w${w}q${q}`,
    });
    console.log(`svc ${p.i + 1}`, name, results.at(-1).kb + "KB");
  }
  map.services = results;

  const cssBlock = `
/* ACB What-we-do panel photos (#services-2 ACV) */
#services-2 .ac-bg{background:none;}
#services-2 .ac-bg > img{position:absolute; inset:0; width:100%; height:100%; object-fit:cover; display:block;}
#services-2 .ac-fb{display:none !important;}
#services-2 .ac-veil{z-index:1;}
#services-2 .ac-wm{z-index:2;}
`;
  if (!css.includes("#services-2 .ac-bg > img{position:absolute")) {
    css = css.replace(
      /#services-2 \.ac-fb\{background:url\("\/images\/onpage-deliverables-panel\.jpg"\)[^;]*;\}/,
      "#services-2 .ac-fb{display:none !important;}"
    );
    const lock = "/* === SITE CONSISTENCY LOCK";
    const lockIdx = css.indexOf(lock);
    if (lockIdx >= 0) css = css.slice(0, lockIdx) + cssBlock + "\n" + css.slice(lockIdx);
    else css += "\n" + cssBlock;
  }
}

/* ── Process discs ────────────────────────────────────────────────── */
{
  const results = [];
  for (const step of PROCESS) {
    const src = pickNumbered(path.join(BASE, "Process Section", step.folder), "1");
    const { buf, meta, w, q } = await encodeCover(src, { w: 720, h: 720, qStart: 72 });
    const written = writeHashed(step.slug, buf);
    results.push({
      ...step,
      ...written,
      width: meta.width,
      height: meta.height,
      encode: `${w}@q${q}`,
    });
    console.log(`proc ${step.i}`, written.name, (written.bytes / 1024).toFixed(1) + "KB");
  }
  map.process = results.map((r) => ({
    i: r.i,
    file: r.href,
    kb: +(r.bytes / 1024).toFixed(1),
    title: r.title,
  }));

  const pics = results
    .map(
      (r) =>
        `          <span class="eg-pic"><img src="${r.href}" width="${r.width}" height="${r.height}" alt="${esc(r.alt)}" title="${esc(r.title)}" decoding="async" loading="lazy"></span>`
    )
    .join("\n");

  const faceRe =
    /(<div class="eg-face">)\s*([\s\S]*?)(\s*<\/div>\s*\n\s*<\/div>\s*\n\s*<div class="eg-list">)/;
  if (!faceRe.test(html)) throw new Error("eg-face block not found");
  html = html.replace(faceRe, (_, open, _inner, close) => {
    return `${open}
${pics}
          <span class="eg-lab">The 5-stage process</span>
          <b class="eg-num" aria-hidden="true"><i>01</i><i>02</i><i>03</i><i>04</i><i>05</i></b>
          <span class="eg-rule" aria-hidden="true"></span>
          <span class="eg-of">of five stages</span>
${close}`;
  });

  const marker = "/* ACB #process per-step disc photos */";
  const cssBlock = `
${marker}
#process .eg-face{background:#0A0C0E; isolation:isolate;}
#process .eg-face::before{display:none;}
#process .eg-face::after{z-index:1;}
#process .eg-pic{
  position:absolute; inset:0; z-index:0;
  background:none;
  opacity:0; visibility:hidden;
  transition:opacity .45s var(--ease), visibility 0s linear .45s;
}
#process .eg[data-at="0"] .eg-pic:nth-child(1),
#process .eg[data-at="1"] .eg-pic:nth-child(2),
#process .eg[data-at="2"] .eg-pic:nth-child(3),
#process .eg[data-at="3"] .eg-pic:nth-child(4),
#process .eg[data-at="4"] .eg-pic:nth-child(5),
#process .eg:not([data-at]) .eg-pic:nth-child(1){
  opacity:1; visibility:visible; transition-delay:0s;
}
#process .eg-pic > img{
  position:absolute; inset:0; width:100%; height:100%;
  object-fit:cover; object-position:center; display:block;
}
#process .eg-face > *:not(.eg-pic){position:relative; z-index:2;}
`;
  if (css.includes(marker)) {
    css = css.replace(
      /\/\* ACB #process per-step disc photos \*\/[\s\S]*?(?=\n\/\* [A-Z]|\nhtml body|$)/,
      cssBlock.trim() + "\n"
    );
  } else {
    const lock = "/* === SITE CONSISTENCY LOCK";
    const lockIdx = css.indexOf(lock);
    if (lockIdx >= 0) css = css.slice(0, lockIdx) + cssBlock + "\n" + css.slice(lockIdx);
    else css += "\n" + cssBlock;
  }
}

/* ── FAQ aside ────────────────────────────────────────────────────── */
{
  const src = pickNumbered(path.join(BASE, "FAQ", "Desktop"), "1");
  const { buf, meta, w, q } = await encodeWidth(src, 720);
  const written = writeHashed("acb-faq", buf);
  const ALT = "What Clients Usually Ask Us About AI Chatbot Development";
  const faqPics = `        <span class="faq-pics" aria-hidden="true">
          <span class="faq-pic"><img src="${written.href}" width="${meta.width}" height="${meta.height}" alt="${esc(ALT)}" title="${esc(ALT)}" decoding="async" loading="lazy"></span>
        </span>`;
  if (
    !/<span class="faq-pics" aria-hidden="true">[\s\S]*?<\/span>\s*(?=<span class="faq-aside-eyebrow")/.test(
      html
    )
  ) {
    throw new Error("faq-pics block not found");
  }
  html = html.replace(
    /<span class="faq-pics" aria-hidden="true">[\s\S]*?<\/span>\s*(?=<span class="faq-aside-eyebrow")/,
    faqPics + "\n        "
  );
  map.faq = { ...written, kb: +(written.bytes / 1024).toFixed(1), enc: `w${w}q${q}` };
  console.log("faq", written.name, map.faq.kb + "KB");

  const cssBlock = `
/* Single FAQ aside photo (AI Chatbot) */
:root{ --faq-shot:url("${written.href}"); }
#faq .faq-pic{position:absolute; inset:0; background:none; opacity:1;}
#faq .faq-pic > img{position:absolute; inset:0; width:100%; height:100%;
  object-fit:cover; object-position:center; display:block;}
#faq .faq-aside::after{
  background:
    radial-gradient(780px 440px at 50% 48%, rgba(0,0,0,.45) 0%, transparent 72%),
    linear-gradient(180deg, rgba(0,0,0,.42) 0%, rgba(0,0,0,.52) 42%,
                    rgba(0,0,0,.92) 100%);}
`;
  if (!css.includes("#faq .faq-pic > img")) {
    const lock = "/* === SITE CONSISTENCY LOCK";
    const lockIdx = css.indexOf(lock);
    if (lockIdx >= 0) css = css.slice(0, lockIdx) + cssBlock + "\n" + css.slice(lockIdx);
    else css += "\n" + cssBlock;
  } else {
    css = css.replace(
      /:root\{\s*--faq-shot:url\("[^"]+"\);\s*\}/,
      `:root{ --faq-shot:url("${written.href}"); }`
    );
  }
}

/* ── CTA ──────────────────────────────────────────────────────────── */
{
  const src = pickNumbered(path.join(BASE, "call to action", "Desktop"), "1");
  const { buf, meta, w, q } = await encodeWidth(src, 1400);
  const written = writeHashed("acb-cta", buf);
  const ALT =
    "AI chatbot development consultation with CRM and live-data handoff planning";
  const TITLE = "Let's Talk About What You're Building";
  const shot = `<img class="cta-shot" src="${written.href}" width="${meta.width}" height="${meta.height}" alt="${esc(ALT)}" title="${esc(TITLE)}" decoding="async" loading="lazy">`;

  if (/<img class="cta-shot"[\s\S]*?>/.test(html)) {
    html = html.replace(/<img class="cta-shot"[\s\S]*?>/, shot);
  } else {
    html = html.replace(
      /(<section class="sec cta" id="contact">\s*<div class="wrap">)/,
      `$1\n    ${shot}`
    );
  }
  map.cta = { ...written, kb: +(written.bytes / 1024).toFixed(1), enc: `w${w}q${q}` };
  console.log("cta", written.name, map.cta.kb + "KB");

  const ctaVars = `#contact{ --cta-pic:url("${written.href}"); --cta-shot:url("${written.href}"); }`;
  if (/#contact\{\s*--cta-pic:[^}]+\}/.test(css)) {
    css = css.replace(/#contact\{\s*--cta-pic:[^}]+\}/, ctaVars);
  } else {
    css += "\n" + ctaVars + "\n";
  }

  const ctaCss = `
/* ACB CTA shot carrier + band photo */
#contact.cta,
#contact.sec.cta{
  background:var(--bg-alt) !important;
}
#contact.cta > .wrap::before,
#contact.sec.cta > .wrap::before{
  background:var(--cta-shot, var(--cta-pic)) 58% 45% / cover no-repeat !important;
}
#contact .cta-shot{
  position:absolute !important; width:1px !important; height:1px !important;
  padding:0 !important; margin:-1px !important; overflow:hidden !important;
  clip:rect(0,0,0,0) !important; white-space:nowrap !important; border:0 !important;
}
`;
  if (!css.includes("/* ACB CTA shot carrier + band photo */")) {
    const lock = "/* === SITE CONSISTENCY LOCK";
    const lockIdx = css.indexOf(lock);
    if (lockIdx >= 0) css = css.slice(0, lockIdx) + ctaCss + "\n" + css.slice(lockIdx);
    else css += "\n" + ctaCss;
  }
}

/* Hero tag → full primary keyword */
html = html.replace(
  /<span class="tag"><i><\/i>AI Chatbot Development<\/span>/,
  '<span class="tag"><i></i>AI Chatbot Development Services</span>'
);

fs.writeFileSync(BODY, html);
fs.writeFileSync(CSS, css);
fs.writeFileSync(
  path.join(ROOT, "scripts", "_acb-image-map.json"),
  JSON.stringify(map, null, 2) + "\n"
);
console.log("done");
