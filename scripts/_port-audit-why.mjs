/**
 * Replace seo-audit "Why choose us" folder panel with homepage
 * centered tabbed design (#why.wy), using audit-specific copy.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const section = `<!-- ══════════════════════════════════════════════════════════════════
     WHY CHOOSE US — homepage tabbed design, audit content
     ══════════════════════════════════════════════════════════════════ -->
<section class="sec wy" id="why">
  <div class="wrap wy-in">

    <div class="wy-say rv">
      <span class="wy-eyebrow"><i></i>Why choose us</span>

      <h2>Why Businesses Choose TekCroft for <em>SEO Audits</em></h2>
      <p>TekCroft isn&rsquo;t a checklist agency that runs your site through scanner tools and declares it complete. We&rsquo;re a senior-led team that treats every audit as a diagnostic first, then an action plan, in an age where ranking depends on both Google and AI searches.</p>

      <!-- PLACEHOLDER figures: swap Founded / Years / Audits when real numbers are ready. -->
      <div class="wy-facts">
        <span class="wy-fact"><b>20xx</b><span>Founded</span></span>
        <i aria-hidden="true"></i>
        <span class="wy-fact"><b>x+</b><span>Years in SEO</span></span>
        <i aria-hidden="true"></i>
        <span class="wy-fact"><b>x+</b><span>Audits delivered</span></span>
      </div>
    </div>

    <div class="wy-box rv" style="--d:120ms" data-tabs>
      <div class="wy-rail" role="tablist" aria-label="Why choose us">
        <button class="wy-tab on" type="button" role="tab"
                data-p="0" aria-selected="true">Revenue-first</button>
        <button class="wy-tab" type="button" role="tab"
                data-p="1" aria-selected="false">Transparency</button>
        <button class="wy-tab" type="button" role="tab"
                data-p="2" aria-selected="false">AI Search (GEO)</button>
        <button class="wy-tab" type="button" role="tab"
                data-p="3" aria-selected="false">One strategist</button>
        <button class="wy-tab" type="button" role="tab"
                data-p="4" aria-selected="false">5 to 10 days</button>
      </div>

      <div class="wy-panes">
        <div class="wy-pane on" role="tabpanel">
          <div class="wy-txt">
            <span class="wy-mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.8 20.2h16.4"/><path d="M6.6 20.2v-5M11 20.2V9.6M15.4 20.2v-7.6M19.8 20.2V6"/><path d="m6.6 11.4 4.4-4.6 3 2.2 4.4-4.6"/></svg></span>
            <h3>Revenue-first prioritization</h3>
            <p>Not just a raw number of issues with no explanation. Every finding is ordered by business impact so your team knows what to fix first.</p>
          </div>
          <figure class="wy-fig">
            <figcaption><b>The fix list</b>
              <span class="wy-chip">Prioritized</span>
            </figcaption>
            <ul class="br"><li><span class="br-top"><span>Critical</span><b>68%</b></span>
                <span class="br-rail"><i style="--w:68%"></i></span></li><li><span class="br-top"><span>Important</span><b>24%</b></span>
                <span class="br-rail"><i style="--w:24%"></i></span></li><li><span class="br-top"><span>Monitor</span><b>8%</b></span>
                <span class="br-rail"><i style="--w:8%"></i></span></li></ul>
          </figure>
        </div>

        <div class="wy-pane" role="tabpanel">
          <div class="wy-txt">
            <span class="wy-mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4.2" y="6.2" width="15.6" height="12.4" rx="2.4"/><path d="M8 10.4h8M8 13.6h5.6"/><path d="M12 3.8v2.4"/></svg></span>
            <h3>Transparency in pricing</h3>
            <p>No lock-in or mandatory retainers after the auditing process. You get a clear scope, a clear fee, and a clear handoff.</p>
          </div>
          <figure class="wy-fig">
            <figcaption><b>Engagement terms</b>
              <span class="wy-chip">No lock-in</span>
            </figcaption>
            <ul class="br"><li><span class="br-top"><span>Fixed audit scope</span><b>Yes</b></span>
                <span class="br-rail"><i style="--w:100%"></i></span></li><li><span class="br-top"><span>Mandatory retainer</span><b>No</b></span>
                <span class="br-rail"><i style="--w:8%"></i></span></li><li><span class="br-top"><span>Price shown up front</span><b>Yes</b></span>
                <span class="br-rail"><i style="--w:100%"></i></span></li></ul>
          </figure>
        </div>

        <div class="wy-pane" role="tabpanel">
          <div class="wy-txt">
            <span class="wy-mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.2 13.7 8 18.5 9.7 13.7 11.4 12 16.2 10.3 11.4 5.5 9.7 10.3 8Z"/><path d="M18.4 15.2 19.2 17.4l2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8Z"/></svg></span>
            <h3>AI Search (GEO) audit included</h3>
            <p>AI Search (GEO) audit comes as part of the package, not as an extra costly option — so ChatGPT, Gemini, and AI Overviews are in scope from day one.</p>
          </div>
          <figure class="wy-fig">
            <figcaption><b>Where the work goes</b>
              <span class="wy-chip">Included</span>
            </figcaption>
            <div class="dn-wrap">
              <svg class="dn" viewBox="0 0 120 120" role="img"
                   aria-label="Technical 28 per cent, Content 22, Backlinks 18, Competitors 14, AI search 12, Analytics 6">
                <circle class="dn-track" cx="60" cy="60" r="46"/>
                <g transform="rotate(-90 60 60)"><circle class="dn-s dn-1" cx="60" cy="60" r="46" stroke-dasharray="80.93 289.03" stroke-dashoffset="-0.00"/><circle class="dn-s dn-2" cx="60" cy="60" r="46" stroke-dasharray="63.59 289.03" stroke-dashoffset="-80.93"/><circle class="dn-s dn-3" cx="60" cy="60" r="46" stroke-dasharray="52.02 289.03" stroke-dashoffset="-144.52"/><circle class="dn-s dn-4" cx="60" cy="60" r="46" stroke-dasharray="34.68 289.03" stroke-dashoffset="-196.54"/></g>
              </svg>
              <span class="dn-mid"><b>GEO</b><em>Included</em></span>
              <ul class="dn-key"><li class="dn-1"><i></i><span>Technical</span><b>28%</b></li><li class="dn-2"><i></i><span>Content</span><b>22%</b></li><li class="dn-3"><i></i><span>Backlinks</span><b>18%</b></li><li class="dn-4"><i></i><span>AI search</span><b>12%</b></li></ul>
            </div>
          </figure>
        </div>

        <div class="wy-pane" role="tabpanel">
          <div class="wy-txt">
            <span class="wy-mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8.4" r="3.8"/><path d="M4.6 20.4a7.4 7.4 0 0 1 14.8 0"/></svg></span>
            <h3>One senior strategist, start to end</h3>
            <p>One senior strategist works from start to end — no hand-off rotation or junior members learning your site halfway through.</p>
          </div>
          <figure class="wy-fig">
            <figcaption><b>Account ownership</b>
              <span class="wy-chip">Senior-led</span>
            </figcaption>
            <ul class="br"><li><span class="br-top"><span>Single strategist</span><b>100%</b></span>
                <span class="br-rail"><i style="--w:100%"></i></span></li><li><span class="br-top"><span>Hand-off rotation</span><b>0%</b></span>
                <span class="br-rail"><i style="--w:4%"></i></span></li><li><span class="br-top"><span>Junior pass-through</span><b>0%</b></span>
                <span class="br-rail"><i style="--w:4%"></i></span></li></ul>
          </figure>
        </div>

        <div class="wy-pane" role="tabpanel">
          <div class="wy-txt">
            <span class="wy-mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.6" y="5" width="16.8" height="15.4" rx="2.6"/><path d="M3.6 9.6h16.8M8.4 3.2v3.6M15.6 3.2v3.6"/></svg></span>
            <h3>5 to 10 days delivery</h3>
            <p>5 to 10 days delivery time confirmed before any process starts, so you know exactly when the action plan lands.</p>
          </div>
          <figure class="wy-fig">
            <figcaption><b>Delivery window</b>
              <span class="wy-chip">Confirmed up front</span>
            </figcaption>
            <svg class="wyln" viewBox="0 0 320 136" fill="none" role="img"
                 aria-label="Audit progress rising from day one to day ten">
              <path class="wyln-area" d="M40,118 L40.0,108 L86.7,96 L133.3,82 L180.0,68 L226.7,48 L273.3,34 L300.0,22 L300,118 Z"/>
              <polyline class="wyln-line" points="40.0,108 86.7,96 133.3,82 180.0,68 226.7,48 273.3,34 300.0,22"/>
              <circle class="wyln-d" cx="40.0" cy="108" r="3.2"/><circle class="wyln-d" cx="86.7" cy="96" r="3.2"/><circle class="wyln-d" cx="133.3" cy="82" r="3.2"/><circle class="wyln-d" cx="180.0" cy="68" r="3.2"/><circle class="wyln-d" cx="226.7" cy="48" r="3.2"/><circle class="wyln-d" cx="273.3" cy="34" r="3.2"/><circle class="wyln-d" cx="300.0" cy="22" r="3.2"/>
              <text class="wyln-x" x="40.0" y="131">D1</text><text class="wyln-x" x="86.7" y="131">D3</text><text class="wyln-x" x="133.3" y="131">D4</text><text class="wyln-x" x="180.0" y="131">D5</text><text class="wyln-x" x="226.7" y="131">D7</text><text class="wyln-x" x="273.3" y="131">D8</text><text class="wyln-x" x="300.0" y="131">D10</text>
              <text class="wyln-y" x="32" y="121.0">0</text><text class="wyln-y" x="32" y="69.0">50%</text><text class="wyln-y" x="32" y="17.0">100%</text>
            </svg>
          </figure>
        </div>
      </div>
    </div>

    <!-- PLACEHOLDER: leadership quote from the copy deck. -->
    <figure class="wy-quote rv" style="--d:200ms">
      <blockquote>Leadership Quote Here:</blockquote>
      <figcaption>[Founder/Lead strategist name] [Title] [tekCroft]</figcaption>
    </figure>

  </div>
</section>`;

const bodyPath = path.join(ROOT, "lib", "seo-audit-services-body.html");
let body = fs.readFileSync(bodyPath, "utf8");
const start = body.indexOf(
  "<!-- ══════════════════════════════════════════════════════════════════\n     WHY CHOOSE US"
);
const end = body.indexOf(
  "<!-- ══════════════════════════════════════════════════════════════════\n     WHAT YOU RECEIVE"
);
if (start < 0 || end < 0) {
  console.error("Could not locate Why choose us / What you receive markers");
  process.exit(1);
}
body = body.slice(0, start) + section + "\n\n" + body.slice(end);

/* Swap grounds id whyus → why */
body = body.replaceAll("#whyus", "#why");

