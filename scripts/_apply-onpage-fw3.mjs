import fs from "fs";
import path from "path";

const ROOT = "c:/Tekcroft";
const REF = "c:/Users/Super/Downloads/tekcroft-onpage-seo (11).html";
const OUT = path.join(ROOT, "scripts/_extracted-onpage-fw3");
const bodyPath = path.join(ROOT, "lib/on-page-seo-body.html");
const cssPath = path.join(ROOT, "app/on-page-seo.css");
const jsPath = path.join(ROOT, "public/tekcroft-on-page-seo.js");

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
  const marker = '<section class="sec fw3" id="framework-v3"';
  const tag = h.indexOf(marker);
  if (tag < 0) throw new Error("framework-v3 section missing");
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
  if (end < 0) throw new Error("framework-v3 unclosed");
  return h.slice(tag, end);
}

function replaceSection(body, openMarker, insert) {
  const oldTag = body.indexOf(openMarker);
  if (oldTag < 0) throw new Error("existing section missing: " + openMarker);
  let commentStart = oldTag;
  const comment = body.lastIndexOf("<!--", oldTag);
  if (comment >= 0 && comment > oldTag - 600) {
    const between = body.slice(comment, oldTag);
    if (!between.includes("</section>") && /BUILT TO RANK|framework/i.test(between)) {
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
section = section.replace(/\s+data-fw-variant="3"/, "");
if (section.includes("data-fw-variant")) {
  throw new Error("data-fw-variant still present after strip");
}
fs.writeFileSync(path.join(OUT, "section.html"), section);
console.log("section bytes", section.length);

const css = extractStyle("fw3-styles");
fs.writeFileSync(path.join(OUT, "fw3-styles.css"), css);
console.log("fw3-styles", css.length);

const js = extractScript("fw3-script");
fs.writeFileSync(path.join(OUT, "fw3-script.js"), js);
console.log("fw3-script", js.length);

/* ── apply body: replace #framework with dial variant ───────────────── */
let body = fs.readFileSync(bodyPath, "utf8");
const insert =
  "<!-- ============================================================ BUILT TO RANK — dial (variant 3) -->\n" +
  section +
  "\n";

if (body.includes('id="framework-v3"')) {
  body = replaceSection(body, '<section class="sec fw3" id="framework-v3"', insert);
  console.log("body: replaced existing #framework-v3");
} else if (body.includes('<section class="sec ob" id="framework"')) {
  body = replaceSection(body, '<section class="sec ob" id="framework"', insert);
  console.log("body: replaced #framework with #framework-v3");
} else {
  throw new Error("no framework section to replace");
}
fs.writeFileSync(bodyPath, body);

/* ── CSS ─────────────────────────────────────────────────────────────── */
const cssMarker = "/* === BUILT TO RANK — dial (fw3) from onpage ref (11) === */";
let siteCss = fs.readFileSync(cssPath, "utf8");
if (siteCss.includes(cssMarker)) {
  siteCss = siteCss.slice(0, siteCss.indexOf(cssMarker)).replace(/\s+$/, "") + "\n";
}
siteCss += "\n\n" + cssMarker + "\n" + css + "\n";

/* ground / rhythm lists still say #framework — point them at #framework-v3 */
siteCss = siteCss.replace(/#framework(?!-)/g, "#framework-v3");
fs.writeFileSync(cssPath, siteCss);
console.log("css: wrote fw3-styles + retargeted #framework → #framework-v3");

/* ── JS ──────────────────────────────────────────────────────────────── */
const jsMarker = "/* === fw3-script (Built to Rank dial) === */";
let siteJs = fs.readFileSync(jsPath, "utf8");
if (siteJs.includes(jsMarker)) {
  siteJs = siteJs.slice(0, siteJs.indexOf(jsMarker)).replace(/\s+$/, "") + "\n";
}
siteJs += "\n\n" + jsMarker + "\n" + js.trim() + "\n";
fs.writeFileSync(jsPath, siteJs);
console.log("js: appended fw3-script");

/* verify */
const check = fs.readFileSync(bodyPath, "utf8");
if (!check.includes('id="framework-v3"') || !check.includes("data-dial")) {
  throw new Error("section verify failed");
}
if (check.includes('data-fw-variant')) {
  throw new Error("data-fw-variant leaked into body");
}
if (check.includes('<section class="sec ob" id="framework"')) {
  throw new Error("old #framework still present");
}
if (check.includes('id="framework-v2"')) {
  throw new Error("accidentally included framework-v2");
}
const cssCheck = fs.readFileSync(cssPath, "utf8");
if (!cssCheck.includes("#framework-v3") || !cssCheck.includes(".fw3-dial")) {
  throw new Error("css verify failed");
}
if (cssCheck.includes("vsw-styles") || cssCheck.includes("fz-styles")) {
  throw new Error("unexpected variant/switch styles");
}
const jsCheck = fs.readFileSync(jsPath, "utf8");
if (!jsCheck.includes("framework-v3") || !jsCheck.includes("data-dial")) {
  throw new Error("js verify failed");
}
console.log("done");
