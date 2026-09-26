import fs from "fs";
import path from "path";

const REF = "c:/Users/Super/Downloads/tekcroft-home (5).html";
const OUT = "c:/Tekcroft/scripts/_extracted-home-variants";
fs.mkdirSync(OUT, { recursive: true });

const html = fs.readFileSync(REF, "utf8");

function sliceBetween(startMarker, endMarker) {
  const start = html.indexOf(startMarker);
  if (start < 0) throw new Error("missing start: " + startMarker);
  const end = html.indexOf(endMarker, start);
  if (end < 0) throw new Error("missing end after " + startMarker);
  return html.slice(start, end);
}

function write(name, content) {
  fs.writeFileSync(path.join(OUT, name), content);
  console.log(name, content.length);
}

/* ---- Who we are: about through about-v7 (ends before blueprint) ---- */
write(
  "about-all.html",
  sliceBetween(
    '<section class="sec bp" id="about" data-about-variant="1">',
    '<section class="sec bl-sec" id="blueprint">'
  )
);

/* ---- Industries: industries through industries-v4 (ends before work) ---- */
write(
  "industries-all.html",
  sliceBetween(
    '<section class="sec iw" id="industries" data-ind-variant="1">',
    '<section class="sec wk" id="work">'
  )
);

/* ---- AI / new search reality: ax through nsr (ends before reviews) ---- */
write(
  "ai-all.html",
  sliceBetween(
    '<section class="sec ax" id="ai-ecosystem" data-ai-variant="1"',
    '<section class="sec revs beam-zone" id="reviews">'
  )
);

/* ---- Variant switcher UI ---- */
const vswMatches = [...html.matchAll(/<div class="vsw[^"]*"[^>]*>[\s\S]*?<\/div>\s*(?=<div class="vsw|<\/body>|<script)/g)];
console.log("vsw blocks found roughly", vswMatches.length);

const vswAb = html.indexOf('class="vsw vsw-ab"');
const vswInd = html.indexOf('class="vsw vsw-ind"');
const vswAi = html.indexOf('aria-label="AI search section design"');
const vswAiAlt = html.indexOf("AI is the new search") 
console.log({ vswAb, vswInd, vswAi });

/* extract each vsw by taking from its opening to next vsw or script */
function extractVsw(label) {
  const re = new RegExp(
    `<div class="vsw[^"]*"[^>]*aria-label="${label}"[\\s\\S]*?<\\/div>\\s*(?=<div class="vsw|<script|$)`
  );
  const m = html.match(re);
  if (!m) {
    // fallback: find by class substring
    const idx = html.indexOf(label);
    console.log("fallback for", label, "at", idx);
    return null;
  }
  return m[0];
}

for (const lab of [
  "Who we are section design",
  "Industries section design",
  "AI search section design",
]) {
  const block = extractVsw(lab);
  if (block) write(`vsw-${lab.slice(0, 12).replace(/\s+/g, "")}.html`, block);
  else console.log("NO VSW", lab);
}

/* Find style CSS for these sections — look for markers in style tags */
const styleBlocks = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]);
console.log("style blocks", styleBlocks.length, "total css chars", styleBlocks.reduce((a, b) => a + b.length, 0));

const markers = [
  [".bw{", "about-v2 bw"],
  [".bt{", "about-v3 bt"],
  [".bpv", "about-v4 bpv"],
  [".stv", "about-v5 stv"],
  [".cvv", "about-v6/7 cvv"],
  [".iw{", "industries iw"],
  [".ig{", "industries ig"],
  [".ix{", "industries ix"],
  [".iy{", "industries iy"],
  [".nsr", "ai nsr"],
  ["vsw-ab", "vsw about"],
  ["vsw-ind", "vsw ind"],
  ["data-about-variant", "about variant css"],
  ["[data-about-variant", "about variant attr"],
  ["[data-ind-variant", "ind variant attr"],
  ["[data-ai-variant", "ai variant attr"],
];

const allCss = styleBlocks.join("\n\n/* ==== next style block ==== */\n\n");
for (const [m, lab] of markers) {
  console.log(lab, allCss.includes(m) ? "YES" : "NO", "first idx", allCss.indexOf(m));
}

/* dump scripts that mention about variant */
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map((m, i) => ({ i, body: m[1] }));
for (const s of scripts) {
  if (
    /about-variant|ind-variant|ai-variant|vsw-ab|vsw-ind|data-about|WHO WE ARE|industries-v/i.test(
      s.body
    )
  ) {
    write(`script-${s.i}.js`, s.body);
  }
}

fs.writeFileSync(path.join(OUT, "_all.css"), allCss);
console.log("wrote _all.css", allCss.length);
