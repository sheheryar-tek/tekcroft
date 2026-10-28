/**
 * AI Agent #agent-services: encode Services folder photos to WebP <80KB
 * and wire them into .tm-bg as real <img> with alt + title.
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE =
  "C:/Users/Super/Downloads/ai-agent-development-services-20261016T081828Z-1-001/ai-agent-development-services/Services";
const OUT = path.join(ROOT, "public", "images", "ai-agent");
const BODY = path.join(ROOT, "lib", "ai-agent-development-body.html");
const CSS = path.join(ROOT, "app", "ai-agent-services-tm.css");
const MAX = 80 * 1024;

const SERVICES = [
  {
    i: 0,
    folder: "AI Agent Strategy & Consulting",
    slug: "ag-svc-01",
    alt: "Two strategists reviewing AI agent feasibility charts, flow diagrams and a tablet in a boardroom",
    title: "AI Agent Strategy & Consulting",
  },
  {
    i: 1,
    folder: "Custom AI Agent Development",
    slug: "ag-svc-02",
    alt: "Developer building a custom AI agent at a multi-monitor workstation with code and architecture diagrams",
    title: "Custom AI Agent Development",
  },
  {
    i: 2,
    folder: "Multi-Agent System Design",
    slug: "ag-svc-03",
    alt: "Consultant presenting a multi-agent system architecture diagram on a large digital screen",
    title: "Multi-Agent System Design",
  },
  {
    i: 3,
    folder: "AI Agent Integration",
    slug: "ag-svc-04",
    alt: "Engineer reviewing an AI agent integration dashboard connecting CRM, ERP, APIs and legacy systems",
    title: "AI Agent Integration",
  },
  {
    i: 4,
    folder: "AI Agent Testing & Evaluation",
    slug: "ag-svc-05",
    alt: "Specialist reviewing AI agent guardrails, human approval and safety scores on a large touchscreen",
    title: "AI Agent Testing & Evaluation",
  },
  {
    i: 5,
    folder: "AI Agent Deployment & Maintenance",
    slug: "ag-svc-06",
    alt: "Engineer monitoring AI agent canary rollout, health checks and production deployment on dual monitors",
    title: "AI Agent Deployment & Maintenance",
  },
];

function pickSrc(folder) {
  const desktop = path.join(BASE, folder, "Desktop");
  const mobile = path.join(BASE, folder, "Mobile");
  const mobileAlt = path.join(BASE, folder, "mobile");
  const dir = [desktop, mobile, mobileAlt].find((d) => fs.existsSync(d));
  if (!dir) throw new Error("missing Desktop/Mobile for " + folder);
  const files = fs
    .readdirSync(dir)
    .filter((n) => /\.(jpe?g|png|webp)$/i.test(n))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  if (!files.length) throw new Error("no images in " + dir);
  const preferred = files.find((f) => /^1\./i.test(f));
  return path.join(dir, preferred || files[0]);
}

async function toWebp(srcPath) {
  let best = null;
  for (const [size, qStart] of [
    [960, 72],
    [860, 68],
    [760, 64],
    [680, 60],
    [600, 54],
    [520, 48],
    [460, 42],
  ]) {
    let lo = 36,
      hi = qStart;
    while (lo <= hi) {
      const q = Math.floor((lo + hi) / 2);
      const buf = await sharp(srcPath)
        .rotate()
        .resize({
          width: size,
          height: Math.round(size * 0.72),
          fit: "cover",
          position: "centre",
        })
        .webp({ quality: q, effort: 6, smartSubsample: true })
        .toBuffer();
      if (buf.length <= MAX) {
        best = { buf, size, q };
        lo = q + 1;
      } else {
        hi = q - 1;
      }
    }
    if (best) break;
  }
  if (!best) throw new Error("could not fit under 80KB: " + srcPath);
  return best;
}

function writeHashed(slug, buf) {
  const hash = crypto.createHash("sha256").update(buf).digest("hex").slice(0, 10);
  const name = `${slug}-${hash}.webp`;
  const dest = path.join(OUT, name);
  fs.writeFileSync(dest, buf);
  for (const f of fs.readdirSync(OUT)) {
    if (
      (f.startsWith(slug + "-") && (f.endsWith(".webp") || f.endsWith(".jpg") || f.endsWith(".jpeg") || f.endsWith(".png"))) &&
      f !== name
    ) {
      fs.unlinkSync(path.join(OUT, f));
    }
  }
  return { name, href: "/images/ai-agent/" + name, bytes: buf.length };
}

function esc(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
}

fs.mkdirSync(OUT, { recursive: true });
const results = [];
for (const svc of SERVICES) {
  const src = pickSrc(svc.folder);
  const { buf, size, q } = await toWebp(src);
  const meta = await sharp(buf).metadata();
  const written = writeHashed(svc.slug, buf);
  results.push({
    ...svc,
    ...written,
    width: meta.width,
    height: meta.height,
    encode: `${size}@q${q}`,
    src: path.basename(src),
  });
  console.log(
    `${svc.slug} ${svc.title}: ${written.name} ${(written.bytes / 1024).toFixed(1)}KB (${size}@q${q})`
  );
}

let html = fs.readFileSync(BODY, "utf8");
for (const r of results) {
  const re = new RegExp(
    `<span class="tm-bg"[^>]*>\\s*<span class="tm-veil"></span></span>(?=[\\s\\S]*?data-i="${r.i}")`
  );
  // Match each panel's tm-bg by data-i on the parent tm-item
  const itemRe = new RegExp(
    `(<div class="tm-item[^"]*"[^>]*data-i="${r.i}"[^>]*>)\\s*<span class="tm-bg"[\\s\\S]*?<span class="tm-veil"></span></span>`
  );
  if (!itemRe.test(html)) {
    throw new Error("tm-bg not found for data-i=" + r.i);
  }
  const loading = r.i === 0 ? 'fetchpriority="high"' : 'loading="lazy"';
  const bg = `<span class="tm-bg"><img src="${r.href}" width="${r.width}" height="${r.height}" alt="${esc(r.alt)}" title="${esc(r.title)}" decoding="async" ${loading}><span class="tm-veil" aria-hidden="true"></span></span>`;
  html = html.replace(itemRe, `$1${bg}`);
}
fs.writeFileSync(BODY, html);
console.log("body updated");

let css = fs.readFileSync(CSS, "utf8");
const marker = "/* === tm-bg photos (webp <80KB) === */";
const cssBlock = `
${marker}
#agent-services .tm-bg{
  position:absolute; inset:0; opacity:0;
  transition:opacity .55s var(--ease) .05s;
  background:#0A0C0E;
  background-image:none !important;
}
#agent-services .tm-item.on .tm-bg{opacity:1;}
#agent-services .tm-bg > img{
  position:absolute; inset:0; width:100%; height:100%;
  object-fit:cover; object-position:center; display:block;
  border:0;
}
#agent-services .tm-veil{position:absolute; inset:0; z-index:1; background:rgba(0,0,0,.78); pointer-events:none;}
`;

if (css.includes(marker)) {
  css = css.replace(
    /\/\* === tm-bg photos \(webp <80KB\) === \*\/[\s\S]*?(?=\n\/\* ===|\n#agent-services \.tm-slim|$)/,
    cssBlock.trim() + "\n"
  );
} else {
  // Replace the old tm-bg / veil block near the top of the file
  css = css.replace(
    /#agent-services \.tm-bg\{\s*background-size:cover !important;[\s\S]*?background-repeat:no-repeat !important;\s*\}/,
    ""
  );
  // Insert after the tm-item overflow rule / before closed slim — prefer after existing .tm-veil
  if (css.includes("#agent-services .tm-veil{")) {
    css = css.replace(
      /#agent-services \.tm-bg\{position:absolute; inset:0; opacity:0; transition:opacity \.55s var\(--ease\) \.05s;[\s\S]*?#agent-services \.tm-veil\{position:absolute; inset:0; background:rgba\(0,0,0,\.78\);\}/,
      cssBlock.trim()
    );
  } else {
    css = cssBlock + "\n" + css;
  }
}
fs.writeFileSync(CSS, css);
console.log("css updated");
console.log("done");
