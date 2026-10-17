import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC =
  "C:/Users/Super/Downloads/seo-audit-why-choose-section (1).html";
const t = fs.readFileSync(SRC, "utf8");

const sm = t.match(/<style id="wa-styles">([\s\S]*?)<\/style>/);
if (!sm) throw new Error("wa-styles not found");
let css = sm[1].trim();

// Drop unused #why.wy surface rule (section is #audit-why)
css = css.replace(/#why\.wy\{[^}]+\}\s*/g, "");

// Renames
css = css.replace(/#whyus\.wa/g, "#audit-why");
css = css.replace(/#whyus/g, "#audit-why");
const map = [
  ["wy-head", "awy-head"],
  ["wy-tabs", "awy-tabs"],
  ["wy-tab", "awy-tab"],
  ["wy-stage", "awy-stage"],
  ["wy-pane", "awy-pane"],
  ["wy-copy", "awy-copy"],
  ["wy-ic", "awy-ic"],
  ["wy-proof", "awy-proof"],
  ["wy-row", "awy-row"],
  ["wy-ph", "awy-ph"],
  ["wa-intro", "awy-intro"],
  ["wa-stats", "awy-stats"],
  ["wa-st", "awy-st"],
  ["wa-art", "awy-art"],
];
for (const [from, to] of map) {
  css = css.replace(new RegExp(`\\.${from}\\b`, "g"), `.${to}`);
}

// Adjacent vs is tint → white in light mode
css = css.replace(
  /(#audit-why\{padding-block:clamp\(56px,5\.6vw,90px\); background:)#DAEEF6( !important; text-transform:none;\})/,
  "$1#FFFFFF$2"
);

/**
 * Prefix selectors in a CSS chunk (no nested @rules).
 * Leaves @keyframes / keyframe percentages alone when called on keyframe bodies.
 */
function scopeSelectors(chunk, isKeyframeBody) {
  if (isKeyframeBody) return chunk;
  // Split into rule blocks: selector { body }
  let out = "";
  let i = 0;
  while (i < chunk.length) {
    // Skip whitespace/comments
    if (chunk[i] === "/" && chunk[i + 1] === "*") {
      const end = chunk.indexOf("*/", i + 2);
      out += chunk.slice(i, end + 2);
      i = end + 2;
      continue;
    }
    if (/\s/.test(chunk[i])) {
      out += chunk[i];
      i++;
      continue;
    }
    const open = chunk.indexOf("{", i);
    if (open < 0) {
      out += chunk.slice(i);
      break;
    }
    const selectors = chunk.slice(i, open).trim();
    let depth = 1;
    let j = open + 1;
    while (j < chunk.length && depth > 0) {
      if (chunk[j] === "{") depth++;
      else if (chunk[j] === "}") depth--;
      j++;
    }
    const body = chunk.slice(open + 1, j - 1);
    const scoped = selectors
      .split(",")
      .map((sel) => {
        const s = sel.trim();
        if (!s) return s;
        if (s.startsWith("#audit-why")) return s;
        if (s.startsWith("@")) return s;
        // html[data-theme="dark"] .foo → html[data-theme="dark"] #audit-why .foo
        // Skip if already includes #audit-why (e.g. after #whyus.wa → #audit-why rename)
        if (s.startsWith("html[")) {
          if (s.includes("#audit-why")) return s;
          return s.replace(/^(html\[[^\]]+\])\s+/, "$1 #audit-why ");
        }
        return `#audit-why ${s}`;
      })
      .join(", ");
    out += scoped + "{" + body + "}";
    i = j;
  }
  return out;
}

function processCss(input) {
  let out = "";
  let i = 0;
  while (i < input.length) {
    if (input[i] === "/" && input[i + 1] === "*") {
      const end = input.indexOf("*/", i + 2);
      out += input.slice(i, end + 2);
      i = end + 2;
      continue;
    }
    // @media / @keyframes / @supports
    if (input[i] === "@") {
      const open = input.indexOf("{", i);
      const header = input.slice(i, open).trim();
      let depth = 1;
      let j = open + 1;
      while (j < input.length && depth > 0) {
        if (input[j] === "{") depth++;
        else if (input[j] === "}") depth--;
        j++;
      }
      const inner = input.slice(open + 1, j - 1);
      const isKf = /^@keyframes\b/i.test(header);
      out += header + "{" + (isKf ? inner : scopeSelectors(inner, false)) + "}";
      i = j;
      continue;
    }
    if (/\s/.test(input[i])) {
      out += input[i];
      i++;
      continue;
    }
    // Normal rule — consume until we can hand to scopeSelectors for remainder of top-level rules until next @
    // Find next @ at top level or end
    let k = i;
    let depth = 0;
    let nextAt = -1;
    while (k < input.length) {
      if (input[k] === "/" && input[k + 1] === "*") {
        k = input.indexOf("*/", k + 2) + 2;
        continue;
      }
      if (input[k] === "{") depth++;
      else if (input[k] === "}") depth--;
      else if (input[k] === "@" && depth === 0) {
        nextAt = k;
        break;
      }
      k++;
    }
    const end = nextAt < 0 ? input.length : nextAt;
    out += scopeSelectors(input.slice(i, end), false);
    i = end;
  }
  return out;
}

css = processCss(css);

// Pretty-ish: ensure newlines between rules for readability
css = css
  .replace(/\}(?!\s*[@}])/g, "}\n")
  .replace(/\{/g, "{\n  ")
  .replace(/;\s*/g, ";\n  ")
  .replace(/\n  \}/g, "\n}")
  .replace(/\n  (@)/g, "\n$1");

const banner = `/* ── Why Businesses Choose TekCroft (SEO Audit) — scoped #audit-why ── */\n`;
const finalCss = banner + css + "\n";

const cssPath = path.join(ROOT, "app", "seo-audit-services.css");
let pageCss = fs.readFileSync(cssPath, "utf8");
const marker = "/* ── Why Businesses Choose TekCroft (SEO Audit) — scoped #audit-why ── */";
const idx = pageCss.indexOf(marker);
if (idx < 0) throw new Error("CSS marker not found");
pageCss = pageCss.slice(0, idx) + finalCss;
fs.writeFileSync(cssPath, pageCss);

fs.writeFileSync(
  path.join(ROOT, "scripts", "_extracted-seo-audit-why", "ported.css"),
  finalCss
);
console.log("fixed css", finalCss.length);
// sanity checks
if (finalCss.includes("#audit-why box-shadow") || finalCss.includes("#audit-why 1.6vw")) {
  throw new Error("still has corrupted property values");
}
if (!finalCss.includes("background:#FFFFFF")) {
  throw new Error("missing white background");
}
if (!finalCss.includes("@media (max-width:1100px)")) {
  throw new Error("missing 1100 breakpoint");
}
console.log("ok");
