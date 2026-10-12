import fs from "fs";

const html = fs.readFileSync(
  "c:/Tekcroft/.next/server/app/services/ai-seo-services.html",
  "utf8"
);

// Collect all self.__next_f.push([...]) string payloads and unescape
const chunks = [];
const re = /self\.__next_f\.push\(\[.*?\]\)/gs;
let m;
while ((m = re.exec(html))) {
  chunks.push(m[0]);
}

let blob = chunks.join("\n");
// Prefer the raw file if pushes are small - also scan for \u003c sequences
blob = html;

function unescapeJs(s) {
  return s
    .replace(/\\u003c/g, "<")
    .replace(/\\u003e/g, ">")
    .replace(/\\u0026/g, "&")
    .replace(/\\u0027/g, "'")
    .replace(/\\"/g, '"')
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "")
    .replace(/\\\\/g, "\\");
}

const decoded = unescapeJs(blob);
const start = decoded.indexOf('<nav class="nav"');
const endMarkers = ["</footer>", '<div class="ftm"'];
let end = -1;
for (const em of endMarkers) {
  const i = decoded.lastIndexOf(em);
  if (i > start) end = Math.max(end, i + (em === "</footer>" ? em.length : 0));
}
// Prefer through footer end
const foot = decoded.lastIndexOf("</footer>");
if (foot > start) end = foot + "</footer>".length;

console.log({ start, end, len: decoded.length });
if (start < 0 || end < 0) {
  console.error("markers not found");
  // dump sample around aiseo
  const i = decoded.indexOf("aiseo-hero-d04c616caa");
  console.log(decoded.slice(i - 100, i + 200));
  process.exit(1);
}

let body = decoded.slice(start, end);
// Trim trailing junk after footer if any
const svgIdx = body.indexOf('<svg class="eh-sprite"');
if (svgIdx > 0) {
  // keep through footer only - find footer before svg
  const f = body.lastIndexOf("</footer>", svgIdx);
  if (f > 0) body = body.slice(0, f + "</footer>".length);
}

// The page body historically starts with nav and includes footer.
// Prepend nothing; TekcroftHtml may wrap. Check current file start.
const current = fs.readFileSync("c:/Tekcroft/lib/ai-seo-body.html", "utf8");
console.log("current starts", current.slice(0, 80).replace(/\n/g, "\\n"));
console.log("extracted starts", body.slice(0, 80).replace(/\n/g, "\\n"));
console.log("extracted has faq", body.includes("aiseo-faq-33fc3b8544"));
console.log("extracted has proc", body.includes("aiseo-proc-discovery-3069"));
console.log("extracted has tm", body.includes("aiseo-tm-01-b8d0910eb7"));
console.log("extracted has hero m", body.includes("aiseo-hero-m-4e5a2e9f78"));
console.log("emdash content", (body.replace(/<!--[\s\S]*?-->/g, "").match(/&mdash;|\u2014/g) || []).length);

fs.writeFileSync("c:/Tekcroft/scripts/_extracted-aiseo-body.html", body);
console.log("wrote scripts/_extracted-aiseo-body.html", body.length);
