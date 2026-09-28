/**
 * Switch homepage Industries to the card-grid board design (ref image 1).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const ITEMS = [
  ["Healthcare", '<path d="M12 20s-7-4.6-7-9.4A4 4 0 0 1 12 8a4 4 0 0 1 7-1.4c0 4.8-7 13.4-7 13.4z"/>'],
  ["Home Services", '<path d="M3 11 12 4l9 7"/><path d="M6 10v10h12V10"/><path d="M10 20v-5h4v5"/>'],
  ["Cleaning Services", '<path d="M9 8h6v12H9z"/><path d="M11 8V5h4"/><path d="M18 6h.01M20 9h.01M18 12h.01"/>'],
  ["SaaS", '<path d="M7 18h9a4 4 0 0 0 .6-8A6 6 0 0 0 5 11a3.5 3.5 0 0 0 2 7z"/>'],
  ["E-commerce", '<circle cx="9" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/><path d="M3 4h2l2.4 11h10l2-7H6"/>'],
  ["Construction", '<path d="M4 20h16"/><path d="M6 20V6l12 3"/><path d="M12 9v5"/><path d="M9 14h6v6H9z"/>'],
  ["Contractors", '<path d="M14.6 6.4a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.7-3.7a6 6 0 0 1-7.9 7.9L6.7 20.3a2.1 2.1 0 0 1-3-3l6.7-6.7a6 6 0 0 1 7.9-7.9z"/>'],
  ["Trade Services", '<path d="M4 20 14 10"/><path d="M15 4.5 19.5 9 16 12.5 11.5 8z"/><path d="M4 20h3v-3"/>'],
  ["Joinery", '<path d="M3 15h13l5-5"/><path d="M3 15v4h13v-4"/><path d="M6 15v-3l2 1.5L10 12v3"/>'],
  ["Professional Services", '<rect x="3" y="7" width="18" height="13" rx="2.5"/><path d="M9 7V5h6v2"/><path d="M3 12h18"/>'],
  ["Interior Design / Interiors", '<path d="M4 12V9a2 2 0 0 1 4 0v3M16 12V9a2 2 0 0 1 4 0v3"/><path d="M4 12h16v5H4z"/><path d="M6 17v2M18 17v2"/>'],
  ["Marketing Agencies", '<path d="M4 10v4h4l6 4V6l-6 4z"/><path d="M18 9a4 4 0 0 1 0 6"/>'],
  ["Technology / Software", '<rect x="7" y="7" width="10" height="10" rx="2"/><path d="M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4"/>'],
  ["CRM / Business Software", '<circle cx="9" cy="9" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><path d="M16 6.5a3 3 0 0 1 0 5.6M17 19a5.5 5.5 0 0 0-2-4.3"/>'],
  ["Analytics", '<path d="M4 20V4M4 20h16"/><path d="M8 16v-4M12 16V8M16 16v-6"/>'],
  ["Local Service Businesses", '<path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/>'],
  ["Franchise / Multi-location Businesses", '<circle cx="12" cy="5" r="2.4"/><circle cx="5" cy="19" r="2.4"/><circle cx="19" cy="19" r="2.4"/><path d="M12 7.4 6.6 16.8M12 7.4l5.4 9.4M7.4 19h9.2"/>'],
  ["B2B Businesses", '<rect x="3" y="8" width="8" height="12" rx="1.6"/><rect x="13" y="4" width="8" height="16" rx="1.6"/><path d="M6 12h2M6 16h2M16 8h2M16 12h2M16 16h2"/>'],
  ["Startups", '<path d="M12 3c3.5 2 5.5 5.5 5.5 9L12 18l-5.5-6c0-3.5 2-7 5.5-9z"/><circle cx="12" cy="10" r="2"/><path d="M9 18l-2 3M15 18l2 3"/>'],
];

function card([label, paths], i) {
  const on = i === 0 ? " on" : "";
  return `        <button class="ig-card${on}" type="button" data-k="${i}">
          <span class="ig-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths}</svg></span>
          <b>${label}</b>
        </button>`;
}

const section = `<!-- ============================================================ INDUSTRIES -->
<section class="sec ig" id="industries">
  <div class="wrap">

    <div class="sec-head mid rv">
      <span class="smark"><b>Industries</b></span>
      <h2>Nineteen industries, <em>one blueprint</em></h2>
      <p class="sec-lede">Tailored digital marketing strategies for every industry we serve. Different industries, different challenges, one growth-focused approach.</p>
    </div>

    <div class="ig-board rv" style="--d:100ms" data-ix>
      <div class="ig-grid">
${ITEMS.map(card).join("\n")}
      </div>
    </div>

    <div class="ig-foot rv" style="--d:140ms">
      <span class="ig-foot-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="13" r="7.5"/><circle cx="11" cy="13" r="3.4"/><path d="m13.8 10.2 6-6M17.4 4.6h2.4V7"/></svg></span>
      <p>From strategy to execution, we help businesses in every industry grow smarter, rank higher, and convert better.</p>
      <div class="ig-cta">
        <b>Ready to Grow Your Business?</b>
        <a class="btn btn-primary" href="#contact">Book a Free Strategy Call <span class="arw">&uarr;</span></a>
      </div>
    </div>

  </div>
</section>
`;

const bodyPath = path.join(ROOT, "lib", "homepage-body.html");
let body = fs.readFileSync(bodyPath, "utf8");
const start = body.indexOf("<!-- ============================================================ INDUSTRIES -->");
const end = body.indexOf('<section class="sec wk" id="work">');
if (start < 0 || end < 0) {
  console.error("markers not found");
  process.exit(1);
}
body = body.slice(0, start) + section + "\n" + body.slice(end);
fs.writeFileSync(bodyPath, body);
console.log("Updated homepage-body.html");

/* CSS: restyle #industries as card grid board */
const cssPath = path.join(ROOT, "app", "tekcroft.css");
let css = fs.readFileSync(cssPath, "utf8");

