/**
 * SEO Audit What-we-do panel images → webp under 80KB
 * Order matches ac-item data-i 0..5
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
    hint: "audit-ac-technical",
    file: "c__Users_Super_AppData_Roaming_Cursor_User_workspaceStorage_c6f7834920c05ebddafe800bc4c493a3_images_3-783924eb-5e43-425f-9c08-eec3ca9ab311.png",
  },
  {
    i: 1,
    hint: "audit-ac-content",
    file: "c__Users_Super_AppData_Roaming_Cursor_User_workspaceStorage_c6f7834920c05ebddafe800bc4c493a3_images_3-5d930077-979e-440f-853b-4c414a173d7b.png",
  },
  {
    i: 2,
    hint: "audit-ac-backlinks",
    file: "c__Users_Super_AppData_Roaming_Cursor_User_workspaceStorage_c6f7834920c05ebddafe800bc4c493a3_images_6-d46d66d5-22b0-4668-88fa-889b9327f022.png",
  },
  {
    i: 3,
    hint: "audit-ac-competitor",
    file: "c__Users_Super_AppData_Roaming_Cursor_User_workspaceStorage_c6f7834920c05ebddafe800bc4c493a3_images_7-5b854379-d30d-4123-bb5c-7f04a54bc1bf.png",
  },
  {
    i: 4,
    hint: "audit-ac-geo",
    file: "c__Users_Super_AppData_Roaming_Cursor_User_workspaceStorage_c6f7834920c05ebddafe800bc4c493a3_images_5-7ad465fa-d784-4923-b477-8495ea0b2566.png",
  },
  {
    i: 5,
    hint: "audit-ac-analytics",
    file: "c__Users_Super_AppData_Roaming_Cursor_User_workspaceStorage_c6f7834920c05ebddafe800bc4c493a3_images_4-101b5dea-1c92-4aad-bae7-8ddf56d06754.png",
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

  const name = `${hint}-${hashBuf(out)}.webp`;
  fs.writeFileSync(path.join(OUT, name), out);
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
  path.join(ROOT, "_audit-ac-images.json"),
  JSON.stringify(results, null, 2)
);
console.log("wrote _audit-ac-images.json");
