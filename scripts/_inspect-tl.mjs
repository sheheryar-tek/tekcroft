import fs from "fs";

const t = fs.readFileSync(
  "c:/Users/Super/Downloads/tekcroft-mobile-app (4).html",
  "utf8"
);

const start = t.indexOf('id="fit"');
const chunk = t.slice(start, start + 25000);
const secEnd = chunk.indexOf("</section>");
const html = chunk.slice(0, secEnd + 10);
fs.writeFileSync("scripts/_tl-orig-section.html", html);

// extract style blocks mentioning tl- or #fit .vs
const styles = [];
const re = /<style[^>]*>([\s\S]*?)<\/style>/gi;
let m;
while ((m = re.exec(t))) {
  const s = m[1];
  if (/tl-hold|tl-table|#fit \.vs-halo|#fit \.tl-/.test(s)) {
    styles.push(s);
  }
}
fs.writeFileSync("scripts/_tl-orig-styles.css", styles.join("\n\n/* ---- */\n\n"));
console.log({
  htmlLen: html.length,
  styleBlocks: styles.length,
  styleLen: styles.join("").length,
  hasHalo: html.includes("vs-halo"),
  colgroup: (html.match(/colgroup[\s\S]*?<\/colgroup>/) || [])[0],
});
