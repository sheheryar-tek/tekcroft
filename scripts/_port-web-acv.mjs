/**
 * Port ecommerce-style acv "What we do" panels onto
 * web-design-and-development-services, with web design content.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const CHECK =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8.8"/><path d="m8.6 12.2 2.4 2.4 4.4-4.8"/></svg>';

const ICONS = {
  design:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.2 14.6 9l6.6.4-5.1 4.2 1.7 6.4L12 16.4 6.2 20l1.7-6.4L2.8 9.4 9.4 9Z"/></svg>',
  code:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 8-4 4 4 4M15 8l4 4-4 4M13 5.5l-2 13"/></svg>',
  cart:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.8 3.6h2.4l2.2 10.2h9.8l2.2-7.4H6.4"/><circle cx="9.6" cy="19" r="1.4"/><circle cx="17" cy="19" r="1.4"/></svg>',
  redesign:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 12a7.5 7.5 0 0 1 12.4-5.7L19 4v5h-5"/><path d="M19.5 12a7.5 7.5 0 0 1-12.4 5.7L5 20v-5h5"/></svg>',
  small:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20V10l8-6 8 6v10"/><path d="M9 20v-6h6v6"/></svg>',
  platform:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="4" width="17" height="16" rx="2.4"/><path d="M8 4v16M16 4v16M3.5 10h17M3.5 14h17"/></svg>',
};

const SERVICES = [
  {
    icon: "design",
    slim: "Custom Web Design",
    title: "Custom Web Design",
    lead: "We create the structure and visual direction before development begins, giving you a clear view of the finished experience before it&rsquo;s built.",
    items: [
      "Structure and visual direction first",
      "Clear view of the finished experience",
      "Designed before development begins",
      "User journeys mapped early",
      "Brand-aligned layouts",
    ],
  },
  {
    icon: "code",
    slim: "Custom Web Development",
    title: "Custom Web Development",
    lead: "Our website development services deliver clean, scalable code built on the right framework for your goals. Whether that&rsquo;s a fast-loading brochure site or a complex custom web application with logins, dashboards, or integrations.",
    items: [
      "Clean, scalable code",
      "Framework matched to your goals",
      "Fast-loading brochure sites",
      "Custom web applications",
      "Logins, dashboards, and integrations",
    ],
  },
  {
    icon: "cart",
    slim: "E-commerce Development",
    title: "E-commerce Development",
    lead: "Storefronts built to sell: secure checkout, inventory-ready product pages, or payment integrations on Shopify, WooCommerce, or a fully custom-built store.",
    items: [
      "Secure checkout",
      "Inventory-ready product pages",
      "Payment integrations",
      "Shopify storefronts",
      "WooCommerce builds",
      "Fully custom stores",
    ],
  },
  {
    icon: "redesign",
    slim: "Website Redesign",
    title: "Website Redesign",
    lead: "Already have a site that isn&rsquo;t performing? We audit what&rsquo;s holding it back: speed, structure, outdated design, poor mobile experience. And rebuild around what&rsquo;s actually costing you leads, without losing the SEO equity you&rsquo;ve already earned.",
    items: [
      "Speed and performance audit",
      "Structure and navigation review",
      "Outdated design replacement",
      "Mobile experience fixes",
      "Rebuild without losing SEO equity",
    ],
  },
  {
    icon: "small",
    slim: "Small Business Web Design",
    title: "Small Business Web Design",
    lead: "Whether you need a web designer for small business or a full custom build, this is right-sized for how small businesses actually operate: fast turnaround and straightforward pricing. Resulting in a site you can update yourself once it&rsquo;s live. No calling the agency for every small edit.",
    items: [
      "Fast turnaround",
      "Straightforward pricing",
      "Right-sized for small businesses",
      "Self-serve updates after launch",
      "No agency for every small edit",
    ],
  },
  {
    icon: "platform",
    slim: "Platform Builds",
    title: "WordPress / Shopify / Webflow Development",
    lead: "Our site design services recommend the platform that fits your budget and growth plans, all built with responsive design as standard.",
    items: [
      "WordPress — small businesses, blogs, content-heavy sites",
      "Shopify — e-commerce and online stores",
      "Webflow — design-focused brands and marketing sites",
      "Custom development — complex apps and unique features",
      "Responsive design as standard",
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
  return `<div class="vz vz-checks">\n  ${rows}\n</div>`;
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
            <span class="ac-vt">${svc.slim}</span>
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

/* Keep existing platforms strip + way CTA from current body */
const bodyPath = path.join(ROOT, "lib", "web-design-and-development-body.html");
let body = fs.readFileSync(bodyPath, "utf8");

const svcIdx = body.indexOf('id="services-2"');
const secStart = svcIdx >= 0 ? body.lastIndexOf("<section", svcIdx) : -1;
const indIdx = body.indexOf('id="industries"');
const secEnd = indIdx >= 0 ? body.lastIndexOf("<section", indIdx) : -1;
if (secStart < 0 || secEnd < 0) {
  console.error("services-2 / industries markers missing", { secStart, secEnd });
  process.exit(1);
}

