import fs from "fs";
import path from "path";

const ROOT = "c:\\Tekcroft";
const EXT = path.join(ROOT, "scripts/_spl-extract");

function stripStyleTag(block) {
  return block
    .replace(/^<style[^>]*>\s*/i, "")
    .replace(/\s*<\/style>\s*$/i, "");
}

function stripScriptTag(block) {
  return block
    .replace(/^<script[^>]*>\s*/i, "")
    .replace(/\s*<\/script>\s*$/i, "");
}

let sec = fs.readFileSync(path.join(EXT, "sec.html"), "utf8");
sec = sec.replace(
  '<section class="sec spl" id="search-split" aria-labelledby="splTitle">',
  '<section class="sec spl" id="search-split" data-ai-variant="2" aria-labelledby="splTitle">'
);

const styleIds = ["spl-styles", "spl-viz2", "spl-real", "spl-fill", "spl-pins"];
let css = styleIds
  .map((id) => {
    let block = stripStyleTag(
      fs.readFileSync(path.join(EXT, id + ".css"), "utf8")
    );
    if (id === "spl-styles") {
      // Same slot as #ai-ecosystem — keep page alternation, drop flip rules
      block = block
        .replace(
          /#search-split\{([^}]*)background:var\(--surface\);/,
          "#search-split{$1background:var(--bg-alt);"
        )
        .replace(
          /\n\/\* the band after this one flips[\s\S]*?#faq,\.faq\{background:var\(--surface\);\}\s*/,
          "\n"
        );
    }
    return (
      `/* ── ${id} ───────────────────────────────────────────────── */\n` + block
    );
  })
  .join("\n\n");

const script = stripScriptTag(
  fs.readFileSync(path.join(EXT, "spl-script.js"), "utf8")
);

// ── body ──────────────────────────────────────────────────────────────
let body = fs.readFileSync(path.join(ROOT, "lib/homepage-body.html"), "utf8");

if (!body.includes('data-ai-variant="1"')) {
  body = body.replace(
    '<section class="sec ax" id="ai-ecosystem" aria-labelledby="axTitle">',
    '<section class="sec ax" id="ai-ecosystem" data-ai-variant="1" aria-labelledby="axTitle">'
  );
}

if (!body.includes('id="search-split"')) {
  const open = body.indexOf('id="ai-ecosystem"');
  if (open < 0) throw new Error("ai-ecosystem not found");
  // match closing </section> for ai-ecosystem (no nested sections)
  const close = body.indexOf("</section>", open);
  if (close < 0) throw new Error("ai-ecosystem close not found");
  const insertAt = close + "</section>".length;
  body =
    body.slice(0, insertAt) +
    "\n\n" +
    sec.trim() +
    "\n" +
    body.slice(insertAt);
}

// Tag existing why switch + add AI switch (stacked so both stay usable)
if (body.includes('aria-label="Why choose us section design"') && !body.includes('data-vsw="why"')) {
  body = body.replace(
    '<div class="vsw" role="group" aria-label="Why choose us section design">',
    '<div class="vsw" data-vsw="why" role="group" aria-label="Why choose us section design">'
  );
}

if (!body.includes('data-vsw="ai"')) {
  const aiSwitch = `
<!-- review aid: switch between the two AI-search section designs -->
<div class="vsw" data-vsw="ai" role="group" aria-label="AI search section design">
  <span class="vsw-lab">AI search</span>
  <button type="button" data-v="1">Variant 1</button>
  <button type="button" data-v="2">Variant 2</button>
</div>
`;
  // place AI switch markup before why switch if present, else append
  if (body.includes('data-vsw="why"')) {
    body = body.replace(
      '<!-- review aid: switch between the two "why choose us" designs -->',
      aiSwitch + '\n<!-- review aid: switch between the two "why choose us" designs -->'
    );
  } else {
    body += "\n" + aiSwitch + "\n";
  }
}

