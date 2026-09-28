import fs from "fs";
import path from "path";

const ROOT = "c:/Tekcroft";
const lib = path.join(ROOT, "lib");

const TICKER = `
  <div class="ticker">
    <div class="wrap"><div class="marq"><div class="marq-track" id="marqTrack"></div></div></div>
  </div>
`;

const FILES = [
  "on-page-seo-body.html",
  "local-seo-body.html",
  "ecommerce-seo-body.html",
  "technical-seo-body.html",
  "seo-audit-services-body.html",
  "franchise-seo-body.html",
  "google-business-profile-optimization-body.html",
  "mobile-app-development-body.html",
  "custom-software-development-body.html",
  "web-design-and-development-body.html",
  "ai-chatbot-development-body.html",
  "ai-agent-development-body.html",
];

function insertTicker(html) {
  if (html.includes('id="marqTrack"')) {
    return { html, status: "skip" };
  }
  const marker = 'id="hero-1"';
  const start = html.indexOf(marker);
  if (start < 0) return { html, status: "no-hero" };

  // Find the opening <section ... id="hero-1"> then its matching close
  const secOpen = html.lastIndexOf("<section", start);
  if (secOpen < 0) return { html, status: "no-section" };

  let i = secOpen;
  let depth = 0;
  let end = -1;
  while (i < html.length) {
    if (html.startsWith("<section", i)) {
      depth++;
      i = html.indexOf(">", i) + 1;
      continue;
    }
    if (html.startsWith("</section>", i)) {
      depth--;
      i += "</section>".length;
      if (depth === 0) {
        end = i;
        break;
      }
      continue;
    }
    i++;
  }
  if (end < 0) return { html, status: "unclosed" };

  const closeTag = "</section>";
  const closeAt = end - closeTag.length;
  const before = html.slice(0, closeAt);
  const after = html.slice(closeAt);
  return {
    html: before.replace(/\s+$/, "") + "\n" + TICKER + after,
    status: "ok",
  };
}

for (const file of FILES) {
  const p = path.join(lib, file);
  const raw = fs.readFileSync(p, "utf8");
  const { html, status } = insertTicker(raw);
  if (status === "ok") {
    fs.writeFileSync(p, html);
    console.log("inserted", file);
  } else {
    console.log(status, file);
  }
}
console.log("done");
