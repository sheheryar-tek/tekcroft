import fs from "fs";
import path from "path";

const ROOT = "c:/Tekcroft";
const homeBody = path.join(ROOT, "lib/homepage-body.html");
const onBody = path.join(ROOT, "lib/on-page-seo-body.html");
const homeCss = path.join(ROOT, "app/tekcroft.css");
const onCss = path.join(ROOT, "app/on-page-seo.css");
const onJs = path.join(ROOT, "public/tekcroft-on-page-seo.js");
const mainJs = path.join(ROOT, "public/tekcroft-main.js");

/* ── extract homepage NSR section ─────────────────────────────────────── */
const home = fs.readFileSync(homeBody, "utf8");
const nsrComment =
  "<!-- ============================================================ THE NEW SEARCH REALITY -->";
const nsrStart = home.indexOf(nsrComment);
const nsrTag = home.indexOf('<section class="sec nsr" id="ai-ecosystem"', nsrStart);
if (nsrStart < 0 || nsrTag < 0) throw new Error("homepage NSR missing");

let i = nsrTag;
let depth = 0;
let nsrEnd = -1;
while (i < home.length) {
  if (home.startsWith("<section", i)) {
    depth++;
    i = home.indexOf(">", i) + 1;
    continue;
  }
  if (home.startsWith("</section>", i)) {
    depth--;
    i += "</section>".length;
    if (depth === 0) {
      nsrEnd = i;
      break;
    }
    continue;
  }
  i++;
}
if (nsrEnd < 0) throw new Error("NSR unclosed");

let nsr = home.slice(nsrStart, nsrEnd);

/* retarget ids + keep on-page copy in the say column */
nsr = nsr
  .replace(
    nsrComment,
    "<!-- ============================================================ AI SEARCH VISIBILITY -->"
  )
  .replace(
    'id="ai-ecosystem" aria-labelledby="nsrTitle"',
    'id="ai-search" aria-labelledby="nsrTitle"'
  );

const sayStart = nsr.indexOf('<div class="nsr-say rv">');
const stageStart = nsr.indexOf('<div class="nsr-stage rv"');
if (sayStart < 0 || stageStart < 0) throw new Error("nsr-say/stage markers missing");

const onPageSay = `<div class="nsr-say rv">
        <span class="nsr-eyebrow"><i><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.4c.95 5.1 3.5 7.7 8.6 8.6-5.1.95-7.65 3.5-8.6 8.6-.95-5.1-3.5-7.65-8.6-8.6 5.1-.9 7.65-3.5 8.6-8.6Z"/></svg></i>AI search visibility</span>
        <h2 id="nsrTitle">Search Isn&rsquo;t Just Google
          <em>Anymore</em></h2>
        <p class="nsr-lede"><b>Build Pages That Show Up in Search Results and AI Answers</b></p>
        <p class="nsr-lede">Search behavior is shifting rapidly; AI Overviews now appear on roughly
          <b>48%</b> of tracked U.S, queries. These AI Overviews cause almost a <b>60%</b> drop in the
          click-through rate of organic results, as compared to searches with no AI Overview. But it
          does not mean you should give up on rankings, just that you need to compete for a different
          type of visibility.</p>
        <p class="nsr-lede">Brands that get cited in AI Overviews see <b>35%</b> more organic
          clicks and <b>91%</b> more paid clicks than brands that are not cited on the same query.
          Also, traffic from AI referrals converts at <b>4.4x</b> the rate of standard organic
          traffic.</p>

        <div class="nsr-box">
          <span class="nsr-box-ic"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.4c.95 5.1 3.5 7.7 8.6 8.6-5.1.95-7.65 3.5-8.6 8.6-.95-5.1-3.5-7.65-8.6-8.6 5.1-.9 7.65-3.5 8.6-8.6Z"/></svg></span>
          <div>
            <b>Rankings and AI citations are becoming two separate battles.</b>
            <p>Independent analysis found the share of AI Overview citations coming from pages that
              also rank in the organic top 10 fell from <b>76%</b> to <b>38%</b> in about eighteen
              months. Treat them as two separate (but connected) deliverables.</p>
          </div>
        </div>
      </div>

      `;

nsr = nsr.slice(0, sayStart) + onPageSay + nsr.slice(stageStart);

/* tuck the quick-check under the grid, still inside .wrap */
const wrapClose = nsr.lastIndexOf("</div>\n</section>");
const check = `
    <aside class="nsr-check rv" style="--d:240ms">
      <span class="nsr-check-ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8.2v4.4M12 15.8h.01"/></svg></span>
      <p><b>Quick check: is your content AI-ready?</b> Thin pages, missing schema, duplicate
        metadata, or unstructured content are the most common reasons pages get skipped by AI
        answer engines even when they rank fine in classic search.</p>
      <a class="btn btn-primary" href="#contact" data-jump>Check My Content
        <span class="arw">&uarr;</span></a>
    </aside>
`;
if (wrapClose > 0) {
  nsr = nsr.slice(0, wrapClose) + check + "\n  " + nsr.slice(wrapClose);
}

