import fs from "fs";
import path from "path";

const lib = path.join(process.cwd(), "lib");
const files = fs.readdirSync(lib).filter((f) => f.endsWith("-body.html"));

console.log("=== H1 counts ===");
for (const f of files) {
  const html = fs.readFileSync(path.join(lib, f), "utf8");
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  const mmH3 = (html.match(/<h3 class="mm-title"/g) || []).length;
  const formH3 = (html.match(/<form[^>]*hs-form[^>]*>[\s\S]*?<h3>/g) || []).length;
  const formTitle = (html.match(/hs-form-title/g) || []).length;
  const vsw = /class="vsw"/.test(html);
  console.log(
    `${f}: h1=${h1} mm-h3=${mmH3} form-h3=${formH3} form-title=${formTitle} vsw=${vsw}`
  );
}

console.log("\n=== Heading-in-control scan ===");
let bad = 0;
for (const f of files) {
  const html = fs.readFileSync(path.join(lib, f), "utf8");
  const re = /<(button|a)\b[^>]*>[\s\S]{0,200}?<h[1-6]\b/gi;
  let m;
  while ((m = re.exec(html))) {
    // filter false positives: look ahead isn't closed with another button/a wrapping heading wrongly
    const snippet = html.slice(m.index, m.index + 120).replace(/\s+/g, " ");
    // skip if it's just nearby in mega menu structure without nesting
    const open = html.slice(m.index, m.index + m[0].length);
    if (/<(button|a)\b[^>]*>[\s\S]*?<h[1-6]/i.test(open) && !open.includes("</a>") && !open.includes("</button>")) {
      console.log(f, snippet);
      bad++;
    }
  }
}
console.log("nested heading hits:", bad);
