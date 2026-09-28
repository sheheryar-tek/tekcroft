/**
 * Port on-page SEO deliverables accordion design onto ecommerce
 * "What we do" (#services-2), keeping ecommerce service content.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const CHECK =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8.8"/><path d="m8.6 12.2 2.4 2.4 4.4-4.8"/></svg>';

const ICONS = {
  audit:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="3.5" width="14" height="17" rx="2.5"/><path d="M9 3.5h6v3H9zM9 11h6M9 15h4"/></svg>',
  keyword:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.3-4.3"/></svg>',
  product:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.8 3.6h2.4l2.2 10.2h9.8l2.2-7.4H6.4"/><circle cx="9.6" cy="19" r="1.4"/><circle cx="17" cy="19" r="1.4"/></svg>',
  category:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9.4" y="2.6" width="5.2" height="4.6" rx="1.3"/><rect x="2.6" y="16.8" width="5.2" height="4.6" rx="1.3"/><rect x="16.2" y="16.8" width="5.2" height="4.6" rx="1.3"/><path d="M12 7.2v3.4M5.2 16.8v-2.8h13.6v2.8M12 10.6v3.4"/></svg>',
  technical:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 8-4 4 4 4M15 8l4 4-4 4M13 5.5l-2 13"/></svg>',
  content:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M8.5 12.5h7M8.5 16h4"/></svg>',
};

const SERVICES = [
  {
    icon: "audit",
    title: "Ecommerce SEO Audit",
    lead: "The starting point is always an audit; it helps identify what&rsquo;s holding back your online growth. The issue can be structural, technical, or in visibility. A regular audit covers:",
    items: [
      "Crawlability and indexation issues",
      "Duplicate content across product variants",
      "Broken links and redirect chains",
      "Site architecture and navigation depth",
      "Page speed and Core Web Vitals",
      "Mobile performance",
      "Product and category page gaps",
      "Internal linking structure",
      "Structure metadata",
      "Competitor visibility gaps",
    ],
    viz: "audit",
  },
  {
    icon: "keyword",
    title: "Keyword Strategy &amp; Search Intent",
    lead: "Our ecommerce keyword research revolves around matching high-volume keywords to pages and buyer-journey stages to increase conversion rates. The keyword research includes:",
    items: [
      "Product-level and category-level keywords",
      "Long-tail, high-intent search terms",
      "Commercial and transactional intent",
      "Informational (top-of-funnel) searches",
      "Competitor keyword gaps",
      "Keyword-to-page mapping",
    ],
    viz: "map",
  },
  {
    icon: "product",
    title: "Ecommerce Product Page SEO",
    lead: "Every product page is optimized to ensure the offer is easy to understand for both shoppers and search engines.",
    items: [
      "Product titles and meta titles",
      "Meta description",
      "Unique, conversion-focused product descriptions",
      "Product attributes and specifications",
      "Internal linking to related products/categories",
      "Product schema markup",
      "FAQs where relevant to purchase decisions",
    ],
    viz: "land",
  },
  {
    icon: "category",
    title: "Ecommerce Category Page SEO",
    lead: "Category pages are often the highest-value, most overlooked pages on an ecommerce site. They capture broader, higher-volume commercial searches and act as authority hubs that guide shoppers to the right products.",
    items: [
      "Category-level keyword targeting",
      "Supporting category page content",
      "Heading structure and on-page hierarchy",
      "Breadcrumb navigation",
      "Filter and pagination handling",
      "Internal linking from category to product pages",
      "Search intent alignment",
    ],
    viz: "link",
  },
  {
    icon: "technical",
    title: "Technical SEO",
    lead: "Handling technical SEO for ecommerce is not an easy task. Most of the ecommerce SEO problems are found here, where generic SEO providers fall short.",
    items: [
      "Crawlability and indexation control",
      "XML sitemaps and robots.txt configuration",
      "Canonicalization for product variants",
      "Duplicate URL resolution",
      "Faceted navigation and filter management",
      "Ecommerce site migration SEO to protect rankings during platform or URL changes",
    ],
    viz: "schema",
  },
  {
    icon: "content",
    title: "Ecommerce Content Optimization",
    lead: "Ecommerce content supports the whole marketing funnel, so it should be strategically structured.",
    items: [
      "Blog content for top-of-funnel discovery",
      "Product description optimization",
      "Educational, buyer-guide style content",
      'Bottom-of-funnel comparison and &quot;best of&quot; content',
      "FAQ content that earns visibility and answers real buyer questions",
    ],
    viz: "serp",
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
        <h2>What Tekcroft Does For Your <em>Ecommerce SEO</em></h2>
      </div>
      <div class="ac-aside">
        <p class="ac-lede">Tekcroft is an ecommerce SEO company that believes every business has different needs and goals. Our ecommerce technical SEO services focus on the structural and technical issues that can prevent important pages from being crawled, indexed, or ranked.</p>
        <a class="btn btn-primary" href="#contact">Explore all services <span class="arw">&uarr;</span></a>
      </div>
    </div>

    <div class="ac" role="tablist" aria-label="Ecommerce SEO services" data-acc>
${SERVICES.map((s, i) => itemHtml(s, i, SERVICES.length)).join("\n")}
    </div>

  </div>
</section>`;

/* ---- HTML ---- */
const bodyPath = path.join(ROOT, "lib", "ecommerce-seo-body.html");
let body = fs.readFileSync(bodyPath, "utf8");
const start = body.indexOf("<!-- ══════════════════════════════════════════════════════════════════\n     WHAT WE DO");
const end = body.indexOf("<!-- ══════════════════════════════════════════════════════════════════\n     PLATFORMS");
if (start < 0 || end < 0) {
  console.error("Could not locate What we do / Platforms markers");
  process.exit(1);
}
body = body.slice(0, start) + section + "\n\n" + body.slice(end);
fs.writeFileSync(bodyPath, body);
console.log("Updated ecommerce-seo-body.html");

