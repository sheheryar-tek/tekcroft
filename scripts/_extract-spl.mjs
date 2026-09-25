import fs from "fs";
import path from "path";

const SRC = "C:/Users/Super/Downloads/tekcroft-home (1).html";
const html = fs.readFileSync(SRC, "utf8");

function extractBetween(startMarker, endMarker) {
  const start = html.indexOf(startMarker);
  if (start < 0) throw new Error("missing start: " + startMarker);
  const end = html.indexOf(endMarker, start);
  if (end < 0) throw new Error("missing end after " + startMarker);
  return html.slice(start, end + endMarker.length);
}

function extractStyle(id) {
  const open = `<style id="${id}">`;
  const start = html.indexOf(open);
  if (start < 0) throw new Error("missing style " + id);
  const end = html.indexOf("</style>", start);
  return html.slice(start, end + "</style>".length);
}

function extractScript(id) {
  const open = `<script id="${id}">`;
  const start = html.indexOf(open);
  if (start < 0) throw new Error("missing script " + id);
  const end = html.indexOf("</script>", start);
  return html.slice(start, end + "</script>".length);
}

const secOpen = html.indexOf('<section class="sec spl" id="search-split"');
if (secOpen < 0) throw new Error("section not found");
const secClose = html.indexOf("</section>", secOpen);
// find matching — section may have nested? Unlikely for this. But check.
let depth = 0;
let i = secOpen;
let secEnd = -1;
while (i < html.length) {
  const nextOpen = html.indexOf("<section", i + 1);
  const nextClose = html.indexOf("</section>", i + 1);
  if (nextClose < 0) break;
  if (nextOpen >= 0 && nextOpen < nextClose) {
    depth++;
    i = nextOpen;
  } else {
    if (depth === 0) {
      secEnd = nextClose + "</section>".length;
      break;
    }
    depth--;
    i = nextClose;
  }
}
if (secEnd < 0) throw new Error("section end not found");
const sec = html.slice(secOpen, secEnd);

const styles = ["spl-styles", "spl-viz2", "spl-real", "spl-fill", "spl-pins"].map(
  extractStyle
);
const script = extractScript("spl-script");

const out = path.join("c:/Tekcroft/scripts/_spl-extract");
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, "sec.html"), sec);
styles.forEach((s, idx) => {
  const id = ["spl-styles", "spl-viz2", "spl-real", "spl-fill", "spl-pins"][idx];
  fs.writeFileSync(path.join(out, id + ".css"), s);
});
fs.writeFileSync(path.join(out, "spl-script.js"), script);

console.log("sec bytes", sec.length);
console.log("sec starts", sec.slice(0, 80));
console.log("sec ends", sec.slice(-40));
styles.forEach((s, i) => console.log(["spl-styles", "spl-viz2", "spl-real", "spl-fill", "spl-pins"][i], s.length));
console.log("script", script.length);
console.log("reviews rule", /#reviews\{background/.test(styles[0]));
console.log("faq rule", /#faq,\.faq\{background/.test(styles[0]));
console.log("spl- class count in homepage tekcroft", (fs.readFileSync("c:/Tekcroft/app/tekcroft.css","utf8").match(/\.spl-/g)||[]).length);
