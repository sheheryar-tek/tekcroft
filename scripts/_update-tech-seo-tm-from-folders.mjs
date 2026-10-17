import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE =
  "C:/Users/Super/Downloads/Technical-SEO-20261017T080858Z-1-001/Technical-SEO/Services";
const OUT = path.join(ROOT, "public", "images");
const BODY = path.join(ROOT, "lib", "technical-seo-body.html");
const CSS = path.join(ROOT, "app", "technical-seo.css");
const MAX = 80 * 1024;

const PANELS = [
  { i: 0, folder: "Technical-Audit", alt: "Technical SEO Audit" },
  { i: 1, folder: "04-Crawl-Budget", alt: "Crawlability Budget Optimization" },
  {
    i: 2,
    folder: "05-Core-Web-Vitals",
    alt: "Core Web Vitals Optimization Services",
  },
  {
    i: 3,
    folder: "06-Schema-Markup",
    alt: "Schema Markup Implementation Services",
  },
  { i: 4, folder: "07-JavaScript-SEO", alt: "JavaScript SEO" },
  {
    i: 5,
    folder: "08-Canonicalization",
    alt: "Canonicalization & Duplicate Content",
  },
  { i: 6, folder: "09-Mobile-Optimization", alt: "Mobile Optimization" },
  {
    i: 7,
    folder: "10-Website-Migration",
    alt: "Website Migration SEO Services",
  },
  { i: 8, folder: "11-Log-Analysis", alt: "Log File Analysis" },
  {
    i: 9,
    folder: "12-Monitoring",
    alt: "Ongoing Monitoring & Governance",
  },
  {
    i: 10,
    folder: "13-AI-Crawlability",
    alt: "Technical SEO for AI/LLM Crawlability",
  },
];

function findDesktopDir(folder) {
  const dir = path.join(BASE, folder);
  if (!fs.existsSync(dir)) throw new Error("missing folder: " + folder);
  const sub = fs
    .readdirSync(dir, { withFileTypes: true })
    .find(
      (d) =>
        d.isDirectory() && /^(desktop|dextop)$/i.test(d.name)
    );
  return sub ? path.join(dir, sub.name) : dir;
}

function pickSrc(folder) {
  const desk = findDesktopDir(folder);
  const files = fs
    .readdirSync(desk)
    .filter((n) => /\.(jpe?g|png|webp)$/i.test(n))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  if (!files.length) throw new Error("no images in " + desk);
  const opt2 = files.find((f) => /option-0?2/i.test(f) || /^2\./i.test(f));
  const opt1 = files.find((f) => /option-0?1/i.test(f) || /^1\./i.test(f));
  return path.join(desk, opt2 || opt1 || files[0]);
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
      const buf = await sharp(srcPath, { failOn: "none" })
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
  const hash = crypto
    .createHash("sha256")
    .update(best.buf)
    .digest("hex")
    .slice(0, 10);
  return { ...best, meta, hash };
}

const oldTm = new Set(
  fs
    .readdirSync(OUT)
    .filter(
      (n) =>
        /^tm-(audit|crawl|cwv|schema|js|canon|mobile|mig|log|mon|ai)-[a-f0-9]+\.webp$/i.test(
          n
        ) || /^tech-tm-\d{2}-[a-f0-9]+\.webp$/i.test(n)
    )
);

const results = [];
let html = fs.readFileSync(BODY, "utf8");

for (const p of PANELS) {
  const src = pickSrc(p.folder);
  if (!fs.existsSync(src)) throw new Error("missing " + src);
  const { buf, w, q, meta, hash } = await toWebp(src);
  const name = `tech-tm-${String(p.i + 1).padStart(2, "0")}-${hash}.webp`;
  fs.writeFileSync(path.join(OUT, name), buf);
  oldTm.delete(name);

  const altEsc = p.alt
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
  const img = `<img src="/images/${name}" width="${meta.width}" height="${meta.height}" alt="${altEsc}" title="${altEsc}" decoding="async" loading="lazy">`;

  const itemRe = new RegExp(
    `(<div class="tm-item[^"]*"[^>]*data-i="${p.i}"[^>]*>\\s*)<span class="tm-bg" aria-hidden="true">[\\s\\S]*?<\\/span>\\s*(?=<span class="tm-slim")`,
    "m"
  );
  if (!itemRe.test(html)) {
    throw new Error("html match failed for panel " + (p.i + 1));
  }
  html = html.replace(
    itemRe,
    `$1<span class="tm-bg" aria-hidden="true">${img}<span class="tm-veil"></span></span>\n          `
  );

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
    results.at(-1).kb + "KB",
    path.basename(src)
  );
}

for (const f of oldTm) {
  fs.unlinkSync(path.join(OUT, f));
  console.log("deleted", f);
}

fs.writeFileSync(BODY, html);
console.log("updated body html");

let css = fs.readFileSync(CSS, "utf8");
// Remove per-panel background-image rules
css = css.replace(
  /\/\* per-panel backgrounds — one image each \*\/\s*(?:#model \.tm-item\[data-i="\d+"\] \.tm-bg\{background-image:url\("[^"]+"\);\}\s*)+/,
  ""
);
css = css.replace(
  /#model \.tm-item\[data-i="\d+"\] \.tm-bg\{background-image:url\("[^"]+"\);\}\s*/g,
  ""
);

const cssBlock = `
/* Technical SEO Model panel photos (#model) */
#model .tm-bg{background-image:none;}
#model .tm-bg > img{position:absolute; inset:0; width:100%; height:100%; object-fit:cover; display:block;}
#model .tm-veil{z-index:1;}
`;

if (css.includes("#model .tm-bg > img{")) {
  css = css.replace(
    /\/\* Technical SEO Model panel photos[\s\S]*?#model \.tm-veil\{z-index:1;\}\s*/,
    cssBlock.trimStart()
  );
} else {
  const anchor = ".tm-item.on .tm-bg{opacity:1;}";
  const idx = css.indexOf(anchor);
  if (idx < 0) throw new Error("CSS anchor not found");
  css =
    css.slice(0, idx + anchor.length) +
    cssBlock +
    css.slice(idx + anchor.length);
}
fs.writeFileSync(CSS, css);
console.log("updated CSS");

fs.writeFileSync(
  path.join(ROOT, "scripts", "_tech-seo-tm-image-map.json"),
  JSON.stringify(results, null, 2) + "\n"
);
console.log("done");
