/**
 * AI Chatbot #services-2 ACV: wire Desktop folder photos per panel,
 * WebP < 80KB, alt+title matching service titles (same pattern as CSD).
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE =
  "C:/Users/Super/Downloads/ai-chatbot-development-services-20261015T132301Z-1-001/ai-chatbot-development-services/Services";
const OUT = path.join(ROOT, "public", "images");
const BODY = path.join(ROOT, "lib", "ai-chatbot-development-body.html");
const CSS = path.join(ROOT, "app", "ai-chatbot-development.css");
const MAX = 80 * 1024;

/** Match #services-2 ac-item order (data-i 0..5) */
const PANELS = [
  {
    i: 0,
    folder: "AI Chatbot Consulting",
    alt: "AI Chatbot Consulting — workflow scoping and technical planning before build",
    title: "AI Chatbot Consulting",
  },
  {
    i: 1,
    folder: "Custom AI Chatbot Development",
    alt: "Custom AI Chatbot Development — CRM, ERP, and internal data integrations",
    title: "Custom AI Chatbot Development",
  },
  {
    i: 2,
    folder: "Conversational AI and RAG Development",
    alt: "Conversational AI and RAG Development — answers grounded in live documents",
    title: "Conversational AI and RAG Development",
  },
  {
    i: 3,
    folder: "Chatbot Integration Services",
    alt: "Chatbot Integration Services — Salesforce, Zendesk, Shopify, and internal APIs",
    title: "Chatbot Integration Services",
  },
  {
    i: 4,
    folder: "Multilingual Chatbot Development",
    alt: "Multilingual Chatbot Development — one chatbot covering every customer language",
    title: "Multilingual Chatbot Development",
  },
  {
    i: 5,
    folder: "Chatbot Maintenance and Support",
    alt: "Chatbot Maintenance and Support — knowledge base updates after launch",
    title: "Chatbot Maintenance and Support",
  },
];

function findDesktop(folder) {
  const dir = path.join(BASE, folder);
  if (!fs.existsSync(dir)) throw new Error("missing folder " + folder);
  const sub = fs
    .readdirSync(dir, { withFileTypes: true })
    .find((d) => d.isDirectory() && /^desktop$/i.test(d.name));
  if (!sub) throw new Error("no Desktop in " + folder);
  return path.join(dir, sub.name);
}

function pickSrc(folder) {
  const desk = findDesktop(folder);
  const files = fs
    .readdirSync(desk)
    .filter((n) => /\.(jpe?g|png|webp)$/i.test(n))
    .filter((n) => /^\d+\./i.test(n))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  if (!files.length) throw new Error("no numbered images in " + desk);
  const preferred = files.find((f) => /^2\./i.test(f));
  return path.join(desk, preferred || files[0]);
}

async function toWebp(srcPath) {
  let best = null;
  for (const [w, qStart] of [
    [1400, 72],
    [1200, 68],
    [1100, 62],
    [1024, 56],
    [960, 50],
    [880, 46],
  ]) {
    let lo = 40,
      hi = qStart;
    while (lo <= hi) {
      const q = Math.floor((lo + hi) / 2);
      const buf = await sharp(srcPath)
        .rotate()
        .resize({
          width: w,
          height: Math.round((w * 616) / 1024),
          fit: "cover",
          position: "centre",
        })
        .webp({ quality: q, effort: 6, smartSubsample: true })
        .toBuffer();
      if (buf.length <= MAX) {
        best = { buf, w, q, bytes: buf.length };
        lo = q + 1;
      } else hi = q - 1;
    }
    if (best && best.bytes < 70 * 1024) break;
  }
  if (!best) throw new Error("could not fit " + srcPath);
  const meta = await sharp(best.buf).metadata();
  const hash = crypto.createHash("sha256").update(best.buf).digest("hex").slice(0, 10);
  return { ...best, meta, hash };
}

function esc(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
}

const oldFiles = new Set(
  fs.readdirSync(OUT).filter((n) => /^acb-ac-\d{2}-[a-f0-9]+\.webp$/i.test(n))
);

const results = [];
let html = fs.readFileSync(BODY, "utf8");

for (const p of PANELS) {
  const src = pickSrc(p.folder);
  const { buf, w, q, meta, hash } = await toWebp(src);
  const name = `acb-ac-${String(p.i + 1).padStart(2, "0")}-${hash}.webp`;
  fs.writeFileSync(path.join(OUT, name), buf);
  oldFiles.delete(name);

  const img = `<img src="/images/${name}" width="${meta.width}" height="${meta.height}" alt="${esc(p.alt)}" title="${esc(p.title)}" decoding="async" loading="lazy">`;

  const itemRe = new RegExp(
    `(<div class="ac-item[^"]*"[^>]*data-i="${p.i}"[^>]*>\\s*<span class="ac-bg" aria-hidden="true">)\\s*(?:<img\\b[^>]*>|<span class="ac-fb"><\\/span>)`,
    "m"
  );
  if (!itemRe.test(html)) {
    throw new Error("html match failed for panel " + (p.i + 1));
  }
  html = html.replace(itemRe, `$1${img}`);

  results.push({
    i: p.i,
    file: `/images/${name}`,
    alt: p.alt,
    title: p.title,
    kb: +(buf.length / 1024).toFixed(1),
    width: meta.width,
    height: meta.height,
    enc: `w${w}q${q}`,
    src: path.relative(BASE, src).replace(/\\/g, "/"),
  });
  console.log(
    `P${p.i + 1}`,
    name,
    results[results.length - 1].kb + "KB",
    path.basename(src)
  );
}

for (const f of oldFiles) {
  fs.unlinkSync(path.join(OUT, f));
  console.log("deleted old", f);
}

fs.writeFileSync(BODY, html);
console.log("updated body html");

let css = fs.readFileSync(CSS, "utf8");
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
  if (lockIdx >= 0) {
    css = css.slice(0, lockIdx) + cssBlock + "\n" + css.slice(lockIdx);
  } else {
    css += "\n" + cssBlock;
  }
  fs.writeFileSync(CSS, css);
  console.log("updated CSS");
} else {
  console.log("CSS already has ac-bg img rules");
}

fs.writeFileSync(
  path.join(ROOT, "scripts", "_acb-ac-image-map.json"),
  JSON.stringify(results, null, 2) + "\n"
);
console.log("done");
