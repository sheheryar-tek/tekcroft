import fs from "fs";

const html = fs.readFileSync(
  "C:/Users/Super/Downloads/tekcroft-artificial-intelligence-services (3).html",
  "utf8"
);
const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)[1];

// strip variants we will delete, then check class usage
let kept = body
  .replace(/<section[^>]*id=["']proof["'][^>]*>[\s\S]*?<\/section>/i, "")
  .replace(/<section[^>]*id=["']proof-v2["'][^>]*>[\s\S]*?<\/section>/i, "")
  .replace(/<section[^>]*id=["']build-v2["'][^>]*>[\s\S]*?<\/section>/i, "")
  .replace(/<div class="bvsw"[\s\S]*?<\/div>/i, "");

const checks = {
  ".tb-": /\btb-|\bclass="[^"]*\btb\b/,
  ".st-": /\bst-|\bclass="[^"]*\bst\b/,
  ".s5-": /\bs5-/,
  ".b4": /\bb4/,
  ".b5": /\bb5/,
  ".pf-": /\bpf-/,
  ".mpc": /\bmpc/,
  ".wc-": /\bwc-/,
  ".wk-": /\bwk-/,
  ".sg-": /\bsg-/,
  ".hx-": /\bhx-/,
  ".gt-": /\bgt-/,
  ".tm-": /\btm-/,
  ".ig-": /\big-/,
  ".gv-": /\bgv-/,
  ".em-": /\bem-/,
  ".wy-": /\bwy-/,
  ".sw-": /\bsw-/,
};
for (const [k, re] of Object.entries(checks)) {
  console.log(k, re.test(kept));
}

// data attributes on kept sections
const attrs = [...kept.matchAll(/<(?:section|div)[^>]*(data-[sb]var)=["']([^"']+)["'][^>]*>/gi)].map(
  (m) => `${m[1]}=${m[2]} id≈${(m[0].match(/id=["']([^"']+)/) || [])[1]}`
);
console.log("kept attrs", attrs);

// mm-current etc — likely mega menu polish; other extracts keep some
console.log(
  "mm style ids present",
  [
    "mm-veil-lighter",
    "mm-bottom-copy",
    "mm-core-pills",
    "mm-core-strong",
    "mm-spacing",
    "mm-core-v3",
    "mm-core-fit",
    "mm-current",
  ].filter((id) => html.includes(`id="${id}"`))
);
