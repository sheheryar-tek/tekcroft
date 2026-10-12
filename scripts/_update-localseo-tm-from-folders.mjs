import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE =
  "C:/Users/Super/Downloads/Local SEO-20261012T103632Z-1-001/Local SEO/services";
const OUT = path.join(ROOT, "public", "images");
const BODY = path.join(ROOT, "lib", "local-seo-body.html");
const CSS = path.join(ROOT, "app", "local-seo.css");
const MAX = 80 * 1024;

// Panel order matches #services-2 data-i / h3 headings
const PANELS = [
  {
    i: 0,
    folder: "Google Business Profile Optimization",
    alt: "Google Business Profile Optimization",
  },
  {
    i: 1,
    folder: "Local Citation Building & NAP Consistency",
    alt: "Local Citation Building & NAP Consistency",
  },
  {
    i: 2,
    folder: "Local On-Page SEO & Schema Markup",
    alt: "Local On-Page SEO & Schema Markup",
  },
  {
    i: 3,
    folder: "Local Link Building (White-Hat Only)",
    alt: "Local Link Building (White-Hat Only)",
  },
  {
    i: 4,
    folder: "Review Generation & Management",
    alt: "Review Generation & Management",
  },
  {
    i: 5,
    folder: "AI Search & Answer Engine Visibility",
    alt: "AI Search & Answer Engine Visibility",
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

function pickSrc(folder) {
  const desk = findDesktop(folder);
  const files = fs
    .readdirSync(desk)
    .filter((n) => /\.(jpe?g|png|webp)$/i.test(n))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  if (!files.length) throw new Error("no images in " + desk);
  // Prefer 2.jpg when present (same convention as AI SEO TM updates)
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

const oldFiles = new Set(
  fs
    .readdirSync(OUT)
    .filter((n) => /^localseo-tm-\d{2}-[a-f0-9]+\.webp$/i.test(n))
);

const results = [];
let html = fs.readFileSync(BODY, "utf8");

for (const p of PANELS) {
  const src = pickSrc(p.folder);
  if (!fs.existsSync(src)) throw new Error("missing " + src);
  const { buf, w, q, meta, hash } = await toWebp(src);
  const name = `localseo-tm-${String(p.i + 1).padStart(2, "0")}-${hash}.webp`;
  fs.writeFileSync(path.join(OUT, name), buf);
  oldFiles.delete(name);
  const altEsc = p.alt
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
  const img = `<img src="/images/${name}" width="${meta.width}" height="${meta.height}" alt="${altEsc}" title="${altEsc}" decoding="async" loading="lazy">`;

  // Replace the full tm-bg span for this data-i panel (handles nested veil)
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
    results[results.length - 1].kb + "KB",
    path.basename(src)
  );
}

for (const f of oldFiles) {
  fs.unlinkSync(path.join(OUT, f));
  console.log("deleted", f);
}

fs.writeFileSync(BODY, html);
console.log("updated local-seo-body.html");

// CSS: drop shared placeholder bg for this section; cover img like AI SEO
let css = fs.readFileSync(CSS, "utf8");
const cssBlock = `
/* Local SEO TM panel photos (#services-2) */
#services-2 .tm-bg{background:none;}
#services-2 .tm-bg > img{position:absolute; inset:0; width:100%; height:100%; object-fit:cover; display:block;}
#services-2 .tm-veil{z-index:1;}
`;
if (!css.includes("#services-2 .tm-bg > img")) {
  const anchor = ".tm-item.on .tm-bg{opacity:1;}";
  const idx = css.indexOf(anchor);
  if (idx < 0) throw new Error("CSS anchor not found");
  // insert after first occurrence near TM section — find the one after .tm-bg{position
  const tmBg = css.indexOf(".tm-bg{position:absolute; inset:0; opacity:0;");
  const onBg = css.indexOf(anchor, tmBg);
  if (onBg < 0) throw new Error("CSS on .tm-bg not found near TM");
  css =
    css.slice(0, onBg + anchor.length) +
    cssBlock +
    css.slice(onBg + anchor.length);
  fs.writeFileSync(CSS, css);
  console.log("updated local-seo.css");
} else {
  console.log("local-seo.css already has tm img rules");
}

fs.writeFileSync(
  path.join(ROOT, "scripts", "_localseo-tm-image-map.json"),
  JSON.stringify(results, null, 2) + "\n"
);
console.log("done");
