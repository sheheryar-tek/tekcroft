import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const IMG_DIR = path.join(ROOT, "public", "images");

const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  "agent-transcripts",
]);

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(ent.name)) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const files = walk(ROOT).filter((p) => {
  const ext = path.extname(p).toLowerCase();
  // Don't scan image binaries themselves
  if (p.startsWith(IMG_DIR + path.sep) || p.startsWith(IMG_DIR + "/")) return false;
  return [
    ".html",
    ".css",
    ".js",
    ".mjs",
    ".ts",
    ".tsx",
    ".json",
    ".md",
    ".svg",
  ].includes(ext);
});

let blob = "";
for (const f of files) {
  try {
    blob += fs.readFileSync(f, "utf8") + "\n";
  } catch {
    // binary/unreadable
  }
}

const images = fs.readdirSync(IMG_DIR).filter((n) =>
  /\.(webp|png|jpe?g|svg|gif|avif)$/i.test(n)
);

const unused = [];
const used = [];
for (const name of images) {
  if (blob.includes(name)) used.push(name);
  else unused.push(name);
}

console.log("TOTAL", images.length);
console.log("USED", used.length);
console.log("UNUSED", unused.length);
for (const n of unused.sort()) console.log(n);
