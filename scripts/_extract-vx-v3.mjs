import fs from "fs";

const html = fs.readFileSync(
  "C:/Users/Super/Downloads/tekcroft-video-section.html",
  "utf8"
);
const style = html.match(/<style id="vx-styles">([\s\S]*?)<\/style>/);
const script = html.match(/<script id="vx-script">([\s\S]*?)<\/script>/);
console.log({
  styleLen: style ? style[1].length : 0,
  scriptLen: script ? script[1].length : 0,
  hasFlowMQ: script ? script[1].includes("flowMQ") : false,
  hasPaintFlow: script ? script[1].includes("paintFlow") : false,
  hasClearInline: script ? script[1].includes("clearInline") : false,
  hasAspect: style ? style[1].includes("max-aspect-ratio") : false,
});
if (style) fs.writeFileSync("scripts/_vx-orig-styles.css", style[1]);
if (script) fs.writeFileSync("scripts/_vx-orig-script.js", script[1]);
