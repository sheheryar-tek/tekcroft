import fs from "fs";
import path from "path";

const old = `html body :is(h1, .hs-h1, .ct-hero h1),
html body .hs .hs-h1{
  font-size:var(--h1) !important;
  line-height:1.08 !important;
}`;

const neu = `html body :is(h1, .hs-h1, .ct-hero h1),
html body .hs .hs-h1{
  font-size:var(--h1) !important;
  line-height:1.08 !important;
  margin-inline-start:-0.04em;
}`;

const dir = path.join(process.cwd(), "app");
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".css"))) {
  const p = path.join(dir, f);
  let c = fs.readFileSync(p, "utf8");
  if (c.includes("margin-inline-start:-0.04em")) {
    console.log("ok", f);
    continue;
  }
  if (c.includes(old)) {
    fs.writeFileSync(p, c.split(old).join(neu));
    console.log("patched", f);
  } else {
    console.log("miss", f);
  }
}
