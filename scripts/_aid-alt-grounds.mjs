import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BODY = path.join(ROOT, "lib", "ai-development-body.html");
const CSS = path.join(ROOT, "app", "ai-development.css");

let html = fs.readFileSync(BODY, "utf8");

const reps = [
  [
    /<section class="sec st" id="proof-v2">/,
    '<section class="sec st" id="proof-v2" data-ground="white">',
  ],
  [
    /<section class="sec tm" id="services-2">/,
    '<section class="sec tm" id="services-2" data-ground="tint">',
  ],
  [
    /<section class="sec eg-sec" id="process">/,
    '<section class="sec eg-sec" id="process" data-ground="white">',
  ],
  [
    /<section class="sec vs" id="cmp">/,
    '<section class="sec vs" id="cmp" data-ground="tint">',
  ],
  [
    /<section class="sec sy" id="guide">/,
    '<section class="sec sy" id="guide" data-ground="white">',
  ],
  [
    /<section class="sec v2b" id="guide-v2">/,
    '<section class="sec v2b" id="guide-v2" data-ground="tint">',
  ],
  [
    /<section class="sec v3b" id="guide-v3">/,
    '<section class="sec v3b" id="guide-v3" data-ground="white">',
  ],
  [
    /<section class="v4b" id="guide-v4">/,
    '<section class="sec v4b" id="guide-v4" data-ground="tint">',
  ],
  [
    /<section class="sec revs beam-zone" id="reviews">/,
    '<section class="sec revs beam-zone" id="reviews" data-ground="white">',
  ],
  [
    /<section class="sec pf" id="industries">/,
    '<section class="sec pf" id="industries" data-ground="tint">',
  ],
  [
    /<section class="sec sc3" id="security">/,
    '<section class="sec sc3" id="security" data-ground="white">',
  ],
  [
    /<section class="sec wk" id="work">/,
    '<section class="sec wk" id="work" data-ground="tint">',
  ],
  [
    /<section class="sec faq" id="faq">/,
    '<section class="sec faq" id="faq" data-ground="white">',
  ],
];

for (const [re, to] of reps) {
  if (!re.test(html)) throw new Error("MISS " + re);
  html = html.replace(re, to);
}
fs.writeFileSync(BODY, html);
console.log("html grounds set");

const marker = "/* AID page: locked white / tint section alternation */";
const cssBlock = `
${marker}
/* After the dark hero: white → tint → white → tint … through FAQ.
   Contact keeps its photo CTA. Beats earlier per-section background locks. */
#proof-v2[data-ground="white"],
#process[data-ground="white"],
#guide[data-ground="white"],
#guide-v3[data-ground="white"],
#reviews[data-ground="white"],
#security[data-ground="white"],
#faq[data-ground="white"]{
  --ground:var(--surface) !important;
  --panel:var(--bg-alt) !important;
  background:var(--surface) !important;
}
#services-2[data-ground="tint"],
#services-2.tm[data-ground="tint"],
#cmp[data-ground="tint"],
#guide-v2[data-ground="tint"],
#guide-v4[data-ground="tint"],
#industries[data-ground="tint"],
#work[data-ground="tint"]{
  --ground:var(--bg-alt) !important;
  --panel:var(--surface) !important;
  background:var(--bg-alt) !important;
}
html[data-theme="dark"] #proof-v2[data-ground="white"],
html[data-theme="dark"] #process[data-ground="white"],
html[data-theme="dark"] #guide[data-ground="white"],
html[data-theme="dark"] #guide-v3[data-ground="white"],
html[data-theme="dark"] #reviews[data-ground="white"],
html[data-theme="dark"] #security[data-ground="white"],
html[data-theme="dark"] #faq[data-ground="white"]{
  --ground:var(--surface) !important;
  background:var(--surface) !important;
}
html[data-theme="dark"] #services-2[data-ground="tint"],
html[data-theme="dark"] #services-2.tm[data-ground="tint"],
html[data-theme="dark"] #cmp[data-ground="tint"],
html[data-theme="dark"] #guide-v2[data-ground="tint"],
html[data-theme="dark"] #guide-v4[data-ground="tint"],
html[data-theme="dark"] #industries[data-ground="tint"],
html[data-theme="dark"] #work[data-ground="tint"]{
  --ground:var(--bg-alt) !important;
  background:var(--bg-alt) !important;
}
/* Soften old hard-coded section fills so the lock above wins cleanly */
#guide.sy[data-ground="white"],
#guide-v3[data-ground="white"],
#guide-v4[data-ground="tint"],
#security.sc3[data-ground="white"]{
  background:var(--ground) !important;
}
`;

let css = fs.readFileSync(CSS, "utf8");
if (css.includes(marker)) {
  css = css.replace(
    /\/\* AID page: locked white \/ tint section alternation \*\/[\s\S]*$/,
    cssBlock.trim() + "\n"
  );
} else {
  css = css.trimEnd() + "\n\n" + cssBlock.trim() + "\n";
}
fs.writeFileSync(CSS, css);
console.log("css lock appended");
console.log("done");
