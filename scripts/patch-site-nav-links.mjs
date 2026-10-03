import fs from "fs";
import path from "path";

const lib = path.resolve("lib");
const files = fs.readdirSync(lib).filter((f) => f.endsWith("-body.html"));

let n = 0;
for (const f of files) {
  const p = path.join(lib, f);
  let s = fs.readFileSync(p, "utf8");
  const before = s;

  // Footer / in-page category anchors should reach homepage services from any page
  s = s.replaceAll('href="#services"', 'href="/#services"');
  s = s.replaceAll('href="#services-2"', 'href="/#services"');

  // Homepage-only section anchors on non-home pages
  if (f !== "homepage-body.html") {
    // Only rewrite plain hash links used in nav/footer — keep in-page ids intact
    s = s.replaceAll('href="#about"', 'href="/#about"');
    s = s.replaceAll('href="#work"', 'href="/#work"');
    s = s.replaceAll('href="#reviews"', 'href="/#reviews"');
  }

  // Map footer "Our services" category labels to real entry routes (keep labels)
  s = s.replace(
    /(<b>Our services<\/b>\s*)<a href="\/#services">SEO services<\/a>\s*<a href="\/#services">AI development<\/a>\s*<a href="\/#services">Automation<\/a>\s*<a href="\/#services">Web development<\/a>\s*<a href="\/#services">Software development<\/a>\s*<a href="\/#services">Digital marketing<\/a>/g,
    `$1<a href="/#services">SEO services</a>
            <a href="/services/ai-chatbot-development-services">AI development</a>
            <a href="/services/ai-agent-development-services">Automation</a>
            <a href="/services/web-design-and-development-services">Web development</a>
            <a href="/services/software-development-services">Software development</a>
            <a href="/services/mobile-app-development">Digital marketing</a>`
  );

  // "Digital marketing" → mobile app is wrong. Prefer local SEO / contact as last marketing-ish page.
  // Re-fix: Digital marketing has no page — keep /#services
  s = s.replace(
    '<a href="/services/mobile-app-development">Digital marketing</a>',
    '<a href="/#services">Digital marketing</a>'
  );

  if (s !== before) {
    fs.writeFileSync(p, s);
    n++;
    console.log("patched", f);
  }
}
console.log("files updated:", n);
