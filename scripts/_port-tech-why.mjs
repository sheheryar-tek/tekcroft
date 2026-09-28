/**
 * Port homepage Why (#why.wy) design onto technical SEO Why choose us,
 * keeping technical SEO tab copy + figures adapted to wy markup.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const section = `<!-- ══════════════════════════════════════════════════════════════════
     WHY CHOOSE US — homepage tabbed design, technical SEO content
     ══════════════════════════════════════════════════════════════════ -->
<section class="sec wy" id="why">
  <div class="wrap wy-in">

    <div class="wy-say rv">
      <span class="wy-eyebrow"><i></i>Why choose us</span>
      <h2>Why Choose <em>Us</em></h2>
    </div>

    <div class="wy-box rv" style="--d:120ms" data-tabs>
      <div class="wy-rail" role="tablist" aria-label="Why choose us">
        <button class="wy-tab on" type="button" role="tab"
                data-p="0" aria-selected="true">Fixes Ranked by What Actually Moves Revenue</button>
        <button class="wy-tab" type="button" role="tab"
                data-p="1" aria-selected="false">Built for AI Search From Day One</button>
        <button class="wy-tab" type="button" role="tab"
                data-p="2" aria-selected="false">Reports Your Team Can Use</button>
        <button class="wy-tab" type="button" role="tab"
                data-p="3" aria-selected="false">Migration Support That Starts Before Launch</button>
        <button class="wy-tab" type="button" role="tab"
                data-p="4" aria-selected="false">Transparent Pricing and Timelines</button>
      </div>

      <div class="wy-panes">
        <div class="wy-pane on" role="tabpanel">
          <div class="wy-txt">
            <span class="wy-mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.8 20.2h16.4"/><path d="M6.6 20.2v-5M11 20.2V9.6M15.4 20.2v-7.6M19.8 20.2V6"/><path d="m6.6 11.4 4.4-4.6 3 2.2 4.4-4.6"/></svg></span>
            <h3>Fixes Ranked by What Actually Moves Revenue</h3>
            <p>Every finding is scored by real impact, so your team spends time on the fixes that move traffic and rankings. Not low-value cleanup that looks good in a report but changes nothing.</p>
          </div>
          <figure class="wy-fig">
            <figcaption><b>Where the impact sits</b>
              <span class="wy-chip">This site</span>
            </figcaption>
            <ul class="br"><li><span class="br-top"><span>Critical, 9 findings</span><b>68%</b></span>
                <span class="br-rail"><i style="--w:68%"></i></span></li><li><span class="br-top"><span>Important, 34 findings</span><b>24%</b></span>
                <span class="br-rail"><i style="--w:24%"></i></span></li><li><span class="br-top"><span>Monitor, 197 findings</span><b>8%</b></span>
                <span class="br-rail"><i style="--w:8%"></i></span></li></ul>
          </figure>
        </div>

        <div class="wy-pane" role="tabpanel">
          <div class="wy-txt">
            <span class="wy-mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.2 13.7 8 18.5 9.7 13.7 11.4 12 16.2 10.3 11.4 5.5 9.7 10.3 8Z"/><path d="M18.4 15.2 19.2 17.4l2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8Z"/></svg></span>
            <h3>Built for AI Search From Day One</h3>
            <p>AI/LLM crawlability is a part of every audit standard. Your site gets checked for how ChatGPT, Perplexity, or AI Overviews access and cite your content, alongside classic search engine crawlability.</p>
          </div>
          <figure class="wy-fig">
            <figcaption><b>Where the work goes</b>
              <span class="wy-chip">One scope</span>
            </figcaption>
            <div class="dn-wrap">
              <svg class="dn" viewBox="0 0 120 120" role="img"
                   aria-label="Crawl and index 34 per cent, Speed and vitals 26, Schema 18, AI search 22">
                <circle class="dn-track" cx="60" cy="60" r="46"/>
                <g transform="rotate(-90 60 60)"><circle class="dn-s dn-1" cx="60" cy="60" r="46" stroke-dasharray="98.27 289.03" stroke-dashoffset="-0.00"/><circle class="dn-s dn-2" cx="60" cy="60" r="46" stroke-dasharray="75.15 289.03" stroke-dashoffset="-98.27"/><circle class="dn-s dn-3" cx="60" cy="60" r="46" stroke-dasharray="52.02 289.03" stroke-dashoffset="-173.42"/><circle class="dn-s dn-4" cx="60" cy="60" r="46" stroke-dasharray="63.59 289.03" stroke-dashoffset="-225.44"/></g>
              </svg>
              <span class="dn-mid"><b>4</b><em>Areas</em></span>
              <ul class="dn-key"><li class="dn-1"><i></i><span>Crawl &amp; index</span><b>34%</b></li><li class="dn-2"><i></i><span>Speed &amp; vitals</span><b>26%</b></li><li class="dn-3"><i></i><span>Schema</span><b>18%</b></li><li class="dn-4"><i></i><span>AI search</span><b>22%</b></li></ul>
            </div>
          </figure>
        </div>

        <div class="wy-pane" role="tabpanel">
          <div class="wy-txt">
            <span class="wy-mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4.2" y="6.2" width="15.6" height="12.4" rx="2.4"/><path d="M8 10.4h8M8 13.6h5.6"/><path d="M12 3.8v2.4"/></svg></span>
            <h3>Reports Your Team Can Use</h3>
            <p>No jargon-heavy exports that sit in a folder unread. We translate findings into plain language and hand developers implementation-ready tickets with clear acceptance criteria.</p>
          </div>
          <figure class="wy-fig">
            <figcaption><b>What a finding arrives as</b>
              <span class="wy-chip">One ticket</span>
            </figcaption>
            <ul class="br"><li><span class="br-top"><span>Plain-language finding</span><b>Yes</b></span>
                <span class="br-rail"><i style="--w:100%"></i></span></li><li><span class="br-top"><span>Dev-ready acceptance criteria</span><b>Yes</b></span>
                <span class="br-rail"><i style="--w:100%"></i></span></li><li><span class="br-top"><span>Jargon-only export</span><b>No</b></span>
                <span class="br-rail"><i style="--w:8%"></i></span></li></ul>
          </figure>
        </div>

        <div class="wy-pane" role="tabpanel">
          <div class="wy-txt">
            <span class="wy-mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h12M12 7l5 5-5 5"/><path d="M4 7v10"/></svg></span>
            <h3>Migration Support That Starts Before Launch</h3>
            <p>We validate your staging environment and build your redirect map before you go live, then review crawl stats and indexation. Day-to-day rankings are checked after launch, so regressions get caught in hours, not discovered months later in a traffic report.</p>
          </div>
          <figure class="wy-fig">
            <figcaption><b>Where the work sits</b>
              <span class="wy-chip">Before, during, after</span>
            </figcaption>
            <svg class="wyln" viewBox="0 0 320 136" fill="none" role="img"
                 aria-label="Migration coverage rising from before launch to after launch">
              <path class="wyln-area" d="M40,118 L40.0,96 L120.0,78 L200.0,52 L300.0,28 L300,118 Z"/>
              <polyline class="wyln-line" points="40.0,96 120.0,78 200.0,52 300.0,28"/>
              <circle class="wyln-d" cx="40.0" cy="96" r="3.2"/><circle class="wyln-d" cx="120.0" cy="78" r="3.2"/><circle class="wyln-d" cx="200.0" cy="52" r="3.2"/><circle class="wyln-d" cx="300.0" cy="28" r="3.2"/>
              <text class="wyln-x" x="40.0" y="131">Before</text><text class="wyln-x" x="120.0" y="131">Staging</text><text class="wyln-x" x="200.0" y="131">Launch</text><text class="wyln-x" x="300.0" y="131">After</text>
              <text class="wyln-y" x="32" y="121.0">0</text><text class="wyln-y" x="32" y="69.0">50%</text><text class="wyln-y" x="32" y="17.0">100%</text>
            </svg>
          </figure>
        </div>

        <div class="wy-pane" role="tabpanel">
          <div class="wy-txt">
            <span class="wy-mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.6" y="5" width="16.8" height="15.4" rx="2.6"/><path d="M3.6 9.6h16.8M8.4 3.2v3.6M15.6 3.2v3.6"/></svg></span>
            <h3>Transparent Pricing and Timelines</h3>
            <p>You&rsquo;ll know your ballpark cost and realistic timeline upfront, no &ldquo;contact us for a custom quote&rdquo; with no context to plan around.</p>
          </div>
          <figure class="wy-fig">
            <figcaption><b>Engagement terms</b>
              <span class="wy-chip">Up front</span>
            </figcaption>
            <ul class="br"><li><span class="br-top"><span>Ballpark cost shown</span><b>Yes</b></span>
                <span class="br-rail"><i style="--w:100%"></i></span></li><li><span class="br-top"><span>Realistic timeline</span><b>Yes</b></span>
                <span class="br-rail"><i style="--w:100%"></i></span></li><li><span class="br-top"><span>Opaque custom quote only</span><b>No</b></span>
                <span class="br-rail"><i style="--w:8%"></i></span></li></ul>
          </figure>
        </div>
      </div>
    </div>

  </div>
</section>`;

/* ---- HTML ---- */
const bodyPath = path.join(ROOT, "lib", "technical-seo-body.html");
let body = fs.readFileSync(bodyPath, "utf8");
const start = body.indexOf('id="whyus"');
const startSec = start >= 0 ? body.lastIndexOf("<section", start) : -1;
const end = body.indexOf('id="process"');
const endSec = end >= 0 ? body.lastIndexOf("<section", end) : -1;
// Prefer comment before whyus if present
let cut = startSec;
const whyComment = body.lastIndexOf("WHY CHOOSE", startSec);
if (whyComment >= 0 && startSec - whyComment < 400) {
  cut = body.lastIndexOf("<!--", whyComment);
}
if (cut < 0 || endSec < 0) {
  console.error("whyus/process markers missing", cut, endSec);
  process.exit(1);
}
body = body.slice(0, cut) + section + "\n\n" + body.slice(endSec);
fs.writeFileSync(bodyPath, body);
console.log("Updated technical-seo-body.html");

