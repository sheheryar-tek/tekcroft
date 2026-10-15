import fs from "fs";
import path from "path";

const files = [
  path.join(process.env.USERPROFILE, "Downloads", "tekcroft-local-seo (4).html"),
  path.join(process.env.USERPROFILE, "Downloads", "tekcroft-local-seo.html"),
  path.join(
    process.env.USERPROFILE,
    "Downloads",
    "Google Business Profile SEO Section - Desktop – 1440.html"
  ),
];

// also search for gbp html variants
const dl = path.join(process.env.USERPROFILE, "Downloads");
for (const name of fs.readdirSync(dl)) {
  if (/gbp|google.?business|business.?profile/i.test(name) && /\.html?$/i.test(name)) {
    files.push(path.join(dl, name));
  }
}

for (const p of [...new Set(files)]) {
  if (!fs.existsSync(p)) {
    console.log("MISSING", p);
    continue;
  }
  const html = fs.readFileSync(p, "utf8");
  console.log("\n====", path.basename(p), "bytes", html.length);
  const fit = html.search(/id=["']fit["']/);
  console.log("fit idx", fit);
  if (fit >= 0) console.log(html.slice(fit, fit + 450));

  const vsBg = [...html.matchAll(/\.vs-bg[^{]*\{[^}]+\}/g)].map((m) => m[0]);
  console.log("vs-bg rules:", vsBg);
  const vsBgImg = [...html.matchAll(/\.vs-bg\s+img[^{]*\{[^}]+\}/g)].map((m) => m[0]);
  console.log("vs-bg img:", vsBgImg);
  const before = [...html.matchAll(/\.vs::before\{[^}]+\}/g)].map((m) => m[0]);
  console.log("vs::before:", before);
  const fitBlock = [...html.matchAll(/#fit\{[^}]{0,400}\}/g)].map((m) => m[0]);
  console.log("#fit{}:", fitBlock.slice(0, 8));
  const shot = [...html.matchAll(/--shot-3:[^;]+;/g)].map((m) => m[0]);
  console.log("--shot-3:", [...new Set(shot)].slice(0, 10));
}
