import fs from "fs";

const a = fs.readFileSync("lib/ai-seo-body.html", "utf8");
const b = fs.readFileSync("scripts/_extracted-aiseo-body.html", "utf8");
console.log("cur lines", a.split(/\r?\n/).length, "ex lines", b.split(/\r?\n/).length);
console.log("cur BOM", a.charCodeAt(0) === 0xfeff);
const i = b.indexOf('id="model"');
console.log("---model---");
console.log(b.slice(i, i + 900));
const f = b.indexOf('id="faq"');
console.log("---faq---");
console.log(b.slice(f, f + 700));
const p = b.indexOf('id="process"');
console.log("---process---");
console.log(b.slice(p, p + 900));
const h = b.indexOf("aiseo-hero");
console.log("---hero---");
console.log(b.slice(h - 200, h + 400));
