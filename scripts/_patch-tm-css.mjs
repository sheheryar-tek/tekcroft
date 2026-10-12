import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const FILES = [
  ["app/local-seo.css", "services-2"],
  ["app/ai-seo.css", "model"],
  ["app/franchise-seo.css", "franchise-covers"],
  ["app/google-business-profile-optimization.css", "gbp-process"],
  ["app/technical-seo.css", "model"],
];

const EXTRA = (id) => `
.tm .ax-lede p{margin:0; font-size:inherit; line-height:inherit; color:inherit;}
.tm .ax-lede p + p{margin-top:10px;}
#${id} .tm-head{align-items:center !important;}
#${id} .tm-card > p,
#${id} .tm-card .fz-body{margin-bottom:0 !important;}
#${id} .tm-card .fz-body > :last-child{margin-bottom:0 !important;}
`;

for (const [rel, id] of FILES) {
  const fp = path.join(ROOT, rel);
  let css = fs.readFileSync(fp, "utf8");
  const marker = `/* === tm layout lock (match Technical SEO model) — scoped to .tm / #${id} === */`;
  const idx = css.lastIndexOf(marker);
  if (idx < 0) {
    console.log("no lock block", rel);
    continue;
  }
  // Drop any previous EXTRA patch markers inside lock
  const before = css.slice(0, idx);
  let lock = css.slice(idx);
  lock = lock.replace(
    /\n\.tm \.ax-lede p\{[\s\S]*?#\w+ \.tm-card \.fz-body > :last-child\{margin-bottom:0 !important;\}\n?/g,
    "\n"
  );
  if (!lock.includes(".tm .ax-lede p{")) {
    lock = lock.replace(
      /\.tm \.tm-head:not\(:has\(\.ax-lede\)\)\{grid-template-columns:minmax\(0,1fr\);\}\s*$/,
      `.tm .tm-head:not(:has(.ax-lede)){grid-template-columns:minmax(0,1fr);}\n${EXTRA(id).trim()}\n`
    );
  }
  fs.writeFileSync(fp, before + lock);
  console.log("patched", rel);
}
