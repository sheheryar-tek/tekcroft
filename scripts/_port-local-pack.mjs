import fs from "fs";

const bodyPath = "c:/Tekcroft/lib/local-seo-body.html";
const cssPath = "c:/Tekcroft/app/local-seo.css";

const newSection = `<section class="sec lp" id="pack">
  <div class="wrap">
    <div class="lp-grid">

      <div class="lp-say rv">
        <span class="smark"><b>Local pack</b></span>
        <h2>What Determines Your <em>Local Pack Ranking</em></h2>
        <p class="lp-lede">Your position depends on three factors: the relevance of your listing to
          what the user is looking for, your proximity, and your business&rsquo;s reputation. There is
          nothing that can be done about getting you closer to the searcher, no matter how much
          anyone claims otherwise. There are, however, many other factors that can be fixed:</p>

        <ul class="lp-list">
          <li class="lp-item" style="--k:0">
            <span class="lp-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11.5 3.5H6a2.5 2.5 0 0 0-2.5 2.5v5.5L13 20.5l7.5-7.5z"/><circle cx="8.3" cy="8.3" r="1.4"/></svg></span>
            <div><b>Category and content relevance:</b> does your listing actually reflect the type of business you have, and does your content match?</div>
            <span class="lp-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.8 4.2 4.2L19 7.2"/></svg></span>
          </li>
          <li class="lp-item" style="--k:1">
            <span class="lp-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 3.8 2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 17.1 6.8 19.8l1-5.8L3.6 9.9l5.8-.8z"/></svg></span>
            <div><b>Citation and review consistency:</b> are 40+ citation sources telling the same thing about your business?</div>
            <span class="lp-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.8 4.2 4.2L19 7.2"/></svg></span>
          </li>
          <li class="lp-item is-locked" style="--k:2">
            <span class="lp-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/></svg></span>
            <div><b>Distance:</b> the only factor that no one controls</div>
            <span class="lp-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4.5" y="10.5" width="15" height="9.5" rx="2.2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/></svg></span>
          </li>
        </ul>

        <p class="lp-foot">This is the real state of local seo factors that most agencies
          conveniently leave out.</p>
      </div>

      <div class="lp-stage rv" style="--d:120ms" data-lp>
        <div class="lp-pack">
          <span class="lp-pack-h">Local pack</span>
          <div class="lp-map">
            <svg class="lp-mapsvg" viewBox="0 0 420 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <rect class="m-land" x="0" y="0" width="420" height="200"/>
            <path class="m-water" d="M0 150 C60 140, 90 176, 150 182 C210 188, 250 170, 300 178 L420 190 V200 H0 Z"/>
            <rect class="m-park" x="252" y="26" width="96" height="62" rx="8"/>
            <rect class="m-block" x="28" y="24" width="78" height="46" rx="4"/>
            <rect class="m-block" x="126" y="24" width="96" height="46" rx="4"/>
            <rect class="m-block" x="28" y="92" width="78" height="52" rx="4"/>
            <rect class="m-block" x="126" y="92" width="96" height="52" rx="4"/>
            <rect class="m-block" x="252" y="106" width="96" height="40" rx="4"/>
            <rect class="m-block" x="368" y="24" width="44" height="120" rx="4"/>
            <path class="m-road" d="M116 0 V200 M242 0 V200 M358 0 V200"/>
            <path class="m-road" d="M0 80 H420 M0 152 H420"/>
            <path class="m-road thin" d="M0 46 H420 M0 120 H420 M60 0 V200 M300 0 V200"/>
          </svg>
            <span class="lp-radius"></span>
            <span class="lp-pin me"><b>A</b></span>
            <span class="lp-pin p2"><b>B</b></span>
            <span class="lp-pin p3"><b>C</b></span>
          </div>
          <ul class="lp-results">
            <li class="on">
              <span class="lp-mark">A</span>
              <div><b>Your business</b><span class="lp-meta"><em class="lp-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</em>4.8 <i>(126)</i> &middot; Digital marketing agency</span></div>
              <span class="lp-dist">0.4 mi</span>
            </li>
            <li>
              <span class="lp-mark b">B</span>
              <div><b>Competitor</b><span class="lp-meta"><em class="lp-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</em>4.6 <i>(84)</i> &middot; Marketing agency</span></div>
              <span class="lp-dist">0.9 mi</span>
            </li>
            <li>
              <span class="lp-mark c">C</span>
              <div><b>Competitor</b><span class="lp-meta"><em class="lp-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</em>4.4 <i>(51)</i> &middot; Advertising agency</span></div>
              <span class="lp-dist">1.6 mi</span>
            </li>
          </ul>
        </div>

        <div class="lp-dials">
          <div class="lp-dial" data-f="0"><b>Relevance</b><span><i style="--w:82%"></i></span><em>can be fixed</em></div>
          <div class="lp-dial" data-f="1"><b>Reputation</b><span><i style="--w:74%"></i></span><em>can be fixed</em></div>
          <div class="lp-dial is-locked" data-f="2"><b>Distance</b><span><i style="--w:46%"></i></span><em>no one controls</em></div>
        </div>
      </div>

    </div>
  </div>
</section>`;

