import fs from "fs";

const html = fs.readFileSync(
  "C:/Users/Super/Downloads/tekcroft-artificial-intelligence-services (3).html",
  "utf8"
);
const title = (html.match(/<title>([^<]*)<\/title>/i) || [])[1];
const desc =
  (html.match(/name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
    html.match(/content=["']([^"']*)["'][^>]*name=["']description["']/i) ||
    [])[1];
const styles = [...html.matchAll(/<style[^>]*id=["']([^"']+)["']/gi)].map(
  (m) => m[1]
);
const scripts = [...html.matchAll(/<script[^>]*id=["']([^"']+)["']/gi)].map(
  (m) => m[1]
);
const sections = [...html.matchAll(/<section[^>]*id=["']([^"']+)["'][^>]*>/gi)].map(
  (m) => m[1]
);
console.log("TITLE", title);
console.log("DESC", desc);
console.log("STYLES", styles.length);
console.log(styles.join("\n"));
console.log("SCRIPTS", scripts.length);
console.log(scripts.join("\n"));
console.log("SECTIONS", sections.join(" | "));
console.log(
  "flags",
  Object.fromEntries(
    [
      "bvsw",
      "data-svar",
      "data-bvar",
      "id=\"proof\"",
      "id=\"proof-v2\"",
      "id=\"proof-v3\"",
      "id=\"build-v2\"",
      "id=\"build-v3\"",
      "id=\"build\"",
    ].map((k) => [k, html.includes(k.replace(/\\/g, ""))])
  )
);
