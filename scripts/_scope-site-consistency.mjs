/**
 * Scope site-consistency overrides so pages can opt out with:
 *   <html data-design="raw">
 * Tokens in :root stay global. Destructive !important rules skip raw pages.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FILE = path.join(ROOT, "app", "site-consistency.css");
const MARK = "/* === RAW-DESIGN SCOPE (html[data-design=raw] opts out) === */";

let css = fs.readFileSync(FILE, "utf8");

// Idempotent: strip prior scope pass
if (css.includes(MARK)) {
  // Already scoped — re-derive from a clean copy by undoing prefix
  css = css
    .replaceAll("html:not([data-design=\"raw\"]) body", "html body")
    .replaceAll("html:not([data-design=\"raw\"]) ", "")
    .replace(new RegExp(`\\n*${MARK.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\n*`), "\n");
}

const PREFIX = 'html:not([data-design="raw"])';

function scopeSelector(sel) {
  const s = sel.trim();
  if (!s) return s;
  if (s === ":root" || s.startsWith(":root")) return s;
  if (s.startsWith("@")) return s;
  if (s.includes('data-design="raw"')) return s;
  if (s.startsWith("html body")) {
    return s.replace(/^html body/, `${PREFIX} body`);
  }
  if (s.startsWith("html[")) {
    return `${PREFIX} ${s}`;
  }
  if (s.startsWith("html ")) {
    return s.replace(/^html /, `${PREFIX} `);
  }
  return `${PREFIX} ${s}`;
}

function scopeRuleBlock(block) {
  // Don't touch @keyframes / @font-face bodies as selectors wrongly
  return block.replace(/(^|})\s*([^{}@/][^{]*)\{/g, (full, lead, sels) => {
    const trimmed = sels.trim();
    if (!trimmed || trimmed.startsWith("@")) return full;
    const scoped = trimmed
      .split(",")
      .map((part) => scopeSelector(part))
      .join(",\n");
    return `${lead}\n${scoped}{`;
  });
}

// Process outside of @keyframes
const parts = [];
let i = 0;
const keyRe = /@keyframes\s+[^{]+\{[\s\S]*?\n\}/g;
let m;
const keyframes = [];
while ((m = keyRe.exec(css))) {
  keyframes.push({ start: m.index, end: m.index + m[0].length, text: m[0] });
}
if (!keyframes.length) {
  css = scopeRuleBlock(css);
} else {
  let last = 0;
  for (const k of keyframes) {
    parts.push(scopeRuleBlock(css.slice(last, k.start)));
    parts.push(k.text);
    last = k.end;
  }
  parts.push(scopeRuleBlock(css.slice(last)));
  css = parts.join("");
}

css = css.trimEnd() + "\n\n" + MARK + "\n";
fs.writeFileSync(FILE, css);
console.log("scoped", FILE);
