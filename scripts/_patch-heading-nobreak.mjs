import fs from "fs";
import path from "path";

const oldLf = `html body h2 > span + span + span{
  display:inline !important;
}`;

const neu = `html body h2 > span + span + span{
  display:inline !important;
}
/* Headings must flow as one phrase — no forced line breaks via <em> or <br> */
html body :is(h1, h2, h3, h4, h5, h6) em{
  display:inline !important;
}
html body :is(h1, h2, h3, h4, h5, h6) br{
  display:none !important;
}`;

const dir = path.join(process.cwd(), "app");
let n = 0;
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".css"))) {
  const p = path.join(dir, f);
  let c = fs.readFileSync(p, "utf8");
  if (c.includes("Headings must flow as one phrase")) {
    console.log("already", f);
    continue;
  }
  const oldCr = oldLf.replace(/\n/g, "\r\n");
  let next = c;
  if (c.includes(oldLf)) next = c.split(oldLf).join(neu);
  else if (c.includes(oldCr)) next = c.split(oldCr).join(neu.replace(/\n/g, "\r\n"));
  else {
    console.log("miss pattern", f);
    continue;
  }
  fs.writeFileSync(p, next);
  n++;
  console.log("patched", f, "occurrences", (c.match(/span \+ span \+ span/g) || []).length);
}
console.log("done", n);
