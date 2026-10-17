/**
 * Technical SEO #process: encode Process Section folders to WebP <80KB
 * and wire into .eg-face .eg-pic with alt/title from each step.
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE =
  "C:/Users/Super/Downloads/Technical-SEO-20261017T080858Z-1-001/Technical-SEO/Process Section";
const OUT = path.join(ROOT, "public", "images");
const BODY = path.join(ROOT, "lib", "technical-seo-body.html");
const MAX = 80 * 1024;

const STEPS = [
  {
    i: 0,
    folder: "14-Process-Audit",
    slug: "tech-proc-audit",
    alt: "Technical SEO audit — full crawl, log review, and Search Console analysis",
    title: "Audit",
  },
  {
    i: 1,
    folder: "15-Process-Prioritize",
    slug: "tech-proc-prioritize",
    alt: "Prioritize technical SEO findings by impact and effort into an action plan",
    title: "Prioritize",
  },
  {
    i: 2,
    folder: "16-Process-Fix",
    slug: "tech-proc-fix",
    alt: "Implement technical SEO fixes with developer handoff and QA acceptance criteria",
    title: "Fix",
  },
  {
    i: 3,
    folder: "17-Process-Monitor",
    slug: "tech-proc-monitor",
    alt: "Monitor crawl, indexation, and Core Web Vitals for technical SEO regressions",
    title: "Monitor",
  },
];

function pickSrc(folder) {
  const dir = path.join(BASE, folder);
  if (!fs.existsSync(dir)) throw new Error("missing folder: " + folder);
  const files = fs
    .readdirSync(dir)
    .filter((n) => /\.(jpe?g|png|webp)$/i.test(n))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  if (!files.length) throw new Error("no images in " + dir);
  const opt2 = files.find((f) => /option-0?2/i.test(f));
  const opt1 = files.find((f) => /option-0?1/i.test(f));
  return path.join(dir, opt2 || opt1 || files[0]);
}

async function toWebp(srcPath) {
  let best = null;
  for (const [size, qStart] of [
    [720, 72],
    [680, 66],
    [640, 60],
    [600, 54],
    [560, 48],
    [520, 44],
  ]) {
    let lo = 38,
      hi = qStart;
    while (lo <= hi) {
      const q = Math.floor((lo + hi) / 2);
      const buf = await sharp(srcPath)
        .rotate()
        .resize({
          width: size,
          height: size,
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
    if (f.startsWith(slug + "-") && f.endsWith(".webp") && f !== name) {
      fs.unlinkSync(path.join(OUT, f));
      console.log("deleted", f);
    }
  }
  return { name, href: "/images/" + name, bytes: buf.length };
}

function escAttr(s) {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const results = [];
  for (const step of STEPS) {
    const src = pickSrc(step.folder);
    const { buf, size, q } = await toWebp(src);
    const meta = await sharp(buf).metadata();
    const written = writeHashed(step.slug, buf);
    results.push({
      ...step,
      ...written,
      width: meta.width,
      height: meta.height,
    });
    console.log(
      `P${step.i + 1} ${written.name} ${(written.bytes / 1024).toFixed(1)}KB (${size}@q${q}) ${path.basename(src)}`
    );
  }

  let html = fs.readFileSync(BODY, "utf8");
  const pics = results
    .map(
      (r) =>
        `          <span class="eg-pic"><img src="${r.href}" width="${r.width}" height="${r.height}" alt="${escAttr(r.alt)}" title="${escAttr(r.title)}" decoding="async" loading="lazy"></span>`
    )
    .join("\n");

  const faceRe =
    /(<div class="eg-face">)\s*(?:<span class="eg-pic">[\s\S]*?<\/span>\s*)+(<span class="eg-lab">)/;
  if (!faceRe.test(html)) throw new Error("eg-face process pics not found");

  html = html.replace(faceRe, (_, open, lab) => `${open}\n${pics}\n          ${lab}`);
  fs.writeFileSync(BODY, html);
  console.log("updated body html");
  console.log("done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
