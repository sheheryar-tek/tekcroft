import fs from "fs";

const bodyPath = "c:/Tekcroft/lib/local-seo-body.html";
const cssPath = "c:/Tekcroft/app/local-seo.css";
const jsPath = "c:/Tekcroft/public/tekcroft-local-seo.js";

let section = fs.readFileSync("c:/Tekcroft/scripts/_ls-section-extract.html", "utf8");
const styleFiles = [
  "ls-styles",
  "ls-real",
  "ls-balance",
  "ls-balance2",
  "ls-balance3",
  "ls-balance4",
];
let cssParts = styleFiles.map((id) =>
  fs.readFileSync(`c:/Tekcroft/scripts/_${id}.css`, "utf8")
);
let script = fs.readFileSync("c:/Tekcroft/scripts/_ls-script.js", "utf8");

// Rename .sc / class="sc" to .ls-sc to avoid clash with homepage .sc in tekcroft.css
function renameSc(s) {
  return s
    .replace(/class="sc"/g, 'class="ls-sc"')
    .replace(/class="sc /g, 'class="ls-sc ')
    .replace(/\.sc-/g, ".ls-sc-")
    .replace(/\.sc\{/g, ".ls-sc{")
    .replace(/\.sc,/g, ".ls-sc,")
    .replace(/ \.sc /g, " .ls-sc ")
    .replace(/ \.sc\{/g, " .ls-sc{")
    .replace(/#what-local \.sc\{/g, "#what-local .ls-sc{")
    .replace(/#what-local \.sc-/g, "#what-local .ls-sc-")
    .replace(/\.sc\b/g, ".ls-sc");
}

section = renameSc(section);
cssParts = cssParts.map(renameSc);
// Fix double-prefix if any: .ls-ls-sc
cssParts = cssParts.map((c) => c.replace(/\.ls-ls-sc/g, ".ls-sc"));
section = section.replace(/ls-ls-sc/g, "ls-sc");

const newCss =
  `/* === lo-styles === */\n` +
  `/* Asset URLs used by later sections (reviews figure, etc.) */\n` +
  `:root{\n` +
  `  --lg-goog:url("/images/local-lg-goog-62b427da29.webp");\n` +
  `  --lg-fb:url("/images/local-lg-fb-555ff75e84.webp");\n` +
  `  --lg-yelp:url("/images/local-lg-yelp-689b72e69b.webp");\n` +
  `  --lg-gmap:url("/images/local-lg-gmap-a6038540a8.webp");\n` +
  `  --lg-gmsq:url("/images/local-lg-gmsq-c80e2ac5c8.webp");\n` +
  `  --lo-shop:url("/images/local-lo-shop-c9565b3e71.webp");\n` +
  `  --lo-mini:url("/images/local-lo-mini-18de7756d5.webp");\n` +
  `  --lo-faces:url("/images/local-lo-faces-e992132696.webp");\n` +
  `  --lo-gpt:url("/images/local-lo-gpt-a987fa0e81.webp");\n` +
  `  --lo-gem:url("/images/local-lo-gem-630c82147f.webp");\n` +
  `  --lo-map:url("/images/local-lo-map-55f8a9382a.webp"); }\n\n` +
  `#what-local{ --ground:var(--bg-alt); --panel:var(--surface); }\n\n` +
  cssParts
    .map(
      (c, i) =>
        `/* === ${styleFiles[i]} === */\n` + c.trim() + "\n"
    )
    .join("\n");

// Replace body section
let body = fs.readFileSync(bodyPath, "utf8");
const start = body.indexOf('<section class="sec lo');
const everything = body.indexOf("EVERYTHING WE DO TO GET YOU RANKED");
const end = everything > 0 ? body.lastIndexOf("<!--", everything) : -1;
if (start < 0 || end < 0) {
  console.error("markers", start, end, everything);
  process.exit(1);
}
body = body.slice(0, start) + section.trim() + "\n\n" + body.slice(end);
fs.writeFileSync(bodyPath, body);
console.log("Updated body");

// Replace CSS lo-styles block through before eg-styles
let css = fs.readFileSync(cssPath, "utf8");
const cssStart = css.indexOf("/* === lo-styles === */");
const cssEnd = css.indexOf("/* === eg-styles === */");
if (cssStart < 0 || cssEnd < 0) {
  console.error("css markers", cssStart, cssEnd);
  process.exit(1);
}
css = css.slice(0, cssStart) + newCss + "\n" + css.slice(cssEnd);

// Retarget ground maps #what -> #what-local
css = css.replace(/#what(?!-)/g, "#what-local");
fs.writeFileSync(cssPath, css);
console.log("Updated css");

// Append script if missing
let js = fs.readFileSync(jsPath, "utf8");
if (!js.includes("/* === ls-script === */")) {
  js += "\n\n/* === ls-script === */\n" + script.trim() + "\n";
  fs.writeFileSync(jsPath, js);
  console.log("Updated js");
} else {
  console.log("js already has ls-script");
}
