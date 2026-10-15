import fs from "fs";

const html = fs.readFileSync(
  "C:/Users/Super/Downloads/tekcroft-artificial-intelligence-services (3).html",
  "utf8"
);
const css = fs.readFileSync("app/artificial-intelligence-services.css", "utf8");
const pageCss = css.split("/* === SITE CONSISTENCY LOCK")[0];

const GLOBAL = new Set([
  "tk-core",
  "mm-styles",
  "foot-styles",
  "faq-styles",
]);
const DROP = new Set(["bvsw-styles", "b4-styles", "st-styles"]);

const styles = [...html.matchAll(/<style[^>]*id="([^"]+)"/gi)].map((m) => m[1]);
const extracted = new Set(
  [...pageCss.matchAll(/\/\* === ([^*\n]+?) === \*\//g)].map((m) =>
    m[1].replace(/-\d+$/, "").trim()
  )
);

console.log("SOURCE STYLE IDS:");
for (const id of styles) {
  const status = GLOBAL.has(id)
    ? "GLOBAL"
    : DROP.has(id)
      ? "DROPPED"
      : extracted.has(id)
        ? "ok"
        : "MISSING";
  if (status !== "ok") console.log(" ", status, id);
}

// Size compare for key page styles
for (const id of [
  "tm-styles",
  "ai-delivers",
  "b5-styles",
  "ai-tx-styles",
  "ig-styles",
  "gv-styles",
  "eg-styles",
  "wy-styles",
  "em-styles",
  "s5-styles",
  "pf-styles",
  "ind-photos",
  "pf-ai",
]) {
  const src = (html.match(new RegExp(`<style id="${id}">([\\s\\S]*?)</style>`, "i")) || [])[1] || "";
  const got = (pageCss.match(new RegExp(`\\/\\* === ${id}(?:-\\d+)? === \\*\\/\\n([\\s\\S]*?)(?=\\n\\/\\* === |$)`)) || [])[1] || "";
  console.log(
    id,
    "src",
    src.length,
    "out",
    got.length,
    "delta",
    got.length - src.length
  );
}

// Check for destructive overrides after page CSS
const lock = css.includes("SITE CONSISTENCY LOCK");
const overrides = [
  ".sec{",
  "padding-block",
  "font-size:var(--body)",
  "content-visibility",
  "#process",
  "#faq",
  "#why",
];
console.log("\nlock?", lock);
for (const o of overrides) {
  const inPage = pageCss.split(o).length - 1;
  const inLock = lock ? css.split("SITE CONSISTENCY")[1].split(o).length - 1 : 0;
  console.log(`  '${o}' page=${inPage} lock=${inLock}`);
}
