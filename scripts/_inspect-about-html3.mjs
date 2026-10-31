import fs from "fs";
import path from "path";

const p = "C:/Users/Super/Downloads/about-us-hero-variants (6).html";
const html = fs.readFileSync(p, "utf8");

function styleById(id) {
  const re = new RegExp(
    `<style[^>]*id=["']${id}["'][^>]*>([\\s\\S]*?)<\\/style>`,
    "i"
  );
  return html.match(re)?.[1] || "";
}

for (const id of [
  "about-styles",
  "ad-styles",
  "a3-styles",
  "ai-sections",
  "ai-hero-points",
]) {
  const s = styleById(id);
  console.log("\n===", id, "len", s.length, "===");
  console.log(s.slice(0, 400));
}

// Extract each about section HTML length
function sectionHtml(id) {
  const re = new RegExp(
    `<section\\b[^>]*\\bid=["']${id}["'][^>]*>[\\s\\S]*?<\\/section>`,
    "i"
  );
  return html.match(re)?.[0] || "";
}

for (const id of [
  "about-hero",
  "about-hero-b",
  "hero-1",
  "what-we-do",
  "what-we-do-b",
  "what-we-do-c",
  "rp",
  "how-we-work",
  "wg",
  "cta",
]) {
  const s = sectionHtml(id);
  console.log(id, "html", s.length, "h2?", (s.match(/<h2[^>]*>[\s\S]*?<\/h2>/i)?.[0] || "").replace(/<[^>]+>/g, "").slice(0, 80));
}

// wx-why and built (no id)
const wx = html.match(/<section\b[^>]*class=["'][^"']*wx-why[^"']*["'][^>]*>[\s\S]*?<\/section>/i)?.[0];
const built = html.match(/<section\b[^>]*class=["'][^"']*\bbuilt\b[^"']*["'][^>]*>[\s\S]*?<\/section>/i)?.[0];
console.log("wx-why", wx?.length, (wx?.match(/<h2[^>]*>[\s\S]*?<\/h2>/i)?.[0] || "").replace(/<[^>]+>/g, "").slice(0, 80));
console.log("built", built?.length, (built?.match(/<h2[^>]*>[\s\S]*?<\/h2>/i)?.[0] || "").replace(/<[^>]+>/g, "").slice(0, 80));

// data: urls count and sizes
const dataUrls = [...html.matchAll(/url\(["']?(data:image\/[^)"']+)["']?\)/gi)].map((m) => m[1]);
const imgData = [...html.matchAll(/src=["'](data:image\/[^"']+)["']/gi)].map((m) => m[1]);
console.log("css data urls", dataUrls.length, "img data", imgData.length);
console.log(
  "data url lens",
  [...dataUrls, ...imgData].map((d) => Math.round(d.length / 1024) + "KB")
);

// Scripts near about
const scriptIds = [...html.matchAll(/<script([^>]*)>/gi)].map((m) => m[1].trim().slice(0, 80));
console.log("script attrs sample", scriptIds.filter((s) => /about|ab-|hero|ww|wg|rp|built|wx/i.test(s)));

// Find script that mentions about-hero
let i = 0;
for (const m of html.matchAll(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/gi)) {
  i++;
  const body = m[1];
  if (/about-hero|ab-hero|#wg|#rp|what-we-do|how-we-work/.test(body)) {
    console.log("script#", i, "len", body.length, "head", body.slice(0, 120).replace(/\s+/g, " "));
  }
}
