import fs from "fs";

const h = fs.readFileSync("lib/homepage-body.html", "utf8");
console.log("hero tags:\n", [...h.matchAll(/<img[^>]+>/g)].map((m) => m[0]).join("\n"));
const sizes = fs
  .readdirSync("public/images")
  .map((f) => ({ f, kb: +(fs.statSync("public/images/" + f).size / 1024).toFixed(1) }))
  .sort((a, b) => b.kb - a.kb);
console.log("\nlargest images:");
sizes.slice(0, 12).forEach((s) => console.log(String(s.kb).padStart(5) + "KB", s.f));
console.log("over 100KB:", sizes.filter((s) => s.kb > 100).length);
console.log("total images KB:", sizes.reduce((a, s) => a + s.kb, 0).toFixed(1));
console.log(
  "css/mm/body/main KB:",
  (fs.statSync("app/tekcroft.css").size / 1024).toFixed(0),
  (fs.statSync("public/tekcroft-mm.js").size / 1024).toFixed(0),
  (fs.statSync("lib/homepage-body.html").size / 1024).toFixed(0),
  (fs.statSync("public/tekcroft-main.js").size / 1024).toFixed(0)
);
const dataLeft =
  (fs.readFileSync("app/tekcroft.css", "utf8").match(/data:image\/(jpeg|jpg|png|webp|gif)/gi) || [])
    .length +
  (fs.readFileSync("lib/homepage-body.html", "utf8").match(/data:image\/(jpeg|jpg|png|webp|gif)/gi) || [])
    .length +
  (fs.readFileSync("public/tekcroft-mm.js", "utf8").match(/data:image\/(jpeg|jpg|png|webp|gif)/gi) || [])
    .length;
console.log("remaining raster data-uris:", dataLeft);
