import fs from "fs";

const b = fs.readFileSync("scripts/_extracted-aiseo-body.html", "utf8");
const a = fs.readFileSync("lib/ai-seo-body.html", "utf8");

function snippet(label, html, needle, len = 1200) {
  const i = html.indexOf(needle);
  console.log(`\n=== ${label} (${needle}) idx=${i} ===`);
  if (i < 0) return;
  console.log(html.slice(i, i + len));
}

snippet("ex faq layers", b, "faq-layer", 800);
snippet("ex faq img", b, "aiseo-faq", 400);
snippet("ex eg-pic", b, "eg-pic", 600);
snippet("ex cta", b, "--cta-shot", 500);
snippet("ex cta img", b, "aiseo-cta", 400);
snippet("cur faq", a, "aiseo-faq", 200);
snippet("cur eg-pic", a, "eg-pic", 200);
snippet("cur tm img", a, "aiseo-tm-01", 200);

// Count assets
for (const [name, html] of [
  ["ex", b],
  ["cur", a],
]) {
  const imgs = [...html.matchAll(/aiseo-[a-z0-9.-]+\.webp/g)].map((m) => m[0]);
  console.log(name, "unique imgs", [...new Set(imgs)].sort().join("\n  "));
}
