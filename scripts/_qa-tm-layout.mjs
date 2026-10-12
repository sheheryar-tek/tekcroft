/**
 * Headless-ish QA via fetch + cheerio-free DOM? We use Playwright if available,
 * else print HTML static checks. Prefer puppeteer-free: use node fetch + regex
 * on HTML, and live checks via CDP through a small script if chrome exists.
 *
 * This script does static HTML assertions + live CSS/layout via fetch of pages
 * when server is up — for live layout we spawn nothing; caller uses browser.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const PAGES = [
  { body: "lib/local-seo-body.html", id: "services-2", path: "/services/local-seo-services" },
  { body: "lib/technical-seo-body.html", id: "model", path: "/services/technical-seo-services" },
  { body: "lib/ai-seo-body.html", id: "model", path: "/services/ai-seo-services" },
  { body: "lib/franchise-seo-body.html", id: "franchise-covers", path: "/services/franchise-seo-services" },
  {
    body: "lib/google-business-profile-optimization-body.html",
    id: "gbp-process",
    path: "/services/google-business-profile-optimization",
  },
];

const issues = [];

for (const p of PAGES) {
  const html = fs.readFileSync(path.join(ROOT, p.body), "utf8");
  const re = /<section\b[^>]*\bclass="[^"]*\btm\b[^"]*"[^>]*>[\s\S]*?<\/section>/i;
  const m = html.match(re);
  if (!m) {
    issues.push(`${p.body}: no .tm section`);
    continue;
  }
  const s = m[0];
  const head = s.match(/<div class="tm-head[^"]*"[^>]*>[\s\S]*?<\/div>\s*(?=<div class="tm-rail")/i);
  if (!head) issues.push(`${p.body}: tm-head not closed before tm-rail`);
  else {
    if (/class="smark"/.test(head[0])) issues.push(`${p.body}: smark still in tm-head`);
    if (/class="btn/.test(head[0])) issues.push(`${p.body}: CTA still in tm-head`);
  }
  if (/tm-chip/.test(s)) issues.push(`${p.body}: tm-chip remains`);
  if (/Service\s+\d+\s+of\s+\d+/i.test(s)) issues.push(`${p.body}: Service X of Y text remains`);
  if (!/<div class="tm-cta/.test(s)) issues.push(`${p.body}: missing tm-cta`);
  if (!/<span class="btn-label">/.test(s)) issues.push(`${p.body}: missing btn-label`);
  // CTA should come after tm-rail
  const ctaIdx = s.indexOf('class="tm-cta');
  const railIdx = s.indexOf('class="tm-rail');
  if (ctaIdx < railIdx) issues.push(`${p.body}: tm-cta before tm-rail`);
  // aside gone
  if (/tm-aside/.test(s)) issues.push(`${p.body}: tm-aside remains`);
  if (/ax-cta/.test(s)) issues.push(`${p.body}: ax-cta remains`);
}

console.log(issues.length ? issues.join("\n") : "STATIC OK: all 5 tm sections pass structure checks");

// Live checks if server up
const widths = [1440, 1280, 1024, 768, 390];
const themes = ["light", "dark"];

async function live() {
  // Use playwright-core if present, else skip
  let chromium;
  try {
    ({ chromium } = await import("playwright"));
  } catch {
    try {
      ({ chromium } = await import("playwright-core"));
    } catch {
      console.log("LIVE SKIP: no playwright");
      return;
    }
  }
  const browser = await chromium.launch({ headless: true });
  const liveIssues = [];
  for (const p of PAGES) {
    for (const theme of themes) {
      for (const w of widths) {
        const page = await browser.newPage({ viewport: { width: w, height: 900 } });
        await page.goto(`http://localhost:3000${p.path}#${p.id}`, { waitUntil: "networkidle" });
        await page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
        await page.waitForTimeout(400);
        const res = await page.evaluate((id) => {
          const sec = document.getElementById(id);
          if (!sec) return { err: "missing section" };
          const head = sec.querySelector(".tm-head");
          const lede = sec.querySelector(".ax-lede");
          const cta = sec.querySelector(".tm-cta");
          const card = sec.querySelector(".tm-item.on .tm-card");
          const open = sec.querySelector(".tm-item.on .tm-open");
          const chip = sec.querySelector(".tm-chip");
          const smark = sec.querySelector(".tm-head .smark");
          const cs = (el) => (el ? getComputedStyle(el) : null);
          const l = cs(lede);
          const h = cs(head);
          const c = cs(card);
          const o = cs(open);
          const ct = cs(cta);
          return {
            smark: !!smark,
            chip: !!chip,
            ctaInHead: !!sec.querySelector(".tm-head .btn"),
            ledeBorder: l ? l.borderLeftWidth : null,
            headAlign: h ? h.alignItems : null,
            openAlign: o ? o.alignItems : null,
            cardAlign: c ? c.alignSelf : null,
            cardH: card ? +card.getBoundingClientRect().height.toFixed(1) : null,
            openH: open ? +open.getBoundingClientRect().height.toFixed(1) : null,
            ctaJustify: ct ? ct.justifyContent : null,
            btnFull: cta
              ? Math.abs(cta.querySelector(".btn").getBoundingClientRect().width - cta.getBoundingClientRect().width) < 4
              : null,
            ledeJustify: l ? l.justifySelf : null,
          };
        }, p.id);
        await page.close();
        if (res.err) liveIssues.push(`${p.path} ${theme}@${w}: ${res.err}`);
        if (res.smark) liveIssues.push(`${p.path} ${theme}@${w}: smark visible`);
        if (res.chip) liveIssues.push(`${p.path} ${theme}@${w}: chip present`);
        if (res.ctaInHead) liveIssues.push(`${p.path} ${theme}@${w}: CTA in head`);
        if (ledeExists(p) && res.ledeBorder && parseFloat(res.ledeBorder) < 1.5)
          liveIssues.push(`${p.path} ${theme}@${w}: weak lede border ${res.ledeBorder}`);
        if (res.ctaJustify !== "center")
          liveIssues.push(`${p.path} ${theme}@${w}: cta not centered (${res.ctaJustify})`);
        if (w > 980 && res.cardH && res.openH && res.cardH > res.openH * 0.95)
          liveIssues.push(`${p.path} ${theme}@${w}: card fills panel (${res.cardH}/${res.openH})`);
        if (w <= 600 && res.btnFull === false)
          liveIssues.push(`${p.path} ${theme}@${w}: btn not full width`);
        if (w <= 860 && ledeExists(p) && res.ledeJustify && res.ledeJustify !== "start")
          liveIssues.push(`${p.path} ${theme}@${w}: lede not start (${res.ledeJustify})`);
      }
    }
  }
  await browser.close();
  console.log(liveIssues.length ? liveIssues.join("\n") : "LIVE OK: all pages/widths/themes");
}

function ledeExists(p) {
  return p.id !== "franchise-covers";
}

live().catch((e) => {
  console.log("LIVE ERR", e.message);
});
