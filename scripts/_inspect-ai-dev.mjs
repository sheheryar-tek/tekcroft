import fs from "fs";
import path from "path";

const src = path.resolve(
  "C:/Users/Super/Downloads/tekcroft-ai-development (2).html"
);
const t = fs.readFileSync(src, "utf8");
console.log("size_mb", (Buffer.byteLength(t) / 1e6).toFixed(2));
console.log("chars", t.length);
const title = (t.match(/<title>([\s\S]*?)<\/title>/i) || [])[1];
console.log("title", title);
const ids = [...t.matchAll(/<section[^>]*\bid=["']([^"']+)/gi)].map((m) => m[1]);
console.log("section ids", ids);
const h1 = t.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
console.log(
  "h1",
  h1 ? h1[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim().slice(0, 240) : null
);
console.log("style tags", (t.match(/<style/gi) || []).length);
console.log("script tags", (t.match(/<script/gi) || []).length);
console.log("data:image", (t.match(/data:image/g) || []).length);
console.log("has main", /<main/i.test(t));
console.log("lines", t.split(/\r?\n/).length);

// meta description
const desc = t.match(
  /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i
) || t.match(
  /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i
);
console.log("desc", desc ? desc[1].slice(0, 300) : null);

// class pattern clues
for (const cls of ["hs ", "acv", "svc-cn", "wy ", "faq", "cn-", "sec "]) {
  console.log("has", cls.trim(), t.includes(cls));
}

// print short outline of body tags with id/class
const body = t.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] || t;
const outline = [];
const re = /<(section|header|main|footer|div)([^>]*)>/gi;
let m;
let n = 0;
while ((m = re.exec(body)) && n < 80) {
  const tag = m[1];
  const attrs = m[2];
  const id = (attrs.match(/\bid=["']([^"']+)/) || [])[1];
  const cls = (attrs.match(/\bclass=["']([^"']+)/) || [])[1];
  if (tag === "div" && !id && !(cls || "").match(/^(wrap|sec|hs|nav|mm|faq|wy|ac|cn|cta)/)) continue;
  outline.push({ tag, id: id || "", cls: (cls || "").slice(0, 80) });
  n++;
}
console.log("outline", JSON.stringify(outline, null, 2));
