import fs from "fs";
import path from "path";

/**
 * One-shot / maintenance patcher: keep nav + footer on real page routes.
 * Never write /#… hashes.
 */
const lib = path.resolve("lib");
const files = fs.readdirSync(lib).filter((f) => f.endsWith("-body.html"));

const REPLACEMENTS = [
  ['href="#services"', 'href="/seo-services"'],
  ['href="#services-2"', 'href="/seo-services"'],
  ['href="/#services"', 'href="/seo-services"'],
  ['href="#about"', 'href="/about-us"'],
  ['href="/#about"', 'href="/about-us"'],
  ['href="#work"', 'href="/case-studies"'],
  ['href="/#work"', 'href="/case-studies"'],
  ['href="#reviews"', 'href="/case-studies"'],
  ['href="/#reviews"', 'href="/case-studies"'],
  ['href="#top"', 'href="/"'],
  ['href="/#top"', 'href="/"'],
  ['href="/#blueprint"', 'href="/"'],
  ['href="#blueprint"', 'href="/"'],
];

let n = 0;
for (const f of files) {
  const p = path.join(lib, f);
  let s = fs.readFileSync(p, "utf8");
  const before = s;

  for (const [from, to] of REPLACEMENTS) {
    s = s.replaceAll(from, to);
  }

  // Drop placeholder footer links that were never real pages
  s = s.replace(/\s*<a href="[^"]*">Testimonials<\/a>/g, "");
  s = s.replace(/\s*<a href="[^"]*">Our team<\/a>/g, "");
  s = s.replace(/\s*<a href="[^"]*">Careers<\/a>/g, "");

  if (s !== before) {
    fs.writeFileSync(p, s);
    n++;
    console.log("patched", f);
  }
}
console.log("files updated:", n);
