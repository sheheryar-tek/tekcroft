import fs from "fs";

const h = fs.readFileSync(
  "c:/Users/Super/Downloads/tekcroft-local-pack-section (1).html",
  "utf8"
);
console.log("len", h.length);

const section = h.match(/<section class="sec ls"[\s\S]*?<\/section>/i);
if (!section) {
  console.error("ls section not found");
  process.exit(1);
}
fs.writeFileSync("c:/Tekcroft/scripts/_ls-section-extract.html", section[0]);
console.log("section len", section[0].length);
console.log("section head", section[0].slice(0, 400));

const styleIds = [
  "ls-styles",
  "ls-real",
  "ls-balance",
  "ls-balance2",
  "ls-balance3",
  "ls-balance4",
];
for (const id of styleIds) {
  const re = new RegExp(
    `<style[^>]*id=["']${id}["'][^>]*>([\\s\\S]*?)<\\/style>`,
    "i"
  );
  const m = h.match(re);
  if (!m) {
    console.error("missing style", id);
    continue;
  }
  fs.writeFileSync(`c:/Tekcroft/scripts/_${id}.css`, m[1]);
  console.log(id, "len", m[1].length);
}

const script = h.match(/<script[^>]*id=["']ls-script["'][^>]*>([\s\S]*?)<\/script>/i);
if (!script) {
  console.error("ls-script not found");
  process.exit(1);
}
fs.writeFileSync("c:/Tekcroft/scripts/_ls-script.js", script[1]);
console.log("ls-script len", script[1].length);
