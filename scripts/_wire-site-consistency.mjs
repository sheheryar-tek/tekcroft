/**
 * Wire site-consistency.css after every page stylesheet + layout.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const IMPORT = 'import "@/app/site-consistency.css";';

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
];

for (const rel of pages) {
  const fp = path.join(ROOT, rel);
  let src = fs.readFileSync(fp, "utf8");
  if (src.includes("site-consistency.css")) {
    console.log("skip (already)", rel);
    continue;
  }

  if (rel === "app/layout.tsx") {
    // After perf.css
    if (src.includes('import "./perf.css";')) {
      src = src.replace(
        'import "./perf.css";',
        'import "./perf.css";\nimport "./site-consistency.css";'
      );
    } else {
      src = src.replace(
        'import "./tekcroft.css";',
        'import "./tekcroft.css";\nimport "./site-consistency.css";'
      );
    }
  } else if (rel === "app/page.tsx") {
    // Homepage has no page CSS — import after other imports for cascade clarity
    const lastImport = [...src.matchAll(/^import .+;$/gm)].pop();
    if (lastImport) {
      const i = lastImport.index + lastImport[0].length;
      src = src.slice(0, i) + "\n" + IMPORT + src.slice(i);
    } else {
      src = IMPORT + "\n" + src;
    }
  } else {
    // After the page's own CSS import
    const m = src.match(/import "@\/app\/[^"]+\.css";/);
    if (!m) {
      console.error("no css import in", rel);
      continue;
    }
    src = src.replace(m[0], m[0] + "\n" + IMPORT);
  }

  fs.writeFileSync(fp, src);
  console.log("wired", rel);
}
