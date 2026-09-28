/**
 * Port on-page deliverables accordion (acv) onto technical SEO
 * "Our Technical SEO Model" (#services-2), keeping technical content.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const SERVICES = [
  {
    title: "Technical SEO Audit",
    lead: "A technical SEO audit shows every impediment between your content and search engines. This includes crawling errors, indexing gaps, issues with site architecture, page speed, and even structured data errors.",
    items: [
      "Crawl and indexation gaps",
      "Site architecture issues",
      "Page speed blockers",
      "Structured data errors",
    ],
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="6.4"/><path d="m20 20-4.4-4.4"/><path d="M8.2 11h5.6M11 8.2v5.6"/></svg>',
  },
  {
    title: "Crawlability Budget Optimization",
    lead: "We analyze the index coverage within Search Console and audit server logs to review the requests being made by crawlers. Additionally, we fix any robots.txt or meta-directive conflicts and manage Crawl Budget by removing Faceted Navigation and Parameter URLs.",
    items: [
      "Search Console coverage review",
      "Server log crawl analysis",
      "robots.txt / meta conflicts",
      "Faceted and parameter URL cleanup",
    ],
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M4 12h10M4 17h7"/><circle cx="18.2" cy="16.8" r="3.2"/><path d="m20.4 19 1.4 1.4"/></svg>',
  },
  {
    title: "Core Web Vitals Optimization Services",
    lead: "Google has specified goals of LCP below 2.5 seconds, INP below 200 ms, and CLS at 0.1. We assess template-level issues related to blocked resources, images that have not been optimized, slow server response times, and then validate the improvements using real user (field) data.",
    items: [
      "LCP, INP, and CLS targets",
      "Blocked resource review",
      "Image and server response fixes",
      "Field-data validation",
    ],
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5h16M7 16v-4M11.5 16V8M16 16v-6"/></svg>',
  },
  {
    title: "Schema Markup Implementation Services",
    lead: "Rich results and AI citations both depend on machines understanding your content. We implement and validate JSON-LD schema: Product, FAQ, HowTo, LocalBusiness, Article, Organization, matched to what each page actually is. We also look for errors as schema.org standards evolve.",
    items: [
      "JSON-LD schema matched to page type",
      "Product, FAQ, HowTo, LocalBusiness",
      "Article and Organization markup",
      "Validation as standards evolve",
    ],
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 7.6-4.4 4.4L9 16.4M15 7.6l4.4 4.4L15 16.4"/></svg>',
  },
  {
    title: "JavaScript SEO",
    lead: "If Googlebot cannot render your JavaScript, the content does not exist for search. We assess Google&rsquo;s Web Rendering Service against the actual site and review and resolve issues that occur with popular JavaScript frameworks. We also assess issues that occur with CMS combinations and server-side implementations and provide dynamic rendering in the face of client-side rendering to ensure that the content is not blocked from indexation.",
    items: [
      "Renderability vs Googlebot",
      "JS framework and CMS issues",
      "SSR / dynamic rendering options",
      "Indexation blockers removed",
    ],
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 6.5 3.5 12 8 17.5M16 6.5 20.5 12 16 17.5"/></svg>',
  },
  {
    title: "Canonicalization &amp; Duplicate Content",
    lead: "Duplicate and near-duplicate URLs split ranking signals and waste your crawl budget. We modify canonical tags across your entire site to fix redirect chains and loops, lock down HTTP/HTTPS and www/non-www variants, and canonicalize pagination and filtered URLs. So that authority consolidates to the pages you want ranking.",
    items: [
      "Canonical tag cleanup",
      "Redirect chains and loops",
      "HTTP/HTTPS and www variants",
      "Pagination and filter URLs",
    ],
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3.2"/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.4 5.4l1.7 1.7M16.9 16.9l1.7 1.7M18.6 5.4l-1.7 1.7M7.1 16.9l-1.7 1.7"/></svg>',
  },
  {
    title: "Mobile Optimization",
    lead: "Google indexes your mobile site first. We test rendering across devices and separate Core Web Vitals by device to evaluate navigation and forms for real mobile usability.",
    items: [
      "Mobile-first indexing readiness",
      "Cross-device rendering checks",
      "Mobile Core Web Vitals",
      "Navigation and form usability",
    ],
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="3.2" width="8" height="17.6" rx="2"/><path d="M11 17.8h2"/></svg>',
  },
  {
    title: "Website Migration SEO Services",
    lead: "Poor site migration SEO is the highest-risk event you&rsquo;ll ever face. We build a one-to-one redirect map and validate the staging environment before launch. We then keep an eye on index, crawl, and rankings daily post-launch, so regressions get caught within hours.",
    items: [
      "One-to-one redirect map",
      "Staging validation pre-launch",
      "Post-launch crawl and index watch",
      "Ranking regression alerts",
    ],
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h12M12 7l5 5-5 5"/><path d="M4 7v10"/></svg>',
  },
  {
    title: "Log File Analysis",
    lead: "Server logs record how Googlebot and Bingbot crawl your site. We analyze log data to determine crawl budget waste and to identify anomalies, so we can address them properly.",
    items: [
      "Googlebot and Bingbot crawl paths",
      "Crawl budget waste flags",
      "Anomaly detection in logs",
      "Actionable crawl fixes",
    ],
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4.5h14v15H5z"/><path d="M8 8.5h8M8 12h8M8 15.5h5"/></svg>',
  },
  {
    title: "Ongoing Monitoring &amp; Governance",
    lead: "Technical SEO must be an active process. A change that takes months to implement can undo all the work in a second. We monitor crawlability and indexation status. We also evaluate developer deploys for the impact on SEO before they are deployed.",
    items: [
      "Crawlability monitoring",
      "Indexation status checks",
      "Pre-deploy SEO review",
      "Governance for lasting fixes",
    ],
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/></svg>',
  },
  {
    title: "Technical SEO for AI/LLM Crawlability",
    lead: "The same technical foundations that get you crawled and indexed by Google are what determine whether ChatGPT, Perplexity, or Google&rsquo;s AI Overviews can access and cite your content. We audit your site&rsquo;s structure, schema, and content accessibility specifically for AI crawlers, so you&rsquo;re not just optimizing for search anymore; you&rsquo;re optimizing for how AI reads the web.",
    items: [
      "AI crawler accessibility",
      "Structure and schema for LLMs",
      "Content extractability",
      "Citation readiness checks",
    ],
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.2c.8 4.4 3.2 6.8 7.6 7.6-4.4.8-6.8 3.2-7.6 7.6-.8-4.4-3.2-6.8-7.6-7.6 4.4-.8 6.8-3.2 7.6-7.6Z"/></svg>',
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
  const ico = svc.icon;
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
              <span class="ac-chip"><i></i>Service ${n} of ${String(total).padStart(2, "0")}</span>
            </div>
            <div class="ac-viz">${vizHtml(svc)}</div>
            <span class="ac-prog" aria-hidden="true"></span>
          </div>
        </div>`;
}

const section = `<!-- ══════════════════════════════════════════════════════════════════
     OUR TECHNICAL SEO MODEL — on-page deliverables accordion design
     ══════════════════════════════════════════════════════════════════ -->
<section class="sec acv" id="services-2">
  <div class="wrap">

    <div class="ac-head rv">
      <div>
        <span class="smark"><b>What we do</b></span>
        <h2>Our <em>Technical SEO</em> Model</h2>
      </div>
      <div class="ac-aside">
        <p class="ac-lede">Each engagement starts with an audit that tells us exactly which of these areas need how much attention.</p>
        <a class="btn btn-primary" href="#contact">Get a Custom Technical SEO Plan <span class="arw">&uarr;</span></a>
      </div>
    </div>

    <div class="ac" role="tablist" aria-label="Technical SEO model" data-acc>
${SERVICES.map((s, i) => itemHtml(s, i, SERVICES.length)).join("\n")}
    </div>

  </div>
</section>`;

/* ---- HTML ---- */
const bodyPath = path.join(ROOT, "lib", "technical-seo-body.html");
let body = fs.readFileSync(bodyPath, "utf8");
const modelIdx = body.indexOf("OUR TECHNICAL SEO MODEL");
const start = modelIdx >= 0 ? body.lastIndexOf("<!--", modelIdx) : -1;
const end = body.indexOf('id="whyus"');
const endSec = end >= 0 ? body.lastIndexOf("<section", end) : -1;
if (start < 0 || endSec < 0) {
  console.error("Could not locate Technical SEO Model / whyus markers", start, endSec);
  process.exit(1);
}
// Drop any leftover "WHAT WE DO variant" comments sitting just above the model block.
let cut = start;
const prior = body.lastIndexOf("WHAT WE DO, variant", start);
if (prior >= 0 && start - prior < 600) {
  cut = body.lastIndexOf("<!--", prior);
}
body = body.slice(0, cut) + section + "\n\n\n" + body.slice(endSec);
fs.writeFileSync(bodyPath, body);
console.log("Updated technical-seo-body.html");

