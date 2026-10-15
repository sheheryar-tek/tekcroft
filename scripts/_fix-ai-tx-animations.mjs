/**
 * 1) Extract <style id="ai-tx-styles"> verbatim into app/ai-tx-styles.css
 * 2) Strip !important from animated properties in unlock's ai-tx block
 *    so @keyframes gx* can drive those values.
 */
import fs from "fs";
import path from "path";

const root = path.resolve("c:/Tekcroft");
const srcHtml = path.join(
  process.env.USERPROFILE || "",
  "Downloads",
  "tekcroft-artificial-intelligence-services (3).html"
);
const outCss = path.join(root, "app", "ai-tx-styles.css");
const unlockPath = path.join(root, "app", "artificial-intelligence-services-unlock.css");

const html = fs.readFileSync(srcHtml, "utf8");
const m = html.match(/<style id="ai-tx-styles">([\s\S]*?)<\/style>/);
if (!m) {
  console.error("ai-tx-styles not found in source HTML");
  process.exit(1);
}
const verbatim = m[1].replace(/^\uFEFF/, "").trim() + "\n";
fs.writeFileSync(outCss, verbatim);
const kfs = [...verbatim.matchAll(/@keyframes (gx\w+)/g)].map((x) => x[1]);
console.log("wrote", outCss, "bytes", verbatim.length, "keyframes", kfs.join(","));

// Properties that gx* keyframes animate — !important on these freezes the visual.
const ANIM_PROPS = new Set([
  "max-width",
  "width",
  "height",
  "opacity",
  "transform",
  "clip-path",
  "left",
  "right",
  "top",
  "bottom",
  "stroke-dashoffset",
  "stroke-dasharray",
  "border-color",
  "color",
  "background",
  "background-position",
  "background-color",
  "box-shadow",
  "visibility",
  "filter",
]);

let unlock = fs.readFileSync(unlockPath, "utf8");
const marker = "/* === ai-tx-styles === */";
const start = unlock.indexOf(marker);
if (start < 0) {
  console.error("unlock ai-tx-styles marker missing");
  process.exit(1);
}
// End at next section marker or file end — keep going until a clear next major block.
// The ai-tx block runs through gxReveal / reduced-motion for g1-l; after that come other sections.
const after = unlock.slice(start);
// Find end: next `/* ===` after start, or heuristic around g1-l reduced-motion close.
let endRel = after.indexOf("\n/* ===", 10);
if (endRel < 0) {
  // Fallback: end after last gxReveal reduced-motion for g1-l in unlock
  const last = after.lastIndexOf("@media (prefers-reduced-motion:reduce){ html[data-design=\"raw\"] #tech-v4 .g1-l");
  if (last >= 0) {
    const close = after.indexOf("}", last);
    endRel = after.indexOf("\n", close) + 1;
  } else {
    endRel = after.length;
  }
}
const end = start + endRel;
const block = unlock.slice(start, end);

// Strip !important from animated property declarations inside this block.
const stripped = block.replace(
  /([;{\s])([a-zA-Z-]+)\s*:\s*([^;!{}]+?)\s*!important/g,
  (full, lead, prop, val) => {
    if (ANIM_PROPS.has(prop.toLowerCase())) {
      return `${lead}${prop}:${val}`;
    }
    return full;
  }
);

unlock = unlock.slice(0, start) + stripped + unlock.slice(end);
fs.writeFileSync(unlockPath, unlock);
console.log(
  "patched unlock ai-tx block",
  start,
  "..",
  end,
  "removed important on anim props; delta",
  block.length - stripped.length
);
