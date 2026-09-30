/**
 * Restore CSS wiped by covers port (everything after first tm-styles through
 * rhythm-app), keep franchise-covers tm, drop old acv What-we-do.
 * Remap #duplicate-v2 → #duplicate to match live body id.
 */
import fs from "fs";
import { execSync } from "child_process";

const head = execSync("git show HEAD:app/franchise-seo.css", {
  encoding: "utf8",
  maxBuffer: 50 * 1024 * 1024,
});
const cur = fs.readFileSync("app/franchise-seo.css", "utf8");

const restoreStart = head.indexOf("/* === st-vs === */");
const typeScale = head.indexOf("/* === type-scale lock === */");
const acvMark = head.indexOf(
  "/* === Franchise acv What-we-do (ported from ecommerce-seo) === */"
);
const lockMark = "/* === SITE CONSISTENCY LOCK";
const headLock = head.indexOf(lockMark);

// Restore st-vs … rhythm-app (before type-scale / acv)
let restoreEnd = typeScale >= 0 ? typeScale : acvMark >= 0 ? acvMark : headLock;
if (restoreStart < 0 || restoreEnd < 0) {
  console.error("restore markers missing", { restoreStart, restoreEnd });
  process.exit(1);
}

let restored = head.slice(restoreStart, restoreEnd).trimEnd();
restored = restored.replaceAll("#duplicate-v2", "#duplicate");
// Page grounds: services-2 → franchise-covers where still present
restored = restored.replaceAll("#services-2", "#franchise-covers");

// Pull current covers tm block (everything from first new tm-styles to lock)
const curTm = cur.indexOf("/* === tm-styles === */");
const curLock = cur.indexOf(lockMark);
if (curTm < 0 || curLock < 0) {
  console.error("current markers missing", { curTm, curLock });
  process.exit(1);
}

// Prefix = current file before tm-styles (already truncated at old tm)
const prefix = cur.slice(0, curTm).trimEnd();
const coversTm = cur.slice(curTm, curLock).trimEnd();

// Fresh lock from site-consistency.css
const cons = fs.readFileSync("app/site-consistency.css", "utf8").trim();
let lock =
  "\n\n/* === SITE CONSISTENCY LOCK (do not edit here — edit site-consistency.css) === */\n" +
  cons +
  "\n";

// Ensure consistency selectors cover #duplicate (live id)
let consFixed = cons;
if (consFixed.includes("#duplicate-v2") && !consFixed.includes("#duplicate,")) {
  consFixed = consFixed.replaceAll("#duplicate-v2", "#duplicate, #duplicate-v2");
  // de-dupe accidental doubles
  consFixed = consFixed.replaceAll(
    "#duplicate, #duplicate-v2, #duplicate-v2",
    "#duplicate, #duplicate-v2"
  );
  fs.writeFileSync("app/site-consistency.css", consFixed);
  lock =
    "\n\n/* === SITE CONSISTENCY LOCK (do not edit here — edit site-consistency.css) === */\n" +
    consFixed.trim() +
    "\n";
  console.log("Updated site-consistency.css for #duplicate");
}

const out =
  prefix +
  "\n\n" +
  restored +
  "\n\n" +
  coversTm +
  "\n" +
  lock;

fs.writeFileSync("app/franchise-seo.css", out);
console.log({
  restoredBytes: restored.length,
  coversTmBytes: coversTm.length,
  outBytes: out.length,
  hasD2: out.includes("/* === d2-styles === */"),
  hasCovers: out.includes("#franchise-covers.tm"),
  dupHeadBlock: out.includes("#duplicate .d2-head{display:block"),
});