/* ---- CSS: extract acv from on-page, replace tsm block ---- */
const onCss = fs.readFileSync(path.join(ROOT, "app", "on-page-seo.css"), "utf8");
const cssStart = onCss.indexOf("/* === ON-PAGE DELIVERABLES PANELS (from ref v6) === */");
const cssEnd = onCss.indexOf("/* === AI SEARCH VISIBILITY — from onpage ref (11) === */");
if (cssStart < 0 || cssEnd < 0) {
  console.error("Could not locate deliverables CSS block");
  process.exit(1);
}
let acCss = onCss.slice(cssStart, cssEnd);

const extras = `
/* === technical-seo acv checklist extras === */
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
  .acv .ac{height:clamp(420px,42vw,520px);}
  .acv .ac-item.on{min-width:540px;}
  .acv .ac-card p{max-width:42ch;}
  .acv .vz-checks{min-height:clamp(200px,22vw,280px);}
  /* 11 slim tabs — keep them readable without crushing the open pane */
  .acv .ac-item:not(.on){flex:0 0 clamp(40px,3.4vw,48px); min-width:clamp(40px,3.4vw,48px);}
}
@media (max-width:980px){
  .acv .ac-list-m{display:grid;}
  .acv .ac-item.on{min-height:auto;}
}
`;

