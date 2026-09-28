/**
 * Port on-page/ecommerce accordion design onto seo-audit
 * "What we do" (#services-2), keeping audit service content.
 * Also drops the Search Central wa-note under that section.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const CHECK =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8.8"/><path d="m8.6 12.2 2.4 2.4 4.4-4.8"/></svg>';

const ICONS = {
  technical:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 8-4 4 4 4M15 8l4 4-4 4M13 5.5l-2 13"/></svg>',
  content:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M8.5 12.5h7M8.5 16h4"/></svg>',
  backlink:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 1 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 11 18.7l1-1"/></svg>',
  competitor:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.4"/><path d="m15.6 15.6 4 4"/></svg>',
  geo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.2 13.7 8 18.5 9.7 13.7 11.4 12 16.2 10.3 11.4 5.5 9.7 10.3 8Z"/><path d="M18.4 15.2 19.2 17.4l2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8Z"/></svg>',
  analytics:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.8 20.2h16.4"/><path d="M6.6 20.2v-5M11 20.2V9.6M15.4 20.2v-7.6M19.8 20.2V6"/><path d="m6.6 11.4 4.4-4.6 3 2.2 4.4-4.6"/></svg>',
};

const SERVICES = [
  {
    icon: "technical",
    title: "Technical SEO Audit",
    lead: "Our technical SEO audit services check crawlability to ensure Google can actually find your pages. We test indexation to make sure only the correct pages end up in Google&rsquo;s index. We run a full site speed audit alongside Core Web Vitals and JavaScript Rendering, both of which hardly ever become clear from tool exports but cause eligibility problems all the time.",
    items: [
      "Crawlability and indexation control",
      "Site speed and Core Web Vitals",
      "JavaScript rendering checks",
      "XML sitemaps and robots.txt",
      "Duplicate URL and canonical issues",
      "Mobile performance readiness",
    ],
  },
  {
    icon: "content",
    title: "On-Page &amp; Content Audit",
    lead: "As part of our content audit services, we audit metadata and header structure with regard to search intent match. We highlight keyword cannibalization, where several pages compete for the same keyword instead of one page winning clearly. We identify decaying content, pages that once ranked but have slowly faded away unnoticed.",
    items: [
      "Metadata and header structure",
      "Search intent alignment",
      "Keyword cannibalization",
      "Content decay detection",
      "Thin or duplicate page flags",
      "Internal linking gaps",
    ],
  },
  {
    icon: "backlink",
    title: "Backlink &amp; Authority Audit",
    lead: "Our backlink audit services analyze your backlink profile to identify any toxic or spammy backlinks that may be damaging your authority score. We measure your authority gap relative to your real competitors you&rsquo;re actually losing rankings to, not a generic industry benchmark.",
    items: [
      "Toxic and spammy link review",
      "Authority gap vs real competitors",
      "Link quality distribution",
      "Disavow / cleanup candidates",
      "Referral and anchor patterns",
      "Opportunity gaps in link profile",
    ],
  },
  {
    icon: "competitor",
    title: "Competitor Gap Analysis",
    lead: "We run a keyword gap analysis and content gap analysis at the keyword level to see exactly where your competitors are outranking you and why, whether it&rsquo;s through content depth, technical superiority, or backlinking.",
    items: [
      "Keyword gap analysis",
      "Content gap analysis",
      "Ranking overlap review",
      "Content depth comparison",
      "Technical superiority gaps",
      "Backlink advantage mapping",
    ],
  },
  {
    icon: "geo",
    title: "AI Search (GEO) Readiness Audit",
    lead: "We check whether ChatGPT, Gemini, and Google&rsquo;s AI Overviews can discover, interpret, and cite your website. It&rsquo;s more critical than most audits realize: 65% of US adults are reading AI-generated summaries in their search results, and websites that aren&rsquo;t optimized for this layer are getting lost in it completely.",
    items: [
      "AI Overview citation readiness",
      "Entity and source clarity",
      "Structured data for AI parsers",
      "Answer-engine discoverability",
      "Content extractability checks",
      "Brand mention / citation gaps",
    ],
  },
  {
    icon: "analytics",
    title: "Analytics &amp; Conversion Tracking Audit",
    lead: "We verify that your GA4 and conversion data are reliable before giving any recommendations. Sites that we audit have been basing their decisions on inaccurate data; all their past &ldquo;insights&rdquo; have been wrong from the start.",
    items: [
      "GA4 configuration review",
      "Conversion event accuracy",
      "Goal and funnel integrity",
      "Attribution sanity checks",
      "Tracking gaps and duplicates",
      "Reporting reliability flags",
    ],
  },
];

function vizHtml(svc) {
  const rows = svc.items
    .map(
      (t, k) =>
        `<span class="vz-row" style="--k:${Math.min(k, 4)}"><i></i><em>${t}</em></span>`
    )
    .join("\n  ");
  return `<div class="vz vz-checks">
  ${rows}
</div>`;
}

function itemHtml(svc, i, total) {
  const n = String(i + 1).padStart(2, "0");
  const on = i === 0 ? " on" : "";
  const selected = i === 0 ? "true" : "false";
  const ico = ICONS[svc.icon];
  return `        <div class="ac-item${on}" data-i="${i}" role="tab"
             tabindex="0" aria-selected="${selected}">
          <span class="ac-bg" aria-hidden="true"><span class="ac-fb"></span><span class="ac-veil"></span>
            <span class="ac-wm is-off">${ico}</span></span>
          <span class="ac-slim" aria-hidden="true">
            <b class="ac-n">${n}</b>
            <span class="ac-vt">${svc.title}</span>
          </span>
          <div class="ac-open">
            <div class="ac-card">
              <span class="ac-card-top"><span class="ac-ico">${ico}</span><span class="ac-num">${n}</span></span>
              <h3>${svc.title}</h3>
              <p>${svc.lead}</p>
              <ul class="ac-list ac-list-m">${svc.items
                .map((t) => `<li>${CHECK}<span>${t}</span></li>`)
                .join("")}</ul>
              <span class="ac-chip"><i></i>Service ${n} of ${String(total).padStart(2, "0")}</span>
            </div>
            <div class="ac-viz">${vizHtml(svc)}</div>
            <span class="ac-prog" aria-hidden="true"></span>
          </div>
        </div>`;
}

const section = `<!-- ══════════════════════════════════════════════════════════════════
     WHAT WE DO — on-page deliverables accordion design
     ══════════════════════════════════════════════════════════════════ -->
<section class="sec acv" id="services-2">
  <div class="wrap">

    <div class="ac-head rv">
      <div>
        <span class="smark"><b>What we do</b></span>
        <h2>What Our <em>SEO Audit Services</em> Cover</h2>
      </div>
      <div class="ac-aside">
        <p class="ac-lede">Every audit works through six different levels: technical, content, backlinks, competitors, AI search visibility, and analytics accuracy. Our seo site audit services go beyond a surface scan into manual, prioritized review.</p>
        <a class="btn btn-primary" href="#contact">Explore all services <span class="arw">&uarr;</span></a>
      </div>
    </div>

    <div class="ac" role="tablist" aria-label="SEO audit services" data-acc>
${SERVICES.map((s, i) => itemHtml(s, i, SERVICES.length)).join("\n")}
    </div>

  </div>
</section>`;

/* ---- HTML ---- */
const bodyPath = path.join(ROOT, "lib", "seo-audit-services-body.html");
let body = fs.readFileSync(bodyPath, "utf8");
const start = body.indexOf(
  "<!-- ══════════════════════════════════════════════════════════════════\n     WHAT WE DO"
);
const end = body.indexOf(
  "<!-- ══════════════════════════════════════════════════════════════════\n     MID-PAGE CTA"
);
if (start < 0 || end < 0) {
  console.error("Could not locate What we do / Mid-page CTA markers");
  process.exit(1);
}
body = body.slice(0, start) + section + "\n\n" + body.slice(end);
fs.writeFileSync(bodyPath, body);
console.log("Updated seo-audit-services-body.html");

