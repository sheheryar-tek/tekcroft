import fs from "fs";
import path from "path";

const dir = "app";
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".css"));

const re =
  /\*\/\s*-size:var\(--body\);\s*\r?\n(\s*font-weight:[^}]+max-width:[^}]+})/g;

for (const name of files) {
  const fp = path.join(dir, name);
  let s = fs.readFileSync(fp, "utf8");
  if (!s.includes("-size:var(--body)")) continue;
  const next = s.replace(
    re,
    "*/\n.cn-lead{\n  font-size:var(--body);\n$1"
  );
  if (next === s) {
    // try without requiring font-weight block shape
    const next2 = s.replace(
      /\*\/\s*-size:var\(--body\);/g,
      "*/\n.cn-lead{\n  font-size:var(--body);"
    );
    fs.writeFileSync(fp, next2);
    console.log("fixed-loose", name);
  } else {
    fs.writeFileSync(fp, next);
    console.log("fixed", name);
  }
}
