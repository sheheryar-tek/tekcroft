import fs from "fs";

const path = "c:/Tekcroft/lib/homepage-body.html";
let body = fs.readFileSync(path, "utf8");

function cutSection(idClass, label) {
  const re = new RegExp(
    `[\\s\\S]*?(<section[^>]*\\bid="${idClass}"[^>]*>)`,
    "m"
  );
  // find section start by id
  const startTag = body.indexOf(`id="${idClass}"`);
  if (startTag < 0) {
    console.log(label, "already gone");
    return;
  }
  const start = body.lastIndexOf("<section", startTag);
  // also eat preceding comment block (up to 4 comment lines before)
  let eatFrom = start;
  const before = body.slice(Math.max(0, start - 500), start);
  const commentStart = before.lastIndexOf("<!--");
  if (commentStart >= 0) {
    eatFrom = Math.max(0, start - 500) + commentStart;
    // include blank lines just before comments
    while (eatFrom > 0 && (body[eatFrom - 1] === "\n" || body[eatFrom - 1] === "\r")) {
      eatFrom--;
    }
  }

  // find matching closing </section> by depth
  let i = start;
  let depth = 0;
  while (i < body.length) {
    if (body.startsWith("<section", i)) {
      depth++;
      i = body.indexOf(">", i) + 1;
      continue;
    }
    if (body.startsWith("</section>", i)) {
      depth--;
      i += "</section>".length;
      if (depth === 0) {
        body = body.slice(0, eatFrom) + "\n" + body.slice(i);
        console.log("removed", label);
        return;
      }
      continue;
    }
    i++;
  }
  throw new Error("unclosed section " + label);
}

cutSection("blueprint", "blueprint");
cutSection("clients", "clients");

// clean orphan why-us comment if left
body = body.replace(
  /\n*<!-- ---------- WHY US, VARIANT 3 : the panel ---------- -->\n*/g,
  "\n"
);
body = body.replace(
  /\n*<!-- ============================================================ SELECTED WORK -->\n*/g,
  "\n"
);

if (body.includes('id="blueprint"') || body.includes('id="clients"')) {
  throw new Error("section still present");
}

fs.writeFileSync(path, body);
console.log("written", body.length);
