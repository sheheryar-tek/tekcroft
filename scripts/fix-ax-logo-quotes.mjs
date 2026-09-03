/**
 * Fix broken inline styles:
 *   style="--logo:url("/images/...")"
 * → style="--logo:url('/images/...')"
 *
 * Nested double quotes truncated the attribute, so --logo never applied
 * and .ax .ax-logo svg{display:none} hid the SVG fallback.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = path.join(ROOT, "lib/homepage-body.html");
let html = fs.readFileSync(file, "utf8");

const before = (html.match(/--logo:url\("\/images\//g) || []).length;
html = html.replace(/--logo:url\("(\/images\/[^"]+)"\)/g, "--logo:url('$1')");
const after = (html.match(/--logo:url\("\/images\//g) || []).length;
const fixed = (html.match(/--logo:url\('\/images\//g) || []).length;

fs.writeFileSync(file, html);
console.log(`fixed ${before - after} broken --logo urls; now ${fixed} with single quotes`);
