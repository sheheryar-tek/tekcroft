import fs from "fs";
import path from "path";

// Content/source roots only — skip scripts/ (pattern definitions intentionally contain mojibake literals)
const roots = ["app", "components", "content", "data", "lib", "public"];
const exts = new Set([
  ".tsx", ".ts", ".js", ".jsx", ".json", ".md", ".mdx", ".html", ".txt", ".css", ".mjs",
]);
const skip = new Set(["node_modules", ".next", ".git"]);

const pats = [
  { n: "U+FFFD", re: /\uFFFD/g },
  { n: "â€™", re: /â€™/g },
  { n: "â€œ", re: /â€œ/g },
  { n: "â€", re: /â€/g },
  { n: "â€“", re: /â€“/g },
  { n: "â€”", re: /â€”/g },
  { n: "Â ", re: /Â /g },
  { n: "Ã©", re: /Ã©/g },
];

function walk(d, out = []) {
  if (!fs.existsSync(d)) return out;
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (skip.has(e.name)) continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (exts.has(path.extname(e.name))) out.push(p);
  }
  return out;
}

const files = roots.flatMap((r) => walk(r));
const hits = [];

for (const f of files) {
  let s;
  try {
    s = fs.readFileSync(f, "utf8");
  } catch {
    continue;
  }
  const lines = s.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const kinds = [];
    for (const p of pats) {
      if (p.re.test(line)) {
        p.re.lastIndex = 0;
        kinds.push(p.n);
      }
      p.re.lastIndex = 0;
    }
    if (kinds.length) {
      hits.push({
        file: f.replace(/\\/g, "/"),
        line: i + 1,
        kinds,
        snippet: line.trim().slice(0, 200),
      });
    }
  }
}

console.log(JSON.stringify({ fileCount: files.length, hitCount: hits.length, hits }, null, 2));
