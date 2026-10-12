/**
 * Align every section.sec.tm with the Technical SEO model layout:
 * - no eyebrow, intro as .ax-lede with blue left border
 * - CTA below panels as .tm-cta (centred)
 * - remove Service/Step chips
 * - compact open card + scoped CSS refinements
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const PAGES = [
  {
    body: "lib/local-seo-body.html",
    css: "app/local-seo.css",
    id: "services-2",
  },
  {
    body: "lib/ai-seo-body.html",
    css: "app/ai-seo.css",
    id: "model",
  },
  {
    body: "lib/franchise-seo-body.html",
    css: "app/franchise-seo.css",
    id: "franchise-covers",
  },
  {
    body: "lib/google-business-profile-optimization-body.html",
    css: "app/google-business-profile-optimization.css",
    id: "gbp-process",
  },
  {
    body: "lib/technical-seo-body.html",
    css: "app/technical-seo.css",
    id: "model",
  },
];

function refineCss(id) {
  return `
/* === tm layout lock (match Technical SEO model) — scoped to .tm / #${id} === */
.tm .ax-lede{margin:0; justify-self:end; max-width:44ch; padding-left:clamp(16px,1.6vw,22px); border-left:2px solid var(--primary); font-size:clamp(15px,1.1vw,17px); line-height:1.6; color:var(--text-2);}
.tm .ax-lede + .ax-lede{margin-top:10px;}
.tm .tm-head{align-items:center;}
.tm .tm-head .smark{display:none !important;}
.tm .tm-chip{display:none !important;}
#${id} .tm-cta{display:flex; justify-content:center; margin-top:clamp(28px,3vw,40px);}
@media (max-width:600px){ #${id} .tm-cta .btn{width:100%; justify-content:center; text-align:center;} }
#${id} .tm-open{align-items:center;}
#${id} .tm-card{height:auto !important; min-height:0 !important; align-self:center !important; justify-content:flex-start !important;}
#${id} .tm-viz{align-self:center;}
@media (max-width:980px){
  #${id} .tm-open{align-items:stretch;}
  #${id} .tm-card{align-self:stretch !important;}
  #${id} .tm-viz{align-self:stretch !important; width:100% !important; justify-self:stretch;}
  #${id} .tm-viz .tv{width:100% !important; max-width:none !important; box-sizing:border-box;}
}
@media (max-width:860px){ .tm .ax-lede{justify-self:start;} }
.tm .tm-head:not(:has(.ax-lede)){grid-template-columns:minmax(0,1fr);}
`;
}

function extractSection(html) {
  const re = /<section\b[^>]*\bclass="[^"]*\btm\b[^"]*"[^>]*>[\s\S]*?<\/section>/i;
  const m = html.match(re);
  if (!m) throw new Error("tm section not found");
  return { full: m[0], index: m.index, re };
}

function transformSection(section, id) {
  let s = section;

  // Remove chips
  s = s.replace(
    /\s*<span class="tm-chip"><i><\/i>[^<]*<\/span>/g,
    ""
  );

  // Remove eyebrow smark inside tm-head only (first occurrence in head)
  s = s.replace(
    /(<div class="tm-head[^"]*"[^>]*>\s*<div>\s*)<span class="smark"><b>[^<]*<\/b><\/span>\s*/i,
    "$1"
  );

  // Extract CTA from tm-aside or ax-cta before rewriting head
  let ctaHref = "#contact";
  let ctaText = "";
  let ctaJump = true;

  const asideBtn = s.match(
    /<a class="btn btn-primary[^"]*" href="([^"]*)"([^>]*)>([\s\S]*?)<\/a>/i
  );
  // Prefer CTA inside tm-aside or ax-cta
  const asideBlock = s.match(
    /<div class="tm-aside">([\s\S]*?)<\/div>\s*(?=<div class="tm-rail"|<div class="tm-cta"|$)/i
  );
  const axCta = s.match(
    /<div class="ax-cta[^"]*"[^>]*>\s*<a class="btn btn-primary[^"]*" href="([^"]*)"([^>]*)>([\s\S]*?)<\/a>\s*<\/div>/i
  );
  const tmCtaExisting = s.match(
    /<div class="tm-cta[^"]*"[^>]*>\s*<a class="btn btn-primary[^"]*" href="([^"]*)"([^>]*)>([\s\S]*?)<\/a>\s*<\/div>/i
  );

  if (asideBlock) {
    const btn = asideBlock[1].match(
      /<a class="btn btn-primary[^"]*" href="([^"]*)"([^>]*)>([\s\S]*?)<\/a>/i
    );
    if (btn) {
      ctaHref = btn[1];
      ctaJump = /\bdata-jump\b/.test(btn[2]);
      ctaText = btn[3]
        .replace(/<span class="arw">[\s\S]*?<\/span>/gi, "")
        .replace(/<span class="btn-label">([\s\S]*?)<\/span>/gi, "$1")
        .replace(/&uarr;|↑/g, "")
        .replace(/\s+/g, " ")
        .trim();
    }
    // Convert aside paragraphs to ax-lede; drop the button
    const paras = [...asideBlock[1].matchAll(/<p>([\s\S]*?)<\/p>/gi)].map(
      (m) => m[1]
    );
    const ledeHtml = paras
      .map((p) => `<p class="ax-lede">${p}</p>`)
      .join("\n      ");
    s = s.replace(asideBlock[0], ledeHtml ? ledeHtml + "\n    " : "");
  } else if (axCta) {
    ctaHref = axCta[1];
    ctaJump = /\bdata-jump\b/.test(axCta[2]);
    ctaText = axCta[3]
      .replace(/<span class="arw">[\s\S]*?<\/span>/gi, "")
      .replace(/<span class="btn-label">([\s\S]*?)<\/span>/gi, "$1")
      .replace(/&uarr;|↑/g, "")
      .replace(/\s+/g, " ")
      .trim();
    s = s.replace(axCta[0], "");
  } else if (tmCtaExisting) {
    ctaHref = tmCtaExisting[1];
    ctaJump = /\bdata-jump\b/.test(tmCtaExisting[2]);
    ctaText = tmCtaExisting[3]
      .replace(/<span class="arw">[\s\S]*?<\/span>/gi, "")
      .replace(/<span class="btn-label">([\s\S]*?)<\/span>/gi, "$1")
      .replace(/&uarr;|↑/g, "")
      .replace(/\s+/g, " ")
      .trim();
    s = s.replace(tmCtaExisting[0], "");
  }

  // Ensure existing bare <p class="ax-lede"> stays; wrap bare intro if only one p without class after h2
  // (AI SEO already has ax-lede)

  // Build CTA markup if we have a label
  if (ctaText) {
    const jumpAttr = ctaJump ? " data-jump" : "";
    const ctaHtml = `\n    <div class="tm-cta rv"><a class="btn btn-primary" href="${ctaHref}"${jumpAttr}><span class="btn-label">${ctaText}</span><span class="arw">&uarr;</span></a></div>`;
    // Insert before closing </div></section> of wrap — after tm-rail
    if (/<\/div>\s*<\/div>\s*<\/section>\s*$/i.test(s.trimEnd())) {
      // find last </div> of wrap
      s = s.replace(
        /(\s*)<\/div>\s*<\/section>\s*$/i,
        `${ctaHtml}$1</div>\n</section>\n`
      );
    } else {
      s = s.replace(/<\/section>\s*$/i, `${ctaHtml}\n</section>\n`);
    }
  }

  // Clean empty leftover tm-aside
  s = s.replace(/<div class="tm-aside">\s*<\/div>/gi, "");

  // Normalize head: if there's a bare <p> after h2 block that isn't ax-lede, convert
  s = s.replace(
    /(<div class="tm-head[^"]*"[^>]*>\s*<div>\s*<h2>[\s\S]*?<\/h2>\s*<\/div>\s*)<p>([\s\S]*?)<\/p>/i,
    '$1<p class="ax-lede">$2</p>'
  );

  return s;
}

function applyCss(cssPath, id) {
  let css = fs.readFileSync(path.join(ROOT, cssPath), "utf8");
  const marker = `/* === tm layout lock (match Technical SEO model) — scoped to .tm / #${id} === */`;
  // Remove any previous lock block for this id
  css = css.replace(
    new RegExp(
      `\\n?/\\* === tm layout lock \\(match Technical SEO model\\) — scoped to \\.tm / #${id} === \\*/[\\s\\S]*?(?=\\n/\\* ===|\\n$)`,
      "g"
    ),
    "\n"
  );
  // Also remove older technical-seo inline refinements if duplicated for #model only when appending shared lock
  if (!css.includes(marker)) {
    css = css.replace(/\s*$/, "\n" + refineCss(id) + "\n");
  } else {
    css = css.replace(/\s*$/, "\n" + refineCss(id) + "\n");
  }
  fs.writeFileSync(path.join(ROOT, cssPath), css);
}

let report = [];
for (const page of PAGES) {
  const bodyPath = path.join(ROOT, page.body);
  let html = fs.readFileSync(bodyPath, "utf8");
  const { full, index } = extractSection(html);
  const next = transformSection(full, page.id);
  html = html.slice(0, index) + next + html.slice(index + full.length);
  fs.writeFileSync(bodyPath, html);

  applyCss(page.css, page.id);

  const chips = (next.match(/tm-chip/g) || []).length;
  const smarkInHead = /tm-head[\s\S]{0,200}smark/.test(next);
  const hasCta = /class="tm-cta/.test(next);
  const hasLede = /class="ax-lede/.test(next);
  report.push({
    page: page.body,
    id: page.id,
    chipsLeft: chips,
    smarkInHead,
    hasCta,
    hasLede,
    lenDelta: next.length - full.length,
  });
}

console.log(JSON.stringify(report, null, 2));
