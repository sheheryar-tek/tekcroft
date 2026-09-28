import fs from "fs";
import path from "path";

const ROOT = "c:/Tekcroft";
const REF = "c:/Users/Super/Downloads/tekcroft-onpage-seo (11).html";
const OUT = path.join(ROOT, "scripts/_extracted-onpage-fz");
const bodyPath = path.join(ROOT, "lib/on-page-seo-body.html");
const cssPath = path.join(ROOT, "app/on-page-seo.css");
const jsPath = path.join(ROOT, "public/tekcroft-on-page-seo.js");

const STYLE_IDS = [
  "fz-styles",
  "fz-fix",
  "fz-nodesc",
  "fz-tight",
  "fz-centre",
  "fz-centre2",
];

fs.mkdirSync(OUT, { recursive: true });
const h = fs.readFileSync(REF, "utf8");

function extractStyle(id) {
  const open = `<style id="${id}">`;
  const a = h.indexOf(open);
  if (a < 0) throw new Error("missing style: " + id);
  const b = h.indexOf("</style>", a);
  if (b < 0) throw new Error("unclosed style: " + id);
  return h.slice(a + open.length, b);
}

function extractScript(id) {
  const open = `<script id="${id}">`;
  const a = h.indexOf(open);
  if (a < 0) throw new Error("missing script: " + id);
  const b = h.indexOf("</script>", a);
  if (b < 0) throw new Error("unclosed script: " + id);
  return h.slice(a + open.length, b);
}

function extractSection() {
  const marker = '<section class="sec fz" id="framework-v2"';
  const tag = h.indexOf(marker);
  if (tag < 0) throw new Error("framework-v2 section missing");
  let i = tag;
  let depth = 0;
  let end = -1;
  while (i < h.length) {
    if (h.startsWith("<section", i)) {
      depth++;
      i = h.indexOf(">", i) + 1;
      continue;
    }
    if (h.startsWith("</section>", i)) {
      depth--;
      i += "</section>".length;
      if (depth === 0) {
        end = i;
        break;
      }
      continue;
    }
    i++;
  }
  if (end < 0) throw new Error("framework-v2 unclosed");
  return h.slice(tag, end);
}

function replaceSection(body, openMarker, insert) {
  const oldTag = body.indexOf(openMarker);
  if (oldTag < 0) throw new Error("existing section missing: " + openMarker);
  let commentStart = oldTag;
  const comment = body.lastIndexOf("<!--", oldTag);
  if (comment >= 0 && comment > oldTag - 600) {
    const between = body.slice(comment, oldTag);
    if (!between.includes("</section>") && /BUILT TO RANK|framework|dial|zig/i.test(between)) {
      commentStart = comment;
    }
  }
  let i = oldTag;
  let depth = 0;
  let end = -1;
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
        end = i;
        break;
      }
      continue;
    }
    i++;
  }
  if (end < 0) throw new Error("existing section unclosed");
  return body.slice(0, commentStart) + insert + body.slice(end);
}

let section = extractSection();
section = section.replace(/\s+data-fw-variant="2"/, "");
if (section.includes("data-fw-variant")) {
  throw new Error("data-fw-variant still present after strip");
}
fs.writeFileSync(path.join(OUT, "section.html"), section);
console.log("section bytes", section.length);

let cssBundle = "";
for (const id of STYLE_IDS) {
  const css = extractStyle(id);
  fs.writeFileSync(path.join(OUT, id + ".css"), css);
  cssBundle += `\n/* --- ${id} --- */\n` + css + "\n";
  console.log("style", id, css.length);
}
fs.writeFileSync(path.join(OUT, "bundle.css"), cssBundle);

const fzJs = extractScript("fz-script");
fs.writeFileSync(path.join(OUT, "fz-script.js"), fzJs);
console.log("fz-script", fzJs.length);

/* ── body: replace dial (#framework-v3) with zig-zag (#framework-v2) ─── */
let body = fs.readFileSync(bodyPath, "utf8");
const insert =
  "<!-- ============================================================ BUILT TO RANK — zig-zag (variant 2) -->\n" +
  section +
  "\n";

