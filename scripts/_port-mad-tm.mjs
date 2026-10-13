/**
 * Convert mobile-app #services-2 from ACV to TM (GBP/WDD What-we-do design).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const SERVICES = [
  {
    slim: "Roadmap & Design",
    title: "Roadmap &amp; User Flows",
    lead: "We shape the roadmap first, as product and user flows. From there, our designers turn those requirements into wireframes and prototypes you can react to before development begins.",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20l4.2-1 10.3-10.3a2.1 2.1 0 0 0-3-3L5.2 16 4 20z"/><path d="M13.8 7.2l3 3M4 20h16"/></svg>',
    viz: [
      "Product and user flows first",
      "Roadmap shaped before code",
      "Wireframes you can react to",
      "Prototypes before development",
      "Requirements locked in early",
    ],
  },
  {
    slim: "Native & Cross-Platform",
    title: "Native &amp; Cross-Platform Development",
    lead: "When the product calls for it, we build natively in Swift or Kotlin. For products where getting to both platforms quickly matters more, Flutter and React Native give us another route.",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="7" y="2.5" width="10" height="19" rx="2.4"/><path d="M10.5 5h3M10.5 19h3"/></svg>',
    viz: [
      "Native Swift for iOS",
      "Native Kotlin for Android",
      "Flutter when speed to both stores matters",
      "React Native as another shared route",
      "Platform choice matched to the product",
    ],
  },
  {
    slim: "Backend & Integrations",
    title: "Infrastructure &amp; APIs",
    lead: "Behind the app, we handle the less visible pieces too: backend architecture, databases, APIs, payment systems, CRMs, ERPs, analytics integrations, etc.",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><ellipse cx="12" cy="6" rx="7.5" ry="3"/><path d="M4.5 6v4c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V6"/><path d="M4.5 10v4c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-4"/><path d="M4.5 14v4c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-4"/></svg>',
    viz: [
      "Backend architecture",
      "Databases and APIs",
      "Payment systems",
      "CRM and ERP connections",
      "Analytics integrations",
    ],
  },
  {
    slim: "Testing & Submission",
    title: "Testing &amp; Store Submission",
    lead: "Testing happens on real devices as well as through automated checks. Once everything is ready, we handle the App Store and Google Play submission process.",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l7.5 3v5.4c0 4.6-3.2 8.3-7.5 9.6-4.3-1.3-7.5-5-7.5-9.6V6z"/><path d="M8.6 12.2l2.4 2.4 4.4-4.8"/></svg>',
    viz: [
      "Testing on real devices",
      "Automated checks",
      "App Store submission",
      "Google Play submission",
      "Ready before you ship",
    ],
  },
  {
    slim: "Post-Launch Support",
    title: "Post-Launch Support",
    lead: "Launch isn&rsquo;t the finish line for us. OS updates, security patches, monitoring, or further feature work can all stay within the same team.",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 11a8 8 0 0 0-14.6-4.4L4 8M4 3.5V8h4.5M4 13a8 8 0 0 0 14.6 4.4L20 16M20 20.5V16h-4.5"/></svg>',
    viz: [
      "OS updates",
      "Security patches",
      "Ongoing monitoring",
      "Further feature work",
      "Same team after launch",
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
     WHAT WE DO — tm panels (match other service pages)
     ══════════════════════════════════════════════════════════════════ -->
<section class="sec tm" id="services-2" data-ground="tint">
  <div class="wrap">

    <div class="tm-head rv">
      <div>
        <h2>Mobile App Development: <em>From First Sketch to Long-Term Support</em></h2>
      </div>
      <p class="ax-lede">Your app doesn&rsquo;t start with code. It starts with figuring out what actually needs to be built.</p>
    </div>

    <div class="tm-rail" role="tablist" aria-label="Mobile app development services" data-tm>
${SERVICES.map((s, i) => itemHtml(s, i, SERVICES.length)).join("\n")}
    </div>

    <div class="tm-cta rv"><a class="btn btn-primary" href="#contact"><span class="btn-label">Explore all services</span><span class="arw">&uarr;</span></a></div>

  </div>
</section>
`;

const bodyPath = path.join(ROOT, "lib", "mobile-app-development-body.html");
let body = fs.readFileSync(bodyPath, "utf8");
const idx = body.indexOf('id="services-2"');
let start = idx >= 0 ? body.lastIndexOf("<section", idx) : -1;
const comment = body.lastIndexOf("WHAT WE DO", start);
if (comment >= 0 && start - comment < 800) {
  start = body.lastIndexOf("<!--", comment);
}
const endSection = body.indexOf("</section>", start);
if (start < 0 || endSection < 0) {
  console.error("markers", { start, endSection });
  process.exit(1);
}
body =
  body.slice(0, start) +
  section +
  "\n\n" +
  body.slice(endSection + "</section>".length);
fs.writeFileSync(bodyPath, body);
console.log("Updated mobile-app-development-body.html");

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
  console.error("GBP tm css markers missing", {
    tmStart,
    dcStart,
    lockStart,
    altStart,
  });
  process.exit(1);
}
let tmCss =
  gbpCss.slice(tmStart, dcStart).trimEnd() +
  "\n\n" +
  gbpCss.slice(lockStart, altStart).trimEnd();
tmCss = tmCss.replaceAll("#gbp-process", "#services-2");
tmCss += `
#services-2.tm{background:var(--ground) !important; border-block:0 !important;}
#services-2 .tm-bg{background:url("/images/mad-hero-38f0d58787.webp") center/cover no-repeat;}
#services-2 .tm-bg > img{position:absolute; inset:0; width:100%; height:100%; object-fit:cover; display:block;}
`;

const cssPath = path.join(ROOT, "app", "mobile-app-development.css");
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
const oldMadTm = css.indexOf("/* === mobile-app tm");
if (oldMadTm >= 0) css = css.slice(0, oldMadTm).trimEnd();

css =
  css.trimEnd() +
  "\n\n/* === mobile-app tm (GBP process design) === */\n" +
  tmCss +
  "\n";
if (lockTail) css += "\n" + lockTail;
fs.writeFileSync(cssPath, css);
console.log("Updated mobile-app-development.css");

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

const jsPath = path.join(ROOT, "public", "tekcroft-mobile-app-development.js");
let js = fs.readFileSync(jsPath, "utf8");
const madMark = "/* === tm-script (mobile app services panels) === */";
const madI = js.indexOf(madMark);
if (madI >= 0) js = js.slice(0, madI).trimEnd() + "\n";
js =
  js.trimEnd() +
  "\n\n" +
  madMark +
  "\n" +
  script.replace(jsMark, "").trim() +
  "\n";
fs.writeFileSync(jsPath, js);
console.log("Updated tekcroft-mobile-app-development.js");

console.log("done");
