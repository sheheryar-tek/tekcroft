/**
 * Ecommerce SEO "Our process" disc images → webp under 80KB
 * Order matches data-at 0..4 (Discovery → Tracking)
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "images");
const ASSETS =
  "C:/Users/Super/.cursor/projects/c-Tekcroft/assets";
const MAX = 80 * 1024;

const INPUTS = [
  {
    i: 0,
    hint: "ecom-proc-discovery",
    file: "c__Users_Super_AppData_Roaming_Cursor_User_workspaceStorage_c6f7834920c05ebddafe800bc4c493a3_images_23-ffa659d7-d749-4347-b0b2-afc69403e291.png",
  },
  {
    i: 1,
    hint: "ecom-proc-audit",
    file: "c__Users_Super_AppData_Roaming_Cursor_User_workspaceStorage_c6f7834920c05ebddafe800bc4c493a3_images_14-d0ecf950-eb9a-429a-ab83-84dbd8894236.png",
  },
  {
    i: 2,
    hint: "ecom-proc-strategy",
    file: "c__Users_Super_AppData_Roaming_Cursor_User_workspaceStorage_c6f7834920c05ebddafe800bc4c493a3_images_25-a93f220c-15af-4d6f-87d9-9cf9bff45b2a.png",
  },
  {
    i: 3,
    hint: "ecom-proc-optimize",
    file: "c__Users_Super_AppData_Roaming_Cursor_User_workspaceStorage_c6f7834920c05ebddafe800bc4c493a3_images_3-f9467c34-e621-4c77-8229-0b0d987485ae.png",
  },
  {
    i: 4,
    hint: "ecom-proc-tracking",
    file: "c__Users_Super_AppData_Roaming_Cursor_User_workspaceStorage_c6f7834920c05ebddafe800bc4c493a3_images_4-377458b6-b9dc-4d70-85e8-85449d67fef5.png",
  },
];

function hashBuf(buf) {
  return crypto.createHash("sha1").update(buf).digest("hex").slice(0, 10);
}

async function toWebp(srcPath, hint) {
  const buf = fs.readFileSync(srcPath);
  let size = 720;
  let quality = 78;
  let out;

  for (;;) {
    out = await sharp(buf, { failOn: "none" })
      .rotate()
      .resize({ width: size, height: size, fit: "cover", position: "centre" })
      .webp({ quality, effort: 6, smartSubsample: true })
      .toBuffer();
    if (out.length <= MAX) break;
    if (quality > 55) quality -= 6;
    else if (size > 480) {
      size -= 60;
      quality = 72;
    } else if (quality > 40) quality -= 5;
    else break;
  }

  const name = `${hint}-${hashBuf(out)}.webp`;
  fs.writeFileSync(path.join(OUT, name), out);
  return { path: `/images/${name}`, kb: (out.length / 1024).toFixed(1), size, q: quality };
}

const results = [];
for (const item of INPUTS) {
  const src = path.join(ASSETS, item.file);
  if (!fs.existsSync(src)) throw new Error("missing " + src);
  const r = await toWebp(src, item.hint);
  results.push({ i: item.i, ...r });
  console.log(`data-at=${item.i}`, r.path, r.kb + "KB", `s=${r.size}`, `q=${r.q}`);
}

fs.writeFileSync(
  path.join(ROOT, "_ecom-proc-images.json"),
  JSON.stringify(results, null, 2)
);
console.log("wrote _ecom-proc-images.json");
