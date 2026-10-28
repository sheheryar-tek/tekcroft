import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const files = [
  "public/tekcroft-ai-chatbot-development.js",
  "public/tekcroft-web-design-and-development.js",
  "public/tekcroft-mobile-app-development.js",
];
const bad =
  "el.addEventListener('mouseenter',function(){ clearTimeout(rail._hi); rail._hi=setTimeout(function(){ if(at!==i) show(i); },220); }); el.addEventListener('mouseleave',function(){ clearTimeout(rail._hi); });";
const good = "el.addEventListener('mouseenter',function(){ show(i); });";

for (const rel of files) {
  const f = path.join(ROOT, rel);
  let s = fs.readFileSync(f, "utf8");
  const i = s.indexOf("/* === ac-script");
  const j = s.indexOf("/* === tm-script", i >= 0 ? i : 0);
  if (i < 0) {
    console.log("no ac", rel);
    continue;
  }
  const end = j > i ? j : s.length;
  const head = s.slice(0, i);
  let mid = s.slice(i, end);
  const tail = s.slice(end);
  if (!mid.includes("rail._hi")) {
    console.log("ac ok", rel);
    continue;
  }
  const n = mid.split(bad).length - 1;
  mid = mid.split(bad).join(good);
  fs.writeFileSync(f, head + mid + tail);
  console.log("fixed ac", rel, "replacements", n);
}
