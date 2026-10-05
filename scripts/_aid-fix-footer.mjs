import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cssPath = path.join(ROOT, "app", "ai-development.css");
const bodyPath = path.join(ROOT, "lib", "ai-development-body.html");

let css = fs.readFileSync(cssPath, "utf8");

const startMark = "/* === v4b-styles === */";
const endMark = "/* sit like every other section:";
const start = css.indexOf(startMark);
const end = css.indexOf(endMark);
if (start < 0 || end < 0) throw new Error("v4 block markers not found");

let chunk = css.slice(start, end);

const leaks = [
  ".pill",
  ".hl",
  ".sub",
  ".break",
  ".col",
  ".card",
  ".ic",
  ".after",
  ".steps",
  ".sc",
  ".ic2",
  ".banner",
  ".cta",
  ".btn",
  ".phone",
  ".screen",
  ".notch",
  ".ph-h",
  ".sb",
  ".pbody",
  ".pc",
  ".tiles",
  ".tile",
  ".ok",
  ".tick",
  ".bar",
  ".v4nav",
  ".foot",
  ".bottom",
  ".mini",
  ".mi",
  ".v4wrap",
];

const parts = chunk.split("}");
for (let i = 0; i < parts.length; i++) {
  const part = parts[i];
  const brace = part.lastIndexOf("{");
  if (brace < 0) continue;
  let sel = part.slice(0, brace);
  const body = part.slice(brace);
  if (/@(keyframes|media|supports)/.test(sel)) continue;

  const sels = sel
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const fixed = sels.map((s) => {
    if (s.includes("#guide-v4")) return s;
    if (s.startsWith("@")) return s;
    if (s.startsWith("html")) return s;
    if (/^\d|from|to/.test(s)) return s;

    for (const leak of leaks) {
      if (
        s === leak ||
        s.startsWith(leak + " ") ||
        s.startsWith(leak + ":") ||
        s.startsWith(leak + ".") ||
        s.startsWith(leak + ">")
      ) {
        return "#guide-v4 " + s;
      }
    }
    return s;
  });
  parts[i] = fixed.join(",") + body;
}
chunk = parts.join("}");
css = css.slice(0, start) + chunk + css.slice(end);

