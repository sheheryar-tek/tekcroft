import fs from "fs";
import path from "path";

for (const f of fs.readdirSync("lib").filter((x) => x.endsWith("-body.html"))) {
  const p = path.join("lib", f);
  let s = fs.readFileSync(p, "utf8");
  const n = s.replace(
    /<span class="fw-mark">(<span class="smark">[\s\S]*?<\/span>)<\/span>/g,
    "$1"
  );
  if (n !== s) {
    fs.writeFileSync(p, n);
    console.log("html", f);
  }
}
