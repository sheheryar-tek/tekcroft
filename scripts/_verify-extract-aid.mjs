import fs from "fs";
const t = fs.readFileSync("scripts/extract-ai-development.mjs", "utf8");
console.log(t.slice(0, 900));
console.log("---");
const checks = {
  PREFIX: t.includes('PREFIX = "aid"'),
  SRC: t.includes("tekcroft-ai-development (2)"),
  css: t.includes("ai-development.css"),
  body: t.includes("ai-development-body.html"),
  js: t.includes("tekcroft-ai-development.js"),
  canonical: t.includes("/services/ai-development-services"),
  multi: t.includes("matches.length > 1"),
  aag: (t.match(/aag/g) || []).length,
  agentLeftover: (t.match(/ai-agent/g) || []).length,
};
console.log(checks);
