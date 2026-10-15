import fs from "fs";

const b = fs.readFileSync(
  "lib/artificial-intelligence-services-body.html",
  "utf8"
);
const ids = [...b.matchAll(/<section[^>]*id="([^"]+)"/g)].map((m) => m[1]);
console.log("sections:", ids.join(" > "));
console.log({
  bvsw: b.includes("bvsw"),
  dataSvar: b.includes("data-svar"),
  dataBvar: b.includes("data-bvar"),
  proofExact: /\sid=["']proof["']/.test(b),
  proofV2: b.includes("proof-v2"),
  buildV2: b.includes("build-v2"),
  brackets: (b.match(/\[[A-Za-z][^\]]{5,100}\]/g) || []).slice(0, 12),
});
console.log(
  "meta",
  JSON.parse(
    fs.readFileSync("lib/artificial-intelligence-services-meta.json", "utf8")
  )
);
const css = fs.readFileSync("app/artificial-intelligence-services.css", "utf8");
console.log({
  cssKb: +(css.length / 1024).toFixed(1),
  hasS5: css.includes("#proof-v3"),
  hasB5: css.includes("#build-v3"),
  hasBvsw: css.includes(".bvsw"),
  hasDataSvarHide: /\[data-svar\][^{]*\{\s*display\s*:\s*none/i.test(css),
});
