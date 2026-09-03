/**
 * Live performance smoke audit against localhost:3000
 */
const BASE = process.env.BASE || "http://localhost:3000";

async function timed(url) {
  const t0 = performance.now();
  const res = await fetch(url);
  const buf = Buffer.from(await res.arrayBuffer());
  const ms = performance.now() - t0;
  return { url, status: res.status, bytes: buf.length, ms, buf, headers: res.headers };
}

async function main() {
  const issues = [];
  const html = await timed(BASE + "/");
  console.log(`HTML ${html.status} ${(html.bytes / 1024).toFixed(1)}KB in ${html.ms.toFixed(0)}ms`);
  if (html.status !== 200) issues.push("Home not 200");
  const text = html.buf.toString("utf8");

  // Critical markers
  for (const needle of [
    'src="/images/hero-1.webp"',
    'fetchpriority="high"',
    'href="/images/hero-1.webp"',
    "tekcroft-root",
    'data-theme="light"',
  ]) {
    const ok = text.includes(needle);
    console.log((ok ? "✓" : "✗") + " " + needle);
    if (!ok) issues.push("missing " + needle);
  }

  // Collect asset URLs
  const cssHrefs = [...text.matchAll(/href="(\/_next\/static\/[^"]+\.css)"/g)].map((m) => m[1]);
  const imgSrcs = [...text.matchAll(/(?:src|href)="(\/images\/[^"]+\.webp)"/g)].map((m) => m[1]);
  const uniqueImgs = [...new Set(imgSrcs)];
  console.log(`CSS chunks: ${cssHrefs.length}, inline webp refs: ${uniqueImgs.length}`);

  for (const href of cssHrefs) {
    const r = await timed(BASE + href);
    console.log(`CSS ${r.status} ${(r.bytes / 1024).toFixed(0)}KB ${r.ms.toFixed(0)}ms ${href.slice(-40)}`);
    if (r.status !== 200) issues.push("css fail " + href);
  }

  // Hero + logo preload
  for (const p of ["/images/hero-1.webp", "/images/logo-white.webp", "/tekcroft-main.js", "/tekcroft-mm.js"]) {
    const r = await timed(BASE + p);
    const cache = r.headers.get("cache-control") || "";
    console.log(
      `${r.status} ${(r.bytes / 1024).toFixed(1)}KB ${r.ms.toFixed(0)}ms cache=${cache.slice(0, 40)} ${p}`
    );
    if (r.status !== 200) issues.push("asset fail " + p);
    if (p.endsWith(".webp") && r.bytes > 100 * 1024) issues.push("webp >100KB " + p);
  }

  // Spot-check a few more images from CSS by fetching known files
  const sample = [
    "/images/cta-shot-2.webp",
    "/images/cn-shot.webp",
    "/images/faq-shot.webp",
    "/images/cs-4.webp",
    "/images/mm-team.webp",
  ];
  for (const p of sample) {
    const r = await timed(BASE + p);
    if (r.status !== 200) issues.push("broken " + p);
    if (r.bytes > 100 * 1024) issues.push(">100KB " + p);
  }

  // No raster data URIs in HTML response
  const dataRaster = (text.match(/data:image\/(jpeg|jpg|png|gif|webp)/gi) || []).length;
  console.log("raster data-uris in HTML:", dataRaster);
  if (dataRaster) issues.push("data-uri still in HTML");

  console.log("\n=== RESULT ===");
  if (issues.length) {
    console.log("ISSUES:");
    issues.forEach((i) => console.log(" -", i));
    process.exit(1);
  }
  console.log("All checks passed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
