import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "images", "ai-chatbot");
const BODY = path.join(ROOT, "lib", "ai-chatbot-development-body.html");
const CSS = path.join(ROOT, "app", "ai-chatbot-services-tm.css");
const MAX = 80 * 1024;
const SRC_BASE =
  "C:/Users/Super/Downloads/ai-chatbot-development-services-20261015T132301Z-1-001/ai-chatbot-development-services/Services";

/** Panel order matches #chatbot-services tabs */
const SERVICES = [
  {
    id: "01",
    folder: "AI Chatbot Consulting",
    alt: "AI chatbot consulting workshop with workflow mapping, technical plan notes, and human handoff planning on a laptop",
    title: "AI Chatbot Consulting | TekCroft",
  },
  {
    id: "02",
    folder: "Custom AI Chatbot Development",
    alt: "Custom AI chatbot development with CRM and ERP integrations shown on dual monitors in a product workspace",
    title: "Custom AI Chatbot Development | TekCroft",
  },
  {
    id: "03",
    folder: "Conversational AI and RAG Development",
    alt: "Conversational AI and RAG development retrieving answers from a company knowledge base on screen",
    title: "Conversational AI and RAG Development | TekCroft",
  },
  {
    id: "04",
    folder: "Chatbot Integration Services",
    alt: "Chatbot integration services connecting Salesforce, Zendesk, Shopify, and internal APIs on a developer desk",
    title: "Chatbot Integration Services | TekCroft",
  },
  {
    id: "05",
    folder: "Multilingual Chatbot Development",
    alt: "Multilingual chatbot development supporting multiple languages in one conversation interface",
    title: "Multilingual Chatbot Development | TekCroft",
  },
  {
    id: "06",
    folder: "Chatbot Maintenance and Support",
    alt: "Chatbot maintenance and support updating knowledge base content and monitoring live conversations",
    title: "Chatbot Maintenance and Support | TekCroft",
  },
];

function pickSrc(folder, kind) {
  const dir = path.join(SRC_BASE, folder, kind);
  if (!fs.existsSync(dir)) {
    const alt = path.join(SRC_BASE, folder, kind.toLowerCase());
    if (fs.existsSync(alt)) return path.join(alt, "1.jpg");
    throw new Error(`Missing ${kind} for ${folder}`);
  }
  const one = path.join(dir, "1.jpg");
  if (fs.existsSync(one)) return one;
  const files = fs.readdirSync(dir).filter((f) => /\.jpe?g$/i.test(f));
  if (!files.length) throw new Error(`No jpg in ${dir}`);
  return path.join(dir, files.sort()[0]);
}

async function encode(src, { width, height }) {
  const buf = fs.readFileSync(src);
  let w = width;
  let quality = 78;
  let out;
  let meta;

  for (;;) {
    let pipeline = sharp(buf, { failOn: "none" }).rotate();
    if (height) {
      pipeline = pipeline.resize({
        width: w,
        height,
        fit: "cover",
        withoutEnlargement: true,
      });
    } else {
      pipeline = pipeline.resize({ width: w, withoutEnlargement: true });
    }
    out = await pipeline
      .webp({ quality, effort: 6, smartSubsample: true })
      .toBuffer();
    meta = await sharp(out).metadata();
    if (out.length <= MAX) break;
    if (quality > 52) quality -= 6;
    else if (w > 640) {
      w -= 80;
      quality = 72;
    } else if (quality > 38) quality -= 4;
    else break;
  }

  if (out.length > MAX) {
    throw new Error(
      `${path.basename(src)} still over 80KB: ${(out.length / 1024).toFixed(1)}KB`
    );
  }

  return { buf: out, kb: +(out.length / 1024).toFixed(1), q: quality, w: meta.width, h: meta.height };
}

fs.mkdirSync(OUT, { recursive: true });

