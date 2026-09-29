import fs from "fs";
import path from "path";

const libDir = "c:/Tekcroft/lib";
const cssDir = "c:/Tekcroft/app";

const bodies = fs
  .readdirSync(libDir)
  .filter((f) => f.endsWith("-body.html") && f !== "homepage-body.html" && f !== "contact-body.html");

let bodyN = 0;
for (const file of bodies) {
  const p = path.join(libDir, file);
  let html = fs.readFileSync(p, "utf8");
  const before = html;

  // Revert field labels: <h3><label ...>...</label></h3> -> <label ...>...</label>
  html = html.replace(/<h3><label(\s+for="[^"]+")>([^<]*)<\/label><\/h3>/g, "<label$1>$2</label>");

  // Form title h2 -> h3 (only direct titles inside hs-form, before hs-rule)
  html = html.replace(
    /(<form class="hs-form"[^>]*>\s*)<h2>([\s\S]*?)<\/h2>/g,
    "$1<h3>$2</h3>"
  );

  if (html !== before) {
    fs.writeFileSync(p, html);
    bodyN++;
    console.log("body", file);
  }
}
console.log("bodies", bodyN);

const cssFiles = fs.readdirSync(cssDir).filter((f) => f.endsWith(".css"));
let cssN = 0;
for (const file of cssFiles) {
  const p = path.join(cssDir, file);
  let css = fs.readFileSync(p, "utf8");
  const before = css;

  // Form title: h2 -> h3, smaller size
  css = css.replace(
    /\.hs-form h2\{margin:0; font-family:var\(--font-display\); font-size:26px;/g,
    `.hs-form > h3{margin:0; font-family:var(--font-display); font-size:clamp(17px,1.5vw,19px) !important;`
  );
  css = css.replace(
    /html\[data-theme="light"\] \.hs-form h2\{color:var\(--text\);\}/g,
    `html[data-theme="light"] .hs-form > h3{color:var(--text);}`
  );

  // Restore simple label rule if we expanded it
  css = css.replace(
    /\.hs-field h3,\.hs-field h3 label,\.hs-field label\{display:block; margin:0; margin-bottom:8px; font-size:13\.5px !important; font-weight:600; line-height:1\.3; letter-spacing:0;/g,
    `.hs-field label{display:block; margin-bottom:8px; font-size:13.5px; font-weight:600;`
  );

  // Focus within back to label only
  css = css.replace(
    /\.hs-field:focus-within h3,\.hs-field:focus-within h3 label,\.hs-field:focus-within label\{color:var\(--primary\);\}/g,
    `.hs-field:focus-within label{color:var(--primary);}`
  );
  css = css.replace(
    /html\[data-theme="light"\] \.hs-field h3,\s*html\[data-theme="light"\] \.hs-field h3 label,\s*html\[data-theme="light"\] \.hs-field label\{color:var\(--text\);\}/g,
    `html[data-theme="light"] .hs-field label{color:var(--text);}`
  );
  css = css.replace(
    /html\[data-theme="light"\] \.hs-field:focus-within h3,\s*html\[data-theme="light"\] \.hs-field:focus-within h3 label,\s*html\[data-theme="light"\] \.hs-field:focus-within label\{color:var\(--brand-text\);\}/g,
    `html[data-theme="light"] .hs-field:focus-within label{color:var(--brand-text);}`
  );

  // Drop old hs-field h3 size lock blocks
  css = css.replace(
    /\n\/\* hs-field h3 label size lock \*\/\n\.hs-field h3,\n\.hs-field h3 label\{[\s\S]*?\}\n/g,
    "\n"
  );

  if (css !== before) {
    fs.writeFileSync(p, css);
    cssN++;
    console.log("css", file);
  }
}
console.log("css", cssN);

// site-consistency: form title small; remove field-label h3 exception
const scPath = path.join(cssDir, "site-consistency.css");
let sc = fs.readFileSync(scPath, "utf8");
sc = sc.replace(
  /\/\* Hero form field titles stay label-sized even when marked up as h3 \*\/\n\.hs-field h3,\n\.hs-field h3 label\{[\s\S]*?\}\n/,
  `/* Hero form title stays compact when marked up as h3 */
.hs-form > h3{
  font-size:clamp(17px,1.5vw,19px) !important;
  font-weight:700 !important;
  line-height:1.22 !important;
  letter-spacing:-0.035em !important;
  margin:0 !important;
  text-transform:none !important;
}
`
);
fs.writeFileSync(scPath, sc);
console.log("updated site-consistency.css");
