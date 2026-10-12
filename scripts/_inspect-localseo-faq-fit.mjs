import fs from "fs";
import path from "path";
import sharp from "sharp";

const base =
  "C:/Users/Super/Downloads/Local SEO-20261012T103632Z-1-001/Local SEO";

async function meta(p) {
  const m = await sharp(p).metadata();
  return `${m.width}x${m.height} ${(fs.statSync(p).size / 1024).toFixed(0)}KB`;
}

async function walk(d, depth = 0) {
  if (depth > 3) return;
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) {
      console.log("  ".repeat(depth) + "[D] " + e.name);
      await walk(p, depth + 1);
    } else if (/\.(jpe?g|png|webp)$/i.test(e.name)) {
      console.log("  ".repeat(depth) + "[F] " + e.name + " " + (await meta(p)));
    }
  }
}

await walk(path.join(base, "Behined the picture"));
await walk(path.join(base, "FAQ"));

const html = fs.readFileSync("lib/local-seo-body.html", "utf8");
console.log("\nhas localseo-faq", html.includes("localseo-faq"));
const faq = html.indexOf('id="faq"');
console.log(html.slice(faq, faq + 1200));
const fit = html.indexOf('id="fit"');
console.log("\n---fit---\n", html.slice(fit, fit + 800));

// live check
try {
  const t = await (
    await fetch("http://127.0.0.1:3000/services/local-seo-services")
  ).text();
  console.log("\nlive faq", t.includes("localseo-faq"));
  console.log("live vs-bg", /vs-bg|class=\"vs /.test(t));
} catch (e) {
  console.log("live fetch failed", e.message);
}
