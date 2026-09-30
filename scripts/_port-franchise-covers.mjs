/**
 * Port franchise-seo-covers-section.html (.sec.tm#franchise-covers)
 * onto franchise "What we do" — replace #services-2 acv.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(
  process.env.USERPROFILE || "",
  "Downloads",
  "franchise-seo-covers-section.html"
);

if (!fs.existsSync(SRC)) {
  console.error("Source HTML missing:", SRC);
  process.exit(1);
}

const src = fs.readFileSync(SRC, "utf8");

function extractAllStyles(id) {
  const re = new RegExp(`<style id="${id}">([\\s\\S]*?)</style>`, "gi");
  return [...src.matchAll(re)].map((m) => m[1].trim());
}

function extractScript(id) {
  const open = `<script id="${id}">`;
  const i = src.indexOf(open);
  if (i < 0) throw new Error(`script ${id} not found`);
  const start = i + open.length;
  const end = src.indexOf("</script>", start);
  if (end < 0) throw new Error(`script ${id} unclosed`);
  return src.slice(start, end).trim();
}

function extractSection() {
  const marker = '<section class="sec tm" id="franchise-covers">';
  const start = src.indexOf(marker);
  if (start < 0) throw new Error("section not found");
  let i = start;
  let depth = 0;
  while (i < src.length) {
    const o = src.indexOf("<section", i);
    const c = src.indexOf("</section>", i);
    if (c < 0) break;
    if (o >= 0 && o < c) {
      depth++;
      i = o + 8;
      continue;
    }
    depth--;
    i = c + "</section>".length;
    if (depth === 0) return src.slice(start, i);
  }
  throw new Error("unclosed section");
}

// Prefer franchise-covers tm-styles; drop the leftover #model copy
const tmStylesAll = extractAllStyles("tm-styles");
const tmStyles = tmStylesAll.filter((t) => t.includes("#franchise-covers"));
if (!tmStyles.length) throw new Error("no #franchise-covers tm-styles");

const styleIds = ["tm-fit", "tm-fill", "tm-viz", "tm-viz-fix"];
const styles = [
  ...tmStyles.map((t) => `/* === tm-styles === */\n${t}`),
  ...styleIds.map((id) => {
    const parts = extractAllStyles(id);
    if (!parts.length) throw new Error("Missing style #" + id);
    return `/* === ${id} === */\n` + parts.join("\n\n");
  }),
];

const script = extractScript("tm-script");
let section = extractSection().trim();
// Ensure ground attribute for site grounds system
if (!section.includes('data-ground=')) {
  section = section.replace(
    '<section class="sec tm" id="franchise-covers">',
    '<section class="sec tm" id="franchise-covers" data-ground="tint">'
  );
}

console.log({
  section: section.length,
  css: styles.reduce((n, s) => n + s.length, 0),
  js: script.length,
  tmStylesCount: tmStyles.length,
});

/* ---- body ---- */
const bodyPath = path.join(ROOT, "lib", "franchise-seo-body.html");
let body = fs.readFileSync(bodyPath, "utf8");

const svcIdx = body.indexOf('id="services-2"');
const start = svcIdx >= 0 ? body.lastIndexOf("<section", svcIdx) : -1;
const indIdx = body.indexOf('id="industries"');
const endSec = indIdx >= 0 ? body.lastIndexOf("<section", indIdx) : -1;
if (start < 0 || endSec < 0) {
  console.error("body markers missing", { start, endSec });
  process.exit(1);
}

const wrapped =
  `<!-- ══════════════════════════════════════════════════════════════════\n` +
  `     WHAT WE DO — Franchise SEO Covers (tm panels)\n` +
  `     ══════════════════════════════════════════════════════════════════ -->\n` +
  section +
  "\n\n";

body = body.slice(0, start) + wrapped + body.slice(endSec);
body = body.replaceAll('href="#services-2"', 'href="#franchise-covers"');
fs.writeFileSync(bodyPath, body);
console.log("Updated franchise-seo-body.html");

/* ---- CSS ---- */
const cssPath = path.join(ROOT, "app", "franchise-seo.css");
let css = fs.readFileSync(cssPath, "utf8");

const lockMark = "/* === SITE CONSISTENCY LOCK";
let lockTail = "";
const lockI = css.indexOf(lockMark);
if (lockI >= 0) {
  lockTail = css.slice(lockI);
  css = css.slice(0, lockI).trimEnd();
}

const acvMark = "/* === Franchise acv What-we-do (ported from ecommerce-seo) === */";
const acvI = css.indexOf(acvMark);
if (acvI >= 0) css = css.slice(0, acvI).trimEnd();

const oldTm = "/* === tm-styles === */";
const oldTmI = css.indexOf(oldTm);
if (oldTmI >= 0) css = css.slice(0, oldTmI).trimEnd();

// Page-local grounds / leftovers that targeted the old accordion id
css = css.replaceAll("#services-2", "#franchise-covers");

const tmCss =
  "\n\n" +
  styles.join("\n\n") +
  `\n\n/* === franchise-covers ground === */\n` +
  `#franchise-covers.tm{background:var(--ground) !important; border-block:0 !important;}\n` +
  `#franchise-covers .tm-head h2{font-size:var(--h2); letter-spacing:-.04em;}\n` +
  `#franchise-covers .tm-head h2 em{font-style:normal; color:var(--brand-text);}\n`;

css = css.trimEnd() + tmCss + "\n";
if (lockTail) {
  lockTail = lockTail.replaceAll("#services-2", "#franchise-covers");
  css += "\n" + lockTail;
}
fs.writeFileSync(cssPath, css);
console.log("Updated franchise-seo.css");

/* ---- JS ---- */
const jsPath = path.join(ROOT, "public", "tekcroft-franchise-seo.js");
let js = fs.readFileSync(jsPath, "utf8");

const acMark = "/* === ac-script (deliverables panels) === */";
const acI = js.indexOf(acMark);
if (acI >= 0) js = js.slice(0, acI).trimEnd() + "\n";

const tmMark = "/* === tm-script (Franchise SEO Covers) === */";
const tmI = js.indexOf(tmMark);
if (tmI >= 0) js = js.slice(0, tmI).trimEnd() + "\n";

js = js.trimEnd() + "\n\n" + tmMark + "\n" + script + "\n";
fs.writeFileSync(jsPath, js);
console.log("Updated tekcroft-franchise-seo.js");

/* ---- site-consistency: add #franchise-covers alongside remaining #services-2 ---- */
const consPath = path.join(ROOT, "app", "site-consistency.css");
let cons = fs.readFileSync(consPath, "utf8");
if (!cons.includes("#franchise-covers")) {
  cons = cons.replaceAll("#services-2", "#services-2, #franchise-covers");
  // Avoid double-adding if already expanded somehow
  cons = cons.replaceAll(
    "#services-2, #franchise-covers, #franchise-covers",
    "#services-2, #franchise-covers"
  );
  fs.writeFileSync(consPath, cons);
  console.log("Updated site-consistency.css");
} else {
  console.log("site-consistency.css already has #franchise-covers");
}
