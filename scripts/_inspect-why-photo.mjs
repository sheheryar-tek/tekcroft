import fs from "fs";

const s = fs.readFileSync("scripts/_extracted-seo-audit-why/section.html", "utf8");
console.log("len", s.length);
console.log("head", s.slice(0, 600));
console.log("---");
console.log("base64 idx", s.indexOf("base64"));
console.log("data:image idx", s.indexOf("data:image"));
const imgs = [...s.matchAll(/<(img|image)[^>]*>/gi)].map((m) => m[0].slice(0, 200));
console.log("img tags", imgs.length, imgs.slice(0, 5));
const backgrounds = [...s.matchAll(/background(?:-image)?\s*:\s*url\([^)]{0,80}/gi)].map(
  (m) => m[0]
);
console.log("bg urls", backgrounds);
// also check CSS
const css = fs.readFileSync("scripts/_extracted-seo-audit-why/wa-styles.css", "utf8");
console.log("css base64", css.indexOf("base64"));
console.log("css data:image", css.indexOf("data:image"));
const cssBg = [...css.matchAll(/url\([^)]{0,100}/gi)].map((m) => m[0]);
console.log("css urls", cssBg);

// look for object-position (photo crop hint)
const op = s.indexOf("object-position");
console.log("object-position in section", op, op >= 0 ? s.slice(op - 100, op + 80) : "");
const opc = css.indexOf("object-position");
console.log("object-position in css", opc, opc >= 0 ? css.slice(opc - 100, opc + 80) : "");
