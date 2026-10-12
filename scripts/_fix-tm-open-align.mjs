import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const FILES = [
  ["app/local-seo.css", "services-2"],
  ["app/ai-seo.css", "model"],
  ["app/franchise-seo.css", "franchise-covers"],
  ["app/google-business-profile-optimization.css", "gbp-process"],
  ["app/technical-seo.css", "model"],
];

for (const [rel, id] of FILES) {
  const fp = path.join(ROOT, rel);
  let css = fs.readFileSync(fp, "utf8");
  let changes = 0;

  // Desktop tm-fill: stretch -> center (line that is NOT indented inside a media query)
  const reFill = new RegExp(
    `(^|\\n)/\\* === tm-fill === \\*/[\\s\\S]*?#${id} \\.tm-open\\{align-items:stretch;\\}`,
    "m"
  );
  if (reFill.test(css)) {
    css = css.replace(
      reFill,
      (m) => m.replace(`#${id} .tm-open{align-items:stretch;}`, `#${id} .tm-open{align-items:center;}`)
    );
    changes++;
  } else {
    // fallback: first non-indented occurrence before layout lock
    const marker = `/* === tm layout lock`;
    const cut = css.indexOf(marker);
    const head = cut >= 0 ? css.slice(0, cut) : css;
    const tail = cut >= 0 ? css.slice(cut) : "";
    const needle = `#${id} .tm-open{align-items:stretch;}`;
    if (head.includes(needle)) {
      css =
        head.replace(needle, `#${id} .tm-open{align-items:center;}`) + tail;
      changes++;
    }
  }

  // Lock block: center !important on desktop; stretch !important only ≤980
  const lockCenter = `#${id} .tm-open{align-items:center;}`;
  const lockCenterImp = `#${id} .tm-open{align-items:center !important;}`;
  if (css.includes(lockCenter) && !css.includes(lockCenterImp)) {
    // replace only the lock occurrence (last one before card height rule)
    const idx = css.lastIndexOf(lockCenter);
    css = css.slice(0, idx) + lockCenterImp + css.slice(idx + lockCenter.length);
    changes++;
  }

  const lockStretch = `  #${id} .tm-open{align-items:stretch;}`;
  const lockStretchImp = `  #${id} .tm-open{align-items:stretch !important;}`;
  if (css.includes(lockStretch) && !css.includes(lockStretchImp)) {
    const idx = css.lastIndexOf(lockStretch);
    css = css.slice(0, idx) + lockStretchImp + css.slice(idx + lockStretch.length);
    changes++;
  }

  fs.writeFileSync(fp, css);
  console.log(rel, "changes", changes);
}
