import fs from "fs";
const p = "scripts/_port-ecom-acv.mjs";
let s = fs.readFileSync(p, "utf8");
if (s.includes("`;")) {
  s = s.replace(/\r?\n`;\s*$/, "\n");
  fs.writeFileSync(p, s);
  console.log("fixed trailing");
} else {
  console.log("nothing to fix");
}
console.log(JSON.stringify(s.slice(-80)));
