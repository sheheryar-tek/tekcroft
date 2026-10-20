import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OLD = "/custom-software-development-services";
const NEW = "/custom-software-development-services";
const roots = ["lib", "public", "scripts", "app"];
let n = 0;

function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) {
      if (e.name === "node_modules" || e.name === ".next") continue;
      walk(p);
      continue;
    }
    if (!/\.(html|js|tsx|ts|json|mjs)$/i.test(e.name)) continue;
    if (/tekcroft-mm\.[a-f0-9]+\.js$/i.test(e.name)) continue;

    let t = fs.readFileSync(p, "utf8");
    if (!t.includes(OLD) && !t.includes("Software Development Services")) {
      continue;
    }

    let next = t.split(OLD).join(NEW);
    next = next.replace(
      /\{name:"Software Development Services", href:"\/services\/custom-software-development-services"/g,
      '{name:"Custom Software Development Services", href:"/custom-software-development-services"'
    );
    next = next.replace(
      /(<a href="\/services\/custom-software-development-services">)Software Development Services(<\/a>)/g,
      "$1Custom Software Development Services$2"
    );
    // script path references for page.tsx
    next = next.replace(
      /app\/services\/software-development-services\/page\.tsx/g,
      "app/(site)/custom-software-development-services/page.tsx"
    );

    if (next !== t) {
      fs.writeFileSync(p, next);
      n++;
      console.log("updated", path.relative(ROOT, p));
    }
  }
}

for (const r of roots) walk(path.join(ROOT, r));
console.log("files", n);
