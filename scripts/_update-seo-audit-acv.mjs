import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "images");
const BODY = path.join(ROOT, "lib", "seo-audit-services-body.html");
const BASE =
  "C:/Users/Super/Downloads/SEO-Audit-20261016T121654Z-1-001/SEO-Audit/services";
const MAX = 80 * 1024;

const PANELS = [
  {
    folder: "02-Technical-Audit",
    slug: "audit-ac-technical",
    oldRe: /\/images\/audit-ac-technical-[a-f0-9]+\.webp/i,
    title: "Technical SEO Audit",
    alt: "Technical SEO Audit reviewing crawlability, indexing, site speed, and Core Web Vitals",
  },
  {
    folder: "03-Content-Audit",
    slug: "audit-ac-content",
    oldRe: /\/images\/audit-ac-content-[a-f0-9]+\.webp/i,
    title: "On-Page & Content Audit",
    alt: "On-Page and Content Audit checking titles, metadata, search intent, and content structure",
  },
  {
    folder: "04-Backlink-Audit",
    slug: "audit-ac-backlinks",
    oldRe: /\/images\/audit-ac-backlinks-[a-f0-9]+\.webp/i,
    title: "Backlink & Authority Audit",
    alt: "Backlink and Authority Audit analyzing link profile quality, toxic links, and authority gaps",
  },
  {
    folder: "05-Competitor-Gaps",
    slug: "audit-ac-competitor",
    oldRe: /\/images\/audit-ac-competitor-[a-f0-9]+\.webp/i,
    title: "Competitor Gap Analysis",
    alt: "Competitor Gap Analysis mapping keyword, content, and ranking opportunities you are missing",
  },
  {
    folder: "06-AI-Search-Audit",
    slug: "audit-ac-geo",
    oldRe: /\/images\/audit-ac-geo-[a-f0-9]+\.webp/i,
    title: "AI Search (GEO) Readiness Audit",
    alt: "AI Search GEO Readiness Audit for ChatGPT, Gemini, and AI Overview citation visibility",
  },
  {
    folder: "07-Analytics-Audit",
    slug: "audit-ac-analytics",
    oldRe: /\/images\/audit-ac-analytics-[a-f0-9]+\.webp/i,
    title: "Analytics & Conversion Tracking Audit",
    alt: "Analytics and Conversion Tracking Audit verifying GA4 setup, goals, and reporting accuracy",
  },
];

async function encodeUnder(srcPath, { width = 1200, height = 800 } = {}) {
  const buf = fs.readFileSync(srcPath);
  let w = width;
  let quality = 78;
  let out;
  let meta;
  for (;;) {
    out = await sharp(buf, { failOn: "none" })
      .rotate()
      .resize({
        width: w,
        height: Math.round((w * height) / width),
        fit: "cover",
        position: "centre",
        withoutEnlargement: true,
      })
      .webp({ quality, effort: 6, smartSubsample: true })
      .toBuffer();
    meta = await sharp(out).metadata();
    if (out.length <= MAX) break;
    if (quality > 52) quality -= 6;
    else if (w > 800) {
      w -= 60;
      quality = 72;
    } else if (quality > 40) quality -= 4;
    else break;
  }
  if (out.length > MAX) {
    throw new Error(
      `over 80KB for ${srcPath}: ${(out.length / 1024).toFixed(1)}KB`
    );
  }
  return { out, meta, quality };
}

function pickDesktop(folder) {
  const dir = path.join(BASE, folder, "desktop");
  if (!fs.existsSync(dir)) throw new Error("missing " + dir);
  const files = fs
    .readdirSync(dir)
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
    .sort();
  // Prefer Option-01
  const opt1 = files.find((f) => /Option-01/i.test(f));
  const chosen = opt1 || files[0];
  if (!chosen) throw new Error("no images in " + dir);
  return path.join(dir, chosen);
}

function writeNamed(slug, { out, meta, quality }) {
  const hash = crypto.createHash("sha1").update(out).digest("hex").slice(0, 10);
  const name = `${slug}-${hash}.webp`;
  for (const f of fs.readdirSync(OUT)) {
    if (new RegExp(`^${slug}-[a-f0-9]+\\.webp$`, "i").test(f) && f !== name) {
      fs.unlinkSync(path.join(OUT, f));
      console.log("deleted", f);
    }
  }
  fs.writeFileSync(path.join(OUT, name), out);
  return {
    file: `/images/${name}`,
    kb: +(out.length / 1024).toFixed(1),
    q: quality,
    w: meta.width,
    h: meta.height,
  };
}

const results = {};
let html = fs.readFileSync(BODY, "utf8");

for (const p of PANELS) {
  const src = pickDesktop(p.folder);
  const enc = await encodeUnder(src);
  const r = writeNamed(p.slug, enc);
  results[p.slug] = { ...r, title: p.title, alt: p.alt, src };
  console.log(p.slug, r.kb + "KB", `q${r.q}`, path.basename(src));

  const titleEsc = p.title
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;");
  const altEsc = p.alt.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

  const re = new RegExp(
    `<img src="/images/${p.slug}-[a-f0-9]+\\.webp"[^>]*>`,
    "i"
  );
  if (!re.test(html)) throw new Error("img not found for " + p.slug);
  html = html.replace(
    re,
    `<img src="${r.file}" width="${r.w}" height="${r.h}" alt="${altEsc}" title="${titleEsc}" decoding="async" loading="lazy">`
  );
}

// 08 — Audit Comparison → VS section background
{
  const src = pickDesktop("08-Audit-Comparison");
  const enc = await encodeUnder(src, { width: 1600, height: 900 });
  const r = writeNamed("seo-audit-vs", enc);
  results["seo-audit-vs"] = {
    ...r,
    title: "DIY Vs ChatGPT Vs Professional SEO Audit",
    alt: "DIY vs ChatGPT vs Professional SEO Audit comparison of audit approaches",
    src,
  };
  console.log("seo-audit-vs", r.kb + "KB", path.basename(src));
  const re =
    /<img src="\/images\/seo-audit-vs-[a-f0-9]+\.webp"[^>]*>/i;
  if (!re.test(html)) throw new Error("vs img not found");
  html = html.replace(
    re,
    `<img src="${r.file}" width="${r.w}" height="${r.h}" alt="${results["seo-audit-vs"].alt}" title="${results["seo-audit-vs"].title}" decoding="async" loading="lazy">`
  );
}

fs.writeFileSync(BODY, html);
fs.writeFileSync(
  path.join(ROOT, "scripts", "_seo-audit-acv-map.json"),
  JSON.stringify(results, null, 2) + "\n"
);
console.log("updated seo-audit-services-body.html");
console.log("done");
