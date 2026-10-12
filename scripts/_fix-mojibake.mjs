/**
 * Replace common UTF-8→Latin-1 mojibake in HTML/JS sources.
 * â€" → — (em dash), â€™ → ', â€œ/â€ → curly quotes, etc.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const REPLACEMENTS = [
  ["â€”", "—"], // em dash
  ["â€“", "–"], // en dash
  ["â€™", "'"], // right single quote
  ["â€˜", "'"], // left single quote
  ["â€œ", '"'], // left double quote
  ["â€", '"'], // right double quote
  ["â€¦", "…"], // ellipsis
  ["Â ", " "], // nbsp artifacts sometimes
];

function fixFile(fp) {
  let s = fs.readFileSync(fp, "utf8");
  let n = 0;
  for (const [bad, good] of REPLACEMENTS) {
    if (!s.includes(bad)) continue;
    const parts = s.split(bad);
    n += parts.length - 1;
    s = parts.join(good);
  }
  if (n) {
    fs.writeFileSync(fp, s);
    console.log(path.relative(ROOT, fp), n);
  }
  return n;
}

function walk(dir, pred, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      if (f === "node_modules" || f === ".next" || f === ".git") continue;
      walk(p, pred, out);
    } else if (pred(f, p)) {
      out.push(p);
    }
  }
  return out;
}

let total = 0;
const files = [
  ...walk(path.join(ROOT, "lib"), (f) => /\.(html|json)$/.test(f)),
  ...walk(path.join(ROOT, "app"), (f) => /\.(css|tsx|ts|jsx|js|html)$/.test(f)),
  ...walk(path.join(ROOT, "public"), (f) =>
    /^tekcroft-.*\.js$/.test(f) && !/\.[a-f0-9]{10}\.js$/.test(f)
  ),
];

for (const fp of files) total += fixFile(fp);

console.log("total replacements", total);
