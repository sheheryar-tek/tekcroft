import fs from "fs";

const p =
  process.env.TEKCROFT_AAG_HTML ||
  "c:\\Users\\Super\\Desktop\\TK FINAL\\Services\\Custom AI Agent\\tekcroft-ai-agent (1).html";
const html = fs.readFileSync(p, "utf8");
const styles = [...html.matchAll(/<style id="([^"]+)"/g)].map((m) => m[1]);
const scripts = [...html.matchAll(/<script[^>]*id="([^"]+)"/g)].map((m) => m[1]);
const secs = [...html.matchAll(/<section[^>]*id="([^"]+)"/g)].map((m) => m[1]);
console.log("STYLES", styles.length);
console.log(styles.join("\n"));
console.log("---SCRIPTS---");
console.log(scripts.join("\n"));
console.log("---SECTIONS---");
console.log(secs.join("\n"));
console.log("---META---");
console.log((html.match(/<title>([^<]+)/) || [])[1]);
console.log((html.match(/name=["']description["']\s+content=["']([^"']+)/) || [])[1]);
console.log("SIZE", (fs.statSync(p).size / 1024 / 1024).toFixed(2), "MB");
