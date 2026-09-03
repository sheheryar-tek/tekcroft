/**
 * Patch reviews paint() in tekcroft-mm.js to batch layout reads/writes.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const file = path.join(
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."),
  "public",
  "tekcroft-mm.js"
);
let js = fs.readFileSync(file, "utf8");
if (js.includes("/* PERF_MM_V2 */")) {
  console.log("PERF_MM_V2 already applied");
  process.exit(0);
}

const old = `  function paint(){
    /* the row overflows, or it does not — that single fact decides whether
       there is anything to drive */
    var scrolls = track.scrollWidth - track.clientWidth > 4;
    nav.style.display = scrolls ? 'flex' : 'none';
    if(!scrolls) return;

    var n = pages(), i = Math.min(at(), n - 1);`;

const neu = `  function paint(){
    /* PERF_MM_V2: read layout first, write later (avoids forced reflow) */
    var sw = track.scrollWidth, cw = track.clientWidth, sl = track.scrollLeft;
    var scrolls = sw - cw > 4;
    var stepW = 1;
    if (scrolls){
      var card = track.children[0];
      if (card){
        var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;
        stepW = Math.max(1, card.offsetWidth + gap);
      }
    }
    nav.style.display = scrolls ? 'flex' : 'none';
    if(!scrolls) return;

    var pv = Math.max(1, Math.round(cw / stepW));
    var n = Math.max(1, track.children.length - pv + 1);
    var i = Math.min(Math.round(sl / stepW), n - 1);`;

if (!js.includes(old)) {
  console.error("paint() block not found");
  process.exit(1);
}
js = js.replace(old, neu);
fs.writeFileSync(file, js);
console.log("PERF_MM_V2 applied");
