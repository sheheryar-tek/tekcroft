import fs from "fs";
const b = fs.readFileSync("c:/Tekcroft/lib/franchise-seo-body.html", "utf8");
const i = b.indexOf('id="signs"');
const start = b.lastIndexOf("<section", i);
let depth = 0;
let p = start;
while (p < b.length) {
  const o = b.indexOf("<section", p);
  const c = b.indexOf("</section>", p);
  if (c < 0) break;
  if (o >= 0 && o < c) {
    depth++;
    p = o + 8;
    continue;
  }
  depth--;
  p = c + "</section>".length;
  if (depth === 0) {
    console.log("start", start, "end", p);
    console.log("AFTER:", JSON.stringify(b.slice(p, p + 120)));
    console.log("END:", JSON.stringify(b.slice(p - 100, p)));
    // also check for comment before signs
    const before = b.lastIndexOf("<!--", start);
    console.log("comment before distance", start - before);
    console.log("comment preview", JSON.stringify(b.slice(before, before + 80)));
    break;
  }
}
