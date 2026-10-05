import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const bodyPath = path.join(ROOT, "lib", "ai-development-body.html");
const cssPath = path.join(ROOT, "app", "ai-development.css");

const yes =
  '<span class="vs-m is-yes"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8.8"/><path d="m8.6 12.2 2.4 2.4 4.4-4.8"/></svg></span>';

const table = `    <div class="vs-hold rv" style="--d:80ms">
      <div class="vs-scroll">
        <div class="vs-stage">

          <table class="vs-table">
            <colgroup>
              <col class="c1" style="width:22%">
              <col class="c-us" style="width:42%">
              <col class="c-why" style="width:36%">
            </colgroup>

            <thead>
              <tr>
                <th scope="col"><span class="vs-h vs-h-blank">Approach</span></th>
                <th scope="col" class="c-us"><span class="vs-h is-us"><span class="vs-hic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2.9 4.8 6v6.1c0 4.3 3 8.3 7.2 9.2 4.2-.9 7.2-4.9 7.2-9.2V6Z"/><path d="m8.9 12.1 2.2 2.2 4-4.4"/></svg></span>Best Fit</span></th>
                <th scope="col"><span class="vs-h"><span class="vs-hic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.4" y="7" width="17.2" height="13.4" rx="2.2"/><path d="M8.6 7V5a2 2 0 0 1 2-2h2.8a2 2 0 0 1 2 2v2M3.4 12.4h17.2"/></svg></span>Why</span></th>
              </tr>
            </thead>

            <tbody>
            <tr>
              <th scope="row"><span class="vs-k">Custom AI development</span></th>
              <td class="c-us" data-label="Best fit"><span class="vs-v">${yes}Core, proprietary use cases built on your own data and workflows</span></td>
              <td data-label="Why"><span class="vs-v">${yes}Off-the-shelf tools can&rsquo;t replicate logic unique to how your business runs</span></td>
            </tr>
            <tr>
              <th scope="row"><span class="vs-k">Fine Tuning</span></th>
              <td class="c-us" data-label="Best fit"><span class="vs-v">${yes}A general model performs well but needs consistent, domain-specific output</span></td>
              <td data-label="Why"><span class="vs-v">${yes}It aligns an existing model to your data without a full custom build</span></td>
            </tr>
            <tr>
              <th scope="row"><span class="vs-k">Off-the-shelf APIs</span></th>
              <td class="c-us" data-label="Best fit"><span class="vs-v">${yes}Speed matters more than deep customization</span></td>
              <td data-label="Why"><span class="vs-v">${yes}A general model already solves the core problem without added cost</span></td>
            </tr>
            </tbody>
          </table>

          <span class="vs-halo" aria-hidden="true">
            <span class="vs-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 3.4 2.4 5.2 5.6.7-4.2 3.9 1.1 5.6-4.9-2.8-4.9 2.8 1.1-5.6L4 9.3l5.6-.7Z"/></svg> Best fit</span>
          </span>

        </div>
      </div>
    </div>`;

let html = fs.readFileSync(bodyPath, "utf8");
const re =
  /(<section class="sec vs" id="cmp"[^>]*>[\s\S]*?<div class="sec-head mid rv">[\s\S]*?<\/div>\s*)([\s\S]*?)(\s*<\/div>\s*<\/section>\s*\n\s*<section class="sec sy" id="guide")/;
if (!re.test(html)) {
  console.error("cmp block not found");
  process.exit(1);
}
html = html.replace(re, `$1\n${table}\n$3`);
fs.writeFileSync(bodyPath, html);
console.log("HTML table updated");

