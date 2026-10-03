import fs from "fs";
import postcss from "postcss";

const css = fs.readFileSync("app/ai-development.css", "utf8");
try {
  await postcss([]).process(css, { from: "app/ai-development.css" });
  console.log("postcss OK", css.length);
} catch (e) {
  console.error("postcss FAIL");
  console.error(e.message);
  if (e.line) {
    const lines = css.split(/\n/);
    for (let i = Math.max(0, e.line - 3); i < Math.min(lines.length, e.line + 3); i++) {
      console.log(i + 1, lines[i].slice(0, 200));
    }
  }
}
