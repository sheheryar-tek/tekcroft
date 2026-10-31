import fs from "fs";

const p = "C:/Users/Super/Downloads/about-us-hero-variants (6).html";
const html = fs.readFileSync(p, "utf8");

// Find section open tags with attrs
const secs = [...html.matchAll(/<section\b([^>]*)>/gi)];
for (const m of secs) {
  const attrs = m[1];
  const id = attrs.match(/\bid=["']([^"']+)/)?.[1];
  const cls = attrs.match(/\bclass=["']([^"']+)/)?.[1];
  const hidden = /\bhidden\b/.test(attrs) || /display:\s*none/.test(attrs);
  const style = attrs.match(/\bstyle=["']([^"']+)/)?.[1]?.slice(0, 80);
  console.log({ id, cls: cls?.slice(0, 60), hidden, style });
}

// Look for variant switcher / chosen comments
const comments = [...html.matchAll(/<!--([\s\S]{0,200}?)-->/g)]
  .map((m) => m[1].replace(/\s+/g, " ").trim())
  .filter((c) => /about|hero|variant|chosen|what we|pick|delete/i.test(c));
console.log("\ncomments:", comments.slice(0, 40));

// Check existing extraction
const old = "scripts/_extracted-home-variants/about-all.html";
if (fs.existsSync(old)) {
  const o = fs.readFileSync(old, "utf8");
  console.log("\nold extract bytes", o.length);
  console.log(
    "old sections",
    [...o.matchAll(/<section\b[^>]*id=["']([^"']+)/gi)].map((m) => m[1])
  );
}

// First style block - is it shared site CSS?
const style0 = html.match(/<style[^>]*>([\s\S]*?)<\/style>/i)?.[1] || "";
console.log("\nstyle0 head:\n", style0.slice(0, 500));
console.log("\nstyle0 has --font-display?", style0.includes("--font-display"));
console.log("style0 has .ab-hero?", style0.includes(".ab-hero") || style0.includes("ab-hero"));

// Style tags with ids
const styleTags = [...html.matchAll(/<style([^>]*)>/gi)].map((m) => m[1].trim().slice(0, 100));
console.log("\nstyle attrs", styleTags);
