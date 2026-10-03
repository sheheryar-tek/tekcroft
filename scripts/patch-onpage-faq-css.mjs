import fs from "fs";

const p = "app/on-page-seo.css";
let s = fs.readFileSync(p, "utf8");
const start = s.indexOf("/* === faq-pics === */");
const end = s.indexOf("/* === rhythm-styles === */");
if (start < 0 || end < 0) {
  console.error({ start, end });
  process.exit(1);
}

const next = `/* === faq-pics === */
/* the original single photo is replaced by the stack */
.faq-aside::before{ content:none; }

.faq-aside > .faq-pics{position:absolute; inset:0; z-index:0;
  overflow:hidden; border-radius:inherit; pointer-events:none;
  transition:transform 1.6s var(--ease);}
.faq-aside:hover > .faq-pics{ transform:scale(1.05); }

/* Single FAQ photo — same overlay strength as tekcroft default. */
#faq .faq-pic{position:absolute; inset:0; background:none; opacity:1;}
#faq .faq-pic > img{position:absolute; inset:0; width:100%; height:100%;
  object-fit:cover; object-position:center; display:block;}
#faq .faq-aside::after{
  background:
    radial-gradient(780px 440px at 50% 48%, rgba(0,0,0,.45) 0%, transparent 72%),
    linear-gradient(180deg, rgba(0,0,0,.42) 0%, rgba(0,0,0,.52) 42%,
                    rgba(0,0,0,.92) 100%);}

@media (prefers-reduced-motion:reduce){
  .faq-aside:hover > .faq-pics{ transform:none; }
}

`;

s = s.slice(0, start) + next + s.slice(end);
fs.writeFileSync(p, s);
console.log("ok", { start, end });
