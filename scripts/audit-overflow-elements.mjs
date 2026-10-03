import { chromium } from "playwright";

const targets = [
  { route: "/services/technical-seo", width: 320 },
  { route: "/services/local-seo", width: 320 },
  { route: "/services/franchise-seo-services", width: 320 },
  { route: "/services/on-page-seo", width: 1024 },
];

const browser = await chromium.launch({ headless: true });

for (const t of targets) {
  const page = await browser.newPage({
    viewport: { width: t.width, height: 900 },
  });
  await page.goto(`http://localhost:3000${t.route}`, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  await page.waitForTimeout(600);
  const offenders = await page.evaluate(() => {
    const cw = document.documentElement.clientWidth;
    const out = [];
    for (const el of document.querySelectorAll("body *")) {
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) continue;
      if (r.right > cw + 1 || r.left < -1) {
        const tag = el.tagName.toLowerCase();
        const cls = (el.className && String(el.className).slice(0, 80)) || "";
        const id = el.id ? "#" + el.id : "";
        out.push({
          tag,
          id,
          cls,
          left: Math.round(r.left),
          right: Math.round(r.right),
          width: Math.round(r.width),
        });
      }
    }
    out.sort((a, b) => b.width - a.width);
    return out.slice(0, 12);
  });
  console.log("\n===", t.route, "@", t.width, "===");
  console.log(JSON.stringify(offenders, null, 2));
  await page.close();
}

await browser.close();
