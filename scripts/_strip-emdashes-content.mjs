import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const lib = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "lib");
const files = fs
  .readdirSync(lib)
  .filter((f) => f.endsWith("-body.html") || f === "homepage-body.html");

function splitComments(html) {
  const parts = [];
  const re = /<!--[\s\S]*?-->/g;
  let last = 0;
  let m;
  while ((m = re.exec(html))) {
    if (m.index > last) parts.push({ t: "c", s: html.slice(last, m.index) });
    parts.push({ t: "x", s: m[0] });
    last = m.index + m[0].length;
  }
  if (last < html.length) parts.push({ t: "c", s: html.slice(last) });
  return parts;
}

function cleanContent(s) {
  let out = s;
  out = out.replace(/&mdash;/g, ",");
  out = out.replace(/&#8212;/g, ",");
  out = out.replace(/&#x2014;/gi, ",");
  out = out.replace(/\u2014/g, ",");
  // "word ," -> "word," (spaces only — do not touch tabs/newlines/indent)
  out = out.replace(/ +,/g, ",");
  // ",word" -> ", word"
  out = out.replace(/,([A-Za-z])/g, ", $1");
  return out;
}

let total = 0;
for (const f of files) {
  const p = path.join(lib, f);
  const raw = fs.readFileSync(p, "utf8");
  const before = (raw.match(/&mdash;|&#8212;|&#x2014;|\u2014/gi) || []).length;
  if (!before) continue;
  const next = splitComments(raw)
    .map((part) => (part.t === "c" ? cleanContent(part.s) : part.s))
    .join("");
  const after = (next.match(/&mdash;|&#8212;|&#x2014;|\u2014/gi) || []).length;
  const remContent = (
    splitComments(next)
      .filter((x) => x.t === "c")
      .join("")
      .match(/&mdash;|&#8212;|&#x2014;|\u2014/gi) || []
  ).length;
  fs.writeFileSync(p, next);
  total += before - after;
  console.log(
    `${f}: before=${before} after=${after} contentRemain=${remContent}`
  );
}
console.log("done removedApprox", total);
