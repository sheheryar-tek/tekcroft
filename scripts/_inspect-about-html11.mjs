import fs from "fs";

const p = "C:/Users/Super/Downloads/about-us-hero-variants (6).html";
const html = fs.readFileSync(p, "utf8");

const wwb = html.match(
  /<script[^>]*id=["']wwb-script["'][^>]*>([\s\S]*?)<\/script>/i
)?.[1];
console.log(wwb);

const walkTag = html.match(/<(style|script)[^>]*id=["']walk-script["'][^>]*>/i)?.[0];
console.log("\nwalk tag", walkTag);
const walkStyle = html.match(
  /<style[^>]*id=["']walk-script["'][^>]*>([\s\S]*?)<\/style>/i
)?.[1];
console.log("walk-style len", walkStyle?.length);

// Check eg-styles relevance to how-we-work markup
const hww = html.match(
  /<section\b[^>]*id=["']how-we-work["'][^>]*>[\s\S]*?<\/section>/i
)?.[0];
fs.writeFileSync("scripts/_about-hww-snippet.html", hww || "");
console.log("hww classes", [...new Set([...(hww?.matchAll(/class=["']([^"']+)/g) || [])].map((m) => m[1]))].join(" | "));

// Default built variant from script
console.log("\nwwb sets variant?", /v-a|v-b|data-v|VARIANT/.test(wwb || ""));