/* ---- CSS: extract acv block from on-page and append extras ---- */
const onCss = fs.readFileSync(path.join(ROOT, "app", "on-page-seo.css"), "utf8");
const cssStart = onCss.indexOf("/* === ON-PAGE DELIVERABLES PANELS (from ref v6) === */");
const cssEnd = onCss.indexOf("/* === AI SEARCH VISIBILITY — from onpage ref (11) === */");
if (cssStart < 0 || cssEnd < 0) {
  console.error("Could not locate deliverables CSS block");
  process.exit(1);
}
let acCss = onCss.slice(cssStart, cssEnd);

const extras = `
/* === seo-audit acv checklist extras === */
#services-2.acv{background:var(--ground); border-block:0;}
.acv .ac-list{list-style:none; margin:0 0 14px; padding:0; display:none; gap:7px;}
.acv .ac-list li{display:flex; align-items:flex-start; gap:9px;
  font-size:clamp(12.4px,.95vw,13.2px); line-height:1.45; color:var(--text-2); font-weight:600;}
.acv .ac-list svg{flex:none; width:16px; height:16px; margin-top:2px; color:var(--primary);}
.acv .vz-checks{gap:7px; justify-content:flex-start; overflow:auto; max-height:100%;}
.acv .vz-checks .vz-row{display:flex; align-items:flex-start; gap:9px;
  font-size:10.6px; font-weight:600; color:var(--text-2);}
.acv .vz-checks .vz-row em{font-style:normal; line-height:1.35;}
.acv .vz-checks .vz-row i{flex:none; display:grid; place-items:center; width:15px; height:15px; margin-top:1px;
  border-radius:5px; background:var(--primary);}
.acv .vz-checks .vz-row i::after{content:""; width:7px; height:3.5px;
  border-left:2px solid #fff; border-bottom:2px solid #fff;
  transform:rotate(-45deg) translate(1px,-1px);}
@media (min-width:981px){
  .acv .ac{height:clamp(400px,40vw,500px);}
  .acv .ac-item.on{min-width:560px;}
  .acv .ac-card p{max-width:42ch;}
  .acv .vz-checks{min-height:clamp(200px,22vw,280px);}
}
@media (max-width:980px){
  .acv .ac-list-m{display:grid;}
  .acv .ac-item.on{min-height:auto;}
}
`;

