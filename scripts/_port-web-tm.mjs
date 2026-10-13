/**
 * Convert web-design #services-2 from ACV to GBP-process TM design.
 * Keeps existing service copy; head matches GBP (h2 + ax-lede); CTA under rail.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const SERVICES = [
  {
    slim: "Custom Web Design",
    title: "Custom Web Design",
    lead: "We create the structure and visual direction before development begins, giving you a clear view of the finished experience before it&rsquo;s built.",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.2 14.6 9l6.6.4-5.1 4.2 1.7 6.4L12 16.4 6.2 20l1.7-6.4L2.8 9.4 9.4 9Z"/></svg>',
    viz: [
      "Structure and visual direction first",
      "Clear view of the finished experience",
      "Designed before development begins",
      "User journeys mapped early",
      "Brand-aligned layouts",
    ],
  },
  {
    slim: "Custom Web Development",
    title: "Custom Web Development",
    lead: "Our website development services deliver clean, scalable code built on the right framework for your goals. Whether that&rsquo;s a fast-loading brochure site or a complex custom web application with logins, dashboards, or integrations.",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 8-4 4 4 4M15 8l4 4-4 4M13 5.5l-2 13"/></svg>',
    viz: [
      "Clean, scalable code",
      "Framework matched to your goals",
      "Fast-loading brochure sites",
      "Custom web applications",
      "Logins, dashboards, and integrations",
    ],
  },
  {
    slim: "E-commerce Development",
    title: "E-commerce Development",
    lead: "Storefronts built to sell: secure checkout, inventory-ready product pages, or payment integrations on Shopify, WooCommerce, or a fully custom-built store.",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.8 3.6h2.4l2.2 10.2h9.8l2.2-7.4H6.4"/><circle cx="9.6" cy="19" r="1.4"/><circle cx="17" cy="19" r="1.4"/></svg>',
    viz: [
      "Secure checkout",
      "Inventory-ready product pages",
      "Payment integrations",
      "Shopify storefronts",
      "WooCommerce builds",
      "Fully custom stores",
    ],
  },
  {
    slim: "Website Redesign",
    title: "Website Redesign",
    lead: "Already have a site that isn&rsquo;t performing? We audit what&rsquo;s holding it back: speed, structure, outdated design, poor mobile experience. And rebuild around what&rsquo;s actually costing you leads, without losing the SEO equity you&rsquo;ve already earned.",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 12a7.5 7.5 0 0 1 12.4-5.7L19 4v5h-5"/><path d="M19.5 12a7.5 7.5 0 0 1-12.4 5.7L5 20v-5h5"/></svg>',
    viz: [
      "Speed and performance audit",
      "Structure and navigation review",
      "Outdated design replacement",
      "Mobile experience fixes",
      "Rebuild without losing SEO equity",
    ],
  },
  {
    slim: "Small Business Web Design",
    title: "Small Business Web Design",
    lead: "Whether you need a web designer for small business or a full custom build, this is right-sized for how small businesses actually operate: fast turnaround and straightforward pricing. Resulting in a site you can update yourself once it&rsquo;s live. No calling the agency for every small edit.",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20V10l8-6 8 6v10"/><path d="M9 20v-6h6v6"/></svg>',
    viz: [
      "Fast turnaround",
      "Straightforward pricing",
      "Right-sized for small businesses",
      "Self-serve updates after launch",
      "No agency for every small edit",
    ],
  },
  {
    slim: "Platform Builds",
    title: "WordPress / Shopify / Webflow Development",
    lead: "Our site design services recommend the platform that fits your budget and growth plans, all built with responsive design as standard.",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="4" width="17" height="16" rx="2.4"/><path d="M8 4v16M16 4v16M3.5 10h17M3.5 14h17"/></svg>',
    viz: [
      "WordPress, small businesses, blogs, content-heavy sites",
      "Shopify, e-commerce and online stores",
      "Webflow, design-focused brands and marketing sites",
      "Custom development, complex apps and unique features",
      "Responsive design as standard",
    ],
  },
];

function itemHtml(svc, i, total) {
  const n = String(i + 1).padStart(2, "0");
  const on = i === 0 ? " on" : "";
  const selected = i === 0 ? "true" : "false";
  const rows = svc.viz
    .map((t, k) => `    <li style="--k:${k}"><i></i>${t}</li>`)
    .join("\n");
  return `        <div class="tm-item${on}" data-i="${i}" role="tab" tabindex="0"
             aria-selected="${selected}">
          <span class="tm-bg" aria-hidden="true"><span class="tm-veil"></span></span>
          <span class="tm-slim" aria-hidden="true">
            <b class="tm-n">${n}</b>
            <span class="tm-vt">${svc.slim}</span>
          </span>
          <div class="tm-open">
            <div class="tm-card">
              <span class="tm-card-top"><span class="tm-ic">${svc.icon}</span><span class="tm-num">${n}</span></span>
              <h3>${svc.title}</h3>
              <p>${svc.lead}</p>
              <span class="tm-chip"><i></i>Service ${n} of ${String(total).padStart(2, "0")}</span>
            </div>
            <div class="tm-viz"><div class="tv tv-audit">
  <span class="tv-h">${svc.slim}</span>
  <ul class="tv-rows">
${rows}
  </ul>
</div></div>
          </div>
        </div>`;
}

const section = `<!-- ══════════════════════════════════════════════════════════════════
     WHAT WE DO — tm panels (GBP process design)
     ══════════════════════════════════════════════════════════════════ -->
<section class="sec tm" id="services-2" data-ground="tint">
  <div class="wrap">

    <div class="tm-head rv">
      <div>
        <h2>Tekcroft&rsquo;s Web Design <em>&amp; Development</em></h2>
      </div>
      <p class="ax-lede">As a full-service website development company, we build around your business needs, from a new business website to a complex e-commerce store. You work with one team across strategy, design, development, and launch, keeping the project consistent from the first discussion to the finished site.</p>
    </div>

    <div class="tm-rail" role="tablist" aria-label="Web design and development services" data-tm>
${SERVICES.map((s, i) => itemHtml(s, i, SERVICES.length)).join("\n")}
    </div>

    <div class="tm-cta rv"><a class="btn btn-primary" href="#contact"><span class="btn-label">Explore all services</span><span class="arw">&uarr;</span></a></div>

`;

/* ---- HTML: replace acv block, keep fw-foot ---- */
const bodyPath = path.join(ROOT, "lib", "web-design-and-development-body.html");
let body = fs.readFileSync(bodyPath, "utf8");
const idx = body.indexOf('id="services-2"');
let start = idx >= 0 ? body.lastIndexOf("<section", idx) : -1;
const comment = body.lastIndexOf("WHAT WE DO", start);
if (comment >= 0 && start - comment < 800) {
  start = body.lastIndexOf("<!--", comment);
}
const foot = body.indexOf('class="fw-foot wd-way', start);
if (start < 0 || foot < 0) {
  console.error("markers", { start, foot });
  process.exit(1);
}
const endSection = body.indexOf("</section>", foot);
if (endSection < 0) {
  console.error("no section end");
  process.exit(1);
}
const footBlock = body.slice(foot, endSection);
body =
  body.slice(0, start) +
  section +
  "    " +
  footBlock +
  "\n\n  </div>\n</section>\n\n" +
  body.slice(endSection + "</section>".length);
