import http from "http";

http
  .get("http://127.0.0.1:3000/services/technical-seo", (res) => {
    let d = "";
    res.on("data", (c) => (d += c));
    res.on("end", () => {
      console.log("crawl-check", d.includes("crawl-check"));
      console.log("A Crawler", d.includes("A Crawler"));
      console.log("Free Crawl", d.includes("Free Crawl"));
      console.log("platforms", d.includes('id="platforms"'));
    });
  })
  .on("error", (e) => {
    console.error(e.message);
    process.exit(1);
  });
