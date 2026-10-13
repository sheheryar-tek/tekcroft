import fs from "fs";
import path from "path";

const SRC = "c:/Users/Super/Downloads/mega-menu.html";
const OUT = "c:/Tekcroft/scripts/_mm-design-extract";
fs.mkdirSync(OUT, { recursive: true });

const h = fs.readFileSync(SRC, "utf8");

const styleIds = [
  "mm-veil-lighter",
  "mm-bottom-copy",
  "mm-core-pills",
  "mm-core-strong",
  "mm-spacing",
  "mm-core-v3",
  "mm-core-fit",
  "mm-current",
];
const scriptIds = ["mm-core-icons", "mm-current-js"];

function extractStyle(id) {
  const open = `<style id="${id}">`;
  const i = h.indexOf(open);
  if (i < 0) throw new Error("missing style " + id);
  const start = i + open.length;
  const end = h.indexOf("</style>", start);
  if (end < 0) throw new Error("unclosed style " + id);
  return h.slice(start, end).trim();
}

function extractScript(id) {
  const open = `<script id="${id}">`;
  const i = h.indexOf(open);
  if (i < 0) throw new Error("missing script " + id);
  const start = i + open.length;
  const end = h.indexOf("</script>", start);
  if (end < 0) throw new Error("unclosed script " + id);
  return h.slice(start, end).trim();
}

const styles = {};
for (const id of styleIds) {
  styles[id] = extractStyle(id);
  fs.writeFileSync(path.join(OUT, id + ".css"), styles[id] + "\n");
  console.log("style", id, styles[id].length);
}

const scripts = {};
for (const id of scriptIds) {
  scripts[id] = extractScript(id);
  fs.writeFileSync(path.join(OUT, id + ".js"), scripts[id] + "\n");
  console.log("script", id, scripts[id].length);
}

// Also capture the mobile closeMenu line from preview chrome for reference
const closeIdx = h.indexOf("mnav.addEventListener");
console.log(
  "closeMenu snippet:\n",
  h.slice(closeIdx, closeIdx + 180).replace(/\s+/g, " ")
);

fs.writeFileSync(
  path.join(OUT, "bundle.css"),
  styleIds.map((id) => `/* === ${id} === */\n${styles[id]}`).join("\n\n") +
    "\n"
);
fs.writeFileSync(
  path.join(OUT, "bundle.js"),
  scriptIds.map((id) => `/* === ${id} === */\n${scripts[id]}`).join("\n\n") +
    "\n"
);
console.log("done");
