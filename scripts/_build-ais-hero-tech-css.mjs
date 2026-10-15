/**
 * Build app/ais-hero-tech.css from the AIS source HTML style blocks.
 * Tokens from tk-core (:root + dark) with logo data-URIs remapped to /images/.
 * Section styles copied verbatim. Cascade locks neutralize homepage .ax-stage
 * and Tailwind-like img/svg preflight inside #hero-1 / #tech-v4.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC =
  process.env.TEKCROFT_AIS_HTML ||
  "C:/Users/Super/Downloads/tekcroft-artificial-intelligence-services (3).html";
const OUT = path.join(ROOT, "app", "ais-hero-tech.css");

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

const LOGO_MAP = {
  "--mark": 'url("/images/mark.webp")',
  "--logo-ink": 'url("/images/logo-ink.webp")',
  "--logo-white": 'url("/images/logo-white.webp")',
  "--mark-white": 'url("/images/mark-white.webp")',
};

/** Pull custom-property decls from a `{...}` block body, skip data-URIs. */
function propsFromBlock(body) {
  const out = [];
  const re = /(--[\w-]+)\s*:\s*([^;]+);/g;
  let m;
  while ((m = re.exec(body))) {
    const name = m[1];
    let val = m[2].trim();
    if (LOGO_MAP[name]) {
      out.push(`  ${name}:${LOGO_MAP[name]};`);
      continue;
    }
    if (/data:image/i.test(val)) continue; // case-study screenshots etc.
    out.push(`  ${name}:${val};`);
  }
  return out.join("\n");
}

function braceBody(css, openIdx) {
  let i = css.indexOf("{", openIdx);
  const start = i + 1;
  let depth = 0;
  for (; i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}") {
      depth--;
      if (depth === 0) return css.slice(start, i);
    }
  }
  throw new Error("unbalanced brace");
}

/** :root + dark theme tokens from tk-core; logos remapped, no data-URIs. */
function extractTokens(tk) {
  const rootIdx = tk.indexOf(":root");
  if (rootIdx < 0) throw new Error("tk-core missing :root");
  const darkIdx = tk.indexOf('html[data-theme="dark"]');
  if (darkIdx < 0) throw new Error("tk-core missing dark theme");
  const rootProps = propsFromBlock(braceBody(tk, rootIdx));
  const darkProps = propsFromBlock(braceBody(tk, darkIdx));
  return (
    `:root{\n${rootProps}\n}\n` +
    `html[data-theme="dark"]{\n${darkProps}\n}\n`
  );
}

const STYLE_IDS = [
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

const parts = [];
parts.push(
  "/* AIS hero + tech — verbatim from source HTML; load AFTER tekcroft/site-consistency */\n"
);
parts.push("/* === tk-core tokens (logos remapped; includes --veil) === */\n");
parts.push(extractTokens(block("style", "tk-core")));

for (const id of STYLE_IDS) {
  parts.push(`\n/* === ${id} === */\n`);
  parts.push(block("style", id));
  parts.push("\n");
}

parts.push(`
/* === ais-hero-tech-lock === */
/* Neutralise Tailwind / preflight shrinking inside these sections */
#tech-v4 svg, #tech-v4 img, #hero-1 svg, #hero-1 img {
  max-width: none;
  height: revert;
  display: revert;
}

/*
  Homepage tekcroft.css defines .ax-stage as a 3-column hub layout.
  The AIS HTML file never includes that rule — #tech-v4 stacks panes in
  one cell via grid-area:1/1. Reset the conflicting tracks here.
*/
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
`);

const out = parts.join("");
fs.writeFileSync(OUT, out);
console.log(
  "wrote",
  path.relative(ROOT, OUT),
  `${(out.length / 1024).toFixed(0)} KB`,
  "veil?",
  /--veil:rgba\(0,0,0,\.78\)/.test(out)
);
