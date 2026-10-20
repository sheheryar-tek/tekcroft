import fs from "fs";
import path from "path";

const needles = [
  "/#services",
  "/#about",
  "/#work",
  "/#reviews",
  "/#top",
  "/#blueprint",
  "'/#services'",
  '"/#services"',
  "href:\"/#",
  "href:'/#",
  ", '/#about'",
  ', "/#about"',
  ", '/#work'",
  ', "/#work"',
];

function walk(d, acc = []) {
  for (const n of fs.readdirSync(d, { withFileTypes: true })) {
    if (["node_modules", ".next", ".git"].includes(n.name)) continue;
    const p = path.join(d, n.name);
    if (n.isDirectory()) walk(p, acc);
    else if (/\.(html|js|tsx|ts|mjs|json)$/.test(n.name)) acc.push(p);
  }
  return acc;
}

const hits = [];
for (const f of walk(".")) {
  if (f.includes(`${path.sep}_lh-`) || f.includes(`${path.sep}scripts${path.sep}_lh`))
    continue;
  const t = fs.readFileSync(f, "utf8");
  for (const n of needles) {
    let idx = 0;
    while ((idx = t.indexOf(n, idx)) !== -1) {
      const line = t.slice(0, idx).split(/\n/).length;
      const ctx = t
        .slice(Math.max(0, idx - 50), idx + n.length + 50)
        .replace(/\s+/g, " ");
      hits.push({
        file: f.replace(/\\/g, "/"),
        needle: n,
        line,
        ctx: ctx.slice(0, 140),
      });
      idx += n.length;
    }
  }
}
console.log(JSON.stringify(hits, null, 2));
console.log("HITS", hits.length);
