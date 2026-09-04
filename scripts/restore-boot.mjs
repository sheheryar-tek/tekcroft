/**
 * Restore original boot/logo intro animation removed by PERF_V2 skipBoot().
 * Keeps perf-friendly starts (no font-blocking) and failsafe timeout.
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

const broken = `  /* PERF_V2: never block LCP behind the boot curtain.
     Hero ships with .play in HTML so copy/image paint immediately.
     Boot overlay is skipped; enterPage still wires reveals/modal. */
  skipBoot();
  if (boot) boot.classList.add("done");
`;

const restored = `  /* Boot logo intro — restored original fly-to-nav sequence.
     PERF: do not wait on webfonts; start on next frame; failsafe timeout. */
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
        if (!bootLogo || !navLogo) return;
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

    requestAnimationFrame(function(){ requestAnimationFrame(runBoot); });
    setTimeout(runBoot, 300);
    setTimeout(function(){
      if (document.body.classList.contains("booting")) skipBoot();
    }, 3200);
  }
`;

if (!js.includes("PERF_V2: never block LCP behind the boot curtain")) {
  if (js.includes("function runBoot()")) {
    console.log("Boot animation already present");
    process.exit(0);
  }
  console.error("Expected PERF_V2 skipBoot block not found");
  process.exit(1);
}

js = js.replace(broken, restored);
fs.writeFileSync(file, js);
console.log("Restored boot logo intro in tekcroft-main.js");
