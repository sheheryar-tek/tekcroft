import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC =
  "C:/Users/Super/Downloads/seo-audit-why-choose-section (1).html";
const t = fs.readFileSync(SRC, "utf8");

function sliceBetween(startRe, endRe) {
  const sm = t.match(startRe);
  if (!sm) throw new Error("start not found: " + startRe);
  const start = sm.index;
  const after = t.slice(start);
  const em = after.match(endRe);
  if (!em) throw new Error("end not found: " + endRe);
  return after.slice(0, em.index + em[0].length);
}

let styleBlock = sliceBetween(/<style id="wa-styles">/, /<\/style>/);
let scriptBlock = sliceBetween(/<script id="wa-script">/, /<\/script>/);
let section = sliceBetween(
  /<section class="sec wy wa" id="whyus"/,
  /<\/section>/
);

// Extract photo from <img src="data:image/...;base64,...">
const imgM = section.match(
  /src="data:image\/(jpeg|jpg|png|webp);base64,([A-Za-z0-9+/=]+)"/
);
if (!imgM) throw new Error("base64 photo not found in section");
const photoBuf = Buffer.from(imgM[2], "base64");
const photoExt = imgM[1] === "jpeg" ? "jpg" : imgM[1];
const photoHash = crypto.createHash("sha1").update(photoBuf).digest("hex").slice(0, 10);
const imgDir = path.join(ROOT, "public", "images", "seo-audit");
fs.mkdirSync(imgDir, { recursive: true });
const photoName = `seo-audit-why-strategist-${photoHash}.${photoExt}`;
const photoRel = `/images/seo-audit/${photoName}`;
fs.writeFileSync(path.join(imgDir, photoName), photoBuf);
console.log("photo", photoRel, photoBuf.length);

section = section.replace(imgM[0], `src="${photoRel}"`);

// Unique ids/classes to avoid clash with leftover #why / #whyus / .wy-* on this page
section = section
  .replace(
    /<section class="sec wy wa" id="whyus"/,
    '<section class="sec audit-why" id="audit-why" data-ground="white"'
  )
  .replace(/id="wa-title"/g, 'id="audit-why-title"')
  .replace(/aria-labelledby="wa-title"/g, 'aria-labelledby="audit-why-title"')
  .replace(/\bwy-head\b/g, "awy-head")
  .replace(/\bwy-tabs\b/g, "awy-tabs")
  .replace(/\bwy-tab\b/g, "awy-tab")
  .replace(/\bwy-stage\b/g, "awy-stage")
  .replace(/\bwy-pane\b/g, "awy-pane")
  .replace(/\bwy-copy\b/g, "awy-copy")
  .replace(/\bwy-ic\b/g, "awy-ic")
  .replace(/\bwa-intro\b/g, "awy-intro")
  .replace(/\bwa-stats\b/g, "awy-stats")
  .replace(/\bwa-st\b/g, "awy-st")
  .replace(/\bwa-art\b/g, "awy-art");

// Strip style/script wrappers → raw CSS / JS
let css = styleBlock
  .replace(/^<style id="wa-styles">\s*/, "")
  .replace(/\s*<\/style>$/, "");
let js = scriptBlock
  .replace(/^<script id="wa-script">\s*/, "")
  .replace(/\s*<\/script>$/, "");

