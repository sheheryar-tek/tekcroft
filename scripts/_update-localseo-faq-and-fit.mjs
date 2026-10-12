import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE =
  "C:/Users/Super/Downloads/Local SEO-20261012T103632Z-1-001/Local SEO";
const OUT = path.join(ROOT, "public", "images");
const BODY = path.join(ROOT, "lib", "local-seo-body.html");
const CSS = path.join(ROOT, "app", "local-seo.css");
const MAX = 80 * 1024;

async function encode(srcPath, { width, height, prefix }) {
  const buf = fs.readFileSync(srcPath);
  let w = width;
  let q = 82;
  let out;
  let meta;
  for (;;) {
    let pipeline = sharp(buf, { failOn: "none" }).rotate();
    pipeline = height
      ? pipeline.resize({ width: w, height, fit: "cover", position: "centre" })
      : pipeline.resize({ width: w, withoutEnlargement: true });
    out = await pipeline
      .webp({ quality: q, effort: 6, smartSubsample: true })
      .toBuffer();
    meta = await sharp(out).metadata();
    if (out.length <= MAX) break;
    if (q > 55) q -= 6;
    else if (w > 700) {
      w -= 80;
      q = 78;
    } else if (q > 40) q -= 5;
    else break;
  }
  const hash = crypto.createHash("sha1").update(out).digest("hex").slice(0, 10);
  const name = `${prefix}-${hash}.webp`;
  for (const f of fs.readdirSync(OUT)) {
    if (new RegExp(`^${prefix}-[a-f0-9]+\\.webp$`, "i").test(f) && f !== name) {
      fs.unlinkSync(path.join(OUT, f));
      console.log("deleted", f);
    }
  }
  fs.writeFileSync(path.join(OUT, name), out);
  return {
    file: `/images/${name}`,
    kb: +(out.length / 1024).toFixed(1),
    q,
    w: meta.width,
    h: meta.height,
  };
}

const faq = await encode(path.join(BASE, "FAQ", "Mobile", "2.jpg"), {
  width: 900,
  prefix: "localseo-faq",
});
console.log("faq", faq);

const fit = await encode(path.join(BASE, "Behined the picture", "4.jpg"), {
  width: 1920,
  height: 1080,
  prefix: "localseo-vs",
});
console.log("fit", fit);

let html = fs.readFileSync(BODY, "utf8");

const faqAlt = "Local SEO Services FAQs";
const faqPics = `        <span class="faq-pics" aria-hidden="true">
          <span class="faq-pic"><img src="${faq.file}" width="${faq.w}" height="${faq.h}" alt="${faqAlt}" title="${faqAlt}" decoding="async" loading="lazy"></span>
        </span>`;
html = html.replace(
  /<span class="faq-pics" aria-hidden="true">[\s\S]*?<\/span>\s*(?=<span class="faq-aside-eyebrow")/,
  faqPics + "\n        "
);

const fitAlt = "TekCroft Vs Local SEO Agency Vs DIY";
const vsBg = `  <div class="vs-bg" aria-hidden="true"><img src="${fit.file}" width="${fit.w}" height="${fit.h}" alt="${fitAlt}" title="${fitAlt}" decoding="async" loading="lazy"></div>\n`;

if (/class="vs-bg"/.test(html)) {
  html = html.replace(
    /<div class="vs-bg" aria-hidden="true">[\s\S]*?<\/div>\s*/,
    vsBg
  );
} else {
  html = html.replace(
    /(<section class="sec vs" id="fit"[^>]*>)\s*/,
    `$1\n${vsBg}`
  );
}

fs.writeFileSync(BODY, html);
console.log("updated body");

let css = fs.readFileSync(CSS, "utf8");

// Keep FAQ CSS token pointed at the live file
css = css.replace(
  /:root\{\s*--faq-shot:url\("\/images\/localseo-faq-[a-f0-9]+\.webp"\);\s*\}\n?/,
  ""
);
css = `:root{ --faq-shot:url("${faq.file}"); }\n` + css;

if (!css.includes("#faq .faq-pic > img")) {
  throw new Error("expected #faq .faq-pic > img rules already present");
}

const vsBlock = `
/* Know the difference — section photo (not shared --shot-3) */
#fit.vs::before{content:none !important; background:none !important;}
#fit.vs > .vs-bg{
  position:absolute; inset:0; z-index:0; pointer-events:none; overflow:hidden;}
#fit.vs > .vs-bg img{
  position:absolute; inset:0; width:100%; height:100%;
  object-fit:cover; object-position:center; display:block;}
#fit.vs::after{z-index:1;}
#fit.vs > .wrap{position:relative; z-index:2;}
`;

if (css.includes("#fit.vs > .vs-bg img")) {
  css = css.replace(
    /\/\* Know the difference — section photo[\s\S]*?#fit\.vs > \.wrap\{position:relative; z-index:2;\}\n?/,
    vsBlock.trimStart()
  );
} else {
  const mq =
    "@media (max-width:900px), (hover:none){\n  .vs::before{background-attachment:scroll;}\n}";
  const i = css.indexOf(mq);
  if (i >= 0) css = css.slice(0, i + mq.length) + "\n" + vsBlock + css.slice(i + mq.length);
  else css += "\n" + vsBlock;
}

fs.writeFileSync(CSS, css);
console.log("updated css");

fs.writeFileSync(
  path.join(ROOT, "scripts", "_localseo-faq-fit-map.json"),
  JSON.stringify({ faq, fit }, null, 2) + "\n"
);
console.log("done");
