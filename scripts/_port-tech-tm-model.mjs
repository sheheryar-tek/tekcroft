/**
 * Port "Our Technical SEO Model" (.sec.tm#model) from the attached
 * tekcroft-technical-seo (12).html into the Next.js technical SEO page.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(
  process.env.USERPROFILE || "",
  "Downloads",
  "tekcroft-technical-seo (12).html"
);

if (!fs.existsSync(SRC)) {
  console.error("Source HTML missing:", SRC);
  process.exit(1);
}

const src = fs.readFileSync(SRC, "utf8");

function extractStyle(id) {
  const open = `<style id="${id}">`;
  const i = src.indexOf(open);
  if (i < 0) throw new Error(`style ${id} not found`);
  const start = i + open.length;
  const end = src.indexOf("</style>", start);
  if (end < 0) throw new Error(`style ${id} unclosed`);
  return src.slice(start, end).trim();
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
  const i = src.indexOf('<section class="sec tm" id="model">');
  if (i < 0) throw new Error("section #model not found");
  const end = src.indexOf("</section>", i);
  if (end < 0) throw new Error("section #model unclosed");
  return src.slice(i, end + "</section>".length);
}

const styles = ["tm-styles", "tm-fit", "tm-fill", "tm-viz", "tm-viz-fix"].map(
  (id) => `/* === ${id} === */\n${extractStyle(id)}`
);
const script = extractScript("tm-script");
const section = extractSection();

console.log("section bytes", section.length);
console.log("css bytes", styles.reduce((n, s) => n + s.length, 0));
console.log("js bytes", script.length);

/* ---- body: replace current #services-2 What we do accordion ---- */
const bodyPath = path.join(ROOT, "lib", "technical-seo-body.html");
let body = fs.readFileSync(bodyPath, "utf8");
const modelIdx = body.indexOf('id="services-2"');
const start = modelIdx >= 0 ? body.lastIndexOf("<section", modelIdx) : -1;
// Prefer comment header above services-2
let cut = start;
const comment = body.lastIndexOf("OUR TECHNICAL SEO MODEL", start);
if (comment >= 0 && start - comment < 500) {
  cut = body.lastIndexOf("<!--", comment);
}
const whyIdx = body.indexOf('id="why"');
const endSec = whyIdx >= 0 ? body.lastIndexOf("<section", whyIdx) : -1;
if (cut < 0 || endSec < 0) {
  console.error("body markers missing", { cut, endSec });
  process.exit(1);
}

const wrapped =
  `<!-- ══════════════════════════════════════════════════════════════════\n` +
  `     OUR TECHNICAL SEO MODEL — ported from tekcroft-technical-seo (12).html\n` +
  `     ══════════════════════════════════════════════════════════════════ -->\n` +
  section +
  "\n\n";

body = body.slice(0, cut) + wrapped + body.slice(endSec);
fs.writeFileSync(bodyPath, body);
console.log("Updated technical-seo-body.html");

/* ---- CSS: strip old acv deliverables block for #services-2, append tm ---- */
const cssPath = path.join(ROOT, "app", "technical-seo.css");
let css = fs.readFileSync(cssPath, "utf8");

const lockMark = "/* === SITE CONSISTENCY LOCK";
let lockTail = "";
const lockI = css.indexOf(lockMark);
if (lockI >= 0) {
  lockTail = css.slice(lockI);
  css = css.slice(0, lockI).trimEnd();
}

// Remove previously ported on-page deliverables / acv extras / content-only
const acvMark = "/* === ON-PAGE DELIVERABLES PANELS (from ref v6) === */";
const acvI = css.indexOf(acvMark);
if (acvI >= 0) css = css.slice(0, acvI).trimEnd();

const oldTm = "/* === tm-styles === */";
const oldTmI = css.indexOf(oldTm);
if (oldTmI >= 0) css = css.slice(0, oldTmI).trimEnd();

// Grounds: swap #services-2 for #model
css = css.replaceAll("#services-2", "#model");

const tmCss =
  "\n\n/* === tm-styles === */\n" +
  styles.join("\n\n") +
  `\n\n/* === technical-seo model ground === */\n` +
  `#model.tm{background:var(--ground) !important; border-block:0 !important;}\n`;

css = css.trimEnd() + tmCss + "\n";
if (lockTail) {
  // Keep consistency, but also map services-2 → model if present
  lockTail = lockTail.replaceAll("#services-2", "#model");
  css += "\n" + lockTail;
}
fs.writeFileSync(cssPath, css);
console.log("Updated technical-seo.css");

/* ---- JS: replace ac-script if present, append tm-script ---- */
const jsPath = path.join(ROOT, "public", "tekcroft-technical-seo.js");
let js = fs.readFileSync(jsPath, "utf8");
const acMark = "/* === ac-script (deliverables panels) === */";
const acI = js.indexOf(acMark);
if (acI >= 0) js = js.slice(0, acI).trimEnd() + "\n";

const tmMark = "/* === tm-script (Our Technical SEO Model) === */";
const tmI = js.indexOf(tmMark);
if (tmI >= 0) js = js.slice(0, tmI).trimEnd() + "\n";

js = js.trimEnd() + "\n\n" + tmMark + "\n" + script + "\n";
fs.writeFileSync(jsPath, js);
console.log("Updated tekcroft-technical-seo.js");

// site-consistency: services-2 → model
const consPath = path.join(ROOT, "app", "site-consistency.css");
let cons = fs.readFileSync(consPath, "utf8");
if (cons.includes("#services-2")) {
  cons = cons.replaceAll("#services-2", "#model");
  fs.writeFileSync(consPath, cons);
  console.log("Updated site-consistency.css");
}
