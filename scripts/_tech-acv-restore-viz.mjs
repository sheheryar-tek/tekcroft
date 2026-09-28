import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cssPath = path.join(ROOT, "app", "technical-seo.css");
let css = fs.readFileSync(cssPath, "utf8");
const mark = "/* === technical-seo acv: content-only panels (no viz) === */";
const i = css.indexOf(mark);
if (i < 0) {
  console.log("no content-only patch");
  process.exit(0);
}
const end = css.indexOf("/* === SITE CONSISTENCY LOCK", i);
css = css.slice(0, i) + (end >= 0 ? css.slice(end) : "");
fs.writeFileSync(cssPath, css);
console.log("removed content-only css");

// Re-apply site consistency if port wiped the lock
if (!css.includes("SITE CONSISTENCY LOCK")) {
  console.log("re-applying site consistency…");
}
