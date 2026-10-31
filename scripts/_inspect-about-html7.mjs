import fs from "fs";

const p = "C:/Users/Super/Downloads/about-us-hero-variants (6).html";
const html = fs.readFileSync(p, "utf8");

const hww = html.match(
  /<section\b[^>]*id=["']how-we-work["'][^>]*>[\s\S]*?<\/section>/i
)?.[0];
console.log("how-we-work class", hww?.match(/class=["']([^"']+)/)?.[1]);
console.log(hww?.slice(0, 500));

const wx = html.match(
  /<section\b[^>]*class=["'][^"']*wx-why[^"']*["'][^>]*>[\s\S]*?<\/section>/i
)?.[0];
console.log("\nwx-why open", wx?.match(/<section[^>]*>/)?.[0]);
console.log("wx parent?", html.slice(html.indexOf("wx-why") - 200, html.indexOf("wx-why") + 50));

// Find #why-exact / #wwb wrappers
for (const id of ["why-exact", "wwb", "built-wrap"]) {
  console.log(id, html.includes(`id="${id}"`));
}

const built = html.match(
  /<section\b[^>]*class=["'][^"']*\bbuilt\b[^"']*["'][^>]*>[\s\S]*?<\/section>/i
)?.[0];
console.log("\nbuilt open", built?.match(/<section[^>]*>/)?.[0]);
console.log(built?.slice(0, 400));

// scripts for how-we-work
const hwwScript = html.match(
  /<script[^>]*id=["']hww-script["'][^>]*>([\s\S]*?)<\/script>/i
)?.[1];
console.log("\nhww-script", hwwScript);

const wwb = html.match(
  /<script[^>]*id=["']wwb-script["'][^>]*>([\s\S]*?)<\/script>/i
)?.[1];
console.log("\nwwb-script head", wwb?.slice(0, 300));

const rp = html.match(
  /<script[^>]*id=["']rp-script["'][^>]*>([\s\S]*?)<\/script>/i
)?.[1];
console.log("\nrp-script", rp);

const wg = html.match(
  /<script[^>]*id=["']wg-script["'][^>]*>([\s\S]*?)<\/script>/i
)?.[1];
console.log("\nwg-script", wg);

// hero-1 a3 script (script 13)
const scripts = [...html.matchAll(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/gi)];
console.log("\na3 counter", scripts[12]?.[1]);
console.log("\nwwc", scripts[17]?.[1]);
