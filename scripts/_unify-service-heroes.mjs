/**
 * 1) Strip UTF-8 BOM from service page CSS (BOM poisons first .hs rule)
 * 2) Ensure every service page imports shared service-hero-lock.css last
 */
import fs from "fs";
import path from "path";

const ROOT = "c:/Tekcroft";
const LOCK = 'import "@/app/service-hero-lock.css";';
const LOCK_COMMENT =
  "/* Shared service hero shell — same style/design on every /services page */";

const servicePages = [
  "app/services/franchise-seo-services/page.tsx",
  "app/services/local-seo-services/page.tsx",
  "app/services/google-business-profile-optimization-services/page.tsx",
  "app/services/ecommerce-seo/page.tsx",
  "app/services/technical-seo-services/page.tsx",
  "app/services/on-page-seo/page.tsx",
  "app/services/seo-audit-services/page.tsx",
  "app/services/ai-seo-services/page.tsx",
  "app/services/web-design-and-development-services/page.tsx",
  "app/services/custom-software-development-services/page.tsx",
  "app/services/mobile-app-development-services/page.tsx",
  "app/services/ai-chatbot-development-services/page.tsx",
  "app/services/ai-agent-development-services/page.tsx",
  "app/services/ai-development-services/page.tsx",
  "app/services/artificial-intelligence-services/page.tsx",
];

const cssFiles = [
  "app/franchise-seo.css",
  "app/local-seo.css",
  "app/google-business-profile-optimization.css",
  "app/ecommerce-seo.css",
  "app/technical-seo.css",
  "app/on-page-seo.css",
  "app/seo-audit-services.css",
  "app/ai-seo.css",
  "app/web-design-and-development.css",
  "app/custom-software-development.css",
  "app/mobile-app-development.css",
  "app/ai-chatbot-development.css",
  "app/ai-agent-development.css",
  "app/ai-development.css",
  "app/artificial-intelligence-services.css",
  "app/artificial-intelligence-services-unlock.css",
  "app/ais-hero-tech.css",
  "app/ai-tx-styles.css",
  "app/franchise-hero-lock.css",
  "app/fit-vs-bg.css",
];

let bomFixed = 0;
for (const rel of cssFiles) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) continue;
  let s = fs.readFileSync(p, "utf8");
  const before = (s.match(/\uFEFF/g) || []).length;
  if (!before && !(fs.readFileSync(p)[0] === 0xef)) continue;
  s = s.replace(/^\uFEFF/, "").replace(/\uFEFF/g, "");
  // also strip raw UTF-8 BOM bytes if still present
  let buf = Buffer.from(s, "utf8");
  if (buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
    buf = buf.subarray(3);
    s = buf.toString("utf8");
  }
  fs.writeFileSync(p, s);
  bomFixed++;
  console.log("stripped BOM", rel, "had", before);
}

for (const rel of servicePages) {
  const p = path.join(ROOT, rel);
  let src = fs.readFileSync(p, "utf8");

  // Remove old franchise-only lock if present
  src = src.replace(
    /\r?\n\/\* Hero lock:[\s\S]*?\*\/\r?\nimport "@\/app\/franchise-hero-lock\.css";\r?\n?/g,
    "\n"
  );
  src = src.replace(/\r?\nimport "@\/app\/franchise-hero-lock\.css";\r?\n?/g, "\n");

  if (src.includes('import "@/app/service-hero-lock.css"')) {
    console.log("already wired", rel);
    fs.writeFileSync(p, src);
    continue;
  }

  // Insert after footer-lock if present, else after last css import
  if (src.includes('import "@/app/footer-lock.css";')) {
    src = src.replace(
      'import "@/app/footer-lock.css";',
      `import "@/app/footer-lock.css";\n${LOCK_COMMENT}\n${LOCK}`
    );
  } else {
    const m = src.match(/import "@\/app\/[^"]+\.css";/g);
    if (!m) throw new Error("no css imports in " + rel);
    const last = m[m.length - 1];
    src = src.replace(last, `${last}\n${LOCK_COMMENT}\n${LOCK}`);
  }

  // Avoid duplicate if comment+lock somehow doubled
  src = src.replace(
    new RegExp(
      `(${LOCK_COMMENT.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*${LOCK.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      )}\\s*){2,}`,
      "g"
    ),
    `${LOCK_COMMENT}\n${LOCK}\n`
  );

  fs.writeFileSync(p, src);
  console.log("wired", rel);
}

console.log(JSON.stringify({ bomFixed, pages: servicePages.length }, null, 2));
