import fs from "fs";

const html = fs.readFileSync(
  ".next/server/app/(site)/ai-seo-services.html",
  "utf8"
);
const decoded = html
  .replace(/\\u003c/g, "<")
  .replace(/\\u003e/g, ">")
  .replace(/\\u0026/g, "&")
  .replace(/\\n/g, "\n");

const content = decoded.replace(/<!--[\s\S]*?-->/g, "");
const dashes = content.match(/&mdash;|&#8212;|&#x2014;|\u2014/gi) || [];
console.log("content emdashes in built page:", dashes.length);

const must = [
  "aiseo-hero-m-4e5a2e9f78",
  "aiseo-tm-01-b8d0910eb7",
  "aiseo-proc-discovery-3069d27fb7",
  "aiseo-faq-33fc3b8544",
  "Thanks, that's everything",
  "Tekcroft, Digital Marketing Agency",
];
for (const m of must) {
  console.log(m, content.includes(m) || decoded.includes(m) ? "ok" : "MISSING");
}
