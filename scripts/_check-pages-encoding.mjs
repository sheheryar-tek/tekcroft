const pages = [
  "/franchise-seo-services",
  "/ai-seo-services",
  "/on-page-seo-services",
  "/technical-seo-services",
  "/local-seo-services",
  "/web-design-and-development-services",
  "/custom-software-development-services",
];

const FFFD = "\uFFFD";

for (const p of pages) {
  const r = await fetch("http://localhost:3000" + p);
  const t = await r.text();
  const bad = [...t].filter((c) => c === FFFD).length;
  const moji =
    (t.includes("\u00E2\u20AC") ? 1 : 0) + // starts like â€…
    (t.includes("\u00C2 ") ? 1 : 0) +
    (t.includes("\u00C3\u00A9") ? 1 : 0);
  const charset = /charset=["']?utf-8/i.test(t);
  const franchiseOk =
    p !== "/franchise-seo-services" ||
    /units don['\u2019]t recognize there['\u2019]s a problem/.test(t);
  console.log(
    `${p} status=${r.status} fffd=${bad} moji=${moji} charset=${charset} franchiseOk=${franchiseOk}`
  );
}
