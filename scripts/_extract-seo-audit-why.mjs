import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC =
  "C:/Users/Super/Downloads/seo-audit-why-choose-section (1).html";
const t = fs.readFileSync(SRC, "utf8");

function sliceBetween(startRe, endRe) {
  const sm = t.match(startRe);
  if (!sm) throw new Error("start not found: " + startRe);
  const start = sm.index;
  const after = t.slice(start);
  const em = after.match(endRe);
  if (!em) throw new Error("end not found: " + endRe);
  return after.slice(0, em.index + em[0].length);
}

const style = sliceBetween(
  /<style id="wa-styles">/,
  /<\/style>/
);
const script = sliceBetween(
  /<script id="wa-script">/,
  /<\/script>/
);
const section = sliceBetween(
  /<section class="sec wy wa" id="whyus"/,
  /<\/section>/
);

console.log("style", style.length);
console.log("script", script.length);
console.log("section", section.length);

// Extract base64 photo from CSS or HTML
const photoRe =
  /url\(["']?data:image\/(jpeg|jpg|png|webp);base64,([A-Za-z0-9+/=]+)["']?\)/gi;
const photos = [];
let m;
const hay = style + section;
while ((m = photoRe.exec(hay))) {
  photos.push({ type: m[1], b64: m[2], len: m[2].length });
}
console.log(
  "photos",
  photos.map((p) => ({ type: p.type, kb: (p.b64.length * 0.75) / 1024 }))
);

const outDir = path.join(ROOT, "scripts", "_extracted-seo-audit-why");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "section.html"), section);
fs.writeFileSync(path.join(outDir, "wa-styles.css"), style);
fs.writeFileSync(path.join(outDir, "wa-script.js"), script);

if (photos.length) {
  // Prefer the largest photo (strategist portrait)
  photos.sort((a, b) => b.len - a.len);
  const best = photos[0];
  const buf = Buffer.from(best.b64, "base64");
  const ext = best.type === "jpeg" ? "jpg" : best.type;
  fs.writeFileSync(path.join(outDir, "photo." + ext), buf);
  console.log("wrote photo", buf.length, ext);
}

console.log("done");
