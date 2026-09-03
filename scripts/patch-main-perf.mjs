/**
 * Patch tekcroft-main.js for smoother scrolling without changing behavior:
 * - Cache work-rail geometry (avoid layout thrash on every scroll frame)
 * - Only toggle .on when the active card changes
 * - Pause work autoplay when off-screen
 * - Pause infinite CSS animations when their hosts leave the viewport
 * - Coalesce resize handlers
 * - Don't block boot on font loading as long
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = path.join(ROOT, "public", "tekcroft-main.js");
let js = fs.readFileSync(file, "utf8");

if (js.includes("/* PERF_PATCHED */")) {
  console.log("Already patched");
  process.exit(0);
}

// 1) Faster boot: don't wait on fonts; start sooner
js = js.replace(
  `var ready = document.fonts && document.fonts.ready
      ? document.fonts.ready : Promise.resolve();
    var started = false;

    function runBoot(){
      if (started) return;
      started = true;`,
  `var started = false;

    function runBoot(){
      if (started) return;
      started = true;`
);
js = js.replace(
  `ready.then(runBoot);
    setTimeout(runBoot, 1200);          /* fonts never resolved — go anyway */
    setTimeout(function(){              /* last resort: never trap the page */
      if (document.body.classList.contains("booting")) skipBoot();
    }, 4500);`,
  `/* PERF: start boot on next frame — do not gate first paint on webfonts */
    requestAnimationFrame(function(){ requestAnimationFrame(runBoot); });
    setTimeout(runBoot, 400);
    setTimeout(function(){
      if (document.body.classList.contains("booting")) skipBoot();
    }, 2800);`
);

// 2) Replace work-deck sync/measure with cached geometry version
const oldSyncBlock = `    function sync(){
      var mid = rail.scrollLeft + rail.clientWidth / 2, i = 0, near = Infinity;

      all.forEach(function(c, k){
        var d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid);
        if (d < near){ near = d; i = k; }
      });
      all.forEach(function(c, k){ c.classList.toggle("on", k === i); });
      /* the copies report the number of the sheet they are a copy of */
      var real = ((i % n) + n) % n;
      at.textContent = ("0" + (real + 1)).slice(-2);
      bar.style.width = ((real + 1) / n * 100) + "%";
    }`;

const newSyncBlock = `    /* PERF: cache card centers; only mutate DOM when active index changes */
    var centers = [];
    var lastOn = -1;
    function measureCenters(){
      centers = all.map(function(c){ return c.offsetLeft + c.offsetWidth / 2; });
    }
    function sync(){
      if (!centers.length) measureCenters();
      var mid = rail.scrollLeft + rail.clientWidth / 2, i = 0, near = Infinity;
      for (var k = 0; k < centers.length; k++){
        var d = Math.abs(centers[k] - mid);
        if (d < near){ near = d; i = k; }
      }
      if (i !== lastOn){
        if (lastOn >= 0 && all[lastOn]) all[lastOn].classList.remove("on");
        if (all[i]) all[i].classList.add("on");
        lastOn = i;
      }
      var real = ((i % n) + n) % n;
      at.textContent = ("0" + (real + 1)).slice(-2);
      bar.style.width = ((real + 1) / n * 100) + "%";
    }`;

if (!js.includes(oldSyncBlock)) {
  console.error("Could not find sync() block to patch");
  process.exit(1);
}
js = js.replace(oldSyncBlock, newSyncBlock);

js = js.replace(
  `    function seat(){
      if (!rail.clientWidth) return;              /* the panel is hidden */
      var held = rail.style.scrollBehavior, c = all[n + 1];
      rail.style.scrollBehavior = "auto";
      rail.scrollLeft = c.offsetLeft + c.offsetWidth / 2 - rail.clientWidth / 2;
      rail.style.scrollBehavior = held;
      sync();
    }`,
  `    function seat(){
      if (!rail.clientWidth) return;
      measureCenters();
      var held = rail.style.scrollBehavior, c = all[n + 1];
      rail.style.scrollBehavior = "auto";
      rail.scrollLeft = c.offsetLeft + c.offsetWidth / 2 - rail.clientWidth / 2;
      rail.style.scrollBehavior = held;
      lastOn = -1;
      sync();
    }`
);

js = js.replace(
  `    function relayout(){
      var w = rail.clientWidth;
      if (w && !wide) seat(); else sync();
      wide = w;
    }`,
  `    function relayout(){
      var w = rail.clientWidth;
      measureCenters();
      if (w && !wide) seat(); else { lastOn = -1; sync(); }
      wide = w;
    }`
);

// rAF-coalesce rail scroll (avoid stacking frames)
js = js.replace(
  `    var settle;
    rail.addEventListener("scroll", function(){
      window.requestAnimationFrame(sync);
      clearTimeout(settle);
      settle = setTimeout(ringWrap, 150);
    }, { passive:true });`,
  `    var settle, syncQueued = false;
    rail.addEventListener("scroll", function(){
      if (!syncQueued){
        syncQueued = true;
        window.requestAnimationFrame(function(){ syncQueued = false; sync(); });
      }
      clearTimeout(settle);
      settle = setTimeout(ringWrap, 150);
    }, { passive:true });`
);

// Pause work autoplay off-screen
js = js.replace(
  `    deck.classList.add("wired");
    relayout();
    startAuto();
  })();`,
  `    deck.classList.add("wired");
    relayout();
    if ("IntersectionObserver" in window){
      new IntersectionObserver(function(entries){
        if (entries[0].isIntersecting){ if (!dragging) startAuto(); }
        else stopAuto();
      }, { threshold: 0.05 }).observe(deck);
    } else {
      startAuto();
    }
  })();`
);

// 3) Append performance helpers at end (before closing)
const perfTail = `
  /* PERF_PATCHED */
  /* Pause expensive infinite CSS animations while off-screen */
  (function(){
    if (calm || !("IntersectionObserver" in window)) return;
    var sel = ".marq-track, .cg-seal svg, .nav-beam, .ft-marq .marq-track";
    var nodes = $$(sel);
    if (!nodes.length) return;
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        en.target.style.animationPlayState = en.isIntersecting ? "running" : "paused";
      });
    }, { rootMargin: "80px" });
    nodes.forEach(function(n){ io.observe(n); });
  })();

`;

js = js.replace(/\}\)\(\);\s*$/, perfTail + "\n})();\n");

fs.writeFileSync(file, js);
console.log("Patched", file, "→", (js.length / 1024).toFixed(1), "KB");
