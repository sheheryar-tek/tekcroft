import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LIB = path.join(ROOT, "lib");
const APP = path.join(ROOT, "app");

const CSS_SNIP = `
html body .hs-done-title{
  font-size:clamp(17px,1.5vw,19px) !important;
  font-weight:700 !important;
  line-height:1.22 !important;
  letter-spacing:-0.035em !important;
  margin:0 0 8px !important;
  text-transform:none !important;
  color:#fff;
}
html body .hs-done-title b{font-weight:700;}
#faq .faq-aside-lead{
  margin:10px 0 0;
  font-family:var(--font-display);
  font-size:var(--body) !important;
  font-weight:700 !important;
  letter-spacing:-0.02em;
  line-height:1.35 !important;
  color:#fff !important;
  text-transform:none;
}
#faq .faq-aside-lead b{font-weight:700;}
`;

const BASE_TITLE = `
.hs-done-title{margin:0 0 8px; font-family:var(--font-display); font-size:clamp(17px,1.5vw,19px); font-weight:700;
  letter-spacing:-0.03em; color:#fff;}
`;

let htmlChanged = 0;
for (const name of fs.readdirSync(LIB)) {
  if (!name.endsWith("-body.html")) continue;
  const file = path.join(LIB, name);
  let html = fs.readFileSync(file, "utf8");
  const before = html;
  html = html.replace(
    /<h3>(Thanks[\s\S]*?everything we need\.)<\/h3>/g,
    '<p class="hs-done-title"><b>$1</b></p>'
  );
  html = html.replace(
    /<h3>(Ask us the one you came with\.)<\/h3>/g,
    '<p class="faq-aside-lead"><b>$1</b></p>'
  );
  if (html !== before) {
    fs.writeFileSync(file, html);
    htmlChanged++;
    console.log("html", name);
  }
}

const cssMap = [
  "on-page-seo.css",
  "mobile-app-development.css",
  "ai-agent-development.css",
  "technical-seo.css",
  "local-seo.css",
  "franchise-seo.css",
  "google-business-profile-optimization.css",
  "web-design-and-development.css",
  "ai-chatbot-development.css",
  "ai-development.css",
  "ai-seo.css",
];

for (const name of cssMap) {
  const file = path.join(APP, name);
  if (!fs.existsSync(file)) {
    console.log("missing css", name);
    continue;
  }
  let css = fs.readFileSync(file, "utf8");
  if (!css.includes(".hs-done-title{")) {
    css = css.replace(
      ".hs-done h3{",
      ".hs-done h3,.hs-done-title{"
    );
    if (!css.includes(".hs-done-title{")) css += BASE_TITLE;
  }
  if (!css.includes("#faq .faq-aside-lead{")) {
    css += CSS_SNIP;
    console.log("css", name);
  } else {
    console.log("css skip", name);
  }
  fs.writeFileSync(file, css);
}

console.log("html files updated:", htmlChanged);