fs.writeFileSync(bodyPath, body);
console.log("Updated web-design-and-development-body.html");

/* ---- CSS: copy TM from GBP, retarget #gbp-process → #services-2 ---- */
const gbpCss = fs.readFileSync(
  path.join(ROOT, "app", "google-business-profile-optimization.css"),
  "utf8"
);
const tmStart = gbpCss.indexOf(
  "/* === tm-styles (GBP process panels — exact from tekcroft-gmb) === */"
);
const dcStart = gbpCss.indexOf("/* === dc-styles");
const lockStart = gbpCss.indexOf(
  "/* === tm layout lock (match Technical SEO model) — scoped to .tm / #gbp-process === */"
);
const altStart = gbpCss.indexOf("/* alternating section grounds");
if (tmStart < 0 || dcStart < 0 || lockStart < 0 || altStart < 0) {
  console.error("GBP tm css markers missing", { tmStart, dcStart, lockStart, altStart });
  process.exit(1);
}
let tmCss =
  gbpCss.slice(tmStart, dcStart).trimEnd() +
  "\n\n" +
  gbpCss.slice(lockStart, altStart).trimEnd();
tmCss = tmCss.replaceAll("#gbp-process", "#services-2");
tmCss += `
#services-2.tm{background:var(--ground) !important; border-block:0 !important;}
#services-2 .tm-bg{background:url("/images/cn-web-design.webp") center/cover no-repeat;}
#services-2 .tm-bg > img{position:absolute; inset:0; width:100%; height:100%; object-fit:cover; display:block;}
`;

const cssPath = path.join(ROOT, "app", "web-design-and-development.css");
let css = fs.readFileSync(cssPath, "utf8");
const lockMark = "/* === SITE CONSISTENCY LOCK";
let lockTail = "";
const lockI = css.indexOf(lockMark);
if (lockI >= 0) {
  lockTail = css.slice(lockI);
  css = css.slice(0, lockI).trimEnd();
}
const oldTm = css.indexOf("/* === tm-styles");
if (oldTm >= 0) css = css.slice(0, oldTm).trimEnd();
const oldWebTm = css.indexOf("/* === web-design tm");
if (oldWebTm >= 0) css = css.slice(0, oldWebTm).trimEnd();

css = css.trimEnd() + "\n\n/* === web-design tm (GBP process design) === */\n" + tmCss + "\n";
if (lockTail) css += "\n" + lockTail;
fs.writeFileSync(cssPath, css);
console.log("Updated web-design-and-development.css");

/* ---- JS: add tm-script ---- */
const gbpJs = fs.readFileSync(
  path.join(ROOT, "public", "tekcroft-google-business-profile-optimization.js"),
  "utf8"
);
const jsMark = "/* === tm-script (GBP process panels) === */";
const jsI = gbpJs.indexOf(jsMark);
if (jsI < 0) {
  console.error("tm-script missing from GBP js");
  process.exit(1);
}
const script = gbpJs.slice(jsI);

const jsPath = path.join(ROOT, "public", "tekcroft-web-design-and-development.js");
let js = fs.readFileSync(jsPath, "utf8");
const webMark = "/* === tm-script (web design services panels) === */";
const webI = js.indexOf(webMark);
if (webI >= 0) js = js.slice(0, webI).trimEnd() + "\n";
js =
  js.trimEnd() +
  "\n\n" +
  webMark +
  "\n" +
  script.replace(jsMark, "").trim() +
  "\n";
fs.writeFileSync(jsPath, js);
console.log("Updated tekcroft-web-design-and-development.js");

console.log("done");
