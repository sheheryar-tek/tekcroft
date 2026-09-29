import fs from "fs";
import path from "path";

const dir = "app";
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".css"));

// Orphan property lines left after selector was eaten
const patterns = [
  [
    /\.mm-copy\{position:relative; z-index:2; color:#fff;\}\s*\r?\n-size:var\(--h3\);([^\n]*\})/g,
    ".mm-copy{position:relative; z-index:2; color:#fff;}\n.mm-copy h3{font-size:var(--h3);$1",
  ],
  [
    /\.faq-aside h3\{[^}]*\}\s*\r?\n-size:var\(--h3\);/g,
    null, // handle separately if needed
  ],
  [
    /(^|\n)-size:var\(--h3\);([^\n]*\})/gm,
    "$1.mm-copy h3{font-size:var(--h3);$2",
  ],
];

for (const name of files) {
  const fp = path.join(dir, name);
  let s = fs.readFileSync(fp, "utf8");
  const before = s;
  s = s.replace(
    /\.mm-copy\{position:relative; z-index:2; color:#fff;\}\s*\r?\n-size:var\(--h3\);([^\n]*\})/g,
    ".mm-copy{position:relative; z-index:2; color:#fff;}\n.mm-copy h3{font-size:var(--h3);$1"
  );
  // any remaining orphan -size:var(--hN)
  s = s.replace(
    /(^|\n)-size:var\(--h([1-6])\);/gm,
    "$1/* restored */\n.mm-copy h3{font-size:var(--h$2);"
  );
  if (s !== before) {
    fs.writeFileSync(fp, s);
    console.log("patched", name);
  }
}

// verify
for (const name of files) {
  const s = fs.readFileSync(path.join(dir, name), "utf8");
  if (/(^|\n)-size:var\(/.test(s) || /\*\/-size:/.test(s)) {
    console.log("STILL BAD", name);
  }
}
