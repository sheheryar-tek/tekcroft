import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = path.join(ROOT, "lib/seo-audit-services-body.html");
let h = fs.readFileSync(file, "utf8");

const whyStart = h.indexOf("<!-- ══════════════════════════════════════════════════════════════════\n     WHY CHOOSE US");
const whyEnd = h.indexOf("<!-- ══════════════════════════════════════════════════════════════════\n     WHAT YOU RECEIVE");
if (whyStart < 0 || whyEnd < 0) {
  console.error("why markers missing", whyStart, whyEnd);
  process.exit(1);
}
h = h.slice(0, whyStart) + h.slice(whyEnd);

const strip = `    <div class="wk-strip rv">
      <div class="wk-facts">
        <span class="wk-fact"><b>20xx</b><span>Founded</span></span>
        <i aria-hidden="true"></i>
        <span class="wk-fact"><b>x+</b><span>Years in SEO</span></span>
        <i aria-hidden="true"></i>
        <span class="wk-fact"><b>x+</b><span>Audits delivered</span></span>
      </div>
      <figure class="wk-quote">
        <blockquote>Leadership Quote Here:</blockquote>
        <figcaption>[Founder/Lead strategist name] [Title] [tekCroft]</figcaption>
      </figure>
    </div>

`;

const workMark = `<section class="sec wk" id="work" data-ground="tint">
  <div class="wrap">

    <div>`;

if (!h.includes(workMark)) {
  console.error("work mark missing");
  process.exit(1);
}
h = h.replace(
  workMark,
  `<section class="sec wk" id="work" data-ground="tint">
  <div class="wrap">

${strip}    <div>`
);

// Update embedded #why fact/quote styles to #work
h = h.replace(
  /#why \.wy-facts\{[\s\S]*?#why \.wy-quote figcaption\{[^}]+\}/,
  `#work .wk-strip{margin:0 0 clamp(28px,3.2vw,44px);}
#work .wk-facts{display:flex; flex-wrap:wrap; align-items:center; justify-content:center;
  gap:clamp(14px,2vw,28px); padding:clamp(16px,1.8vw,22px) clamp(18px,2vw,28px);
  border-radius:18px; background:var(--surface); border:1px solid var(--border-soft);}
#work .wk-fact{text-align:center;}
#work .wk-fact b{display:block; font-family:var(--font-display); font-weight:800;
  font-size:clamp(20px,2vw,26px); letter-spacing:-.03em; color:var(--text);}
#work .wk-fact span{display:block; margin-top:5px; font-size:12.5px; line-height:1.35; color:var(--muted);}
#work .wk-facts i{width:1px; align-self:stretch; background:var(--border); min-height:36px;}
#work .wk-quote{margin:clamp(14px,1.6vw,22px) auto 0; max-width:52ch; text-align:center;
  padding:16px 18px; border-radius:14px; background:var(--surface); border:1px solid var(--border-soft);}
#work .wk-quote blockquote{margin:0; font-family:var(--font-display); font-size:15px; font-weight:700;
  letter-spacing:-.02em; color:var(--text);}
#work .wk-quote figcaption{margin-top:6px; font-size:12.6px; color:var(--muted);}`
);

fs.writeFileSync(file, h);
console.log("html ok");
