import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "images");
const CSS = path.join(ROOT, "app", "google-business-profile-optimization.css");
const MAX = 80 * 1024;
const SRC =
  "C:/Users/Super/.cursor/projects/c-Tekcroft/assets/c__Users_Super_AppData_Roaming_Cursor_User_workspaceStorage_c6f7834920c05ebddafe800bc4c493a3_images_1-3e817e0f-2beb-4f9c-88df-5afe8aaddb60.jpg";

async function encodeUnder(pipeline, maxW, maxH, cover = false) {
  let width = maxW;
  let quality = 82;
  let out;
  let meta;

  for (;;) {
    let img = pipeline.clone().rotate();
    if (cover && maxW && maxH) {
      img = img.resize({
        width: maxW,
        height: maxH,
        fit: "cover",
        position: "centre",
      });
    } else {
      img = img.resize({ width, withoutEnlargement: true });
    }
    out = await img
      .webp({ quality, effort: 6, smartSubsample: true })
      .toBuffer();
    meta = await sharp(out).metadata();
    if (out.length <= MAX) break;
    if (quality > 55) quality -= 6;
    else if (!cover && width > 720) {
      width -= 80;
      quality = 78;
    } else if (quality > 40) quality -= 5;
    else break;
  }

  if (out.length > MAX) {
    throw new Error(`still over 80KB: ${(out.length / 1024).toFixed(1)}KB`);
  }
  const hash = crypto.createHash("sha1").update(out).digest("hex").slice(0, 10);
  return { out, meta, quality, hash };
}

function writeNamed(prefix, { out, meta, quality, hash }) {
  const name = `${prefix}-${hash}.webp`;
  const dest = path.join(OUT, name);
  for (const f of fs.readdirSync(OUT)) {
    if (new RegExp(`^${prefix}-.*\\.webp$`, "i").test(f) && f !== name) {
      fs.unlinkSync(path.join(OUT, f));
      console.log("deleted", f);
    }
  }
  fs.writeFileSync(dest, out);
  return {
    file: `/images/${name}`,
    kb: +(out.length / 1024).toFixed(1),
    q: quality,
    w: meta.width,
    h: meta.height,
  };
}

const buf = fs.readFileSync(SRC);
const base = sharp(buf, { failOn: "none" });

const desk = writeNamed(
  "gbp-cta",
  await encodeUnder(base, 1400, null, false)
);
console.log("desk", desk);

const mob = writeNamed(
  "gbp-cta-m",
  await encodeUnder(base, 900, 1200, true)
);
console.log("mob", mob);

let css = fs.readFileSync(CSS, "utf8");
const ctaBlock = `/* CTA band photo — desktop landscape / mobile portrait */
#contact.cta{ --cta-shot:url("${desk.file}"); }
@media (max-width:960px){
  #contact.cta{ --cta-shot:url("${mob.file}"); }
}
`;

if (css.includes("#contact.cta{ --cta-shot:")) {
  css = css.replace(
    /\/\* CTA band photo[\s\S]*?#contact\.cta\{ --cta-shot:url\("[^"]+"\); \}\s*@media \(max-width:960px\)\{\s*#contact\.cta\{ --cta-shot:url\("[^"]+"\); \}\s*\}\s*/,
    ctaBlock
  );
} else if (css.includes("#contact{ --cta-pic:var(--shot-2); }")) {
  css = css.replace(
    "#contact{ --cta-pic:var(--shot-2); }",
    ctaBlock.trimEnd()
  );
} else {
  css += "\n" + ctaBlock;
}
fs.writeFileSync(CSS, css);
console.log("updated CSS");

fs.writeFileSync(
  path.join(ROOT, "scripts", "_gbp-cta-map.json"),
  JSON.stringify({ "gbp-cta": desk, "gbp-cta-m": mob }, null, 2) + "\n"
);
console.log("done");
