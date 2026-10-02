import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = path.join(ROOT, "app/seo-audit-services.css");
let css = fs.readFileSync(file, "utf8");

const old = `.vs{--vs-c1:36%; --vs-col:21.333%;   /* 36 + 21.333?3 = 100 */
  --vs-ai:hsl(222 24% 97.5%);
  /* the hero's overlay, on the hero's own token. Override it here to
     darken this section alone; change --veil to move both together. */
  --vs-veil:var(--veil);
  /* This section holds more rows than any other holds anything, so it
     runs tighter than the page default of clamp(58px,6vw,92px). The
     table is the reason: seven rows of the standard cell padding put
     the checklist under it a screenful further down than it needs to
     be, and nothing here rewards the extra scroll. */
  --sec-y:clamp(44px,4.4vw,68px);
  position:relative; isolation:isolate; color:#fff;
  /* Photo must show ? opaque --ground would cover it. */
  background:transparent !important;}
html[data-theme="dark"] .vs{--vs-ai:rgba(255,255,255,.045);}
#vs.vs,
#vs.sec,
.sec.vs[data-ground]{
  background:transparent !important;
}

/* Photograph + veil above transparent ground; content above both. */
.vs::before{content:none;}
.vs > .vs-bg{
  position:absolute; inset:0; z-index:0; pointer-events:none; overflow:hidden;}
.vs > .vs-bg img{
  position:absolute; inset:0; width:100%; height:100%;
  object-fit:cover; object-position:center; display:block;}
@media (min-width:901px) and (hover:hover){
  .vs{overflow:clip;}
  .vs > .vs-bg img{
    position:fixed; left:0; top:0;
    width:100vw; height:100vh;
    max-width:none;}
}
.vs::after{content:""; position:absolute; inset:0; z-index:1; pointer-events:none;
  background:var(--vs-veil);}
.vs > .wrap{position:relative; z-index:2;}`;

const neu = `.vs{--vs-c1:36%; --vs-col:21.333%;   /* 36 + 21.333*3 = 100 */
  --vs-ai:hsl(222 24% 97.5%);
  --vs-veil:var(--veil);
  --sec-y:clamp(44px,4.4vw,68px);
  position:relative; isolation:isolate; color:#fff;
  /* Keep section transparent so the photo shows; never use position:fixed
     on the photo — it paints over earlier sections (hero, who, etc.). */
  background:transparent !important;}
html[data-theme="dark"] .vs{--vs-ai:rgba(255,255,255,.045);}
#vs.vs,
#vs.sec,
.sec.vs[data-ground]{
  background:transparent !important;
}

/* Photograph clipped to this section only + veil + content above. */
.vs::before{content:none;}
.vs > .vs-bg{
  position:absolute; inset:0; z-index:0; pointer-events:none; overflow:hidden;}
.vs > .vs-bg img{
  position:absolute; inset:0; width:100%; height:100%;
  object-fit:cover; object-position:center; display:block;}
.vs::after{content:""; position:absolute; inset:0; z-index:1; pointer-events:none;
  background:var(--vs-veil);}
.vs > .wrap{position:relative; z-index:2;}`;

if (!css.includes("position:fixed; left:0; top:0;")) {
  // try fuzzy match on key lines
  const start = css.indexOf(".vs{--vs-c1:36%");
  const end = css.indexOf("/* ?? what the dark ground changes");
  if (start < 0 || end < 0) {
    console.error("markers missing", start, end);
    process.exit(1);
  }
  css = css.slice(0, start) + neu + "\n\n" + css.slice(end);
  fs.writeFileSync(file, css);
  console.log("patched via markers");
} else if (css.includes(old)) {
  css = css.replace(old, neu);
  fs.writeFileSync(file, css);
  console.log("patched exact");
} else {
  // encoding may differ on the ? character — use markers
  const start = css.indexOf(".vs{--vs-c1:36%");
  const end = css.indexOf(".vs .sec-head .sec-lede");
  if (start < 0 || end < 0) {
    console.error("fallback markers missing", start, end);
    process.exit(1);
  }
  css = css.slice(0, start) + neu + "\n\n" + css.slice(end);
  fs.writeFileSync(file, css);
  console.log("patched fallback");
}
