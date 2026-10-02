import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = path.join(ROOT, "lib/local-seo-body.html");
let h = fs.readFileSync(file, "utf8");

const start = h.indexOf('<section class="sec wc beam-zone" id="reviews"');
const commentStart = h.lastIndexOf("<!--", start);
const cutStart =
  commentStart >= 0 && start - commentStart < 900 ? commentStart : start;

const end = h.indexOf('<section class="sec eg-sec" id="process"');
if (cutStart < 0 || end < 0) {
  console.error("markers missing", cutStart, end);
  process.exit(1);
}

// Keep the process section comment if it sits just before process.
const before = h.slice(0, cutStart);
const after = h.slice(end);
const processComment = h.lastIndexOf("<!--", end);
const keepComment =
  processComment > cutStart && end - processComment < 400
    ? h.slice(processComment, end)
    : "";

h = before + keepComment + after;

h = h.replace(
  '<section class="sec eg-sec" id="process" data-ground="tint">',
  '<section class="sec eg-sec" id="process" data-ground="white">'
);

fs.writeFileSync(file, h);
console.log("removed reviews+different, process -> white");
