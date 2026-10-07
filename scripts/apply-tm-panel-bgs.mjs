import fs from "fs";

const cssPath = "app/technical-seo.css";
let css = fs.readFileSync(cssPath, "utf8");
const panelCss = fs.readFileSync("scripts/.tmp-tm-panel-bgs.css", "utf8").trim();

const start = css.indexOf(".tm-bg{position:absolute;");
if (start < 0) throw new Error("tm-bg block not found");
const end = css.indexOf(".tm-item.on .tm-bg{opacity:1;}", start);
if (end < 0) throw new Error("tm-item.on .tm-bg not found");

const replacement =
  `.tm-bg{position:absolute; inset:0; opacity:0; transition:opacity .55s var(--ease) .05s;
  background:center / cover no-repeat, var(--n200);}
${panelCss}
`;

css = css.slice(0, start) + replacement + css.slice(end);
fs.writeFileSync(cssPath, css);
console.log("applied panel backgrounds; css length", css.length);