// Rewrite selectors for unique root + class names
function rewriteCss(raw) {
  let s = raw;
  // Drop unused #why.wy surface rule — section uses #audit-why
  s = s.replace(/#why\.wy\{[^}]+\}/g, "");
  // Root
  s = s.replace(/#whyus\.wa/g, "#audit-why");
  s = s.replace(/#whyus/g, "#audit-why");
  // Class renames (order matters — longer first)
  const map = [
    ["wy-head", "awy-head"],
    ["wy-tabs", "awy-tabs"],
    ["wy-tab", "awy-tab"],
    ["wy-stage", "awy-stage"],
    ["wy-pane", "awy-pane"],
    ["wy-copy", "awy-copy"],
    ["wy-ic", "awy-ic"],
    ["wy-proof", "awy-proof"],
    ["wy-row", "awy-row"],
    ["wy-ph", "awy-ph"],
    ["wa-intro", "awy-intro"],
    ["wa-stats", "awy-stats"],
    ["wa-st", "awy-st"],
    ["wa-art", "awy-art"],
  ];
  for (const [from, to] of map) {
    s = s.replace(new RegExp(`\\.${from}\\b`, "g"), `.${to}`);
  }
  // Scope unscoped selectors under #audit-why (except html[data-theme] and @ rules / keyframes)
  const lines = s.split("\n");
  const out = [];
  for (let line of lines) {
    const trimmed = line.trim();
    if (
      !trimmed ||
      trimmed.startsWith("/*") ||
      trimmed.startsWith("*") ||
      trimmed.startsWith("*/") ||
      trimmed.startsWith("@") ||
      trimmed.startsWith("}") ||
      trimmed.startsWith("from") ||
      trimmed.startsWith("to") ||
      trimmed.startsWith("50%") ||
      trimmed.includes("#audit-why")
    ) {
      // Still scope html[data-theme] rules that target our classes
      if (trimmed.startsWith("html[data-theme") && !trimmed.includes("#audit-why")) {
        line = line.replace(
          /html\[data-theme="dark"\]\s+/g,
          'html[data-theme="dark"] #audit-why '
        );
      }
      out.push(line);
      continue;
    }
    // Keyframe bodies
    if (/^[\d.]+%/.test(trimmed)) {
      out.push(line);
      continue;
    }
    // Selector lines — prefix each comma-separated selector
    if (trimmed.includes("{") || /,$/.test(trimmed) || /^[.#\[a-zA-Z*]/.test(trimmed)) {
      const brace = line.indexOf("{");
      const selectorPart = brace >= 0 ? line.slice(0, brace) : line;
      const rest = brace >= 0 ? line.slice(brace) : "";
      const scoped = selectorPart
        .split(",")
        .map((sel) => {
          const s2 = sel.trim();
          if (!s2) return s2;
          if (s2.startsWith("#audit-why")) return s2;
          if (s2.startsWith("html[")) return s2;
          return `#audit-why ${s2}`;
        })
        .join(", ");
      out.push(
        (line.match(/^\s*/) || [""])[0] +
          scoped +
          (rest ? (selectorPart.endsWith(" ") ? " " : " ") + rest.trimStart() : "")
      );
      continue;
    }
    out.push(line);
  }
  s = out.join("\n");

  // Adjacent #vs is tint (#DAEEF6) → this section white in light mode
  s = s.replace(
    /#audit-why\{padding-block:clamp\(56px,5\.6vw,90px\); background:#DAEEF6 !important; text-transform:none;\}/,
    "#audit-why{padding-block:clamp(56px,5.6vw,90px); background:#FFFFFF !important; text-transform:none;}"
  );

  // Ensure dark rule remains
  if (!s.includes('html[data-theme="dark"] #audit-why{background:var(--bg-alt)')) {
    s =
      `#audit-why{padding-block:clamp(56px,5.6vw,90px); background:#FFFFFF !important; text-transform:none;}\n` +
      `html[data-theme="dark"] #audit-why{background:var(--bg-alt) !important;}\n` +
      s;
  }

  return s;
}

css = rewriteCss(css);

js = js
  .replace(/getElementById\('whyus'\)/, "getElementById('audit-why')")
  .replace(/\.wy-tab\b/g, ".awy-tab")
  .replace(/\.wy-pane\b/g, ".awy-pane")
  .replace(/\.wy-stage\b/g, ".awy-stage");

const cssOut = `\n/* ── Why Businesses Choose TekCroft (SEO Audit) — scoped #audit-why ── */\n${css}\n`;
const jsOut = `\n/* === audit-why tabs (seo-audit-services) === */\n${js}\n`;

// Insert section into body after #services-2
const bodyPath = path.join(ROOT, "lib", "seo-audit-services-body.html");
let body = fs.readFileSync(bodyPath, "utf8");
if (body.includes('id="audit-why"') || body.includes('id="whyus"')) {
  // Remove any prior why-choose block
  body = body.replace(
    /<!-- WHY CHOOSE[\s\S]*?<section class="sec[^"]*" id="(?:audit-why|whyus)"[\s\S]*?<\/section>\s*/i,
    ""
  );
  body = body.replace(
    /<section class="sec[^"]*" id="(?:audit-why|whyus)"[\s\S]*?<\/section>\s*/i,
    ""
  );
}

const marker = "</section>\n\n<!-- â•â•";
const servicesEnd = body.indexOf('id="services-2"');
if (servicesEnd < 0) throw new Error("services-2 not found");
const afterServices = body.indexOf("</section>", servicesEnd);
if (afterServices < 0) throw new Error("services-2 close not found");
const insertAt = afterServices + "</section>".length;

const block = `\n\n<!-- WHY CHOOSE — Why Businesses Choose TekCroft for SEO Audits (scoped #audit-why) -->\n${section}\n`;

body = body.slice(0, insertAt) + block + body.slice(insertAt);
fs.writeFileSync(bodyPath, body);
console.log("body inserted at", insertAt);

// Append CSS
const cssPath = path.join(ROOT, "app", "seo-audit-services.css");
let pageCss = fs.readFileSync(cssPath, "utf8");
const cssMarker = "/* ── Why Businesses Choose TekCroft (SEO Audit) — scoped #audit-why ── */";
if (pageCss.includes(cssMarker)) {
  pageCss = pageCss.replace(
    /\/\* ── Why Businesses Choose TekCroft \(SEO Audit\) — scoped #audit-why ── \*\/[\s\S]*$/,
    cssOut.trimStart()
  );
} else {
  pageCss = pageCss.replace(/\s*$/, "\n" + cssOut);
}
fs.writeFileSync(cssPath, pageCss);
console.log("css appended");

// Append JS
const jsPath = path.join(ROOT, "public", "tekcroft-seo-audit-services.js");
let pageJs = fs.readFileSync(jsPath, "utf8");
const jsMarker = "/* === audit-why tabs (seo-audit-services) === */";
if (pageJs.includes(jsMarker)) {
  pageJs = pageJs.replace(
    /\/\* === audit-why tabs \(seo-audit-services\) === \*\/[\s\S]*$/,
    jsOut.trimStart()
  );
} else {
  pageJs = pageJs.replace(/\s*$/, "\n" + jsOut);
}
fs.writeFileSync(jsPath, pageJs);
console.log("js appended");

// Re-hash only seo-audit JS
const buf = fs.readFileSync(jsPath);
const h = crypto.createHash("sha1").update(buf).digest("hex").slice(0, 10);
const hashed = `tekcroft-seo-audit-services.${h}.js`;
fs.writeFileSync(path.join(ROOT, "public", hashed), buf);
for (const f of fs.readdirSync(path.join(ROOT, "public"))) {
  if (
    f.startsWith("tekcroft-seo-audit-services.") &&
    f.endsWith(".js") &&
    f !== hashed &&
    f !== "tekcroft-seo-audit-services.js"
  ) {
    fs.unlinkSync(path.join(ROOT, "public", f));
  }
}
const manifestPath = path.join(ROOT, "lib", "asset-manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
manifest.seoAuditServices = "/" + hashed;
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log("manifest", manifest.seoAuditServices);

// Save debug copies
const dbg = path.join(ROOT, "scripts", "_extracted-seo-audit-why");
fs.mkdirSync(dbg, { recursive: true });
fs.writeFileSync(path.join(dbg, "ported-section.html"), section);
fs.writeFileSync(path.join(dbg, "ported.css"), css);
fs.writeFileSync(path.join(dbg, "ported.js"), js);
console.log("done");
