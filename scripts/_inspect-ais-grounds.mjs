import fs from "fs";

const html = fs.readFileSync(
  "C:/Users/Super/Downloads/tekcroft-artificial-intelligence-services (3).html",
  "utf8"
);
const secs = [
  ...html.matchAll(
    /<section([^>]*id=["']([^"']+)["'][^>]*)>/gi
  ),
].map((m) => {
  const attrs = m[1];
  const id = m[2];
  const g = (attrs.match(/data-ground=["']([^"']+)["']/) || [])[1] || "";
  return `${id}${g ? ` (${g})` : ""}`;
});
console.log(secs.join("\n"));

const groundHits = [
  ...html.matchAll(/#(proof-v3|build-v3|model|tech-v4|integ|govern|process|industries|why|models|faq|contact)[^{]{0,40}\{[^}]{0,80}--ground[^;]+;/gi),
];
console.log("\nground decls", groundHits.length);
groundHits.slice(0, 40).forEach((m) => console.log(m[0]));
