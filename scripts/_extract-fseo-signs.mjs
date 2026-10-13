import fs from "fs";
import path from "path";

const src =
  "c:/Users/Super/Downloads/franchise-seo-signs-section-compact (1).html";
const out = "c:/Tekcroft/scripts/_fseo-signs-extract";
fs.mkdirSync(out, { recursive: true });

const h = fs.readFileSync(src, "utf8");

function sliceBetween(startMarker, endMarker) {
  const start = h.indexOf(startMarker);
  if (start < 0) throw new Error("missing " + startMarker);
  const end = h.indexOf(endMarker, start);
  if (end < 0) throw new Error("missing end " + endMarker);
  return h.slice(start, end + endMarker.length);
}

const style = sliceBetween('<style id="fs-styles">', "</style>");
const section = sliceBetween(
  '<section class="sec fs" id="franchise-signs">',
  "</section>"
);
const script = sliceBetween('<script id="fs-script">', "</script>");

fs.writeFileSync(path.join(out, "fs-styles.html"), style);
fs.writeFileSync(path.join(out, "fs-section.html"), section);
fs.writeFileSync(path.join(out, "fs-script.html"), script);

console.log("style bytes", style.length);
console.log("section bytes", section.length);
console.log("script bytes", script.length);
console.log("--- section preview ---");
console.log(section.slice(0, 400));
console.log("...");
console.log(section.slice(-200));