const oldSec = body.slice(secStart, secEnd);
const footStart = oldSec.indexOf('<div class="fw-foot wd-way');
const foot = footStart >= 0 ? oldSec.slice(footStart).replace(/\s*<\/div>\s*<\/section>\s*$/, "").trim() : "";

const section =
  `<!-- ══════════════════════════════════════════════════════════════════\n` +
  `     WHAT WE DO — acv panels (web design content)\n` +
  `     ══════════════════════════════════════════════════════════════════ -->\n` +
  `<section class="sec acv" id="services-2" data-ground="tint">\n` +
  `  <div class="wrap">\n\n` +
  `    <div class="ac-head rv">\n` +
  `      <div>\n` +
  `        <span class="smark"><b>What we do</b></span>\n` +
  `        <h2>Tekcroft&rsquo;s Web Design <em>&amp; Development</em></h2>\n` +
  `      </div>\n` +
  `      <div class="ac-aside">\n` +
  `        <p class="ac-lede">As a full-service website development company, we build around your business needs, from a new business website to a complex e-commerce store. You work with one team across strategy, design, development, and launch, keeping the project consistent from the first discussion to the finished site.</p>\n` +
  `        <a class="btn btn-primary" href="#contact">Explore all services <span class="arw">&uarr;</span></a>\n` +
  `      </div>\n` +
  `    </div>\n\n` +
  `    <div class="ac" role="tablist" aria-label="Web design and development services" data-acc>\n` +
  SERVICES.map((s, i) => itemHtml(s, i, SERVICES.length)).join("\n") +
  `\n    </div>\n\n` +
  (foot ? `    ${foot}\n\n` : "") +
  `  </div>\n` +
  `</section>\n\n`;

body = body.slice(0, secStart) + section + body.slice(secEnd);
fs.writeFileSync(bodyPath, body);
console.log("Updated web-design-and-development-body.html", {
  hasFoot: !!foot,
  panels: SERVICES.length,
});

/* ---- CSS: copy acv from ecommerce (already includes extras) ---- */
const ecomCss = fs.readFileSync(path.join(ROOT, "app", "ecommerce-seo.css"), "utf8");
const mark = "/* === ON-PAGE DELIVERABLES PANELS (from ref v6) === */";
const extrasMark = "/* === ecommerce acv checklist extras === */";
const cssStart = ecomCss.indexOf(mark);
let cssEnd = ecomCss.indexOf("/* === SITE CONSISTENCY LOCK", cssStart);
if (cssStart < 0) {
  console.error("acv CSS missing in ecommerce-seo.css");
  process.exit(1);
}
// Prefer take through extras block; stop before next unrelated major block if any
const afterExtras = ecomCss.indexOf("\n/* ===", ecomCss.indexOf(extrasMark) + extrasMark.length);
if (afterExtras > cssStart && (cssEnd < 0 || afterExtras < cssEnd)) cssEnd = afterExtras;
if (cssEnd < 0) cssEnd = ecomCss.length;
let acCss = ecomCss.slice(cssStart, cssEnd).trimEnd();
acCss = acCss.replaceAll(
  "/* === ecommerce acv checklist extras === */",
  "/* === web-design acv checklist extras === */"
);

const cssPath = path.join(ROOT, "app", "web-design-and-development.css");
let css = fs.readFileSync(cssPath, "utf8");
const lockMark = "/* === SITE CONSISTENCY LOCK";
let lockTail = "";
const lockI = css.indexOf(lockMark);
if (lockI >= 0) {
  lockTail = css.slice(lockI);
  css = css.slice(0, lockI).trimEnd();
}
const oldAc = css.indexOf(mark);
if (oldAc >= 0) css = css.slice(0, oldAc).trimEnd();

const ground =
  `\n\n/* === web-design services-2 acv ground === */\n` +
  `#services-2.acv{background:var(--ground) !important; border-block:0 !important;}\n` +
  `#services-2 .fw-foot.wd-way{margin-top:clamp(28px,3vw,44px);}\n`;

css = css.trimEnd() + "\n\n" + acCss + ground + "\n";
if (lockTail) css += "\n" + lockTail;
fs.writeFileSync(cssPath, css);
console.log("Updated web-design-and-development.css");

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

const jsPath = path.join(ROOT, "public", "tekcroft-web-design-and-development.js");
let js = fs.readFileSync(jsPath, "utf8");
const acMark = "/* === ac-script (deliverables panels) === */";
const acI = js.indexOf(acMark);
if (acI >= 0) js = js.slice(0, acI).trimEnd() + "\n";
js = js.trimEnd() + "\n" + acScript + "\n";
fs.writeFileSync(jsPath, js);
console.log("Updated tekcroft-web-design-and-development.js");
