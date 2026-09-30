import fs from "fs";

const bodyPath = "lib/franchise-seo-body.html";
const cssPath = "app/franchise-seo.css";
const jsPath = "public/tekcroft-franchise-seo.js";

const section = `<section class="sec wy" id="why" data-ground="tint">
  <div class="wrap wy-in">

    <div class="wy-say rv">
      <span class="smark"><b>Why choose us</b></span>
      <h2>Why Choose Tekcroft for <em>Franchise SEO</em></h2>
    </div>

    <div class="wy-box rv" style="--d:120ms" data-tabs>
      <div class="wy-rail" role="tablist" aria-label="Why choose Tekcroft for franchise SEO">
        <button class="wy-tab on" type="button" role="tab"
                data-p="0" aria-selected="true">Clear Structure</button>
        <button class="wy-tab" type="button" role="tab"
                data-p="1" aria-selected="false">Full Visibility</button>
        <button class="wy-tab" type="button" role="tab"
                data-p="2" aria-selected="false">Built to Scale</button>
        <button class="wy-tab" type="button" role="tab"
                data-p="3" aria-selected="false">Local Relevance</button>
        <button class="wy-tab" type="button" role="tab"
                data-p="4" aria-selected="false">Clear Priorities</button>
      </div>

      <div class="wy-panes">
        <div class="wy-pane on" role="tabpanel">
          <div class="wy-txt">
            <span class="wy-mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8.4 4.4h7.2v3.2H8.4z"/><path d="M5.2 7.6h13.6v12H5.2z"/><path d="M9.2 12.2h5.6M9.2 15.4h5.6M9.2 18.6h3.6"/></svg></span>
            <h3>Clear Structure Across Brand and Locations</h3>
            <p>Franchise SEO becomes messy when corporate teams, franchisees and agencies all have different ideas. We give your SEO programme a clear structure, with responsibilities agreed between the brand and individual locations before work gets held up by approvals.</p>
          </div>
          <figure class="wy-fig">
            <figcaption><b>Who does what</b>
              <span class="wy-chip">Agreed upfront</span>
            </figcaption>
            <ul class="br"><li><span class="br-top"><span>Brand sets the direction</span><b>Lead</b></span>
                <span class="br-rail"><i style="--w:100%"></i></span></li><li><span class="br-top"><span>Locations add local input</span><b>Local</b></span>
                <span class="br-rail"><i style="--w:72%"></i></span></li><li><span class="br-top"><span>Approvals agreed up front</span><b>Set</b></span>
                <span class="br-rail"><i style="--w:88%"></i></span></li></ul>
          </figure>
        </div>

        <div class="wy-pane" role="tabpanel">
          <div class="wy-txt">
            <span class="wy-mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.8 20.2h16.4"/><path d="M6.6 20.2v-5M11 20.2V9.6M15.4 20.2v-7.6M19.8 20.2V6"/><path d="m6.6 11.4 4.4-4.6 3 2.2 4.4-4.6"/></svg></span>
            <h3>Network and Location Visibility Together</h3>
            <p>Tekcroft keeps the wider franchise picture and individual location performance visible together, so a brand can see where its SEO is working and where a particular market needs attention.</p>
          </div>
          <figure class="wy-fig">
            <figcaption><b>In one view</b>
              <span class="wy-chip">Side by side</span>
            </figcaption>
            <ul class="br"><li><span class="br-top"><span>Whole franchise performance</span><b>Network</b></span>
                <span class="br-rail"><i style="--w:86%"></i></span></li><li><span class="br-top"><span>Each location&rsquo;s results</span><b>Local</b></span>
                <span class="br-rail"><i style="--w:64%"></i></span></li><li><span class="br-top"><span>Markets that need attention</span><b>Focus</b></span>
                <span class="br-rail"><i style="--w:42%"></i></span></li></ul>
          </figure>
        </div>

        <div class="wy-pane" role="tabpanel">
          <div class="wy-txt">
            <span class="wy-mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-6.5-6.2-6.5-11A6.5 6.5 0 0 1 18.5 10c0 4.8-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/></svg></span>
            <h3>Built to Scale Without Rebuilding</h3>
            <p>Opening another franchise should not mean rebuilding the SEO framework from the ground up. Tekcroft creates a structure that can extend to new locations while keeping the same standards across the network.</p>
          </div>
          <figure class="wy-fig">
            <figcaption><b>A new location opens</b>
              <span class="wy-chip">No rebuild</span>
            </figcaption>
            <ul class="br"><li><span class="br-top"><span>Same framework extended</span><b>100%</b></span>
                <span class="br-rail"><i style="--w:100%"></i></span></li><li><span class="br-top"><span>Same standards network-wide</span><b>100%</b></span>
                <span class="br-rail"><i style="--w:100%"></i></span></li><li><span class="br-top"><span>Rebuild from scratch</span><b>0%</b></span>
                <span class="br-rail"><i style="--w:6%"></i></span></li></ul>
          </figure>
        </div>

        <div class="wy-pane" role="tabpanel">
          <div class="wy-txt">
            <span class="wy-mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.4 7.2h15.2v11.2H4.4z"/><path d="M8 7.2V5.4h8v1.8"/><path d="M8.6 12.2h6.8M8.6 15.4h4.4"/></svg></span>
            <h3>Brand Alignment with Local Relevance</h3>
            <p>You cannot give every location identical content for consistency. We keep the core SEO direction aligned across the brand while allowing each location to reflect its own market, services, or search demand.</p>
          </div>
          <figure class="wy-fig">
            <figcaption><b>Each location page</b>
              <span class="wy-chip">On brand</span>
            </figcaption>
            <ul class="br"><li><span class="br-top"><span>Core SEO direction shared</span><b>Brand</b></span>
                <span class="br-rail"><i style="--w:92%"></i></span></li><li><span class="br-top"><span>Own market &amp; services</span><b>Local</b></span>
                <span class="br-rail"><i style="--w:74%"></i></span></li><li><span class="br-top"><span>Own search demand</span><b>Local</b></span>
                <span class="br-rail"><i style="--w:68%"></i></span></li></ul>
          </figure>
        </div>

        <div class="wy-pane" role="tabpanel">
          <div class="wy-txt">
            <span class="wy-mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.2 4.8 6v6.2c0 4.4 3 8.4 7.2 9.4 4.2-1 7.2-5 7.2-9.4V6Z"/><path d="m9 12.2 2.2 2.2 4-4.4"/></svg></span>
            <h3>Priorities Without Day-to-Day SEO Management</h3>
            <p>We keep the programme tied to defined responsibilities and location-level priorities, so corporate teams can see what needs attention without having to manage the SEO process themselves.</p>
          </div>
          <figure class="wy-fig">
            <figcaption><b>For corporate teams</b>
              <span class="wy-chip">Hands-off</span>
            </figcaption>
            <ul class="br"><li><span class="br-top"><span>Defined responsibilities</span><b>Set</b></span>
                <span class="br-rail"><i style="--w:96%"></i></span></li><li><span class="br-top"><span>Location-level priorities</span><b>Clear</b></span>
                <span class="br-rail"><i style="--w:82%"></i></span></li><li><span class="br-top"><span>Day-to-day SEO management</span><b>0%</b></span>
                <span class="br-rail"><i style="--w:6%"></i></span></li></ul>
          </figure>
        </div>
      </div>
    </div>

    <div class="wy-cta rv" style="--d:200ms">
      <a class="btn btn-primary btn-lg" href="#contact">Request Your Free Franchise SEO Proposal <span class="arw">&uarr;</span></a>
    </div>

  </div>
</section>
`;

