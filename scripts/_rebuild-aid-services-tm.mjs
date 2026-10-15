/**
 * Rebuild AI Development #services-2 as expanding .tm panels (AIS #model pattern).
 * Photos go on .tm-bg as background-image; original ax-g UI cards go in .tm-viz.
 */
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BODY = path.join(ROOT, "lib", "ai-development-body.html");
const CSS = path.join(ROOT, "app", "ai-development.css");
const JS = path.join(ROOT, "public", "tekcroft-ai-development.js");
const MANIFEST = path.join(ROOT, "lib", "asset-manifest.json");

const IMAGES = [
  "/images/aid-svc-01-64df786e82.webp",
  "/images/aid-svc-02-da282a1d7c.webp",
  "/images/aid-svc-03-f9debcc789.webp",
  "/images/aid-svc-04-3b35dd4168.webp",
  "/images/aid-svc-05-8087b153d6.webp",
  "/images/aid-svc-06-71e32606a9.webp",
  "/images/aid-svc-07-7866d5642c.webp",
  "/images/aid-svc-08-72f01b60d1.webp",
];

const HEAD = execSync("git show HEAD:lib/ai-development-body.html", {
  encoding: "utf8",
  maxBuffer: 20e6,
  cwd: ROOT,
});

function extractAxG(html) {
  const section = html.match(
    /<section class="sec svc-cn" id="services-2">[\s\S]*?<\/section>/
  );
  if (!section) throw new Error("services-2 not in HEAD");
  const out = [];
  const re =
    /data-i="(\d+)"[\s\S]*?<div class="ax-g">([\s\S]*?)<\/div>\s*<\/div>\s*<span class="ax-prog"/g;
  let m;
  while ((m = re.exec(section[0]))) {
    out[+m[1]] = `<div class="ax-g">${m[2]}</div>`;
  }
  if (out.filter(Boolean).length !== 8) {
    throw new Error("expected 8 ax-g blocks, got " + out.filter(Boolean).length);
  }
  return out;
}

function extractPanels(currentHtml) {
  const section = currentHtml.match(
    /<section class="sec svc-cn" id="services-2">[\s\S]*?<\/section>/
  );
  if (!section) throw new Error("services-2 missing in current body");
  const panels = [];
  const re =
    /<div class="ax-p[^"]*"[^>]*data-i="(\d+)"[^>]*>[\s\S]*?<span class="ax-lab">([\s\S]*?)<\/span>[\s\S]*?<span class="ax-ico">([\s\S]*?)<\/span>[\s\S]*?<h3>([\s\S]*?)<\/h3>\s*<p>([\s\S]*?)<\/p>([\s\S]*?)<span class="ax-pill"><i><\/i>([\s\S]*?)<\/span>/g;
  let m;
  while ((m = re.exec(section[0]))) {
    const linkMatch = m[6].match(/<a class="ax-lk"[^>]*>[\s\S]*?<\/a>/);
    panels[+m[1]] = {
      i: +m[1],
      lab: m[2].trim(),
      ico: m[3].trim(),
      h3: m[4].trim(),
      p: m[5].trim(),
      link: linkMatch ? linkMatch[0] : "",
      pill: m[7].trim(),
    };
  }
  if (panels.filter(Boolean).length !== 8) {
    throw new Error("expected 8 panels, got " + panels.filter(Boolean).length);
  }
  return panels;
}

const axG = extractAxG(HEAD);
let html = fs.readFileSync(BODY, "utf8");
const panels = extractPanels(html);

function n(i) {
  return String(i + 1).padStart(2, "0");
}

const items = panels
  .map((p) => {
    const on = p.i === 0 ? " on" : "";
    const sel = p.i === 0 ? "true" : "false";
    const link = p.link
      ? `\n              ${p.link}`
      : "";
    return `        <div class="tm-item${on}" data-i="${p.i}" role="tab" tabindex="0" aria-selected="${sel}">
          <span class="tm-bg" aria-hidden="true"><span class="tm-veil"></span></span>
          <span class="tm-slim" aria-hidden="true"><b class="tm-n">${n(p.i)}</b><span class="tm-vt">${p.lab}</span></span>
          <div class="tm-open">
            <div class="tm-card">
              <span class="tm-card-top"><span class="tm-ic">${p.ico}</span><span class="tm-num">${n(p.i)}</span></span>
              <h3>${p.h3}</h3>
              <p>${p.p}</p>${link}
              <span class="tm-chip"><i></i>${p.pill}</span>
            </div>
            <div class="tm-viz">${axG[p.i]}</div>
          </div>
        </div>`;
  })
  .join("\n");

