import fs from "fs";

const p = "C:/Users/Super/Downloads/about-us-hero-variants (6).html";
const html = fs.readFileSync(p, "utf8");

function styleById(id) {
  return (
    html.match(
      new RegExp(`<style[^>]*id=["']${id}["'][^>]*>([\\s\\S]*?)<\\/style>`, "i")
    )?.[1] || ""
  );
}

for (const id of [
  "tk-core",
  "hs-styles",
  "hero-copy-styles",
  "ad-styles",
  "a3-styles",
  "ai-hero-points",
  "ai-sections",
  "rhythm-styles",
  "consistency",
  "consistency-2",
  "about-styles",
]) {
  const s = styleById(id);
  const checks = ["wx-why", "built", "how-we-work", "hww", "#rp", ".rp-", "#wg", ".wg-", "xc-", ".xp"];
  console.log(
    id,
    checks.filter((c) => s.includes(c)).join("|") || "-"
  );
}

// anonymous style block (empty id)
const anon = [...html.matchAll(/<style([^>]*)>([\s\S]*?)<\/style>/gi)].filter(
  (m) => !/id=/.test(m[1])
);
console.log(
  "anon styles",
  anon.length,
  anon.map((m) => m[2].slice(0, 120).replace(/\s+/g, " "))
);

// Find wx-why CSS
const idx = html.indexOf(".wx-why");
console.log("wx-why first at", idx, html.slice(idx - 80, idx + 200));

const idx2 = html.indexOf(".built{");
console.log("built{ at", idx2, html.slice(idx2, idx2 + 200));

const idx3 = html.indexOf("#how-we-work");
console.log("#how-we-work at", idx3, html.slice(idx3, idx3 + 200));
