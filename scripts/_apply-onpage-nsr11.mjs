import fs from "fs";
import path from "path";

const ROOT = "c:/Tekcroft";
const REF = "c:/Users/Super/Downloads/tekcroft-onpage-seo (11).html";
const OUT = path.join(ROOT, "scripts/_extracted-onpage-nsr11");
const bodyPath = path.join(ROOT, "lib/on-page-seo-body.html");
const cssPath = path.join(ROOT, "app/on-page-seo.css");
const jsPath = path.join(ROOT, "public/tekcroft-on-page-seo.js");

fs.mkdirSync(OUT, { recursive: true });
const h = fs.readFileSync(REF, "utf8");

const STYLE_IDS = [
  "nsr-styles",
  "nsr-real",
  "nsr-fix",
  "nsr-fix2",
  "nsr-fix3",
  "nsr-responsive",
  "nsr-flow",
  "nsr-flow2",
  "nsr-onpage",
  "nsr-onpage2",
  "nsr-connect",
  "nsr-loop",
  "nsr-flowline",
];

function extractStyle(id) {
  const open = `<style id="${id}">`;
  const a = h.indexOf(open);
  if (a < 0) throw new Error("missing style: " + id);
  const b = h.indexOf("</style>", a);
  if (b < 0) throw new Error("unclosed style: " + id);
  return h.slice(a + open.length, b);
}

function extractScript(id) {
  const open = `<script id="${id}">`;
  const a = h.indexOf(open);
  if (a < 0) throw new Error("missing script: " + id);
  const b = h.indexOf("</script>", a);
  if (b < 0) throw new Error("unclosed script: " + id);
  return h.slice(a + open.length, b);
}

function extractSection() {
  const marker = '<section class="sec nsr" id="ai-search"';
  const tag = h.indexOf(marker);
  if (tag < 0) throw new Error("ai-search section missing");
  // include any leading comment on same block
  let start = tag;
  const comment = h.lastIndexOf("<!--", tag);
  if (comment > tag - 400 && comment >= 0) {
    const between = h.slice(comment, tag);
    if (!between.includes("</section>") && between.includes("AI")) start = comment;
  }
  let i = tag;
  let depth = 0;
  let end = -1;
  while (i < h.length) {
    if (h.startsWith("<section", i)) {
      depth++;
      i = h.indexOf(">", i) + 1;
      continue;
    }
    if (h.startsWith("</section>", i)) {
      depth--;
      i += "</section>".length;
      if (depth === 0) {
        end = i;
        break;
      }
      continue;
    }
    i++;
  }
  if (end < 0) throw new Error("ai-search unclosed");
  return h.slice(start, end);
}

const section = extractSection();
fs.writeFileSync(path.join(OUT, "section.html"), section);
console.log("section bytes", section.length);

let cssBundle = "";
for (const id of STYLE_IDS) {
  const css = extractStyle(id);
  fs.writeFileSync(path.join(OUT, id + ".css"), css);
  cssBundle += `\n/* --- ${id} --- */\n` + css + "\n";
  console.log("style", id, css.length);
}
fs.writeFileSync(path.join(OUT, "bundle.css"), cssBundle);

const loopJs = extractScript("nsr-loop-js");
fs.writeFileSync(path.join(OUT, "nsr-loop-js.js"), loopJs);
console.log("nsr-loop-js", loopJs.length);

/* Guard: do not pull text/plain scripts */
if (!h.includes('id="nsr-script" type="text/plain"')) {
  console.warn("note: nsr-script text/plain not found (ok if renamed)");
}
if (!h.includes('id="nsr-centre" type="text/plain"')) {
  console.warn("note: nsr-centre text/plain not found (ok if renamed)");
}

/* ── apply to on-page body ───────────────────────────────────────────── */
let body = fs.readFileSync(bodyPath, "utf8");
const oldTag = body.indexOf('<section class="sec nsr" id="ai-search"');
const oldComment = body.indexOf(
  "<!-- ============================================================ AI SEARCH VISIBILITY -->"
);
const start = oldComment >= 0 && oldComment < oldTag ? oldComment : oldTag;
if (oldTag < 0) throw new Error("existing ai-search missing in body");

let i = oldTag;
let depth = 0;
let end = -1;
while (i < body.length) {
  if (body.startsWith("<section", i)) {
    depth++;
    i = body.indexOf(">", i) + 1;
    continue;
  }
  if (body.startsWith("</section>", i)) {
    depth--;
    i += "</section>".length;
    if (depth === 0) {
      end = i;
      break;
    }
    continue;
  }
  i++;
}
if (end < 0) throw new Error("existing ai-search unclosed");

const insert =
  "<!-- ============================================================ AI SEARCH VISIBILITY -->\n" +
  section.replace(/^<!--[\s\S]*?-->\s*/, "") + // drop ref comment if any
  "\n";

body = body.slice(0, start) + insert + body.slice(end);
fs.writeFileSync(bodyPath, body);
console.log("body: replaced #ai-search with ref section");

/* ── CSS: replace previous homepage NSR bundle with the 13 blocks ─────── */
const marker = "/* === AI SEARCH VISIBILITY — homepage NSR design === */";
const markerNew = "/* === AI SEARCH VISIBILITY — from onpage ref (11) === */";
let siteCss = fs.readFileSync(cssPath, "utf8");
const cut = siteCss.indexOf(marker);
const cutNew = siteCss.indexOf(markerNew);
const cutAt = cut >= 0 ? cut : cutNew;
if (cutAt >= 0) siteCss = siteCss.slice(0, cutAt).replace(/\s+$/, "") + "\n";

siteCss +=
  "\n\n" +
  markerNew +
  "\n" +
  "/* Thirteen style blocks in reference order. Later blocks correct earlier ones. */\n" +
  cssBundle +
  "\n";
fs.writeFileSync(cssPath, siteCss);
console.log("css: wrote 13 nsr style blocks");

/* ── JS: replace old nsr-script with nsr-loop-js only ─────────────────── */
let js = fs.readFileSync(jsPath, "utf8");
const jsOld = "/* === nsr-script (AI search visibility) === */";
const jsNew = "/* === nsr-loop-js (AI search visibility) === */";
if (js.includes(jsOld)) {
  js = js.slice(0, js.indexOf(jsOld)).replace(/\s+$/, "") + "\n";
} else if (js.includes(jsNew)) {
  js = js.slice(0, js.indexOf(jsNew)).replace(/\s+$/, "") + "\n";
}
js += "\n\n" + jsNew + "\n" + loopJs.trim() + "\n";
fs.writeFileSync(jsPath, js);
console.log("js: replaced with nsr-loop-js only");

/* verify */
const check = fs.readFileSync(bodyPath, "utf8");
if (!check.includes('id="ai-search"') || !check.includes("nsrTitle")) {
  throw new Error("section verify failed");
}
if (check.includes('type="text/plain"')) {
  console.warn("body unexpectedly has text/plain");
}
const cssCheck = fs.readFileSync(cssPath, "utf8");
for (const id of STYLE_IDS) {
  if (!cssCheck.includes(`/* --- ${id} --- */`)) throw new Error("css missing " + id);
}
const jsCheck = fs.readFileSync(jsPath, "utf8");
if (!jsCheck.includes("nsr-loop-js")) throw new Error("js missing loop");
if (jsCheck.includes("ref script 6")) console.warn("old homepage nsr script still present?");
console.log("done");
