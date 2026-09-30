import fs from "fs";
import path from "path";

const lib = path.join(process.cwd(), "lib");
const files = fs.readdirSync(lib).filter((f) => f.endsWith("-body.html"));

let n = 0;
for (const file of files) {
  const fp = path.join(lib, file);
  let html = fs.readFileSync(fp, "utf8");
  const next = html.replace(
    /<h1 class="hs-h1">\s*([\s\S]*?)\s*<\/h1>/g,
    (_, inner) => {
      // Flatten span-forced lines into one flowing heading; keep <em>
      let text = inner
        .replace(/<\/span>\s*<span>/gi, " ")
        .replace(/<\/?span>/gi, "")
        .replace(/\s+/g, " ")
        .trim();
      // Fix "em><em" joins that lost space
      text = text.replace(/<\/em>\s*<em>/gi, " ").replace(/<\/em>(\S)/gi, "</em> $1");
      // Collapse nested leftover spaces around em
      text = text.replace(/\s+<\/em>/g, "</em>").replace(/<em>\s+/g, "<em>");
      n++;
      return `<h1 class="hs-h1">${text}</h1>`;
    }
  );
  if (next !== html) {
    fs.writeFileSync(fp, next);
    console.log("flattened", file);
  }
}
console.log("h1s flattened:", n);

// CSS: stop forcing block spans inside hero h1
const app = path.join(process.cwd(), "app");
let cssN = 0;
for (const f of fs.readdirSync(app).filter((x) => x.endsWith(".css"))) {
  const fp = path.join(app, f);
  let css = fs.readFileSync(fp, "utf8");
  const before = css;
  css = css.replaceAll(".hs-h1 span{display:block;}", ".hs-h1 span{display:inline;}");
  css = css.replaceAll(".hs-h1 span{display:inline;}", ".hs-h1 span{display:inline;}"); // noop safe
  // mobile overrides that set span inline already fine
  if (css !== before) {
    fs.writeFileSync(fp, css);
    cssN++;
    console.log("css", f);
  }
}
console.log("css files:", cssN);

// Strengthen site-consistency heading no-break for direct child spans
const sc = path.join(app, "site-consistency.css");
let scss = fs.readFileSync(sc, "utf8");
if (!scss.includes("html body :is(h1, h2, h3, h4, h5, h6) > span{")) {
  scss = scss.replace(
    `html body :is(h1, h2, h3, h4, h5, h6) em{
  display:inline !important;
}`,
    `html body :is(h1, h2, h3, h4, h5, h6) em,
html body :is(h1, h2, h3, h4, h5, h6) > span{
  display:inline !important;
}`
  );
  fs.writeFileSync(sc, scss);
  console.log("site-consistency updated");
}

// Patch embedded consistency locks in page CSS files
for (const f of fs.readdirSync(app).filter((x) => x.endsWith(".css"))) {
  const fp = path.join(app, f);
  let css = fs.readFileSync(fp, "utf8");
  const before = css;
  css = css.replace(
    `html body :is(h1, h2, h3, h4, h5, h6) em{
  display:inline !important;
}`,
    `html body :is(h1, h2, h3, h4, h5, h6) em,
html body :is(h1, h2, h3, h4, h5, h6) > span{
  display:inline !important;
}`
  );
  if (css !== before) {
    fs.writeFileSync(fp, css);
    console.log("lock patched", f);
  }
}
