const t = await (
  await fetch("http://127.0.0.1:3000/services/local-seo-services", {
    cache: "no-store",
  })
).text();
console.log("faq", (t.match(/localseo-faq-[a-f0-9]+\.webp/) || [])[0]);
console.log("vs", (t.match(/localseo-vs-[a-f0-9]+\.webp/) || [])[0]);
console.log("vs-bg class", t.includes("vs-bg"));
console.log("old faq", t.includes("2ffcfefec3"));
console.log("old vs", t.includes("43d927d8ee"));
