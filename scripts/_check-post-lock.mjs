import fs from "fs";

const files = [
  "app/tekcroft.css",
  "app/local-seo.css",
  "app/google-business-profile-optimization.css",
  "app/seo-audit-services.css",
  "app/franchise-seo.css",
  "app/on-page-seo.css",
  "app/technical-seo.css",
  "app/ecommerce-seo.css",
  "app/mobile-app-development.css",
  "app/contact.css",
  "app/ai-agent-development.css",
  "app/ai-chatbot-development.css",
  "app/web-design-and-development.css",
  "app/custom-software-development.css",
];
const MARK = "/* === SITE CONSISTENCY LOCK";

for (const f of files) {
  const css = fs.readFileSync(f, "utf8");
  const i = css.indexOf(MARK);
  if (i < 0) {
    console.log(f, "NO MARK");
    continue;
  }
  // Find end of consistency by looking for last data-ground soft block closing, then anything after
  const after = css.slice(i);
  // Heuristic: consistency ends around alternating grounds soft section
  const soft = after.lastIndexOf('.sec[data-ground="soft"]');
  if (soft < 0) {
    console.log(f, "no soft rule in lock");
    continue;
  }
  // find closing braces after soft block - take rest of file after ~15 lines from soft
  const fromSoft = after.slice(soft);
  const lines = fromSoft.split("\n");
  // soft block is usually 5-8 lines; anything after line with only } that closes soft
  let cut = 0;
  let braces = 0;
  let started = false;
  for (let li = 0; li < lines.length; li++) {
    const line = lines[li];
    for (const ch of line) {
      if (ch === "{") {
        braces++;
        started = true;
      }
      if (ch === "}") braces--;
    }
    if (started && braces === 0 && line.includes("}")) {
      cut = soft + lines.slice(0, li + 1).join("\n").length + 1;
      break;
    }
  }
  const extra = after.slice(cut).trim();
  console.log(f, "extra after lock:", extra.length, extra ? extra.slice(0, 80).replace(/\s+/g, " ") : "");
}
