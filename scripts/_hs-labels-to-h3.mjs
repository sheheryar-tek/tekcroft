import fs from "fs";
import path from "path";

const libDir = "c:/Tekcroft/lib";
const cssDir = "c:/Tekcroft/app";

const bodies = fs
  .readdirSync(libDir)
  .filter((f) => f.endsWith("-body.html") && f !== "homepage-body.html" && f !== "contact-body.html");

let bodyCount = 0;
for (const file of bodies) {
  const p = path.join(libDir, file);
  let html = fs.readFileSync(p, "utf8");
  const before = html;

  // Wrap hs-field labels in h3 (skip if already wrapped)
  html = html.replace(
    /(<div class="hs-field">\s*)(?!<h3>)<label(\s+for="[^"]+")>([^<]*)<\/label>/g,
    '$1<h3><label$2>$3</label></h3>'
  );

  if (html !== before) {
    fs.writeFileSync(p, html);
    bodyCount++;
    console.log("body", file);
  }
}
console.log("updated bodies:", bodyCount);

const cssFiles = fs
  .readdirSync(cssDir)
  .filter((f) => f.endsWith(".css") && f !== "site-consistency.css" && f !== "globals.css");

let cssCount = 0;
for (const file of cssFiles) {
  const p = path.join(cssDir, file);
  let css = fs.readFileSync(p, "utf8");
  const before = css;

  // Extend label rules to include hs-field h3
  css = css.replace(
    /\.hs-field label\{display:block; margin-bottom:8px; font-size:13\.5px; font-weight:600;/g,
    `.hs-field h3,.hs-field h3 label,.hs-field label{display:block; margin:0; margin-bottom:8px; font-size:13.5px !important; font-weight:600; line-height:1.3; letter-spacing:0;`
  );

  // Light theme label color
  css = css.replace(
    /html\[data-theme="light"\] \.hs-field label\{color:var\(--text\);\}/g,
    `html[data-theme="light"] .hs-field h3,
html[data-theme="light"] .hs-field h3 label,
html[data-theme="light"] .hs-field label{color:var(--text);}`
  );

  // If we already patched once, avoid double-patching font-size line breaks weirdly
  if (css.includes(".hs-field h3,.hs-field h3 label,.hs-field label{display:block") &&
      !css.includes(".hs-field h3{margin:0") &&
      css !== before) {
    // ok
  }

  // Append lock override once near end of consistency block if present
  if (!css.includes("/* hs-field h3 label size lock */") && css.includes(".hs-field")) {
    css += `

/* hs-field h3 label size lock */
.hs-field h3,
.hs-field h3 label{
  font-size:13.5px !important;
  font-weight:600 !important;
  line-height:1.3 !important;
  letter-spacing:0 !important;
  margin:0 0 8px !important;
  text-transform:none !important;
}
`;
  }

  if (css !== before) {
    fs.writeFileSync(p, css);
    cssCount++;
    console.log("css", file);
  }
}
console.log("updated css:", cssCount);
