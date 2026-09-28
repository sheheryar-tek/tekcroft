import fs from "fs";
import path from "path";

const bodyPath = path.join("c:/Tekcroft", "lib/on-page-seo-body.html");
let html = fs.readFileSync(bodyPath, "utf8");

/** Extract a top-level <section ... id="ID">...</section>, including a
 *  leading HTML comment immediately above it when present. */
function extractSection(src, id) {
  const re = new RegExp(`<section\\b[^>]*\\bid="${id}"[^>]*>`);
  const m = src.match(re);
  if (!m || m.index == null) throw new Error("missing section #" + id);
  const tagStart = m.index;

  let commentStart = tagStart;
  const comment = src.lastIndexOf("<!--", tagStart);
  if (comment >= 0 && comment > tagStart - 900) {
    const between = src.slice(comment, tagStart);
    if (!between.includes("</section>") && !between.includes("<section")) {
      commentStart = comment;
    }
  }

  let i = tagStart;
  let depth = 0;
  let end = -1;
  while (i < src.length) {
    if (src.startsWith("<section", i)) {
      depth++;
      i = src.indexOf(">", i) + 1;
      continue;
    }
    if (src.startsWith("</section>", i)) {
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
  if (end < 0) throw new Error("unclosed #" + id);
  return { start: commentStart, end, html: src.slice(commentStart, end) };
}

const ORDER = [
  "framework-v2", // Built to Rank
  "services-2", // Deliverables
  "apart", // What Sets Our On-Page SEO Apart
  "process", // Optimization Without a Plan
  "ai-search", // Search Isn't Just Google Anymore
  "scope", // What's Included, and What Isn't
  "clients", // Happy customers / trusted by
  "industries", // Industries We Optimize For
  "faq", // FAQs
  "fit", // keep (unlisted) before contact
];

const pieces = {};
for (const id of ORDER) {
  pieces[id] = extractSection(html, id);
}
const proof = extractSection(html, "proof");
const contact = extractSection(html, "contact");

// Cut from start of proof through end of last movable section / contact,
// then rebuild. Hero stays. Footer after contact stays.
const firstCut = proof.start;
// Everything after contact section that is footer chrome
const afterContact = html.slice(contact.end);

// Also need content between hero end and proof — usually blank/newlines
const heroEnd = html.indexOf("</section>", html.indexOf('id="hero-1"'));
if (heroEnd < 0) throw new Error("hero close missing");
const heroCloseEnd = heroEnd + "</section>".length;
const head = html.slice(0, heroCloseEnd);

const mid = [
  "",
  proof.html,
  "",
  ...ORDER.map((id) => pieces[id].html),
  "",
  contact.html,
].join("\n\n");

// Ensure </main> wraps content: open main already in head; close before footer
let foot = afterContact.replace(/^\s*<\/main>\s*/i, "\n");
// If footer comment exists, fine
const rebuilt =
  head +
  "\n\n" +
  mid +
  "\n\n</main>\n" +
  foot.replace(/^\s*<\/main>\s*/i, "");

// Clean accidental double </main>
const cleaned = rebuilt.replace(/<\/main>\s*<\/main>/g, "</main>");

fs.writeFileSync(bodyPath, cleaned);

// Verify order of section ids in file
const ids = [];
const re = /<section\b[^>]*\bid="([^"]+)"/g;
let mm;
const check = fs.readFileSync(bodyPath, "utf8");
while ((mm = re.exec(check))) ids.push(mm[1]);
console.log("section order:", ids.join(" → "));

const expect = [
  "hero-1",
  "proof",
  ...ORDER,
  "contact",
];
const got = ids.filter((id) => expect.includes(id) || ORDER.includes(id) || id === "hero-1" || id === "proof" || id === "contact");
const ok = expect.every((id, i) => got[i] === id);
if (!ok) {
  console.error("expected", expect.join(" → "));
  console.error("got     ", got.join(" → "));
  throw new Error("order verify failed");
}
if ((check.match(/<\/main>/g) || []).length !== 1) {
  throw new Error("expected exactly one </main>");
}
console.log("done");
