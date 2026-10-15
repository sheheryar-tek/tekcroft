/**
 * Apply shared .tm panel smooth-open: --tm-n on rails + neutralize blocking flex.
 */
import fs from 'fs';
import path from 'path';

const root = process.cwd();

const bodies = [
  { file: 'lib/artificial-intelligence-services-body.html', n: 3, slim: null }, // default 64
  { file: 'lib/google-business-profile-optimization-body.html', n: 9, slim: '46px' },
  { file: 'lib/technical-seo-body.html', n: 11, slim: '46px' },
  { file: 'lib/local-seo-body.html', n: 6, slim: '46px' },
  { file: 'lib/ai-seo-body.html', n: 9, slim: '46px' },
  { file: 'lib/mobile-app-development-body.html', n: 5, slim: '46px' },
  { file: 'lib/franchise-seo-body.html', n: 9, slim: '46px' },
  { file: 'lib/web-design-and-development-body.html', n: 6, slim: '46px' },
];

const openAnimCss = `
/* Smooth panel open (.tm): flex-basis ease + delayed .tm-open fade/slide.
   Desktop only. --tm-n set on each .tm-rail from real item count. */
@media (min-width:981px){
  .tm-rail{ --tm-slim:64px; --tm-gap:7px; container-type:inline-size; }
  .tm-item, .tm-item:not(.on), .tm-item.on{
    flex-grow:0; flex-shrink:0; min-width:0;
    transition:flex-basis .8s cubic-bezier(.65,0,.35,1), border-color .5s ease, box-shadow .6s ease;
  }
  .tm-item:not(.on){ flex-basis:var(--tm-slim); }
  .tm-item.on{ flex-basis:calc(100% - (var(--tm-n) - 1) * (var(--tm-slim) + var(--tm-gap))); }
  .tm-bg{ transition:opacity .7s ease .1s; }
  .tm-slim{ transition:opacity .35s ease; }
  .tm-open{
    right:auto; max-width:none;
    width:calc(100cqw - (var(--tm-n) - 1) * (var(--tm-slim) + var(--tm-gap)));
    transform:translateY(14px);
    transition:opacity .35s ease, transform .5s cubic-bezier(.2,.8,.2,1);
  }
  .tm-item.on .tm-open{
    transition:opacity .55s ease .5s, transform .7s cubic-bezier(.2,.8,.2,1) .5s;
  }
  /* AIS unlock.css uses html[data-design=raw] + !important — mirror so this page still animates */
  html[data-design="raw"] .tm-rail{ --tm-slim:64px; --tm-gap:7px; container-type:inline-size !important; }
  html[data-design="raw"] .tm-item,
  html[data-design="raw"] .tm-item:not(.on),
  html[data-design="raw"] .tm-item.on{
    flex-grow:0 !important; flex-shrink:0 !important; min-width:0 !important;
    transition:flex-basis .8s cubic-bezier(.65,0,.35,1), border-color .5s ease, box-shadow .6s ease !important;
  }
  html[data-design="raw"] .tm-item:not(.on){ flex-basis:var(--tm-slim) !important; }
  html[data-design="raw"] .tm-item.on{ flex-basis:calc(100% - (var(--tm-n) - 1) * (var(--tm-slim) + var(--tm-gap))) !important; }
  html[data-design="raw"] .tm-bg{ transition:opacity .7s ease .1s !important; }
  html[data-design="raw"] .tm-slim{ transition:opacity .35s ease !important; }
  html[data-design="raw"] .tm-open{
    right:auto !important; max-width:none !important;
    width:calc(100cqw - (var(--tm-n) - 1) * (var(--tm-slim) + var(--tm-gap))) !important;
    transform:translateY(14px) !important;
    transition:opacity .35s ease, transform .5s cubic-bezier(.2,.8,.2,1) !important;
  }
  html[data-design="raw"] .tm-item.on .tm-open{
    transform:none !important;
    transition:opacity .55s ease .5s, transform .7s cubic-bezier(.2,.8,.2,1) .5s !important;
  }
}
`.trimStart();

// --- 1) Append open-anim to tm-shell-lock.css ---
const lockPath = path.join(root, 'app/tm-shell-lock.css');
let lock = fs.readFileSync(lockPath, 'utf8');
if (!lock.includes('--tm-slim')) {
  lock = lock.replace(/\s*$/, '\n\n' + openAnimCss);
  fs.writeFileSync(lockPath, lock);
  console.log('updated tm-shell-lock.css');
} else {
  console.log('tm-shell-lock.css already has open-anim');
}

