import fs from "fs";

const html = fs.readFileSync(
  "c:/Tekcroft/.next/server/app/services/ai-seo-services.html",
  "utf8"
);
const refs = [...new Set(html.match(/aiseo-[a-z0-9.-]+\.webp/g) || [])];
console.log("refs", refs.length);
console.log(refs.join("\n"));

// Homepage component receives html as a prop - look for escaped body chunks
// Try to find a large unicode-escaped HTML blob containing nav
const markers = ["\\\\u003cnav", "\\u003cnav", "<nav class=\\\"nav"];
for (const mk of markers) {
  const i = html.indexOf(mk.replace(/\\\\/g, "\\"));
  console.log("marker", mk, "idx", html.indexOf(mk) >= 0 ? html.indexOf(mk) : i);
}

// brute: find self.__next_f.push lines with aiseo-tm
const lines = html.split("\n");
for (let li = 0; li < lines.length; li++) {
  if (lines[li].includes("aiseo-tm-01-b8d0910eb7")) {
    console.log("line", li, "len", lines[li].length);
    fs.writeFileSync("c:/Tekcroft/scripts/_rsc-chunk.txt", lines[li]);
    break;
  }
}