const auditCssPath = path.join(ROOT, "app", "seo-audit-services.css");
let auditCss = fs.readFileSync(auditCssPath, "utf8");
const marker = "/* === ON-PAGE DELIVERABLES PANELS (from ref v6) === */";
if (auditCss.includes(marker)) {
  const i = auditCss.indexOf(marker);
  auditCss = auditCss.slice(0, i);
}
auditCss = auditCss.trimEnd() + "\n\n" + acCss.trimEnd() + "\n" + extras + "\n";
fs.writeFileSync(auditCssPath, auditCss);
console.log("Updated seo-audit-services.css");

/* ---- JS ---- */
const acScript = `
/* === ac-script (deliverables panels) === */
(function(){
 document.querySelectorAll('[data-acc]').forEach(function(acc){
  var items=[].slice.call(acc.querySelectorAll('.ac-item'));
  var at=0, timer=null, held=false;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function show(i){
    at=(i+items.length)%items.length;
    items.forEach(function(el,k){ var on=k===at; el.classList.toggle('on',on); el.setAttribute('aria-selected',String(on)); });
  }
  function play(){ stop(); acc.classList.remove('paused'); if(!held && !reduce) timer=setInterval(function(){ show(at+1); },5000); }
  function stop(){ clearInterval(timer); }
  function hold(){ held=true; stop(); acc.classList.add('paused'); clearTimeout(hold._t);
    hold._t=setTimeout(function(){ held=false; play(); },12000); }

  items.forEach(function(el,i){
    el.addEventListener('mouseenter',function(){ show(i); });
    el.addEventListener('click',function(){ hold(); show(i); });
    el.addEventListener('keydown',function(e){
      if(e.key==='Enter' || e.key===' '){ e.preventDefault(); hold(); show(i); return; }
      var to = e.key==='ArrowRight'||e.key==='ArrowDown' ? i+1 : e.key==='ArrowLeft'||e.key==='ArrowUp' ? i-1 : -1;
      if(to<0 || to>=items.length) return;
      e.preventDefault(); items[to].focus(); hold(); show(to);
    });
  });
  acc.addEventListener('mouseenter',function(){ stop(); acc.classList.add('paused'); });
  acc.addEventListener('mouseleave',function(){ acc.classList.remove('paused'); if(!held) play(); });

  acc.addEventListener('pointermove',function(e){
    var open=acc.querySelector('.ac-item.on'); if(!open) return;
    var r=open.getBoundingClientRect();
    open.style.setProperty('--mx', Math.min(Math.max((e.clientX-r.left)/r.width,0),1).toFixed(3));
    open.style.setProperty('--my', Math.min(Math.max((e.clientY-r.top)/r.height,0),1).toFixed(3));
  });

  show(0);
  var io=new IntersectionObserver(function(es){ es.forEach(function(e){ e.isIntersecting ? play() : stop(); }); },{threshold:.25});
  io.observe(acc);
 });
})();
`;

const jsPath = path.join(ROOT, "public", "tekcroft-seo-audit-services.js");
let js = fs.readFileSync(jsPath, "utf8");
if (!js.includes("/* === ac-script (deliverables panels) === */")) {
  js = js.trimEnd() + "\n" + acScript + "\n";
  fs.writeFileSync(jsPath, js);
  console.log("Updated tekcroft-seo-audit-services.js");
} else {
  console.log("ac-script already present");
}
