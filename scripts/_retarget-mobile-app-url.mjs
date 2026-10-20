import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OLD = "/mobile-app-development-services";
const NEW = "/mobile-app-development-services";
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
    // Skip already-hashed mm bundles; source tekcroft-mm.js + hash-assets refreshes them
    if (/tekcroft-mm\.[a-f0-9]+\.js$/i.test(e.name)) continue;
    // Keep redirect source path intact in next.config.js
    if (e.name === "next.config.js") continue;

    let t = fs.readFileSync(p, "utf8");
    if (!t.includes(OLD)) continue;

    // Avoid double-suffix if NEW already present as longer path
    let next = t.replaceAll(
      /\/services\/mobile-app-development(?!-services)/g,
      NEW
    );
    next = next.replace(
      /app\/services\/mobile-app-development\/page\.tsx/g,
      "app/(site)/mobile-app-development-services/page.tsx"
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
