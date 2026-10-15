import fs from "fs";
import path from "path";

const lib = "c:/Tekcroft/lib";
const files = fs.readdirSync(lib).filter((f) => f.endsWith("-body.html"));

function parseFig(raw) {
  // "4.9/5" special, "8+", "180%", "50$M+", "$50M+", "100%"
  const t = raw.replace(/\s+/g, "").trim();
  const m1 = t.match(/^(\d+(?:\.\d+)?)(.+)$/);
  if (m1) return { num: m1[1], sign: m1[2] };
  return { num: t, sign: "" };
}

for (const f of files) {
  const html = fs.readFileSync(path.join(lib, f), "utf8");
  const m = html.match(/<section class="sec tb" id="proof"[^>]*>[\s\S]*?<\/section>/);
  if (!m) continue;
  const figs = [];
  const re =
    /<div class="tb-fig"[^>]*>[\s\S]*?<b([^>]*)>([\s\S]*?)<\/b>[\s\S]*?<span class="tb-cap">([\s\S]*?)<\/span>/g;
  let x;
  while ((x = re.exec(m[0]))) {
    const attrs = x[1];
    const inner = x[2];
    const cap = x[3].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    const count = (attrs.match(/data-count="([^"]*)"/) || [])[1];
    const suffix = (attrs.match(/data-suffix="([^"]*)"/) || [])[1];
    let num, sign;
    if (count != null) {
      num = count;
      sign = suffix || "";
    } else {
      const text = inner.replace(/<[^>]+>/g, "").replace(/\s+/g, "").trim();
      // e.g. 4.9/5 with fig-af
      const p = parseFig(text);
      num = p.num;
      sign = p.sign;
    }
    figs.push({ num, sign, cap, rawInner: inner.replace(/\s+/g, " ").trim() });
  }
  console.log("\n===", f, "===");
  console.log(JSON.stringify(figs, null, 2));
}
