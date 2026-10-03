import fs from "fs";

const p = "lib/custom-software-development-body.html";
let s = fs.readFileSync(p, "utf8");
const a = s.indexOf('<section class="sec pr" id="pricing"');
const b = s.indexOf('<section class="sec wy" id="why"');
if (a < 0 || b < 0) {
  console.error({ a, b });
  process.exit(1);
}
s = s.slice(0, a) + s.slice(b);
fs.writeFileSync(p, s);
console.log("removed pricing", { a, b });
