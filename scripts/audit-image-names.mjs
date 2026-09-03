import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const css = fs.readFileSync(path.join(ROOT, "app/tekcroft.css"), "utf8");
const re = /(--[a-z0-9-]+)\s*:\s*url\(\s*["']?(data:image\/[a-zA-Z0-9+.-]+;base64,[A-Za-z0-9+/=]+)["']?\s*\)/gi;
let m;
const vars = [];
while ((m = re.exec(css))) {
  vars.push({ name: m[1], type: m[2].slice(11, m[2].indexOf(";")), kb: Math.round(Buffer.from(m[2].split(",")[1], "base64").length / 1024) });
}
console.log("CSS custom props with images:");
vars.forEach((v) => console.log(v.name, v.type, v.kb + "KB"));

// hero imgs in body
const body = fs.readFileSync(path.join(ROOT, "lib/homepage-body.html"), "utf8");
const imgs = [...body.matchAll(/<img\b[^>]*>/gi)];
console.log("\nIMG tags:", imgs.length);
imgs.forEach((im, i) => console.log(i + 1, im[0].slice(0, 180).replace(/\s+/g, " ")));

// BG keys in mm.js
const mm = fs.readFileSync(path.join(ROOT, "public/tekcroft-mm.js"), "utf8");
const bg = mm.match(/var BG\s*=\s*\{[\s\S]*?\};/);
if (bg) console.log("\nBG object keys sample:", bg[0].slice(0, 200));
const keyRe = /(\w+)\s*:\s*"data:image/g;
let km;
const keys = [];
while ((km = keyRe.exec(mm))) keys.push(km[1]);
console.log("MM BG keys:", keys);
