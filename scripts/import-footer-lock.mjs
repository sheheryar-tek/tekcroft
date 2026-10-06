import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const LINE = 'import "@/app/footer-lock.css";\n';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (name === "page.tsx") files.push(p);
  }
}

const files = [];
walk(path.join(ROOT, "app"));

for (const file of files) {
  let src = fs.readFileSync(file, "utf8");
  if (!src.includes('import "@/app/') || !src.includes(".css")) continue;
  if (src.includes("footer-lock.css")) {
    console.log("has", path.relative(ROOT, file));
    continue;
  }
  const re = /import "@\/app\/[^"]+\.css";\n/g;
  let last = null;
  let m;
  while ((m = re.exec(src))) last = m;
  if (!last) {
    console.log("skip", path.relative(ROOT, file));
    continue;
  }
  const idx = last.index + last[0].length;
  src = src.slice(0, idx) + LINE + src.slice(idx);
  fs.writeFileSync(file, src);
  console.log("added", path.relative(ROOT, file));
}
