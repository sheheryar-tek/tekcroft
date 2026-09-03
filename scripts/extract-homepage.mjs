/**
 * Extracts the Tekcroft homepage HTML into Next.js assets.
 * Run: node scripts/extract-homepage.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC =
  process.env.TEKCROFT_HTML ||
  "c:\\Users\\Super\\Desktop\\TK FINAL\\Homepage\\tekcroft-site-mega-menus (15).html";

const outCss = path.join(ROOT, "app", "tekcroft.css");
const outHtml = path.join(ROOT, "lib", "homepage-body.html");
const outMainJs = path.join(ROOT, "public", "tekcroft-main.js");
const outMmJs = path.join(ROOT, "public", "tekcroft-mm.js");
const outMeta = path.join(ROOT, "lib", "homepage-meta.json");

console.log("Reading:", SRC);
const html = fs.readFileSync(SRC, "utf8");

// --- CSS ---
const styles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map(
  (m) => m[1]
);
fs.mkdirSync(path.dirname(outCss), { recursive: true });
fs.writeFileSync(
  outCss,
  `/* Extracted from tekcroft-site-mega-menus — do not reformat */\n` +
    styles.join("\n\n")
);
console.log("Wrote CSS:", outCss, `(${styles.length} blocks)`);

// --- Body (without scripts) ---
const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
if (!bodyMatch) throw new Error("No <body> found");
let body = bodyMatch[1];
body = body.replace(/<script\b[\s\S]*?<\/script>/gi, "");
body = body.trim();
fs.mkdirSync(path.dirname(outHtml), { recursive: true });
fs.writeFileSync(outHtml, body);
console.log("Wrote body HTML:", outHtml, `(${body.length} chars)`);

// --- Scripts (non JSON-LD) ---
const scripts = [
  ...html.matchAll(/<script(?![^>]*type=["']application\/ld\+json)([^>]*)>([\s\S]*?)<\/script>/gi),
].filter((m) => {
  const attrs = m[1] || "";
  return !/src=/i.test(attrs);
});

fs.mkdirSync(path.join(ROOT, "public"), { recursive: true });
if (scripts[0]) {
  fs.writeFileSync(outMainJs, scripts[0][2]);
  console.log("Wrote main JS:", outMainJs, `(${scripts[0][2].length} chars)`);
}
if (scripts[1]) {
  fs.writeFileSync(outMmJs, scripts[1][2]);
  console.log("Wrote mm JS:", outMmJs, `(${scripts[1][2].length} chars)`);
}

// --- JSON-LD ---
const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)].map(
  (m) => {
    try {
      return JSON.parse(m[1]);
    } catch {
      return m[1].trim();
    }
  }
);

const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
const descMatch = html.match(/<meta name="description" content="([^"]*)"/i);
const canonicalMatch = html.match(/<link rel="canonical" href="([^"]*)"/i);

fs.writeFileSync(
  outMeta,
  JSON.stringify(
    {
      title: titleMatch ? titleMatch[1].trim() : "Tekcroft",
      description: descMatch ? descMatch[1] : "",
      canonical: canonicalMatch ? canonicalMatch[1] : "https://www.tekcroft.com/",
      jsonLd: ld,
    },
    null,
    2
  )
);
console.log("Wrote meta:", outMeta);
console.log("Done.");
