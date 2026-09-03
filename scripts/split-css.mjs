import fs from "fs";

const cssPath = "app/tekcroft.css";
const css = fs.readFileSync(cssPath, "utf8");

// Only defer the Google Reviews block at the end — safe for first paint
let splitAt = css.lastIndexOf("\n.revs{");
if (splitAt < 0) splitAt = css.lastIndexOf("\n.gr-track");
if (splitAt < 0) {
  console.log("No safe deferred split; leaving CSS intact");
  process.exit(0);
}

const critical = css.slice(0, splitAt);
const deferred = "/* deferred: reviews */\n" + css.slice(splitAt);
fs.writeFileSync(cssPath, critical);
fs.writeFileSync("app/tekcroft-deferred.css", deferred);
console.log(
  `critical ${(critical.length / 1024).toFixed(0)}KB, deferred ${(deferred.length / 1024).toFixed(0)}KB`
);
