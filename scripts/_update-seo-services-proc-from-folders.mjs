import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE =
  "C:/Users/Super/Downloads/seo-services-20261019T072642Z-1-001/seo-services/process section";
const OUT = path.join(ROOT, "public", "images");
const BODY = path.join(ROOT, "lib", "seo-services-body.html");
const CSS = path.join(ROOT, "app", "seo-services.css");
const MAX = 80 * 1024;

const STEPS = [
  {
    slug: "seosvc-proc-01",
    folder: "Identify opportunities",
    file: "2.jpg",
    alt: "SEO specialist analyzing competitor comparison and organic traffic trends to identify growth opportunities",
    title: "1. Identify opportunities — competitor and search data analysis",
  },
  {
    slug: "seosvc-proc-02",
    folder: "Determine the order",
    file: "2.jpg",
    alt: "SEO strategist prioritizing work on a project planning board with a priority matrix and task columns",
    title: "2. Determine the order — prioritize high-impact SEO work",
  },
  {
    slug: "seosvc-proc-03",
    folder: "3. Execute the plan",
    file: "2.jpg",
    alt: "SEO team executing technical, on-page, and content improvements against a live project plan",
    title: "3. Execute the plan — implement prioritized SEO fixes",
  },
  {
    slug: "seosvc-proc-04",
    folder: "Adjust",
    file: "2.jpg",
    alt: "SEO analyst reviewing performance dashboards to adjust strategy as search and market conditions change",
    title: "4. Adjust — measure results and refine the SEO strategy",
  },
];

function pickSrc(step) {
  const dir = path.join(BASE, step.folder);
  const preferred = path.join(dir, step.file);
  if (fs.existsSync(preferred)) return preferred;
  const files = fs
    .readdirSync(dir)
    .filter((n) => /\.(jpe?g|png|webp)$/i.test(n))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  if (!files.length) throw new Error("no images in " + dir);
  return path.join(dir, files[0]);
}

function escAttr(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
}

async function encodeUnder(srcPath) {
  let best = null;
  for (const size of [720, 640, 560, 480]) {
    let lo = 48,
      hi = 88;
    while (lo <= hi) {
      const q = Math.floor((lo + hi) / 2);
      const out = await sharp(srcPath)
        .rotate()
        .resize({ width: size, height: size, fit: "cover", position: "centre" })
        .webp({ quality: q, effort: 6, smartSubsample: true })
        .toBuffer();
      if (out.length <= MAX) {
        best = { buf: out, q, size, bytes: out.length };
        lo = q + 1;
      } else hi = q - 1;
    }
    if (best && best.bytes < 70 * 1024) break;
  }
  if (!best) throw new Error("could not fit " + srcPath);
  return best;
}

const old = new Set(
  fs
    .readdirSync(OUT)
    .filter((n) => /^seosvc-proc-\d{2}-[a-f0-9]+\.webp$/i.test(n))
);

const results = [];
const pics = [];

for (const s of STEPS) {
  const src = pickSrc(s);
  const r = await encodeUnder(src);
  const hash = crypto.createHash("sha1").update(r.buf).digest("hex").slice(0, 10);
  const name = `${s.slug}-${hash}.webp`;
  fs.writeFileSync(path.join(OUT, name), r.buf);
  old.delete(name);
  const altEsc = escAttr(s.alt);
  const titleEsc = escAttr(s.title);
  pics.push(
    `<span class="eg-pic"><img src="/images/${name}" width="${r.size}" height="${r.size}" alt="${altEsc}" title="${titleEsc}" decoding="async" loading="lazy"></span>`
  );
  results.push({
    slug: s.slug,
    file: `/images/${name}`,
    alt: s.alt,
    title: s.title,
    kb: +(r.bytes / 1024).toFixed(1),
    q: r.q,
    w: r.size,
    src: path.relative(BASE, src).replace(/\\/g, "/"),
  });
  console.log(name, results.at(-1).kb + "KB", path.basename(src));
}

let html = fs.readFileSync(BODY, "utf8");
const faceRe =
  /(<div class="eg-face">)([\s\S]*?)(<\/div>\s*<\/div>\s*<div class="eg-list">)/;
if (!faceRe.test(html)) throw new Error("eg-face block not found");

html = html.replace(faceRe, (_, open, inner, close) => {
  const rest = inner.replace(/<span class="eg-pic">[\s\S]*?<\/span>\s*/g, "");
  return `${open}\n          ${pics.join(
    "\n          "
  )}\n${rest.trimStart()}${close}`;
});

fs.writeFileSync(BODY, html);
console.log("updated seo-services-body.html");

let css = fs.readFileSync(CSS, "utf8");
const cssBlock = `
/* Per-step disc photos (How We Approach SEO) — replace single --shot-3 ::before */
#seo-services-page #process .eg-face::before{display:none;}
#seo-services-page #process .eg-face::after{z-index:1;}
#seo-services-page #process .eg-pic{
  position:absolute; inset:0; z-index:0;
  background:none;
  opacity:0; visibility:hidden;
  transition:opacity .45s var(--ease), visibility 0s linear .45s;
}
#seo-services-page #process .eg[data-at="0"] .eg-pic:nth-child(1),
#seo-services-page #process .eg[data-at="1"] .eg-pic:nth-child(2),
#seo-services-page #process .eg[data-at="2"] .eg-pic:nth-child(3),
#seo-services-page #process .eg[data-at="3"] .eg-pic:nth-child(4),
#seo-services-page #process .eg:not([data-at]) .eg-pic:nth-child(1){
  opacity:1; visibility:visible; transition-delay:0s;
}
#seo-services-page #process .eg-pic > img{
  position:absolute; inset:0; width:100%; height:100%;
  object-fit:cover; object-position:center; display:block;
}
#seo-services-page #process .eg-face > *:not(.eg-pic){position:relative; z-index:2;}
`;

if (!css.includes("#seo-services-page #process .eg-pic > img")) {
  const marker = "#seo-services-page .eg-face > *{position:relative; z-index:1;}";
  const idx = css.indexOf(marker);
  if (idx < 0) throw new Error("CSS marker not found");
  css =
    css.slice(0, idx + marker.length) +
    cssBlock +
    css.slice(idx + marker.length);
  fs.writeFileSync(CSS, css);
  console.log("updated seo-services.css");
} else {
  console.log("seo-services.css already has eg-pic rules");
}

for (const n of old) {
  fs.unlinkSync(path.join(OUT, n));
  console.log("deleted", n);
}

fs.writeFileSync(
  path.join(ROOT, "scripts", "_seo-services-proc-image-map.json"),
  JSON.stringify(results, null, 2) + "\n"
);
console.log("done");
