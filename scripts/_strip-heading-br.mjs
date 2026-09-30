import fs from "fs";
import path from "path";

const libDir = path.join(process.cwd(), "lib");
const files = fs.readdirSync(libDir).filter((f) => f.endsWith("-body.html") || f === "homepage-body.html");

let total = 0;
for (const file of files) {
  const p = path.join(libDir, file);
  let html = fs.readFileSync(p, "utf8");
  let count = 0;
  // Remove <br> / <br/> / <br /> only inside heading tags
  html = html.replace(/<(h[1-6]\b[^>]*)>([\s\S]*?)<\/h[1-6]>/gi, (full, open, inner) => {
    if (!/<br\s*\/?>/i.test(inner)) return full;
    const cleaned = inner.replace(/<br\s*\/?>/gi, " ").replace(/[ \t]{2,}/g, " ");
    count++;
    return `<${open}>${cleaned}</${open.replace(/^(\w+).*/, "$1")}>`.replace(
      /<\/h[1-6]>$/i,
      `</${open.match(/^h[1-6]/i)[0]}>`
    );
  });
  // Safer rewrite:
  html = fs.readFileSync(p, "utf8");
  count = 0;
  html = html.replace(/<(h[1-6])(\b[^>]*)>([\s\S]*?)<\/\1>/gi, (full, tag, attrs, inner) => {
    if (!/<br\s*\/?>/i.test(inner)) return full;
    const cleaned = inner
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/[ \t]{2,}/g, " ")
      .replace(/ +\./g, ".");
    count++;
    return `<${tag}${attrs}>${cleaned}</${tag}>`;
  });
  if (count) {
    fs.writeFileSync(p, html);
    total += count;
    console.log(file, count);
  }
}
console.log("headings cleaned:", total);
