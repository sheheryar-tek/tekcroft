import fs from "fs";

const bodyPath = "c:/Tekcroft/lib/homepage-body.html";
let body = fs.readFileSync(bodyPath, "utf8");

const card = (svg, name) =>
  `<div class="iy-card"><i>${svg}</i><b>${name}</b></div>`;

const svgs = {
  healthcare: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20s-7-4.6-7-9.4A4 4 0 0 1 12 8a4 4 0 0 1 7-1.4c0 4.8-7 13.4-7 13.4z"/></svg>`,
  home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11 12 4l9 7"/><path d="M6 10v10h12V10"/><path d="M10 20v-5h4v5"/></svg>`,
  cleaning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 8h6v12H9z"/><path d="M11 8V5h4"/><path d="M18 6h.01M20 9h.01M18 12h.01"/></svg>`,
  saas: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 18h9a4 4 0 0 0 .6-8A6 6 0 0 0 5 11a3.5 3.5 0 0 0 2 7z"/></svg>`,
  ecom: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/><path d="M3 4h2l2.4 11h10l2-7H6"/></svg>`,
  construction: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h16"/><path d="M6 20V6l12 3"/><path d="M12 9v5"/><path d="M9 14h6v6H9z"/></svg>`,
  contractors: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.6 6.4a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.7-3.7a6 6 0 0 1-7.9 7.9L6.7 20.3a2.1 2.1 0 0 1-3-3l6.7-6.7a6 6 0 0 1 7.9-7.9z"/></svg>`,
  trade: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20 14 10"/><path d="M15 4.5 19.5 9 16 12.5 11.5 8z"/><path d="M4 20h3v-3"/></svg>`,
  joinery: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 15h13l5-5"/><path d="M3 15v4h13v-4"/><path d="M6 15v-3l2 1.5L10 12v3"/></svg>`,
  pro: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="2.5"/><path d="M9 7V5h6v2"/><path d="M3 12h18"/></svg>`,
  interiors: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12V9a2 2 0 0 1 4 0v3M16 12V9a2 2 0 0 1 4 0v3"/><path d="M4 12h16v5H4z"/><path d="M6 17v2M18 17v2"/></svg>`,
  agencies: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 10v4h4l6 4V6l-6 4z"/><path d="M18 9a4 4 0 0 1 0 6"/></svg>`,
  tech: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="2"/><path d="M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4"/></svg>`,
  crm: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="9" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><path d="M16 6.5a3 3 0 0 1 0 5.6M17 19a5.5 5.5 0 0 0-2-4.3"/></svg>`,
  analytics: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20V4M4 20h16"/><path d="M8 16v-4M12 16V8M16 16v-6"/></svg>`,
  local: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/></svg>`,
  franchise: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="5" r="2.4"/><circle cx="5" cy="19" r="2.4"/><circle cx="19" cy="19" r="2.4"/><path d="M12 7.4 6.6 16.8M12 7.4l5.4 9.4M7.4 19h9.2"/></svg>`,
  b2b: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="8" width="8" height="12" rx="1.6"/><rect x="13" y="4" width="8" height="16" rx="1.6"/><path d="M6 12h2M6 16h2M16 8h2M16 12h2M16 16h2"/></svg>`,
  startups: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3c3.5 2 5.5 5.5 5.5 9L12 18l-5.5-6c0-3.5 2-7 5.5-9z"/><circle cx="12" cy="10" r="2"/><path d="M9 18l-2 3M15 18l2 3"/></svg>`,
};

function lane(dir, dur, items) {
  const once = items.map(([k, n]) => card(svgs[k], n)).join("");
  return `          <div class="iy-lane ${dir}" style="--dur:${dur}">
            <div class="iy-track">${once}${once}</div>
          </div>`;
}

const fixed = `<!-- ══════════ INDUSTRIES · variant 4 (the columns) ══════════
     PLACEHOLDER COPY: heading, line and call are stand-ins. -->
<section class="sec iy" id="industries-v4" data-ind-variant="4">
  <div class="wrap">
    <div class="iy-grid">

      <div class="iy-say rv">
        <span class="smark"><b>Industries</b></span>
        <h2>Nineteen industries, <em>one blueprint</em></h2>
        <p>Tailored digital marketing strategies for every industry we serve. Different
          industries, different challenges, one growth-focused approach.</p>
        <div class="iy-meta">
          <span class="iy-count"><b>19</b><i>sectors served</i></span>
          <a class="btn btn-primary" href="#contact">Book a Free Strategy Call <span class="arw">&uarr;</span></a>
        </div>
      </div>

      <div class="iy-board rv" style="--d:120ms">
        <div class="iy-lanes">
${lane("up", "22s", [
  ["healthcare", "Healthcare"],
  ["home", "Home Services"],
  ["cleaning", "Cleaning Services"],
  ["saas", "SaaS"],
  ["ecom", "E-commerce"],
])}
${lane("down", "26s", [
  ["construction", "Construction"],
  ["contractors", "Contractors"],
  ["trade", "Trade Services"],
  ["joinery", "Joinery"],
  ["pro", "Professional Services"],
])}
${lane("up", "30s", [
  ["interiors", "Interior Design / Interiors"],
  ["agencies", "Marketing Agencies"],
  ["tech", "Technology / Software"],
  ["crm", "CRM / Business Software"],
  ["analytics", "Analytics"],
])}
${lane("down", "34s", [
  ["local", "Local Service Businesses"],
  ["franchise", "Franchise / Multi-location Businesses"],
  ["b2b", "B2B Businesses"],
  ["startups", "Startups"],
])}
        </div>
      </div>

    </div>
  </div>
</section>
`;

const start = body.indexOf('<!-- ══════════ INDUSTRIES · variant 4');
const end = body.indexOf('<section class="sec wk" id="work">');
if (start < 0 || end < 0) throw new Error("markers missing " + start + " " + end);
body = body.slice(0, start) + fixed + "\n\n" + body.slice(end);
fs.writeFileSync(bodyPath, body);
console.log("industries-v4 repaired", fixed.length);
