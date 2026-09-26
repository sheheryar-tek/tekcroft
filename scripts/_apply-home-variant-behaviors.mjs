import fs from "fs";

const REF = "c:/Users/Super/Downloads/tekcroft-home (5).html";
const jsPath = "c:/Tekcroft/public/tekcroft-main.js";
const html = fs.readFileSync(REF, "utf8");
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);

const needed = [6, 8, 16]; // nsr, blueprint, ix
let js = fs.readFileSync(jsPath, "utf8");

const marker = "/* === home variants: section behaviors (nsr / blueprint / ix) === */";
if (js.includes(marker)) {
  js = js.slice(0, js.indexOf(marker)).trimEnd() + "\n";
}

const chunks = needed.map((i) => {
  const body = scripts[i];
  if (!body) throw new Error("missing script " + i);
  return `/* --- ref script ${i} --- */\n` + body.trim();
});

js = js.trimEnd() + "\n\n" + marker + "\n" + chunks.join("\n\n") + "\n";
fs.writeFileSync(jsPath, js);
console.log("appended behavior scripts", chunks.map((c) => c.length));
