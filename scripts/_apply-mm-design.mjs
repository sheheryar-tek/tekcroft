/**
 * Apply mega-menu.html design layers to the live mega menu only.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EXTRACT = path.join(ROOT, "scripts", "_mm-design-extract");

const styleIds = [
  "mm-veil-lighter",
  "mm-bottom-copy",
  "mm-core-pills",
  "mm-core-strong",
  "mm-spacing",
  "mm-core-v3",
  "mm-core-fit",
  "mm-current",
];
const scriptIds = ["mm-core-icons", "mm-current-js"];

const cssBundle = styleIds
  .map((id) => {
    const body = fs
      .readFileSync(path.join(EXTRACT, id + ".css"), "utf8")
      .trim();
    return `/* === ${id} === */\n${body}`;
  })
  .join("\n\n");

const jsBundle = scriptIds
  .map((id) => {
    const body = fs
      .readFileSync(path.join(EXTRACT, id + ".js"), "utf8")
      .trim();
    return `/* === ${id} === */\n${body}`;
  })
  .join("\n\n");

const cssMark = "/* === MEGA MENU DESIGN LAYERS (from mega-menu.html) === */";
const jsMark = "/* === MEGA MENU DESIGN LAYERS (from mega-menu.html) === */";

/* ---- CSS ---- */
const cssPath = path.join(ROOT, "app", "tekcroft.css");
let css = fs.readFileSync(cssPath, "utf8");

// Strip prior injection
while (css.includes(cssMark)) {
  const i = css.indexOf(cssMark);
  // End at REFINEMENTS header or next SITE CONSISTENCY LOCK or next double-newline+big comment
  let end = css.indexOf("\n   REFINEMENTS\n", i);
  if (end >= 0) {
    // walk back to the opening /* of REFINEMENTS block
    end = css.lastIndexOf("\n\n/*", end);
  }
  if (end < 0) end = css.indexOf("\n/* === SITE CONSISTENCY LOCK", i);
  if (end < 0) end = css.length;
  css = css.slice(0, i).trimEnd() + "\n" + css.slice(end);
}

const anchor =
  ".mnav .mm-accp a{display:block; padding:10px 0 10px 16px; font-size:14px; font-weight:500;\n  text-align:left; color:var(--muted); border-bottom:1px solid var(--border-soft);}";
const aI = css.indexOf(anchor);
if (aI < 0) throw new Error("mega menu mnav CSS anchor not found");
const insertAt = aI + anchor.length;
css =
  css.slice(0, insertAt) +
  "\n\n" +
  cssMark +
  "\n" +
  cssBundle +
  "\n" +
  css.slice(insertAt);
fs.writeFileSync(cssPath, css);
console.log("Updated tekcroft.css (+" + cssBundle.length + " css chars)");

/* ---- JS: tekcroft-mm.js ---- */
const mmPath = path.join(ROOT, "public", "tekcroft-mm.js");
let mm = fs.readFileSync(mmPath, "utf8");

if (/title:"SEO \(Core, Technical & Ecommerce\)"/.test(mm)) {
  mm = mm.replace(
    'title:"SEO (Core, Technical & Ecommerce)"',
    'title:"SEO"'
  );
  console.log('Renamed core title to "SEO"');
} else if (/title:"SEO"/.test(mm)) {
  console.log('Core title already "SEO"');
} else {
  console.warn("WARN: SEO core title not found");
}

if (mm.includes(jsMark)) {
  const i = mm.indexOf(jsMark);
  const faq = mm.indexOf("\n\n/* ---------------- FAQ accordion", i);
  mm =
    mm.slice(0, i).trimEnd() +
    "\n" +
    (faq >= 0 ? mm.slice(faq) : "");
}

const faqMark = "\n\n/* ---------------- FAQ accordion";
const faqI = mm.indexOf(faqMark);
if (faqI < 0) throw new Error("FAQ marker in tekcroft-mm.js not found");

mm =
  mm.slice(0, faqI).trimEnd() +
  "\n\n" +
  jsMark +
  "\n" +
  jsBundle +
  "\n" +
  mm.slice(faqI);
fs.writeFileSync(mmPath, mm);
console.log("Updated tekcroft-mm.js");

/* ---- mobile close fix ---- */
const want =
  'mnav.addEventListener("click", function(e){ if (e.target.closest(".mm-acc")) return; if (e.target.closest("a[href],[data-jump]")) closeMenu(); });';

const pub = path.join(ROOT, "public");
let fixed = 0;
let ok = 0;
for (const f of fs.readdirSync(pub)) {
  if (!/^tekcroft-.*\.js$/.test(f)) continue;
  if (/\.[a-f0-9]{10}\.js$/.test(f)) continue;
  if (f === "tekcroft-mm.js" || f === "tekcroft-main.js") continue;
  const fp = path.join(pub, f);
  let src = fs.readFileSync(fp, "utf8");
  if (!src.includes("mnav.addEventListener")) continue;

  if (src.includes(want)) {
    ok++;
    continue;
  }

  const next = src.replace(
    /mnav\.addEventListener\("click",\s*function\(e\)\{[\s\S]*?\}\);/,
    want
  );
  if (next !== src) {
    fs.writeFileSync(fp, next);
    fixed++;
    console.log("fixed mnav click", f);
  } else {
    console.warn("WARN: could not patch", f);
  }
}
console.log("mnav fixed:", fixed, "already ok:", ok);
console.log("done");
