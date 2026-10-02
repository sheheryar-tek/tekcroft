import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = path.join(ROOT, "lib/ecommerce-seo-body.html");
let h = fs.readFileSync(file, "utf8");

const reps = [
  [
    /<img src="\/images\/ecom-ac-audit-[^"]+"[^>]*>/,
    '<img src="/images/ecom-ac-audit-b7228db965.webp" width="1200" height="800" alt="Ecommerce SEO Audit" title="Ecommerce SEO Audit" decoding="async" loading="lazy">',
  ],
  [
    /<img src="\/images\/ecom-ac-keywords-[^"]+"[^>]*>/,
    '<img src="/images/ecom-ac-keywords-63d1d168f6.webp" width="1200" height="800" alt="Keyword Strategy &amp; Search Intent" title="Keyword Strategy &amp; Search Intent" decoding="async" loading="lazy">',
  ],
  [
    /<img src="\/images\/ecom-ac-product-[^"]+"[^>]*>/,
    '<img src="/images/ecom-ac-product-7ef724df85.webp" width="1200" height="800" alt="Ecommerce Product Page SEO" title="Ecommerce Product Page SEO" decoding="async" loading="lazy">',
  ],
  [
    /<img src="\/images\/ecom-ac-category-[^"]+"[^>]*>/,
    '<img src="/images/ecom-ac-category-2113e87f5d.webp" width="1200" height="800" alt="Ecommerce Category Page SEO" title="Ecommerce Category Page SEO" decoding="async" loading="lazy">',
  ],
  [
    /<img src="\/images\/ecom-ac-technical-[^"]+"[^>]*>/,
    '<img src="/images/ecom-ac-technical-72db2e6c80.webp" width="1200" height="800" alt="Technical SEO" title="Technical SEO" decoding="async" loading="lazy">',
  ],
  [
    /<img src="\/images\/ecom-ac-content-[^"]+"[^>]*>/,
    '<img src="/images/ecom-ac-content-50c9e563e4.webp" width="1200" height="800" alt="Ecommerce Content Optimization" title="Ecommerce Content Optimization" decoding="async" loading="lazy">',
  ],
];

for (const [re, next] of reps) {
  if (!re.test(h)) {
    console.error("MISS", String(re));
    process.exit(1);
  }
  h = h.replace(re, next);
}

fs.writeFileSync(file, h);
console.log("ok");
