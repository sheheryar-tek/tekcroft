import fs from "fs";

const cssPath = "app/custom-software-development.css";
let css = fs.readFileSync(cssPath, "utf8");
const lock = css.indexOf("/* === SITE CONSISTENCY LOCK");
if (lock < 0) throw new Error("lock not found");
if (!css.includes("/* === software why (homepage tabbed design) === */")) {
  const block = `
/* === software why (homepage tabbed design) === */
#why{background:var(--ground);}
#why .wy-say h2{max-width:32ch;}
#why .wy-say > p{margin:clamp(12px,1.4vw,18px) auto 0; max-width:62ch;
  font-size:var(--body); line-height:1.7; color:var(--text-2);}
#why .wy-cta{display:flex; flex-wrap:wrap; align-items:center; justify-content:center;
  gap:clamp(12px,1.6vw,20px); margin-top:clamp(4px,.6vw,8px); text-align:center;}
#why .wy-cta p{margin:0; max-width:62ch; font-size:clamp(15px,1.2vw,17px);
  line-height:1.65; color:var(--text-2);}
@media (max-width:1180px){
  #why .wy-rail{grid-auto-flow:row; grid-auto-columns:auto;}
  #why .wy-tab{text-align:left;}
}
@media (max-width:980px){
  #why .wy-cta{flex-direction:column;}
}

`;
  css = css.slice(0, lock) + block + css.slice(lock);
  fs.writeFileSync(cssPath, css);
  console.log("css ok");
} else {
  console.log("css already present");
}

const jsPath = "public/tekcroft-custom-software-development.js";
let js = fs.readFileSync(jsPath, "utf8");
const marker = "/* === wc-script === */";
const i = js.indexOf(marker);
if (i < 0) throw new Error("wc-script not found");
if (!js.includes("/* === why-v2 tabs (software) === */")) {
  const whyJs = `/* === why-v2 tabs (software) === */
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
  js = js.slice(0, i) + whyJs + js.slice(i);
  fs.writeFileSync(jsPath, js);
  console.log("js ok");
} else {
  console.log("js already present");
}
