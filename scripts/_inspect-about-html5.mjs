import fs from "fs";

const p = "C:/Users/Super/Downloads/about-us-hero-variants (6).html";
const html = fs.readFileSync(p, "utf8");

const styleIds = [...html.matchAll(/<style[^>]*id=["']([^"']+)["']/gi)].map(
  (m) => m[1]
);
console.log("style ids", styleIds);

function styleById(id) {
  return (
    html.match(
      new RegExp(`<style[^>]*id=["']${id}["'][^>]*>([\\s\\S]*?)<\\/style>`, "i")
    )?.[1] || ""
  );
}

const needles = [
  "#hero-1",
  ".a3",
  "#what-we-do-c",
  ".xc",
  ".xp",
  ".wx-why",
  ".built",
  "#rp",
  ".rp",
  "#how-we-work",
  "#wg",
  ".wg",
  "#cta",
  ".cta",
  ".hs ",
  "on-dark",
];

for (const id of styleIds) {
  const s = styleById(id);
  const hits = needles.filter((n) => s.includes(n.replace(/^\./, "").length ? n : n));
  // simpler: check each
  const found = [];
  for (const n of needles) {
    if (s.includes(n)) found.push(n);
  }
  if (found.length) console.log(id, found.join(", "));
}

// Scripts with ids
for (const id of [
  "ab-hero-script",
  "wwb-script",
  "rp-script",
  "hww-script",
  "wg-script",
]) {
  const s = html.match(
    new RegExp(`<script[^>]*id=["']${id}["'][^>]*>([\\s\\S]*?)<\\/script>`, "i")
  )?.[1];
  console.log(id, s ? s.length : "missing");
}

// Scripts that mention what-we-do-c, built, wx-why, hero-1
let i = 0;
for (const m of html.matchAll(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/gi)) {
  i++;
  const body = m[1];
  if (/hero-1|what-we-do-c|wx-why|\.built|#rp|#wg|#cta|how-we-work/.test(body)) {
    console.log(
      "script",
      i,
      "len",
      body.length,
      body.slice(0, 100).replace(/\s+/g, " ")
    );
  }
}

// Dump start of what-we-do-c and hero-1 for structure
function sec(id) {
  return (
    html.match(
      new RegExp(`<section\\b[^>]*\\bid=["']${id}["'][^>]*>[\\s\\S]*?<\\/section>`, "i")
    )?.[0] || ""
  );
}
fs.writeFileSync(
  "scripts/_about-hero1-snippet.html",
  sec("hero-1").slice(0, 3000)
);
fs.writeFileSync(
  "scripts/_about-wwc-snippet.html",
  sec("what-we-do-c").slice(0, 3000)
);
console.log("wrote snippets");
