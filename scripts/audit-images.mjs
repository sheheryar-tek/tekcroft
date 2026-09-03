import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function catalog(file) {
  const text = fs.readFileSync(path.join(ROOT, file), "utf8");
  const re = /data:image\/([a-zA-Z0-9+.-]+);base64,([A-Za-z0-9+/=]+)/g;
  const items = [];
  let m;
  while ((m = re.exec(text))) {
    const bytes = Buffer.from(m[2], "base64").length;
    const before = text.slice(Math.max(0, m.index - 100), m.index).replace(/\s+/g, " ");
    items.push({
      type: m[1],
      bytes,
      kb: +(bytes / 1024).toFixed(1),
      index: m.index,
      before: before.slice(-70),
      matchLen: m[0].length,
    });
  }
  items.sort((a, b) => b.bytes - a.bytes);
  console.log(`\n=== ${file}: ${items.length} images, ${(items.reduce((s, i) => s + i.bytes, 0) / 1024).toFixed(1)} KB raw ===`);
  items.forEach((i, n) => console.log(`${n + 1}. ${i.type} ${i.kb}KB @${i.index} …${i.before}`));
  return items;
}

catalog("app/tekcroft.css");
catalog("public/tekcroft-mm.js");
catalog("lib/homepage-body.html");
catalog("public/tekcroft-main.js");
