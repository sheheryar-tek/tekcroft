/**
 * Surgical: drop !important only where it freezes gx* keyframe targets
 * inside unlock's #tech-v4 visual rules.
 */
import fs from "fs";

const unlockPath = "c:/Tekcroft/app/artificial-intelligence-services-unlock.css";
let css = fs.readFileSync(unlockPath, "utf8");

const startMarker =
  "/* realistic, moving visuals in the Technologies panes; motion runs on the open pane only */";
const endMarker =
  'html[data-design="raw"] .ai-tx h2,html[data-design="raw"] .ai-tx h2 span,html[data-design="raw"] .ai-tx h3{text-transform:none !important;}';

const start = css.indexOf(startMarker);
const end = css.indexOf(endMarker);
if (start < 0 || end < 0 || end <= start) {
  console.error("markers not found", { start, end });
  process.exit(1);
}

let block = css.slice(start, end);

/** Replace prop:!important with prop:value when selector/context matches freeze cases */
const fixes = [
  // Generative AI typing
  [/max-width:\s*0\s*!important/g, "max-width:0"],
  // Underline bars / progress width
  [/width:\s*0\s*!important/g, "width:0"],
  // Reveal clip
  [/clip-path:\s*inset\(0 100% 0 0\)\s*!important/g, "clip-path:inset(0 100% 0 0)"],
  // Forecast draw
  [/stroke-dashoffset:\s*320\s*!important/g, "stroke-dashoffset:320"],
  // RAG sweep start
  [/transform:\s*translateX\(-100%\)\s*!important/g, "transform:translateX(-100%)"],
  // CV items start off-screen + label hidden
  [/left:\s*-60px\s*!important/g, "left:-60px"],
  [/opacity:\s*0\s*!important/g, "opacity:0"],
  // Belt: shorthand background !important locks background-position
  [
    /(html\[data-design="raw"\] #tech-v4 \.g5-belt\{[^}]*?)background:\s*(repeating-linear-gradient\([^;]+?\))\s*!important/g,
    "$1background:$2",
  ],
  // gxHit / gxStep / gxTick need border-color free — split solid borders on animated nodes
  [
    /(html\[data-design="raw"\] #tech-v4 \.g4-docs span\{[^}]*?)border:\s*1px solid #E3ECF2\s*!important/g,
    "$1border-width:1px !important;border-style:solid !important;border-color:#E3ECF2",
  ],
  [
    /(html\[data-design="raw"\] #tech-v4 \.g6-steps span\{[^}]*?)border:\s*1px solid #E3ECF2\s*!important/g,
    "$1border-width:1px !important;border-style:solid !important;border-color:#E3ECF2",
  ],
  [
    /(html\[data-design="raw"\] #tech-v4 \.g6-steps i\{[^}]*?)border:\s*1\.5px solid hsl\(var\(--brand-h\) 60% 80%\)\s*!important/g,
    "$1border-width:1.5px !important;border-style:solid !important;border-color:hsl(var(--brand-h) 60% 80%)",
  ],
  [
    /(html\[data-design="raw"\] #tech-v4 \.g6-steps i\{[^}]*?)color:\s*transparent\s*!important/g,
    "$1color:transparent",
  ],
  // gxTick also sets background
  [
    /(html\[data-design="raw"\] #tech-v4 \.g6-steps i\{[^}]*?)(?<!-)background:\s*[^;]+?\s*!important/g,
    (full, lead) => {
      // only if background was transparent-like; leave as non-important initial via keyframes
      return full; // handled by color/border above; background starts transparent in keyframe
    },
  ],
];

let before = block;
for (const [re, rep] of fixes) {
  if (typeof rep === "function") block = block.replace(re, rep);
  else block = block.replace(re, rep);
}

// Fix truncated incomplete rule after the block
let after = css.slice(end);
const broken = /html\[data-design="raw"\] \.ai-tx\s*\n\s*\n\s*\n+#integ\.ig/;
if (broken.test(after)) {
  after = after.replace(
    broken,
    `html[data-design="raw"] .ai-tx[data-tvar]:not(.bv-show){display:none !important;}

html[data-design="raw"] #integ.ig`
  );
  console.log("fixed truncated .ai-tx rule");
}

css = css.slice(0, start) + block + after;
fs.writeFileSync(unlockPath, css);

const stillFrozen = [
  ...block.matchAll(
    /(max-width:\s*0|width:\s*0|clip-path:\s*inset\(0 100%|stroke-dashoffset:\s*320|left:\s*-60px|opacity:\s*0|transform:\s*translateX\(-100%\))[^;]*!important/g
  ),
].map((m) => m[0]);

console.log(
  JSON.stringify(
    {
      changed: before !== block,
      delta: before.length - block.length,
      stillFrozen,
      g1type: (block.match(/\.g1-type\{[^}]+\}/) || [])[0],
      g1l: (block.match(/\.g1-l\{[^}]+\}/) || [""])[0].slice(0, 200),
      g5belt: (block.match(/\.g5-belt\{[^}]+\}/) || [])[0],
      g5it: (block.match(/\.g5-it\{[^}]+\}/) || [])[0],
      g6prog: (block.match(/\.g6-prog b\{[^}]+\}/) || [])[0],
    },
    null,
    2
  )
);
