import fs from "fs";
import path from "path";

const lib = "c:/Tekcroft/lib";
for (const f of fs.readdirSync(lib).filter((x) => x.endsWith("-body.html"))) {
  const h = fs.readFileSync(path.join(lib, f), "utf8");
  const v2 = (h.match(/id="proof-v2"/g) || []).length;
  const old = (h.match(/id="proof"/g) || []).length;
  const tb = (h.match(/tb-figs/g) || []).length;
  if (v2 || old || tb) console.log(f, { v2, old, tb });
}
