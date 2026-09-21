import fs from "fs";
const html = fs.readFileSync(
  "c:/Users/Super/Desktop/TK FINAL/Services/Web Design and Development/tekcroft-web-design (2).html",
  "utf8"
);
const styles = [...html.matchAll(/<style id="([^"]+)">/g)].map((m) => m[1]);
console.log("STYLES\n" + styles.join("\n"));
const scripts = [...html.matchAll(/<script([^>]*)>/g)].map((m) => {
  return (m[1].match(/id="([^"]+)"/) || [])[1] || "anon";
});
console.log("SCRIPTS\n" + scripts.join("\n"));
const title = (html.match(/<title>([^<]+)<\/title>/) || [])[1];
const desc = (html.match(/name="description" content="([^"]+)"/) || [])[1];
console.log("\nTITLE", title);
console.log("DESC", desc?.slice(0, 200));