const newCss = `/* === lp-styles === */
/* ══════════════════════════════════════════════════════════════════════
   WHAT DETERMINES YOUR LOCAL PACK RANKING — the copy on the left, and on
   the right the thing it describes: a local pack with three results, and
   the three factors as dials. Two of them move; distance is locked,
   which is the point the copy makes.
   ══════════════════════════════════════════════════════════════════════ */
#pack{ --ground:var(--surface); --panel:var(--bg-alt); }
#pack{padding-block:clamp(38px,4.2vw,62px); background:var(--ground);}
.lp-grid{display:grid; grid-template-columns:minmax(0,1.02fr) minmax(0,.98fr); gap:clamp(24px,3.4vw,54px);
  align-items:center;}
.lp-say .smark{margin-bottom:12px;}
#pack h2{margin:0; font-size:clamp(26px,2.8vw,38px); line-height:1.08; letter-spacing:-.04em;
  text-transform:none;}
#pack h2 em{font-style:normal; color:var(--brand-text);}
.lp-lede{margin:14px 0 0; font-size:clamp(13.8px,1.06vw,15.2px); line-height:1.7; color:var(--text-2); max-width:58ch;}

.lp-list{list-style:none; margin:clamp(16px,1.8vw,22px) 0 0; padding:0; display:grid; gap:9px;}
.lp-item{display:grid; grid-template-columns:auto minmax(0,1fr) auto; align-items:center; gap:12px;
  padding:12px 14px; border-radius:14px; background:var(--bg-alt); border:1px solid var(--border);
  font-size:clamp(13px,1.02vw,14.2px); line-height:1.55; color:var(--text-2);
  transition:border-color .3s var(--ease), transform .3s var(--ease);}
.lp-item b{color:var(--text);}
.lp-item:hover{border-color:hsl(var(--brand-h) 70% 80%); transform:translateX(2px);}
.lp-ic{display:grid; place-items:center; width:36px; height:36px; border-radius:11px; flex:none;
  background:hsl(var(--brand-h) 85% 95%); color:var(--brand-text);}
.lp-ic svg{width:18px; height:18px;}
.lp-state{display:grid; place-items:center; width:26px; height:26px; border-radius:50%;
  background:hsl(var(--brand-h) 85% 95%); color:var(--brand-text);}
.lp-state svg{width:14px; height:14px;}
.lp-item.is-locked{background:var(--surface);}
.lp-item.is-locked .lp-ic,.lp-item.is-locked .lp-state{background:var(--border-soft, #eceff3); color:var(--muted);}
.lp-foot{margin:clamp(14px,1.6vw,20px) 0 0; font-size:clamp(13px,1.02vw,14.2px); line-height:1.6;
  color:var(--text); font-weight:600;}

/* the pack itself */
.lp-stage{display:grid; gap:clamp(12px,1.4vw,18px);}
.lp-pack{padding:clamp(14px,1.6vw,20px); border-radius:20px; background:var(--surface);
  border:1px solid var(--border); box-shadow:0 22px 44px -34px hsl(var(--brand-h) 90% 25% / .9);}
.lp-pack-h{display:block; font-family:var(--font-display); font-size:11.6px; font-weight:800;
  letter-spacing:.06em; text-transform:uppercase; color:var(--muted); margin-bottom:10px;}
.lp-map{position:relative; height:clamp(140px,15vw,180px); border-radius:14px; overflow:hidden;
  background:repeating-linear-gradient(112deg, transparent 0 22px, hsl(var(--brand-h) 40% 90%) 22px 23px),
             repeating-linear-gradient(22deg, transparent 0 26px, hsl(var(--brand-h) 40% 92%) 26px 27px),
             var(--bg-alt);}
.lp-radius{position:absolute; left:34%; top:48%; width:132px; height:132px; margin:-66px 0 0 -66px;
  border-radius:50%; border:1.6px dashed hsl(var(--brand-h) 70% 74%);
  animation:lpPulse 3.6s ease-out infinite;}
@keyframes lpPulse{0%{transform:scale(.72); opacity:0;} 25%{opacity:.9;} 100%{transform:scale(1.12); opacity:0;}}
.lp-me,.lp-p{position:absolute; width:14px; height:18px; border-radius:50% 50% 50% 0;
  transform:rotate(-45deg); background:hsl(var(--brand-h) 70% 74%);}
.lp-me{left:34%; top:48%; background:var(--primary); width:17px; height:22px;
  box-shadow:0 8px 16px -8px hsl(var(--brand-h) 95% 35% / .9);}
.lp-p.p1{left:58%; top:30%;} .lp-p.p2{left:72%; top:64%;} .lp-p.p3{left:20%; top:74%;}

.lp-results{list-style:none; margin:12px 0 0; padding:0; display:grid; gap:7px;}
.lp-results li{display:flex; align-items:center; justify-content:space-between; gap:10px;
  padding:9px 12px; border-radius:11px; background:var(--bg-alt); border:1px solid transparent;
  font-size:12px; color:var(--text-2); transition:border-color .3s var(--ease), background .3s var(--ease);}
.lp-results b{font-family:var(--font-display); font-weight:700; color:var(--text);}
.lp-results em{font-style:normal; font-weight:600;}
.lp-results li.on{background:hsl(var(--brand-h) 85% 96%); border-color:hsl(var(--brand-h) 70% 82%);}
.lp-results li.on b{color:var(--brand-text);}

/* the three factors */
.lp-dials{display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:clamp(8px,1vw,12px);}
.lp-dial{padding:12px; border-radius:14px; background:var(--surface); border:1px solid var(--border);
  transition:border-color .3s var(--ease), transform .3s var(--ease);}
.lp-dial b{display:block; font-family:var(--font-display); font-size:12.4px; font-weight:800;
  letter-spacing:-.02em; color:var(--text);}
.lp-dial span{display:block; height:8px; margin:9px 0 7px; border-radius:99px;
  background:hsl(var(--brand-h) 85% 93%); overflow:hidden;}
.lp-dial i{display:block; height:100%; width:var(--w); border-radius:99px; background:var(--primary);
  transform-origin:left; animation:lpGrow .9s var(--ease) both;}
.lp-dial:nth-child(2) i{animation-delay:.15s;} .lp-dial:nth-child(3) i{animation-delay:.3s;}
@keyframes lpGrow{from{transform:scaleX(0);} to{transform:scaleX(1);}}
.lp-dial em{font-style:normal; font-size:10.4px; font-weight:700; letter-spacing:.06em; text-transform:uppercase;
  color:var(--brand-text);}
.lp-dial.is-locked i{background:var(--border);}
.lp-dial.is-locked em{color:var(--muted);}
.lp-dial:hover{border-color:hsl(var(--brand-h) 70% 80%); transform:translateY(-2px);}
.lp-dial.is-locked:hover{transform:none; border-color:var(--border);}

@media (max-width:1040px){
  .lp-grid{grid-template-columns:minmax(0,1fr); gap:26px;}
  .lp-lede{max-width:none;}
}
@media (max-width:560px){
  .lp-dials{grid-template-columns:minmax(0,1fr);}
  .lp-item{grid-template-columns:auto minmax(0,1fr);}
  .lp-state{grid-column:1 / -1; justify-self:start;}
}
@media (prefers-reduced-motion:reduce){
  .lp-radius,.lp-dial i{animation:none;}
  .lp-radius{opacity:.5;}
}

/* the pack drawn as a pack: streets, a park and the water behind three
   lettered markers, and rows that carry the rating, the review count and
   the distance the way the real one does */
.lp-map{position:relative; height:clamp(156px,17vw,196px); border-radius:14px; overflow:hidden;
  background:none; border:1px solid var(--border);}
.lp-mapsvg{position:absolute; inset:0; width:100%; height:100%;}
.m-land{fill:#eef1f4;}
.m-block{fill:#e3e8ee;}
.m-park{fill:#d8ecd9;}
.m-water{fill:#cfe4f5;}
.m-road{stroke:#fff; stroke-width:7; fill:none; stroke-linecap:round;}
.m-road.thin{stroke-width:3.4; stroke:#f7f9fb;}
.lp-pin{position:absolute; display:grid; place-items:center; width:24px; height:30px;
  transform:translate(-50%,-100%); filter:drop-shadow(0 5px 6px rgba(20,40,60,.28));}
.lp-pin::before{content:""; position:absolute; inset:0;
  -webkit-mask:var(--pin) center/contain no-repeat; mask:var(--pin) center/contain no-repeat;
  background:#9AA7B4;}
.lp-pin b{position:relative; z-index:1; margin-bottom:6px; font-family:var(--font-display);
  font-size:11px; font-weight:800; color:#fff;}
.lp-map{--pin:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 42'%3E%3Cpath d='M16 42s16-18 16-26A16 16 0 1 0 0 16c0 8 16 26 16 26z'/%3E%3C/svg%3E");}
.lp-pin.me{width:30px; height:38px; left:34%; top:56%;}
.lp-pin.me::before{background:var(--primary);}
.lp-pin.p2{left:64%; top:36%;} .lp-pin.p3{left:80%; top:74%;}
.lp-radius{left:34%; top:56%; width:130px; height:130px; margin:-65px 0 0 -65px;
  border-color:hsl(var(--brand-h) 80% 58% / .55);}

.lp-results li{align-items:flex-start; gap:12px; padding:10px 12px;}
.lp-mark{display:grid; place-items:center; width:22px; height:22px; border-radius:50%; flex:none;
  background:#9AA7B4; color:#fff; font-family:var(--font-display); font-size:10.5px; font-weight:800;}
.lp-results li.on .lp-mark{background:var(--primary);}
.lp-results li > div{flex:1; min-width:0;}
.lp-meta{display:block; margin-top:3px; font-size:11.2px; color:var(--text-2);}
.lp-meta i{font-style:normal; color:var(--muted);}
.lp-stars{font-style:normal; margin-right:5px; letter-spacing:.5px; color:#F5A623;}
.lp-dist{font-size:11.4px; font-weight:700; color:var(--muted); white-space:nowrap; padding-top:2px;}

/* the dials read in their own colours: what can be moved, and what cannot */
.lp-dial i{background:#129A5B;}
.lp-dial em{color:#129A5B;}
.lp-dial.is-locked i{background:#c3cbd4;}
.lp-dial.is-locked em{color:var(--muted);}
`;

let body = fs.readFileSync(bodyPath, "utf8");
const start = body.indexOf('<section class="sec lp');
const end = body.indexOf("</section>", start);
if (start < 0 || end < 0) {
  console.error("pack section not found", start, end);
  process.exit(1);
}
const after = end + "</section>".length;
body = body.slice(0, start) + newSection + body.slice(after);
fs.writeFileSync(bodyPath, body);
console.log("Updated local-seo-body.html");

let css = fs.readFileSync(cssPath, "utf8");
const cssStart = css.indexOf("/* === lp-styles === */");
const cssEnd = css.indexOf("/* === wc-styles === */");
if (cssStart < 0 || cssEnd < 0) {
  console.error("lp css markers not found", cssStart, cssEnd);
  process.exit(1);
}
css = css.slice(0, cssStart) + newCss + "\n" + css.slice(cssEnd);

// keep type scale in sync for new copy classes
css = css.replace(/\.lp-say \.sec-lede,/g, ".lp-say .sec-lede,\n.lp-lede,\n.lp-foot,\n.lp-item,");
css = css.replace(/\.lp-note,/g, ".lp-note,\n.lp-lede,\n.lp-foot,");

fs.writeFileSync(cssPath, css);
console.log("Updated local-seo.css");
