import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC =
  "c:\\Users\\Super\\Desktop\\TK FINAL\\Homepage\\tekcroft-site-mega-menus (15).html";

const html = fs.readFileSync(SRC, "utf8");
const publicDir = path.join(ROOT, "public");
fs.mkdirSync(publicDir, { recursive: true });

function writeDataUri(uri, outName) {
  const b64 = uri.split(",")[1];
  const out = path.join(publicDir, outName);
  fs.writeFileSync(out, Buffer.from(b64, "base64"));
  console.log("wrote", outName, fs.statSync(out).size);
}

const iconHrefs = [...html.matchAll(/rel="icon"[^>]*href="(data:image\/png;base64,[^"]+)"/g)].map(
  (m) => m[1]
);
const iconHrefsAlt = [
  ...html.matchAll(/href="(data:image\/png;base64,[^"]+)"[^>]*media="/g),
].map((m) => m[1]);

const icons = iconHrefs.length ? iconHrefs : iconHrefsAlt;
if (icons[0]) writeDataUri(icons[0], "favicon-light.png");
if (icons[1]) writeDataUri(icons[1], "favicon-dark.png");

const apple = html.match(
  /rel="apple-touch-icon"[^>]*href="(data:image\/png;base64,[^"]+)"/
);
if (apple) writeDataUri(apple[1], "apple-touch-icon.png");
