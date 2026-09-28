import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const bodyPath = path.join(ROOT, "lib", "seo-audit-services-body.html");
let body = fs.readFileSync(bodyPath, "utf8");

const start = body.indexOf(
  "<!-- ══════════════════════════════════════════════════════════════════\n     WHY CHOOSE US"
);
const end = body.indexOf(
  "<!-- ══════════════════════════════════════════════════════════════════\n     WHAT YOU RECEIVE"
);
if (start < 0 || end < 0) {
  console.error("markers not found", start, end);
  process.exit(1);
}

const section = `<!-- ══════════════════════════════════════════════════════════════════
     WHY CHOOSE US — homepage tabbed design, audit content only
     ══════════════════════════════════════════════════════════════════ -->
<section class="sec wy" id="why">
  <div class="wrap wy-in">

    <div class="wy-say rv">
      <span class="wy-eyebrow"><i></i>Why choose us</span>

      <h2>Why Businesses Choose TekCroft for <em>SEO Audits</em></h2>
      <p>TekCroft isn&rsquo;t a checklist agency that runs your site through scanner tools and declares it complete. We&rsquo;re a senior-led team that treats every audit as a diagnostic first, then an action plan, in an age where ranking depends on both Google and AI searches.</p>

      <!-- PLACEHOLDER figures: swap Founded / Years / Audits when real numbers are ready. -->
      <div class="wy-facts">
        <span class="wy-fact"><b>20xx</b><span>Founded</span></span>
        <i aria-hidden="true"></i>
        <span class="wy-fact"><b>x+</b><span>Years in SEO</span></span>
        <i aria-hidden="true"></i>
        <span class="wy-fact"><b>x+</b><span>Audits delivered</span></span>
      </div>
    </div>

    <div class="wy-box rv" style="--d:120ms" data-tabs>
      <div class="wy-rail" role="tablist" aria-label="Why choose us">
        <button class="wy-tab on" type="button" role="tab"
                data-p="0" aria-selected="true">Revenue-first</button>
        <button class="wy-tab" type="button" role="tab"
                data-p="1" aria-selected="false">Transparency</button>
        <button class="wy-tab" type="button" role="tab"
                data-p="2" aria-selected="false">AI Search (GEO)</button>
        <button class="wy-tab" type="button" role="tab"
                data-p="3" aria-selected="false">One strategist</button>
        <button class="wy-tab" type="button" role="tab"
                data-p="4" aria-selected="false">5 to 10 days</button>
      </div>

      <div class="wy-panes">
        <div class="wy-pane on" role="tabpanel">
          <div class="wy-txt">
            <h3>Revenue-first prioritization</h3>
            <p>not just a raw number of issues with no explanation</p>
          </div>
        </div>

        <div class="wy-pane" role="tabpanel">
          <div class="wy-txt">
            <h3>Transparency in pricing</h3>
            <p>no lock-in or mandatory retainers after the auditing process</p>
          </div>
        </div>

        <div class="wy-pane" role="tabpanel">
          <div class="wy-txt">
            <h3>AI Search (GEO) audit comes as part of the package</h3>
            <p>not as an extra costly option</p>
          </div>
        </div>

        <div class="wy-pane" role="tabpanel">
          <div class="wy-txt">
            <h3>One Senior strategist works from start to end</h3>
            <p>no hand-off rotation or junior members</p>
          </div>
        </div>

        <div class="wy-pane" role="tabpanel">
          <div class="wy-txt">
            <h3>5 to 10 days delivery time</h3>
            <p>confirmed before any process starts</p>
          </div>
        </div>
      </div>
    </div>

    <!-- PLACEHOLDER: leadership quote from the copy deck. -->
    <figure class="wy-quote rv" style="--d:200ms">
      <blockquote>Leadership Quote Here:</blockquote>
      <figcaption>[Founder/Lead strategist name] [Title] [tekCroft]</figcaption>
    </figure>

  </div>
</section>

`;

body = body.slice(0, start) + section + body.slice(end);
fs.writeFileSync(bodyPath, body);
console.log("Updated why section");

const cssPath = path.join(ROOT, "app", "seo-audit-services.css");
let css = fs.readFileSync(cssPath, "utf8");
const extra = `
/* why panes are copy-only now — single column, no chart column */
#why .wy-pane{grid-template-columns:minmax(0,1fr);}
#why .wy-txt{grid-column:1; max-width:62ch; margin-inline:auto; text-align:center;}
#why .wy-pane h3{text-wrap:balance;}
`;
const mark = "/* why panes are copy-only now";
if (!css.includes(mark)) {
  css = css.trimEnd() + "\n" + extra + "\n";
  fs.writeFileSync(cssPath, css);
  console.log("Updated CSS");
}
