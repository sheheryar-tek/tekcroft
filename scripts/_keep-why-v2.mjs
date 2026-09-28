import fs from "fs";

const bodyPath = "c:/Tekcroft/lib/homepage-body.html";
const jsPath = "c:/Tekcroft/public/tekcroft-main.js";
const cssPath = "c:/Tekcroft/app/tekcroft.css";

let body = fs.readFileSync(bodyPath, "utf8");

const v1Tag = body.indexOf('<section class="sec why" id="why" data-why-variant="1">');
const v2Tag = body.indexOf(
  '<section class="sec wy" id="why-v2" data-why-variant="2">'
);
const afterBlock = body.indexOf(
  "<!-- ---------- INVITATION, VARIANT 2 : the clearing ---------- -->"
);
const afterAlt = body.indexOf(
  "<!-- ============================================================ HOW WE APPROACH -->"
);

if (v1Tag < 0 || v2Tag < 0) throw new Error("why variant markers missing");
const after = afterBlock >= 0 ? afterBlock : afterAlt;
if (after < 0) throw new Error("after-why marker missing");

let i = v2Tag;
let depth = 0;
let v2End = -1;
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
      v2End = i;
      break;
    }
    continue;
  }
  i++;
}
if (v2End < 0) throw new Error("why-v2 unclosed");

let v2 = body.slice(v2Tag, v2End);
v2 = v2.replace(
  'id="why-v2" data-why-variant="2"',
  'id="why"'
);

body =
  body.slice(0, v1Tag) +
  "<!-- ============================================================ WHY CHOOSE US -->\n" +
  v2 +
  "\n\n\n" +
  body.slice(after);

body = body.replace(
  /\n*<!-- review aid: switch between the two "why choose us" designs -->\n*<div class="vsw" data-vsw="why"[\s\S]*?<\/div>\n*/,
  "\n"
);

fs.writeFileSync(bodyPath, body);
console.log("body: kept why v2 as #why");

let js = fs.readFileSync(jsPath, "utf8");
js = js.replace(/#why-v2/g, "#why");
js = js.replace(/getElementById\("why-v2"\)/g, 'getElementById("why")');
js = js.replace(/getElementById\('why-v2'\)/g, "getElementById('why')");
js = js.replace(
  /\/\* === why variant switch === \*\/\s*\(function\(\)\{[\s\S]*?\}\)\(\);\s*/,
  ""
);
fs.writeFileSync(jsPath, js);
console.log("js: retargeted why-v2 -> #why, removed switcher");

let css = fs.readFileSync(cssPath, "utf8");
css = css.replace(/#why-v2/g, "#why");
css = css.replace(
  /\/\* review aid: why-choose-us variant switch \*\/\s*\.vsw\{[\s\S]*?@media print\{\s*\.vsw\{display:none;\}\s*\}\s*/,
  ""
);
css = css.replace(
  "WHY CHOOSE US V2 — homepage variant (scoped to #why)",
  "WHY CHOOSE US — homepage (#why)"
);
fs.writeFileSync(cssPath, css);
console.log("css: #why-v2 -> #why, removed vsw");

const check = fs.readFileSync(bodyPath, "utf8");
for (const id of [
  "why-v2",
  'data-why-variant="1"',
  'data-why-variant="2"',
  'data-vsw="why"',
  'id="why" data-why-variant',
]) {
  if (check.includes(id)) console.warn("STILL PRESENT:", id);
}
if (!check.includes('<section class="sec wy" id="why">')) {
  throw new Error("#why (v2) missing");
}
if (check.includes('class="sec why" id="why"')) {
  throw new Error("v1 still present");
}
console.log("done");