const newSection = `<section class="sec tm" id="services-2">
  <div class="wrap">
    <div class="tm-head rv">
      <div>
        <span class="smark"><b>What we do</b></span>
        <h2>Our AI Development <em>Expertise</em></h2>
      </div>
      <p class="ax-lede">Tekcroft works across the full AI stack, from strategy through deployment. Every engagement starts with the data you provide.</p>
    </div>
    <div class="tm-rail" role="tablist" aria-label="AI development services" data-tm style="--tm-n:8">
${items}
    </div>
    <div class="tm-cta rv"><a class="btn btn-primary btn-lg" href="#contact">See Which Services Fit Best <span class="arw">&uarr;</span></a></div>
  </div>
</section>`;

const replaced = html.replace(
  /<section class="sec svc-cn" id="services-2">[\s\S]*?<\/section>/,
  newSection
);
if (replaced === html) throw new Error("section replace failed");
fs.writeFileSync(BODY, replaced);
console.log("body updated");

/* ---- CSS: ensure #services-2 uses tm panel chrome + per-panel bg photos ---- */
let css = fs.readFileSync(CSS, "utf8");
const marker = "/* AID #services-2 expanding panels (tm / AIS #model pattern) */";
const bgRules = IMAGES.map(
  (src, i) =>
    `#services-2 .tm-item[data-i="${i}"] .tm-bg{background-image:url("${src}");}`
).join("\n");