fs.writeFileSync(path.join(ROOT, "lib/homepage-body.html"), body);

// ── CSS ───────────────────────────────────────────────────────────────
const cssPath = path.join(ROOT, "app/tekcroft.css");
let siteCss = fs.readFileSync(cssPath, "utf8");

if (!siteCss.includes("SEARCH SPLIT V2 — homepage AI variant")) {
  siteCss +=
    `\n\n/* ══════════════════════════════════════════════════════════════════════\n` +
    `   SEARCH SPLIT V2 — homepage AI variant (#search-split)\n` +
    `   ══════════════════════════════════════════════════════════════════════ */\n` +
    css +
    "\n";
}

// Ensure hidden rule covers AI variants; stack the two review pills
if (!siteCss.includes("[data-ai-variant][hidden]")) {
  siteCss = siteCss.replace(
    "[data-why-variant][hidden]{display:none !important;}",
    "[data-why-variant][hidden],[data-ai-variant][hidden]{display:none !important;}"
  );
}
if (!siteCss.includes(".vsw[data-vsw=\"ai\"]")) {
  siteCss += `
/* stacked review-aid switches: AI above Why */
.vsw[data-vsw="ai"]{bottom:70px;}
`;
}

fs.writeFileSync(cssPath, siteCss);

// ── JS ────────────────────────────────────────────────────────────────
const jsPath = path.join(ROOT, "public/tekcroft-main.js");
let mainJs = fs.readFileSync(jsPath, "utf8");

// Scope existing why switch so it doesn't fight the AI switch
if (mainJs.includes("why variant switch") && !mainJs.includes('data-vsw="why"')) {
  mainJs = mainJs.replace(
    "var btns=[].slice.call(document.querySelectorAll('.vsw button'));",
    "var btns=[].slice.call(document.querySelectorAll('.vsw[data-vsw=\"why\"] button'));"
  );
}

if (!mainJs.includes("spl-script") && !mainJs.includes("#search-split [data-split]")) {
  mainJs +=
    "\n/* === spl-script (search-split) === */\n" + script + "\n";
}

if (!mainJs.includes("tk-ai-variant")) {
  mainJs += `
/* === ai variant switch === */
(function(){
  var secs={1:document.getElementById('ai-ecosystem'), 2:document.getElementById('search-split')};
  var btns=[].slice.call(document.querySelectorAll('.vsw[data-vsw="ai"] button'));
  function pick(v){
    Object.keys(secs).forEach(function(k){ if(secs[k]) secs[k].hidden = (+k !== +v); });
    btns.forEach(function(b){ var on = +b.dataset.v === +v;
      b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
    try{ localStorage.setItem('tk-ai-variant', v); }catch(e){}
  }
  var saved=1; try{ saved = +localStorage.getItem('tk-ai-variant') || 1; }catch(e){}
  btns.forEach(function(b){ b.addEventListener('click', function(){ pick(b.dataset.v); }); });
  pick(saved);
})();
`;
}

fs.writeFileSync(jsPath, mainJs);

console.log("OK");
console.log("ai v1:", body.includes('data-ai-variant="1"'));
console.log("search-split:", body.includes('id="search-split"') && body.includes('data-ai-variant="2"'));
console.log("ai switch:", body.includes('data-vsw="ai"'));
console.log("why switch scoped:", body.includes('data-vsw="why"'));
console.log("css marker:", siteCss.includes("SEARCH SPLIT V2"));
console.log("no flip reviews:", !/#reviews\{background:var\(--bg-alt\)\}/.test(css));
console.log("spl bg-alt:", /#search-split\{[^}]*background:var\(--bg-alt\)/.test(css));
console.log("js spl:", mainJs.includes("#search-split [data-split]"));
console.log("js ai switch:", mainJs.includes("tk-ai-variant"));
console.log("js why scoped:", mainJs.includes('data-vsw="why"'));
