import fs from "fs";

const p = "app/local-seo.css";
let c = fs.readFileSync(p, "utf8");
const MARK = "/* === SITE CONSISTENCY LOCK";

if (c.includes("/* === dfx-styles (What We Do Differently) === */")) {
  console.log("dfx already present");
  process.exit(0);
}

const styles = fs.readFileSync("scripts/_dfx-styles.css", "utf8").trim();
const restore =
  `\n\n/* === dfx-styles (What We Do Differently) === */\n` +
  styles +
  `\n\n/* Beat site-consistency !important so dfx matches the standalone section */\n` +
  `#different.dfx{\n` +
  `  padding-block:clamp(40px,4vw,64px) !important;\n` +
  `  background:hsl(var(--brand-h) 60% 98%) !important;\n` +
  `}\n` +
  `html[data-theme="dark"] #different.dfx{\n` +
  `  background:var(--bg-alt) !important;\n` +
  `}\n` +
  `html body #different.dfx h2{\n` +
  `  font-size:clamp(28px,2.8vw,42px) !important;\n` +
  `  line-height:1.06 !important;\n` +
  `  letter-spacing:-.04em !important;\n` +
  `}\n` +
  `html body #different.dfx .dfx-offer-t p{\n` +
  `  font-size:14.4px !important;\n` +
  `  line-height:1.6 !important;\n` +
  `}\n` +
  `html body #different.dfx .dfx-row p{\n` +
  `  font-size:14px !important;\n` +
  `  line-height:1.55 !important;\n` +
  `}\n`;

const lockI = c.indexOf(MARK);
if (lockI >= 0) {
  c = c.slice(0, lockI).trimEnd() + restore + "\n\n" + c.slice(lockI);
} else {
  c = c.trimEnd() + restore;
}

fs.writeFileSync(p, c);
console.log({
  hasDfx: c.includes(".dfx-wrap"),
  beforeLock: c.indexOf("/* === dfx-styles") < c.indexOf(MARK) || c.indexOf(MARK) < 0,
});
