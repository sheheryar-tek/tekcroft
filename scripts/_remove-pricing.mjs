import fs from "fs";

const p = "lib/mobile-app-development-body.html";
let b = fs.readFileSync(p, "utf8");
const start = b.indexOf('<section class="sec pr" id="pricing"');
if (start < 0) throw new Error("pricing section not found");
const end = b.indexOf("</section>", start) + "</section>".length;
let e = end;
while (b[e] === "\n" || b[e] === "\r") e++;
b = b.slice(0, start) + b.slice(e);
if (b.includes('id="pricing"')) throw new Error("pricing id still present");
if (b.includes("Pricing guide")) throw new Error("Pricing guide label remains");
fs.writeFileSync(p, b);
console.log("OK removed pricing section");
