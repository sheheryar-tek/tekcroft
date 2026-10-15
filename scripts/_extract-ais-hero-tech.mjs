/**
 * Pull hero + tech markup/CSS/scripts verbatim from the AIS source HTML.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC =
  process.env.TEKCROFT_AIS_HTML ||
  "C:/Users/Super/Downloads/tekcroft-artificial-intelligence-services (3).html";
const OUT = path.join(ROOT, "scripts", "_ais-src");

fs.mkdirSync(OUT, { recursive: true });
const html = fs.readFileSync(SRC, "utf8");

function block(tag, id) {
  const re = new RegExp(
    `<${tag}\\s+id="${id}"[^>]*>([\\s\\S]*?)</${tag}>`,
    "i"
  );
  const m = html.match(re);
  if (!m) throw new Error(`Missing ${tag}#${id}`);
  return m[1];
}

function extractSection(id) {
  const openRe = new RegExp(`<section[^>]*id="${id}"[^>]*>`, "i");
  const m = html.match(openRe);
  if (!m) throw new Error(`Missing section#${id}`);
  const start = html.indexOf(m[0]);
  let i = start + m[0].length;
  let depth = 1;
  while (i < html.length && depth > 0) {
    const nextOpen = html.indexOf("<section", i);
    const nextClose = html.indexOf("</section>", i);
    if (nextClose < 0) break;
    if (nextOpen >= 0 && nextOpen < nextClose) {
      depth++;
      i = nextOpen + 8;
    } else {
      depth--;
      i = nextClose + 10;
      if (depth === 0) return html.slice(start, i);
    }
  }
  throw new Error(`Unclosed section#${id}`);
}

const STYLE_IDS = [
  "tk-core",
  "hs-styles",
  "hero-copy-styles",
  "hs-form-theme",
  "hero-form-glass",
  "consistency",
  "consistency-2",
  "hs-logos-styles",
  "ais-eyebrow",
  "ai-tx-styles",
];

const SCRIPT_IDS = ["ai-tx-noscroll", "tb-script"];

let pack = "";
for (const id of STYLE_IDS) {
  const css = block("style", id);
  fs.writeFileSync(path.join(OUT, `${id}.css`), css);
  pack += `\n/* === ${id} === */\n${css}\n`;
  console.log("style", id, css.length);
}

const hero = extractSection("hero-1");
const tech = extractSection("tech-v4");
fs.writeFileSync(path.join(OUT, "hero.html"), hero);
fs.writeFileSync(path.join(OUT, "tech.html"), tech);
console.log("hero", hero.length, "tech", tech.length);

for (const id of SCRIPT_IDS) {
  const js = block("script", id);
  fs.writeFileSync(path.join(OUT, `${id}.js`), js);
  console.log("script", id, js.length);
}

// Tailwind neutralize + ensure --veil wins over empty cascade
const neutralize = `
/* === ais-hero-tech-lock === */
#tech-v4 svg, #tech-v4 img, #hero-1 svg, #hero-1 img {
  max-width: none;
  height: revert;
  display: revert;
}

/* Homepage tekcroft.css .ax-stage is a 3-col hub; #tech-v4 stacks panes. */
#tech-v4 .ax-stage {
  grid-template-columns: minmax(0, 1fr) !important;
  grid-template-rows: auto !important;
  align-items: stretch !important;
  justify-items: stretch !important;
  margin-top: 0 !important;
  column-gap: 0 !important;
  row-gap: 0 !important;
}
#tech-v4 .ax-pane {
  width: 100% !important;
  min-width: 0 !important;
  justify-self: stretch !important;
  align-self: stretch !important;
}
`;

fs.writeFileSync(
  path.join(OUT, "hero-tech-styles.css"),
  pack + neutralize
);
console.log("wrote", path.join(OUT, "hero-tech-styles.css"));

// Peek tk-core for --veil
const tk = fs.readFileSync(path.join(OUT, "tk-core.css"), "utf8");
const veil = tk.match(/--veil:[^;]+;/);
console.log("veil in tk-core:", veil && veil[0]);
