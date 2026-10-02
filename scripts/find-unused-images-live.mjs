import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const IMG_DIR = path.join(ROOT, "public", "images");
const LIVE_ROOTS = ["lib", "app", "public", "components"].map((d) =>
  path.join(ROOT, d)
);

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === "node_modules" || ent.name === ".next") continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const files = LIVE_ROOTS.flatMap((r) => walk(r)).filter((p) => {
  if (p.startsWith(IMG_DIR)) return false;
  return /\.(html|css|js|tsx|ts|json)$/i.test(p);
});

let blob = "";
for (const f of files) {
  try {
    blob += fs.readFileSync(f, "utf8") + "\n";
  } catch {}
}

const images = fs
  .readdirSync(IMG_DIR)
  .filter((n) => /\.(webp|png|jpe?g|svg|gif|avif)$/i.test(n));

const unused = images.filter((n) => !blob.includes(n)).sort();
console.log("LIVE_UNUSED", unused.length);
for (const n of unused) console.log(n);
