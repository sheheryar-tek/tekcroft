/**
 * Append site-consistency.css to the end of every page stylesheet
 * (and tekcroft.css) so it always wins cascade order in Next.js.
 * Also removes fragile double-imports from layout/pages if present.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MARK = "/* === SITE CONSISTENCY LOCK (do not edit here — edit site-consistency.css) === */";
const lock = fs.readFileSync(path.join(ROOT, "app", "site-consistency.css"), "utf8").trim();

const cssFiles = [
  "app/tekcroft.css",
  "app/on-page-seo.css",
  "app/technical-seo.css",
  "app/seo-audit-services.css",
  "app/local-seo.css",
  "app/ecommerce-seo.css",
  "app/franchise-seo.css",
  "app/google-business-profile-optimization.css",
  "app/mobile-app-development.css",
  "app/web-design-and-development.css",
  "app/custom-software-development.css",
  "app/ai-agent-development.css",
  "app/ai-chatbot-development.css",
  "app/ai-seo.css",
  "app/contact.css",
];

const block = "\n\n" + MARK + "\n" + lock + "\n";

for (const rel of cssFiles) {
  const fp = path.join(ROOT, rel);
  let css = fs.readFileSync(fp, "utf8");
  const i = css.indexOf(MARK);
  if (i >= 0) css = css.slice(0, i).trimEnd();
  css = css.trimEnd() + block;
  fs.writeFileSync(fp, css);
  console.log("locked", rel);
}

/* Remove imports — appended CSS is the source of cascade truth */
const pages = [
  "app/layout.tsx",
  "app/page.tsx",
  "app/contact/page.tsx",
  "app/services/on-page-seo/page.tsx",
  "app/services/technical-seo/page.tsx",
  "app/services/seo-audit-services/page.tsx",
  "app/services/local-seo/page.tsx",
  "app/services/ecommerce-seo/page.tsx",
  "app/services/franchise-seo-services/page.tsx",
  "app/services/google-business-profile-optimization/page.tsx",
  "app/services/mobile-app-development/page.tsx",
  "app/services/web-design-and-development-services/page.tsx",
  "app/services/software-development-services/page.tsx",
  "app/services/ai-agent-development-services/page.tsx",
  "app/services/ai-chatbot-development-services/page.tsx",
  "app/services/ai-seo-services/page.tsx",
];

for (const rel of pages) {
  const fp = path.join(ROOT, rel);
  let src = fs.readFileSync(fp, "utf8");
  const next = src
    .replace(/\r?\nimport ["']@\/app\/site-consistency\.css["'];/g, "")
    .replace(/\r?\nimport ["']\.\/site-consistency\.css["'];/g, "");
  if (next !== src) {
    fs.writeFileSync(fp, next);
    console.log("unwired import", rel);
  }
}