const techCssPath = path.join(ROOT, "app", "technical-seo.css");
let techCss = fs.readFileSync(techCssPath, "utf8");
const tsmMark = "/* === tsm-acc-panels === */";
const tsmI = techCss.indexOf(tsmMark);
if (tsmI >= 0) {
  techCss = techCss.slice(0, tsmI);
} else if (techCss.includes("/* === ON-PAGE DELIVERABLES PANELS (from ref v6) === */")) {
  techCss = techCss.slice(
    0,
    techCss.indexOf("/* === ON-PAGE DELIVERABLES PANELS (from ref v6) === */")
  );
}
techCss = techCss.trimEnd() + "\n\n" + acCss.trimEnd() + "\n" + extras + "\n";
fs.writeFileSync(techCssPath, techCss);
console.log("Updated technical-seo.css");

/* ---- JS: replace tsm script with ac-script ---- */
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

const jsPath = path.join(ROOT, "public", "tekcroft-technical-seo.js");
let js = fs.readFileSync(jsPath, "utf8");
const oldJsStart = js.indexOf("/* === tsm-acc-script === */");
if (oldJsStart >= 0) {
  js = js.slice(0, oldJsStart).trimEnd() + "\n";
}
if (!js.includes("/* === ac-script (deliverables panels) === */")) {
  js = js.trimEnd() + "\n" + acScript + "\n";
}
fs.writeFileSync(jsPath, js);
console.log("Updated tekcroft-technical-seo.js");
