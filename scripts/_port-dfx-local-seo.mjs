import fs from "fs";
import path from "path";

const root = process.cwd();
const bodyPath = path.join(root, "lib", "local-seo-body.html");
const cssPath = path.join(root, "app", "local-seo.css");
const section = fs.readFileSync(path.join(root, "scripts", "_dfx-section.html"), "utf8").trim();
const styles = fs.readFileSync(path.join(root, "scripts", "_dfx-styles.css"), "utf8").trim();

let body = fs.readFileSync(bodyPath, "utf8");
const start = body.indexOf('<section class="sec ws" id="apart">');
if (start < 0) {
  console.error("apart section start not found");
  process.exit(1);
}
const processIdx = body.indexOf('<section class="sec eg-sec" id="process"', start);
if (processIdx < 0) {
  console.error("process section after apart not found");
  process.exit(1);
}
const commentStart = body.lastIndexOf("<!--", processIdx);
const end = commentStart > start ? commentStart : processIdx;
body = body.slice(0, start) + section + "\n\n" + body.slice(end);
fs.writeFileSync(bodyPath, body);

let css = fs.readFileSync(cssPath, "utf8");
if (!css.includes("#different.dfx")) {
  css = css.replace(/\s*$/, "\n\n/* === dfx-styles (What We Do Differently) === */\n" + styles + "\n");
  fs.writeFileSync(cssPath, css);
}

console.log({
  hasDifferent: body.includes('id="different"'),
  hasApartId: /id="apart"/.test(body),
  hasDfxCss: css.includes("#different.dfx"),
  sectionLen: section.length,
});
