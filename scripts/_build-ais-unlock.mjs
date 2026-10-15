/**
 * Build AIS unlock CSS with PostCSS:
 * prefix every selector with html[data-design="raw"] and mark decls !important
 * so they beat site-consistency.css on this page only.
 */
import fs from "fs";
import path from "path";
import postcss from "postcss";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "app", "artificial-intelligence-services.css");
const OUT = path.join(ROOT, "app", "artificial-intelligence-services-unlock.css");
const PREFIX = 'html[data-design="raw"]';

let css = fs.readFileSync(SRC, "utf8");
css = css.split("/* page perf helpers")[0];
css = css.split("/* === SITE CONSISTENCY LOCK")[0].trimEnd();

const root = postcss.parse(css);

root.walkRules((rule) => {
  let p = rule.parent;
  while (p) {
    if (p.type === "atrule" && /keyframes/i.test(p.name)) return;
    p = p.parent;
  }
  rule.selectors = rule.selectors.map((sel) => {
    const s = sel.trim();
    if (!s) return s;
    if (s.startsWith(PREFIX)) return s;
    if (s.startsWith(":root")) return s;
    if (s.startsWith("html")) {
      // html[data-theme=...] → html[data-design=raw][data-theme=...]
      if (s.startsWith("html[")) return s.replace(/^html/, "html[data-design=\"raw\"]");
      if (s.startsWith("html ")) return s.replace(/^html /, `${PREFIX} `);
      return `${PREFIX}${s.slice(4)}`;
    }
    return `${PREFIX} ${s}`;
  });
  rule.walkDecls((decl) => {
    if (decl.prop.startsWith("--")) return;
    decl.important = true;
  });
});

const out =
  "/* AIS unlock — source design under html[data-design=raw]; beats site-consistency */\n" +
  "html[data-design=\"raw\"]{\n" +
  "  --h1:clamp(30px,4.4vw,58px);\n" +
  "  --h2:clamp(29px,3.6vw,46px);\n" +
  "  --h3:clamp(17px,1.7vw,22px);\n" +
  "}\n" +
  root.toResult().css +
  "\n";
fs.writeFileSync(OUT, out);
console.log("wrote", path.relative(ROOT, OUT), `${(out.length / 1024).toFixed(0)} KB`);