/* ---- CSS: extract acv block from on-page and append extras ---- */
const onCss = fs.readFileSync(path.join(ROOT, "app", "on-page-seo.css"), "utf8");
const cssStart = onCss.indexOf("/* === ON-PAGE DELIVERABLES PANELS (from ref v6) === */");
const cssEnd = onCss.indexOf("/* === AI SEARCH VISIBILITY — from onpage ref (11) === */");
if (cssStart < 0 || cssEnd < 0) {
  console.error("Could not locate deliverables CSS block");
  process.exit(1);
}
let acCss = onCss.slice(cssStart, cssEnd);

/* Ecommerce-specific: desktop puts the checklist in the viz card;
   mobile keeps the list under the lead (viz stays hidden). */
const extras = `
/* === ecommerce acv checklist extras === */
#services-2.acv{background:var(--surface); border-block:0;}
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

const ecomCssPath = path.join(ROOT, "app", "ecommerce-seo.css");
let ecomCss = fs.readFileSync(ecomCssPath, "utf8");
const marker = "/* === ON-PAGE DELIVERABLES PANELS (from ref v6) === */";
if (ecomCss.includes(marker)) {
  const i = ecomCss.indexOf(marker);
  ecomCss = ecomCss.slice(0, i);
}
ecomCss = ecomCss.trimEnd() + "\n\n" + acCss.trimEnd() + "\n" + extras + "\n";
fs.writeFileSync(ecomCssPath, ecomCss);
console.log("Updated ecommerce-seo.css");

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

const jsPath = path.join(ROOT, "public", "tekcroft-ecommerce-seo.js");
let js = fs.readFileSync(jsPath, "utf8");
if (!js.includes("/* === ac-script (deliverables panels) === */")) {
  js = js.trimEnd() + "\n" + acScript + "\n";
  fs.writeFileSync(jsPath, js);
  console.log("Updated tekcroft-ecommerce-seo.js");
} else {
  console.log("ac-script already present");
}
