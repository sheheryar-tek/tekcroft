import fs from "fs";

const bodyPath = "c:/Tekcroft/lib/homepage-body.html";
const jsPath = "c:/Tekcroft/public/tekcroft-main.js";
const cssPath = "c:/Tekcroft/app/tekcroft.css";

let body = fs.readFileSync(bodyPath, "utf8");

const v3Comment = body.indexOf("<!-- ══════════ INDUSTRIES · variant 3");
const v3Tag = body.indexOf('<section class="sec ix" id="industries-v3"', v3Comment);
const afterBlock = body.indexOf('<section class="sec wk" id="work">');
const blockStart = body.indexOf(
  "<!-- ============================================================ INDUSTRIES (all variants) -->"
);

if (v3Comment < 0 || v3Tag < 0 || afterBlock < 0 || blockStart < 0) {
  throw new Error("markers missing");
}

let i = v3Tag;
let depth = 0;
let v3End = -1;
while (i < body.length) {
  if (body.startsWith("<section", i)) {
    depth++;
    i = body.indexOf(">", i) + 1;
    continue;
  }
  if (body.startsWith("</section>", i)) {
    depth--;
    i += "</section>".length;
    if (depth === 0) {
      v3End = i;
      break;
    }
    continue;
  }
  i++;
}
if (v3End < 0) throw new Error("v3 unclosed");

let v3 = body.slice(v3Comment, v3End);
v3 = v3
  .replace('id="industries-v3" data-ind-variant="3"', 'id="industries"')
  .replace(
    /<!-- ══════════ INDUSTRIES · variant 3[\s\S]*?-->/,
    "<!-- ============================================================ INDUSTRIES -->"
  );

body =
  body.slice(0, blockStart) + v3 + "\n\n" + body.slice(afterBlock);

body = body.replace(/\n*<div class="vsw vsw-ind"[\s\S]*?<\/div>\n*/, "\n");

fs.writeFileSync(bodyPath, body);
console.log("body: kept industries v3 as #industries");

let js = fs.readFileSync(jsPath, "utf8");
js = js.replace(
  /\/\* === industries variant switch === \*\/\s*\(function\(\)\{[\s\S]*?\}\)\(\);\s*/,
  ""
);
fs.writeFileSync(jsPath, js);
console.log("js: removed industries switcher");

let css = fs.readFileSync(cssPath, "utf8");
css = css.replace(/#industries-v3/g, "#industries");
fs.writeFileSync(cssPath, css);
console.log("css: #industries-v3 -> #industries");

const check = fs.readFileSync(bodyPath, "utf8");
for (const id of ["industries-v2", "industries-v3", "industries-v4", "vsw-ind", 'data-ind-variant="1"']) {
  if (check.includes(id)) console.warn("STILL PRESENT:", id);
}
if (!check.includes('id="industries"')) throw new Error("industries id missing");
console.log("done");
