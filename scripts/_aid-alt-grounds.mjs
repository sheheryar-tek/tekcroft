import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const bodyPath = path.join(ROOT, "lib", "ai-development-body.html");
const cssPath = path.join(ROOT, "app", "ai-development.css");

const map = {
  proof: "white",
  "services-2": "tint",
  process: "white",
  cmp: "tint",
  guide: "white",
  "guide-v2": "tint",
  "guide-v3": "white",
  "guide-v4": "tint",
  reviews: "white",
  industries: "tint",
  security: "white",
  work: "tint",
  faq: "white",
  contact: "tint",
};

let html = fs.readFileSync(bodyPath, "utf8");
for (const [id, ground] of Object.entries(map)) {
  const re = new RegExp(`<section([^>]*\\bid="${id}"[^>]*)>`);
  html = html.replace(re, (_, attrs) => {
    const a = attrs.replace(/\s*data-ground="[^"]*"/g, "");
    return `<section${a} data-ground="${ground}">`;
  });
}
fs.writeFileSync(bodyPath, html);

for (const id of Object.keys(map)) {
  const m = html.match(new RegExp(`<section[^>]*id="${id}"[^>]*>`));
  console.log(id, m ? m[0] : "MISSING");
}

const lock = `

/* === AI Development alternating grounds (white / tint) === */
#proof[data-ground],
#services-2[data-ground],
#process[data-ground],
#cmp[data-ground],
#guide[data-ground],
#guide-v2[data-ground],
#guide-v3[data-ground],
#guide-v4[data-ground],
#reviews[data-ground],
#industries[data-ground],
#security[data-ground],
#work[data-ground],
#faq[data-ground],
#contact[data-ground]{
  background:var(--ground) !important;
  border-block:0 !important;
}
#proof[data-ground="white"],
#services-2[data-ground="white"],
#process[data-ground="white"],
#cmp[data-ground="white"],
#guide[data-ground="white"],
#guide-v2[data-ground="white"],
#guide-v3[data-ground="white"],
#guide-v4[data-ground="white"],
#reviews[data-ground="white"],
#industries[data-ground="white"],
#security[data-ground="white"],
#work[data-ground="white"],
#faq[data-ground="white"],
#contact[data-ground="white"]{
  --ground:var(--surface) !important;
  --panel:var(--bg-alt) !important;
}
#proof[data-ground="tint"],
#services-2[data-ground="tint"],
#process[data-ground="tint"],
#cmp[data-ground="tint"],
#guide[data-ground="tint"],
#guide-v2[data-ground="tint"],
#guide-v3[data-ground="tint"],
#guide-v4[data-ground="tint"],
#reviews[data-ground="tint"],
#industries[data-ground="tint"],
#security[data-ground="tint"],
#work[data-ground="tint"],
#faq[data-ground="tint"],
#contact[data-ground="tint"]{
  --ground:var(--bg-alt) !important;
  --panel:var(--surface) !important;
}
/* Keep designed photo/scrim bands readable */
#cmp[data-ground]{ --vs-veil:rgba(0,0,0,.75); }
`;

let css = fs.readFileSync(cssPath, "utf8");
if (css.includes("/* === AI Development alternating grounds")) {
  css = css.replace(
    /\/\* === AI Development alternating grounds[\s\S]*$/,
    lock.trim() + "\n"
  );
} else {
  css = css.replace(/\s*$/, "\n" + lock);
}
fs.writeFileSync(cssPath, css);
console.log("CSS lock appended");

