import fs from "fs";

const p = "lib/local-seo-body.html";
let h = fs.readFileSync(p, "utf8");
const before = (h.match(/tm-veil"><\/span><\/span><\/span>/g) || []).length;
h = h.replace(
  /(<span class="tm-bg" aria-hidden="true"><img[^>]*><span class="tm-veil"><\/span>)<\/span><\/span>/g,
  "$1</span>"
);
const after = (h.match(/tm-veil"><\/span><\/span><\/span>/g) || []).length;
const ok = (h.match(/localseo-tm-\d{2}-[a-f0-9]+\.webp/g) || []).length;
const sample = h.includes(
  'loading="lazy"><span class="tm-veil"></span></span>\n          <span class="tm-slim"'
);
fs.writeFileSync(p, h);
console.log({ before, after, ok, sampleOk: sample });
