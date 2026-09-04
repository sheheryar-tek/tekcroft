const BASE = "http://localhost:3000";
const assets = JSON.parse(
  await (await import("fs")).promises.readFile("lib/asset-manifest.json", "utf8")
);

const html = await (await fetch(BASE + "/")).text();
const checks = [
  ["boot markup", html.includes('id="boot"') && html.includes('id="bootLogo"')],
  ["nav logo", html.includes('class="logo" href="#top"')],
  ["logo-white preload", html.includes("/images/logo-white.webp")],
  ["main script ref", html.includes(assets.main)],
];

for (const [n, ok] of checks) console.log((ok ? "✓" : "✗") + " " + n);

const js = await (await fetch(BASE + assets.main)).text();
const jsChecks = [
  ["runBoot present", js.includes("function runBoot")],
  ["not force-skipped", !js.includes("never block LCP behind the boot curtain")],
  ["flying transform", js.includes('boot.classList.add("flying")')],
  ["place onto nav", js.includes("navLogo.getBoundingClientRect")],
  ["booting class", js.includes('classList.add("booting")')],
];
for (const [n, ok] of jsChecks) console.log((ok ? "✓" : "✗") + " " + n);

const logo = await fetch(BASE + "/images/logo-white.webp");
console.log((logo.ok ? "✓" : "✗") + " logo-white.webp " + logo.status);

const failed = [...checks, ...jsChecks].some(([, ok]) => !ok) || !logo.ok;
process.exit(failed ? 1 : 0);
