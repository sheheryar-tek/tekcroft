import fs from "fs";
const h = fs.readFileSync("c:/Tekcroft/_aiseo-main.html", "utf8");
const ids = [...new Set([...h.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]))];
console.log("ids", ids.join(", "));
console.log(
  "flags",
  {
    hsPoints: h.includes("hs-points"),
    dataTm: h.includes("data-tm"),
    dataWalk: h.includes("data-walk"),
    grTrack: h.includes("grTrack"),
    pfOrbit: h.includes("pf-orbit"),
    tbMarq: h.includes("tb-marq") || h.includes("tb-wall"),
    wkDeck: h.includes("wkDeck"),
    dataTabs: h.includes("data-tabs"),
    measure: h.includes('id="measure"'),
    results: h.includes('id="results"'),
  }
);
const imgs = [...h.matchAll(/<img[^>]+src="([^"]+)"/g)].map((m) => m[1]);
console.log("imgs", imgs);
const cssVarsUsed = [
  ...new Set([...h.matchAll(/var\((--[a-z0-9-]+)/gi)].map((m) => m[1])),
];
console.log(
  "css vars in html",
  cssVarsUsed.filter((v) => /shot|cs-|cta|cn-|pf-|mk-|faq/.test(v)).join(", ")
);

// section order
const secs = [...h.matchAll(/<section[^>]*\bid="([^"]+)"[^>]*>/g)].map((m) => m[1]);
console.log("order", secs.join(" -> "));
