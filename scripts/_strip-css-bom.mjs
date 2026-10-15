import fs from "fs";

const files = [
  "c:/Tekcroft/app/franchise-seo.css",
  "c:/Tekcroft/app/local-seo.css",
  "c:/Tekcroft/app/google-business-profile-optimization.css",
];

for (const p of files) {
  let s = fs.readFileSync(p, "utf8");
  const before = (s.match(/\uFEFF/g) || []).length;
  s = s.replace(/^\uFEFF/, "").replace(/\uFEFF/g, "");
  fs.writeFileSync(p, s);
  const after = (fs.readFileSync(p, "utf8").match(/\uFEFF/g) || []).length;
  console.log(p.split("/").pop(), { before, after });
}
