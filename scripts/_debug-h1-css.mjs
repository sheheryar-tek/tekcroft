const url =
  "http://localhost:3000/_next/static/chunks/app_seo-services_188iswq89n42y.css";
const t = await (await fetch(url)).text();
const re = /[^{}]*hs-h1 em[^{]*\{[^}]+\}/g;
const all = [...t.matchAll(re)].map((m) => m[0]);
console.log("count", all.length);
all.forEach((m, i) => console.log("---", i, "\n" + m));

let idx = 0;
while ((idx = t.indexOf("nowrap", idx)) !== -1) {
  const ctx = t.slice(Math.max(0, idx - 100), idx + 30);
  if (/hs-h1|hero-1|#hero/.test(ctx)) console.log("CTX", JSON.stringify(ctx));
  idx++;
}

const end = t.slice(-2500);
console.log("\n--- file end ---\n", end.includes("text-wrap") ? "has text-wrap near end" : "no");
console.log(end.match(/hero-1[\s\S]{0,200}hs-h1 em[\s\S]{0,120}/)?.[0]);
