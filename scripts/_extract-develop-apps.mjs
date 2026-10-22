import fs from "fs";
import path from "path";

const SRC =
  "c:/Users/Super/Downloads/mobile-app-develop-apps-with-us-section (1).html";
const OUT_DIR = "scripts/_develop-apps-extract";
const IMG_DIR = "public/images/mobile-app";

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(IMG_DIR, { recursive: true });

const html = fs.readFileSync(SRC, "utf8");
if (html.includes("\uFFFD")) throw new Error("Source has U+FFFD");

console.log("chars", html.length);
console.log("data:image", (html.match(/data:image/g) || []).length);

function between(a, b, from = 0) {
  const s = html.indexOf(a, from);
  if (s < 0) throw new Error("missing start: " + a.slice(0, 80));
  const e = html.indexOf(b, s + a.length);
  if (e < 0) throw new Error("missing end after: " + a.slice(0, 80));
  return { start: s, end: e + b.length, inner: html.slice(s + a.length, e) };
}

const css = between('<style id="da-styles">', "</style>").inner.trim();
fs.writeFileSync(path.join(OUT_DIR, "da-styles.css"), css);

const script = between('<script id="da-script">', "</script>").inner.trim();
fs.writeFileSync(path.join(OUT_DIR, "da-script.js"), script);

const secStart = html.indexOf('<section class="sec da" id="develop-apps"');
const altStart = html.indexOf('<section id="develop-apps"');
const start = secStart >= 0 ? secStart : altStart;
if (start < 0) throw new Error("section not found");
const end = html.indexOf("</section>", start) + "</section>".length;
let section = html.slice(start, end);

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

let sharp;
try {
  sharp = (await import("sharp")).default;
} catch {
  sharp = null;
}

const map = new Map();
for (const img of images) {
  const ext = img.mime.includes("png")
    ? "png"
    : img.mime.includes("jpeg") || img.mime.includes("jpg")
      ? "jpg"
      : img.mime.includes("webp")
        ? "webp"
        : "bin";
  // Prefer a stable name for the restaurant photo used in develop-apps
  const webpName =
    images.length === 1
      ? "develop-apps-restaurant.webp"
      : `develop-apps-${String(img.idx).padStart(2, "0")}.webp`;
  const rawName = `develop-apps-raw-${String(img.idx).padStart(2, "0")}.${ext}`;
  const rawPath = path.join(OUT_DIR, rawName);
  const webpPath = path.join(IMG_DIR, webpName);
  const buf = Buffer.from(img.b64, "base64");
  fs.writeFileSync(rawPath, buf);

  if (sharp) {
    await sharp(buf).webp({ quality: 86, effort: 4 }).toFile(webpPath);
  } else if (ext === "webp") {
    fs.copyFileSync(rawPath, webpPath);
  } else {
    const fallback = path.join(
      IMG_DIR,
      webpName.replace(/\.webp$/, "." + ext)
    );
    fs.copyFileSync(rawPath, fallback);
    map.set(img.full, "/images/mobile-app/" + path.basename(fallback));
    continue;
  }
  map.set(img.full, "/images/mobile-app/" + webpName);
  const st = fs.statSync(webpPath);
  console.log(webpName, Math.round(st.size / 1024) + "KB");
}

const sorted = [...map.entries()].sort((a, b) => b[0].length - a[0].length);
for (const [dataUrl, pub] of sorted) {
  section = section.split(dataUrl).join(pub);
}
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

if (section.includes("data:image")) throw new Error("Still has data:image");
if (section.includes("\uFFFD")) throw new Error("U+FFFD in section");

fs.writeFileSync(path.join(OUT_DIR, "section.html"), section);
fs.writeFileSync(
  path.join(OUT_DIR, "image-map.json"),
  JSON.stringify(
    Object.fromEntries(
      [...map].map(([k, v]) => [k.slice(0, 60) + "...", v])
    ),
    null,
    2
  )
);

console.log("section chars", section.length);
console.log("css lines", css.split("\n").length);
console.log("script lines", script.split("\n").length);
console.log("done");
