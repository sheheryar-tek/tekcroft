import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = path.join(ROOT, "scripts", "extract-ai-development.mjs");
let t = fs.readFileSync(file, "utf8");

t = t.replace(
  /Extract AI Agent Development standalone HTML[\s\S]*?Run: node scripts\/extract-ai-agent-development\.mjs/,
  `Extract AI Development standalone HTML → Next.js App Router assets.
 * Run: node scripts/extract-ai-development.mjs`
);

t = t.replace(
  /const SRC =\s*process\.env\.TEKCROFT_AAG_HTML \|\|\s*"[^"]+";/,
  `const SRC =
  process.env.TEKCROFT_AID_HTML ||
  "C:/Users/Super/Downloads/tekcroft-ai-development (2).html";`
);

t = t.replace(/const PREFIX = "aag";/, 'const PREFIX = "aid";');

const STYLE_IDS = [
  "hs-styles",
  "tb-styles",
  "hero-copy-styles",
  "svc-styles",
  "cn-styles",
  "cn-refine",
  "faq-pics",
  "rhythm-styles",
  "foot-lift",
  "hs-form-theme",
  "foot-final",
  "consistency",
  "svc-copy",
  "ws-styles",
  "cl-styles",
  "pf-styles",
  "vs-styles",
  "ind-marks",
  "lo-styles",
  "eg-styles",
  "lp-styles",
  "gw-styles",
  "cn-three",
  "eg-expect",
  "pf-cs",
  "ws-four",
  "gw-photo",
  "hs-fit",
  "hs-stat",
  "svc-app",
  "wc-styles",
  "wc-five",
  "wc-app",
  "dv-styles",
  "fw-styles",
  "tl-styles",
  "pr-styles",
  "cta-nda",
  "fw-foot",
  "tk-styles",
  "wk-styles",
  "wk-shots",
  "wc-six",
  "ind-photos",
  "ind-hues",
  "hs-points",
  "wd-svc",
  "sc-styles",
  "wc-ask",
  "bg-styles",
  "gr-white",
  "cn-plain",
  "cm-styles",
  "pw-styles",
  "ty-styles",
  "ty-steps",
  "eg-case",
  "tm-styles",
  "st-vs",
  "st-table",
  "pf-ai",
  "wc-case",
  "cm2-styles",
  "pw-fit",
  "rhythm-app",
  "ai-page",
  "sec-page",
  "case-page",
  "sy-styles",
  "v2b-styles",
  "v3b-styles",
  "cmp-table-fix",
  "v4b-styles",
  "cta-nda-fix",
  "sc3-styles",
];

const SCRIPT_IDS = [
  "sy-script",
  "v3-script",
  "v4-script",
  "vsw-script",
  "sc3-script",
  "tb-script",
  "ft-script",
  "faq-script",
  "cn-script",
  "ws-script",
  "pf-script",
  "eg-script",
  "dv-script",
  "wk-script",
  "cm2-script",
  "ax-script",
];

t = t.replace(
  /const STYLE_IDS = \[[\s\S]*?\];/,
  `const STYLE_IDS = ${JSON.stringify(STYLE_IDS, null, 2)};`
);
t = t.replace(
  /const SCRIPT_IDS = \[[\s\S]*?\];/,
  `const SCRIPT_IDS = ${JSON.stringify(SCRIPT_IDS, null, 2)};`
);

// extractStyles: support duplicate style ids (v4b-styles x4)
t = t.replace(
  /function extractStyles\(html, ids\) \{[\s\S]*?return parts\.join\("\\n\\n"\);\n\}/,
  `function extractStyles(html, ids) {
  const parts = [];
  for (const id of ids) {
    const re = new RegExp(\`<style id="\${id}">([\\\\s\\\\S]*?)</style>\`, "gi");
    const matches = [...html.matchAll(re)];
    if (!matches.length) {
      console.warn("missing style", id);
      continue;
    }
    matches.forEach((m, i) => {
      let block = m[1].trim();
      if (id === "tk-styles") {
        block = block.replace(
          /(\\.tk-items\\{padding-left:0; border-left:0; padding-top:16px; border-top:1px solid var\\(--border-soft\\);\\}\\s*\\}\\s*)\\}(\\s*@media \\(prefers-reduced-motion:reduce\\))/,
          "$1$2"
        );
      }
      const label = matches.length > 1 ? \`\${id}-\${i + 1}\` : id;
      parts.push(\`/* === \${label} === */\\n\${block}\`);
    });
  }
  return parts.join("\\n\\n");
}`
);

