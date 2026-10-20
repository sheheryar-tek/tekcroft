const html = await (
  await fetch("http://127.0.0.1:3010/services/local-seo-services")
).text();
const sheets = [
  ...html.matchAll(/href="(\/_next\/static\/chunks\/[^"]+\.css)"/g),
].map((m) => m[1]);
for (const s of sheets) {
  const css = await (await fetch("http://127.0.0.1:3010" + s)).text();
  if (!/hs-copy|opacity\s*:\s*0|#hero-1/.test(css)) continue;
  console.log("FILE", s, (css.length / 1024).toFixed(1) + "KB");
  for (const h of css.matchAll(/.{0,50}hs-copy.{0,100}/g)) {
    console.log(" ", h[0].replace(/\s+/g, " ").slice(0, 160));
  }
}
