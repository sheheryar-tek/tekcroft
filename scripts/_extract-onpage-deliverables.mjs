import fs from "fs";

const ref = "c:/Users/Super/Downloads/tekcroft-onpage-seo (9).html";
const h = fs.readFileSync(ref, "utf8");

function extractSection(marker) {
  const start = h.indexOf(marker);
  if (start < 0) throw new Error("marker missing: " + marker);
  const tag = h.indexOf("<section", start);
  let i = tag;
  let depth = 0;
  let end = -1;
  while (i < h.length) {
    if (h.startsWith("<section", i)) {
      depth++;
      i = h.indexOf(">", i) + 1;
      continue;
    }
    if (h.startsWith("</section>", i)) {
      depth--;
      i += "</section>".length;
      if (depth === 0) {
        end = i;
        break;
      }
      continue;
    }
    i++;
  }
  if (end < 0) throw new Error("unclosed: " + marker);
  return h.slice(start, end);
}

function extractStyle(id) {
  const open = `<style id="${id}">`;
  const a = h.indexOf(open);
  if (a < 0) return null;
  const b = h.indexOf("</style>", a);
  return h.slice(a + open.length, b);
}

function extractScript(id) {
  const open = `<script id="${id}">`;
  const a = h.indexOf(open);
  if (a < 0) return null;
  const b = h.indexOf("</script>", a);
  return h.slice(a + open.length, b);
}

const out = "c:/Tekcroft/scripts/_extracted-onpage-deliverables";
fs.mkdirSync(out, { recursive: true });

const v5 = extractSection(
  "<!-- ══════════ DELIVERABLES · variant 5 (the panels) ══════════ -->"
);
const v6 = extractSection(
  "<!-- ══════════ DELIVERABLES · variant 6 (panels on a photo) ══════════ -->"
);
fs.writeFileSync(out + "/v5.html", v5);
fs.writeFileSync(out + "/v6.html", v6);

const styleIds = [
  "ac-styles",
  "ac-brand",
  "ac-viz",
  "ac-photo",
  "ac-cards",
  "vz-styles",
];
for (const id of styleIds) {
  const css = extractStyle(id);
  if (css) {
    fs.writeFileSync(out + `/${id}.css`, css);
    console.log("style", id, css.length);
  } else console.log("missing style", id);
}

const scriptIds = ["ac-script", "vz-script"];
for (const id of scriptIds) {
  const js = extractScript(id);
  if (js) {
    fs.writeFileSync(out + `/${id}.js`, js);
    console.log("script", id, js.length);
  } else console.log("missing script", id);
}

// Also find any other style that mentions .ac-card or services-2-v6
const allStyles = [...h.matchAll(/<style id="([^"]+)"[^>]*>([\s\S]*?)<\/style>/g)];
for (const m of allStyles) {
  if (
    /services-2-v6|ac-card|ac-photo|\.acv/.test(m[2]) &&
    !styleIds.includes(m[1])
  ) {
    fs.writeFileSync(out + `/${m[1]}.css`, m[2]);
    console.log("extra style", m[1], m[2].length);
  }
}

console.log("v5 bytes", v5.length, "v6 bytes", v6.length);
console.log("v6 has photo?", /ac-photo|background-image|url\(/.test(v6));
console.log(
  "v6 on item 1?",
  /data-i="1"[^>]*class="ac-item on"|class="ac-item on"[^>]*data-i="1"/.test(v6)
);
