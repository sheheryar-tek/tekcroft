const t = await (await fetch("http://127.0.0.1:3000/services/local-seo")).text();
console.log("mobile hero", t.includes("localseo-hero-m-737baaa4d6"));
console.log("desktop hero", t.includes("localseo-hero-e58f55594e"));
console.log("picture", t.includes("<picture>"));
console.log(
  "mobile preload",
  t.includes('media="(max-width:960px)"') && t.includes("localseo-hero-m-737baaa4d6")
);
