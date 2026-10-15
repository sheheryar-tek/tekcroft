import fs from "fs";

function extract(html, id) {
  const openRe = new RegExp(`<section[^>]*id="${id}"[^>]*>`, "i");
  const m = html.match(openRe);
  if (!m) return null;
  const start = html.indexOf(m[0]);
  let i = start + m[0].length;
  let depth = 1;
  while (i < html.length && depth > 0) {
    const no = html.indexOf("<section", i);
    const nc = html.indexOf("</section>", i);
    if (nc < 0) break;
    if (no >= 0 && no < nc) {
      depth++;
      i = no + 8;
    } else {
      depth--;
      i = nc + 10;
      if (depth === 0) return html.slice(start, i);
    }
  }
  return null;
}

const body = fs.readFileSync("lib/artificial-intelligence-services-body.html", "utf8");
const sh = fs.readFileSync("scripts/_ais-src/hero.html", "utf8");
const st = fs.readFileSync("scripts/_ais-src/tech.html", "utf8");
const bh = extract(body, "hero-1");
const bt = extract(body, "tech-v4");

function stripAssets(s) {
  return s
    .replace(/src="[^"]+"/g, 'src="X"')
    .replace(/srcset="[^"]+"/g, 'srcset="X"')
    .replace(/url\([^)]+\)/g, "url(X)")
    .replace(/\s+/g, " ")
    .trim();
}

console.log("hero lens", bh?.length, sh.length, "struct equal?", stripAssets(bh) === stripAssets(sh));
console.log("tech lens", bt?.length, st.length, "struct equal?", stripAssets(bt) === stripAssets(st));
console.log("body hs-veil", /hs-veil/.test(bh || ""));
console.log("body on-dark", /class="hs on-dark"/.test(bh || ""));
console.log("tech radios", (bt?.match(/class="ax-r"/g) || []).length);
console.log("ax1 checked", /id="ax1"[^>]*checked/.test(bt || ""));
console.log("radios first child", /ax-wrap"><input class="ax-r"/.test(bt || ""));

// find first diff in tech
const a = stripAssets(bt || "");
const b = stripAssets(st);
if (a !== b) {
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i] !== b[i]) {
      console.log("tech first diff at", i);
      console.log("body:", a.slice(Math.max(0, i - 80), i + 80));
      console.log("src :", b.slice(Math.max(0, i - 80), i + 80));
      break;
    }
  }
  if (a.length !== b.length) console.log("len diff", a.length, b.length);
}

const ah = stripAssets(bh || "");
const bh2 = stripAssets(sh);
if (ah !== bh2) {
  for (let i = 0; i < Math.min(ah.length, bh2.length); i++) {
    if (ah[i] !== bh2[i]) {
      console.log("hero first diff at", i);
      console.log("body:", ah.slice(Math.max(0, i - 80), i + 80));
      console.log("src :", bh2.slice(Math.max(0, i - 80), i + 80));
      break;
    }
  }
}
