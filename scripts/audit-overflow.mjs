import { chromium } from "playwright";

const routes = [
  "/",
  "/blog",
  "/contact",
  "/services/ecommerce-seo",
  "/services/seo-audit-services",
  "/services/on-page-seo",
  "/services/technical-seo",
  "/services/ai-seo-services",
  "/services/local-seo",
  "/services/google-business-profile-optimization",
  "/services/franchise-seo-services",
  "/services/web-design-and-development-services",
  "/services/software-development-services",
  "/services/mobile-app-development",
  "/services/ai-chatbot-development-services",
  "/services/ai-agent-development-services",
];

const widths = [320, 375, 414, 768, 1024, 1440];

const browser = await chromium.launch({ headless: true });
const issues = [];

for (const width of widths) {
  const page = await browser.newPage({
    viewport: { width, height: 900 },
  });
  for (const route of routes) {
    await page.goto(`http://localhost:3000${route}`, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    await page.waitForTimeout(400);
    const overflow = await page.evaluate(() => {
      const doc = document.documentElement;
      const body = document.body;
      const sw = Math.max(doc.scrollWidth, body.scrollWidth);
      const cw = doc.clientWidth;
      return { sw, cw, overflow: sw > cw + 1 };
    });
    if (overflow.overflow) {
      issues.push({ route, width, scrollWidth: overflow.sw, clientWidth: overflow.cw });
    }
  }
  await page.close();
}

await browser.close();
console.log(JSON.stringify({ issueCount: issues.length, issues }, null, 2));
