const t = await (await fetch("http://127.0.0.1:3000/services/local-seo")).text();
const imgs = [...t.matchAll(/localseo-tm-\d{2}-[a-f0-9]+\.webp/g)].map((m) => m[0]);
console.log("unique", [...new Set(imgs)]);
console.log(
  "alts",
  [
    "Google Business Profile Optimization",
    "Local Citation Building &amp; NAP Consistency",
    "Local On-Page SEO &amp; Schema Markup",
    "Local Link Building (White-Hat Only)",
    "Review Generation &amp; Management",
    "AI Search &amp; Answer Engine Visibility",
  ].map((a) => [a, t.includes(`alt="${a}"`)])
);
