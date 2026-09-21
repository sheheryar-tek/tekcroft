import fs from "fs";

const html = fs.readFileSync(
  "c:/Users/Super/Desktop/TK FINAL/Services/Custom Software Development/tekcroft-custom-software.html",
  "utf8"
);

const styles = [...html.matchAll(/<style id="([^"]+)">([\s\S]*?)<\/style>/g)].map(
  (m) => ({ id: m[1], kb: +(m[2].length / 1024).toFixed(1) })
);
console.log("STYLES");
styles.forEach((s) => console.log(s.id, s.kb + "KB"));

const scripts = [
  ...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g),
].map((m, i) => {
  const attrs = m[1] || "";
  const id = (attrs.match(/id="([^"]+)"/) || [])[1] || "anon" + i;
  const src = (attrs.match(/src="([^"]+)"/) || [])[1];
  return { id, src: src || "", kb: +(m[2].length / 1024).toFixed(1) };
});
console.log("\nSCRIPTS");
scripts.forEach((s) => console.log(s.id, s.src || "inline", s.kb + "KB"));

const dataUris = [...html.matchAll(/url\(\s*['"]?(data:image\/[a-zA-Z+]+;base64,[A-Za-z0-9+/=]+)['"]?\s*\)/g)];
const srcImgs = [...html.matchAll(/src="(data:image\/[a-zA-Z+]+;base64,[A-Za-z0-9+/=]+)"/g)];
console.log("\ndata-uri backgrounds", dataUris.length);
console.log("data-uri src imgs", srcImgs.length);
console.log(
  "data total KB",
  (
    (dataUris.reduce((a, m) => a + m[1].length, 0) +
      srcImgs.reduce((a, m) => a + m[1].length, 0)) /
    1024
  ).toFixed(0)
);

const start = html.indexOf('<nav class="nav"');
const end = html.lastIndexOf("</footer>");
const chunk = end > start ? html.slice(start, end + "</footer>".length) : "";
console.log("\nnav..footer KB", (chunk.length / 1024).toFixed(0));

// title
const title = (html.match(/<title>([^<]+)<\/title>/) || [])[1];
const desc = (html.match(/name="description" content="([^"]+)"/) || [])[1];
console.log("\ntitle:", title);
console.log("desc:", desc?.slice(0, 160));
