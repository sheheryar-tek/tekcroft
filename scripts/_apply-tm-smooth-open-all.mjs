/**
 * Apply ai-agent smooth panel open (1.3s + hover-intent) to every service page.
 * - Updates app/tm-shell-lock.css (shared)
 * - Replaces faster per-page transition copies
 * - Patches [data-tm] mouseenter → hover-intent in public tekcroft-*.js
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const NEW_TRANS =
  "transition:flex-basis 1.3s cubic-bezier(.45,.05,.2,1), border-color .8s ease, box-shadow 1s ease";
const OLD_TRANS =
  "transition:flex-basis .8s cubic-bezier(.65,0,.35,1), border-color .5s ease, box-shadow .6s ease";

const sharedBlock = `/* Smooth panel open — shared for every [data-tm] rail.
   Timing/easing match ai-agent-development-services.
   Flex-basis sizing stays desktop-only; mobile layouts unchanged. */
@media (min-width:981px){
  .tm-rail,
  [data-tm].tm-rail,
  .tm-rail[data-tm],
  html[data-design="raw"] .tm-rail,
  html[data-design="raw"] [data-tm].tm-rail,
  html[data-design="raw"] .tm-rail[data-tm]{
    --tm-slim:64px; --tm-gap:7px; container-type:inline-size;
  }
  .tm-item, .tm-item:not(.on), .tm-item.on,
  [data-tm] .tm-item, [data-tm] .tm-item:not(.on), [data-tm] .tm-item.on,
  html[data-design="raw"] .tm-item,
  html[data-design="raw"] .tm-item:not(.on),
  html[data-design="raw"] .tm-item.on,
  html[data-design="raw"] [data-tm] .tm-item,
  html[data-design="raw"] [data-tm] .tm-item:not(.on),
  html[data-design="raw"] [data-tm] .tm-item.on{
    flex-grow:0 !important; flex-shrink:0 !important; min-width:0 !important;
    ${NEW_TRANS} !important;
    will-change:flex-basis;
  }
  .tm-item:not(.on),
  [data-tm] .tm-item:not(.on),
  html[data-design="raw"] .tm-item:not(.on),
  html[data-design="raw"] [data-tm] .tm-item:not(.on){
    flex-basis:var(--tm-slim) !important;
  }
  .tm-item.on,
  [data-tm] .tm-item.on,
  html[data-design="raw"] .tm-item.on,
  html[data-design="raw"] [data-tm] .tm-item.on{
    flex-basis:calc(100% - (var(--tm-n) - 1) * (var(--tm-slim) + var(--tm-gap))) !important;
  }
  .tm-open,
  [data-tm] .tm-open,
  html[data-design="raw"] .tm-open,
  html[data-design="raw"] [data-tm] .tm-open{
    right:auto !important; max-width:none !important;
    width:calc(100cqw - (var(--tm-n) - 1) * (var(--tm-slim) + var(--tm-gap))) !important;
  }
}

/* panel width opens slowly with an ease-in-out */
[data-tm] .tm-item,
[data-tm] .tm-item:not(.on),
[data-tm] .tm-item.on{
  ${NEW_TRANS} !important;
  will-change:flex-basis;
}

/* background photo: fade + gentle zoom-out */
[data-tm] .tm-bg{
  transition:opacity 1.1s ease, transform 1.8s cubic-bezier(.45,.05,.2,1) !important;
  transform:scale(1.06) !important;
}
[data-tm] .tm-item.on .tm-bg{transform:scale(1) !important;}

/* vertical title strip */
[data-tm] .tm-slim{transition:opacity .45s ease .15s !important;}
[data-tm] .tm-item.on .tm-slim{transition:opacity .25s ease !important;}

/* content (text card + visual): leaves fast, arrives after the panel has opened */
[data-tm] .tm-open{
  transform:translateY(10px) !important;
  transition:opacity .3s ease, transform .4s ease !important;
}
[data-tm] .tm-item.on .tm-open{
  transform:none !important;
  transition:opacity .8s ease .75s, transform 1s cubic-bezier(.22,1,.36,1) .75s !important;
}

/* visual window settles in last */
[data-tm] .tm-item.on .tm-viz > *{
  animation:tmWinIn 1s cubic-bezier(.22,1,.36,1) .9s both !important;
}
@keyframes tmWinIn{from{opacity:0; transform:translateY(12px) scale(.98)} to{opacity:1; transform:none}}

