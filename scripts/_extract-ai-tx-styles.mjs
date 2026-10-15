import fs from "fs";
import path from "path";

const srcHtml = path.join(
  process.env.USERPROFILE || "",
  "Downloads",
  "tekcroft-artificial-intelligence-services (3).html"
);
const outCss = path.resolve("c:/Tekcroft/app/ai-tx-styles.css");
const html = fs.readFileSync(srcHtml, "utf8");
const m = html.match(/<style id="ai-tx-styles">([\s\S]*?)<\/style>/);
if (!m) {
  console.error("ai-tx-styles not found");
  process.exit(1);
}
const verbatim = m[1].replace(/^\uFEFF/, "").trim() + "\n";
fs.writeFileSync(outCss, verbatim);
const kfs = [...verbatim.matchAll(/@keyframes (gx\w+)/g)].map((x) => x[1]);
console.log(JSON.stringify({ bytes: verbatim.length, keyframes: kfs }, null, 2));
