/**
 * Performance patches for tekcroft-main.js (LCP + reflows + boot).
 * Idempotent via PERF_V2 marker.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const file = path.join(
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."),
  "public",
  "tekcroft-main.js"
);
let js = fs.readFileSync(file, "utf8");

if (js.includes("/* PERF_V2 */")) {
  console.log("PERF_V2 already applied");
  process.exit(0);
}

// --- Skip full-page boot curtain (it blocked LCP ~2–4s). Keep enterPage. ---
js = js.replace(
  `  /* an anchored arrival, or a reader who asked for less motion, skips it */
  if (!boot || calm || (location.hash && location.hash !== "#top")){
    skipBoot();
  } else {
    document.body.classList.add("booting");
    window.scrollTo(0, 0);

    var started = false;

    function runBoot(){
      if (started) return;
      started = true;

      /* Pin the boot logo exactly onto the nav logo, then push it out to the
         middle of the screen. Flying home is a return to transform:none, so
         the landing is the nav logo's own position by definition — there is
         no second measurement that can disagree with it. */
      function place(){
        var b = navLogo.getBoundingClientRect();
        bootLogo.style.left = b.left + "px";
        bootLogo.style.top  = b.top  + "px";
        var dx = (window.innerWidth  / 2) - (b.left + b.width  / 2);
        var dy = (window.innerHeight / 2) - (b.top  + b.height / 2);
        bootLogo.style.transform =
          "translate(" + dx + "px," + dy + "px) scale(var(--s))";
      }
      place();

      requestAnimationFrame(function(){ boot.classList.add("lit"); });

      setTimeout(function(){
        boot.classList.add("flying");
        bootLogo.style.transform = "none";
        setTimeout(function(){ boot.classList.add("clear"); }, 420);
      }, 1000);

      /* land: hand off to the real logo, drop the curtain, start the page */
      setTimeout(function(){
        enterPage();
        setTimeout(function(){ boot.classList.add("done"); }, 60);
      }, 2200);
    }

    /* PERF: start boot on next frame — do not gate first paint on webfonts */
    requestAnimationFrame(function(){ requestAnimationFrame(runBoot); });
    setTimeout(runBoot, 400);
    setTimeout(function(){
      if (document.body.classList.contains("booting")) skipBoot();
    }, 2800);
  }`,
  `  /* PERF_V2: never block LCP behind the boot curtain.
     Hero ships with .play in HTML so copy/image paint immediately.
     Boot overlay is skipped; enterPage still wires reveals/modal. */
  skipBoot();
  if (boot) boot.classList.add("done");`
);

// --- Defer why-us path length measurement until panel is shown (forced reflow) ---
js = js.replace(
  `    /* the line is measured so its draw ends where the line does */
    $$(".wn-line", wnPanel).forEach(function(pth){
      pth.style.setProperty("--len", pth.getTotalLength().toFixed(1));
    });`,
  `    /* PERF_V2: measure path lengths lazily (was forced reflow at parse time) */
    var wnLensReady = false;
    function wnMeasureLens(){
      if (wnLensReady) return;
      wnLensReady = true;
      $$(".wn-line", wnPanel).forEach(function(pth){
        pth.style.setProperty("--len", pth.getTotalLength().toFixed(1));
      });
    }`
);

// Hook wnMeasureLens into first show - find wnShow or wnIO
if (js.includes("wnShow(0);") && js.includes("wnMeasureLens")) {
  js = js.replace(
    `wnShow(0);`,
    `wnMeasureLens(); wnShow(0);`
  );
}

// --- wnDraw: avoid forced reflow void getBoundingClientRect; use rAF double ---
js = js.replace(
  `    function wnDraw(pnl){
      $$(".seg", pnl).forEach(function(seg){
        seg.style.strokeDasharray = "0 999";
        void seg.getBoundingClientRect();
        seg.style.strokeDasharray = seg.getAttribute("data-dash");
      });
    }`,
  `    function wnDraw(pnl){
      var segs = $$(".seg", pnl);
      segs.forEach(function(seg){ seg.style.strokeDasharray = "0 999"; });
      requestAnimationFrame(function(){
        segs.forEach(function(seg){
          seg.style.strokeDasharray = seg.getAttribute("data-dash");
        });
      });
    }`
);

// --- axWires: defer until section near viewport ---
js = js.replace(
  `    axWires();
    window.addEventListener("resize", axWires);
    if (document.fonts && document.fonts.ready){
      document.fonts.ready.then(axWires);
    }
    /* the panels arrive on the page's reveal and settle a fraction later */
    setTimeout(axWires, 900);`,
  `    var axWired = false;
    function axWiresOnce(){
      if (axWired) { axWires(); return; }
      axWired = true;
      axWires();
    }
    window.addEventListener("resize", function(){ if (axWired) axWires(); }, { passive:true });
    if ("IntersectionObserver" in window && axStage){
      new IntersectionObserver(function(entries){
        if (!entries[0].isIntersecting) return;
        axWiresOnce();
      }, { rootMargin: "120px", threshold: 0 }).observe(axStage);
    } else {
      setTimeout(axWiresOnce, 0);
    }`
);

js = js.replace("/* PERF_PATCHED */", "/* PERF_PATCHED */\n  /* PERF_V2 */");

fs.writeFileSync(file, js);
console.log("PERF_V2 applied to tekcroft-main.js");
