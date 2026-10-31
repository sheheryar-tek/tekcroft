import fs from "fs";

const p = "C:/Users/Super/Downloads/about-us-hero-variants (6).html";
const html = fs.readFileSync(p, "utf8");

// Extract switcher scripts
for (const id of ["hv-sw", "sec-sw"]) {
  const idx = html.indexOf(`id="${id}"`);
  console.log("\n===", id, "idx", idx, "===");
  console.log(html.slice(Math.max(0, idx - 200), idx + 800));
}

// Last two scripts (switchers)
const scripts = [...html.matchAll(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/gi)];
console.log("\n--- script 25 ---\n", scripts[24]?.[1]);
console.log("\n--- script 26 ---\n", scripts[25]?.[1]);

// ab-hero-script full
const ab = html.match(/<script[^>]*id=["']ab-hero-script["'][^>]*>([\s\S]*?)<\/script>/i)?.[1];
console.log("\n--- ab-hero-script ---\n", ab);

// Check if about-hero-e exists in body
console.log("about-hero-e in body?", html.includes('id="about-hero-e"'));

// How many base64 in about-hero only
function sectionHtml(id) {
  return (
    html.match(
      new RegExp(`<section\\b[^>]*\\bid=["']${id}["'][^>]*>[\\s\\S]*?<\\/section>`, "i")
    )?.[0] || ""
  );
}
for (const id of ["about-hero", "about-hero-b", "hero-1"]) {
  const s = sectionHtml(id);
  const data = (s.match(/data:image\/[^"')\s]+/g) || []).length;
  console.log(id, "data urls in section", data, "chars", s.length);
}
