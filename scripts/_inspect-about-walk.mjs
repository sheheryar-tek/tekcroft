import fs from "fs";

const p = "C:/Users/Super/Downloads/about-us-hero-variants (6).html";
const html = fs.readFileSync(p, "utf8");
const m = html.match(/<script[^>]*id=["']walk-script["'][^>]*>([\s\S]*?)<\/script>/i);
console.log("len", m?.[1]?.length);
console.log(m?.[1]?.slice(0, 500));
console.log("---tail---");
console.log(m?.[1]?.slice(-300));

// Does ad-styles include #hwww or how we work eg-card?
const ad =
  html.match(/<style[^>]*id=["']ad-styles["'][^>]*>([\s\S]*?)<\/style>/i)?.[1] ||
  "";
console.log("ad has #hwww", ad.includes("#hwww"));
console.log("ad has .eg-card", ad.includes(".eg-card"));
console.log("ad has walk-step{", /\.walk-step\s*\{/.test(ad));

const eg =
  html.match(/<style[^>]*id=["']eg-styles["'][^>]*>([\s\S]*?)<\/style>/i)?.[1] ||
  "";
console.log("eg has walk-step{", /\.walk-step\s*\{/.test(eg));
console.log("eg has data-at", eg.includes("data-at"));
console.log("eg has eg-arc", eg.includes("eg-arc"));

// Search for walk-step{ across file with context of style id
const i = html.search(/\.walk-step\s*\{/);
console.log("walk-step{ at", i);
if (i > 0) {
  const st = html.lastIndexOf("<style", i);
  console.log(html.slice(st, st + 100));
  console.log(html.slice(i, i + 200));
}
