/**
 * AI Development #services-2 accordion: replace ax-g mockups with
 * folder photos (desktop), WebP < 80KB, alt+title like other pages.
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE =
  "C:/Users/Super/Downloads/ai-development-services-20261015T082601Z-1-001/ai-development-services/Services";
const OUT = path.join(ROOT, "public", "images");
const BODY = path.join(ROOT, "lib", "ai-development-body.html");
const CSS = path.join(ROOT, "app", "ai-development.css");
const MAX = 80 * 1024;

/** Match #services-2 .ax-p order (data-i 0..7) */
const PANELS = [
  { i: 0, folder: "Generative AI Development", alt: "Generative AI Development" },
  { i: 1, folder: "AI Chatbot Development", alt: "AI Chatbot Development" },
  { i: 2, folder: "AI Agent Development", alt: "AI Agent Development" },
  {
    i: 3,
    folder: "AI & Machine Learning (ML) Development",
    alt: "AI & Machine Learning (ML) Development",
  },
  { i: 4, folder: "Computer Vision Development", alt: "Computer Vision Development" },
  { i: 5, folder: "MLOps & AI Deployment", alt: "MLOps & AI Deployment" },
  { i: 6, folder: "Enterprise AI Integration", alt: "Enterprise AI Integration" },
  { i: 7, folder: "AI Consulting & Strategy", alt: "AI Consulting & Strategy" },
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
    [1200, 72],
    [1100, 68],
    [1024, 62],
    [960, 56],
    [880, 50],
    [800, 46],
  ]) {
    let lo = 40,
      hi = qStart;
    while (lo <= hi) {
      const q = Math.floor((lo + hi) / 2);
      const buf = await sharp(srcPath)
        .rotate()
        .resize({
          width: w,
          height: Math.round((w * 9) / 16),
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

const oldFiles = new Set(
  fs.readdirSync(OUT).filter((n) => /^aid-svc-\d{2}-[a-f0-9]+\.webp$/i.test(n))
);

const results = [];
let html = fs.readFileSync(BODY, "utf8");

for (const p of PANELS) {
  const src = pickSrc(p.folder);
  const { buf, w, q, meta, hash } = await toWebp(src);
  const name = `aid-svc-${String(p.i + 1).padStart(2, "0")}-${hash}.webp`;
  fs.writeFileSync(path.join(OUT, name), buf);
  oldFiles.delete(name);

  const altEsc = p.alt
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
  const img = `<img src="/images/${name}" width="${meta.width}" height="${meta.height}" alt="${altEsc}" title="${altEsc}" decoding="async" loading="lazy">`;
  const pic = `<figure class="ax-pic">${img}</figure>`;

  // Locate this panel, then replace its balanced <div class="ax-g">…</div>
  const marker = `data-i="${p.i}"`;
  const panelStart = html.indexOf(marker);
  if (panelStart < 0) throw new Error("panel not found data-i=" + p.i);
  const nextPanel =
    p.i < 7 ? html.indexOf(`data-i="${p.i + 1}"`, panelStart + 1) : html.indexOf("</section>", panelStart);
  const sliceEnd = nextPanel > 0 ? nextPanel : html.length;
  const chunk = html.slice(panelStart, sliceEnd);
  const gOpen = chunk.indexOf('<div class="ax-g">');
  if (gOpen < 0) throw new Error("ax-g not found for data-i=" + p.i);
  let depth = 0;
  let gEnd = -1;
  for (let i = gOpen; i < chunk.length; ) {
    if (chunk.startsWith("<div", i)) {
      depth++;
      const gt = chunk.indexOf(">", i);
      i = gt < 0 ? chunk.length : gt + 1;
      continue;
    }
    if (chunk.startsWith("</div>", i)) {
      depth--;
      i += 6;
      if (depth === 0) {
        gEnd = i;
        break;
      }
      continue;
    }
    i++;
  }
  if (gEnd < 0) throw new Error("ax-g close not found for data-i=" + p.i);
  const absOpen = panelStart + gOpen;
  const absEnd = panelStart + gEnd;
  html = html.slice(0, absOpen) + pic + html.slice(absEnd);

  results.push({
    i: p.i,
    file: `/images/${name}`,
    alt: p.alt,
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
  console.log("deleted", f);
}

fs.writeFileSync(BODY, html);
console.log("updated body html");

let css = fs.readFileSync(CSS, "utf8");
const marker = "/* AID services panel photos (#services-2 .ax-pic) */";
const cssBlock = `
${marker}
#services-2 .ax-pic{
  flex:1 1 0;
  width:auto;
  max-width:420px;
  min-width:0;
  align-self:center;
  margin:0;
  border-radius:22px;
  overflow:hidden;
  isolation:isolate;
  background:rgba(0,0,0,.12);
  box-shadow:0 24px 50px -28px rgba(0,0,0,.45);
}
#services-2 .ax-pic img{
  display:block;
  width:100%;
  height:100%;
  aspect-ratio:16/9;
  object-fit:cover;
  object-position:center;
}
@media (max-width:980px){
  #services-2 .ax-pic{display:none;}
}
@media (max-width:760px){
  #services-2 .ax-pic{
    display:block;
    flex:none;
    width:100%;
    max-width:none;
  }
}
`;

if (css.includes(marker)) {
  css = css.replace(
    /\/\* AID services panel photos[\s\S]*?(?=\n\/\*|\nhtml body|\n#|\n@media|$)/,
    cssBlock.trim() + "\n\n"
  );
} else {
  // Append near existing #services-2 .ax-g rules
  const anchor = "#services-2 .ax-g{";
  const idx = css.lastIndexOf(anchor);
  if (idx >= 0) {
    css = css.slice(0, idx) + cssBlock + css.slice(idx);
  } else {
    css += "\n" + cssBlock;
  }
}
fs.writeFileSync(CSS, css);
console.log("updated css");
console.log(JSON.stringify(results, null, 2));
