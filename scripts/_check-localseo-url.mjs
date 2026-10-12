const newUrl = await fetch("http://127.0.0.1:3000/services/local-seo-services");
const t = await newUrl.text();
console.log("new status", newUrl.status);
console.log("canonical", (t.match(/rel="canonical" href="([^"]+)"/) || [])[1]);
console.log("title", (t.match(/<title>([^<]*)<\/title>/) || [])[1]);

const old = await fetch("http://127.0.0.1:3000/services/local-seo", {
  redirect: "manual",
});
console.log("old status", old.status);
console.log("old location", old.headers.get("location"));
