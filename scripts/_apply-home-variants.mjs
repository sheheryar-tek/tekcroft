import fs from "fs";
import path from "path";

const ROOT = "c:/Tekcroft";
const OUT = path.join(ROOT, "scripts/_extracted-home-variants");
const bodyPath = path.join(ROOT, "lib/homepage-body.html");
const cssPath = path.join(ROOT, "app/tekcroft.css");
const jsPath = path.join(ROOT, "public/tekcroft-main.js");

const about = fs.readFileSync(path.join(OUT, "about-all.html"), "utf8").trim();
const industries = fs.readFileSync(path.join(OUT, "industries-all.html"), "utf8").trim();
const ai = fs.readFileSync(path.join(OUT, "ai-all.html"), "utf8").trim();
const vswAb = fs.readFileSync(path.join(OUT, "vsw-about.html"), "utf8").trim();
const vswInd = fs.readFileSync(path.join(OUT, "vsw-ind.html"), "utf8").trim();

let body = fs.readFileSync(bodyPath, "utf8");

/* 1) Replace Who we are (about) through Blueprint start */
{
  const start = body.indexOf("<!-- ============================================================ WHO WE ARE -->");
  const end = body.indexOf("<!-- ============================================================ THE BLUEPRINT -->");
  if (start < 0 || end < 0) throw new Error("about markers missing");
  body =
    body.slice(0, start) +
    "<!-- ============================================================ WHO WE ARE (all variants) -->\n" +
    about +
    "\n\n" +
    body.slice(end);
  console.log("replaced about");
}

/* 2) Insert Industries after clients section, before work */
{
  const workMark = body.indexOf('<section class="sec wk" id="work">');
  if (workMark < 0) throw new Error("work section missing");
  /* avoid double-insert */
  if (!body.includes('id="industries"')) {
    body =
      body.slice(0, workMark) +
      "<!-- ============================================================ INDUSTRIES (all variants) -->\n" +
      industries +
      "\n\n" +
      body.slice(workMark);
    console.log("inserted industries");
  } else {
    console.log("industries already present — replacing block");
    const i0 = body.indexOf('<section class="sec iw" id="industries"');
    const i1 = body.indexOf('<section class="sec wk" id="work">');
    body = body.slice(0, i0) + industries + "\n\n" + body.slice(i1);
  }
}

/* 3) Replace AI sections (ai-ecosystem through end of search-split) with all 3 variants */
{
  const a0 = body.indexOf('<section class="sec ax" id="ai-ecosystem"');
  const reviewsOrFaq = body.indexOf('<section class="sec revs');
  const faq = body.indexOf('<section class="sec faq');
  const afterAi = reviewsOrFaq >= 0 ? reviewsOrFaq : faq;
  /* find end of current search-split section: next section after search-split */
  const a1 = body.indexOf('<section class="sec ', a0 + 10);
  /* better: find search-split then next section after it closes */
  let end = -1;
  if (body.includes('id="search-split-v3"')) {
    /* already has v3 — replace whole ai block until reviews/why/approach next major */
    end = body.indexOf('<section class="sec revs');
    if (end < 0) end = body.indexOf('<section class="sec faq');
  } else {
    /* current: ax then spl then possibly why already passed... order on homepage:
       why, approach, ax, spl, then faq/cta. Find start of section after spl */
    const spl = body.indexOf('<section class="sec spl" id="search-split"');
    if (spl < 0) throw new Error("search-split missing");
    /* find next <section after spl content — walk to next section tag after spl starts */
    end = body.indexOf("\n<section", spl + 1);
    if (end < 0) end = body.indexOf("<section", spl + 20);
  }
  if (a0 < 0 || end < 0) throw new Error("ai markers missing " + a0 + " " + end);
  body =
    body.slice(0, a0) +
    "<!-- ============================================================ AI / NEW SEARCH REALITY (all variants) -->\n" +
    ai +
    "\n\n" +
    body.slice(end);
  console.log("replaced ai variants");
}

/* 4) Update / add variant switchers */
{
  /* AI switcher: ensure 3 buttons */
  body = body.replace(
    /<div class="vsw"[^>]*data-vsw="ai"[\s\S]*?<\/div>/,
    `<div class="vsw" data-vsw="ai" role="group" aria-label="AI search section design">
  <span class="vsw-lab">AI search</span>
  <button type="button" data-v="1">Variant 1</button>
  <button type="button" data-v="2">Variant 2</button>
  <button type="button" data-v="3">Variant 3</button>
</div>`
  );

  if (!body.includes("vsw-ab")) {
    body = body.replace(
      /(<div class="vsw"[^>]*data-vsw="ai"[\s\S]*?<\/div>)/,
      `$1\n\n${vswAb}\n\n${vswInd}`
    );
  }
  console.log("vsw updated");
}

fs.writeFileSync(bodyPath, body);
console.log("body written", body.length);

/* 5) Append CSS from extracted style blocks (once) */
const cssMarker = "/* === home variants: about / industries / nsr (from tekcroft-home) === */";
let css = fs.readFileSync(cssPath, "utf8");
if (css.includes(cssMarker)) {
  console.log("CSS already has marker — replacing from marker to EOF of that block");
  css = css.slice(0, css.indexOf(cssMarker));
}

const styleFiles = fs
  .readdirSync(OUT)
  .filter((f) => f.startsWith("style-block-") && f.endsWith(".css"))
  .sort((a, b) => {
    const na = +a.match(/\d+/)[0];
    const nb = +b.match(/\d+/)[0];
    return na - nb;
  });

