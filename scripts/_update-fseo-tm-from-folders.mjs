/**
 * Franchise SEO #franchise-covers ("What we do"): encode SERVICES folder
 * photos to WebP <80KB and wire them into .tm-bg as <img> with alt + title.
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE =
  "C:/Users/Super/Downloads/Franchise SEO-20261012T132616Z-1-001/Franchise SEO/SERVICES";
const OUT = path.join(ROOT, "public", "images");
const BODY = path.join(ROOT, "lib", "franchise-seo-body.html");
const LOCK = path.join(ROOT, "app", "franchise-covers-lock.css");
const PAGE_CSS = path.join(ROOT, "app", "franchise-seo.css");
const MAX = 80 * 1024;

const PANELS = [
  {
    i: 0,
    folder: "Franchise Keyword Research & Location Mapping",
    alt: "SEO strategist mapping franchise keywords to city and service locations on a large screen",
    title: "Franchise Keyword Research & Location Mapping",
  },
  {
    i: 1,
    folder: "Local SEO & Franchise Google Business Profile Management",
    alt: "Marketer optimizing multiple franchise Google Business Profile listings on a laptop and phone",
    title: "Local SEO & Franchise Google Business Profile Management",
  },
  {
    i: 2,
    folder: "Location Page Architecture & Content",
    alt: "Content architect reviewing a franchise location page hierarchy from national hub to city pages",
    title: "Location Page Architecture & Content",
  },
  {
    i: 3,
    folder: "Franchise Technical SEO",
    alt: "Technical SEO specialist auditing franchise site crawl, canonicals and Core Web Vitals on dual monitors",
    title: "Franchise Technical SEO",
  },
  {
    i: 4,
    folder: "Franchise Link Building",
    alt: "Link building specialist reviewing franchise citations and local authority links on a dashboard",
    title: "Franchise Link Building",
  },
  {
    i: 5,
    folder: "Franchise Review Management",
    alt: "Reputation manager monitoring franchise location star ratings and owner review responses",
    title: "Franchise Review Management",
  },
  {
    i: 6,
    folder: "Conversion Rate Optimization for Franchise Lead Paths",
    alt: "CRO specialist testing franchise location landing page call buttons and lead forms on mobile",
    title: "Conversion Rate Optimization for Franchise Lead Paths",
  },
  {
    i: 7,
    folder: "AI Search  GEO Visibility for Franchises",
    alt: "Analyst tracking franchise brand mentions inside AI Overview and generative search results",
    title: "AI Search / GEO Visibility for Franchises",
  },
  {
    i: 8,
    folder: "Reporting & Franchise Governance Playbooks",
    alt: "Franchise SEO lead reviewing brand-level and location-level reporting dashboards and playbooks",
    title: "Reporting & Franchise Governance Playbooks",
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
  // Prefer 1.jpg (primary panel photo); fall back to 2.jpg then first file.
  const preferred =
    files.find((f) => /^1\./i.test(f)) ||
    files.find((f) => /^2\./i.test(f)) ||
    files[0];
  return path.join(desk, preferred);
}

function esc(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
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
    [800, 42],
  ]) {
    let lo = 36,
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
  if (!best) throw new Error("could not fit under 80KB: " + srcPath);
  const meta = await sharp(best.buf).metadata();
  const hash = crypto.createHash("sha256").update(best.buf).digest("hex").slice(0, 10);
  return { ...best, meta, hash };
}

const oldFiles = new Set(
  fs
    .readdirSync(OUT)
    .filter((n) => /^fseo-tm-\d{2}-[a-f0-9]+\.webp$/i.test(n))
);

const results = [];
let html = fs.readFileSync(BODY, "utf8");

for (const p of PANELS) {
  const src = pickSrc(p.folder);
  const { buf, w, q, meta, hash } = await toWebp(src);
  const name = `fseo-tm-${String(p.i + 1).padStart(2, "0")}-${hash}.webp`;
  fs.writeFileSync(path.join(OUT, name), buf);
  oldFiles.delete(name);

  const loading = p.i === 0 ? 'fetchpriority="high"' : 'loading="lazy"';
  const img = `<img src="/images/${name}" width="${meta.width}" height="${meta.height}" alt="${esc(p.alt)}" title="${esc(p.title)}" decoding="async" ${loading}>`;

  const itemRe = new RegExp(
    `(<div class="tm-item[^"]*"[^>]*data-i="${p.i}"[^>]*>\\s*)<span class="tm-bg"[^>]*>[\\s\\S]*?<\\/span>\\s*(?=<span class="tm-slim")`,
    "m"
  );
  if (!itemRe.test(html)) {
    throw new Error("html match failed for panel " + (p.i + 1));
  }
  html = html.replace(
    itemRe,
    `$1<span class="tm-bg">${img}<span class="tm-veil" aria-hidden="true"></span></span>\n          `
  );

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
  console.log("deleted", f);
}

fs.writeFileSync(BODY, html);
console.log("updated body html");

/* CSS: per-panel <img>, kill shared covers-panel-bg.jpg */
const imgRules = `
/* Franchise SEO Covers TM panel photos (#franchise-covers) */
#franchise-covers .tm-bg{
  background:none !important;
}
#franchise-covers .tm-bg > img{
  position:absolute; inset:0; width:100%; height:100%;
  object-fit:cover; display:block; z-index:0;
}
#franchise-covers .tm-veil{z-index:1;}
`;

function ensureImgCss(filePath) {
  if (!fs.existsSync(filePath)) return;
  let css = fs.readFileSync(filePath, "utf8");
  // Strip shared jpg lock so individual panel photos show
  css = css.replace(
    /#franchise-covers \.tm-bg\{[^}]*covers-panel-bg\.jpg[^}]*\}/g,
    "#franchise-covers .tm-bg{background:none !important;}"
  );
  css = css.replace(
    /background:url\("\/images\/franchise-seo\/covers-panel-bg\.jpg"\)[^;!]*!important;?/g,
    "background:none !important;"
  );
  if (!css.includes("#franchise-covers .tm-bg > img")) {
    css = css.replace(/\s*$/, "\n" + imgRules);
  }
  fs.writeFileSync(filePath, css);
  console.log("updated CSS", path.relative(ROOT, filePath));
}

ensureImgCss(LOCK);
ensureImgCss(PAGE_CSS);

fs.writeFileSync(
  path.join(ROOT, "scripts", "_fseo-tm-image-map.json"),
  JSON.stringify(results, null, 2) + "\n"
);
console.log("done");
