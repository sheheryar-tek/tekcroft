/**
 * Site-wide semantic HTML / heading hierarchy fixes.
 * - Demote mega-menu title + hero form titles (not document headings)
 * - Keep visual CSS via class selectors
 * - Remove leftover A/B variant sections + switchers
 */
import fs from "fs";
import path from "path";

const root = process.cwd();
const lib = path.join(root, "lib");

const bodies = fs
  .readdirSync(lib)
  .filter((f) => f.endsWith("-body.html") || f === "homepage-body.html");

function demoteMmAndForm(html) {
  let n = 0;
  // Mega menu label — not a document heading
  html = html.replace(
    /<h3 class="mm-title">([\s\S]*?)<\/h3>/g,
    (_, inner) => {
      n++;
      return `<p class="mm-title">${inner}</p>`;
    }
  );
  // Hero lead form titles — form chrome, not H1→H3 skip
  html = html.replace(
    /(<form class="hs-form"[^>]*>\s*)<h3>([\s\S]*?)<\/h3>/g,
    (_, open, inner) => {
      n++;
      return `${open}<p class="hs-form-title">${inner}</p>`;
    }
  );
  return { html, n };
}

function findIdIndex(html, id) {
  const re = new RegExp(`id="${id}"(?![\\w-])`);
  const m = re.exec(html);
  return m ? m.index : -1;
}

function stripSectionById(html, id) {
  const open = findIdIndex(html, id);
  if (open < 0) return { html, removed: false };
  const start = html.lastIndexOf("<section", open);
  if (start < 0) return { html, removed: false };
  let i = start;
  let depth = 0;
  while (i < html.length) {
    const nextOpen = html.indexOf("<section", i);
    const nextClose = html.indexOf("</section>", i);
    if (nextClose < 0) break;
    if (nextOpen >= 0 && nextOpen < nextClose) {
      depth++;
      i = nextOpen + 8;
      continue;
    }
    depth--;
    i = nextClose + "</section>".length;
    if (depth === 0) {
      let from = start;
      const before = html.slice(Math.max(0, start - 220), start);
      const cmt = before.lastIndexOf("<!--");
      if (cmt >= 0 && /variant|══════════/i.test(before.slice(cmt))) {
        from = Math.max(0, start - 220) + cmt;
      }
      return { html: html.slice(0, from) + html.slice(i), removed: true };
    }
  }
  return { html, removed: false };
}

function stripVsw(html) {
  return html.replace(
    /\s*<!--\s*review aid:[\s\S]*?-->\s*<div class="vsw"[\s\S]*?<\/div>/gi,
    "\n"
  );
}

let demoteTotal = 0;
for (const file of bodies) {
  const fp = path.join(lib, file);
  let html = fs.readFileSync(fp, "utf8");
  const r = demoteMmAndForm(html);
  html = r.html;
  demoteTotal += r.n;

  if (file === "ai-agent-development-body.html") {
    const a = stripSectionById(html, "problem"); // remove variant 1; keep problem-v2
    html = a.html;
    html = stripVsw(html);
    // Promote kept variant to canonical id
    html = html.replace(
      /id="problem-v2" data-variant="2"/,
      'id="problem" data-variant="2"'
    );
    console.log("ai-agent: removed problem v1 + vsw, kept v2 as #problem", a.removed);
  }

  if (file === "franchise-seo-body.html") {
    const a = stripSectionById(html, "duplicate"); // remove variant 1
    html = a.html;
    html = stripVsw(html);
    html = html.replace(
      /id="duplicate-v2" data-lp-variant="2"/,
      'id="duplicate" data-lp-variant="2"'
    );
    console.log("franchise: removed duplicate v1 + vsw, kept v2 as #duplicate", a.removed);
  }

  fs.writeFileSync(fp, html);
  if (r.n) console.log(file, "demotions:", r.n);
}
console.log("total demotions:", demoteTotal);

/* CSS: preserve look after tag changes */
const cssFiles = fs
  .readdirSync(path.join(root, "app"))
  .filter((f) => f.endsWith(".css"))
  .map((f) => path.join(root, "app", f));

let cssPatches = 0;
for (const fp of cssFiles) {
  let css = fs.readFileSync(fp, "utf8");
  const before = css;
  // mm-title
  css = css.replaceAll(".mm-copy h3", ".mm-copy h3, .mm-copy .mm-title");
  // avoid double-duplicating if run twice
  css = css.replaceAll(
    ".mm-copy h3, .mm-copy .mm-title, .mm-copy .mm-title",
    ".mm-copy h3, .mm-copy .mm-title"
  );
  // hs-form title
  css = css.replaceAll(".hs-form > h3", ".hs-form > h3, .hs-form > .hs-form-title");
  css = css.replaceAll(
    ".hs-form > h3, .hs-form > .hs-form-title, .hs-form > .hs-form-title",
    ".hs-form > h3, .hs-form > .hs-form-title"
  );
  // site-consistency compact hero form title block
  css = css.replaceAll(
    "html body .hs-form > h3,",
    "html body .hs-form > h3,\nhtml body .hs-form > .hs-form-title,"
  );
  css = css.replaceAll(
    "html body .hs-form > h3,\nhtml body .hs-form > .hs-form-title,\nhtml body .hs-form > .hs-form-title,",
    "html body .hs-form > h3,\nhtml body .hs-form > .hs-form-title,"
  );
  if (css !== before) {
    fs.writeFileSync(fp, css);
    cssPatches++;
    console.log("css patched", path.basename(fp));
  }
}
console.log("css files patched:", cssPatches);

/* Strip variant switcher JS from unhashed sources */
function stripVswJs(fp, marker) {
  if (!fs.existsSync(fp)) return false;
  let js = fs.readFileSync(fp, "utf8");
  const before = js;
  // Remove IIFE blocks that reference .vsw / problem-v2 / duplicate-v2 pickers
  js = js.replace(
    /\n?\s*\(function\(\)\{\s*var secs=\{[^}]*problem[^}]*\}[\s\S]*?pick\(saved\);\s*\}\)\(\);\s*/g,
    "\n"
  );
  js = js.replace(
    /\n?\s*\(function\(\)\{\s*var secs=\{[^}]*duplicate[^}]*\}[\s\S]*?pick\(saved\);\s*\}\)\(\);\s*/g,
    "\n"
  );
  if (js !== before) {
    fs.writeFileSync(fp, js);
    console.log("js cleaned", path.basename(fp), marker);
    return true;
  }
  console.log("js unchanged", path.basename(fp));
  return false;
}

stripVswJs(path.join(root, "public", "tekcroft-ai-agent-development.js"), "ai");
stripVswJs(path.join(root, "public", "tekcroft-franchise-seo.js"), "fr");

console.log("done");
