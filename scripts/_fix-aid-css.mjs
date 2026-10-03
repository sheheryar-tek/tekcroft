import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cssPath = path.join(ROOT, "app", "ai-development.css");
let css = fs.readFileSync(cssPath, "utf8");
const before = css.length;

// 1) Broken #stack → #cmp comment tails
css = css.replace(/#stack,\s*[^;{]*?\*\//g, "");
css = css.replace(/#stack\s+\.vs-table,\s*[^;{]*?\*\//g, "");
css = css.replace(
  /#stack(?:\s+[.#a-z0-9\s,>-]+)?,\s+[a-z][\s\S]*?\*\//gi,
  ""
);

// 2) Un-scope @keyframes that were incorrectly prefixed with #guide-v4
css = css.replace(/#guide-v4\s+@keyframes\b/g, "@keyframes");
// Keyframe selectors wrongly written as `#guide-v4 to{` / `#guide-v4 70%{`
css = css.replace(/#guide-v4\s+(?=from\b|to\b|[\d.]+%)/g, "");
// Orphan `#guide-v4 }` closers left inside keyframes
css = css.replace(/#guide-v4\s*\}/g, "}");
css = css.replace(/ease-v4in-out/g, "ease-in-out");

// 3) Deduplicate v4b-styles, keep trailing styles
const markers = [
  ...css.matchAll(/\/\* === (v4b-styles(?:-\d+)?|cta-nda-fix|sc3-styles) === \*\//g),
].map((x) => ({ name: x[1], index: x.index }));
const v4Starts = markers.filter((x) => x.name.startsWith("v4b-styles"));
const afterV4 = markers.find(
  (x) => x.name === "cta-nda-fix" || x.name === "sc3-styles"
);
if (v4Starts.length > 1) {
  const firstStart = v4Starts[0].index;
  const keepEnd = v4Starts[1].index;
  const firstBlock = css
    .slice(firstStart, keepEnd)
    .replace(/\/\* === v4b-styles(?:-\d+)? === \*\//, "/* === v4b-styles === */");
  const head = css.slice(0, firstStart);
  let cleanTail = afterV4 ? css.slice(afterV4.index) : css.slice(keepEnd);
  while (/^\/\* === v4b-styles/.test(cleanTail.trimStart())) {
    const next = cleanTail.search(/\n\/\* === (?!v4b-styles)/);
    if (next < 0) {
      cleanTail = "";
      break;
    }
    cleanTail = cleanTail.slice(next + 1);
  }
  css = head + firstBlock + cleanTail;
  console.log("deduped v4b:", v4Starts.length, "→ 1");
}

if (!css.includes("/* === cmp-stack-alias === */")) {
  css += `

/* === cmp-stack-alias === */
#cmp .vs-halo{display:none !important;}
#cmp .vs-stage{min-width:0 !important;}
`;
}

css = css.replace(/\n{3,}/g, "\n\n");
fs.writeFileSync(cssPath, css);
console.log("bytes", before, "→", css.length);

const bad = [
  ...css.matchAll(/#guide-v4\s+@keyframes/g),
  ...css.matchAll(/#guide-v4\s+(from|to|[\d.]+%)/g),
  ...css.matchAll(/#guide-v4\s*\}/g),
  ...css.matchAll(/#stack\s+\.vs-table,\s+[a-z]/g),
];
console.log("remaining issues", bad.length);
bad.slice(0, 8).forEach((m) => console.log(" ", m[0]));
console.log(
  "sc3",
  css.includes("sc3-styles"),
  "grounds",
  css.includes("Section grounds")
);
