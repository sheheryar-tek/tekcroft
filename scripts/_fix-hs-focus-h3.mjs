import fs from "fs";
import path from "path";

const d = "c:/Tekcroft/app";
for (const f of fs.readdirSync(d).filter((x) => x.endsWith(".css"))) {
  const p = path.join(d, f);
  let c = fs.readFileSync(p, "utf8");
  const n = c.replace(
    /html\[data-theme="light"\] \.hs-field:focus-within label\{color:var\(--brand-text\);\}/g,
    `html[data-theme="light"] .hs-field:focus-within h3,
html[data-theme="light"] .hs-field:focus-within h3 label,
html[data-theme="light"] .hs-field:focus-within label{color:var(--brand-text);}`
  );
  if (n !== c) {
    fs.writeFileSync(p, n);
    console.log("light-focus", f);
  }
}
