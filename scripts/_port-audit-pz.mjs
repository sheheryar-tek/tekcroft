/**
 * Port pricing section (sec pz) + pz-styles / pz-mock / pz-hover
 * from the attached audit HTML into seo-audit-services.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = "C:/Users/Super/Downloads/tekcroft-seo-audit (8).html";

const src = fs.readFileSync(SRC, "utf8");
const bodyPath = path.join(ROOT, "lib", "seo-audit-services-body.html");
const cssPath = path.join(ROOT, "app", "seo-audit-services.css");

function extractStyle(id) {
  const open = `<style id="${id}">`;
  const i = src.indexOf(open);
  if (i < 0) throw new Error(`missing ${id}`);
  const j = src.indexOf("</style>", i);
  return src.slice(i + open.length, j).trim();
}

const secStart = src.indexOf('<section class="sec pz" id="pricing">');
if (secStart < 0) throw new Error("pricing section not found");
const secEnd = src.indexOf("</section>", secStart) + "</section>".length;
const section = src.slice(secStart, secEnd);

const pzStyles = extractStyle("pz-styles");
const pzMock = extractStyle("pz-mock");
const pzHover = extractStyle("pz-hover");

let body = fs.readFileSync(bodyPath, "utf8");
const oldStart = body.indexOf("<!-- ══════════ PRICING");
const oldEnd = body.indexOf(
  "<!-- ══════════════════════════════════════════════════════════════════\n     REVIEWS"
);
if (oldStart < 0 || oldEnd < 0) {
  throw new Error("old pricing / reviews markers not found");
}

body =
  body.slice(0, oldStart) +
  `<!-- ══════════ PRICING — row design from audit mock ══════════ -->
${section}


` +
  body.slice(oldEnd);

const prOpen = body.indexOf('<style id="pr-styles">');
if (prOpen >= 0) {
  const prClose = body.indexOf("</style>", prOpen) + "</style>".length;
  body = body.slice(0, prOpen) + body.slice(prClose);
}

fs.writeFileSync(bodyPath, body);
console.log("Updated seo-audit-services-body.html");

let css = fs.readFileSync(cssPath, "utf8");

// Drop old pricing table CSS if still present
css = css.replace(
  /\/\* the pricing band sits on white[\s\S]*?#pricing\{border-block:1px solid var\(--border\);\}\n*/,
  ""
);
css = css.replace(
  /\/\* SEO audit pricing: a three-row table[\s\S]*?\.pr-start\{display:flex; flex-direction:column; gap:6px;\}\n\}\n*/,
  ""
);

const marker = "/* === pz-styles (SEO audit pricing rows) === */";
if (css.includes(marker)) {
  css = css.slice(0, css.indexOf(marker));
}

css =
  css.trimEnd() +
  `\n\n${marker}\n${pzStyles}\n\n/* === pz-mock === */\n${pzMock}\n\n/* === pz-hover === */\n${pzHover}\n`;

fs.writeFileSync(cssPath, css);
console.log("Updated seo-audit-services.css");