const results = [];
for (const svc of SERVICES) {
  const deskSrc = pickSrc(svc.folder, "Desktop");
  const mobSrc = pickSrc(svc.folder, "Mobile");

  const desk = await encode(deskSrc, { width: 1400 });
  const mob = await encode(mobSrc, { width: 720, height: 960 });

  const deskName = `tm-${svc.id}.webp`;
  const mobName = `tm-${svc.id}-m.webp`;
  fs.writeFileSync(path.join(OUT, deskName), desk.buf);
  fs.writeFileSync(path.join(OUT, mobName), mob.buf);

  results.push({
    id: svc.id,
    desk: { file: deskName, ...desk },
    mob: { file: mobName, ...mob },
    alt: svc.alt,
    title: svc.title,
  });

  console.log(
    `tm-${svc.id}: desk ${desk.kb}KB q${desk.q} ${desk.w}x${desk.h} | mob ${mob.kb}KB q${mob.q} ${mob.w}x${mob.h}`
  );
}

let body = fs.readFileSync(BODY, "utf8");

for (const r of results) {
  const esc = (s) =>
    s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  const loading = r.id === "01" ? 'loading="eager"' : 'loading="lazy"';
  const block = `<span class="tm-bg"><picture><source media="(max-width:980px)" srcset="/images/ai-chatbot/${r.mob.file}" type="image/webp"><img src="/images/ai-chatbot/${r.desk.file}" width="${r.desk.w}" height="${r.desk.h}" alt="${esc(r.alt)}" title="${esc(r.title)}" decoding="async" ${loading}></picture><span class="tm-veil"></span></span>`;

  // Match either old CSS-bg form or already-converted form
  const re = new RegExp(
    `<span class="tm-bg"[^>]*>[\\s\\S]*?<span class="tm-veil"></span></span>(?=\\s*<span class="tm-slim")`
  );
  // Need per-item: find by data-i or tm-0N in nearby context
  const itemRe = new RegExp(
    `(<div class="tm-item[^"]*" data-i="${Number(r.id) - 1}"[^>]*>)\\s*<span class="tm-bg"[\\s\\S]*?<span class="tm-veil"></span></span>`
  );
  if (!itemRe.test(body)) {
    throw new Error(`tm-item data-i=${Number(r.id) - 1} tm-bg not found`);
  }
  body = body.replace(itemRe, `$1${block}`);
}

fs.writeFileSync(BODY, body);
console.log("updated body markup");

let css = fs.readFileSync(CSS, "utf8");
// Replace .tm-bg rule that embeds base64 jpeg with img-cover layout
const tmBgRe =
  /\.tm-bg\{position:absolute; inset:0; opacity:0; transition:opacity \.55s var\(--ease\) \.05s;\s*background:url\("data:image\/jpeg;base64,[^"]+"\) center\/cover no-repeat;\}/;
if (!tmBgRe.test(css)) {
  // Already replaced? check for img rules
  if (!css.includes(".tm-bg img") && !css.includes(".tm-bg picture")) {
    throw new Error("Could not find .tm-bg base64 rule to replace");
  }
  console.log("css tm-bg already updated or different format");
} else {
  css = css.replace(
    tmBgRe,
    `.tm-bg{position:absolute; inset:0; opacity:0; transition:opacity .55s var(--ease) .05s; overflow:hidden;}
.tm-bg picture,.tm-bg img{position:absolute; inset:0; width:100%; height:100%; display:block;}
.tm-bg img{object-fit:cover; object-position:center;}`
  );
  fs.writeFileSync(CSS, css);
  console.log("updated css (removed base64, added img cover)");
}

// Also clear any leftover inline background-image if any remain
if (/tm-bg[^>]*background-image/.test(body)) {
  console.warn("WARNING: leftover background-image on tm-bg");
}

console.log("done");
for (const r of results) {
  console.log(
    `  ${r.id} desk=${r.desk.kb}KB mob=${r.mob.kb}KB`
  );
}
