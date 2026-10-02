import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = path.join(ROOT, "lib/seo-audit-services-body.html");
let h = fs.readFileSync(file, "utf8");

const reps = [
  [
    /<img src="\/images\/seo-audit-hero-[^"]+"[^>]*>/,
    '<img src="/images/seo-audit-hero-d8c96ef554.webp" width="1024" height="499" alt="SEO Audit Services that show what to fix first for rankings" title="SEO Audit Services" decoding="async" fetchpriority="high">',
  ],
  [
    /<img src="\/images\/audit-ac-technical-[^"]+"[^>]*>/,
    '<img src="/images/audit-ac-technical-d36c256fb4.webp" width="1200" height="800" alt="Technical SEO Audit for crawlability, indexing, and site health" title="Technical SEO Audit" decoding="async" loading="lazy">',
  ],
  [
    /<img src="\/images\/audit-ac-content-[^"]+"[^>]*>/,
    '<img src="/images/audit-ac-content-560308a78c.webp" width="1200" height="800" alt="On-Page and Content Audit for titles, copy, and page structure" title="On-Page &amp; Content Audit" decoding="async" loading="lazy">',
  ],
  [
    /<img src="\/images\/audit-ac-backlinks-[^"]+"[^>]*>/,
    '<img src="/images/audit-ac-backlinks-b22765e256.webp" width="1200" height="800" alt="Backlink and Authority Audit for link profile quality and strength" title="Backlink &amp; Authority Audit" decoding="async" loading="lazy">',
  ],
  [
    /<img src="\/images\/audit-ac-competitor-[^"]+"[^>]*>/,
    '<img src="/images/audit-ac-competitor-2a317b96a7.webp" width="1200" height="800" alt="Competitor Gap Analysis to find ranking opportunities you are missing" title="Competitor Gap Analysis" decoding="async" loading="lazy">',
  ],
  [
    /<img src="\/images\/audit-ac-geo-[^"]+"[^>]*>/,
    '<img src="/images/audit-ac-geo-4f3723bc3c.webp" width="1200" height="800" alt="AI Search GEO Readiness Audit for ChatGPT and AI answer engines" title="AI Search (GEO) Readiness Audit" decoding="async" loading="lazy">',
  ],
  [
    /<img src="\/images\/audit-ac-analytics-[^"]+"[^>]*>/,
    '<img src="/images/audit-ac-analytics-18b00abf76.webp" width="1200" height="800" alt="Analytics and Conversion Tracking Audit for GA4 and goal measurement" title="Analytics &amp; Conversion Tracking Audit" decoding="async" loading="lazy">',
  ],
  [
    /<img src="\/images\/seo-audit-faq-[^"]+"[^>]*>/,
    '<img src="/images/seo-audit-faq-ae80140aaa.webp" width="708" height="1024" alt="Frequently asked questions about SEO Audit Services" title="SEO Audit Services FAQs" decoding="async" loading="lazy">',
  ],
];

for (const [re, next] of reps) {
  if (!re.test(h)) {
    console.error("MISS", String(re));
    process.exit(1);
  }
  h = h.replace(re, next);
}

if (!h.includes('class="vs-bg"')) {
  h = h.replace(
    '<section class="sec vs" id="vs" data-ground="tint">',
    `<section class="sec vs" id="vs" data-ground="tint">
  <div class="vs-bg" aria-hidden="true"><img src="/images/seo-audit-vs-178dfe4b26.webp" width="1920" height="1080" alt="DIY vs ChatGPT vs Professional SEO Audit comparison" title="DIY Vs ChatGPT Vs Professional SEO Audit" decoding="async" loading="lazy"></div>`
  );
}

fs.writeFileSync(file, h);
console.log("html ok");
