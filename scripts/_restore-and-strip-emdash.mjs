import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const lib = path.join(root, "lib");

// 1) Restore AI SEO body from .next-derived extract (image wiring)
const extracted = fs.readFileSync(
  path.join(root, "scripts", "_extracted-aiseo-body.html"),
  "utf8"
);
const bom = "\uFEFF";
fs.writeFileSync(path.join(lib, "ai-seo-body.html"), bom + extracted);
console.log("restored lib/ai-seo-body.html", extracted.length, "chars");

// 2) Strip em dashes from content only — never touch comments, never collapse whitespace
const files = fs
  .readdirSync(lib)
  .filter((f) => f.endsWith("-body.html") || f === "homepage-body.html");

function splitComments(html) {
  const parts = [];
  const re = /<!--[\s\S]*?-->/g;
  let last = 0;
  let m;
  while ((m = re.exec(html))) {
    if (m.index > last) parts.push({ t: "c", s: html.slice(last, m.index) });
    parts.push({ t: "x", s: m[0] });
    last = m.index + m[0].length;
  }
  if (last < html.length) parts.push({ t: "c", s: html.slice(last) });
  return parts;
}

function cleanContent(s) {
  let out = s;
  out = out.replace(/&mdash;/g, ",");
  out = out.replace(/&#8212;/g, ",");
  out = out.replace(/&#x2014;/gi, ",");
  out = out.replace(/\u2014/g, ",");
  // "word ," -> "word,"  (spaces only, not tabs/newlines)
  out = out.replace(/ +,/g, ",");
  // ",word" -> ", word"
  out = out.replace(/,([A-Za-z])/g, ", $1");
  return out;
}

const dashRe = /&mdash;|&#8212;|&#x2014;|\u2014/gi;

let totalRemoved = 0;
for (const f of files) {
  const p = path.join(lib, f);
  const raw = fs.readFileSync(p, "utf8");
  const before = (raw.match(dashRe) || []).length;
  if (!before) {
    console.log(`${f}: skip (0)`);
    continue;
  }
  const next = splitComments(raw)
    .map((part) => (part.t === "c" ? cleanContent(part.s) : part.s))
    .join("");
  const afterAll = (next.match(dashRe) || []).length;
  const contentRemain = (
    splitComments(next)
      .filter((x) => x.t === "c")
      .map((x) => x.s)
      .join("")
      .match(dashRe) || []
  ).length;
  // Only write if content changed
  if (next !== raw) {
    fs.writeFileSync(p, next);
  }
  const removed = before - afterAll;
  totalRemoved += removed;
  console.log(
    `${f}: before=${before} after=${afterAll} contentRemain=${contentRemain} removed=${removed}`
  );
}
console.log("done removedApprox", totalRemoved);

// sanity: ai-seo still has images + indent intact
const check = fs.readFileSync(path.join(lib, "ai-seo-body.html"), "utf8");
const must = [
  "aiseo-hero-m-4e5a2e9f78",
  "aiseo-tm-01-b8d0910eb7",
  "aiseo-proc-discovery-3069d27fb7",
  "aiseo-faq-33fc3b8544",
];
for (const m of must) {
  if (!check.includes(m)) console.error("MISSING", m);
}
const indentOk = check.includes("\n        <div class=\"tm-item");
console.log("indentOk", indentOk);
console.log(
  "content emdashes left",
  (
    splitComments(check)
      .filter((x) => x.t === "c")
      .map((x) => x.s)
      .join("")
      .match(dashRe) || []
  ).length
);
