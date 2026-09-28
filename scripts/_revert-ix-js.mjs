import fs from "fs";
const p = "public/tekcroft-main.js";
let s = fs.readFileSync(p, "utf8");
const from = "board.querySelectorAll('.ix-chip, .ig-card')";
const to = "board.querySelectorAll('.ix-chip')";
if (!s.includes(from)) {
  console.log("selector already reverted or missing");
} else {
  s = s.replace(from, to);
  fs.writeFileSync(p, s);
  console.log("js reverted");
}
