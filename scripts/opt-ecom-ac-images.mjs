/**
 * Convert ecommerce What-we-do panel images → webp under 80KB
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "images");
const MAX = 80 * 1024;

const ASSETS =
  "C:/Users/Super/.cursor/projects/c-Tekcroft/assets";

// Order matches ac-item data-i 0..5 (services 01–06)
const INPUTS = [
  {
    i: 0,
    file: "c__Users_Super_AppData_Roaming_Cursor_User_workspaceStorage_c6f7834920c05ebddafe800bc4c493a3_images_1-ae0642f7-8ff8-44b7-b24b-1a2905d106cf.png",
    hint: "ac-audit",
  },
  {
    i: 1,
    file: "c__Users_Super_AppData_Roaming_Cursor_User_workspaceStorage_c6f7834920c05ebddafe800bc4c493a3_images_4-c4fa0155-ec5b-41aa-be9f-c7c4876a64af.png",
    hint: "ac-keywords",
  },
  {
    i: 2,
    file: "c__Users_Super_AppData_Roaming_Cursor_User_workspaceStorage_c6f7834920c05ebddafe800bc4c493a3_images_2-2d9ca9c9-1160-4398-8464-1fefe2817198.png",
    hint: "ac-product",
  },
  {
    i: 3,
    file: "c__Users_Super_AppData_Roaming_Cursor_User_workspaceStorage_c6f7834920c05ebddafe800bc4c493a3_images_5-18bfc9e2-9239-4b24-885b-828bd0af9f8e.png",
    hint: "ac-category",
  },
  {
    i: 4,
    file: "c__Users_Super_AppData_Roaming_Cursor_User_workspaceStorage_c6f7834920c05ebddafe800bc4c493a3_images_3-b222cb00-4ebe-4e67-a66b-6368e907912d.png",
    hint: "ac-technical",
  },
  {
    i: 5,
    file: "c__Users_Super_AppData_Roaming_Cursor_User_workspaceStorage_c6f7834920c05ebddafe800bc4c493a3_images_5-66fd9ed2-b0cc-4f06-9508-7673b2a5bab1.png",
    hint: "ac-content",
  },
];

function hashBuf(buf) {
  return crypto.createHash("sha1").update(buf).digest("hex").slice(0, 10);
}

async function toWebp(srcPath, hint) {
  const buf = fs.readFileSync(srcPath);
  let width = 1200;
  let quality = 78;
  let out;

  for (;;) {
    out = await sharp(buf, { failOn: "none" })
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality, effort: 6 })
      .toBuffer();
    if (out.length <= MAX) break;
    if (quality > 55) quality -= 6;
    else if (width > 700) {
      width -= 100;
      quality = 72;
    } else if (quality > 40) quality -= 5;
    else break;
  }

  const h = hashBuf(out);
  const name = `ecom-${hint}-${h}.webp`;
  const dest = path.join(OUT, name);
  fs.writeFileSync(dest, out);
  return { path: `/images/${name}`, kb: (out.length / 1024).toFixed(1), w: width, q: quality };
}

const results = [];
for (const item of INPUTS) {
  const src = path.join(ASSETS, item.file);
  if (!fs.existsSync(src)) throw new Error("missing " + src);
  const r = await toWebp(src, item.hint);
  results.push({ i: item.i, ...r });
  console.log(`data-i=${item.i}`, r.path, r.kb + "KB", `w=${r.w}`, `q=${r.q}`);
}

fs.writeFileSync(
  path.join(ROOT, "_ecom-ac-images.json"),
  JSON.stringify(results, null, 2)
);
console.log("wrote _ecom-ac-images.json");
