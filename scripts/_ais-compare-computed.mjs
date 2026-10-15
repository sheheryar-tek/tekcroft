/**
 * Open file:// HTML isn't available here — instead dump key page-local
 * padding/font rules from source vs what !important lock forces.
 */
import fs from "fs";

const html = fs.readFileSync(
  "C:/Users/Super/Downloads/tekcroft-artificial-intelligence-services (3).html",
  "utf8"
);
const lock = fs.readFileSync("app/site-consistency.css", "utf8");

const ids = [
  "proof-v3",
  "model",
  "build-v3",
  "tech-v4",
  "integ",
  "govern",
  "process",
  "industries",
  "why",
  "models",
  "faq",
  "contact",
];

// Gather padding-block declarations for these ids from all style tags
const styleBlocks = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map(
  (m) => m[1]
);
const all = styleBlocks.join("\n");

for (const id of ids) {
  const re = new RegExp(`#${id}[^{.\\s,#\\[]*[^{]*\\{[^}]*padding-block:[^;]+;`, "gi");
  const hits = [...all.matchAll(re)].map((m) => m[0].replace(/\s+/g, " ").slice(0, 160));
  console.log("\n#" + id);
  if (!hits.length) console.log("  (no padding-block in source)");
  hits.forEach((h) => console.log(" ", h));
}

console.log("\nLOCK forces .sec padding-block:", /padding-block:var\(--sec-y\)\s*!important/.test(lock));

// Sections that have class "sec"
const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)[1];
for (const id of ids) {
  const m = body.match(new RegExp(`<section[^>]*id=["']${id}["'][^>]*>`, "i"));
  console.log(id, m ? m[0].replace(/\s+/g, " ").slice(0, 120) : "MISSING");
}
