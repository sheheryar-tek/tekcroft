import fs from "fs";

const SRC =
  "C:/Users/Super/Downloads/tekcroft-artificial-intelligence-services (3).html";
console.time("read");
const html = fs.readFileSync(SRC, "utf8");
console.timeEnd("read");
console.log("html MB", (html.length / 1024 / 1024).toFixed(2));

const ids = [
  "hs-styles",
  "tb-styles",
  "hero-copy-styles",
  "svc-styles",
  "mpc-styles",
  "pf-styles",
  "cn-styles",
  "cn-refine",
  "faq-pics",
  "rhythm-styles",
  "eg-styles",
  "wc-styles",
  "wk-styles",
  "sg-styles",
  "cn-subs",
  "wc-five",
  "pf-three",
  "hx-styles",
  "gt-styles",
  "foot-lift",
  "hs-form-theme",
  "foot-final",
  "consistency",
  "hx-trace",
  "consistency-2",
  "hero-form-glass",
  "mm-veil-lighter",
  "mm-bottom-copy",
  "mm-core-pills",
  "mm-core-strong",
  "mm-spacing",
  "mm-core-v3",
  "mm-core-fit",
  "mm-current",
  "tm-styles",
  "tm-extra-styles",
  "ai-delivers",
  "b5-styles",
  "ai-tx-styles",
  "ig-styles",
  "gv-styles",
  "ai-process-fix",
  "ind-marks",
  "pf-cs",
  "ind-photos",
  "ind-hues",
  "pf-ai",
  "ind-ai",
  "wy-styles",
  "em-styles",
  "faq-ai",
  "cta-ai",
  "s5-styles",
  "hs-logos-styles",
  "sw-styles",
  "ais-eyebrow",
];

console.time("extract");
const parts = [];
for (const id of ids) {
  console.time(id);
  const re = new RegExp(`<style id="${id}">([\\s\\S]*?)</style>`, "gi");
  const matches = [...html.matchAll(re)];
  console.timeEnd(id);
  console.log(" ", id, "matches", matches.length, "chars", matches.reduce((a, m) => a + m[1].length, 0));
  for (const m of matches) parts.push(m[1]);
}
console.timeEnd("extract");
const css = parts.join("\n");
console.log("css MB", (css.length / 1024 / 1024).toFixed(2));
console.log("data uris", (css.match(/data:image/gi) || []).length);
