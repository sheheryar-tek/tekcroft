import fs from "fs";
import path from "path";

const src = String.raw`c:\Users\Super\Downloads\franchise-seo-covers-section.html`;
const html = fs.readFileSync(src, "utf8");
const outDir = path.join(process.cwd(), "scripts");

function extractStyle(id) {
  const re = new RegExp(`<style id="${id}">([\\s\\S]*?)</style>`, "i");
  const m = html.match(re);
  if (!m) throw new Error("Missing style #" + id);
  return m[1].trim();
}

function extractAllStyles(id) {
  const re = new RegExp(`<style id="${id}">([\\s\\S]*?)</style>`, "gi");
  const all = [...html.matchAll(re)].map((m) => m[1].trim());
  if (!all.length) throw new Error("Missing style #" + id);
  return all.join("\n\n");
}

function extractScript(id) {
  const re = new RegExp(`<script id="${id}">([\\s\\S]*?)</script>`, "i");
  const m = html.match(re);
  if (!m) throw new Error("Missing script #" + id);
  return m[1].trim();
}

function extractSection() {
  const start = html.indexOf('<section class="sec tm" id="franchise-covers">');
  if (start < 0) throw new Error("section not found");
  let i = start;
  let depth = 0;
  while (i < html.length) {
    const o = html.indexOf("<section", i);
    const c = html.indexOf("</section>", i);
    if (c < 0) break;
    if (o >= 0 && o < c) {
      depth++;
      i = o + 8;
      continue;
    }
    depth--;
    i = c + "</section>".length;
    if (depth === 0) return html.slice(start, i);
  }
  throw new Error("unclosed section");
}

const styleIds = ["tm-styles", "tm-fit", "tm-fill", "tm-viz", "tm-viz-fix"];
const cssParts = styleIds.map((id) => `/* === ${id} === */\n` + extractAllStyles(id));
const css = cssParts.join("\n\n");
const section = extractSection();
const script = extractScript("tm-script");

fs.writeFileSync(path.join(outDir, "_franchise-covers.css"), css);
fs.writeFileSync(path.join(outDir, "_franchise-covers.html"), section);
fs.writeFileSync(path.join(outDir, "_franchise-covers.js"), script);

console.log({
  cssLen: css.length,
  htmlLen: section.length,
  jsLen: script.length,
  htmlStart: section.slice(0, 120).replace(/\s+/g, " "),
  htmlEnd: section.slice(-80).replace(/\s+/g, " "),
});
