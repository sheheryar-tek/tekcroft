import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const map = JSON.parse(
  fs.readFileSync(path.join(ROOT, "scripts", "_aiseo-tm-image-map.json"), "utf8")
);

const bodyPath = path.join(ROOT, "lib", "ai-seo-body.html");
let html = fs.readFileSync(bodyPath, "utf8");

for (const p of map) {
  const esc = p.alt
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
  const img = `<img src="${p.file}" width="${p.width}" height="${p.height}" alt="${esc}" title="${esc}" decoding="async" loading="lazy">`;
  // replace the Nth empty tm-bg inside #model section only — search within model section
  // Match empty tm-bg for data-i="N"
  const re = new RegExp(
    `(<div class="tm-item[^"]*"[^>]*data-i="${p.i}"[^>]*>\\s*)<span class="tm-bg" aria-hidden="true"><span class="tm-veil"></span></span>`,
    "i"
  );
  if (!re.test(html)) {
    throw new Error("tm-bg not found for data-i=" + p.i);
  }
  html = html.replace(
    re,
    `$1<span class="tm-bg" aria-hidden="true">${img}<span class="tm-veil"></span></span>`
  );
}
fs.writeFileSync(bodyPath, html);

const cssPath = path.join(ROOT, "app", "ai-seo.css");
let css = fs.readFileSync(cssPath, "utf8");

const oldBg = `.tm-bg{position:absolute; inset:0; opacity:0; transition:opacity .55s var(--ease) .05s;
  background:url("/images/aiseo-css1-78c6234db0.webp") center/cover no-repeat;}
.tm-item.on .tm-bg{opacity:1;}
.tm-veil{position:absolute; inset:0; background:rgba(0,0,0,.78);}`;

const perPanel = map
  .map(
    (p) =>
      `#model .tm-item[data-i="${p.i}"] .tm-bg{background-image:none;}`
  )
  .join("\n");

const newBg = `.tm-bg{position:absolute; inset:0; opacity:0; transition:opacity .55s var(--ease) .05s;
  background-color:#0A0C0E; background-position:center; background-size:cover; background-repeat:no-repeat;}
#model .tm-bg > img{position:absolute; inset:0; width:100%; height:100%; object-fit:cover; display:block;}
${perPanel}
.tm-item.on .tm-bg{opacity:1;}
.tm-veil{position:absolute; inset:0; background:rgba(0,0,0,.78); z-index:1;}`;

if (!css.includes(oldBg)) {
  // fallback: replace the background url line only
  if (!css.includes('aiseo-css1-78c6234db0.webp')) {
    throw new Error("old tm-bg css block not found");
  }
  css = css.replace(
    /background:url\("\/images\/aiseo-css1-78c6234db0\.webp"\) center\/cover no-repeat;/,
    "background-color:#0A0C0E; background-position:center; background-size:cover; background-repeat:no-repeat;"
  );
  if (!css.includes("#model .tm-bg > img")) {
    css = css.replace(
      ".tm-item.on .tm-bg{opacity:1;}\n.tm-veil{position:absolute; inset:0; background:rgba(0,0,0,.78);}",
      `#model .tm-bg > img{position:absolute; inset:0; width:100%; height:100%; object-fit:cover; display:block;}\n.tm-item.on .tm-bg{opacity:1;}\n.tm-veil{position:absolute; inset:0; background:rgba(0,0,0,.78); z-index:1;}`
    );
  }
} else {
  css = css.replace(oldBg, newBg);
}

fs.writeFileSync(cssPath, css);

// delete unused shared panel bg if nothing else references it
const old = path.join(ROOT, "public", "images", "aiseo-css1-78c6234db0.webp");
const site = [
  "lib",
  "app",
  "public",
]
  .map((d) => path.join(ROOT, d))
  .flatMap((d) => {
    const out = [];
    const walk = (p) => {
      for (const ent of fs.readdirSync(p, { withFileTypes: true })) {
        const fp = path.join(p, ent.name);
        if (ent.isDirectory()) {
          if (ent.name === "node_modules" || ent.name === ".next") continue;
          walk(fp);
        } else if (/\.(html|css|js|json|mjs|tsx|ts)$/i.test(ent.name)) {
          out.push(fp);
        }
      }
    };
    walk(d);
    return out;
  });

const stillUsed = site.some((fp) => {
  const t = fs.readFileSync(fp, "utf8");
  return t.includes("aiseo-css1-78c6234db0.webp");
});
if (!stillUsed && fs.existsSync(old)) {
  fs.unlinkSync(old);
  console.log("deleted unused aiseo-css1-78c6234db0.webp");
} else {
  console.log("keep aiseo-css1, stillUsed=", stillUsed);
}

console.log("HTML+CSS updated for", map.length, "panels");
