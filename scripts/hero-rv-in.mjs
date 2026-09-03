import fs from "fs";
const p = "lib/homepage-body.html";
let h = fs.readFileSync(p, "utf8");
// Ensure above-the-fold hero reveals are visible without JS
h = h.replace(
  /<(span|p|div) class="(tag|lede|hero-actions) rv"/g,
  '<$1 class="$2 rv in"'
);
// Fix if already partially done
h = h.replace(/class="(tag|lede|hero-actions) rv in"/g, 'class="$1 rv in"');
fs.writeFileSync(p, h);
console.log("hero rv.in count", (h.match(/class="(tag|lede|hero-actions) rv in"/g) || []).length);
