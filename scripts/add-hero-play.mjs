import fs from "fs";
const p = "lib/homepage-body.html";
let h = fs.readFileSync(p, "utf8");
if (!h.includes('class="hero on-dark play"')) {
  h = h.replace(
    'class="hero on-dark" id="top"',
    'class="hero on-dark play" id="top"'
  );
  fs.writeFileSync(p, h);
}
console.log("hero play:", h.includes('class="hero on-dark play"'));
