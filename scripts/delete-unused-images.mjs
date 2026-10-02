import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const find = spawnSync("node", ["scripts/find-unused-images-live.mjs"], {
  cwd: ROOT,
  encoding: "utf8",
});
if (find.status !== 0) {
  console.error(find.stderr || find.stdout);
  process.exit(1);
}

const lines = find.stdout
  .split(/\r?\n/)
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith("LIVE_UNUSED"));

let deleted = 0;
for (const name of lines) {
  const p = path.join(ROOT, "public", "images", name);
  if (!fs.existsSync(p)) {
    console.log("miss", name);
    continue;
  }
  fs.unlinkSync(p);
  deleted++;
  console.log("del", name);
}
console.log("DELETED", deleted);
