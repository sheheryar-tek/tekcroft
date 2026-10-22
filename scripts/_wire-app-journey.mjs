import fs from "fs";

let css = fs.readFileSync("scripts/_journey-extract/mj-styles.css", "utf8");
css = css.replace(
  /'Caveat',cursive/g,
  "var(--font-caveat), 'Caveat', cursive"
);

const marker = "/* === mj-styles (app-journey) === */";
let page = fs.readFileSync("app/mobile-app-development.css", "utf8");
if (page.includes(marker)) {
  const i = page.indexOf(marker);
  page = page.slice(0, i) + marker + "\n" + css + "\n";
} else {
  page += "\n\n" + marker + "\n" + css + "\n";
}

// Rhythm comment + grounds: journey is white; drop services-2 from tint group.
// Do NOT put #app-journey on the !important ground list — mj-styles owns background:#fff.
page = page.replace(
  /Order: proof\(w\) → services\(t\) → build\(w\)/,
  "Order: proof(w) → app-journey(w) → build(w)"
);

if (!page.includes("#app-journey,\n#build,\n#process,")) {
  page = page.replace(
    /#proof,\r?\n#build,\r?\n#process,\r?\n#pricing,\r?\n#faq\{/,
    "#proof,\n#app-journey,\n#build,\n#process,\n#pricing,\n#faq{"
  );
}

page = page.replace(
  /#services-2,\r?\n#industries,\r?\n#why\{/g,
  "#industries,\n#why{"
);

// Background !important list: swap services-2 → leave without app-journey
// (app-journey background comes from mj-styles). Just drop services-2.
page = page.replace(
  /#proof,\r?\n#services-2,\r?\n#build,/g,
  "#proof,\n#build,"
);

fs.writeFileSync("app/mobile-app-development.css", page);

let body = fs.readFileSync("lib/mobile-app-development-body.html", "utf8");
const section = fs.readFileSync("scripts/_journey-extract/section.html", "utf8");
if (section.includes("\uFFFD")) throw new Error("section has U+FFFD");
if (section.includes("data:image")) throw new Error("section still has data:image");

const markers = [
  '<section class="sec tm" id="services-2"',
  '<section class="sec mj-sec" id="app-journey"',
  '<section id="app-journey"',
];
let oldStart = -1;
for (const m of markers) {
  const i = body.indexOf(m);
  if (i >= 0 && (oldStart < 0 || i < oldStart)) oldStart = i;
}
if (oldStart < 0) throw new Error("journey/services-2 section not found");

// Prefer replacing the From First Sketch section specifically
const ffs = body.indexOf("From First Sketch");
if (ffs > 0) {
  const back = body.lastIndexOf("<section", ffs);
  if (back >= 0) oldStart = back;
}

const oldEnd = body.indexOf("</section>", oldStart) + "</section>".length;
let end = oldEnd;
while (body[end] === "\n" || body[end] === "\r") end++;

const nl = body.includes("\r\n") ? "\r\n" : "\n";
const sectionNorm = section.replace(/\r?\n/g, nl).trimEnd();
body = body.slice(0, oldStart) + sectionNorm + nl + nl + body.slice(end);

if (!body.includes('id="app-journey"')) throw new Error("app-journey missing");
const ffsCount = (body.match(/From First Sketch/g) || []).length;
if (ffsCount !== 1) {
  throw new Error("From First Sketch count expected 1, got " + ffsCount);
}
if (body.includes('id="services-2"')) {
  console.warn("note: services-2 id still present elsewhere");
}

fs.writeFileSync("lib/mobile-app-development-body.html", body);
console.log("OK", {
  fffd: body.includes("\uFFFD"),
  journey: body.includes('id="app-journey"'),
  imgs: (body.match(/\/images\/mobile-app\/journey-/g) || []).length,
  cssHasMj: page.includes("#app-journey .sb-stage"),
  caveatVar: page.includes("var(--font-caveat)"),
});
