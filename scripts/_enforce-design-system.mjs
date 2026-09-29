/**
 * Enforce global design tokens across page CSS files:
 * - Rewrite heading font-size clamps → var(--hN)
 * - Rewrite common body/lede clamps → var(--body)
 * - Soften section padding-block overrides → var(--sec-y)
 * Then re-append site-consistency.css lock.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cssDir = path.join(ROOT, "app");
const MARK = "/* === SITE CONSISTENCY LOCK (do not edit here — edit site-consistency.css) === */";

const files = [
  "tekcroft.css",
  "on-page-seo.css",
  "technical-seo.css",
  "seo-audit-services.css",
  "local-seo.css",
  "ecommerce-seo.css",
  "franchise-seo.css",
  "google-business-profile-optimization.css",
  "mobile-app-development.css",
  "web-design-and-development.css",
  "custom-software-development.css",
  "ai-agent-development.css",
  "ai-chatbot-development.css",
  "contact.css",
];

function rewriteRuleBlocks(css) {
  // Process each CSS rule block
  return css.replace(/([^{}]+)\{([^{}]*)\}/g, (full, selRaw, body) => {
    const sel = selRaw.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\s+/g, " ").trim();
    if (!sel || sel.startsWith("@")) return full;
    // Skip keyframes / font-face etc handled separately
    if (/^@/.test(selRaw.trim())) return full;

    let next = body;
    const isH1 = /(^|[\s,])h1\b|\.hs-h1\b/.test(sel) && !/\.hs-form/.test(sel);
    const isH2 = /(^|[\s,])h2\b/.test(sel);
    const isH3 =
      /(^|[\s,])h3\b/.test(sel) &&
      !/\.hs-form/.test(sel) &&
      !/\.hs-done/.test(sel);
    const isH4 = /(^|[\s,])h4\b/.test(sel);
    const isH5 = /(^|[\s,])h5\b/.test(sel);
    const isH6 = /(^|[\s,])h6\b/.test(sel);

    if (isH1 && /font-size\s*:/.test(next)) {
      next = next.replace(/font-size\s*:[^;]+;?/g, "font-size:var(--h1);");
    } else if (isH2 && /font-size\s*:/.test(next)) {
      next = next.replace(/font-size\s*:[^;]+;?/g, "font-size:var(--h2);");
    } else if (isH3 && /font-size\s*:/.test(next)) {
      next = next.replace(/font-size\s*:[^;]+;?/g, "font-size:var(--h3);");
    } else if (isH4 && /font-size\s*:/.test(next)) {
      next = next.replace(/font-size\s*:[^;]+;?/g, "font-size:var(--h4);");
    } else if (isH5 && /font-size\s*:/.test(next)) {
      next = next.replace(/font-size\s*:[^;]+;?/g, "font-size:var(--h5);");
    } else if (isH6 && /font-size\s*:/.test(next)) {
      next = next.replace(/font-size\s*:[^;]+;?/g, "font-size:var(--h6);");
    }

    // Body / lede reading text
    const isBodyish =
      /\.sec-lede\b|\.hs-lede\b|\.ac-lede\b|\.lp-lede\b|\.cta3-line\b|\.gr-text\b/.test(
        sel
      ) ||
      (/\b(p)\b/.test(sel) &&
        /(\.sec|\.say|\.card|\.pane|\.panel|\.lede|\.faq|\.tm-|\.ls-|\.gw-|\.mp-|\.wy-|\.wc-|\.wn-|\.eg-|\.pf-|\.ac-)/.test(
          sel
        ));
    if (
      isBodyish &&
      /font-size\s*:/.test(next) &&
      !/\.hs-err|\.hs-sub|\.hs-note|\.hs-field|\.btn|\.tag|\.smark|\.eyebrow/.test(
        sel
      )
    ) {
      next = next.replace(/font-size\s*:[^;]+;?/g, "font-size:var(--body);");
    }

    // Section padding-block → token (skip hero / proof strip / tb tightening)
    if (
      /padding-block\s*:/.test(next) &&
      /\.sec\b|#\w+\.sec|#what-local|#services-2|#pack|#process|#faq|#reviews|#industries|#clients|#apart|#fit|#contact|#proof|^#\w+$/.test(
        sel
      ) &&
      !/\.hs\b|\.ct-hero\b|\.tb\b|#proof\b|\.ticker\b/.test(sel)
    ) {
      next = next.replace(
        /padding-block\s*:[^;]+;?/g,
        "padding-block:var(--sec-y);"
      );
    }

    return selRaw + "{" + next + "}";
  });
}

let changed = 0;
for (const name of files) {
  const fp = path.join(cssDir, name);
  let css = fs.readFileSync(fp, "utf8");
  const i = css.indexOf(MARK);
  if (i >= 0) css = css.slice(0, i).trimEnd() + "\n";
  const before = css;
  css = rewriteRuleBlocks(css);
  if (css !== before) {
    fs.writeFileSync(fp, css);
    changed++;
    console.log("normalized", name);
  } else {
    console.log("unchanged body", name);
  }
}
console.log("normalized files:", changed);

const apply = spawnSync("node", ["scripts/_apply-site-consistency.mjs"], {
  cwd: ROOT,
  encoding: "utf8",
});
process.stdout.write(apply.stdout || "");
process.stderr.write(apply.stderr || "");
process.exit(apply.status ?? 1);