let body = fs.readFileSync(bodyPath, "utf8");
const start = body.indexOf('<section class="sec wc-sec" id="whyus"');
if (start < 0) throw new Error("whyus section not found");
const next = body.indexOf('<section class="sec fp" id="pricing"', start);
if (next < 0) throw new Error("pricing section not found");
body = body.slice(0, start) + section + "\n\n" + body.slice(next);
fs.writeFileSync(bodyPath, body);
console.log("body replaced whyus → why");

// Update ground references whyus → why where needed for alternating grounds
body = fs.readFileSync(bodyPath, "utf8"); // already written

let css = fs.readFileSync(cssPath, "utf8");
css = css.replaceAll("#whyus{", "#why,{");
css = css.replaceAll("#whyus,", "#why,");
css = css.replaceAll("#whyus .", "#why .");
css = css.replaceAll("#whyus{", "#why{"); // leftover
// Fix accidental "#why,{" from first replace
css = css.replaceAll("#why,{", "#why{");
css = css.replaceAll("html[data-theme=\"dark\"] #whyus .smark", 'html[data-theme="dark"] #why .smark');
css = css.replaceAll("#whyus.sec", "#why.sec");

const whyCss = `

/* ══════════════════════════════════════════════════════════════════════
   WHY CHOOSE US — franchise (#why) tabbed design
   ══════════════════════════════════════════════════════════════════════ */
#why.wy{--wy-w:100%;}
#why .wy-in{display:grid; gap:clamp(24px,3vw,40px); justify-items:stretch;}
#why .wy-say{text-align:center;}
#why .wy-say h2{margin:clamp(16px,1.9vw,24px) auto 0; max-width:22ch;
  font-size:var(--h2); line-height:1.1; letter-spacing:-0.045em;}
#why .wy-say h2 em{font-style:normal; color:var(--brand-text);}
#why .wy-box{display:grid; gap:clamp(14px,1.6vw,22px);}
#why .wy-rail{width:var(--wy-w); margin-inline:auto;
  display:grid; grid-auto-flow:column; grid-auto-columns:1fr;
  gap:6px; padding:6px; border-radius:16px;
  background:var(--surface); border:1px solid var(--border);}
#why .wy-tab{padding:12px 14px; border:0; border-radius:11px; cursor:pointer;
  background:transparent; color:var(--text-2);
  font-family:var(--font-display); font-weight:700;
  font-size:clamp(11.5px,1vw,14px); line-height:1.25; letter-spacing:-0.02em;
  text-align:center;
  transition:background .3s var(--ease), color .3s var(--ease),
             box-shadow .3s var(--ease);}
#why .wy-tab:hover{color:var(--text);}
#why .wy-tab.on{background:var(--primary); color:#fff;
  box-shadow:0 8px 20px -8px hsl(var(--brand-h) 100% 40% / .55);}
#why .wy-tab.on:hover{color:#fff;}
#why .wy-tab:focus-visible{outline:2px solid var(--primary); outline-offset:2px;}
#why .wy-panes{width:var(--wy-w); margin-inline:auto;
  display:grid; padding:clamp(22px,2.6vw,36px);
  background:var(--surface); border:1px solid var(--border);
  border-radius:calc(var(--r-lg) + 8px);
  box-shadow:0 26px 60px -38px rgba(var(--ink-rgb),.4);}
#why .wy-pane{grid-area:1 / 1; visibility:hidden; opacity:0;
  transform:translateY(8px); pointer-events:none;
  display:grid; grid-template-columns:minmax(0,.94fr) minmax(0,1.06fr);
  gap:clamp(18px,2.4vw,38px); align-items:center;
  transition:opacity .34s var(--ease), transform .34s var(--ease);}
#why .wy-pane.on{visibility:visible; opacity:1; transform:none; pointer-events:auto;}
#why .wy-txt{grid-column:1; align-self:center;}
#why .wy-mark{display:grid; place-items:center;
  width:clamp(40px,3.6vw,48px); aspect-ratio:1; border-radius:13px;
  background:var(--disc); color:var(--primary); margin-bottom:14px;}
#why .wy-mark svg{width:50%; height:50%;}
#why .wy-pane h3{font-family:var(--font-display); font-weight:800;
  font-size:var(--h3); line-height:1.2; letter-spacing:-0.035em;
  color:var(--text); text-transform:none;}
#why .wy-pane p{margin:clamp(9px,1vw,13px) 0 0;
  font-size:var(--body); line-height:1.7; color:var(--text-2);}
#why .wy-fig{grid-column:2; align-self:center;
  margin:0; padding:clamp(16px,1.8vw,22px);
  border-radius:var(--r-lg); background:var(--bg-alt);}
#why .wy-fig figcaption{display:flex; align-items:center; justify-content:space-between;
  gap:12px; margin-bottom:clamp(12px,1.4vw,18px);}
#why .wy-fig figcaption b{font-family:var(--font-display); font-weight:800;
  font-size:clamp(13px,1.1vw,15px); letter-spacing:-0.03em; color:var(--text);}
#why .wy-chip{display:inline-flex; align-items:center; gap:6px; white-space:nowrap;
  padding:6px 12px; border-radius:99px;
  background:var(--surface); border:1px solid var(--border);
  font-size:11px; font-weight:600; color:var(--text-2);}
#why .br{list-style:none; margin:0; padding:0; display:grid; gap:clamp(11px,1.3vw,16px);}
#why .br-top{display:flex; align-items:baseline; justify-content:space-between; gap:12px;
  margin-bottom:7px;}
#why .br-top span{font-size:12.5px; color:var(--text-2);}
#why .br-top b{font-family:var(--font-display); font-weight:800; font-size:13.5px;
  letter-spacing:-0.03em; color:var(--brand-text); font-variant-numeric:tabular-nums;}
#why .br-rail{display:block; height:6px; border-radius:99px; background:var(--border);
  overflow:hidden;}
#why .br-rail i{display:block; height:100%; width:var(--w); border-radius:99px;
  background:var(--primary); transform:scaleX(0); transform-origin:left center;}
#why .wy-pane.on .br-rail i{transform:none; transition:transform .9s var(--ease) .2s;}
#why .wy-cta{display:flex; justify-content:center; margin-top:clamp(4px,.6vw,8px);}
@media (max-width:980px){
  #why .wy-pane{grid-template-columns:1fr; gap:clamp(16px,2.4vw,24px);}
  #why .wy-txt, #why .wy-fig{grid-column:1;}
}
@media (max-width:900px){
  #why .wy-rail{grid-auto-flow:row; grid-auto-columns:auto;}
  #why .wy-tab{text-align:left; padding:12px 16px;}
}
@media (max-width:600px){
  #why .wy-cta .btn{width:100%; justify-content:center;}
}
@media (prefers-reduced-motion:reduce){
  #why .wy-pane{transition:none;}
  #why .br-rail i{transform:none;}
}
/* Soft brand wash for Why section (matches design) */
#why.wy{
  background:hsl(var(--brand-h) 60% 98%) !important;
}
html[data-theme="dark"] #why.wy{background:var(--bg-alt) !important;}
`;

const MARK = "/* === SITE CONSISTENCY LOCK";
const mi = css.indexOf(MARK);
if (mi >= 0) {
  css = css.slice(0, mi).trimEnd() + whyCss + "\n\n" + css.slice(mi);
} else {
  css = css.trimEnd() + whyCss;
}
fs.writeFileSync(cssPath, css);
console.log("css appended");

let js = fs.readFileSync(jsPath, "utf8");
if (!js.includes('#why [data-tabs]')) {
  js += `

/* === why tabs (franchise) === */
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
  fs.writeFileSync(jsPath, js);
  console.log("js appended");
} else {
  console.log("js already has why tabs");
}

console.log("done");
