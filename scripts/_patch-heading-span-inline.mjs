import fs from "fs";
import path from "path";

const old = `html body :is(h1, h2, h3, h4, h5, h6) em,
html body :is(h1, h2, h3, h4, h5, h6) > br{
  display:inline !important;
}
html body :is(h1, h2, h3, h4, h5, h6) br{
  display:none !important;
}`;

const neu = `html body :is(h1, h2, h3, h4, h5, h6) em,
html body :is(h1, h2, h3, h4, h5, h6) > span{
  display:inline !important;
}
html body :is(h1, h2, h3, h4, h5, h6) br{
  display:none !important;
}`;

const dir = path.join(process.cwd(), "app");
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".css"))) {
  const p = path.join(dir, f);
  let c = fs.readFileSync(p, "utf8");
  if (c.includes("h1, h2, h3, h4, h5, h6) > span{")) {
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

// verify franchise h1
const b = fs.readFileSync("lib/franchise-seo-body.html", "utf8");
const m = b.match(/<h1 class="hs-h1">[\s\S]*?<\/h1>/);
console.log(m ? m[0] : "no h1");
