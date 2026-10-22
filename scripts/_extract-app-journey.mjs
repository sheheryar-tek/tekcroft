import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";

const SRC =
  "c:/Users/Super/Downloads/mobile-app-development-journey-section (3).html";
const OUT_DIR = "scripts/_journey-extract";
const IMG_DIR = "public/images/mobile-app";

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(IMG_DIR, { recursive: true });

const html = fs.readFileSync(SRC, "utf8");
if (html.includes("\uFFFD")) throw new Error("Source has U+FFFD");

function between(a, b, from = 0) {
  const s = html.indexOf(a, from);
  if (s < 0) throw new Error("missing start: " + a.slice(0, 60));
  const e = html.indexOf(b, s + a.length);
  if (e < 0) throw new Error("missing end after: " + a.slice(0, 60));
  return { start: s, end: e + b.length, inner: html.slice(s + a.length, e) };
}

// CSS
const css = between('<style id="mj-styles">', "</style>").inner.trim();
fs.writeFileSync(path.join(OUT_DIR, "mj-styles.css"), css);

// Scripts
const mjScript = between('<script id="mj-script">', "</script>").inner.trim();
const mjSwipe = between('<script id="mj-swipe">', "</script>").inner.trim();
fs.writeFileSync(path.join(OUT_DIR, "mj-script.js"), mjScript);
fs.writeFileSync(path.join(OUT_DIR, "mj-swipe.js"), mjSwipe);

// Section markup
const secStart = html.indexOf('<section class="sec mj-sec" id="app-journey"');
const altStart = html.indexOf('<section id="app-journey"');
const start = secStart >= 0 ? secStart : altStart;
if (start < 0) throw new Error("section not found");
const end = html.indexOf("</section>", start) + "</section>".length;
let section = html.slice(start, end);

// Collect unique data:image URLs in section order
const re = /data:image\/([a-zA-Z0-9+.-]+);base64,([A-Za-z0-9+/=\s]+)/g;
const seen = new Map();
const images = [];
let m;
while ((m = re.exec(section))) {
  const mime = m[1].toLowerCase();
  const b64 = m[2].replace(/\s+/g, "");
  const key = mime + ":" + b64.slice(0, 80) + ":" + b64.length;
  if (seen.has(key)) continue;
  const idx = seen.size;
  seen.set(key, idx);
  images.push({ mime, b64, idx, full: m[0] });
}

console.log("unique images", images.length);

// Write raw binaries then convert with sharp if available
let sharp;
try {
  sharp = (await import("sharp")).default;
} catch {
  sharp = null;
}

const map = new Map(); // full data url -> public path
for (const img of images) {
  const ext =
    img.mime.includes("png")
      ? "png"
      : img.mime.includes("jpeg") || img.mime.includes("jpg")
        ? "jpg"
        : img.mime.includes("webp")
          ? "webp"
          : "bin";
  const rawName = `journey-raw-${String(img.idx).padStart(2, "0")}.${ext}`;
  const webpName = `journey-${String(img.idx).padStart(2, "0")}.webp`;
  const rawPath = path.join(OUT_DIR, rawName);
  const webpPath = path.join(IMG_DIR, webpName);
  const buf = Buffer.from(img.b64, "base64");
  fs.writeFileSync(rawPath, buf);

  if (sharp) {
    await sharp(buf).webp({ quality: 86, effort: 4 }).toFile(webpPath);
  } else if (ext === "webp") {
    fs.copyFileSync(rawPath, webpPath);
  } else {
    // fallback: keep original extension in public
    const fallback = path.join(IMG_DIR, `journey-${String(img.idx).padStart(2, "0")}.${ext}`);
    fs.copyFileSync(rawPath, fallback);
    map.set(img.full, "/images/mobile-app/" + path.basename(fallback));
    continue;
  }
  map.set(img.full, "/images/mobile-app/" + webpName);
  const st = fs.statSync(webpPath);
  console.log(webpName, Math.round(st.size / 1024) + "KB");
}

// Replace data URLs in section (longest first to avoid partial issues)
const sorted = [...map.entries()].sort((a, b) => b[0].length - a[0].length);
for (const [dataUrl, pub] of sorted) {
  if (!section.includes(dataUrl)) {
    // try without whitespace variants
    const compact = dataUrl.replace(/\s+/g, "");
    section = section.split(dataUrl).join(pub);
    // also replace if HTML had same b64 with different whitespace
  } else {
    section = section.split(dataUrl).join(pub);
  }
}

// Second pass: replace any remaining data:image by matching base64 payload
section = section.replace(
  /data:image\/[a-zA-Z0-9+.-]+;base64,[A-Za-z0-9+/=\s]+/g,
  (full) => {
    const compact = full.replace(/\s+/g, "");
    for (const [dataUrl, pub] of map) {
      if (dataUrl.replace(/\s+/g, "") === compact) return pub;
    }
    throw new Error("Unmapped data URL remaining, len=" + full.length);
  }
);

if (section.includes("data:image")) {
  throw new Error("Still has data:image after replace");
}
if (section.includes("\uFFFD")) throw new Error("U+FFFD in section");

fs.writeFileSync(path.join(OUT_DIR, "section.html"), section);
fs.writeFileSync(
  path.join(OUT_DIR, "image-map.json"),
  JSON.stringify(Object.fromEntries([...map].map(([k, v]) => [k.slice(0, 60) + "...", v])), null, 2)
);

console.log("section chars", section.length);
console.log("done");
