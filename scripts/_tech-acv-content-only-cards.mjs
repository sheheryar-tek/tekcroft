import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const bodyPath = path.join(ROOT, "lib", "technical-seo-body.html");
let body = fs.readFileSync(bodyPath, "utf8");

const before = (body.match(/ac-list ac-list-m/g) || []).length;
body = body.replace(/\n\s*<ul class="ac-list ac-list-m">[\s\S]*?<\/ul>/g, "");
const after = (body.match(/ac-list ac-list-m/g) || []).length;

// Ensure CTA label exact
body = body.replace(
  /Get a Custom Technical SEO Plan[^<]*/,
  "Get a Custom Technical SEO Plan "
);

fs.writeFileSync(bodyPath, body);
console.log("removed card lists:", before, "->", after);
