import fs from "fs";

const h = fs.readFileSync(
  "C:/Users/Super/Downloads/tekcroft-ai-development (2).html",
  "utf8"
);
const ids = ["foot-styles", "foot-lift", "foot-final", "fw-foot"];
for (const id of ids) {
  const re = new RegExp(
    `<style[^>]*id="${id}"[^>]*>([\\s\\S]*?)</style>`,
    "i"
  );
  const m = h.match(re);
  console.log("===", id, m ? m[1].length : "MISSING");
  if (m) {
    const t = m[1];
    const bits = t.match(/\.ft4[^{]*\{[^}]+\}|\.ftm[^{]*\{[^}]+\}|\.ft4-plate[^{]*\{[^}]+\}/g);
    console.log(bits ? bits.join("\n") : t.slice(0, 1500));
  }
  console.log("---");
}

// also search for max-width near ft4 in whole file styles
const idx = h.indexOf(".ft4{");
console.log("first .ft4{", idx);
if (idx > 0) console.log(h.slice(idx, idx + 800));
