import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = path.join(ROOT, "lib/homepage-body.html");
let html = fs.readFileSync(file, "utf8");

html = html.replace(
  /<img[^>]*\/images\/hero-1\.webp[^>]*>/i,
  '<img src="/images/hero-1.webp" alt="" width="700" height="467" decoding="async" fetchpriority="high">'
);
html = html.replace(
  /<img[^>]*\/images\/hero-2\.webp[^>]*>/i,
  '<img src="/images/hero-2.webp" alt="" width="620" height="414" loading="lazy" decoding="async">'
);

fs.writeFileSync(file, html);
console.log("hero dimensions updated");

const mm = path.join(ROOT, "public", "tekcroft-mm.js");
let js = fs.readFileSync(mm, "utf8");
const old =
  'return \'<img src="\'+BG[k]+\'" alt="" loading="lazy" data-key="\'+k+\'"\'+(k===BG_IDLE?\' data-on="true"\':\'\')+\'>\';';
const neu =
  'return \'<img src="\'+BG[k]+\'" alt="" width="760" height="507" loading="lazy" decoding="async" data-key="\'+k+\'"\'+(k===BG_IDLE?\' data-on="true"\':\'\')+\'>\';';
if (!js.includes(old)) {
  console.error("mm img template not found");
  process.exit(1);
}
js = js.replace(old, neu);
fs.writeFileSync(mm, js);
console.log("mm img attrs updated");