/* Replace obsolete inline wc why styles with wy extras */
const oldStyle = `<style id="wy-styles">
/* the folder, its tabs and cards — match other service pages */
#why{
  --ground:var(--bg-alt);
  --panel:var(--surface);
  background:var(--bg-alt);
}
#why .wc-panel h3{text-transform:none;}
#why .wc-folder,#why .wc-tabs{min-width:0;}
#why .wc-tabs{overflow:visible;}
#why .wc-tabs .wc-tab{
  flex:1 1 0; min-width:0; white-space:nowrap;
  font-size:11px; letter-spacing:.06em;
  padding:15px clamp(8px,1vw,14px) 17px;
}
#why .wc-tab.on{
  background:var(--surface); margin-bottom:-3px; padding-bottom:20px;
  box-shadow:none;
}
#why .wc-body{background:var(--surface);}
#why .wc-card{background:var(--bg-alt);}
.wc-quote-fig{margin:clamp(14px,1.6vw,20px) 0 0; padding:16px 18px; border-radius:14px;
  background:var(--bg-alt); border:1px solid var(--border-soft);}
.wc-quote-fig blockquote{margin:0; font-family:var(--font-display); font-size:15px; font-weight:700;
  letter-spacing:-.02em; color:var(--text);}
.wc-quote-fig figcaption{margin-top:6px; font-size:12.6px; color:var(--muted);}
</style>`;

