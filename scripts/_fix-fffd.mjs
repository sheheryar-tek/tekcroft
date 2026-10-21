/**
 * Replace U+FFFD (replacement char) with the correct punctuation by context.
 * Does not delete characters. Leaves truly ambiguous spots untouched and reports them.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FFFD = "\uFFFD";
const EM = "\u2014"; // —
const EN = "\u2013"; // –
const ELL = "\u2026"; // …

const FILES = [
  "lib/ai-seo-body.html",
  "lib/custom-software-development-body.html",
  "lib/franchise-seo-body.html",
  "lib/local-seo-body.html",
  "lib/on-page-seo-body.html",
  "lib/technical-seo-body.html",
  "lib/web-design-and-development-body.html",
];

function classify(before, after) {
  const b = before.slice(-1);
  const a = after[0] || "";

  // Contraction / possessive: letter + FFFD + letter → '
  if (/[A-Za-z]/.test(b) && /[A-Za-z]/.test(a)) return "'";

  // Number or time range: digit + FFFD + digit → en dash
  if (/\d/.test(b) && /\d/.test(a)) return EN;

  // Truncated AI Overview sentence end: </b>FFFD</p> → …
  if (before.endsWith("</b>") && after.startsWith("</p>")) return ELL;

  // Truncated mock answer: forFFFD</p> → …
  if (before.endsWith("for") && after.startsWith("</p>")) return ELL;

  // Maps-style rating separator: "4.9 " FFFD " Open" → &middot; (matches same file)
  if (/\d\.\d $/.test(before) && /^\s*Open/.test(after)) return "&middot;";

  // Cite breadcrumb: "yoursite.com " FFFD " on-page…" → &middot;
  if (before.endsWith(".com ") && /^\s*on-/.test(after)) return "&middot;";

  // Word/space separator (comments, clause breaks): space + FFFD + space/letter → em dash
  if (b === " " && (a === " " || /[A-Za-z]/.test(a))) return EM;

  return null;
}

const ambiguous = [];
const changes = [];

for (const rel of FILES) {
  const fp = path.join(ROOT, rel);
  const s = fs.readFileSync(fp, "utf8");
  let out = "";
  let n = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] !== FFFD) {
      out += s[i];
      continue;
    }
    const before = s.slice(Math.max(0, i - 60), i);
    const after = s.slice(i + 1, i + 61);
    const line = s.slice(0, i).split(/\r?\n/).length;
    const rep = classify(before, after);
    if (!rep) {
      ambiguous.push({
        file: rel,
        line,
        before: before.slice(-40),
        after: after.slice(0, 40),
      });
      out += FFFD;
    } else {
      out += rep;
      n++;
      const label =
        rep === EM ? "EM" : rep === EN ? "EN" : rep === ELL ? "ELL" : rep;
      changes.push({
        file: rel,
        line,
        label,
        snip: before.slice(-28) + "[" + label + "]" + after.slice(0, 28),
      });
    }
  }
  if (n) fs.writeFileSync(fp, out, "utf8");
  console.log(rel, "fixed", n);
}

console.log("\nCHANGES:");
for (const c of changes) {
  console.log(`${c.file}:${c.line} → ${c.label} | ${JSON.stringify(c.snip)}`);
}
console.log("\nAMBIGUOUS:", JSON.stringify(ambiguous, null, 2));
