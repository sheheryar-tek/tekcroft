import fs from "fs";

const h = fs.readFileSync("lib/ai-development-body.html", "utf8");
const foot = h.indexOf("<!-- ============================================================ FOOTER");
const before = h.slice(0, foot);
const opens = (before.match(/<section[\s>]/g) || []).length;
const closes = (before.match(/<\/section>/g) || []).length;
console.log("sections", { opens, closes, unclosed: opens - closes });

const afterSections = before.lastIndexOf("</section>");
console.log("gap:", JSON.stringify(before.slice(afterSections, foot).slice(0, 300)));

// stack-based check for unclosed divs with interesting classes
const stack = [];
const re = /<\/?div\b[^>]*>/gi;
let m;
while ((m = re.exec(before))) {
  const tag = m[0];
  if (tag.startsWith("</")) {
    stack.pop();
  } else if (!/\/>$/.test(tag)) {
    const cls = (tag.match(/class="([^"]*)"/) || [, ""])[1];
    stack.push(cls);
  }
}
console.log("unclosed div classes (last 15):");
console.log(stack.slice(-15));
