import http from "http";

http
  .get("http://127.0.0.1:3000/services/technical-seo", (res) => {
    let d = "";
    res.on("data", (c) => (d += c));
    res.on("end", () => {
      console.log("id=model", d.includes('id="model"'));
      console.log("sec tm", d.includes('class="sec tm"'));
      console.log("tv-audit", d.includes("tv-audit"));
      console.log("data-tm", d.includes("data-tm"));
      console.log("old acv", d.includes('id="services-2"'));
      console.log("tm-item count", (d.match(/class="tm-item/g) || []).length);
    });
  })
  .on("error", (e) => {
    console.error(e.message);
    process.exit(1);
  });
