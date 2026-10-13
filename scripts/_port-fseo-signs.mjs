/**
 * Port franchise-seo-signs-section-compact.html (#franchise-signs)
 * onto /services/franchise-seo-services — replace old #signs.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC =
  "c:/Users/Super/Downloads/franchise-seo-signs-section-compact (1).html";

if (!fs.existsSync(SRC)) {
  console.error("Source HTML missing:", SRC);
  process.exit(1);
}

const src = fs.readFileSync(SRC, "utf8");

function sliceBetween(startMarker, endMarker) {
  const start = src.indexOf(startMarker);
  if (start < 0) throw new Error("missing " + startMarker);
  const end = src.indexOf(endMarker, start);
  if (end < 0) throw new Error("missing end " + endMarker);
  return src.slice(start, end + endMarker.length);
}

function extractInner(open, close) {
  const block = sliceBetween(open, close);
  return block.slice(open.length, block.length - close.length).trim();
}

const css = extractInner('<style id="fs-styles">', "</style>");
const section = sliceBetween(
  '<section class="sec fs" id="franchise-signs">',
  "</section>"
).trim();
const script = extractInner('<script id="fs-script">', "</script>");

console.log({
  css: css.length,
  section: section.length,
  script: script.length,
});

/* ---- body: replace old #signs ---- */
const bodyPath = path.join(ROOT, "lib", "franchise-seo-body.html");
let body = fs.readFileSync(bodyPath, "utf8");

const signsId = body.indexOf('id="signs"');
const franchiseSignsId = body.indexOf('id="franchise-signs"');
let cutStart = -1;
let cutEnd = -1;

function sectionBounds(html, idAttr) {
  const i = html.indexOf(idAttr);
  if (i < 0) return null;
  const start = html.lastIndexOf("<section", i);
  let depth = 0;
  let p = start;
  while (p < html.length) {
    const o = html.indexOf("<section", p);
    const c = html.indexOf("</section>", p);
    if (c < 0) break;
    if (o >= 0 && o < c) {
      depth++;
      p = o + 8;
      continue;
    }
    depth--;
    p = c + "</section>".length;
    if (depth === 0) return { start, end: p };
  }
  return null;
}

if (franchiseSignsId >= 0) {
  const b = sectionBounds(body, 'id="franchise-signs"');
  if (!b) throw new Error("could not bound existing franchise-signs");
  cutStart = b.start;
  cutEnd = b.end;
  // also drop trailing script if present right after
  const after = body.slice(cutEnd, cutEnd + 80);
  if (after.includes('id="fs-script"')) {
    const s = body.indexOf('<script id="fs-script">', cutEnd);
    const e = body.indexOf("</script>", s);
    if (s >= 0 && e > s) cutEnd = e + "</script>".length;
  }
} else if (signsId >= 0) {
  const b = sectionBounds(body, 'id="signs"');
  if (!b) throw new Error("could not bound old #signs");
  cutStart = b.start;
  cutEnd = b.end;
} else {
  // insert before franchise-covers
  const covers = body.indexOf('id="franchise-covers"');
  if (covers < 0) throw new Error("no insertion point");
  cutStart = body.lastIndexOf("<section", covers);
  cutEnd = cutStart;
}

const wrapped =
  `<!-- ══════════════════════════════════════════════════════════════════\n` +
  `     SIGNS YOUR FRANCHISE SEO ISN'T WORKING (compact fs panels)\n` +
  `     ══════════════════════════════════════════════════════════════════ -->\n` +
  section +
  "\n\n";

body = body.slice(0, cutStart) + wrapped + body.slice(cutEnd);
body = body.replaceAll('href="#signs"', 'href="#franchise-signs"');
fs.writeFileSync(bodyPath, body);
console.log("Updated franchise-seo-body.html");

/* ---- CSS ---- */
const cssPath = path.join(ROOT, "app", "franchise-seo.css");
let pageCss = fs.readFileSync(cssPath, "utf8");

const lockMark =
  "/* === SITE CONSISTENCY LOCK (do not edit here — edit site-consistency.css) === */";
