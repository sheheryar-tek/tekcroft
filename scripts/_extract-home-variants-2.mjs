import fs from "fs";
import path from "path";

const OUT = "c:/Tekcroft/scripts/_extracted-home-variants";
const css = fs.readFileSync(path.join(OUT, "_all.css"), "utf8");
const html = fs.readFileSync("c:/Users/Super/Downloads/tekcroft-home (5).html", "utf8");

/* Extract CSS chunks by comment banners or section markers common in this file */
function extractAround(needle, before = 200, after = 80000) {
  const i = css.indexOf(needle);
  if (i < 0) return null;
  const start = Math.max(0, i - before);
  // find a reasonable end: next big banner or limit
  let end = Math.min(css.length, i + after);
  return { i, chunk: css.slice(start, end) };
}

const needles = [
  "/* ABOUT",
  "WHO WE ARE",
  "#about-v2",
  "#about-v3",
  "#about-v4",
  "#about-v5",
  "#about-v6",
  "#about-v7",
  ".sec.bw",
  ".sec.bt",
  "data-about-variant",
  "/* INDUSTR",
  "#industries",
  ".sec.iw",
  ".sec.ig",
  ".sec.ix",
  ".sec.iy",
  "data-ind-variant",
  "/* NSR",
  "#search-split-v3",
  ".nsr{",
  "data-ai-variant",
  ".vsw-ab",
  ".vsw-ind",
];

for (const n of needles) {
  const i = css.indexOf(n);
  console.log(JSON.stringify(n), i);
  if (i >= 0) {
    const ctx = css.slice(Math.max(0, i - 80), i + 120).replace(/\s+/g, " ");
    console.log("  ", ctx);
  }
}

/* extract vsw HTML by position */
function extractDivAt(idx) {
  // find start of <div
  let start = html.lastIndexOf("<div", idx);
  let depth = 0;
  let i = start;
  while (i < html.length) {
    if (html.startsWith("<div", i)) {
      depth++;
      i = html.indexOf(">", i) + 1;
      continue;
    }
    if (html.startsWith("</div>", i)) {
      depth--;
      i += 6;
      if (depth === 0) return html.slice(start, i);
      continue;
    }
    i++;
  }
  return null;
}

for (const label of ["vsw-ab", "vsw-ind", "vsw vsw-ai", 'aria-label="AI search']) {
  const idx = html.indexOf(label);
  console.log("html", label, idx);
}

const vswAb = extractDivAt(html.indexOf('class="vsw vsw-ab"'));
const vswInd = extractDivAt(html.indexOf('class="vsw vsw-ind"'));
// AI switcher might be class="vsw" without vsw-ai
const vswAiIdx = html.indexOf('aria-label="AI search section design"');
const vswAi = extractDivAt(vswAiIdx);
fs.writeFileSync(path.join(OUT, "vsw-about.html"), vswAb || "");
fs.writeFileSync(path.join(OUT, "vsw-ind.html"), vswInd || "");
fs.writeFileSync(path.join(OUT, "vsw-ai.html"), vswAi || "");
console.log("vsw lengths", vswAb?.length, vswInd?.length, vswAi?.length);

/* Find contiguous CSS ranges for about variants by locating first #about-v2 rule
   through end of about-v7 related rules. Strategy: find all style blocks that
   contain #about-v2 or .vsw-ab and dump those whole blocks. */
const styleBlocks = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)];
let bi = 0;
for (const m of styleBlocks) {
  const body = m[1];
  const hits = [];
  for (const k of [
    "#about-v2",
    "#about-v3",
    "#about-v4",
    "#about-v5",
    "#about-v6",
    "#about-v7",
    ".vsw-ab",
    "#industries",
    "#industries-v2",
    ".vsw-ind",
    "#search-split-v3",
    ".nsr",
    "data-ai-variant",
  ]) {
    if (body.includes(k)) hits.push(k);
  }
  if (hits.length) {
    const name = `style-block-${bi}.css`;
    fs.writeFileSync(path.join(OUT, name), body);
    console.log(name, body.length, hits.join(","));
  }
  bi++;
}