const cssLock = `

/* === #cmp white-card comparison (web-design fit table design) === */
#cmp.vs::before,
#cmp.vs::after{display:none !important; content:none !important;}
#cmp{
  --vs-c1:20%;
  --vs-col:46%;
  --vs-ai:hsl(var(--brand-h) 80% 96%);
}
#cmp .sec-head h2,
#cmp .sec-head h2 span{color:var(--text) !important;}
#cmp .sec-head h2 em{color:var(--primary) !important;}
#cmp .sec-head .sec-lede{color:var(--text-2) !important;}
#cmp .smark{background:var(--surface) !important; border-color:var(--border) !important;}
#cmp .smark b{color:var(--brand-text) !important;}
#cmp .vs-hold{position:relative; margin-top:clamp(32px,3.6vw,52px);}
#cmp .vs-scroll{overflow-x:auto; overscroll-behavior-x:contain;
  scrollbar-width:none; padding:22px 0 14px; margin:-22px 0 -14px;}
#cmp .vs-scroll::-webkit-scrollbar{display:none;}
#cmp .vs-stage{position:relative; min-width:760px;}
#cmp .vs-table{width:100%; border-collapse:collapse; table-layout:fixed;
  background:var(--surface) !important; border:1px solid var(--border);
  border-radius:var(--r-lg); overflow:visible;
  box-shadow:0 30px 64px -40px rgba(15,30,50,.28);}
#cmp .vs-table col.c1{width:var(--vs-c1);}
#cmp .vs-table col.cx{width:var(--vs-col);}
#cmp .vs-table col.cx + col.cx{width:34%;}
#cmp .vs-table th,
#cmp .vs-table td{padding:clamp(12px,1.2vw,16px) clamp(12px,1.4vw,20px);
  text-align:left; vertical-align:middle;
  border-bottom:1px solid var(--border-soft);
  background:transparent; color:var(--text);}
#cmp .vs-table tbody tr:last-child th,
#cmp .vs-table tbody tr:last-child td{border-bottom:0;}
#cmp .vs-table thead th{padding-top:clamp(16px,1.6vw,22px);
  padding-bottom:clamp(14px,1.5vw,18px);
  border-bottom:1px solid var(--border);}
#cmp .vs-h{display:flex; align-items:center; gap:clamp(9px,1vw,13px);
  font-family:var(--font-display); font-weight:700;
  font-size:clamp(14px,1.05vw,16px); letter-spacing:-0.02em; color:var(--text);}
#cmp .vs-h-blank{color:var(--muted); font-size:12px; letter-spacing:.12em; text-transform:uppercase;}
#cmp .vs-hic{display:grid; place-items:center; flex-shrink:0;
  width:clamp(32px,3.2vw,38px); aspect-ratio:1; border-radius:11px;
  background:var(--disc); color:var(--primary);}
#cmp .vs-hic svg{width:52%; height:52%;}
#cmp .vs-h.is-us .vs-hic{background:var(--primary); color:#fff;}
#cmp .vs-h:not(.is-us) .vs-hic{background:var(--disc); color:var(--primary);}
html[data-theme="dark"] #cmp .vs-h:not(.is-us) .vs-hic{background:hsl(var(--brand-h) 40% 18%);}
#cmp .vs-k{font-family:var(--font-display); font-weight:700;
  font-size:clamp(14px,1.05vw,16px); letter-spacing:-.02em; color:var(--text);}
#cmp .vs-v{display:flex; align-items:flex-start; gap:10px;
  font-size:clamp(13px,.95vw,14.5px); color:var(--text-2); line-height:1.45;}
#cmp .vs-m{display:grid; place-items:center; flex-shrink:0; width:21px; height:21px; margin-top:1px;}
#cmp .vs-m svg{width:100%; height:100%;}
#cmp .is-yes{color:var(--ui-open);}
#cmp .is-no{color:var(--ui-bad);}
#cmp .is-part{color:var(--ui-star);}
#cmp .c-us .vs-m{width:26px; height:26px; border-radius:50%;
  background:color-mix(in srgb, var(--ui-open) 18%, var(--surface)); margin-top:0;}
#cmp .c-us .vs-m.is-part{background:color-mix(in srgb, var(--ui-star) 22%, var(--surface));}
#cmp .c-us .vs-m svg{width:62%; height:62%;}
#cmp .c-us .vs-v{color:var(--text); font-weight:600;}
#cmp .vs-halo{display:block !important; position:absolute; z-index:2; pointer-events:none;
  left:var(--vs-c1); width:var(--vs-col); top:0; bottom:0;
  border:1.6px solid var(--primary); border-radius:var(--r-lg);
  background:hsl(var(--brand-h) 100% 50% / .035);
  box-shadow:none;}
#cmp .vs-badge{position:absolute; left:50%; top:0; transform:translate(-50%,-50%);
  display:inline-flex; align-items:center; gap:7px; white-space:nowrap;
  padding:6px 13px; border-radius:var(--r-btn);
  background:var(--primary); color:#fff;
  font-size:10.5px; font-weight:700; letter-spacing:.10em;
  text-transform:uppercase;
  box-shadow:0 10px 22px -10px hsl(var(--brand-h) 100% 30% / .7);}
#cmp .vs-badge svg{width:12px; height:12px;}
@media (min-width:901px){
  #cmp .vs-table tbody th,
  #cmp .vs-table tbody td{transition:background .2s var(--ease);}
  #cmp .vs-table tbody tr:hover > *{background:hsl(var(--brand-h) 100% 50% / .06);}
  #cmp .vs-table tbody tr:hover > .c-us{background:hsl(var(--brand-h) 100% 50% / .10);}
}
@media (max-width:900px){
  #cmp .vs-scroll{overflow:visible; padding:0; margin:0;}
  #cmp .vs-stage{min-width:0;}
  #cmp .vs-halo{display:none !important;}
  #cmp .vs-table{display:block; background:none !important; border:0; border-radius:0; box-shadow:none;}
  #cmp .vs-table colgroup,
  #cmp .vs-table thead{display:none;}
  #cmp .vs-table tbody{display:grid; gap:clamp(12px,1.6vw,16px);}
  #cmp .vs-table tr{display:block;
    background:var(--surface); border:1px solid var(--border);
    border-radius:var(--r-lg); padding:clamp(14px,1.6vw,18px);
    box-shadow:0 16px 36px -28px rgba(15,30,50,.35);}
  #cmp .vs-table tbody th{display:block; padding:0 0 12px; border:0;}
  #cmp .vs-table td{display:flex; align-items:flex-start; gap:10px;
    padding:10px 0; border:0; border-top:1px solid var(--border-soft);}
  #cmp .vs-table td::before{content:attr(data-label);
    flex:0 0 28%; font-size:12px; font-weight:700; color:var(--muted);}
  #cmp .vs-table td.c-us{background:hsl(var(--brand-h) 100% 50% / .06);
    margin:4px -6px; padding:10px 6px; border-radius:12px;}
}

/* === AI Development alternating grounds (white / tint) === */
#proof[data-ground],
#services-2[data-ground],
#process[data-ground],
#cmp[data-ground],
#guide[data-ground],
#guide-v2[data-ground],
#guide-v3[data-ground],
#guide-v4[data-ground],
#reviews[data-ground],
#industries[data-ground],
#security[data-ground],
#work[data-ground],
#faq[data-ground],
#contact[data-ground]{
  background:var(--ground) !important;
  border-block:0 !important;
}
#proof[data-ground="white"],
#services-2[data-ground="white"],
#process[data-ground="white"],
#cmp[data-ground="white"],
#guide[data-ground="white"],
#guide-v2[data-ground="white"],
#guide-v3[data-ground="white"],
#guide-v4[data-ground="white"],
#reviews[data-ground="white"],
#industries[data-ground="white"],
#security[data-ground="white"],
#work[data-ground="white"],
#faq[data-ground="white"],
#contact[data-ground="white"]{
  --ground:var(--surface) !important;
  --panel:var(--bg-alt) !important;
}
#proof[data-ground="tint"],
#services-2[data-ground="tint"],
#process[data-ground="tint"],
#cmp[data-ground="tint"],
#guide[data-ground="tint"],
#guide-v2[data-ground="tint"],
#guide-v3[data-ground="tint"],
#guide-v4[data-ground="tint"],
#reviews[data-ground="tint"],
#industries[data-ground="tint"],
#security[data-ground="tint"],
#work[data-ground="tint"],
#faq[data-ground="tint"],
#contact[data-ground="tint"]{
  --ground:hsl(var(--brand-h) 42% 95%) !important;
  --panel:var(--surface) !important;
}
html[data-theme="dark"] #proof[data-ground="tint"],
html[data-theme="dark"] #services-2[data-ground="tint"],
html[data-theme="dark"] #process[data-ground="tint"],
html[data-theme="dark"] #cmp[data-ground="tint"],
html[data-theme="dark"] #guide[data-ground="tint"],
html[data-theme="dark"] #guide-v2[data-ground="tint"],
html[data-theme="dark"] #guide-v3[data-ground="tint"],
html[data-theme="dark"] #guide-v4[data-ground="tint"],
html[data-theme="dark"] #reviews[data-ground="tint"],
html[data-theme="dark"] #industries[data-ground="tint"],
html[data-theme="dark"] #security[data-ground="tint"],
html[data-theme="dark"] #work[data-ground="tint"],
html[data-theme="dark"] #faq[data-ground="tint"],
html[data-theme="dark"] #contact[data-ground="tint"]{
  --ground:hsl(var(--brand-h) 28% 12%) !important;
}
#guide-v4[data-ground]{background:var(--ground) !important;}
html[data-theme="dark"] #guide-v4[data-ground]{background:var(--ground) !important;}
`;

let css = fs.readFileSync(cssPath, "utf8");
if (css.includes("/* === #cmp white-card comparison")) {
  css = css.replace(
    /\/\* === #cmp white-card comparison[\s\S]*$/,
    cssLock.trim() + "\n"
  );
} else if (css.includes("/* === AI Development alternating grounds")) {
  css = css.replace(
    /\/\* === AI Development alternating grounds[\s\S]*$/,
    cssLock.trim() + "\n"
  );
} else {
  css = css.replace(/\s*$/, "\n" + cssLock);
}
fs.writeFileSync(cssPath, css);
console.log("CSS lock written");