const cssBlock = `
${marker}
#services-2.tm{padding-block:clamp(36px,4vw,58px); background:var(--surface);}
html[data-theme="dark"] #services-2.tm{background:var(--bg-alt);}
#services-2 .tm-rail{display:flex; gap:7px; height:clamp(390px,40vw,500px);}
#services-2 .tm-item{position:relative; flex-grow:0; flex-shrink:0; min-width:0; overflow:hidden; cursor:pointer;
  border-radius:18px; border:1px solid var(--border); background:var(--surface);
  transition:border-color .4s var(--ease), box-shadow .4s var(--ease);}
#services-2 .tm-item.on{min-width:0; border-color:#0A0C0E;
  box-shadow:0 30px 60px -34px rgba(4,12,20,.9);}
#services-2 .tm-item:hover:not(.on){border-color:hsl(var(--brand-h) 70% 78%); background:hsl(var(--brand-h) 85% 97%);}
#services-2 .tm-item:focus-visible{outline:2px solid var(--primary); outline-offset:2px;}
#services-2 .tm-bg{position:absolute; inset:0; opacity:0; transition:opacity .55s var(--ease) .05s;
  background-position:center; background-size:cover; background-repeat:no-repeat;}
${bgRules}
#services-2 .tm-item.on .tm-bg{opacity:1;}
#services-2 .tm-veil{position:absolute; inset:0; background:rgba(0,0,0,.78);}
#services-2 .tm-slim{position:absolute; inset:0; display:flex; flex-direction:column; align-items:center;
  padding:18px 0; transition:opacity .3s var(--ease); z-index:1;}
#services-2 .tm-item.on .tm-slim{opacity:0; pointer-events:none;}
#services-2 .tm-n{font-family:var(--font-display); font-size:12px; font-weight:800; letter-spacing:.04em; color:var(--brand-text);}
#services-2 .tm-vt{margin-top:auto; writing-mode:vertical-rl; transform:rotate(180deg);
  font-family:var(--font-display); font-size:12.8px; font-weight:700; letter-spacing:-.02em;
  color:var(--text-2); white-space:nowrap; max-height:calc(100% - 40px); overflow:hidden; text-overflow:ellipsis;}
#services-2 .tm-item:hover .tm-vt{color:var(--brand-text);}
#services-2 .tm-open{position:absolute; inset:0; z-index:2; display:flex; align-items:center; gap:clamp(14px,1.8vw,26px);
  padding:clamp(18px,2vw,26px); opacity:0; transform:translateY(10px);
  transition:opacity .42s var(--ease) .16s, transform .42s var(--ease) .16s;}
#services-2 .tm-item.on .tm-open{opacity:1; transform:none;}
#services-2 .tm-card{width:min(100%,430px); padding:clamp(18px,1.9vw,24px); border-radius:20px; background:#fff;
  border:1px solid rgba(255,255,255,.6); box-shadow:0 30px 60px -34px rgba(3,14,24,.9);
  max-height:100%; overflow:auto; scrollbar-width:thin;}
html[data-theme="dark"] #services-2 .tm-card{background:var(--surface); border-color:var(--border);}
#services-2 .tm-card-top{display:flex; align-items:center; gap:11px; margin-bottom:12px;}
#services-2 .tm-ic{display:grid; place-items:center; width:40px; height:40px; border-radius:12px;
  background:var(--primary); color:#fff; flex:none;}
#services-2 .tm-ic svg{width:19px; height:19px;}
#services-2 .tm-num{font-family:var(--font-display); font-size:12.5px; font-weight:800; letter-spacing:.1em;
  color:var(--brand-text);}
#services-2 .tm-card h3{margin:0 0 8px; font-family:var(--font-display); font-size:clamp(17px,1.6vw,21px);
  font-weight:800; letter-spacing:-.03em; line-height:1.25; color:var(--text); text-transform:none;}
#services-2 .tm-card p{margin:0 0 14px; font-size:clamp(12.8px,1.02vw,14px); line-height:1.6; color:var(--text-2);}
#services-2 .tm-card .ax-lk{display:inline-flex; align-items:center; gap:6px; margin:0 0 14px;
  font-size:13px; font-weight:700; color:var(--brand-text); text-decoration:none;}
#services-2 .tm-card .ax-lk:hover{text-decoration:underline;}
#services-2 .tm-chip{display:inline-flex; align-items:center; gap:8px; padding:6px 13px; border-radius:99px;
  background:hsl(var(--brand-h) 85% 95%); border:1px solid hsl(var(--brand-h) 70% 84%);
  color:var(--brand-text); font-size:11.5px; font-weight:700;}
html[data-theme="dark"] #services-2 .tm-chip{background:hsl(var(--brand-h) 40% 18%);}
#services-2 .tm-chip i{width:6px; height:6px; border-radius:50%; background:var(--primary);}
#services-2 .tm-viz{flex:1 1 0; min-width:0; display:grid; place-items:center; align-self:center;}
#services-2 .tm-viz .ax-g{display:block; width:min(100%,310px); margin:0; flex:none;
  background:rgba(255,255,255,.93); color:#142033;
  border-radius:22px; padding:18px 18px 14px; box-shadow:0 20px 44px -28px rgba(0,0,0,.45);}
html[data-theme="dark"] #services-2 .tm-viz .ax-g{background:var(--surface); color:var(--text); border:1px solid var(--border);}
#services-2 .tm-prog{position:absolute; left:0; bottom:0; height:3px; width:0; z-index:3; background:#fff;}
#services-2 .tm-item.on .tm-prog{animation:tmProg 6s linear forwards;}
#services-2 [data-tm].paused .tm-item.on .tm-prog{animation-play-state:paused;}
@keyframes tmProg{from{width:0;} to{width:100%;}}
@media (max-width:980px){
  #services-2 .tm-rail{flex-direction:column; height:auto;}
  #services-2 .tm-item{flex:0 0 auto; min-width:0; height:56px; border-radius:15px;
    transition:height .5s var(--ease), border-color .4s var(--ease);}
  #services-2 .tm-item.on{flex:0 0 auto; min-width:0; height:auto; min-height:300px;}
  #services-2 .tm-slim{flex-direction:row; align-items:center; justify-content:flex-start; gap:14px; padding:0 18px;}
  #services-2 .tm-vt{margin-top:0; writing-mode:horizontal-tb; transform:none; font-size:13.4px; max-height:none;}
  #services-2 .tm-open{position:relative; inset:auto; padding:16px; flex-direction:column; align-items:stretch;}
  #services-2 .tm-card{width:100%; max-height:none; overflow:visible;}
  #services-2 .tm-viz{align-self:stretch; width:100%; margin-top:12px;}
  #services-2 .tm-viz .ax-g{display:block; width:100%; max-width:none; box-sizing:border-box;}
}
@media (prefers-reduced-motion:reduce){
  #services-2 .tm-item,#services-2 .tm-open,#services-2 .tm-bg{transition:none;}
  #services-2 .tm-item.on .tm-prog{animation:none; width:100%;}
}
`;

