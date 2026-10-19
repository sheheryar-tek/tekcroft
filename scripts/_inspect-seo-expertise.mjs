import fs from "fs";

const html = fs.readFileSync("lib/seo-services-body.html", "utf8");
const m = html.match(/id="services"[\s\S]*?<\/section>/);
const s = m[0];
const imgs = [...s.matchAll(/<img[^>]+>/g)].map((x) => x[0]);
console.log("imgs", imgs.length);
imgs.forEach((img, i) => {
  const src = (img.match(/src="([^"]+)"/) || [])[1];
  const alt = (img.match(/alt="([^"]*)"/) || [])[1];
  const title = (img.match(/title="([^"]*)"/) || [])[1];
  console.log(i + 1, src);
  console.log("  alt:", alt);
  console.log("  title:", title);
});
const titles = [...s.matchAll(/tm-vt">([^<]+)/g)].map((x) => x[1]);
console.log("panels", titles);

// card headings
const heads = [...s.matchAll(/<h3>([^<]+)<\/h3>/g)].map((x) => x[1]);
console.log("h3s", heads);
