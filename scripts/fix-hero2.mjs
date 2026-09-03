import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = path.join(ROOT, "lib/homepage-body.html");
let html = fs.readFileSync(file, "utf8");
html = html.replace(
  /<img[^>]*\/images\/hero-2\.webp[^>]*>/i,
  '<img src="/images/hero-2.webp" alt="" width="1600" height="900" loading="lazy" decoding="async">'
);
fs.writeFileSync(file, html);
console.log("hero-2 fixed");
