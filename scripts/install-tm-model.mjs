import fs from "fs";
import path from "path";

const SRC = "C:/Users/Super/Downloads/technical-seo-model-section.html";
const BODY = "C:/Tekcroft/lib/technical-seo-body.html";
const CSS = "C:/Tekcroft/app/technical-seo.css";
const JS = "C:/Tekcroft/public/tekcroft-technical-seo.js";
const TMP = "C:/Tekcroft/.tmp-tm";

const h = fs.readFileSync(SRC, "utf8");

function extract(startMarker, endMarker, from = 0) {
  const s = h.indexOf(startMarker, from);
  if (s < 0) throw new Error("missing start: " + startMarker);
  const e = h.indexOf(endMarker, s);
  if (e < 0) throw new Error("missing end: " + endMarker);
  return { s, e: e + endMarker.length, text: h.slice(s, e + endMarker.length) };
}

const styles = extract('<style id="tm-styles">', "</style>");
const extra = extract('<style id="tm-extra-styles">', "</style>", styles.e);
const section = extract('<section class="sec tm" id="model"', "</section>");
// grab full opening tag through last </section> of model — verify we got the right one
let secS = h.indexOf('<section class="sec tm" id="model"');
let depth = 0;
let i = secS;
let secE = -1;
while (i < h.length) {
  const open = h.indexOf("<section", i);
  const close = h.indexOf("</section>", i);
  if (close < 0) break;
  if (open >= 0 && open < close) {
    depth++;
    i = open + 8;
  } else {
    depth--;
    i = close + 10;
    if (depth === 0) {
      secE = i;
      break;
    }
  }
}
if (secE < 0) throw new Error("section end not found");
const sectionHtml = h.slice(secS, secE);

const script = extract('<script id="tm-script">', "</script>");

fs.mkdirSync(TMP, { recursive: true });
const cssInner = (block) =>
  block.text.replace(/^<style[^>]*>/, "").replace(/<\/style>$/, "");
const jsInner = script.text
  .replace(/^<script[^>]*>/, "")
  .replace(/<\/script>$/, "");

fs.writeFileSync(path.join(TMP, "tm-styles.css"), cssInner(styles));
fs.writeFileSync(path.join(TMP, "tm-extra.css"), cssInner(extra));
fs.writeFileSync(path.join(TMP, "tm-section.html"), sectionHtml);
fs.writeFileSync(path.join(TMP, "tm-script.js"), jsInner);

console.log({
  stylesLen: styles.text.length,
  extraLen: extra.text.length,
  sectionLen: sectionHtml.length,
  scriptLen: script.text.length,
  hasAxLede: sectionHtml.includes("ax-lede"),
  hasCta: sectionHtml.includes("Get a Custom Technical SEO Plan"),
  hasSmark: sectionHtml.includes("smark"),
  panelH3: (sectionHtml.match(/<h3>/g) || []).length,
  openTag: sectionHtml.slice(0, 80),
});

// --- replace body section ---
let body = fs.readFileSync(BODY, "utf8");
const bS = body.indexOf('<section class="sec tm" id="model"');
if (bS < 0) throw new Error("body model section missing");
let bd = 0;
let bi = bS;
let bE = -1;
while (bi < body.length) {
  const open = body.indexOf("<section", bi);
  const close = body.indexOf("</section>", bi);
  if (close < 0) break;
  if (open >= 0 && open < close) {
    bd++;
    bi = open + 8;
  } else {
    bd--;
    bi = close + 10;
    if (bd === 0) {
      bE = bi;
      break;
    }
  }
}
if (bE < 0) throw new Error("body model end missing");
// Keep page ground attribute if new section lacks data-ground — user said keep id=model and exact section from file
body = body.slice(0, bS) + sectionHtml.trim() + "\n" + body.slice(bE);
fs.writeFileSync(BODY, body);
console.log("body replaced", bE - bS, "->", sectionHtml.trim().length);

// --- replace CSS: remove old tm blocks, insert new ---
let css = fs.readFileSync(CSS, "utf8");
const startMarkers = [
  "/* === tm-styles === */",
  "/* === tm-fit",
  "/* === tm-fill",
  "/* === tm-viz",
  "/* === tm-extra",
];
// Find first tm-styles comment
let cssStart = css.indexOf("/* === tm-styles === */");
if (cssStart < 0) throw new Error("tm css start not found");

// Remove through tm-viz-fix; keep "technical-seo model ground" beat lock after
let cssEnd = css.indexOf("/* === technical-seo model ground", cssStart);
if (cssEnd < 0) {
  cssEnd = css.indexOf("/* === tb-styles (AI relevance", cssStart);
}
if (cssEnd < 0) throw new Error("css end not found");

const newCss =
  "/* === tm-styles (from approved technical-seo-model-section.html) === */\n" +
  cssInner(styles).trim() +
  "\n\n/* === tm-extra-styles (from approved technical-seo-model-section.html) === */\n" +
  cssInner(extra).trim() +
  "\n\n";

css = css.slice(0, cssStart) + newCss + css.slice(cssEnd);
fs.writeFileSync(CSS, css);
console.log("css replaced", cssStart, "->", cssEnd);

// --- replace JS ---
let js = fs.readFileSync(JS, "utf8");
const jsStart = js.indexOf("/* === tm-script");
if (jsStart < 0) {
  // append
  js = js.trimEnd() + "\n\n/* === tm-script (Our Technical SEO Model) === */\n" + jsInner.trim() + "\n";
} else {
  // find next /* === that isn't tm-script continuation, or EOF
  let jsEnd = js.length;
  const next = js.indexOf("\n/* ===", jsStart + 5);
  if (next > 0) jsEnd = next;
  js =
    js.slice(0, jsStart) +
    "/* === tm-script (Our Technical SEO Model) === */\n" +
    jsInner.trim() +
    "\n" +
    js.slice(jsEnd);
}
fs.writeFileSync(JS, js);
console.log("js replaced");

console.log("DONE");