/* ---- CSS: inject homepage why base + rename whyus → why in grounds ---- */
const home = fs.readFileSync(path.join(ROOT, "app", "tekcroft.css"), "utf8");
const whyLabel = "WHY CHOOSE US — homepage (#why)";
const whyStart = home.lastIndexOf("/* ", home.indexOf(whyLabel));
const whyEnd = home.lastIndexOf("/* ", home.indexOf("SEARCH SPLIT V2 — homepage AI variant"));
if (whyStart < 0 || whyEnd < 0) {
  console.error("could not extract why CSS", whyStart, whyEnd);
  process.exit(1);
}
let whyCss = home.slice(whyStart, whyEnd).trimEnd() + "\n";
whyCss = whyCss.replace(/#why\{background:var\(--surface\); --wy-w:100%;\}/, "#why{--wy-w:100%;}");

const extras = `
/* === technical-seo why (homepage design extras) === */
#why.wy{background:var(--ground);}
#why .wy-say h2{max-width:24ch; margin-inline:auto;}
@media (max-width:900px){
  #why .wy-rail{grid-auto-flow:row; grid-auto-columns:auto;}
  #why .wy-tab{text-align:left;}
}
`;

const cssPath = path.join(ROOT, "app", "technical-seo.css");
let css = fs.readFileSync(cssPath, "utf8");
css = css.replaceAll("#whyus", "#why");

// Drop prior injected why blocks / consistency lock temporarily; re-apply lock after
const lockMark = "/* === SITE CONSISTENCY LOCK";
let lockTail = "";
const lockI = css.indexOf(lockMark);
if (lockI >= 0) {
  lockTail = css.slice(lockI);
  css = css.slice(0, lockI).trimEnd();
}

const whyMark = "/* === technical-seo why (homepage design extras) === */";
const whyI = css.indexOf(whyMark);
if (whyI >= 0) css = css.slice(0, whyI).trimEnd();
const baseMark = "WHY CHOOSE US — homepage (#why)";
const baseI = css.indexOf(baseMark);
if (baseI >= 0) {
  const cutBase = css.lastIndexOf("/* ", baseI);
  if (cutBase >= 0) css = css.slice(0, cutBase).trimEnd();
}

css = css.trimEnd() + "\n\n" + whyCss + "\n" + extras + "\n";
if (lockTail) css += "\n" + lockTail;
else {
  // leave for apply-site-consistency
}
fs.writeFileSync(cssPath, css);
console.log("Updated technical-seo.css");

/* ---- JS ---- */
const whyScript = `
/* === why-v2 tabs (technical-seo) === */
(function(){
  "use strict";
  var box = document.querySelector("#why [data-tabs]");
  if (!box) return;
  var tabs  = Array.prototype.slice.call(box.querySelectorAll(".wy-tab")),
      panes = Array.prototype.slice.call(box.querySelectorAll(".wy-pane"));
  function show(i){
    tabs.forEach(function(t,k){ var on=k===i; t.classList.toggle("on",on); t.setAttribute("aria-selected",String(on)); });
    panes.forEach(function(p,k){ p.classList.toggle("on", k===i); });
  }
  box.querySelector(".wy-rail").addEventListener("click", function(e){
    var b = e.target.closest(".wy-tab");
    if (!b) return;
    show(+b.getAttribute("data-p"));
  });
  box.querySelector(".wy-rail").addEventListener("keydown", function(e){
    var b = e.target.closest(".wy-tab");
    if (!b) return;
    var i = +b.getAttribute("data-p");
    var to = e.key==="ArrowRight"||e.key==="ArrowDown" ? i+1 : e.key==="ArrowLeft"||e.key==="ArrowUp" ? i-1 : -1;
    if (to<0 || to>=tabs.length) return;
    e.preventDefault(); tabs[to].focus(); show(to);
  });
})();
`;

const jsPath = path.join(ROOT, "public", "tekcroft-technical-seo.js");
let js = fs.readFileSync(jsPath, "utf8");
// Remove old wcPanel why script if present (leave other #wcPanel uses alone — there shouldn't be)
if (!js.includes("/* === why-v2 tabs (technical-seo) === */")) {
  js = js.trimEnd() + "\n" + whyScript + "\n";
  fs.writeFileSync(jsPath, js);
  console.log("Updated tekcroft-technical-seo.js");
} else {
  console.log("why tabs already present");
}

// Update site-consistency source for #why instead of #whyus
const consPath = path.join(ROOT, "app", "site-consistency.css");
let cons = fs.readFileSync(consPath, "utf8");
if (cons.includes("#whyus.sec") && !cons.includes("#why.sec")) {
  cons = cons.replace("#whyus.sec,", "#why.sec,");
  fs.writeFileSync(consPath, cons);
  console.log("Updated site-consistency.css");
}
