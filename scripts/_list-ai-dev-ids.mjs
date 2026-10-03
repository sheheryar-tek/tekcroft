import fs from "fs";
const t = fs.readFileSync(
  "C:/Users/Super/Downloads/tekcroft-ai-development (2).html",
  "utf8"
);
const styles = [...t.matchAll(/<style id="([^"]+)"/g)].map((m) => m[1]);
const scripts = [...t.matchAll(/<script[^>]*id="([^"]+)"/g)].map((m) => m[1]);
console.log("STYLES", styles.length);
console.log(styles.join("\n"));
console.log("---SCRIPTS---");
console.log(scripts.join("\n"));