@media (prefers-reduced-motion:reduce){
  [data-tm] .tm-item,[data-tm] .tm-bg,[data-tm] .tm-open{transition:none !important;}
  [data-tm] .tm-item.on .tm-viz > *{animation:none !important;}
}
`;

/* --- 1) tm-shell-lock.css --- */
const lockPath = path.join(ROOT, "app/tm-shell-lock.css");
let lock = fs.readFileSync(lockPath, "utf8");
const headEnd = lock.indexOf("/* Smooth panel open");
if (headEnd === -1) {
  lock = lock.replace(/\s*$/, "\n\n" + sharedBlock);
} else {
  lock = lock.slice(0, headEnd) + sharedBlock;
}
fs.writeFileSync(lockPath, lock);
console.log("updated tm-shell-lock.css");

/* --- 2) Replace faster transition copies in page CSS --- */
const cssFiles = [
  "app/ai-agent-services-tm.css",
  "app/ai-chatbot-services-tm.css",
  "app/franchise-covers-lock.css",
  "app/seo-services.css",
  "app/ai-seo.css",
  "app/ai-development.css",
  "app/artificial-intelligence-services.css",
  "app/artificial-intelligence-services-unlock.css",
  "app/technical-seo.css",
  "app/local-seo.css",
  "app/google-business-profile-optimization.css",
  "app/mobile-app-development.css",
  "app/franchise-seo.css",
  "app/web-design-and-development.css",
];

const cssReplacements = [
  [OLD_TRANS, NEW_TRANS],
  [
    "transition:opacity .7s ease .1s",
    "transition:opacity 1.1s ease, transform 1.8s cubic-bezier(.45,.05,.2,1)",
  ],
  [
    "transition:opacity .35s ease, transform .5s cubic-bezier(.2,.8,.2,1)",
    "transition:opacity .3s ease, transform .4s ease",
  ],
  [
    "transition:opacity .55s ease .5s, transform .7s cubic-bezier(.2,.8,.2,1) .5s",
    "transition:opacity .8s ease .75s, transform 1s cubic-bezier(.22,1,.36,1) .75s",
  ],
  ["transform:translateY(14px)", "transform:translateY(10px)"],
  /* base flex shorthand on .tm-item — remove so flex-basis timing owns the open */
  [
    "transition:flex .6s var(--ease), border-color .4s var(--ease), box-shadow .4s var(--ease)",
    NEW_TRANS,
  ],
];

for (const rel of cssFiles) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) {
    console.warn("missing", rel);
    continue;
  }
  let css = fs.readFileSync(p, "utf8");
  const before = css;
  for (const [a, b] of cssReplacements) {
    css = css.split(a).join(b);
  }
  /* Drop agent duplicate smooth block — shared lock owns timing/viz */
  if (rel.endsWith("ai-agent-services-tm.css")) {
    css = css.replace(
      /\/\* ===== smooth panel open \(ease-out, no jerk\) ===== \*\/[\s\S]*$/,
      ""
    );
  }
  if (css !== before) {
    fs.writeFileSync(p, css);
    console.log("css", rel);
  } else {
    console.log("css unchanged", rel);
  }
}

/* --- 3) Hover-intent in public JS (canonical sources; rehash after) --- */
const INTENT =
  "el.addEventListener('mouseenter',function(){ clearTimeout(rail._hi); rail._hi=setTimeout(function(){ if(at!==i) show(i); },220); }); el.addEventListener('mouseleave',function(){ clearTimeout(rail._hi); });";
const INSTANT =
  "el.addEventListener('mouseenter',function(){ show(i); });";

const jsTargets = [
  "tekcroft-ai-agent-development.js",
  "tekcroft-ai-chatbot-development.js",
  "tekcroft-ai-seo.js",
  "tekcroft-ai-development.js",
  "tekcroft-artificial-intelligence-services.js",
  "tekcroft-web-design-and-development.js",
  "tekcroft-technical-seo.js",
  "tekcroft-local-seo.js",
  "tekcroft-google-business-profile-optimization.js",
  "tekcroft-mobile-app-development.js",
  "tekcroft-franchise-seo.js",
  "tekcroft-seo-services.js",
];

for (const name of jsTargets) {
  const p = path.join(ROOT, "public", name);
  if (!fs.existsSync(p)) {
    console.warn("missing js", name);
    continue;
  }
  let js = fs.readFileSync(p, "utf8");
  if (!js.includes("[data-tm]") && !js.includes('[data-tm]')) {
    console.log("skip (no data-tm)", name);
    continue;
  }
  if (js.includes("rail._hi")) {
    console.log("js already intent", name);
    continue;
  }
  /* Only replace mouseenter show(i) that sits next to hold()/click in tm blocks */
  const needle =
    "el.addEventListener('mouseenter',function(){ show(i); });\n    el.addEventListener('click',function(){ hold(); show(i); });";
  const repl =
    INTENT +
    "\n    el.addEventListener('click',function(){ hold(); show(i); });";
  let next = js.split(needle).join(repl);
  /* single-line / minified-ish variants */
  if (next === js) {
    next = js.split(INSTANT + "\n    el.addEventListener('click'").join(
      INTENT + "\n    el.addEventListener('click'"
    );
  }
  if (next === js) {
    /* compact: mouseenter then click on same forEach without exact whitespace */
    next = js.replace(
      /el\.addEventListener\('mouseenter',function\(\)\{\s*show\(i\);\s*\}\);(\s*)el\.addEventListener\('click',function\(\)\{\s*hold\(\);\s*show\(i\);\s*\}\);/g,
      INTENT + "$1el.addEventListener('click',function(){ hold(); show(i); });"
    );
  }
  if (next === js) {
    console.warn("NO mouseenter patch", name);
  } else {
    fs.writeFileSync(p, next);
    console.log("js", name);
  }
}

console.log("done — run: node scripts/hash-assets.mjs");
