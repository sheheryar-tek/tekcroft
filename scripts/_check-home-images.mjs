import fs from "fs";
const b = fs.readFileSync("c:/Tekcroft/lib/homepage-body.html", "utf8");
const from = b.indexOf('id="search-split-v3"');
const chunk = b.slice(from, from + 12000);
const urls = [...chunk.matchAll(/\/images\/[^"' )\s]+/g)].map((m) => m[0]);
console.log("nsr images:\n" + [...new Set(urls)].join("\n"));
const all = [...b.matchAll(/\/images\/[^"' )\s]+/g)].map((m) => m[0]);
const uniq = [...new Set(all)];
const missing = [];
for (const u of uniq) {
  const p = "c:/Tekcroft/public" + u;
  if (!fs.existsSync(p)) missing.push(u);
}
console.log("missing count", missing.length);
console.log(missing.slice(0, 40).join("\n"));
