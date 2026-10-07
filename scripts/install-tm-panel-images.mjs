import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";

const ROOT =
  "C:/Users/Super/Downloads/Technical SEO-20261006T130644Z-1-001/Technical SEO/Services";
const OUT = "public/images";

/** Panel order matches #model data-i */
const PANELS = [
  { i: 0, folder: "Technical SEO Audit", slug: "audit" },
  { i: 1, folder: "Crawlability Budget Optimization", slug: "crawl" },
  { i: 2, folder: "Core Web Vitals Optimization Services", slug: "cwv" },
  { i: 3, folder: "Schema Markup Implementation Services", slug: "schema" },
  { i: 4, folder: "JavaScript SEO", slug: "js" },
  { i: 5, folder: "Canonicalization & Duplicate Content", slug: "canon" },
  { i: 6, folder: "Mobile Optimization", slug: "mobile" },
  { i: 7, folder: "Website Migration SEO Services", slug: "mig" },
  { i: 8, folder: "Log File Analysis", slug: "log" },
  { i: 9, folder: "Ongoing Monitoring & Governance", slug: "mon" },
  { i: 10, folder: "Technical SEO for AILLM Crawlability", slug: "ai" },
];

function pickSource(dir) {
  const files = fs.readdirSync(dir);
  const one = files.find((f) => /^1\.(jpe?g|png|webp)$/i.test(f));
  if (one) return path.join(dir, one);
  const any = files.find((f) => /\.(jpe?g|png|webp)$/i.test(f));
  if (!any) throw new Error("no image in " + dir);
  return path.join(dir, any);
}

async function toWebp(src) {
  const buf = fs.readFileSync(src);
  let img = sharp(buf, { failOn: "none" }).rotate().resize({
    width: 1400,
    withoutEnlargement: true,
  });
  let out;
  for (let q = 78; q >= 55; q -= 4) {
    out = await img.clone().webp({ quality: q, effort: 6 }).toBuffer();
    if (out.length < 110 * 1024) break;
  }
  return out;
}

const results = [];
for (const p of PANELS) {
  const dir = path.join(ROOT, p.folder);
  const src = pickSource(dir);
  const webp = await toWebp(src);
  const h = crypto.createHash("sha256").update(webp).digest("hex").slice(0, 10);
  const name = `tm-${p.slug}-${h}.webp`;
  fs.writeFileSync(path.join(OUT, name), webp);
  results.push({ ...p, file: `/images/${name}`, kb: (webp.length / 1024).toFixed(1), src });
  console.log(p.i, p.slug, "->", name, results.at(-1).kb + "kb");
}

const cssRules = results
  .map(
    (r) =>
      `#model .tm-item[data-i="${r.i}"] .tm-bg{background-image:url("${r.file}");}`
  )
  .join("\n");

fs.writeFileSync(
  "scripts/.tmp-tm-panel-bgs.css",
  `/* per-panel backgrounds — one image each */\n${cssRules}\n`
);
fs.writeFileSync("scripts/.tmp-tm-panel-map.json", JSON.stringify(results, null, 2));
console.log("wrote CSS rules for", results.length, "panels");
