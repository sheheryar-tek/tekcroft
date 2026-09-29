import fs from "fs";

const p = "c:/Tekcroft/lib/local-seo-body.html";
let h = fs.readFileSync(p, "utf8");
const start = h.indexOf('id="what-local"');
const end = h.indexOf("</section>", start);
let sec = h.slice(start, end);
sec = sec
  .replace(/class="sc-/g, 'class="ls-sc-')
  .replace(/class="sc /g, 'class="ls-sc ');
h = h.slice(0, start) + sec + h.slice(end);
fs.writeFileSync(p, h);
console.log(
  [...sec.matchAll(/class="[^"]*sc[^"]*"/g)].map((m) => m[0]).slice(0, 25)
);
