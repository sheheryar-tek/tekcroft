import fs from "fs";

const bodyPath = "c:/Tekcroft/lib/homepage-body.html";
const jsPath = "c:/Tekcroft/public/tekcroft-main.js";
const cssPath = "c:/Tekcroft/app/tekcroft.css";

let body = fs.readFileSync(bodyPath, "utf8");

const blockStart = body.indexOf(
  "<!-- ============================================================ AI ECOSYSTEM -->"
);
const v3Comment = body.indexOf(
  "<!-- ══════════ THE NEW SEARCH REALITY · variant 3 ══════════ -->"
);
const v3Tag = body.indexOf(
  '<section class="sec nsr" id="search-split-v3"',
  v3Comment
);
const afterBlock = body.indexOf(
  "<!-- ============================================================ TESTIMONIALS -->"
);

if (blockStart < 0 || v3Comment < 0 || v3Tag < 0 || afterBlock < 0) {
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
  .replace(
    'id="search-split-v3" data-ai-variant="3"',
    'id="ai-ecosystem"'
  )
  .replace(
    "<!-- ══════════ THE NEW SEARCH REALITY · variant 3 ══════════ -->",
    "<!-- ============================================================ THE NEW SEARCH REALITY -->"
  );

body = body.slice(0, blockStart) + v3 + "\n\n\n" + body.slice(afterBlock);

body = body.replace(
  /\n*<!-- review aid: switch between the two AI-search section designs -->\n*<div class="vsw" data-vsw="ai"[\s\S]*?<\/div>\n*/,
  "\n"
);

fs.writeFileSync(bodyPath, body);
console.log("body: kept AI v3 as #ai-ecosystem");

let js = fs.readFileSync(jsPath, "utf8");
js = js.replace(
  /\/\* === ai variant switch === \*\/\s*\(function\(\)\{[\s\S]*?\}\)\(\);\s*/,
  ""
);
fs.writeFileSync(jsPath, js);
console.log("js: removed AI switcher");

let css = fs.readFileSync(cssPath, "utf8");
css = css.replace(/#search-split-v3/g, "#ai-ecosystem");
fs.writeFileSync(cssPath, css);
console.log("css: #search-split-v3 -> #ai-ecosystem");

const check = fs.readFileSync(bodyPath, "utf8");
for (const id of [
  "search-split-v3",
  'id="search-split"',
  'data-ai-variant="1"',
  'data-ai-variant="2"',
  'data-vsw="ai"',
]) {
  if (check.includes(id)) console.warn("STILL PRESENT:", id);
}
if (!check.includes('id="ai-ecosystem"')) throw new Error("ai-ecosystem missing");
console.log("done");
