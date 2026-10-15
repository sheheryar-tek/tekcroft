import fs from "fs";
import path from "path";

const src = path.join(
  process.env.USERPROFILE,
  "Downloads",
  "tekcroft-franchise-seo (4).html"
);
const html = fs.readFileSync(src, "utf8");
const heroStart = html.search(/id=["']hero-1["']/);
console.log("hero idx", heroStart);
console.log("--- markup ---");
console.log(html.slice(heroStart, heroStart + 2500));

const styles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]);
const all = styles.join("\n");
const hsBlock = all.match(/\.hs\{[\s\S]*?@media \(prefers-reduced-motion:reduce\)\{[\s\S]*?\}\n/);
console.log("\n--- hs styles length ---", hsBlock ? hsBlock[0].length : 0);
if (hsBlock) {
  fs.writeFileSync("c:/Tekcroft/scripts/_franchise-src-hs.css", hsBlock[0]);
  console.log("wrote _franchise-src-hs.css");
}

// check for --veil and hs-form-theme
console.log("has --veil root", /:root\{[^}]*--veil/.test(all));
console.log("hs-veil", (all.match(/\.hs-veil\{[^}]+\}/) || [])[0]);
console.log("hs-bg img", (all.match(/\.hs-bg img\{[^}]+\}/) || [])[0]);