let lockTail = "";
const lockI = pageCss.indexOf(lockMark);
if (lockI >= 0) {
  // Keep only the LAST lock copy (file may have duplicates from prior runs)
  const lastLock = pageCss.lastIndexOf(lockMark);
  lockTail = pageCss.slice(lastLock);
  pageCss = pageCss.slice(0, lastLock).trimEnd();
  // Drop any earlier lock copies still in the head piece
  const earlier = pageCss.indexOf(lockMark);
  if (earlier >= 0) pageCss = pageCss.slice(0, earlier).trimEnd();
}

const fsMark = "/* === fs-styles (Franchise SEO Signs) === */";
const fsI = pageCss.indexOf(fsMark);
if (fsI >= 0) pageCss = pageCss.slice(0, fsI).trimEnd();

const protectMark =
  "/* === franchise-signs: beat site-consistency without editing fs-styles === */";
const protect = `
${protectMark}
html body #franchise-signs.fs{
  padding-block:clamp(48px,5vw,80px) !important;
  background:#fff !important;
}
html[data-theme="dark"] body #franchise-signs.fs{
  background:var(--bg) !important;
}
html body #franchise-signs h2{
  margin:0 !important;
  font-family:var(--font-display) !important;
  font-size:clamp(30px,3.2vw,48px) !important;
  font-weight:800 !important;
  letter-spacing:-.04em !important;
  line-height:1.06 !important;
  color:var(--text) !important;
  text-transform:none !important;
}
html body #franchise-signs h2 em{
  font-style:normal !important;
  color:var(--primary) !important;
  display:inline !important;
}
html body #franchise-signs .fs-lede{
  margin:0 !important;
  padding-left:clamp(16px,1.6vw,22px) !important;
  border-left:2px solid var(--primary) !important;
  font-size:clamp(15px,1.1vw,17px) !important;
  line-height:1.65 !important;
  color:var(--text-2) !important;
}
html body #franchise-signs .fs-row h3{
  margin:0 !important;
  font-family:var(--font-display) !important;
  font-size:16px !important;
  font-weight:800 !important;
  line-height:1.32 !important;
  letter-spacing:-.01em !important;
  color:var(--text) !important;
  text-transform:none !important;
}
html body #franchise-signs .fs-row.on .fs-tx h3,
html body #franchise-signs .fs-row:hover .fs-tx h3{
  color:var(--primary) !important;
}
html body #franchise-signs .fs-row p{
  margin:0 !important;
  font-size:14.2px !important;
  line-height:1.58 !important;
  color:var(--text-2) !important;
}
html body #franchise-signs .fs-grid{
  list-style:none !important;
  margin:0 !important;
  padding:0 !important;
}
html body #franchise-signs .mv2 :is(b,em,u,s){
  font-style:normal !important;
  text-decoration:none !important;
}
html body #franchise-signs .fs-cta .btn .btn-label{
  opacity:1 !important;
  visibility:visible !important;
}
`;

pageCss =
  pageCss.trimEnd() +
  "\n\n" +
  fsMark +
  "\n" +
  css +
  "\n";

if (lockTail) {
  // Keep #franchise-signs OUT of the --sec-y !important ID list so the
  // section's own padding (and the protect block below) can win.
  pageCss += "\n" + lockTail.trimEnd() + "\n" + protect + "\n";
} else {
  pageCss += protect + "\n";
}

fs.writeFileSync(cssPath, pageCss);
console.log("Updated franchise-seo.css");

/* ---- JS ---- */
const jsPath = path.join(ROOT, "public", "tekcroft-franchise-seo.js");
let js = fs.readFileSync(jsPath, "utf8");
const jsMark = "/* === fs-script (Franchise SEO Signs) === */";
const jsI = js.indexOf(jsMark);
if (jsI >= 0) js = js.slice(0, jsI).trimEnd() + "\n";
js = js.trimEnd() + "\n\n" + jsMark + "\n" + script + "\n";
fs.writeFileSync(jsPath, js);
console.log("Updated tekcroft-franchise-seo.js");

console.log("done — run: node scripts/hash-assets.mjs");
