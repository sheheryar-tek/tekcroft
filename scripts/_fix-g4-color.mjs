import fs from "fs";
const p = "c:/Tekcroft/app/artificial-intelligence-services-unlock.css";
let s = fs.readFileSync(p, "utf8");
const before = s;
s = s.replace(
  /(html\[data-design="raw"\] #tech-v4 \.g4-docs span\{[^}]*?)color:\s*var\(--text-2\)\s*!important/,
  "$1color:var(--text-2)"
);
fs.writeFileSync(p, s);
console.log(before === s ? "no change" : "updated");
console.log((s.match(/\.g4-docs span\{[^}]+\}/) || [])[0]);