// Strip contact from alternating-ground locks
css = css
  .replace(/,\s*#contact\[data-ground\]/g, "")
  .replace(/#contact\[data-ground\],\s*/g, "")
  .replace(/,\s*#contact\[data-ground="white"\]/g, "")
  .replace(/#contact\[data-ground="white"\],\s*/g, "")
  .replace(/,\s*#contact\[data-ground="tint"\]/g, "")
  .replace(/#contact\[data-ground="tint"\],\s*/g, "")
  .replace(/,\s*html\[data-theme="dark"\] #contact\[data-ground="tint"\]/g, "")
  .replace(/html\[data-theme="dark"\] #contact\[data-ground="tint"\],\s*/g, "");

// Remove #contact from GROUNDS background !important list (keep CTA band)
css = css.replace(
  /#work,\s*\n#faq,\s*\n#contact\{\s*\n  background:var\(--ground\) !important;\s*\n  border-block:0 !important;\s*\n\}/,
  `#work,
#faq{
  background:var(--ground) !important;
  border-block:0 !important;
}`
);
css = css.replace(
  /#work,\s*\n#contact\{\s*\n  --ground:var\(--bg-alt\);\s*\n  --panel:var\(--surface\);\s*\n\}/,
  `#work{
  --ground:var(--bg-alt);
  --panel:var(--surface);
}`
);

const footerLock = `

/* === footer restore (site chrome) === */
#contact.cta,
#contact.sec.cta{
  background:var(--bg-alt) !important;
}
#contact.cta > .wrap::before{
  background:var(--cta-shot, var(--shot-2, url("/images/home-cta-v2.webp"))) 58% 45% / cover no-repeat !important;
}
.ftm{
  background:var(--surface) !important;
  border-block:0 !important;
  border-radius:clamp(20px,2.2vw,28px) clamp(20px,2.2vw,28px) 0 0 !important;
  margin-bottom:0 !important;
  position:relative;
  z-index:2;
  box-shadow:0 -16px 40px -22px rgba(var(--ink-rgb),.30);
  padding:clamp(24px,2.8vw,36px) 0;
}
html[data-theme="dark"] .ftm{
  box-shadow:0 -16px 40px -20px rgba(0,0,0,.75);
}
.ft4{
  background:transparent !important;
  padding-top:0 !important;
}
.ft4-plate{
  background:var(--surface) !important;
  border-radius:0 !important;
  border-top:1px solid var(--border-soft) !important;
  padding:clamp(34px,4vw,56px) max(26px, calc(50vw - var(--maxw) / 2 + 26px)) clamp(20px,2.2vw,28px) !important;
}
.ft4-top{
  display:grid !important;
  grid-template-columns:minmax(0,1.45fr) repeat(3,minmax(0,1fr)) !important;
  gap:clamp(26px,3.2vw,48px) !important;
}
.ft4-brand .logo{margin-bottom:16px; --logo:var(--logo-ink);}
.ft4-brand p{font-size:13.8px; line-height:1.65; color:var(--muted); max-width:32ch;}
.ft4-brand .ft-soc{margin-top:20px;}
.ft-soc{display:flex; gap:9px;}
.ft-soc a{
  display:grid; place-items:center;
  width:36px; height:36px; border-radius:10px;
  border:1px solid var(--border);
  color:var(--text-2); background:transparent;
  transition:border-color .18s var(--ease), color .18s var(--ease), background .18s var(--ease);
}
.ft-soc a:hover{border-color:var(--brand-text); color:var(--brand-text); background:var(--brand-soft);}
.ft-soc svg{width:16px; height:16px;}
.ft-col b{
  display:block; font-family:var(--font-display); font-size:13px; font-weight:700;
  letter-spacing:.12em; text-transform:uppercase; color:var(--muted); margin-bottom:10px;
}
.ft-col a{
  display:block; padding:6px 0; font-size:14.2px; color:var(--text-2);
  transition:color .18s var(--ease), transform .18s var(--ease);
}
.ft-col a:hover{color:var(--brand-text); transform:translateX(3px);}
.ft4-contact span,.ft4-contact a{
  display:grid; grid-template-columns:auto 1fr;
  gap:11px; align-items:start; padding:6px 0;
  font-size:14.2px; color:var(--text-2);
}
.ft4-contact svg{width:17px; height:17px; margin-top:2px; color:var(--brand-text);}
.ft4-contact i{font-style:normal; line-height:1.5;}
.ft4-contact a:hover{color:var(--brand-text);}
.ft4-bar{
  display:flex; align-items:center; justify-content:space-between;
  gap:18px; flex-wrap:wrap; margin-top:clamp(28px,3.2vw,44px);
  padding-top:clamp(18px,2vw,24px); border-top:1px solid var(--border);
  font-size:12.8px; color:var(--muted);
}
.ft4-bar span{color:var(--muted);}
.ft4-bar nav{display:flex; gap:clamp(14px,1.8vw,26px); flex-wrap:wrap;}
.ft4-bar a{color:var(--muted); transition:color .18s var(--ease);}
.ft4-bar a:hover{color:var(--brand-text);}
@media (max-width:980px){
  .ft4-top{grid-template-columns:minmax(0,1fr) minmax(0,1fr) !important;}
  .ft4-brand{grid-column:1 / -1;}
}
@media (max-width:620px){
  .ft4-top{grid-template-columns:minmax(0,1fr) !important;}
  .ft4-bar{flex-direction:column; align-items:flex-start;}
}
`;

if (css.includes("/* === footer restore (site chrome) === */")) {
  css = css.replace(
    /\/\* === footer restore \(site chrome\) === \*\/[\s\S]*$/,
    footerLock.trim() + "\n"
  );
} else {
  css = css.replace(/\s*$/, "\n" + footerLock);
}

fs.writeFileSync(cssPath, css);
console.log("CSS fixed");

let html = fs.readFileSync(bodyPath, "utf8");
html = html.replace(
  /<section class="sec cta" id="contact"[^>]*>/,
  '<section class="sec cta" id="contact">'
);
fs.writeFileSync(bodyPath, html);
console.log("contact data-ground removed");
