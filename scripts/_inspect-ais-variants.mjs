import fs from "fs";

const html = fs.readFileSync(
  "C:/Users/Super/Downloads/tekcroft-artificial-intelligence-services (3).html",
  "utf8"
);

function grab(id) {
  const re = new RegExp(
    `<section[^>]*id=["']${id}["'][^>]*>[\\s\\S]*?</section>`,
    "i"
  );
  const m = html.match(re);
  return m ? m[0].length : 0;
}

for (const id of [
  "proof",
  "proof-v2",
  "proof-v3",
  "build-v2",
  "build-v3",
  "model",
  "tech-v4",
  "integ",
  "govern",
  "process",
  "industries",
  "why",
  "models",
  "faq",
  "contact",
]) {
  console.log(id, grab(id));
}

// variant display rules
const hits = [
  ...html.matchAll(/\[data-svar[^\]]*\][^{]*\{[^}]+\}/g),
  ...html.matchAll(/\[data-bvar[^\]]*\][^{]*\{[^}]+\}/g),
  ...html.matchAll(/#proof(?!-v)[^{]*\{[^}]{0,120}/g),
];
console.log("\ndata rules sample:");
for (const m of hits.slice(0, 30)) console.log(m[0].slice(0, 160));

// script snippets about variants
for (const id of [
  "s5-script",
  "b4-script",
  "b5-script",
  "bvsw-script",
  "st-styles",
  "s5-styles",
  "b4-styles",
  "b5-styles",
  "bvsw-styles",
]) {
  const style = html.match(
    new RegExp(`<style id="${id}">([\\s\\S]*?)</style>`, "i")
  );
  const script = html.match(
    new RegExp(`<script[^>]*id="${id}"[^>]*>([\\s\\S]*?)</script>`, "i")
  );
  const block = style?.[1] || script?.[1] || "";
  console.log(
    `\n=== ${id} (${block.length} chars) first 400 ===\n`,
    block.slice(0, 400)
  );
}

// bvsw markup
const bv = html.match(/<div class="bvsw"[\s\S]*?<\/div>\s*(?=<|$)/i);
console.log("\nbvsw len", bv ? bv[0].length : 0);
if (bv) console.log(bv[0].slice(0, 800));