const newStyle = `<style id="wy-styles">
/* homepage why design — audit extras on top of global #why.wy rules */
#why{
  --ground:var(--bg-alt);
  --panel:var(--surface);
  background:var(--ground);
}
#why .wy-say h2{max-width:22ch;}
#why .wy-say > p{margin:clamp(12px,1.4vw,18px) auto 0; max-width:62ch;
  font-size:clamp(14.2px,1.1vw,15.6px); line-height:1.7; color:var(--text-2);}
#why .wy-facts{display:flex; flex-wrap:wrap; align-items:center; justify-content:center;
  gap:clamp(14px,2vw,28px); margin-top:clamp(18px,2vw,28px);}
#why .wy-fact{text-align:center;}
#why .wy-fact b{display:block; font-family:var(--font-display); font-weight:800;
  font-size:clamp(20px,2vw,26px); letter-spacing:-.03em; color:var(--text);}
#why .wy-fact span{display:block; margin-top:5px; font-size:12.5px; line-height:1.35; color:var(--muted);}
#why .wy-facts i{width:1px; align-self:stretch; background:var(--border);}
#why .wy-quote{margin:clamp(18px,2vw,28px) auto 0; max-width:52ch; text-align:center;
  padding:16px 18px; border-radius:14px; background:var(--surface); border:1px solid var(--border-soft);}
#why .wy-quote blockquote{margin:0; font-family:var(--font-display); font-size:15px; font-weight:700;
  letter-spacing:-.02em; color:var(--text);}
#why .wy-quote figcaption{margin-top:6px; font-size:12.6px; color:var(--muted);}
@media (max-width:900px){
  #why .wy-rail{grid-auto-flow:row; grid-auto-columns:auto;}
  #why .wy-tab{text-align:left;}
}
</style>`;

