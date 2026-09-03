/**
 * Extract every data:image URI → optimized WebP under public/images,
 * then rewrite CSS / HTML / mega-menu JS to point at the files.
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "images");
fs.mkdirSync(OUT, { recursive: true });

const TARGET_KB = 95;
const MAX_ATTEMPTS = 8;

/** Display-size hints (max encode width). Keep visual quality high. */
const WIDTH_HINTS = {
  "hero-1": 1920,
  "hero-2": 1600,
  "cta-shot": 1400,
  "cta-shot-2": 1400,
  "faq-shot": 1200,
  "cn-shot": 1200,
  "shot-1": 900,
  "shot-2": 900,
  "shot-3": 900,
  "shot-4": 900,
  "cs-1": 720,
  "cs-2": 720,
  "cs-3": 720,
  "cs-4": 720,
  "cs-5": 720,
  "cs-6": 720,
  "cs-7": 720,
  "logo-ink": 480,
  "logo-white": 480,
  "mark": 128,
  "mark-white": 128,
  "mm-team": 800,
  "mm-keys": 800,
  "mm-laptops": 800,
  "mm-devs": 800,
  "mm-meeting": 800,
  "mm-table": 800,
  "mm-docs": 800,
  "mm-mentor": 800,
  "ax-logo": 96,
};

const cache = new Map(); // hash -> { file, bytes }
const manifest = [];

function hashBuf(buf) {
  return crypto.createHash("sha1").update(buf).digest("hex").slice(0, 12);
}

async function toWebp(buf, baseName, maxWidth) {
  const h = hashBuf(buf);
  if (cache.has(h)) return cache.get(h);

  let pipeline = sharp(buf, { failOn: "none" }).rotate();
  const meta = await pipeline.metadata();
  const width = meta.width || maxWidth || 1200;
  const targetW = Math.min(width, maxWidth || width);

  let quality = 82;
  let out;
  let attempt = 0;
  while (attempt < MAX_ATTEMPTS) {
    let img = sharp(buf, { failOn: "none" }).rotate();
    if (targetW < width) img = img.resize({ width: targetW, withoutEnlargement: true });
    out = await img.webp({ quality, effort: 6, smartSubsample: true }).toBuffer();
    if (out.length <= TARGET_KB * 1024 || quality <= 55) break;
    quality -= 5;
    attempt++;
  }

  // Logos / marks with transparency: keep alpha; if still huge, try PNG only as fallback name but prefer webp
  const file = `${baseName}.webp`;
  const abs = path.join(OUT, file);
  // Avoid collisions on different content wanting same name
  let finalFile = file;
  let finalAbs = abs;
  if (fs.existsSync(abs)) {
    const existing = fs.readFileSync(abs);
    if (!existing.equals(out)) {
      finalFile = `${baseName}-${h}.webp`;
      finalAbs = path.join(OUT, finalFile);
    }
  }
  fs.writeFileSync(finalAbs, out);
  const rec = { file: `/images/${finalFile}`, bytes: out.length, quality, w: targetW, srcW: width };
  cache.set(h, rec);
  manifest.push({ name: baseName, ...rec, raw: buf.length });
  console.log(
    `✓ ${baseName.padEnd(14)} ${(buf.length / 1024).toFixed(0).padStart(4)}KB → ${(out.length / 1024).toFixed(1).padStart(5)}KB  q${quality}  w${targetW}`
  );
  return rec;
}

