import fs from "fs";
const html = fs.readFileSync(
  "C:/Users/Super/Downloads/tekcroft-artificial-intelligence-services (3).html",
  "utf8"
);
const styles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
  .map((m) => m[1])
  .join("\n");

for (const pat of [
  /#process[^{]*h2[^{]*\{[^}]+\}/gi,
  /\.eg-sec[^{]*h2[^{]*\{[^}]+\}/gi,
  /h2\{[^}]*font-size[^}]+\}/gi,
]) {
  const hits = [...styles.matchAll(pat)].slice(0, 8);
  console.log("\n---", pat, hits.length);
  hits.forEach((h) => console.log(h[0].replace(/\s+/g, " ").slice(0, 200)));
}
