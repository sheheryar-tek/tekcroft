const t = await (await fetch("http://127.0.0.1:3000/services/local-seo")).text();
const title = (t.match(/<title>([^<]*)<\/title>/) || [])[1];
const desc = (t.match(/name="description" content="([^"]*)"/) || [])[1];
console.log("title:", title);
console.log("desc:", desc);