/* ── swap into on-page body ───────────────────────────────────────────── */
let body = fs.readFileSync(onBody, "utf8");
if (body.includes('id="ai-search"') && body.includes("data-nsr") && !body.includes('class="sec ai2"')) {
  console.log("body: already NSR, skipping HTML swap");
} else {
  const oldStart = body.indexOf(
    "<!-- ══════════════════════════════════════════════════════════════════\n     SEARCH ISN'T JUST GOOGLE, second cut"
  );
  const oldTag = body.indexOf('<section class="sec ai2" id="ai-search">');
  const start = oldStart >= 0 ? oldStart : oldTag;
  if (start < 0 || oldTag < 0) throw new Error("old ai-search missing");

  let j = oldTag;
  let d = 0;
  let end = -1;
  while (j < body.length) {
    if (body.startsWith("<section", j)) {
      d++;
      j = body.indexOf(">", j) + 1;
      continue;
    }
    if (body.startsWith("</section>", j)) {
      d--;
      j += "</section>".length;
      if (d === 0) {
        end = j;
        break;
      }
      continue;
    }
    j++;
  }
  if (end < 0) throw new Error("old ai-search unclosed");

  body = body.slice(0, start) + nsr.trim() + "\n\n" + body.slice(end);
  fs.writeFileSync(onBody, body);
  console.log("body: AI search → homepage NSR design");
}
/* ── CSS: copy NSR blocks from homepage, retarget #ai-ecosystem ───────── */
const cssSrc = fs.readFileSync(homeCss, "utf8");
const cssStart = cssSrc.indexOf("THE NEW SEARCH REALITY");
const cssEnd = cssSrc.indexOf("/* --- style-block-28.css --- */", cssStart);
if (cssStart < 0 || cssEnd < 0) throw new Error("NSR css range missing");
/* back up to the block comment start */
const cssBlockStart = cssSrc.lastIndexOf("/*", cssStart);

let nsrCss = cssSrc.slice(cssBlockStart, cssEnd).replace(/#ai-ecosystem/g, "#ai-search");

nsrCss += `
/* on-page quick-check strip under the NSR grid */
#ai-search .nsr-check{
  margin-top:clamp(22px,2.6vw,36px); display:flex; align-items:center; gap:clamp(14px,1.8vw,22px);
  padding:clamp(16px,1.8vw,22px) clamp(18px,2vw,26px); border-radius:20px;
  background:var(--bg-alt); border:1px solid var(--border);}
#ai-search .nsr-check-ico{display:grid; place-items:center; width:40px; height:40px; flex:none;
  border-radius:12px; background:var(--primary); color:#fff;}
#ai-search .nsr-check-ico svg{width:20px; height:20px;}
#ai-search .nsr-check p{margin:0; flex:1; font-size:clamp(13.4px,1.05vw,14.6px); line-height:1.6; color:var(--text-2);}
#ai-search .nsr-check p b{color:var(--text); font-weight:700;}
#ai-search .nsr-check .btn{flex:none;}
#ai-search .nsr-lede + .nsr-lede{margin-top:12px;}
@media (max-width:720px){
  #ai-search .nsr-check{flex-direction:column; align-items:flex-start;}
  #ai-search .nsr-check .btn{width:100%; justify-content:center;}
}
/* keep page ground rhythm (tint) over homepage surface default */
#ai-search.nsr{background:var(--bg-alt);}
`;

const marker = "/* === AI SEARCH VISIBILITY — homepage NSR design === */";
let siteCss = fs.readFileSync(onCss, "utf8");
const cut = siteCss.indexOf(marker);
if (cut >= 0) siteCss = siteCss.slice(0, cut).replace(/\s+$/, "") + "\n";
siteCss += "\n\n" + marker + "\n" + nsrCss + "\n";
fs.writeFileSync(onCss, siteCss);
console.log("css: NSR styles scoped to #ai-search");

/* ── JS: port nsr script ──────────────────────────────────────────────── */
let js = fs.readFileSync(onJs, "utf8");
const jsMarker = "/* === nsr-script (AI search visibility) === */";
if (js.includes(jsMarker)) {
  js = js.slice(0, js.indexOf(jsMarker)).replace(/\s+$/, "") + "\n";
}
const main = fs.readFileSync(mainJs, "utf8");
const jsA = main.indexOf(
  "/* --- ref script 6 --- */\n(function(){\n  var stage=document.querySelector('[data-nsr]')"
);
const jsB = main.indexOf("})();", jsA) + "})();".length;
if (jsA < 0 || jsB < 5) throw new Error("nsr script missing in main.js");
js += "\n\n" + jsMarker + "\n" + main.slice(jsA, jsB) + "\n";
fs.writeFileSync(onJs, js);
console.log("js: nsr script appended");

const checkBody = fs.readFileSync(onBody, "utf8");
if (!checkBody.includes('id="ai-search"') || !checkBody.includes("data-nsr")) {
  throw new Error("verify failed");
}
if (checkBody.includes('class="sec ai2"') || checkBody.includes("av1-grid")) {
  console.warn("STILL has old ai2/av1 markup?");
}
console.log("done");
