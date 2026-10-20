import fs from "fs";

const files = [
  "scripts/slim-service-pages.mjs",
  "scripts/extract-seo-services.mjs",
  "scripts/extract-seo-audit-services.mjs",
  "scripts/extract-ecommerce-seo.mjs",
  "scripts/extract-contact.mjs",
  "scripts/extract-ai-seo.mjs",
  "scripts/_extracted-aiseo-body.html",
  "scripts/verify-boot.mjs",
];

const map = [
  ['href="/#about"', 'href="/about-us"'],
  ['href="/#work"', 'href="/case-studies"'],
  ['href="/#services"', 'href="/seo-services"'],
  ['href="/#reviews"', 'href="/case-studies"'],
  ['href="/#top"', 'href="/"'],
  ['href="#top"', 'href="/"'],
  ['href="/contact"', 'href="/contact-us"'],
  ['class="logo" href="#top"', 'class="logo" href="/"'],
];

for (const f of files) {
  if (!fs.existsSync(f)) {
    console.log("skip missing", f);
    continue;
  }
  let s = fs.readFileSync(f, "utf8");
  const before = s;
  for (const [a, b] of map) s = s.replaceAll(a, b);
  if (f.endsWith(".html")) {
    s = s.replace(/\s*<a href="[^"]*">Testimonials<\/a>/g, "");
    s = s.replace(/\s*<a href="[^"]*">Our team<\/a>/g, "");
    s = s.replace(/\s*<a href="[^"]*">Careers<\/a>/g, "");
  }
  if (s !== before) {
    fs.writeFileSync(f, s);
    console.log("updated", f);
  } else {
    console.log("unchanged", f);
  }
}
