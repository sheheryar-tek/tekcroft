import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const bodyPath = path.join(ROOT, "lib", "technical-seo-body.html");
let body = fs.readFileSync(bodyPath, "utf8");

const marker = 'id="crawl-check"';
const i = body.indexOf(marker);
if (i < 0) {
  console.error("crawl-check not found");
  process.exit(1);
}
const start = body.lastIndexOf("<!--", i);
const next = body.indexOf('id="platforms"');
const end = next >= 0 ? body.lastIndexOf("<!--", next) : -1;
if (start < 0 || end < 0) {
  console.error("bounds", start, end);
  process.exit(1);
}
body = body.slice(0, start) + body.slice(end);
fs.writeFileSync(bodyPath, body);
console.log("Removed Free Crawl Check section");