// GROUNDS for this page's sections
t = t.replace(
  /\/\* Strict white \/ tint alternation after dark hero \(DOM order\)\. \*\/\nconst GROUNDS = `[\s\S]*?`;/,
  `/* Strict white / tint alternation after dark hero (DOM order). */
const GROUNDS = \`
/* Section grounds — white / tint alternation */
#services-2,
#process,
#guide,
#guide-v3,
#reviews,
#security,
#faq{
  --ground:var(--surface);
  --panel:var(--bg-alt);
}
#proof,
#cmp,
#guide-v2,
#guide-v4,
#industries,
#work,
#contact{
  --ground:var(--bg-alt);
  --panel:var(--surface);
}

#proof,
#services-2,
#process,
#cmp,
#guide,
#guide-v2,
#guide-v3,
#guide-v4,
#reviews,
#industries,
#security,
#work,
#faq,
#contact{
  background:var(--ground) !important;
  border-block:0 !important;
}
#services-2.svc-cn{ border-block:0; }
#services-2 .cn-plate::before{ display:none !important; }
#services-2 .cn-plate::after{
  background:
    radial-gradient(780px 440px at 50% 48%, rgba(0,0,0,.50) 0%, transparent 72%),
    linear-gradient(180deg, rgba(0,0,0,.72) 0%, rgba(0,0,0,.58) 42%,
                    rgba(0,0,0,.90) 100%) !important;
}
html[data-theme="dark"] #services-2 .cn-plate::after{
  background:
    radial-gradient(780px 440px at 50% 48%, rgba(0,0,0,.55) 0%, transparent 72%),
    linear-gradient(180deg, rgba(0,0,0,.78) 0%, rgba(0,0,0,.62) 42%,
                    rgba(0,0,0,.92) 100%) !important;
}
#services-2 .cn-tab{
  color:rgba(255,255,255,.70) !important;
  background:transparent !important;
  text-shadow:none !important;
}
#services-2 .cn-tab.on{ color:#fff !important; background:transparent !important; }
#services-2 .cn-lift{
  background:var(--primary) !important; backdrop-filter:none !important;
  -webkit-backdrop-filter:none !important;
  box-shadow:0 14px 30px -14px hsl(var(--brand-h) 100% 34% / .75) !important;}
#services-2 .cn-go{
  background:transparent !important; box-shadow:none !important;
  backdrop-filter:none !important; -webkit-backdrop-filter:none !important; opacity:0;}
#services-2 .cn-tab.on .cn-go{
  opacity:1 !important; background:#0a1a29 !important; color:#fff !important;
  backdrop-filter:none !important; -webkit-backdrop-filter:none !important; box-shadow:none !important;}
#services-2 .cn-sheet{ background:#fff !important; }
html[data-theme="dark"] #services-2 .cn-sheet{ background:var(--n875) !important; }
@media (max-width:1040px){
  #services-2 .cn-tab.on{ background:var(--primary) !important; color:#fff !important; }
  #services-2 .cn-go, #services-2 .cn .cn-go{
    opacity:1 !important; background:var(--primary) !important; color:#fff !important;
    transform:none !important; visibility:visible !important;}
  html[data-theme="dark"] #services-2 .cn-go{ background:rgba(255,255,255,.14) !important; }
  #services-2 .cn-tab.on .cn-go{
    opacity:1 !important; background:#fff !important; color:var(--primary) !important;
    transform:none !important;}
  #services-2 .cn-tab:not(.on):hover .cn-go,
  #services-2 .cn-tab:not(.on):focus-visible .cn-go{
    opacity:1 !important; background:var(--primary) !important; transform:none !important;}
  #services-2 .cn-go::before, #services-2 .cn-go::after{
    content:"" !important; position:absolute !important; top:50% !important; left:50% !important;
    background:currentColor !important; border-radius:2px !important;
    transform:translate(-50%,-50%) !important; display:block !important;}
  #services-2 .cn-go::before{width:13px !important; height:2px !important;}
  #services-2 .cn-go::after{width:2px !important; height:13px !important;}
  #services-2 .cn-tab.on .cn-go::after{transform:translate(-50%,-50%) scaleY(0) !important;}
  #services-2 .cn-go svg{display:none !important;}
}
\`;`
);

t = t.replace(/aag-/g, "aid-");
t = t.replace(/AI Agent Development/g, "AI Development");
t = t.replace(/ai-agent-development/g, "ai-development");
t = t.replace(
  /AAG nav end not found/g,
  "AID nav end not found"
);
t = t.replace(
  /"AI Agent Development Services \| Tekcroft"/g,
  '"Custom AI Development Services | Tekcroft"'
);
t = t.replace(
  /Custom AI agent development for real business workloads\./g,
  "Tekcroft builds custom AI development services for production."
);
t = t.replace(
  /https:\/\/www\.tekcroft\.com\/services\/ai-agent-development-services/g,
  "https://www.tekcroft.com/services/ai-development-services"
);
// TYPE_SCALE content-visibility list — add new section ids
t = t.replace(
  /\.ct-hero, \.hs, #hero-1, #top, #faq, #why, #services-2, #problem, #problem-v2, #tech-stack, #work, #reviews, #process \{/,
  `.ct-hero, .hs, #hero-1, #top, #faq, #why, #services-2, #problem, #problem-v2, #tech-stack, #work, #reviews, #process, #guide, #guide-v2, #guide-v3, #guide-v4, #cmp, #security {`
);

fs.writeFileSync(file, t);
console.log("Patched", file);