if (css.includes(marker)) {
  css = css.replace(
    /\/\* AID #services-2 expanding panels[\s\S]*?(?=\n\/\* [A-Z]|\nhtml body|$)/,
    cssBlock.trim() + "\n\n"
  );
} else {
  // Remove prior ax-pic block if present
  css = css.replace(/\/\* AID services panel photos[\s\S]*?(?=\n\/\*|\nhtml body|\n#|\n@media|$)/, "");
  css += "\n" + cssBlock;
}
fs.writeFileSync(CSS, css);
console.log("css updated");

/* ---- JS: append tm-script if missing; disable old #ax accordion if present ---- */
let js = fs.readFileSync(JS, "utf8");
const tmMarker = "/* === aid-services-tm-script === */";
const tmScript = `
${tmMarker}
(function(){
  var rail=document.querySelector('#services-2 [data-tm]'); if(!rail) return;
  var items=[].slice.call(rail.querySelectorAll('.tm-item'));
  items.forEach(function(el){ var b=document.createElement('span'); b.className='tm-prog';
    b.setAttribute('aria-hidden','true'); el.appendChild(b); });
  var at=0, timer=null, held=false;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function show(i){
    at=(i+items.length)%items.length;
    items.forEach(function(el,k){ var on=k===at; el.classList.toggle('on',on);
      el.setAttribute('aria-selected',String(on));
      if(on){ var b=el.querySelector('.tm-prog'); if(b){ b.style.animation='none'; void b.offsetWidth; b.style.animation=''; } }
    });
  }
  function play(){ stop(); rail.classList.remove('paused'); if(!held && !reduce) timer=setInterval(function(){ show(at+1); },6000); }
  function stop(){ clearInterval(timer); }
  function hold(){ held=true; stop(); rail.classList.add('paused'); clearTimeout(hold._t);
    hold._t=setTimeout(function(){ held=false; play(); },12000); }
  items.forEach(function(el,i){
    el.addEventListener('mouseenter',function(){ show(i); });
    el.addEventListener('click',function(){ hold(); show(i); });
    el.addEventListener('keydown',function(e){
      if(e.key==='Enter'||e.key===' '){ e.preventDefault(); hold(); show(i); return; }
      var to = e.key==='ArrowRight'||e.key==='ArrowDown' ? i+1 : e.key==='ArrowLeft'||e.key==='ArrowUp' ? i-1 : -1;
      if(to<0||to>=items.length) return;
      e.preventDefault(); items[to].focus(); hold(); show(to);
    });
  });
  rail.addEventListener('mouseenter',function(){ stop(); rail.classList.add('paused'); });
  rail.addEventListener('mouseleave',function(){ rail.classList.remove('paused'); if(!held) play(); });
  show(0);
  var io=new IntersectionObserver(function(es){ es.forEach(function(e){ e.isIntersecting ? play() : stop(); }); },{threshold:.25});
  io.observe(rail);
})();
`;

if (js.includes(tmMarker)) {
  js = js.replace(/\/\* === aid-services-tm-script === \*\/[\s\S]*?(?=\n\/\* === |\n$)/, tmScript.trim() + "\n\n");
} else {
  js += "\n" + tmScript;
}

// Guard old ax accordion so it no-ops if #ax is gone
js = js.replace(
  /var box\s*=\s*document\.getElementById\(['"]ax['"]\);/,
  "var box=document.getElementById('ax'); if(!box){ /* services-2 now uses tm-rail */ }"
);
// Better: find the ax IIFE and make it return early
if (js.includes("querySelectorAll(\".ax-p\")") && !js.includes("/* ax panels retired")) {
  js = js.replace(
    /(var box\s*=\s*document\.getElementById\(['"]ax['"]\)[^;]*;)/,
    "$1 if(!box) return; /* ax panels retired */"
  );
}

fs.writeFileSync(JS, js);
console.log("js updated");

// Also update hashed copy if asset-manifest points elsewhere
try {
  const man = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
  if (man.aiDevelopment && man.aiDevelopment !== "/tekcroft-ai-development.js") {
    const hashed = path.join(ROOT, "public", path.basename(man.aiDevelopment));
    if (fs.existsSync(hashed) || true) {
      fs.writeFileSync(hashed, js);
      console.log("wrote hashed", man.aiDevelopment);
    }
  }
} catch (_) {}

console.log("done");
