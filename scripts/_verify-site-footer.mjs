import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LIB = path.join(ROOT, "lib");
const foot = fs.readFileSync(path.join(LIB, "site-footer.html"), "utf8").trim();
const bodies = fs.readdirSync(LIB).filter((n) => n.endsWith("-body.html"));
const bad = [];
for (const n of bodies) {
  const h = fs.readFileSync(path.join(LIB, n), "utf8");
  if (!h.includes(foot)) bad.push(n);
}
console.log(
  bad.length
    ? `mismatch (${bad.length}): ${bad.join(", ")}`
    : `all ${bodies.length} bodies match site-footer.html`
);
