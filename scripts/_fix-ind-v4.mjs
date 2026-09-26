import fs from "fs";

const REF = "c:/Users/Super/Downloads/tekcroft-home (5).html";
const html = fs.readFileSync(REF, "utf8");

const start = html.indexOf('<section class="sec iy" id="industries-v4"');
const end = html.indexOf('<section class="sec wk" id="work">', start);
const chunk = html.slice(start, end);
fs.writeFileSync("c:/Tekcroft/scripts/_extracted-home-variants/industries-v4-raw.html", chunk);
console.log("len", chunk.length);
console.log("has iy-card Healthcare", chunk.includes(">Healthcare</b></div>"));
console.log("corrupt marker", chunk.includes("<i>sectors served</i>"));
console.log("ix-board inside v4", chunk.includes("ix-board"));
console.log(chunk.slice(0, 800));
console.log("--- mid ---");
console.log(chunk.slice(800, 1600));
