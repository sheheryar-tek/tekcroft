import fs from "fs";

const p = "C:/Users/Super/Downloads/about-us-hero-variants (6).html";
const html = fs.readFileSync(p, "utf8");

// Find which style contains .walk-step as a selector (not in comment)
const styles = [...html.matchAll(/<style([^>]*)>([\s\S]*?)<\/style>/gi)];
styles.forEach((m, i) => {
  const id = m[1].match(/id=["']([^"']+)/)?.[1] || `(anon${i})`;
  const s = m[2];
  if (/\.walk-step\s*\{/.test(s) || /#how-we-work/.test(s) || /\[data-hwwalk\]/.test(s) || /\.eg-node/.test(s) && /how we/i.test(s)) {
    console.log("HIT", id, "len", s.length);
  }
  if (s.includes(".walk-step{") || s.includes(".walk-step {")) console.log("walk-step rule in", id);
  if (s.includes("#how-we-work")) console.log("#how-we-work in", id);
  if (s.includes("data-hwwalk")) console.log("data-hwwalk in", id);
});

// Search for eg-core styles related to how we work
const idx = html.indexOf(".eg-core");
console.log(".eg-core first", idx);
// find enclosing style id by scanning backwards for <style
const before = html.lastIndexOf("<style", idx);
console.log(html.slice(before, before + 80));

// Extract #wwb closing - find end of #wwb by scanning
function extractById(tag, id) {
  const openRe = new RegExp(`<${tag}\\b[^>]*id=["']${id}["'][^>]*>`, "i");
  const m = openRe.exec(html);
  if (!m) return null;
  let i = m.index + m[0].length;
  let depth = 1;
  const openTag = new RegExp(`<${tag}\\b`, "gi");
  const closeTag = new RegExp(`</${tag}>`, "gi");
  while (depth > 0 && i < html.length) {
    openTag.lastIndex = i;
    closeTag.lastIndex = i;
    const o = openTag.exec(html);
    const c = closeTag.exec(html);
    if (!c) break;
    if (o && o.index < c.index) {
      depth++;
      i = o.index + 1;
    } else {
      depth--;
      i = c.index + c[0].length;
      if (depth === 0) return html.slice(m.index, i);
    }
  }
  return null;
}

const why = extractById("div", "why-exact");
const wwb = extractById("div", "wwb");
console.log("why-exact len", why?.length);
console.log("wwb len", wwb?.length);
console.log("wwb has variant b?", wwb?.includes("VARIANT B"));
console.log("wwb variants", [...(wwb?.matchAll(/VARIANT [A-Z]/g) || [])].map((x) => x[0]));

// Save outline of page between hero-1 and footer
const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] || "";
const mainIds = [...body.matchAll(/id=["']([^"']+)["']/g)].map((m) => m[1]);
console.log("body ids sample", mainIds.filter((id) => !/mm|nav|faq|modal/.test(id)).slice(0, 80));
