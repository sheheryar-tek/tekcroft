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
  return { start: commentStart, end, html: src.slice(commentStart, end) };
}

const fit = extract(html, "fit");
const faq = extract(html, "faq");

// Remove later block first so indices stay valid
const later = fit.start > faq.start ? fit : faq;
const earlier = fit.start > faq.start ? faq : fit;
html = html.slice(0, later.start) + html.slice(later.end);
html = html.slice(0, earlier.start) + html.slice(earlier.end);

const ind = extract(html, "industries");
const insert = "\n\n" + fit.html + "\n\n" + faq.html + "\n\n";
html = html.slice(0, ind.end) + insert + html.slice(ind.end);
fs.writeFileSync(p, html);

const ids = [];
const r = /<section\b[^>]*\bid="([^"]+)"/g;
let mm;
const check = fs.readFileSync(p, "utf8");
while ((mm = r.exec(check))) ids.push(mm[1]);
console.log(ids.join(" → "));
if (ids.indexOf("fit") !== ids.indexOf("faq") - 1) {
  throw new Error("fit must immediately precede faq");
}
console.log("done");