if (body.includes('id="framework-v2"') && body.includes('class="sec fz"')) {
  body = replaceSection(body, '<section class="sec fz" id="framework-v2"', insert);
  console.log("body: replaced existing #framework-v2");
} else if (body.includes('<section class="sec fw3" id="framework-v3"')) {
  body = replaceSection(body, '<section class="sec fw3" id="framework-v3"', insert);
  console.log("body: replaced #framework-v3 with #framework-v2");
} else if (body.includes('<section class="sec ob" id="framework"')) {
  body = replaceSection(body, '<section class="sec ob" id="framework"', insert);
  console.log("body: replaced #framework with #framework-v2");
} else {
  throw new Error("no framework section to replace");
}
fs.writeFileSync(bodyPath, body);

/* ── CSS: drop fw3 block, write six fz blocks in order ───────────────── */
const fw3Marker = "/* === BUILT TO RANK — dial (fw3) from onpage ref (11) === */";
const fzMarker = "/* === BUILT TO RANK — zig-zag (fz) from onpage ref (11) === */";
let siteCss = fs.readFileSync(cssPath, "utf8");
if (siteCss.includes(fw3Marker)) {
  siteCss = siteCss.slice(0, siteCss.indexOf(fw3Marker)).replace(/\s+$/, "") + "\n";
}
if (siteCss.includes(fzMarker)) {
  siteCss = siteCss.slice(0, siteCss.indexOf(fzMarker)).replace(/\s+$/, "") + "\n";
}
siteCss +=
  "\n\n" +
  fzMarker +
  "\n" +
  "/* Six style blocks in reference order. Later blocks correct earlier ones. */\n" +
  cssBundle +
  "\n";

/* ground / rhythm: point framework slot at #framework-v2 */
siteCss = siteCss.replace(/#framework-v3/g, "#framework-v2");
siteCss = siteCss.replace(/#framework(?!-)/g, "#framework-v2");
fs.writeFileSync(cssPath, siteCss);
console.log("css: wrote 6 fz blocks; retargeted framework id");

/* ── JS: drop fw3-script, add fz-script ──────────────────────────────── */
const fw3JsMarker = "/* === fw3-script (Built to Rank dial) === */";
const fzJsMarker = "/* === fz-script (Built to Rank zig-zag) === */";
let siteJs = fs.readFileSync(jsPath, "utf8");
if (siteJs.includes(fw3JsMarker)) {
  siteJs = siteJs.slice(0, siteJs.indexOf(fw3JsMarker)).replace(/\s+$/, "") + "\n";
}
if (siteJs.includes(fzJsMarker)) {
  siteJs = siteJs.slice(0, siteJs.indexOf(fzJsMarker)).replace(/\s+$/, "") + "\n";
}
siteJs += "\n\n" + fzJsMarker + "\n" + fzJs.trim() + "\n";
fs.writeFileSync(jsPath, siteJs);
console.log("js: replaced fw3 with fz-script");

/* verify */
const check = fs.readFileSync(bodyPath, "utf8");
if (!check.includes('id="framework-v2"') || !check.includes("fz-run")) {
  throw new Error("section verify failed");
}
if (check.includes("data-fw-variant")) throw new Error("data-fw-variant leaked");
if (check.includes('id="framework-v3"') || check.includes("data-dial")) {
  throw new Error("dial variant still in body");
}
if (check.includes('id="vsw"') || check.includes("fw-switch")) {
  throw new Error("review switch leaked");
}
const cssCheck = fs.readFileSync(cssPath, "utf8");
for (const id of STYLE_IDS) {
  if (!cssCheck.includes(`/* --- ${id} --- */`)) throw new Error("css missing " + id);
}
if (cssCheck.includes(".fw3-dial") || cssCheck.includes("fw3Spin")) {
  throw new Error("fw3 css still present");
}
if (cssCheck.includes("vsw-styles") || cssCheck.includes("fw3-styles")) {
  throw new Error("unexpected switch/fw3 styles");
}
const jsCheck = fs.readFileSync(jsPath, "utf8");
if (!jsCheck.includes("framework-v2") || !jsCheck.includes("fz-run")) {
  throw new Error("js verify failed");
}
if (jsCheck.includes("data-dial") || jsCheck.includes("fw3-node")) {
  throw new Error("fw3 js still present");
}
console.log("done");