function collectNamedCssVars(css) {
  // Match --name:url("data:...") occurrences in order; duplicate names get -2, -3
  const re =
    /(--([a-z0-9-]+))\s*:\s*url\(\s*["']?(data:image\/[a-zA-Z0-9+.-]+;base64,[A-Za-z0-9+/=]+)["']?\s*\)/gi;
  const counts = Object.create(null);
  const list = [];
  let m;
  while ((m = re.exec(css))) {
    const prop = m[2];
    counts[prop] = (counts[prop] || 0) + 1;
    const base = counts[prop] === 1 ? prop : `${prop}-${counts[prop]}`;
    list.push({
      full: m[0],
      propFull: m[1],
      base,
      dataUri: m[3],
      index: m.index,
    });
  }
  return list;
}

async function rewriteCss() {
  const file = path.join(ROOT, "app/tekcroft.css");
  let css = fs.readFileSync(file, "utf8");
  const items = collectNamedCssVars(css);
  // Replace from end so indices stay valid
  for (let i = items.length - 1; i >= 0; i--) {
    const it = items[i];
    const b64 = it.dataUri.split(",")[1];
    const buf = Buffer.from(b64, "base64");
    const maxW = WIDTH_HINTS[it.base] || WIDTH_HINTS[it.base.replace(/-\d+$/, "")] || 1000;
    const rec = await toWebp(buf, it.base, maxW);
    const replacement = `${it.propFull}:url("${rec.file}")`;
    css = css.slice(0, it.index) + replacement + css.slice(it.index + it.full.length);
  }
  fs.writeFileSync(file, css);
  console.log(`CSS rewritten (${items.length} urls). Size now ${(css.length / 1024).toFixed(0)} KB`);
}

async function rewriteBody() {
  const file = path.join(ROOT, "lib/homepage-body.html");
  let html = fs.readFileSync(file, "utf8");

  // Hero <img> tags
  let heroIdx = 0;
  html = await replaceAsync(
    html,
    /<img\b([^>]*?)src="(data:image\/[a-zA-Z0-9+.-]+;base64,[A-Za-z0-9+/=]+)"([^>]*)>/gi,
    async (full, pre, dataUri, post) => {
      heroIdx++;
      const name = `hero-${heroIdx}`;
      const buf = Buffer.from(dataUri.split(",")[1], "base64");
      const rec = await toWebp(buf, name, WIDTH_HINTS[name] || 1600);
      const isLcp = heroIdx === 1;
      let attrs = `${pre}src="${rec.file}"${post}`;
      if (isLcp) {
        if (!/\bfetchpriority=/i.test(attrs)) attrs = attrs.replace(/<img\s*/i, "") || attrs;
        // rebuild carefully
        const bits = [];
        bits.push(`src="${rec.file}"`);
        bits.push(`alt=""`);
        bits.push(`width="1920"`);
        bits.push(`height="1080"`);
        bits.push(`decoding="async"`);
        bits.push(`fetchpriority="high"`);
        // strip conflicting from pre/post
        const cleaned = (pre + " " + post)
          .replace(/\b(src|alt|width|height|loading|fetchpriority|decoding)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
          .trim();
        return `<img ${cleaned} ${bits.join(" ")}>`.replace(/\s+/g, " ");
      }
      const cleaned = (pre + " " + post)
        .replace(/\b(src|loading|decoding)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
        .trim();
      return `<img ${cleaned} src="${rec.file}" alt="" width="1600" height="900" loading="lazy" decoding="async">`.replace(
        /\s+/g,
        " "
      );
    }
  );

  // Inline style --logo:url(data:...)
  let ax = 0;
  html = await replaceAsync(
    html,
    /--logo:url\(\s*["']?(data:image\/[a-zA-Z0-9+.-]+;base64,[A-Za-z0-9+/=]+)["']?\s*\)/gi,
    async (full, dataUri) => {
      ax++;
      const buf = Buffer.from(dataUri.split(",")[1], "base64");
      const rec = await toWebp(buf, `ax-logo-${ax}`, 96);
      return `--logo:url("${rec.file}")`;
    }
  );

  fs.writeFileSync(file, html);
  console.log(`Body rewritten. Size now ${(html.length / 1024).toFixed(0)} KB`);
}

async function rewriteMm() {
  const file = path.join(ROOT, "public/tekcroft-mm.js");
  let js = fs.readFileSync(file, "utf8");
  const re = /(\w+)\s*:\s*"(data:image\/[a-zA-Z0-9+.-]+;base64,[A-Za-z0-9+/=]+)"/g;
  const matches = [...js.matchAll(re)];
  for (let i = matches.length - 1; i >= 0; i--) {
    const m = matches[i];
    const key = m[1];
    const dataUri = m[2];
    const buf = Buffer.from(dataUri.split(",")[1], "base64");
    const rec = await toWebp(buf, `mm-${key}`, WIDTH_HINTS[`mm-${key}`] || 800);
    const replacement = `${key}:"${rec.file}"`;
    js = js.slice(0, m.index) + replacement + js.slice(m.index + m[0].length);
  }
  fs.writeFileSync(file, js);
  console.log(`MM JS rewritten (${matches.length} images). Size now ${(js.length / 1024).toFixed(0)} KB`);
}

function replaceAsync(str, re, fn) {
  const parts = [];
  let last = 0;
  const matches = [...str.matchAll(re)];
  return (async () => {
    for (const m of matches) {
      parts.push(str.slice(last, m.index));
      parts.push(await fn(...m));
      last = m.index + m[0].length;
    }
    parts.push(str.slice(last));
    return parts.join("");
  })();
}

async function main() {
  console.log("Optimizing images → WebP…\n");
  await rewriteCss();
  await rewriteBody();
  await rewriteMm();
  fs.writeFileSync(path.join(ROOT, "scripts", "image-manifest.json"), JSON.stringify(manifest, null, 2));
  const left =
    (fs.readFileSync(path.join(ROOT, "app/tekcroft.css"), "utf8").match(/data:image/g) || []).length +
    (fs.readFileSync(path.join(ROOT, "lib/homepage-body.html"), "utf8").match(/data:image/g) || []).length +
    (fs.readFileSync(path.join(ROOT, "public/tekcroft-mm.js"), "utf8").match(/data:image/g) || []).length;
  console.log(`\nRemaining data:image refs: ${left}`);
  console.log(`Total WebP files: ${manifest.length}`);
  console.log(
    `Max WebP size: ${(Math.max(...manifest.map((m) => m.bytes)) / 1024).toFixed(1)} KB`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
