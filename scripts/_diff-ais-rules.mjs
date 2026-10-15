import fs from "fs";

const html = fs.readFileSync(
  "C:/Users/Super/Downloads/tekcroft-artificial-intelligence-services (3).html",
  "utf8"
);
const pageCss = fs
  .readFileSync("app/artificial-intelligence-services.css", "utf8")
  .split("/* === SITE CONSISTENCY LOCK")[0];

function stripData(css) {
  return css.replace(/data:image\/[a-zA-Z0-9+.+-]*;base64,[A-Za-z0-9+/=]+/g, "DATA");
}

function selectors(css) {
  const out = [];
  const re = /(^|})([^{}@]+)\{/g;
  let m;
  while ((m = re.exec(css))) {
    const sel = m[2].replace(/\/\*[\s\S]*?\*\//g, "").trim();
    if (sel && !sel.startsWith("@")) out.push(sel.replace(/\s+/g, " ").slice(0, 120));
  }
  return out;
}

for (const id of [
  "tm-styles",
  "pf-styles",
  "ind-photos",
  "pf-ai",
  "ai-tx-styles",
  "b5-styles",
  "consistency-2",
  "hs-styles",
  "ai-delivers",
]) {
  const src =
    (html.match(new RegExp(`<style id="${id}">([\\s\\S]*?)</style>`, "i")) ||
      [])[1] || "";
  const got =
    (
      pageCss.match(
        new RegExp(
          `\\/\\* === ${id}(?:-\\d+)? === \\*\\/\\n([\\s\\S]*?)(?=\\n\\/\\* === |$)`
        )
      ) || []
    )[1] || "";
  const srcS = selectors(stripData(src));
  const gotS = selectors(got);
  const missing = srcS.filter((s) => !gotS.includes(s));
  const extra = gotS.filter((s) => !srcS.includes(s));
  console.log(
    `\n${id}: srcSel=${srcS.length} gotSel=${gotS.length} missing=${missing.length} extra=${extra.length}`
  );
  missing.slice(0, 8).forEach((s) => console.log("  -", s));
  if (!src) console.log("  (no source block)");
  if (!got) console.log("  (no extracted block)");
}

// consistency-2 missing from extract list?
console.log("\nconsistency-2 in page?", pageCss.includes("/* === consistency-2"));

// site-consistency destructive rules that might fight AIS
const lock = fs.readFileSync("app/site-consistency.css", "utf8");
const fights = [
  "#proof-v3",
  "#build-v3",
  "#model",
  "#tech-v4",
  ".tm-",
  ".b5-",
  ".s5-",
  ".ai-tx",
  ".ig-",
  ".gv-",
  ".em-",
];
console.log("\nlock mentions:");
for (const f of fights) {
  const n = lock.split(f).length - 1;
  if (n) console.log(" ", f, n);
}