const parts = styleFiles.map((f) => `/* --- ${f} --- */\n` + fs.readFileSync(path.join(OUT, f), "utf8"));
css =
  css.trimEnd() +
  "\n\n" +
  cssMarker +
  "\n" +
  parts.join("\n\n") +
  "\n";
fs.writeFileSync(cssPath, css);
console.log("css appended", styleFiles.length, "blocks");

/* 6) Update JS: AI switcher + about + industries + counters */
let js = fs.readFileSync(jsPath, "utf8");

const aboutJs = `
/* === about variant switch === */
(function(){
  var secs={1:document.getElementById('about'),2:document.getElementById('about-v2'),3:document.getElementById('about-v3'),4:document.getElementById('about-v4'),5:document.getElementById('about-v5'),6:document.getElementById('about-v6'),7:document.getElementById('about-v7')};
  var btns=[].slice.call(document.querySelectorAll('.vsw-ab button'));
  function pick(v){
    Object.keys(secs).forEach(function(k){ if(secs[k]) secs[k].hidden=(+k!==+v); });
    btns.forEach(function(b){ var on=+b.dataset.v===+v; b.classList.toggle('on',on); b.setAttribute('aria-pressed',on); });
    try{ localStorage.setItem('tk-about-variant',v); }catch(e){}
  }
  var saved=1; try{ saved=+localStorage.getItem('tk-about-variant')||1; }catch(e){}
  btns.forEach(function(b){ b.addEventListener('click',function(){ pick(b.dataset.v); }); });
  if(btns.length) pick(saved);
})();

/* about variant counters */
(function(){
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function run(el){
    var target=parseFloat(el.getAttribute('data-count'))||0;
    var suffix=el.getAttribute('data-suffix')||'';
    if(el.dataset.done) return; el.dataset.done='1';
    if(reduce){ el.textContent=target+suffix; return; }
    var t0=null, dur=1400;
    requestAnimationFrame(function frame(t){
      if(t0===null) t0=t;
      var p=Math.min((t-t0)/dur,1), e=1-Math.pow(1-p,3);
      el.textContent=Math.round(target*e)+suffix;
      if(p<1) requestAnimationFrame(frame);
    });
  }
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ run(e.target); io.unobserve(e.target); } });
  },{threshold:.4});
  function watch(){
    document.querySelectorAll('#about [data-count], #about-v2 [data-count], #about-v3 [data-count], #about-v4 [data-count], #about-v5 [data-count], #about-v6 [data-count], #about-v7 [data-count]')
      .forEach(function(el){ if(!el.dataset.done) io.observe(el); });
  }
  watch();
  document.querySelectorAll('.vsw-ab button').forEach(function(b){
    b.addEventListener('click', function(){ setTimeout(watch, 60); });
  });
})();

/* === industries variant switch === */
(function(){
  var secs={1:document.getElementById('industries'),2:document.getElementById('industries-v2'),3:document.getElementById('industries-v3'),4:document.getElementById('industries-v4')};
  var btns=[].slice.call(document.querySelectorAll('.vsw-ind button'));
  function pick(v){
    Object.keys(secs).forEach(function(k){ if(secs[k]) secs[k].hidden=(+k!==+v); });
    btns.forEach(function(b){ var on=+b.dataset.v===+v; b.classList.toggle('on',on); b.setAttribute('aria-pressed',on); });
    try{ localStorage.setItem('tk-ind-variant',v); }catch(e){}
  }
  var saved=1; try{ saved=+localStorage.getItem('tk-ind-variant')||1; }catch(e){}
  btns.forEach(function(b){ b.addEventListener('click',function(){ pick(b.dataset.v); }); });
  if(btns.length) pick(saved);
})();
`;

/* Replace AI switcher to include v3 */
const aiSwitchNew = `/* === ai variant switch === */
(function(){
  var secs={1:document.getElementById('ai-ecosystem'), 2:document.getElementById('search-split'), 3:document.getElementById('search-split-v3')};
  var btns=[].slice.call(document.querySelectorAll('.vsw[data-vsw="ai"] button'));
  function pick(v){
    Object.keys(secs).forEach(function(k){ if(secs[k]) secs[k].hidden = (+k !== +v); });
    btns.forEach(function(b){ var on = +b.dataset.v === +v;
      b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
    try{ localStorage.setItem('tk-ai-variant', v); }catch(e){}
    window.dispatchEvent(new Event('resize'));
  }
  var saved=1; try{ saved = +localStorage.getItem('tk-ai-variant') || 1; }catch(e){}
  btns.forEach(function(b){ b.addEventListener('click', function(){ pick(b.dataset.v); }); });
  pick(saved);
})();
`;

if (js.includes("/* === ai variant switch === */")) {
  js = js.replace(/\/\* === ai variant switch === \*\/[\s\S]*?\}\)\(\);\s*$/, aiSwitchNew);
} else {
  js += "\n" + aiSwitchNew;
}

if (!js.includes("/* === about variant switch === */")) {
  js += "\n" + aboutJs;
} else {
  /* replace existing about/ind blocks if re-run */
  js = js.replace(/\/\* === about variant switch === \*\/[\s\S]*\/\* === industries variant switch === \*\/[\s\S]*?\}\)\(\);\s*/, aboutJs);
}

fs.writeFileSync(jsPath, js);
console.log("js updated", js.length);
console.log("done");
