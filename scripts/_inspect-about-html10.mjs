import fs from "fs";

const p = "C:/Users/Super/Downloads/about-us-hero-variants (6).html";
const html = fs.readFileSync(p, "utf8");

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

for (const id of ["rpw", "hwww", "wgw", "ctaw", "why-exact", "wwb"]) {
  const chunk = extractById("div", id);
  console.log(
    id,
    "len",
    chunk?.length,
    "has style",
    !!chunk?.includes("<style"),
    "head",
    chunk?.slice(0, 120).replace(/\s+/g, " ")
  );
  if (chunk?.includes("<style")) {
    const st = chunk.match(/<style[^>]*>([\s\S]*?)<\/style>/i)?.[1];
    console.log("  style len", st?.length, "start", st?.slice(0, 100).replace(/\s+/g, " "));
  }
}

// walk-script
const walk = html.match(
  /<script[^>]*id=["']walk-script["'][^>]*>([\s\S]*?)<\/script>/i
)?.[1];
console.log("\nwalk-script", walk?.slice(0, 200));

const whyScript = html.match(
  /<script[^>]*id=["']why-script["'][^>]*>([\s\S]*?)<\/script>/i
)?.[1];
console.log("\nwhy-script", whyScript);

const ctaScript = html.match(
  /<script[^>]*id=["']cta-script["'][^>]*>([\s\S]*?)<\/script>/i
)?.[1];
console.log("\ncta-script", ctaScript);

const xc = html.match(
  /<script[^>]*id=["']xc-script["'][^>]*>([\s\S]*?)<\/script>/i
)?.[1];
console.log("\nxc-script", xc);
