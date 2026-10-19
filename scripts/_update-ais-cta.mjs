import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "images");
const CSS_FILES = [
  path.join(ROOT, "app", "artificial-intelligence-services.css"),
  path.join(ROOT, "app", "artificial-intelligence-services-unlock.css"),
];
const MAX = 80 * 1024;
const SRC =
  "C:/Users/Super/.cursor/projects/c-Tekcroft/assets/c__Users_Super_AppData_Roaming_Cursor_User_workspaceStorage_c6f7834920c05ebddafe800bc4c493a3_images_1-9a528170-f0bc-4e15-8248-8c62400bad1d.jpg";

if (!fs.existsSync(SRC)) throw new Error("missing source: " + SRC);

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
    if (new RegExp(`^${prefix}-[a-f0-9]+\\.webp$`, "i").test(f) && f !== name) {
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

const desk = writeNamed("ais-cta", await encodeUnder(base, 1400, null, false));
console.log("desk", desk);

const mob = writeNamed("ais-cta-m", await encodeUnder(base, 900, 1200, true));
console.log("mob", mob);

const ctaBlock = `/* CTA band photo — AI Services (desktop landscape / mobile portrait) */
#contact.cta{ --cta-shot:url("${desk.file}"); }
@media (max-width:960px){
  #contact.cta{ --cta-shot:url("${mob.file}"); }
}
#contact.cta > .wrap{
  padding:clamp(20px,3vw,44px) clamp(14px,2.6vw,38px) !important;
  border-radius:clamp(20px,2.2vw,30px);
  position:relative;
  isolation:isolate;
  overflow:hidden;
}
#contact.cta > .wrap::before{
  content:""; position:absolute; inset:0; z-index:0; pointer-events:none;
  background:var(--cta-shot) 58% 45% / cover no-repeat;
  transform:scale(1); transition:transform 1.6s var(--ease);
}
#contact.cta > .wrap:hover::before{ transform:scale(1.04); }
#contact.cta > .wrap::after{
  content:""; position:absolute; inset:0; z-index:1; pointer-events:none;
  background:
    radial-gradient(80% 70% at 50% 45%, rgba(0,0,0,.10) 0%, rgba(0,0,0,.34) 100%),
    linear-gradient(180deg, rgba(0,0,0,.18) 0%, rgba(0,0,0,.10) 40%,
                    rgba(0,0,0,.30) 100%);
}
#contact.cta > .wrap > *{ position:relative; z-index:2; }
#contact.cta .cta3 h2,
#contact.cta .cta3 h2 em{text-transform:none !important; color:#fff;}
#contact.cta .cta3 h2 em{ color:var(--primary); }
#contact.cta .cta3 > p{ color:rgba(255,255,255,.80); }
`;

const unlockBlock = `/* CTA band photo — AI Services (desktop landscape / mobile portrait) */
html[data-design="raw"] #contact.cta{ --cta-shot:url("${desk.file}"); }
@media (max-width:960px){
  html[data-design="raw"] #contact.cta{ --cta-shot:url("${mob.file}"); }
}
html[data-design="raw"] #contact.cta > .wrap{
  padding:clamp(20px,3vw,44px) clamp(14px,2.6vw,38px) !important;
  border-radius:clamp(20px,2.2vw,30px) !important;
  position:relative !important;
  isolation:isolate !important;
  overflow:hidden !important;
}
html[data-design="raw"] #contact.cta > .wrap::before{
  content:"" !important; position:absolute !important; inset:0 !important; z-index:0 !important; pointer-events:none !important;
  background:var(--cta-shot) 58% 45% / cover no-repeat !important;
  transform:scale(1) !important; transition:transform 1.6s var(--ease) !important;
  display:block !important;
}
html[data-design="raw"] #contact.cta > .wrap:hover::before{ transform:scale(1.04) !important; }
html[data-design="raw"] #contact.cta > .wrap::after{
  content:"" !important; position:absolute !important; inset:0 !important; z-index:1 !important; pointer-events:none !important;
  background:
    radial-gradient(80% 70% at 50% 45%, rgba(0,0,0,.10) 0%, rgba(0,0,0,.34) 100%),
    linear-gradient(180deg, rgba(0,0,0,.18) 0%, rgba(0,0,0,.10) 40%,
                    rgba(0,0,0,.30) 100%) !important;
  display:block !important;
}
html[data-design="raw"] #contact.cta > .wrap > *{ position:relative !important; z-index:2 !important; }
html[data-design="raw"] #contact.cta .cta3 h2,
html[data-design="raw"] #contact.cta .cta3 h2 em{text-transform:none !important; color:#fff !important;}
html[data-design="raw"] #contact.cta .cta3 h2 em{ color:var(--primary) !important; }
html[data-design="raw"] #contact.cta .cta3 > p{ color:rgba(255,255,255,.80) !important; }
`;

for (const CSS of CSS_FILES) {
  let css = fs.readFileSync(CSS, "utf8");
  const isUnlock = CSS.includes("unlock");
  const block = isUnlock ? unlockBlock : ctaBlock;

  if (css.includes("CTA band photo — AI Services")) {
    css = css.replace(
      /\/\* CTA band photo — AI Services[\s\S]*?(?=\/\* === |\n\/\* === |$)/,
      block + "\n"
    );
    console.log("replaced CTA block in", path.basename(CSS));
  } else if (css.includes("/* === cta-ai === */")) {
    // Keep section ground tint; photo lives on .wrap::before
    css = css.replace(
      /\/\* === cta-ai === \*\/\n#contact\{[^}]+\}[^\n]*/,
      `/* === cta-ai === */\n#contact{--ground:#DAEEF6; background:#DAEEF6 !important;} html[data-theme="dark"] #contact{--ground:var(--bg-alt); background:var(--bg-alt) !important;}\n\n${block}`
    );
    if (isUnlock) {
      css = css.replace(
        /\/\* === cta-ai === \*\/\nhtml\[data-design="raw"\] #contact\{[^}]+\}[^\n]*/,
        `/* === cta-ai === */\nhtml[data-design="raw"] #contact{--ground:#DAEEF6; background:#DAEEF6 !important;} html[data-design="raw"][data-theme="dark"] #contact{--ground:var(--bg-alt); background:var(--bg-alt) !important;}\n\n${block}`
      );
    }
    console.log("inserted after cta-ai in", path.basename(CSS));
  } else {
    css = css.trimEnd() + "\n\n" + block + "\n";
    console.log("appended CTA block to", path.basename(CSS));
  }

  // Refresh path if block already exists with old hash
  css = css.replace(
    /--cta-shot:url\("\/images\/ais-cta-[a-f0-9]+\.webp"\);/g,
    `--cta-shot:url("${desk.file}");`
  );
  css = css.replace(
    /--cta-shot:url\("\/images\/ais-cta-m-[a-f0-9]+\.webp"\);/g,
    `--cta-shot:url("${mob.file}");`
  );

  fs.writeFileSync(CSS, css);
}

fs.writeFileSync(
  path.join(ROOT, "scripts", "_ais-cta-map.json"),
  JSON.stringify(
    {
      desk,
      mob,
      alt: "Professional pointing to an AI processing workflow on a large touchscreen in a modern office",
      title: "Discuss your AI project — strategy, architecture, and integrations",
    },
    null,
    2
  ) + "\n"
);
console.log("done");
