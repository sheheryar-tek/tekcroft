import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ASSETS =
  "C:/Users/Super/.cursor/projects/c-Tekcroft/assets";
const OUT = path.join(ROOT, "public", "images");

const PANELS = [
  {
    i: 0,
    src: "c__Users_Super_AppData_Roaming_Cursor_User_workspaceStorage_c6f7834920c05ebddafe800bc4c493a3_images_5-2b2ab5e5-600c-46fa-8f72-3f4a1515c7ed.jpg",
    alt: "AI Visibility Audit & Prompt Research",
  },
  {
    i: 1,
    src: "c__Users_Super_AppData_Roaming_Cursor_User_workspaceStorage_c6f7834920c05ebddafe800bc4c493a3_images_1-2d536a32-687c-41d4-907c-a873086f1260.jpg",
    alt: "Google AI Overviews & AI Mode Optimization",
  },
  {
    i: 2,
    src: "c__Users_Super_AppData_Roaming_Cursor_User_workspaceStorage_c6f7834920c05ebddafe800bc4c493a3_images_3-869f6a42-8317-45e1-9c3b-41d56b7de543.jpg",
    alt: "ChatGPT, Gemini, Perplexity & Claude Optimization",
  },
  {
    i: 3,
    src: "c__Users_Super_AppData_Roaming_Cursor_User_workspaceStorage_c6f7834920c05ebddafe800bc4c493a3_images_1-410c85e3-ced0-4212-8633-954e4a05b37e.jpg",
    alt: "Answer Engine Optimization (AEO) & Voice Search",
  },
  {
    i: 4,
    src: "c__Users_Super_AppData_Roaming_Cursor_User_workspaceStorage_c6f7834920c05ebddafe800bc4c493a3_images_3-5a06b80d-47fc-4d94-a917-3f586cf62b30.jpg",
    alt: "AI Content Optimization",
  },
  {
    i: 5,
    src: "c__Users_Super_AppData_Roaming_Cursor_User_workspaceStorage_c6f7834920c05ebddafe800bc4c493a3_images_8-a50a21dd-7e7e-412e-8917-56d99eb4df6f.jpg",
    alt: "Entity, Technical & Brand Accuracy Optimization",
  },
  {
    i: 6,
    src: "c__Users_Super_AppData_Roaming_Cursor_User_workspaceStorage_c6f7834920c05ebddafe800bc4c493a3_images_2-cdfaccb7-f178-409a-ad41-dce4ba790c65.jpg",
    alt: "Off-Site Authority & Third-Party Mentions",
  },
  {
    i: 7,
    src: "c__Users_Super_AppData_Roaming_Cursor_User_workspaceStorage_c6f7834920c05ebddafe800bc4c493a3_images_2-1801c7a3-f12a-4e6d-a926-d73d0751b157.jpg",
    alt: "AI Traffic Conversion & Attribution",
  },
  {
    i: 8,
    src: "c__Users_Super_AppData_Roaming_Cursor_User_workspaceStorage_c6f7834920c05ebddafe800bc4c493a3_images_3-26e07915-3b4d-4267-b89b-1486778dc49f.jpg",
    alt: "AI-Powered SEO Automation",
  },
];

async function toWebp(srcPath) {
  const tries = [
    [1400, 70],
    [1200, 64],
    [1100, 58],
    [1024, 52],
    [960, 48],
    [880, 44],
    [800, 40],
  ];
  let best = null;
  for (const [w, q] of tries) {
    const buf = await sharp(srcPath)
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: q, effort: 6, smartSubsample: true })
      .toBuffer();
    if (buf.length / 1024 < 80) {
      best = { buf, w, q };
      if (buf.length / 1024 < 55) break;
    }
  }
  if (!best) throw new Error("could not compress under 80KB: " + srcPath);
  const meta = await sharp(best.buf).metadata();
  const hash = crypto.createHash("sha256").update(best.buf).digest("hex").slice(0, 10);
  return { ...best, meta, hash };
}

const results = [];
for (const p of PANELS) {
  const srcPath = path.join(ASSETS, p.src);
  if (!fs.existsSync(srcPath)) throw new Error("missing " + srcPath);
  const { buf, w, q, meta, hash } = await toWebp(srcPath);
  const name = `aiseo-tm-${String(p.i + 1).padStart(2, "0")}-${hash}.webp`;
  fs.writeFileSync(path.join(OUT, name), buf);
  results.push({
    i: p.i,
    file: `/images/${name}`,
    alt: p.alt,
    kb: +(buf.length / 1024).toFixed(1),
    width: meta.width,
    height: meta.height,
    enc: `w${w}q${q}`,
  });
  console.log(`P${p.i + 1}`, name, results.at(-1).kb + "KB", `${meta.width}x${meta.height}`);
}

fs.writeFileSync(
  path.join(ROOT, "scripts", "_aiseo-tm-image-map.json"),
  JSON.stringify(results, null, 2)
);
console.log("map written");
