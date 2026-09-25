import fs from "fs";

const html = fs.readFileSync(
  "c:\\Users\\Super\\Downloads\\tekcroft-why-choose-us-1.html",
  "utf8"
);

const sec = html.match(
  /<section class="sec wy" id="whyus"[\s\S]*?<\/section>/
);
if (!sec) throw new Error("section not found");
fs.writeFileSync("c:\\Tekcroft\\scripts\\_why-v2-sec.html", sec[0]);
console.log("SEC", sec[0].length);

const sty = html.match(/<style id="wy-styles">([\s\S]*?)<\/style>/);
if (!sty) throw new Error("styles not found");
fs.writeFileSync("c:\\Tekcroft\\scripts\\_why-v2-css.css", sty[1]);
console.log("STY", sty[1].length);

const scripts = [...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)];
for (const m of scripts) {
  const code = m[2];
  if (code.includes("data-tabs") || code.includes("wy-tab")) {
    fs.writeFileSync("c:\\Tekcroft\\scripts\\_why-v2-js.js", code);
    console.log("JS", code.length);
  }
}

// preview first 80 lines of section (no huge base64 hopefully)
const lines = sec[0].split("\n");
console.log("SEC lines", lines.length);
console.log(lines.slice(0, 40).join("\n"));
