/**
 * Encode homepage services console images (<100KB WebP).
 * Only the mapped set is written; unused uploads are not copied to public/.
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const ASSETS =
  "C:/Users/Super/.cursor/projects/c-Tekcroft/assets";
const OUT = "c:/Tekcroft/public/images";

const IDS = {
  "1": "082f4105",
  "1.1": "d3f1d817",
  "1.3": "fe9ee33e",
  "1.6": "a25ab586",
  "2": "9edb1360",
  "4": "b9a059d4",
  "5": "d0d66b0f",
  "6": "b50dacf5",
  "7": "c25926eb",
  "8": "1cf96924",
  "9": "af8f1f23",
  "11": "8ded0234",
  "11.1": "3585ca8a",
  "12": "33810d23",
  "13": "168171b6",
  "14": "385adfb5",
  "15": "c9abf3bf",
  "16": "5426c7b4",
  "17": "9e973960",
  "18": "59d025b3",
  "19": "c98d340d",
  "20": "0c3fbcea",
  "21": "703e2ecd",
  "22": "212432f7",
  "23": "c26202e1",
  "24": "67aa939c",
};

function srcFor(id) {
  const token = IDS[id];
  const hit = fs.readdirSync(ASSETS).find((f) => f.includes(token));
  if (!hit) throw new Error("missing asset " + id);
  return path.join(ASSETS, hit);
}

/** Only these get shipped */
const MAP = {
  // SEO core + subs
  "cn-seo.webp": "7",
  "cn-seo-ecom.webp": "5",
  "cn-seo-audit.webp": "20",
  "cn-seo-onpage.webp": "18",
  "cn-seo-tech.webp": "23",
  "cn-seo-ai.webp": "9",
  "cn-seo-local.webp": "21",
  "cn-seo-gbp.webp": "14",
  "cn-seo-fran.webp": "8",
  // AI
  "cn-ai.webp": "19",
  "cn-ai-dev.webp": "16",
  "cn-ai-bot.webp": "11",
  "cn-ai-agent.webp": "22",
  // Web
  "cn-web.webp": "15",
  "cn-web-design.webp": "4",
  "cn-web-soft.webp": "12",
  "cn-web-app.webp": "13",
  // Digital marketing
  "cn-dm.webp": "24",
  "cn-dm-paid.webp": "1.6",
  "cn-dm-social.webp": "11.1",
  "cn-dm-content.webp": "17",
  "cn-dm-email.webp": "1.3",
};

async function encodeUnder(buf, maxBytes) {
  let lo = 55,
    hi = 92,
    best = null;
  while (lo <= hi) {
    const q = Math.floor((lo + hi) / 2);
    const out = await sharp(buf)
      .resize({ width: 720, withoutEnlargement: true })
      .webp({ quality: q, effort: 6, smartSubsample: true })
      .toBuffer();
    if (out.length <= maxBytes) {
      best = { buf: out, q, bytes: out.length };
      lo = q + 1;
    } else hi = q - 1;
  }
  if (best) return best;
  // last resort narrower
  for (const w of [640, 560]) {
    for (let q = 80; q >= 50; q -= 2) {
      const out = await sharp(buf)
        .resize({ width: w, withoutEnlargement: true })
        .webp({ quality: q, effort: 6, smartSubsample: true })
        .toBuffer();
      if (out.length <= maxBytes) return { buf: out, q, bytes: out.length, w };
    }
  }
  throw new Error("could not fit");
}

const MAX = 100 * 1024;
const usedIds = new Set();

for (const [outName, id] of Object.entries(MAP)) {
  usedIds.add(id);
  const buf = fs.readFileSync(srcFor(id));
  const r = await encodeUnder(buf, MAX);
  fs.writeFileSync(path.join(OUT, outName), r.buf);
  const m = await sharp(r.buf).metadata();
  console.log(
    outName,
    m.width + "x" + m.height,
    (r.bytes / 1024).toFixed(1) + "KB",
    "q" + r.q + (r.w ? " @" + r.w : ""),
    "←",
    id
  );
}

const unused = Object.keys(IDS).filter((id) => !usedIds.has(id));
console.log("unused sources (not copied):", unused.join(", "));
console.log("shipped:", Object.keys(MAP).length);
