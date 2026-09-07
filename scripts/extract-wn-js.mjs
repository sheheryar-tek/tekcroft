import fs from "fs";
const src = fs.readFileSync(
  "c:/Users/Super/Desktop/TK FINAL/Homepage/tekcroft-site-mega-menus (15).html",
  "utf8"
);
const start = src.indexOf("why us: the panel");
const end = src.indexOf("selected work", start);
console.log(src.slice(start, end).slice(0, 3500));
