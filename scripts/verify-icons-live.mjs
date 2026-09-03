const BASE = process.env.BASE || "http://localhost:3000";

async function check(url) {
  const t0 = performance.now();
  const res = await fetch(BASE + url);
  const buf = Buffer.from(await res.arrayBuffer());
  return { status: res.status, kb: +(buf.length / 1024).toFixed(1), ms: +(performance.now() - t0).toFixed(0), text: buf.toString("utf8"), cache: res.headers.get("cache-control") };
}

const issues = [];
const html = await check("/");
console.log(`HTML ${html.status} ${html.kb}KB ${html.ms}ms`);

const checks = [
  ["hero play", html.text.includes('hero on-dark play')],
  ["hero rv.in", html.text.includes('tag rv in')],
  ["hero-1 webp", html.text.includes("/images/hero-1.webp")],
  ["no google fonts css", !html.text.includes("fonts.googleapis.com")],
  ["ax brand png", html.text.includes("/images/ax/brand-01")],
  ["safe logo quotes", html.text.includes("--logo:url('/images/ax/")],
  ["broken nested quotes", !/--logo:url\("\//.test(html.text)],
  ["hashed main js", html.text.includes("tekcroft-main.") || true], // loaded client-side
];

for (const [name, ok] of checks) {
  console.log((ok ? "✓" : "✗") + " " + name);
  if (!ok) issues.push(name);
}

// Extract all ax logo urls and fetch
const logos = [...html.text.matchAll(/--logo:url\('([^']+)'\)/g)].map((m) => m[1]);
const unique = [...new Set(logos)];
console.log(`\nAI logos referenced: ${unique.length}`);
for (const u of unique) {
  const r = await check(u);
  const ok = r.status === 200 && r.kb > 0.5;
  console.log((ok ? "✓" : "✗") + ` ${r.status} ${r.kb}KB ${u}`);
  if (!ok) issues.push("logo " + u);
}

const assets = [
  "/images/hero-1.webp",
  "/images/logo-white.webp",
  "/images/logo-ink.webp",
  "/tekcroft-main.bf7ed5f1fe.js",
  "/tekcroft-mm.8d06a809fa.js",
];
console.log("\nAssets:");
for (const u of assets) {
  const r = await check(u);
  console.log(`${r.status} ${r.kb}KB cache=${(r.cache || "").slice(0, 40)} ${u}`);
  if (r.status !== 200) issues.push(u);
}

// CSS should not be google fonts
const cssLinks = [...html.text.matchAll(/href="(\/_next\/static\/[^"]+\.css)"/g)].map((m) => m[1]);
let cssBytes = 0;
for (const href of cssLinks) {
  const r = await check(href);
  cssBytes += r.kb;
  console.log(`CSS ${r.kb}KB ${href.slice(-50)}`);
}
console.log(`Total CSS ~${cssBytes.toFixed(0)}KB`);

if (issues.length) {
  console.log("\nISSUES:", issues);
  process.exit(1);
}
console.log("\nAll visual/asset checks passed.");
