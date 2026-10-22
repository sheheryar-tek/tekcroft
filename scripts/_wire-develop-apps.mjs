import fs from "fs";

const css = fs.readFileSync("scripts/_develop-apps-extract/da-styles.css", "utf8");
const marker = "/* === da-styles (develop-apps) === */";
let page = fs.readFileSync("app/mobile-app-development.css", "utf8");
if (page.includes(marker)) {
  const i = page.indexOf(marker);
  page = page.slice(0, i) + marker + "\n" + css + "\n";
} else {
  page += "\n\n" + marker + "\n" + css + "\n";
}

// Rhythm: develop-apps owns its tint background (#DAEEF6 / #0F1A22) — do not add to !important ground list.
page = page.replace(
  /Order: proof\(w\) → app-journey\(w\) → build\(w\)/,
  "Order: proof(w) → app-journey(w) → develop-apps(tint) → industries(t)"
);

// Drop #build from white ground vars (section gone); keep industries/why tint.
page = page.replace(
  /#proof,\r?\n#app-journey,\r?\n#build,\r?\n#process,\r?\n#pricing,\r?\n#faq\{/,
  "#proof,\n#app-journey,\n#process,\n#pricing,\n#faq{"
);
page = page.replace(
  /#proof,\r?\n#build,\r?\n#industries,/g,
  "#proof,\n#industries,"
);

fs.writeFileSync("app/mobile-app-development.css", page);

let body = fs.readFileSync("lib/mobile-app-development-body.html", "utf8");
const section = fs.readFileSync(
  "scripts/_develop-apps-extract/section.html",
  "utf8"
);
if (section.includes("\uFFFD")) throw new Error("section has U+FFFD");
if (section.includes("data:image")) throw new Error("section still has data:image");
if (!section.includes('id="develop-apps"')) throw new Error("bad section");

// Replace existing Develop Apps With Us / #build / #develop-apps block
const ffs = body.indexOf("Develop Apps");
if (ffs < 0) throw new Error("Develop Apps heading not found");
const oldStart = body.lastIndexOf("<section", ffs);
if (oldStart < 0) throw new Error("section start not found");
const oldEnd = body.indexOf("</section>", oldStart) + "</section>".length;
let end = oldEnd;
while (body[end] === "\n" || body[end] === "\r") end++;

const nl = body.includes("\r\n") ? "\r\n" : "\n";
const sectionNorm = section.replace(/\r?\n/g, nl).trimEnd();

// Ensure it sits after app-journey
const journeyEnd = body.indexOf('id="app-journey"');
if (journeyEnd < 0) throw new Error("app-journey missing — place after it");
const journeyClose = body.indexOf("</section>", journeyEnd) + "</section>".length;

body = body.slice(0, oldStart) + sectionNorm + nl + nl + body.slice(end);

// If somehow develop-apps ended up before journey, move it
const daPos = body.indexOf('id="develop-apps"');
const ajPos = body.indexOf('id="app-journey"');
if (daPos >= 0 && ajPos >= 0 && daPos < ajPos) {
  throw new Error("develop-apps ended up before app-journey");
}

// Verify order: app-journey then develop-apps
const aj = body.indexOf('id="app-journey"');
const da = body.indexOf('id="develop-apps"');
if (da < aj) throw new Error("order wrong: develop-apps before journey");

const count = (body.match(/Develop Apps/g) || []).length;
if (count !== 1) {
  throw new Error("Develop Apps count expected 1, got " + count);
}
if (body.includes('id="build"')) {
  console.warn("note: #build still present somewhere");
}

fs.writeFileSync("lib/mobile-app-development-body.html", body);
console.log("OK", {
  fffd: body.includes("\uFFFD"),
  developApps: body.includes('id="develop-apps"'),
  restaurant: body.includes("develop-apps-restaurant.webp"),
  cssHasDa: page.includes("#develop-apps{"),
  orderOk: da > aj,
});
