/**
 * Mobile menu: tapping .mm-acc must toggle the submenu, not close the menu.
 * Patches source page scripts (unhashed tekcroft-*.js).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.join(ROOT, "public");

const OLD =
  'mnav.addEventListener("click", function(e){ if (e.target.closest("a,button")) closeMenu(); });';

const NEW = `mnav.addEventListener("click", function(e){
      /* Accordion toggles must not close the menu — only real nav links / CTA */
      if (e.target.closest(".mm-acc")) return;
      if (e.target.closest("a[href], .btn, [data-jump]")) closeMenu();
    });`;

const files = fs
  .readdirSync(dir)
  .filter((f) => /^tekcroft-.*\.js$/.test(f) && !/\.[a-f0-9]{10}\.js$/.test(f));

let n = 0;
for (const f of files) {
  const fp = path.join(dir, f);
  let s = fs.readFileSync(fp, "utf8");
  if (s.includes('if (e.target.closest(".mm-acc")) return')) {
    console.log("already", f);
    continue;
  }
  if (!s.includes(OLD)) {
    console.log("no match", f);
    continue;
  }
  fs.writeFileSync(fp, s.split(OLD).join(NEW));
  n++;
  console.log("patched", f);
}
console.log("done", n);
