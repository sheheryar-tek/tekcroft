import fs from "fs";

const b = fs.readFileSync("scripts/_extracted-aiseo-body.html", "utf8");
const a = fs.readFileSync("lib/ai-seo-body.html", "utf8");

// CTA / invite section
for (const needle of ["id=\"invite\"", "id=\"contact\"", "--cta", "cta-shot", "hs-done", "Building search"]) {
  console.log(needle, "ex", b.indexOf(needle), "cur", a.indexOf(needle));
}

const i = b.indexOf('id="invite"');
console.log("\n--- invite ex ---\n", b.slice(i, i + 900));
const j = a.indexOf('id="invite"');
console.log("\n--- invite cur ---\n", a.slice(j, j + 900));

// faq aside structure
const f = b.indexOf('class="faq-aside');
console.log("\n--- faq aside ex ---\n", b.slice(f, f + 1100));
