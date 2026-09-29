/**
 * Tag major content sections with alternating data-ground="white"|"tint"
 * so backgrounds rhythm white → tint → white across every page body.
 * Skips heroes, photo bands, and CTA photo sections.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const lib = path.join(ROOT, "lib");

const SKIP =
  /\b(hs|on-dark|ws|cta|ct-hero)\b|id="(hero|contact|fit|apart|stack)"/;

const files = fs.readdirSync(lib).filter((f) => f.endsWith("-body.html"));

for (const name of files) {
  const fp = path.join(lib, name);
  let html = fs.readFileSync(fp, "utf8");
  // strip previous data-ground
  html = html.replace(/\sdata-ground="(white|tint|soft)"/g, "");

  let flip = 0; // 0 white, 1 tint
  const next = html.replace(/<section\b([^>]*)>/g, (full, attrs) => {
    if (SKIP.test(attrs) || SKIP.test(full)) return full;
    if (!/\bsec\b/.test(attrs) && !/\bclass="[^"]*\bsec\b/.test(full)) {
      // still treat bare sections that are major content if they have id
      if (!/\bid="/.test(attrs)) return full;
    }
    // Must look like a content section
    if (!/\b(sec|class=)/.test(attrs)) return full;
    if (!/\bsec\b/.test(attrs)) return full;

    const ground = flip % 2 === 0 ? "white" : "tint";
    flip++;
    return `<section${attrs} data-ground="${ground}">`;
  });

  if (next !== html) {
    fs.writeFileSync(fp, next);
    console.log("grounds", name, "sections tagged");
  } else {
    console.log("no sec tags?", name);
  }
}
