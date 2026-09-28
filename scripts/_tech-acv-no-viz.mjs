import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const bodyPath = path.join(ROOT, "lib", "technical-seo-body.html");
let body = fs.readFileSync(bodyPath, "utf8");
const before = (body.match(/class="ac-viz"/g) || []).length;
body = body.replace(/\n\s*<div class="ac-viz">[\s\S]*?<\/div><\/div>/g, "");
const after = (body.match(/class="ac-viz"/g) || []).length;
fs.writeFileSync(bodyPath, body);
console.log("removed ac-viz:", before, "->", after);

const cssPath = path.join(ROOT, "app", "technical-seo.css");
let css = fs.readFileSync(cssPath, "utf8");
const patch = `
/* === technical-seo acv: content-only panels (no viz) === */
#services-2.acv .ac-viz{display:none !important;}
#services-2.acv .ac-open{
  display:grid !important;
  grid-template-columns:minmax(0,1fr) !important;
  align-items:stretch;
}
#services-2.acv .ac-card{
  width:100%;
  max-width:none !important;
  min-height:100%;
}
#services-2.acv .ac-card h3{max-width:28ch;}
#services-2.acv .ac-card p{max-width:68ch;}
#services-2.acv .ac-list{
  display:grid !important;
  gap:8px;
  margin:0 0 14px;
}
@media (min-width:981px){
  #services-2.acv .ac-item.on{min-width:min(720px,72%);}
}
`;

if (css.includes("technical-seo acv: content-only")) {
  console.log("css patch already present");
} else {
  const mark = "/* === SITE CONSISTENCY LOCK";
  const i = css.indexOf(mark);
  if (i >= 0) css = css.slice(0, i) + patch + "\n" + css.slice(i);
  else css = css.trimEnd() + "\n" + patch + "\n";
  fs.writeFileSync(cssPath, css);
  console.log("css patched");
}
