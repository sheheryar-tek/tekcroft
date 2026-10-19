import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE =
  "C:/Users/Super/Downloads/artificial-intelligence-services-20261019T072642Z-1-001/artificial-intelligence-services/Services";
const OUT = path.join(ROOT, "public", "images");
const BODY = path.join(ROOT, "lib", "artificial-intelligence-services-body.html");
const CSS = path.join(ROOT, "app", "artificial-intelligence-services.css");
const UNLOCK = path.join(ROOT, "app", "artificial-intelligence-services-unlock.css");
const MAX = 80 * 1024;

const PANELS = [
  {
    i: 0,
    folder: "Custom AI Development Services",
    file: "3.jpg",
    alt: "Logistics specialist using a Tekcroft AI predictive dashboard for demand forecasting and inventory mapping in a warehouse",
    title: "Custom AI Development — predictive models and production systems built around your data",
  },
  {
    i: 1,
    folder: "AI Chatbot Development Services",
    file: "1.jpg",
    alt: "Professional using a Tekcroft AI Assistant chatbot interface with knowledge base search in a modern office",
    title: "AI Chatbot Development — conversational AI for support and internal help desks",
  },
  {
    i: 2,
    folder: "AI Agent Development Services",
    file: "3.jpg",
    alt: "Manager reviewing Tekcroft Agent Workflow Manager with multi-step automation and a human approval checkpoint",
    title: "AI Agent Development — multi-step workflows with actions and guardrails",
  },
];

function findDesktop(folder) {
  const dir = path.join(BASE, folder);
  const sub = fs
    .readdirSync(dir, { withFileTypes: true })
    .find((d) => d.isDirectory() && /^desktop$/i.test(d.name));
  if (!sub) throw new Error("no Desktop in " + folder);
  return path.join(dir, sub.name);
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

function escAttr(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
}

const oldFiles = new Set(
  fs
    .readdirSync(OUT)
    .filter((n) => /^ais-tm-\d{2}-[a-f0-9]+\.webp$/i.test(n))
);

const results = [];
let html = fs.readFileSync(BODY, "utf8");

for (const p of PANELS) {
  const src = path.join(findDesktop(p.folder), p.file);
  if (!fs.existsSync(src)) throw new Error("missing " + src);
  const { buf, w, q, meta, hash } = await toWebp(src);
  const name = `ais-tm-${String(p.i + 1).padStart(2, "0")}-${hash}.webp`;
  fs.writeFileSync(path.join(OUT, name), buf);
  oldFiles.delete(name);

  const img = `<img src="/images/${name}" width="${meta.width}" height="${meta.height}" alt="${escAttr(p.alt)}" title="${escAttr(p.title)}" decoding="async" loading="lazy">`;
  const replacement = `<span class="tm-bg" aria-hidden="true">${img}<span class="tm-veil"></span></span>`;

  const itemRe = new RegExp(
    `(<div class="tm-item[^"]*"[^>]*data-i="${p.i}"[^>]*>)\\s*<span class="tm-bg" aria-hidden="true">(?:<img[^>]*>)?\\s*<span class="tm-veil"><\\/span><\\/span>`,
    "m"
  );
  if (!itemRe.test(html)) {
    throw new Error("html match failed for panel " + (p.i + 1));
  }
  html = html.replace(itemRe, `$1${replacement}`);

  results.push({
    i: p.i,
    file: `/images/${name}`,
    alt: p.alt,
    title: p.title,
    kb: +(buf.length / 1024).toFixed(1),
    enc: `w${w}q${q}`,
    src: `${p.folder}/Desktop/${p.file}`,
  });
  console.log(`P${p.i + 1}`, name, results.at(-1).kb + "KB", path.basename(src));
}

for (const f of oldFiles) {
  fs.unlinkSync(path.join(OUT, f));
  console.log("deleted", f);
}

fs.writeFileSync(BODY, html);
console.log("updated body");

function patchCss(filePath, label) {
  let css = fs.readFileSync(filePath, "utf8");
  // Clear shared background url on .tm-bg
  css = css.replace(
    /(\.tm-bg\{[^}]*?)background:url\("\/images\/[^"]+"\)\s*center\/cover\s*no-repeat;?/g,
    "$1background:none;"
  );
  css = css.replace(
    /(html\[data-design="raw"\] \.tm-bg\{[^}]*?)background:url\("\/images\/[^"]+"\)\s*center\/cover\s*no-repeat\s*!important;?/g,
    "$1background:none !important;"
  );

  const imgRules = `
/* AIS TM panel photos (#model) */
#model .tm-bg{background:none !important;}
#model .tm-bg > img{position:absolute; inset:0; width:100%; height:100%; object-fit:cover; display:block;}
#model .tm-veil{z-index:1;}
html[data-design="raw"] #model .tm-bg{background:none !important;}
html[data-design="raw"] #model .tm-bg > img{position:absolute !important; inset:0 !important; width:100% !important; height:100% !important; object-fit:cover !important; display:block !important;}
`;
  if (!css.includes("#model .tm-bg > img")) {
    const anchors = [
      ".tm-item.on .tm-bg{opacity:1;}",
      'html[data-design="raw"] .tm-item.on .tm-bg{opacity:1 !important;}',
    ];
    let inserted = false;
    for (const anchor of anchors) {
      const idx = css.indexOf(anchor);
      if (idx >= 0) {
        css =
          css.slice(0, idx + anchor.length) +
          imgRules +
          css.slice(idx + anchor.length);
        inserted = true;
        break;
      }
    }
    if (!inserted) css = css.trimEnd() + "\n" + imgRules + "\n";
    console.log(label + ": added #model tm img rules");
  } else {
    console.log(label + ": tm img rules already present");
  }
  fs.writeFileSync(filePath, css);
}

patchCss(CSS, "css");
patchCss(UNLOCK, "unlock");

fs.writeFileSync(
  path.join(ROOT, "scripts", "_ais-tm-image-map.json"),
  JSON.stringify(results, null, 2) + "\n"
);
console.log("done");
