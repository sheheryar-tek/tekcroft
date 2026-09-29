/**
 * Replace local-seo #services-2 console with Technical SEO Model
 * panel design (tm), six local services, exact copy.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const ICONS = {
  gbp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9.2"/><path d="M3.6 12h16.8"/><path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z"/></svg>',
  cite: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 4.6h10.4v14.8H9z"/><path d="M4.6 7.2h10.4v14.8H4.6z"/></svg>',
  page: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M8.5 12.5h7M8.5 16h4"/></svg>',
  link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 1 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 11 18.7l1-1"/></svg>',
  review: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.2 14.6 9l6.6.4-5.1 4.2 1.7 6.4L12 16.4 6.2 20l1.7-6.4L2.8 9.4 9.4 9Z"/></svg>',
  ai: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.2c.8 4.4 3.2 6.8 7.6 7.6-4.4.8-6.8 3.2-7.6 7.6-.8-4.4-3.2-6.8-7.6-7.6 4.4-.8 6.8-3.2 7.6-7.6Z"/></svg>',
};

const SERVICES = [
  {
    title: "Google Business Profile Optimization",
    lead: "Your GBP gets more ranking power than your website in most local searches. We optimize your category selection, include all the services you provide in the list, and keep your posts and Q&amp;A sections active to clearly communicate what you do.",
    icon: "gbp",
    vizTitle: "GBP checklist",
    viz: ["Primary category", "Services list", "Posts kept live", "Q&amp;A active"],
  },
  {
    title: "Local Citation Building &amp; NAP Consistency",
    lead: "Just one mismatched address or phone number can silently ruin your rankings on all major platforms. We&rsquo;ll audit and update your information in 40+ relevant directories and make sure it stays updated no matter what.",
    icon: "cite",
    vizTitle: "NAP audit",
    viz: ["Name match", "Address match", "Phone match", "40+ directories"],
  },
  {
    title: "Local On-Page SEO &amp; Schema Markup",
    lead: "Search engines and AI tools require knowledge of your service area. We create service-area-specific web pages, include search intent-specific titles and meta descriptions, and use LocalBusiness schema to make the data machine-readable.",
    icon: "page",
    vizTitle: "On-page signals",
    viz: ["Service-area pages", "Intent titles", "Meta descriptions", "LocalBusiness schema"],
  },
  {
    title: "Local Link Building (White-Hat Only)",
    lead: "A few contextual and local links beat a hundred scattered links any day. We contact local publications, industry organizations, and partner companies for links that make contextual sense.",
    icon: "link",
    vizTitle: "Link targets",
    viz: ["Local publications", "Industry orgs", "Partner companies", "Contextual only"],
  },
  {
    title: "Review Generation &amp; Management",
    lead: "We set up an easy and automated request system following every job. We assist you in responding to both five-star reviews and frustrated one-star reviews in a way that builds trust with whoever sees it afterward.",
    icon: "review",
    vizTitle: "Review flow",
    viz: ["Auto requests", "Five-star replies", "One-star replies", "Trust signals"],
  },
  {
    title: "AI Search &amp; Answer Engine Visibility",
    lead: "ChatGPT &amp; Google AI Overview rely on the same signals as traditional search results: accurate listing, consistent citations, and answering real questions through content. We design for this from the very start, not as something added later.",
    icon: "ai",
    vizTitle: "AI signals",
    viz: ["Accurate listing", "Consistent citations", "Q&amp;A content", "Built in from day one"],
  },
];

function itemHtml(svc, i, total) {
  const n = String(i + 1).padStart(2, "0");
  const on = i === 0 ? " on" : "";
  const selected = i === 0 ? "true" : "false";
  const ico = ICONS[svc.icon];
  const rows = svc.viz
    .map((t, k) => `    <li style="--k:${k}"><i></i>${t}</li>`)
    .join("\n");
  return `        <div class="tm-item${on}" data-i="${i}" role="tab" tabindex="0"
             aria-selected="${selected}">
          <span class="tm-bg" aria-hidden="true"><span class="tm-veil"></span></span>
          <span class="tm-slim" aria-hidden="true">
            <b class="tm-n">${n}</b>
            <span class="tm-vt">${svc.title}</span>
          </span>
          <div class="tm-open">
            <div class="tm-card">
              <span class="tm-card-top"><span class="tm-ic">${ico}</span><span class="tm-num">${n}</span></span>
              <h3>${svc.title}</h3>
              <p>${svc.lead}</p>
              <span class="tm-chip"><i></i>Service ${n} of ${String(total).padStart(2, "0")}</span>
            </div>
            <div class="tm-viz"><div class="tv tv-audit">
  <span class="tv-h">${svc.vizTitle}</span>
  <ul class="tv-rows">
${rows}
  </ul>
</div></div>
          </div>
        </div>`;
}

const section = `<!-- ══════════════════════════════════════════════════════════════════
     EVERYTHING WE DO TO GET YOU RANKED — tm panel design (6 services)
     ══════════════════════════════════════════════════════════════════ -->
<section class="sec tm" id="services-2">
  <div class="wrap">

    <div class="tm-head rv">
      <div>
        <span class="smark"><b>What we do</b></span>
        <h2>Everything We Do <em>To Get You Ranked</em></h2>
      </div>
      <div class="tm-aside">
        <div>
          <p>Our local SEO services are divided into six specific, trackable pieces of work, each tied to a ranking factor Google actually measures, not just a task that appears good on paper.</p>
          <p>See exactly which of these six your business is currently missing.</p>
        </div>
        <a class="btn btn-primary" href="#contact">Get My Free Local Visibility Audit <span class="arw">&uarr;</span></a>
      </div>
    </div>

    <div class="tm-rail" role="tablist" aria-label="Local SEO services" data-tm>
${SERVICES.map((s, i) => itemHtml(s, i, SERVICES.length)).join("\n")}
    </div>

  </div>
</section>`;

/* ---- HTML ---- */
const bodyPath = path.join(ROOT, "lib", "local-seo-body.html");
let body = fs.readFileSync(bodyPath, "utf8");
const idx = body.indexOf('id="services-2"');
let start = idx >= 0 ? body.lastIndexOf("<section", idx) : -1;
const comment = body.lastIndexOf("WHAT WE DO", start);
if (comment >= 0 && start - comment < 600) {
  start = body.lastIndexOf("<!--", comment);
}
const next = body.indexOf('id="industries"');
const end = next >= 0 ? body.lastIndexOf("<section", next) : -1;
const endComment = next >= 0 ? body.lastIndexOf("<!--", next) : -1;
const cutEnd = endComment >= 0 && endComment < next ? endComment : end;
if (start < 0 || cutEnd < 0) {
  console.error("markers", start, cutEnd);
  process.exit(1);
}
body = body.slice(0, start) + section + "\n\n" + body.slice(cutEnd);
fs.writeFileSync(bodyPath, body);
console.log("Updated local-seo-body.html");