// Keep extract GROUNDS in sync for future re-extracts
const extractPath = path.join(ROOT, "scripts", "extract-ai-development.mjs");
let extract = fs.readFileSync(extractPath, "utf8");
const newGrounds = `const GROUNDS = \`
/* Section grounds — white / tint alternation after dark hero */
#proof,
#process,
#guide,
#guide-v3,
#reviews,
#security,
#faq{
  --ground:var(--surface);
  --panel:var(--bg-alt);
}
#services-2,
#cmp,
#guide-v2,
#guide-v4,
#industries,
#work,
#contact{
  --ground:var(--bg-alt);
  --panel:var(--surface);
}

#proof,
#services-2,
#process,
#cmp,
#guide,
#guide-v2,
#guide-v3,
#guide-v4,
#reviews,
#industries,
#security,
#work,
#faq,
#contact{
  background:var(--ground) !important;
  border-block:0 !important;
}
#services-2.svc-cn{ border-block:0; }
#services-2 .cn-plate::before{ display:none !important; }
#services-2 .cn-plate::after{
  background:
    radial-gradient(780px 440px at 50% 48%, rgba(0,0,0,.50) 0%, transparent 72%),
    linear-gradient(180deg, rgba(0,0,0,.72) 0%, rgba(0,0,0,.58) 42%,
                    rgba(0,0,0,.90) 100%) !important;
}
html[data-theme="dark"] #services-2 .cn-plate::after{
  background:
    radial-gradient(780px 440px at 50% 48%, rgba(0,0,0,.55) 0%, transparent 72%),
    linear-gradient(180deg, rgba(0,0,0,.78) 0%, rgba(0,0,0,.62) 42%,
                    rgba(0,0,0,.92) 100%) !important;
}
#services-2 .cn-tab{
  color:rgba(255,255,255,.70) !important;
  background:transparent !important;
  text-shadow:none !important;
}
#services-2 .cn-tab.on{ color:#fff !important; background:transparent !important; }
#services-2 .cn-lift{
  background:var(--primary) !important; backdrop-filter:none !important;
  -webkit-backdrop-filter:none !important;
  box-shadow:0 14px 30px -14px hsl(var(--brand-h) 100% 34% / .75) !important;}
#services-2 .cn-go{
  background:transparent !important; box-shadow:none !important;
  backdrop-filter:none !important; -webkit-backdrop-filter:none !important; opacity:0;}
#services-2 .cn-tab.on .cn-go{
  opacity:1 !important; background:#0a1a29 !important; color:#fff !important;
  backdrop-filter:none !important; -webkit-backdrop-filter:none !important; box-shadow:none !important;}
#services-2 .cn-sheet{ background:#fff !important; }
html[data-theme="dark"] #services-2 .cn-sheet{ background:var(--n875) !important; }
@media (max-width:1040px){
  #services-2 .cn-tab.on{ background:var(--primary) !important; color:#fff !important; }
  #services-2 .cn-go, #services-2 .cn .cn-go{
    opacity:1 !important; background:var(--primary) !important; color:#fff !important;
    transform:none !important; visibility:visible !important;}
  html[data-theme="dark"] #services-2 .cn-go{ background:rgba(255,255,255,.14) !important; }
  #services-2 .cn-tab.on .cn-go{
    opacity:1 !important; background:#fff !important; color:var(--primary) !important;
    transform:none !important;}
  #services-2 .cn-tab:not(.on):hover .cn-go,
  #services-2 .cn-tab:not(.on):focus-visible .cn-go{
    opacity:1 !important; background:var(--primary) !important; transform:none !important;}
  #services-2 .cn-go::before, #services-2 .cn-go::after{
    content:"" !important; position:absolute !important; top:50% !important; left:50% !important;
    background:currentColor !important; border-radius:2px !important;
    transform:translate(-50%,-50%) !important; display:block !important;}
  #services-2 .cn-go::before{width:13px !important; height:2px !important;}
  #services-2 .cn-go::after{width:2px !important; height:13px !important;}
  #services-2 .cn-tab.on .cn-go::after{transform:translate(-50%,-50%) scaleY(0) !important;}
  #services-2 .cn-go svg{display:none !important;}
}
\`;`;

if (extract.includes("const GROUNDS = `")) {
  extract = extract.replace(/const GROUNDS = `[\s\S]*?`;/, newGrounds);
  fs.writeFileSync(extractPath, extract);
  console.log("extract GROUNDS updated");
}
