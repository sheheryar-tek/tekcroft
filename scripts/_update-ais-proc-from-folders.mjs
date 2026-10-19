import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE =
  "C:/Users/Super/Downloads/artificial-intelligence-services-20261019T072642Z-1-001/artificial-intelligence-services/process section";
const OUT = path.join(ROOT, "public", "images");
const BODY = path.join(ROOT, "lib", "artificial-intelligence-services-body.html");
const CSS_FILES = [
  path.join(ROOT, "app", "artificial-intelligence-services.css"),
  path.join(ROOT, "app", "artificial-intelligence-services-unlock.css"),
];
const MAX = 80 * 1024;

const STEPS = [
  {
    slug: "ais-proc-01",
    folder: "Discovery",
    file: "1.jpg",
    alt: "AI consultants mapping workflows and requirements on a whiteboard during the discovery phase",
    title: "1. Discovery — assess goals, workflows, and whether AI fits the problem",
  },
  {
    slug: "ais-proc-02",
    folder: "AI Strategy and Solution Design",
    prefer: /architect|touchscreen|dashboard|collaborat/i,
    alt: "AI strategist designing solution architecture and success metrics on a large interactive display",
    title: "2. AI Strategy and Solution Design — architecture and success metrics",
  },
  {
    slug: "ais-proc-03",
    folder: "Development",
    file: "3.jpg",
    alt: "Engineer building and integrating AI infrastructure at a server rack workstation",
    title: "3. Development — build, integrate, and keep stakeholders in the loop",
  },
  {
    slug: "ais-proc-04",
    folder: "Testing and Evaluation",
    file: "3.jpg",
    alt: "Specialist evaluating AI model metrics and performance charts before launch",
    title: "4. Testing and Evaluation — validate behavior with real data and edge cases",
  },
  {
    slug: "ais-proc-05",
    folder: "Deployment and Improvement",
    file: "2.jpg",
    alt: "Operations team monitoring a live AI system and iterating on performance after deployment",
    title: "5. Deployment and Improvement — launch, monitor, and refine in production",
  },
];

function pickSrc(step) {
  const dir = path.join(BASE, step.folder);
  if (!fs.existsSync(dir)) throw new Error("missing folder " + dir);
  if (step.file) {
    const preferred = path.join(dir, step.file);
    if (fs.existsSync(preferred)) return preferred;
  }
  const files = fs
    .readdirSync(dir)
    .filter((n) => /\.(jpe?g|png|webp)$/i.test(n))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  if (!files.length) throw new Error("no images in " + dir);
  if (step.prefer) {
    const hit = files.find((n) => step.prefer.test(n));
    if (hit) return path.join(dir, hit);
  }
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
    .filter((n) => /^ais-proc-\d{2}-[a-f0-9]+\.webp$/i.test(n))
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
  pics.push(
    `<span class="eg-pic"><img src="/images/${name}" width="${r.size}" height="${r.size}" alt="${escAttr(s.alt)}" title="${escAttr(s.title)}" decoding="async" loading="lazy"></span>`
  );
  results.push({
    slug: s.slug,
    file: `/images/${name}`,
    alt: s.alt,
    title: s.title,
    kb: +(r.bytes / 1024).toFixed(1),
    q: r.q,
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
console.log("updated body");

const cssBlock = `
/* Per-step disc photos (Our process — 5 stages) */
#process .eg-face{background:#0A0C0E; isolation:isolate;}
#process .eg-face::before{display:none !important;}
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
html[data-design="raw"] #process .eg-face::before{display:none !important;}
html[data-design="raw"] #process .eg-pic > img{
  position:absolute !important; inset:0 !important; width:100% !important; height:100% !important;
  object-fit:cover !important; object-position:center !important; display:block !important;
}
`;

for (const CSS of CSS_FILES) {
  let css = fs.readFileSync(CSS, "utf8");
  if (!css.includes("#process .eg-pic > img")) {
    const marker = ".eg-face > *{position:relative; z-index:1;}";
    const rawMarker =
      'html[data-design="raw"] .eg-face > *{position:relative !important; z-index:1 !important;}';
    let idx = css.indexOf(rawMarker);
    let len = rawMarker.length;
    if (idx < 0) {
      idx = css.indexOf(marker);
      len = marker.length;
    }
    if (idx >= 0) {
      css = css.slice(0, idx + len) + cssBlock + css.slice(idx + len);
    } else {
      css = css.trimEnd() + "\n" + cssBlock + "\n";
    }
    // Ensure stage 5 number lights up
    css = css.replace(
      /\.eg\[data-at="3"\] \.eg-num i:nth-child\(4\)\{opacity:1; visibility:visible;/g,
      `.eg[data-at="3"] .eg-num i:nth-child(4),
.eg[data-at="4"] .eg-num i:nth-child(5){opacity:1; visibility:visible;`
    );
    css = css.replace(
      /html\[data-design="raw"\] \.eg\[data-at="3"\] \.eg-num i:nth-child\(4\)\{opacity:1 !important; visibility:visible !important;/g,
      `html[data-design="raw"] .eg[data-at="3"] .eg-num i:nth-child(4),
html[data-design="raw"] .eg[data-at="4"] .eg-num i:nth-child(5){opacity:1 !important; visibility:visible !important;`
    );
    fs.writeFileSync(CSS, css);
    console.log("updated", path.basename(CSS));
  } else {
    console.log(path.basename(CSS), "already has eg-pic rules");
  }
}

for (const n of old) {
  fs.unlinkSync(path.join(OUT, n));
  console.log("deleted", n);
}

fs.writeFileSync(
  path.join(ROOT, "scripts", "_ais-proc-image-map.json"),
  JSON.stringify(results, null, 2) + "\n"
);
console.log("done");
