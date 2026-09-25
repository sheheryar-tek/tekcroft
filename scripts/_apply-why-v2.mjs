import fs from "fs";
import path from "path";

const ROOT = "c:\\Tekcroft";

function renameLn(s) {
  return s
    .replace(/\bln-area\b/g, "wyln-area")
    .replace(/\bln-line\b/g, "wyln-line")
    .replace(/\bln-x\b/g, "wyln-x")
    .replace(/\bln-y\b/g, "wyln-y")
    .replace(/\bln-d\b/g, "wyln-d")
    .replace(/class="ln"/g, 'class="wyln"')
    .replace(/\.ln\{/g, ".wyln{")
    .replace(/\.ln,/g, ".wyln,");
}

/** Strip comments, then prefix every selector with #why-v2 (handles @media). */
function scopeCss(css) {
  css = css.replace(/\/\*[\s\S]*?\*\//g, "");

  function scopeSelectorList(sel) {
    return sel
      .split(",")
      .map((part) => {
        const t = part.trim();
        if (!t) return part;
        if (t.startsWith("#why-v2")) return t;
        return `#why-v2 ${t}`;
      })
      .join(", ");
  }

  function scopeBlock(block) {
    let out = "";
    let i = 0;
    while (i < block.length) {
      while (i < block.length && /\s/.test(block[i])) {
        out += block[i++];
      }
      if (i >= block.length) break;

      if (block[i] === "@") {
        const brace = block.indexOf("{", i);
        if (brace === -1) {
          out += block.slice(i);
          break;
        }
        out += block.slice(i, brace + 1);
        i = brace + 1;
        let depth = 1;
        const start = i;
        while (i < block.length && depth > 0) {
          if (block[i] === "{") depth++;
          else if (block[i] === "}") depth--;
          i++;
        }
        out += scopeBlock(block.slice(start, i - 1)) + "}";
        continue;
      }

      const brace = block.indexOf("{", i);
      if (brace === -1) {
        out += block.slice(i);
        break;
      }
      const sel = block.slice(i, brace);
      out += scopeSelectorList(sel) + "{";
      i = brace + 1;
      let depth = 1;
      const start = i;
      while (i < block.length && depth > 0) {
        if (block[i] === "{") depth++;
        else if (block[i] === "}") depth--;
        i++;
      }
      out += block.slice(start, i - 1) + "}";
    }
    return out;
  }

  return scopeBlock(css);
}

let sec = fs.readFileSync(path.join(ROOT, "scripts/_why-v2-sec.html"), "utf8");
sec = renameLn(sec);
sec = sec.replace(
  '<section class="sec wy" id="whyus">',
  '<section class="sec wy" id="why-v2" data-why-variant="2">'
);
// Match existing homepage why-copy casing
sec = sec
  .replace(
    "Why Businesses Choose Tekcroft For <em>Digital Marketing</em>",
    "Why Businesses Choose Tekcroft for <em>Digital Marketing</em>"
  )
  .replace(/Built For Search And AI Together/g, "Built for Search and AI Together");

let css = renameLn(
  fs.readFileSync(path.join(ROOT, "scripts/_why-v2-css.css"), "utf8")
);
css = scopeCss(css);
// Section root is #why-v2.wy — descendant "#why-v2 .wy" would never match
css = css.replace(/#why-v2\s+\.wy\{/g, "#why-v2.wy{");
css = `#why-v2{background:var(--bg-alt); --wy-w:100%;}\n` + css;
css = css.replace(/--wy-w:min\(100%,\s*780px\)/g, "--wy-w:100%");

const vswCss = `
/* review aid: why-choose-us variant switch */
.vsw{position:fixed; left:50%; bottom:18px; transform:translateX(-50%); z-index:60;
  display:flex; align-items:center; gap:4px; padding:6px; border-radius:99px;
  background:rgba(16,24,40,.92); box-shadow:0 18px 40px -20px rgba(8,20,40,.7);
  backdrop-filter:blur(8px);}
.vsw-lab{padding:0 10px 0 12px; font-size:11px; font-weight:700; letter-spacing:.08em;
  text-transform:uppercase; color:rgba(255,255,255,.6);}
.vsw button{border:0; border-radius:99px; padding:8px 14px; font:inherit; font-size:12.5px;
  font-weight:700; cursor:pointer; background:transparent; color:rgba(255,255,255,.75);}
.vsw button.on{background:var(--primary); color:#fff;}
.vsw button:focus-visible{outline:2px solid var(--primary); outline-offset:2px;}
[data-why-variant][hidden]{display:none !important;}
@media print{ .vsw{display:none;} }
`;

const jsTabs = `
/* === why-v2 tabs (scoped) === */
(function(){
  "use strict";
  var box = document.querySelector("#why-v2 [data-tabs]");
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

  var root = document.getElementById("why-v2");
  if (root) {
    var io = new IntersectionObserver(function(en){
      en.forEach(function(x){
        if (x.isIntersecting){ x.target.classList.add("in"); io.unobserve(x.target); }
      });
    }, { threshold:0, rootMargin:"0px 0px -70px 0px" });
    Array.prototype.slice.call(root.querySelectorAll(".rv")).forEach(function(el){
      io.observe(el);
    });
    requestAnimationFrame(function(){
      Array.prototype.slice.call(root.querySelectorAll(".rv")).forEach(function(el){
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("in");
      });
    });
  }
})();
`;

const jsSwitch = `
/* === why variant switch === */
(function(){
  var secs={1:document.getElementById('why'), 2:document.getElementById('why-v2')};
  var btns=[].slice.call(document.querySelectorAll('.vsw button'));
  function pick(v){
    Object.keys(secs).forEach(function(k){ if(secs[k]) secs[k].hidden = (+k !== +v); });
    btns.forEach(function(b){ var on = +b.dataset.v === +v;
      b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
    try{ localStorage.setItem('tk-why-variant', v); }catch(e){}
  }
  var saved=1; try{ saved = +localStorage.getItem('tk-why-variant') || 1; }catch(e){}
  btns.forEach(function(b){ b.addEventListener('click', function(){ pick(b.dataset.v); }); });
  pick(saved);
})();
`;

const vswHtml = `
<!-- review aid: switch between the two "why choose us" designs -->
<div class="vsw" role="group" aria-label="Why choose us section design">
  <span class="vsw-lab">Why choose us</span>
  <button type="button" data-v="1">Variant 1</button>
  <button type="button" data-v="2">Variant 2</button>
</div>
`;

let body = fs.readFileSync(path.join(ROOT, "lib/homepage-body.html"), "utf8");
if (!body.includes('data-why-variant="1"')) {
  body = body.replace(
    '<section class="sec why" id="why">',
    '<section class="sec why" id="why" data-why-variant="1">'
  );
}
if (!body.includes('id="why-v2"')) {
  // CRLF-safe: insert after #why section close, before invitation / approach
  const whyOpen = body.indexOf('id="why"');
  if (whyOpen < 0) throw new Error("#why not found");
  const whyTag = body.lastIndexOf("<section", whyOpen);
  // Find matching </section> for #why (no nested sections inside)
  const whyClose = body.indexOf("</section>", whyOpen);
  if (whyClose < 0) throw new Error("#why close not found");
  const insertAt = whyClose + "</section>".length;
  body =
    body.slice(0, insertAt) +
    "\n\n" +
    sec.trim() +
    "\n" +
    body.slice(insertAt);
}
if (!body.includes('class="vsw"')) {
  body += "\n" + vswHtml + "\n";
}
fs.writeFileSync(path.join(ROOT, "lib/homepage-body.html"), body);

const cssPath = path.join(ROOT, "app/tekcroft.css");
let siteCss = fs.readFileSync(cssPath, "utf8");
// Remove a previous broken append if present
const marker = "WHY CHOOSE US V2 — homepage variant";
const cut = siteCss.indexOf(marker);
if (cut >= 0) {
  const start = siteCss.lastIndexOf("/*", cut);
  siteCss = siteCss.slice(0, start).replace(/\s+$/, "");
}
siteCss +=
  `\n\n/* ══════════════════════════════════════════════════════════════════════\n` +
  `   WHY CHOOSE US V2 — homepage variant (scoped to #why-v2)\n` +
  `   ══════════════════════════════════════════════════════════════════════ */\n` +
  css +
  "\n" +
  vswCss;
fs.writeFileSync(cssPath, siteCss);

const jsPath = path.join(ROOT, "public/tekcroft-main.js");
let mainJs = fs.readFileSync(jsPath, "utf8");
if (!mainJs.includes("why-v2 tabs")) {
  mainJs += "\n" + jsTabs + "\n" + jsSwitch + "\n";
  fs.writeFileSync(jsPath, mainJs);
}

console.log("OK");
console.log("why-v2:", body.includes('id="why-v2"'));
console.log("v1 attr:", body.includes('data-why-variant="1"'));
console.log("vsw:", body.includes('class="vsw"'));
console.log("wyln css:", siteCss.includes("#why-v2 .wyln{") || siteCss.includes("#why-v2 .wyln "));
console.log("wy-rail scoped:", siteCss.includes("#why-v2 .wy-rail"));
console.log("wy scoped:", siteCss.includes("#why-v2 .wy{") || /#why-v2\s+\.wy\{/.test(siteCss));
console.log("bare .wy-rail:", /(?:^|})\s*\.wy-rail\{/.test(siteCss.replace(/#why-v2\s+\.wy-rail/g, "")));
console.log("comment mangled:", /#why-v2\s+\/\*/.test(siteCss));