/* ---- CSS: copy tm blocks from technical-seo, retarget #model → #services-2 ---- */
const techCss = fs.readFileSync(path.join(ROOT, "app", "technical-seo.css"), "utf8");
const tmStart = techCss.indexOf("/* === tm-styles === */");
const tmGround = techCss.indexOf("/* === technical-seo model ground === */");
if (tmStart < 0 || tmGround < 0) {
  console.error("tm css not found in technical-seo.css");
  process.exit(1);
}
let tmCss = techCss.slice(tmStart, tmGround);
tmCss = tmCss.replaceAll("#model", "#services-2");
// Allow two paragraphs in aside
tmCss += `
#services-2 .tm-aside{align-items:flex-end;}
#services-2 .tm-aside > div{display:grid; gap:10px; max-width:46ch;}
#services-2 .tm-aside > div p{max-width:none;}
#services-2.tm{background:var(--ground) !important; border-block:0 !important;}
`;

const cssPath = path.join(ROOT, "app", "local-seo.css");
let css = fs.readFileSync(cssPath, "utf8");
const lockMark = "/* === SITE CONSISTENCY LOCK";
let lockTail = "";
const lockI = css.indexOf(lockMark);
if (lockI >= 0) {
  lockTail = css.slice(lockI);
  css = css.slice(0, lockI).trimEnd();
}
const oldTm = css.indexOf("/* === tm-styles === */");
if (oldTm >= 0) css = css.slice(0, oldTm).trimEnd();

css = css.trimEnd() + "\n\n" + tmCss + "\n";
if (lockTail) css += "\n" + lockTail;
fs.writeFileSync(cssPath, css);
console.log("Updated local-seo.css");

/* ---- JS ---- */
const techJs = fs.readFileSync(path.join(ROOT, "public", "tekcroft-technical-seo.js"), "utf8");
const jsMark = "/* === tm-script (Our Technical SEO Model) === */";
const jsI = techJs.indexOf(jsMark);
if (jsI < 0) {
  console.error("tm-script missing from technical js");
  process.exit(1);
}
const script = techJs.slice(jsI);

const jsPath = path.join(ROOT, "public", "tekcroft-local-seo.js");
let js = fs.readFileSync(jsPath, "utf8");
const localMark = "/* === tm-script (local SEO model panels) === */";
const localI = js.indexOf(localMark);
if (localI >= 0) js = js.slice(0, localI).trimEnd() + "\n";
// Also strip old console script if it only targets services-2 cn - leave other console alone
js = js.trimEnd() + "\n\n" + localMark + "\n" + script.replace(jsMark, "").trim() + "\n";
fs.writeFileSync(jsPath, js);
console.log("Updated tekcroft-local-seo.js");
