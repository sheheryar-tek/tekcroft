import fs from "fs";

const path = "public/tekcroft-seo-audit-services.js";
let s = fs.readFileSync(path, "utf8");

const start = s.indexOf("/* === mm-script === */");
if (start < 0) {
  console.error("mm-script marker not found");
  process.exit(1);
}

// Find the end of the mm IIFE: first top-level chrome / page script after mm
const markers = [
  "/* === chrome === */",
  "/* === page === */",
  "(function(){\n  \"use strict\";",
  "(function(){\r\n  \"use strict\";",
];

let end = -1;
for (const m of markers) {
  const i = s.indexOf(m, start + 10);
  if (i > start && (end < 0 || i < end)) end = i;
}

if (end < 0) {
  // Fallback: mm IIFE ends at first `})();` followed by blank line + chrome-like code
  const re = /\}\)\(\);\s*\n(?=\(function\(\)|\/\* ===)/g;
  re.lastIndex = start;
  const match = re.exec(s);
  if (!match) {
    console.error("Could not find end of mm-script");
    process.exit(1);
  }
  end = match.index + match[0].length;
}

const removed = s.slice(start, end);
s = s.slice(0, start) + s.slice(end);
fs.writeFileSync(path, s);
console.log({
  removedBytes: removed.length,
  newLen: s.length,
  startsWith: s.slice(0, 80).replace(/\s+/g, " "),
  stillHasServices: /var SERVICES\s*=/.test(s),
});
