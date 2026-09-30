import fs from "fs";

const p = "app/local-seo.css";
let c = fs.readFileSync(p, "utf8");
if (c.includes("Beat site-consistency !important so dfx")) {
  console.log("dfx restore already present");
  process.exit(0);
}
if (c.includes("#different.dfx{padding-block") && !c.includes("/* === dfx-styles")) {
  // partial?
  console.log("partial dfx found inside file unexpectedly");
}

const styles = fs.readFileSync("scripts/_dfx-styles.css", "utf8").trim();
const restore = `

/* === dfx-styles (What We Do Differently) === */
${styles}

/* Beat site-consistency !important so dfx matches the standalone section */
#different.dfx{
  padding-block:clamp(40px,4vw,64px) !important;
  background:hsl(var(--brand-h) 60% 98%) !important;
}
html[data-theme="dark"] #different.dfx{
  background:var(--bg-alt) !important;
}
html body #different.dfx h2{
  font-size:clamp(28px,2.8vw,42px) !important;
  line-height:1.06 !important;
  letter-spacing:-.04em !important;
}
html body #different.dfx .dfx-offer-t p{
  font-size:14.4px !important;
  line-height:1.6 !important;
}
html body #different.dfx .dfx-row p{
  font-size:14px !important;
  line-height:1.55 !important;
}
`;

fs.writeFileSync(p, c.trimEnd() + restore);
console.log("dfx restored to local-seo.css");
