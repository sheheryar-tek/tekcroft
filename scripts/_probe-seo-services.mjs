import fs from "fs";

const p = "C:/Users/Super/Downloads/tekcroft-seo-services.html";
const h = fs.readFileSync(p, "utf8");
const title = (h.match(/<title>([^<]*)<\/title>/i) || [])[1];
const desc = (h.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i) || [])[1];
console.log("TITLE:", title);
console.log("DESC:", desc);
const main = (h.match(/<main[^>]*>([\s\S]*?)<\/main>/i) || [])[1] || "";
const ids = [...main.matchAll(/id=["']([^"']+)["']/g)].map((m) => m[1]);
console.log("MAIN IDS:", [...new Set(ids)].join(", "));
console.log("style blocks", (h.match(/<style/gi) || []).length);
console.log("script blocks", (h.match(/<script/gi) || []).length);
console.log("base64", (h.match(/data:image\/[^;]+;base64,/g) || []).length);
const styleIds = [...h.matchAll(/<style[^>]*\bid=["']([^"']+)["']/gi)].map((m) => m[1]);
console.log("style ids:", styleIds.join(", "));
const scriptIds = [...h.matchAll(/<script[^>]*\bid=["']([^"']+)["']/gi)].map((m) => m[1]);
console.log("script ids:", scriptIds.join(", "));
