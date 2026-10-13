import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const wdd = fs.readFileSync(
  path.join(ROOT, "app", "web-design-and-development.css"),
  "utf8"
);
const start = wdd.indexOf("/* === web-design tm (GBP process design) === */");
const end = wdd.indexOf("/* === SITE CONSISTENCY LOCK");
if (start < 0 || end < 0) throw new Error("WDD tm markers missing");

let tm = wdd.slice(start, end).trimEnd();
tm = tm.replace(
  "/* === web-design tm (GBP process design) === */",
  "/* === mobile-app tm (GBP process design) === */"
);
tm = tm.replaceAll(
  'url("/images/cn-web-design.webp")',
  'url("/images/mad-hero-38f0d58787.webp")'
);

const cssPath = path.join(ROOT, "app", "mobile-app-development.css");
let css = fs.readFileSync(cssPath, "utf8");
const lockMark = "/* === SITE CONSISTENCY LOCK";
let lockTail = "";
const lockI = css.indexOf(lockMark);
if (lockI >= 0) {
  lockTail = css.slice(lockI);
  css = css.slice(0, lockI).trimEnd();
}
const old = css.indexOf("/* === mobile-app tm");
if (old >= 0) css = css.slice(0, old).trimEnd();
css = css.trimEnd() + "\n\n" + tm + "\n";
if (lockTail) css += "\n" + lockTail;
fs.writeFileSync(cssPath, css);
console.log("css ok", tm.length);

const gbpJs = fs.readFileSync(
  path.join(ROOT, "public", "tekcroft-google-business-profile-optimization.js"),
  "utf8"
);
const jsMark = "/* === tm-script (GBP process panels) === */";
const jsI = gbpJs.indexOf(jsMark);
if (jsI < 0) throw new Error("no tm-script");
const script = gbpJs.slice(jsI);

const jsPath = path.join(ROOT, "public", "tekcroft-mobile-app-development.js");
let js = fs.readFileSync(jsPath, "utf8");
const madMark = "/* === tm-script (mobile app services panels) === */";
const madI = js.indexOf(madMark);
if (madI >= 0) js = js.slice(0, madI).trimEnd() + "\n";
js =
  js.trimEnd() +
  "\n\n" +
  madMark +
  "\n" +
  script.replace(jsMark, "").trim() +
  "\n";
fs.writeFileSync(jsPath, js);
console.log("js ok");
