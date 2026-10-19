import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE =
  "C:/Users/Super/Downloads/seo-services-20261019T072642Z-1-001/seo-services/Services";
const OUT = path.join(ROOT, "public", "images");
const BODY = path.join(ROOT, "lib", "seo-services-body.html");
const CSS = path.join(ROOT, "app", "seo-services.css");
const MAX = 80 * 1024;

const PANELS = [
  {
    i: 0,
    folder: "Technical SEO",
    file: "3.jpg",
    alt: "Technical SEO specialist reviewing a technical audit dashboard, site architecture, and crawl metrics on a curved monitor",
    title: "Technical SEO — crawl, indexing, speed, and site structure",
  },
  {
    i: 1,
    folder: "On Page SEO",
    file: "1.jpg",
    alt: "On-page SEO specialist optimizing H1 headings, page layout, and page optimization metrics on an ultrawide monitor",
    title: "On Page SEO — titles, headings, structure, and on-page optimization",
  },
  {
    i: 2,
    folder: "SEO Content",
    file: "2.jpg",
    alt: "SEO content strategist mapping content topic clusters and content performance charts on an ultrawide display",
    title: "SEO Content — topic clusters and search-led content strategy",
  },
  {
    i: 3,
    folder: "Local SEO",
    file: "1.jpg",
    alt: "Local SEO specialist reviewing map rankings, location pins, and local search results on a desktop monitor",
    title: "Local SEO — maps, listings, reviews, and local visibility",
  },
  {
    i: 4,
    folder: "Ecommerce SEO",
    file: "1.jpg",
    alt: "Ecommerce SEO specialist analyzing product grids, category navigation, and store performance metrics",
    title: "Ecommerce SEO — product pages, categories, and ecommerce growth",
  },
  {
    i: 5,
    folder: "AI SEO",
    file: "1.jpg",
    alt: "AI SEO specialist monitoring answer-engine results, organic visibility, and search ranking data on a curved monitor",
    title: "AI SEO — AI Overviews, answer engines, and AI search visibility",
  },
  {
    i: 6,
    folder: "SEO Audits",
    file: "2.jpg",
    alt: "SEO auditor reviewing an SEO audit dashboard with technical health, crawler indexing, and organic traffic trends",
    title: "SEO Audits — site health, indexing gaps, and prioritized fixes",
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
    .filter((n) => /^seosvc-tm-\d{2}-[a-f0-9]+\.webp$/i.test(n))
);

const results = [];
let html = fs.readFileSync(BODY, "utf8");

for (const p of PANELS) {
  const src = path.join(findDesktop(p.folder), p.file);
  if (!fs.existsSync(src)) throw new Error("missing " + src);
  const { buf, w, q, meta, hash } = await toWebp(src);
  const name = `seosvc-tm-${String(p.i + 1).padStart(2, "0")}-${hash}.webp`;
  fs.writeFileSync(path.join(OUT, name), buf);
  oldFiles.delete(name);

  const altEsc = escAttr(p.alt);
  const titleEsc = escAttr(p.title);
  const img = `<img src="/images/${name}" width="${meta.width}" height="${meta.height}" alt="${altEsc}" title="${titleEsc}" decoding="async" loading="lazy">`;
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
    width: meta.width,
    height: meta.height,
    enc: `w${w}q${q}`,
    src: `${p.folder}/Desktop/${p.file}`,
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
console.log("updated seo-services-body.html");

let css = fs.readFileSync(CSS, "utf8");
const sharedBg =
  /#seo-services-page \.tm-bg\{position:absolute; inset:0; opacity:0; transition:opacity \.55s var\(--ease\) \.05s;\s*background:url\("\/images\/seo-services\/seo-svc-css1-[a-f0-9]+\.webp"\) center\/cover no-repeat;\}/;
if (sharedBg.test(css)) {
  css = css.replace(
    sharedBg,
    `#seo-services-page .tm-bg{position:absolute; inset:0; opacity:0; transition:opacity .55s var(--ease) .05s; background:none;}`
  );
  console.log("cleared shared .tm-bg background url");
} else if (css.includes("#seo-services-page .tm-bg{position:absolute")) {
  css = css.replace(
    /(#seo-services-page \.tm-bg\{position:absolute; inset:0; opacity:0; transition:opacity \.55s var\(--ease\) \.05s;)[^}]*\}/,
    `$1 background:none;}`
  );
  console.log("normalized .tm-bg background to none");
}

const imgRules = `
/* SEO Services TM panel photos (#services) */
#seo-services-page #services .tm-bg{background:none !important;}
#seo-services-page #services .tm-bg > img{position:absolute; inset:0; width:100%; height:100%; object-fit:cover; display:block;}
#seo-services-page #services .tm-veil{z-index:1;}
`;
if (!css.includes("#seo-services-page #services .tm-bg > img")) {
  const anchor = "#seo-services-page .tm-item.on .tm-bg{opacity:1;}";
  const idx = css.indexOf(anchor);
  if (idx < 0) throw new Error("CSS anchor not found");
  css =
    css.slice(0, idx + anchor.length) +
    imgRules +
    css.slice(idx + anchor.length);
  console.log("added #services tm img cover rules");
} else {
  console.log("seo-services.css already has tm img rules");
}

fs.writeFileSync(CSS, css);
console.log("updated seo-services.css");

fs.writeFileSync(
  path.join(ROOT, "scripts", "_seo-services-tm-image-map.json"),
  JSON.stringify(results, null, 2) + "\n"
);
console.log("done");