if (!body.includes(oldStyle)) {
  /* try after whyus→why replace already applied to style block */
  console.warn("Inline wy-styles block not found exactly; writing CSS to seo-audit-services.css instead");
} else {
  body = body.replace(oldStyle, newStyle);
}

fs.writeFileSync(bodyPath, body);
console.log("Updated seo-audit-services-body.html");

/* Grounds in page CSS */
const cssPath = path.join(ROOT, "app", "seo-audit-services.css");
let css = fs.readFileSync(cssPath, "utf8");
css = css.replaceAll("#whyus", "#why");

const extras = `
/* === seo-audit why (homepage design extras) === */
#why.wy{background:var(--ground);}
#why .wy-say h2{max-width:22ch;}
#why .wy-say > p{margin:clamp(12px,1.4vw,18px) auto 0; max-width:62ch;
  font-size:clamp(14.2px,1.1vw,15.6px); line-height:1.7; color:var(--text-2);}
#why .wy-facts{display:flex; flex-wrap:wrap; align-items:center; justify-content:center;
  gap:clamp(14px,2vw,28px); margin-top:clamp(18px,2vw,28px);}
#why .wy-fact{text-align:center;}
#why .wy-fact b{display:block; font-family:var(--font-display); font-weight:800;
  font-size:clamp(20px,2vw,26px); letter-spacing:-.03em; color:var(--text);}
#why .wy-fact span{display:block; margin-top:5px; font-size:12.5px; line-height:1.35; color:var(--muted);}
#why .wy-facts i{width:1px; align-self:stretch; background:var(--border);}
#why .wy-quote{margin:clamp(18px,2vw,28px) auto 0; max-width:52ch; text-align:center;
  padding:16px 18px; border-radius:14px; background:var(--surface); border:1px solid var(--border-soft);}
#why .wy-quote blockquote{margin:0; font-family:var(--font-display); font-size:15px; font-weight:700;
  letter-spacing:-.02em; color:var(--text);}
#why .wy-quote figcaption{margin-top:6px; font-size:12.6px; color:var(--muted);}
@media (max-width:900px){
  #why .wy-rail{grid-auto-flow:row; grid-auto-columns:auto;}
  #why .wy-tab{text-align:left;}
}
`;

const marker = "/* === seo-audit why (homepage design extras) === */";
if (css.includes(marker)) {
  const i = css.indexOf(marker);
  css = css.slice(0, i);
}
css = css.trimEnd() + "\n" + extras + "\n";
fs.writeFileSync(cssPath, css);
console.log("Updated seo-audit-services.css");

/* JS tabs */
const acScript = `
/* === why-v2 tabs (seo-audit) === */
(function(){
  "use strict";
  var box = document.querySelector("#why [data-tabs]");
  if (!box) return;
  var tabs  = Array.prototype.slice.call(box.querySelectorAll(".wy-tab")),
      panes = Array.prototype.slice.call(box.querySelectorAll(".wy-pane"));

  function open(i){
    tabs.forEach(function(t, n){
      t.classList.toggle("on", n === i);
      t.setAttribute("aria-selected", n === i ? "true" : "false");
    });
    panes.forEach(function(p, n){ p.classList.toggle("on", n === i); });
  }

  box.querySelector(".wy-rail").addEventListener("click", function(e){
    var b = e.target.closest(".wy-tab");
    if (b) open(tabs.indexOf(b));
  });

  box.querySelector(".wy-rail").addEventListener("keydown", function(e){
    var i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    var to = e.key === "ArrowRight" || e.key === "ArrowDown" ? i + 1
           : e.key === "ArrowLeft"  || e.key === "ArrowUp"   ? i - 1 : -1;
    if (to < 0 && to !== -1) to = tabs.length - 1;
    if (to === -1) return;
    e.preventDefault();
    to = to % tabs.length;
    tabs[to].focus(); open(to);
  });
})();
`;

const jsPath = path.join(ROOT, "public", "tekcroft-seo-audit-services.js");
let js = fs.readFileSync(jsPath, "utf8");
if (!js.includes("/* === why-v2 tabs (seo-audit) === */")) {
  js = js.trimEnd() + "\n" + acScript + "\n";
  fs.writeFileSync(jsPath, js);
  console.log("Updated tekcroft-seo-audit-services.js");
} else {
  console.log("why-v2 tabs already present");
}
