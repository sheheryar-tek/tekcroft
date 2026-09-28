import fs from "fs";

const p = "c:/Tekcroft/lib/on-page-seo-body.html";
let html = fs.readFileSync(p, "utf8");

function extract(src, id) {
  const re = new RegExp(`<section\\b[^>]*\\bid="${id}"[^>]*>`);
  const m = src.match(re);
  if (!m || m.index == null) throw new Error("missing " + id);
  const tagStart = m.index;
  let commentStart = tagStart;
  const comment = src.lastIndexOf("<!--", tagStart);
  if (comment >= 0 && comment > tagStart - 900) {
    const between = src.slice(comment, tagStart);
    if (!between.includes("</section>") && !between.includes("<section")) {
      commentStart = comment;
    }
  }
  let i = tagStart;
  let depth = 0;
  let end = -1;
  while (i < src.length) {
    if (src.startsWith("<section", i)) {
      depth++;
      i = src.indexOf(">", i) + 1;
      continue;
    }
    if (src.startsWith("</section>", i)) {
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
  if (end < 0) throw new Error("unclosed " + id);
  return { start: commentStart, end };
}

const sec = extract(html, "clients");
html = html.slice(0, sec.start) + html.slice(sec.end);
fs.writeFileSync(p, html);

if (html.includes('id="clients"') || html.includes("Trusted by")) {
  // Trusted by might appear elsewhere — only fail if section remains
  if (html.includes('id="clients"')) throw new Error("clients still present");
}
const ids = [];
const r = /<section\b[^>]*\bid="([^"]+)"/g;
let mm;
while ((mm = r.exec(html))) ids.push(mm[1]);
console.log(ids.join(" → "));
console.log("done");
