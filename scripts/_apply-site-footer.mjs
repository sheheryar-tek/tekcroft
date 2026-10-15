/**
 * Replace every page body's ftm+ft4 footer with lib/site-footer.html
 * (homepage footer markup, sitewide links).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LIB = path.join(ROOT, "lib");
const FOOTER = fs.readFileSync(path.join(LIB, "site-footer.html"), "utf8").trimEnd() + "\n";

const bodies = fs
  .readdirSync(LIB)
  .filter((n) => n.endsWith("-body.html"))
  .map((n) => path.join(LIB, n));

// Homepage-style (ftm + ft4) or legacy ft4-only (blog/privacy)
const re =
  /(?:<!--[^\n]*FOOTER[^\n]*-->\s*)?(?:<div class="ftm"[\s\S]*?<\/footer>|<footer class="ft4"[\s\S]*?<\/footer>)/i;

let ok = 0;
let miss = [];
for (const file of bodies) {
  let html = fs.readFileSync(file, "utf8");
  if (!re.test(html)) {
    miss.push(path.basename(file));
    continue;
  }
  html = html.replace(re, FOOTER.trimEnd());
  fs.writeFileSync(file, html);
  ok++;
  console.log("updated", path.basename(file));
}
console.log(`done: ${ok} updated, ${miss.length} missed`);
if (miss.length) console.log("missed:", miss.join(", "));
