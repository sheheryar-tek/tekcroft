import fs from "fs";
import path from "path";

const lib = "c:/Tekcroft/lib";
const dashRe = /&mdash;|&#8212;|&#x2014;|\u2014/gi;

function contentOnly(html) {
  return html.replace(/<!--[\s\S]*?-->/g, "");
}

let bad = 0;
for (const f of fs.readdirSync(lib).filter((x) => x.endsWith(".html"))) {
  const raw = fs.readFileSync(path.join(lib, f), "utf8");
  const c = contentOnly(raw);
  const hits = [...c.matchAll(dashRe)];
  if (hits.length) {
    bad += hits.length;
    for (const h of hits) {
      const i = h.index;
      console.log(f, JSON.stringify(c.slice(Math.max(0, i - 40), i + 40)));
    }
  }
}
console.log(bad ? `FAIL ${bad}` : "OK: no content em dashes in lib/*.html");

// sample replacements
const a = fs.readFileSync(path.join(lib, "ai-seo-body.html"), "utf8");
for (const needle of [
  "pick a service",
  "that's everything",
  "Digital Marketing Agency",
  "platform, rough page count",
  "since 2013",
]) {
  const i = a.indexOf(needle);
  console.log("---", needle, "---");
  console.log(a.slice(Math.max(0, i - 50), i + needle.length + 20).replace(/\s+/g, " "));
}
