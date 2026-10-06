import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const LIB = path.join(path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."), "lib");

for (const name of fs.readdirSync(LIB)) {
  if (!name.endsWith("-body.html")) continue;
  const file = path.join(LIB, name);
  let html = fs.readFileSync(file, "utf8");
  if (!html.includes("ft4-plate")) continue;
  if (/ft4-plate">\s*<div class="wrap"/.test(html)) {
    console.log("has wrap", name);
    continue;
  }
  if (!html.includes('<div class="ft4-top">')) {
    console.log("no top", name);
    continue;
  }
  html = html.replace(
    /(<div class="ft4-plate">)\s*(<div class="ft4-top">)/,
    "$1\n        <div class=\"wrap\">\n        $2"
  );
  html = html.replace(
    /(<div class="ft4-bar">[\s\S]*?<\/nav>\s*<\/div>)\s*<\/div>\s*<\/footer>/,
    "$1\n        </div>\n      </div>\n    </footer>"
  );
  fs.writeFileSync(file, html);
  console.log("wrapped", name);
}