// --- 2) Set --tm-n (and optional --tm-slim) on each .tm-rail ---
for (const { file, n, slim } of bodies) {
  const p = path.join(root, file);
  let h = fs.readFileSync(p, 'utf8');
  const styleParts = [`--tm-n:${n}`];
  if (slim) styleParts.push(`--tm-slim:${slim}`);
  const style = styleParts.join(';');

  const next = h.replace(
    /<div class="tm-rail"([^>]*?)>/,
    (full, attrs) => {
      // strip existing style --tm-n / --tm-slim if re-run
      let a = attrs.replace(/\s*style="[^"]*"/, '');
      return `<div class="tm-rail"${a} style="${style}">`;
    }
  );
  if (next === h) {
    console.warn('NO rail match', file);
  } else {
    fs.writeFileSync(p, next);
    console.log('rail', file, style);
  }
}

// --- 3) Neutralize blocking desktop flex / min-width on .tm-item ---
const cssFiles = [
  'app/artificial-intelligence-services.css',
  'app/artificial-intelligence-services-unlock.css',
  'app/google-business-profile-optimization.css',
  'app/technical-seo.css',
  'app/local-seo.css',
  'app/ai-seo.css',
  'app/mobile-app-development.css',
  'app/franchise-seo.css',
  'app/web-design-and-development.css',
];

function neutralizeTmFlex(css, isUnlock) {
  let out = css;

  if (isUnlock) {
    // Unlock uses !important on every declaration
    out = out.replace(
      /html\[data-design="raw"\] \.tm-item\{position:relative !important; flex:0 0 46px !important; min-width:46px !important;/,
      'html[data-design="raw"] .tm-item{position:relative !important; flex-grow:0 !important; flex-shrink:0 !important; min-width:0 !important;'
    );
    out = out.replace(
      /html\[data-design="raw"\] \.tm-item\.on\{flex:1 1 auto !important; min-width:300px !important;/,
      'html[data-design="raw"] .tm-item.on{min-width:0 !important;'
    );
    out = out.replace(
      /(html\[data-design="raw"\] #(?:model|services-2|gbp-process|franchise-covers) \.tm-item\.on\{)min-width:340px !important;?/g,
      '$1/* min-width cleared for flex-basis open */'
    );
    out = out.replace(
      /html\[data-design="raw"\] #model \.tm-item:not\(\.on\)\{flex:0 0 64px !important; min-width:64px !important;\}/g,
      'html[data-design="raw"] #model .tm-item:not(.on){/* slim width via --tm-slim / global open-anim */}'
    );
    out = out.replace(
      /\/\* smooth open: each panel animates a real width[\s\S]*?html\[data-design="raw"\] #model \.tm-open\{right:auto !important; width:calc\(100cqw - 2 \* 64px - 2 \* 7px\) !important; max-width:none !important;\}\s*\}\s*/g,
      '/* smooth open: moved to app/tm-shell-lock.css */\n'
    );
  } else {
    out = out.replace(
      /\.tm-item\{position:relative; flex:0 0 46px; min-width:46px;/g,
      '.tm-item{position:relative; flex-grow:0; flex-shrink:0; min-width:0;'
    );
    out = out.replace(
      /\.tm-item\.on\{flex:1 1 auto; min-width:300px;/g,
      '.tm-item.on{min-width:0;'
    );
    out = out.replace(
      /(#(?:model|services-2|gbp-process|franchise-covers) \.tm-item\.on\{)min-width:340px;?/g,
      '$1/* min-width cleared for flex-basis open */'
    );
    out = out.replace(
      /#model \.tm-item:not\(\.on\)\{flex:0 0 64px; min-width:64px;\}/g,
      '#model .tm-item:not(.on){/* slim width via --tm-slim / global open-anim */}'
    );
    out = out.replace(
      /\/\* smooth open: each panel animates a real width[\s\S]*?#model \.tm-open\{right:auto; width:calc\(100cqw - 2 \* 64px - 2 \* 7px\); max-width:none;\}\s*\}\s*/g,
      '/* smooth open: moved to app/tm-shell-lock.css */\n'
    );
  }

  return out;
}

for (const f of cssFiles) {
  const p = path.join(root, f);
  const before = fs.readFileSync(p, 'utf8');
  const after = neutralizeTmFlex(before, f.includes('unlock'));
  if (after === before) {
    console.warn('no css changes?', f);
  } else {
    fs.writeFileSync(p, after);
    console.log('css', f);
  }
}

console.log('done');
