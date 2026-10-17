import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const files = [
  "app/ai-chatbot-development.css",
  "app/ai-development.css",
  "app/ai-agent-development.css",
  "app/franchise-seo.css",
];

for (const rel of files) {
  const p = path.join(ROOT, rel);
  let t = fs.readFileSync(p, "utf8");
  const before = t;
  // Desktop rules that force-hide the halo — shared lock shows it instead.
  // Keep mobile @media (max-width:900px) { .vs-halo{display:none} } intact.
  t = t.replace(
    /#stack \.vs-halo\{display:none !important;\}/g,
    "/* #stack halo shown via vs-halo-lock */"
  );
  t = t.replace(
    /#cmp \.vs-halo\{display:none !important;\}/g,
    "/* #cmp halo shown via vs-halo-lock */"
  );
  if (t !== before) {
    fs.writeFileSync(p, t);
    console.log("patched", rel);
  } else {
    console.log("no change", rel);
  }
}
