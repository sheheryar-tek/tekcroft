import fs from "fs";

const p = "C:/Users/Super/Downloads/about-us-hero-variants (6).html";
const html = fs.readFileSync(p, "utf8");

for (const id of ["why-exact", "wwb"]) {
  const re = new RegExp(
    `<div\\b[^>]*id=["']${id}["'][^>]*>[\\s\\S]*?<\\/div>(?=\\s*<(?:section|div|footer|script))`,
    "i"
  );
  // better: find start and match depth
  const start = html.search(new RegExp(`<(div|section)\\b[^>]*id=["']${id}["']`, "i"));
  console.log(id, "start", start);
  if (start < 0) continue;
  console.log(html.slice(start, start + 300));
}

// Find how-we-work CSS - search hwwalk / .eg-ring near about content
const eg = html.indexOf("[data-hwwalk]");
console.log("data-hwwalk css?", eg, html.slice(eg - 100, eg + 200));

const walk = html.indexOf(".walk-step");
console.log(".walk-step", walk, html.slice(Math.max(0, walk - 50), walk + 150));

// Is how-we-work using eg styles from eg-styles?
const egStyles =
  html.match(/<style[^>]*id=["']eg-styles["'][^>]*>([\s\S]*?)<\/style>/i)?.[1] || "";
console.log("eg-styles has hwwalk?", egStyles.includes("hwwalk"));
console.log("eg-styles has walk-step?", egStyles.includes("walk-step"));
console.log("eg-styles has eg-ring?", egStyles.includes("eg-ring"));
console.log("ad-styles has walk-step?", (html.match(/<style[^>]*id=["']ad-styles["'][^>]*>([\s\S]*?)<\/style>/i)?.[1] || "").includes("walk-step"));
console.log("tk-core has walk-step?", (html.match(/<style[^>]*id=["']tk-core["'][^>]*>([\s\S]*?)<\/style>/i)?.[1] || "").includes("walk-step"));
