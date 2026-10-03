import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const lib = path.join(ROOT, "lib");
const from =
  'href="/services/ai-chatbot-development-services">AI development</a>';
const to = 'href="/services/ai-development-services">AI development</a>';

let n = 0;
for (const f of fs.readdirSync(lib)) {
  if (!f.endsWith("-body.html")) continue;
  const p = path.join(lib, f);
  let t = fs.readFileSync(p, "utf8");
  if (!t.includes(from)) continue;
  t = t.split(from).join(to);
  fs.writeFileSync(p, t);
  n++;
  console.log("updated", f);
}
console.log("files", n);
