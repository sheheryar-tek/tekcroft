import fs from "fs";

const h = fs.readFileSync(
  "c:/Users/Super/Downloads/tekcroft-local-pack-section.html",
  "utf8"
);
console.log("len", h.length);

const sectionMatch = h.match(/<section[\s\S]*?<\/section>/i);
if (sectionMatch) {
  const s = sectionMatch[0];
  console.log("section len", s.length);
  console.log("section start", s.slice(0, 500));
  fs.writeFileSync("c:/Tekcroft/scripts/_pack-section-extract.html", s);
  console.log("wrote section extract");
}

const styleBlocks = [...h.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)];
console.log("style blocks", styleBlocks.length);
styleBlocks.forEach((m, i) => {
  const css = m[1];
  fs.writeFileSync(`c:/Tekcroft/scripts/_pack-style-${i}.css`, css);
  console.log(`style ${i} len`, css.length, "starts", css.slice(0, 120).replace(/\s+/g, " "));
});

const scriptBlocks = [...h.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)];
console.log("script blocks", scriptBlocks.length);
scriptBlocks.forEach((m, i) => {
  const js = m[1];
  if (js.trim()) {
    fs.writeFileSync(`c:/Tekcroft/scripts/_pack-script-${i}.js`, js);
    console.log(`script ${i} len`, js.length);
  }
});

const classes = [...h.matchAll(/class="([^"]+)"/g)].map((m) => m[1]);
const unique = [...new Set(classes)].filter((c) => /lp|pack|rank|beam/i.test(c));
console.log("relevant classes", unique.slice(0, 80));
