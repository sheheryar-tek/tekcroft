import fs from "fs";

const bodyPath = "c:/Tekcroft/lib/homepage-body.html";
const jsPath = "c:/Tekcroft/public/tekcroft-main.js";
const cssPath = "c:/Tekcroft/app/tekcroft.css";
const ref = "c:/Users/Super/Downloads/tekcroft-home (5).html";

let body = fs.readFileSync(bodyPath, "utf8");

/* Extract about-v7 section */
const v7Start = body.indexOf('<!-- ══════════ WHO WE ARE · variant 7');
const v7Tag = body.indexOf('<section class="sec cvv" id="about-v7"', v7Start);
const afterV7 = body.indexOf("<!-- ============================================================ SERVICES -->", v7Tag);
if (v7Start < 0 || v7Tag < 0 || afterV7 < 0) {
  throw new Error("v7 markers missing");
}

/* find end of v7 section */
let i = v7Tag;
let depth = 0;
let v7End = -1;
while (i < body.length) {
  if (body.startsWith("<section", i)) {
    depth++;
    i = body.indexOf(">", i) + 1;
    continue;
  }
  if (body.startsWith("</section>", i)) {
    depth--;
    i += "</section>".length;
    if (depth === 0) {
      v7End = i;
      break;
    }
    continue;
  }
  i++;
}
if (v7End < 0) throw new Error("v7 unclosed");

let v7 = body.slice(v7Start, v7End);
/* promote to main about id */
v7 = v7
  .replace('id="about-v7" data-about-variant="7"', 'id="about"')
  .replace(
    "<!-- ══════════ WHO WE ARE · variant 7 (the ribbon across, pictures above) ══════════ -->",
    "<!-- ============================================================ WHO WE ARE -->"
  );

/* Find start of all about variants (first about section / comment) */
const aboutBlockStart = body.indexOf(
  "<!-- ============================================================ WHO WE ARE (all variants) -->"
);
const aboutBlockStartAlt = body.indexOf(
  "<!-- ============================================================ WHO WE ARE -->"
);
const start = aboutBlockStart >= 0 ? aboutBlockStart : aboutBlockStartAlt;
if (start < 0) throw new Error("about block start missing");

body = body.slice(0, start) + v7 + "\n\n\n" + body.slice(afterV7);

/* Remove Who we are variant switcher */
body = body.replace(
  /\n*<div class="vsw vsw-ab"[\s\S]*?<\/div>\n*/,
  "\n"
);

fs.writeFileSync(bodyPath, body);
console.log("body: kept about v7 as #about");

/* JS: remove about variant switch; keep counters for #about; add ribbon script */
let js = fs.readFileSync(jsPath, "utf8");
js = js.replace(
  /\/\* === about variant switch === \*\/[\s\S]*?\/\* === industries variant switch === \*\//,
  `/* about counters */
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
  document.querySelectorAll('#about [data-count]').forEach(function(el){ io.observe(el); });
})();

/* === industries variant switch === */`
);

/* Add ribbon behavior if missing */
if (!js.includes("[data-ribbon]")) {
  const html = fs.readFileSync(ref, "utf8");
  const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  const ribbon = scripts.find((s) => s.includes("[data-ribbon]"));
  if (!ribbon) throw new Error("ribbon script missing in ref");
  js += "\n\n/* === about ribbon === */\n" + ribbon.trim() + "\n";
  console.log("added ribbon script");
}

fs.writeFileSync(jsPath, js);
console.log("js updated");

/* CSS: retarget #about-v7 rules to #about */
let css = fs.readFileSync(cssPath, "utf8");
css = css.replace(/#about-v7/g, "#about");
fs.writeFileSync(cssPath, css);
console.log("css #about-v7 -> #about");

/* Verify */
const check = fs.readFileSync(bodyPath, "utf8");
for (const id of ["about-v2", "about-v3", "about-v4", "about-v5", "about-v6", "about-v7", "vsw-ab"]) {
  if (check.includes(id)) console.warn("STILL PRESENT:", id);
}
if (!check.includes('id="about"')) throw new Error("about id missing");
console.log("done");
