/**
 * Re-extract AI section brand marks as original PNGs (no upscale/WebP),
 * and rewrite --logo urls to those PNGs with safe quoting.
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC =
  process.env.TEKCROFT_HTML ||
  "c:\\Users\\Super\\Desktop\\TK FINAL\\Homepage\\tekcroft-site-mega-menus (15).html";

const htmlSrc = fs.readFileSync(SRC, "utf8");
const bodyMatch = htmlSrc.match(/<body[^>]*>([\s\S]*)<\/body>/i);
let body = bodyMatch[1].replace(/<script\b[\s\S]*?<\/script>/gi, "");

// Only the AI ecosystem section's --logo data URIs
const axSection = body.match(
  /id="ai-ecosystem"[\s\S]*?(?=<section\b|$)/i
);
if (!axSection) {
  console.error("ai-ecosystem section not found in source");
  process.exit(1);
}

const re =
  /--logo:url\(\s*["']?(data:image\/(png|jpeg|jpg|webp|svg\+xml);base64,([A-Za-z0-9+/=]+))["']?\s*\)/gi;
const outDir = path.join(ROOT, "public", "images", "ax");
fs.mkdirSync(outDir, { recursive: true });

const map = new Map(); // hash -> public path
let i = 0;
const logos = [];
let m;
while ((m = re.exec(axSection[0]))) {
  i++;
  const mime = m[2];
  const buf = Buffer.from(m[3], "base64");
  const hash = crypto.createHash("sha1").update(buf).digest("hex").slice(0, 10);
  let pub;
  if (map.has(hash)) {
    pub = map.get(hash);
  } else {
    const ext = mime.includes("svg") ? "svg" : mime === "jpeg" || mime === "jpg" ? "jpg" : "png";
    const name = `brand-${String(i).padStart(2, "0")}-${hash}.${ext}`;
    fs.writeFileSync(path.join(outDir, name), buf);
    pub = `/images/ax/${name}`;
    map.set(hash, pub);
    console.log("wrote", pub, buf.length + "b");
  }
  logos.push(pub);
}

// Rewrite current homepage body: replace every --logo:url(...) in ai section order
const pagePath = path.join(ROOT, "lib/homepage-body.html");
let page = fs.readFileSync(pagePath, "utf8");

let idx = 0;
page = page.replace(/--logo:url\((?:'[^']+'|"[^"]+"|[^)]+)\)/g, (full) => {
  // Only rewrite ones pointing at /images/ax-logo or already broken
  if (!/ax-logo|\/images\/ax\//.test(full) && idx >= logos.length) return full;
  if (idx >= logos.length) return full;
  const pub = logos[idx++];
  return `--logo:url('${pub}')`;
});

if (idx !== logos.length) {
  console.warn(`warning: replaced ${idx} urls but source had ${logos.length} logos`);
}

fs.writeFileSync(pagePath, page);
console.log(`rewrote ${idx} --logo refs to original PNG marks`);
