const t = await (await fetch("http://127.0.0.1:3000/services/local-seo")).text();
const imgs = [...new Set(t.match(/localseo-proc-[a-z]+-[a-f0-9]+\.webp/g) || [])];
console.log(imgs);
console.log("eg-pic count", (t.match(/class="eg-pic"/g) || []).length);
console.log(
  "css hide before",
  t.includes("localseo-proc-audit") && t.includes("Free Audit")
);