const marker = "/* === homepage industries card-grid board === */";
if (css.includes(marker)) {
  const i = css.indexOf(marker);
  const j = css.indexOf("/* === end homepage industries card-grid board === */", i);
  if (j > i) css = css.slice(0, i) + css.slice(j + "/* === end homepage industries card-grid board === */".length);
}

const block = `
${marker}
#industries.ig{padding-block:clamp(36px,4vw,60px); background:var(--surface);}
#industries.ig .sec-head{margin-bottom:clamp(20px,2.4vw,30px);}
#industries.ig h2{margin:0; font-size:clamp(26px,2.7vw,38px); line-height:1.08;
  letter-spacing:-.04em; text-transform:none;}
#industries.ig h2 em{font-style:normal; color:var(--brand-text);}
#industries.ig .sec-lede{margin:14px auto 0; max-width:52ch;}

#industries .ig-board{position:relative; overflow:hidden; padding:clamp(16px,1.8vw,26px);
  border-radius:24px; background:var(--bg-alt); border:1px solid hsl(var(--brand-h) 70% 86%);}
#industries .ig-board::before{content:""; position:absolute; inset:0; pointer-events:none;
  background-image:radial-gradient(hsl(var(--brand-h) 70% 62% / .18) 1.2px, transparent 1.3px);
  background-size:18px 18px;}

#industries .ig-grid{position:relative; z-index:1; display:grid;
  grid-template-columns:repeat(5,minmax(0,1fr)); gap:clamp(10px,1.1vw,14px);}
#industries .ig-card{display:flex; flex-direction:column; align-items:center; justify-content:center;
  gap:12px; min-height:clamp(112px,12vw,132px); padding:clamp(16px,1.6vw,22px) 12px;
  border:0; border-radius:18px; background:#fff; box-shadow:0 14px 30px -26px hsl(var(--brand-h) 90% 25% / .85);
  font:inherit; cursor:default; text-align:center;
  transition:background .3s var(--ease), color .3s var(--ease), transform .3s var(--pop),
             box-shadow .3s var(--ease);}
html[data-theme="dark"] #industries .ig-card{background:var(--surface); border:1px solid var(--border);}
#industries .ig-card b{font-family:var(--font-display); font-size:clamp(12.4px,1.05vw,14px);
  font-weight:700; letter-spacing:-.02em; line-height:1.25; color:var(--text);}
#industries .ig-ic{display:grid; place-items:center; width:clamp(40px,3.6vw,48px); height:clamp(40px,3.6vw,48px);
  border-radius:50%; background:hsl(var(--brand-h) 85% 95%); color:var(--brand-text);
  border:1px solid hsl(var(--brand-h) 70% 86%);
  transition:background .3s var(--ease), color .3s var(--ease), border-color .3s var(--ease);}
html[data-theme="dark"] #industries .ig-ic{background:hsl(var(--brand-h) 40% 18%); border-color:var(--border);}
#industries .ig-ic svg{width:48%; height:48%;}

#industries .ig-card.on,
#industries .ig-card:hover{
  background:var(--primary); color:#fff; transform:translateY(-3px);
  box-shadow:0 22px 36px -22px hsl(var(--brand-h) 100% 34% / .7);}
#industries .ig-card.on b,
#industries .ig-card:hover b{color:#fff;}
#industries .ig-card.on .ig-ic,
#industries .ig-card:hover .ig-ic{
  background:rgba(255,255,255,.22); color:#fff; border-color:rgba(255,255,255,.35);}

#industries .ig-foot{display:grid; grid-template-columns:auto minmax(0,1fr) auto; align-items:center;
  gap:clamp(14px,2vw,28px); margin-top:clamp(18px,2.2vw,28px); padding:clamp(16px,1.8vw,24px);
  border-radius:20px; background:var(--bg-alt); border:1px solid var(--border);}
#industries .ig-foot-ic{display:grid; place-items:center; width:clamp(44px,4vw,56px); height:clamp(44px,4vw,56px);
  border-radius:50%; background:var(--primary); color:#fff;}
#industries .ig-foot-ic svg{width:48%; height:48%;}
#industries .ig-foot p{margin:0; font-size:clamp(13.2px,1.05vw,14.6px); line-height:1.6; color:var(--text-2); max-width:56ch;}
#industries .ig-cta{display:flex; flex-direction:column; align-items:flex-start; gap:10px;
  padding-left:clamp(14px,2vw,28px); border-left:1px solid var(--border);}
#industries .ig-cta b{font-family:var(--font-display); font-size:clamp(14.4px,1.25vw,16.4px);
  font-weight:800; letter-spacing:-.02em; color:var(--text); white-space:nowrap;}

@media (max-width:1100px){
  #industries .ig-grid{grid-template-columns:repeat(4,minmax(0,1fr));}
}
@media (max-width:860px){
  #industries .ig-grid{grid-template-columns:repeat(3,minmax(0,1fr));}
  #industries .ig-foot{grid-template-columns:auto minmax(0,1fr);}
  #industries .ig-cta{grid-column:1 / -1; padding-left:0; border-left:0; padding-top:14px;
    border-top:1px solid var(--border);}
}
@media (max-width:560px){
  #industries .ig-grid{grid-template-columns:repeat(2,minmax(0,1fr));}
  #industries .ig-cta .btn{width:100%; justify-content:center;}
  #industries .ig-cta{align-items:stretch;}
}
@media (prefers-reduced-motion:reduce){
  #industries .ig-card{transition:none;}
}
/* === end homepage industries card-grid board === */
`;

css = css.trimEnd() + "\n" + block + "\n";
fs.writeFileSync(cssPath, css);
console.log("Updated tekcroft.css");

/* JS: rotate .ig-card inside [data-ix] */
const jsPath = path.join(ROOT, "public", "tekcroft-main.js");
let js = fs.readFileSync(jsPath, "utf8");
const oldSel = "var chips=[].slice.call(board.querySelectorAll('.ix-chip'));";
const newSel = "var chips=[].slice.call(board.querySelectorAll('.ix-chip, .ig-card'));";
if (js.includes(oldSel)) {
  js = js.replace(oldSel, newSel);
  fs.writeFileSync(jsPath, js);
  console.log("Updated tekcroft-main.js");
} else if (js.includes(newSel)) {
  console.log("JS already updated");
} else {
  console.warn("JS selector not found — check manually");
}
