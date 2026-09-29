/**
 * Fix false-positive font-size token swaps caused by the word "h2"/"h1"
 * appearing inside CSS comments that the previous rewriter treated as selectors.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
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

const LABEL_SELS =
  /\.(vs-rule|smark|tag|eyebrow|chip|label|btn|nav|cn-lead|hs-sub|hs-note|hs-field|tb-cap|mm-|cta3-eyebrow|faq-aside)\b/i;

function lastSelector(selRaw) {
  // Drop comments, keep the actual selector tail
  const noComments = selRaw.replace(/\/\*[\s\S]*?\*\//g, " ");
  return noComments.replace(/\s+/g, " ").trim();
}

function isRealHeading(sel, level) {
  const s = lastSelector(sel);
  if (!s) return false;
  if (LABEL_SELS.test(s)) return false;
  if (level === 1) return /(^|[\s,>+~])h1\b|\.hs-h1\b/.test(s) && !/\.hs-form/.test(s);
  if (level === 2) return /(^|[\s,>+~])h2\b/.test(s);
  if (level === 3)
    return /(^|[\s,>+~])h3\b/.test(s) && !/\.hs-form/.test(s) && !/\.hs-done/.test(s);
  if (level === 4) return /(^|[\s,>+~])h4\b/.test(s);
  if (level === 5) return /(^|[\s,>+~])h5\b/.test(s);
  if (level === 6) return /(^|[\s,>+~])h6\b/.test(s);
  return false;
}

for (const name of files) {
  const fp = path.join(ROOT, "app", name);
  let css = fs.readFileSync(fp, "utf8");
  const lockAt = css.indexOf(MARK);
  let head = lockAt >= 0 ? css.slice(0, lockAt) : css;
  const lock = lockAt >= 0 ? css.slice(lockAt) : "";

  head = head.replace(/([^{}]+)\{([^{}]*)\}/g, (full, selRaw, body) => {
    if (!/font-size\s*:\s*var\(--h[1-6]\)/.test(body)) return full;
    const token = body.match(/font-size\s*:\s*var\(--h([1-6])\)/)[1];
    const level = Number(token);
    if (isRealHeading(selRaw, level)) return full;
    // Restore label-sized type for non-headings wrongly assigned heading tokens
    if (LABEL_SELS.test(lastSelector(selRaw)) || /font-size\s*:\s*var\(--h[12]\)/.test(body)) {
      const restored = body.replace(/font-size\s*:\s*var\(--h[1-6]\)/g, "font-size:11.5px");
      console.log("restore", name, lastSelector(selRaw).slice(0, 80));
      return selRaw + "{" + restored + "}";
    }
    return full;
  });

  fs.writeFileSync(fp, head.trimEnd() + "\n\n" + (lock || ""));
}

spawnSync("node", ["scripts/_apply-site-consistency.mjs"], {
  cwd: ROOT,
  stdio: "inherit",
});
