import fs from "fs";
import path from "path";

const ROOT = "c:/Tekcroft";
const EXT = path.join(ROOT, "scripts/_extracted-onpage-deliverables");
const bodyPath = path.join(ROOT, "lib/on-page-seo-body.html");
const cssPath = path.join(ROOT, "app/on-page-seo.css");
const jsPath = path.join(ROOT, "public/tekcroft-on-page-seo.js");

/* ── 1. photo out of the data-URI ─────────────────────────────────────── */
const v6cssRaw = fs.readFileSync(path.join(EXT, "v6-styles.css"), "utf8");
const photoMatch = v6cssRaw.match(
  /url\("data:image\/jpeg;base64,([A-Za-z0-9+/=]+)"\)/
);
if (!photoMatch) throw new Error("photo data-uri missing");
const photoPath = path.join(ROOT, "public/images/onpage-deliverables-panel.jpg");
fs.writeFileSync(photoPath, Buffer.from(photoMatch[1], "base64"));
console.log("photo", fs.statSync(photoPath).size, "bytes");

let v6css = v6cssRaw
  .replace(
    /url\("data:image\/jpeg;base64,[A-Za-z0-9+/=]+"\)/,
    'url("/images/onpage-deliverables-panel.jpg")'
  )
  .replace(/#services-2-v6/g, "#services-2");

/* ── 2. HTML: promote v6 → #services-2 ────────────────────────────────── */
let html = fs.readFileSync(path.join(EXT, "v6.html"), "utf8");
html = html
  .replace(
    "<!-- ══════════ DELIVERABLES · variant 6 (panels on a photo) ══════════ -->",
    "<!-- ============================================================ ON-PAGE SEO DELIVERABLES -->"
  )
  .replace(
    '<section class="sec acv" id="services-2-v6" data-dv-variant="6">',
    '<section class="sec acv" id="services-2">'
  );

let body = fs.readFileSync(bodyPath, "utf8");
const oldStart = body.indexOf(
  "<!-- ══════════════════════════════════════════════════════════════════\n     WHAT WE DO, variant 02"
);
const oldStartAlt = body.indexOf('<section class="sec svc-cn" id="services-2">');
const start = oldStart >= 0 ? oldStart : oldStartAlt;
if (start < 0) throw new Error("old services-2 start missing");

const tag = body.indexOf('<section class="sec svc-cn" id="services-2">', start);
if (tag < 0) throw new Error("old services-2 tag missing");
let i = tag;
let depth = 0;
let end = -1;
while (i < body.length) {
  if (body.startsWith("<section", i)) {
    depth++;
    i = body.indexOf(">", i) + 1;
    continue;
  }
  if (body.startsWith("</section>", i)) {
    depth--;
    i += "</section>".length;
    if (depth === 0) {
      end = i;
      break;
    }
    continue;
  }
  i++;
}
if (end < 0) throw new Error("old services-2 unclosed");

body = body.slice(0, start) + html.trim() + "\n\n" + body.slice(end);
fs.writeFileSync(bodyPath, body);
console.log("body: swapped services-2 → panels v6");

/* ── 3. CSS bundle (order matches the reference file) ─────────────────── */
const cssFiles = [
  "ac-styles.css",
  "ac-brand.css",
  "ac-viz.css",
  "ac-tint.css",
  "ac-card-viz.css",
  "ac-viz2.css",
  "vz-map-fix.css",
  "vz-link-fix.css",
  "vz-room.css",
  "ac-polish.css",
  "ac-clear.css",
  "vz-tree.css",
  "vz-bigger.css",
  "vz-align.css",
  "vz-url-fix.css",
  "vz-audit2.css",
  "vz-audit3.css",
  "vz-audit4.css",
  "vz-audit5.css",
];

const marker = "/* === ON-PAGE DELIVERABLES PANELS (from ref v6) === */";
let siteCss = fs.readFileSync(cssPath, "utf8");
const cut = siteCss.indexOf(marker);
if (cut >= 0) siteCss = siteCss.slice(0, cut).replace(/\s+$/, "") + "\n";

let bundle = "\n\n" + marker + "\n";
for (const f of cssFiles) {
  const p = path.join(EXT, f);
  if (!fs.existsSync(p)) {
    console.warn("skip missing", f);
    continue;
  }
  bundle += `\n/* --- ${f} --- */\n` + fs.readFileSync(p, "utf8") + "\n";
}
bundle += `\n/* --- v6 photo panel (scoped to #services-2) --- */\n` + v6css + "\n";

/* Ground: keep deliverables on tint lane if page alternates; section itself
   from ac-styles uses --surface which matches the screenshot. */
bundle += `
/* promote section id ground + strip leftover console borders */
#services-2.acv{background:var(--surface); border-block:0;}
`;

siteCss += bundle;
fs.writeFileSync(cssPath, siteCss);
console.log("css: appended panels bundle");

/* ── 4. JS: keep cn-script (harmless if no console) + add ac-script ───── */
let js = fs.readFileSync(jsPath, "utf8");
const jsMarker = "/* === ac-script (deliverables panels) === */";
if (js.includes(jsMarker)) {
  js = js.slice(0, js.indexOf(jsMarker)).replace(/\s+$/, "") + "\n";
}
const acJs = fs.readFileSync(path.join(EXT, "ac-script.js"), "utf8");
js += "\n\n" + jsMarker + "\n" + acJs.trim() + "\n";
fs.writeFileSync(jsPath, js);
console.log("js: appended ac-script");

/* ── verify ───────────────────────────────────────────────────────────── */
const check = fs.readFileSync(bodyPath, "utf8");
if (!check.includes('id="services-2"') || !check.includes('data-acc')) {
  throw new Error("new section missing");
}
if (check.includes("svc-cn") && check.includes('id="services-2"')) {
  const snip = check.slice(
    check.indexOf('id="services-2"') - 40,
    check.indexOf('id="services-2"') + 80
  );
  if (snip.includes("svc-cn")) throw new Error("old console still on #services-2");
}
if (check.includes("services-2-v6")) console.warn("STILL: services-2-v6");
console.log("done");
