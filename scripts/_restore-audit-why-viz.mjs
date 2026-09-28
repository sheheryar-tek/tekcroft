import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const bodyPath = path.join(ROOT, "lib", "seo-audit-services-body.html");
let body = fs.readFileSync(bodyPath, "utf8");

const panesStart = body.indexOf('      <div class="wy-panes">');
const panesEnd = body.indexOf("    </div>\n\n    <!-- PLACEHOLDER: leadership quote", panesStart);
if (panesStart < 0 || panesEnd < 0) {
  console.error("panes markers not found", panesStart, panesEnd);
  process.exit(1);
}

const panes = `      <div class="wy-panes">
        <div class="wy-pane on" role="tabpanel">
          <div class="wy-txt">
            <span class="wy-mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.8 20.2h16.4"/><path d="M6.6 20.2v-5M11 20.2V9.6M15.4 20.2v-7.6M19.8 20.2V6"/><path d="m6.6 11.4 4.4-4.6 3 2.2 4.4-4.6"/></svg></span>
            <h3>Revenue-first prioritization</h3>
            <p>not just a raw number of issues with no explanation</p>
          </div>
          <figure class="wy-fig">
            <figcaption><b>The fix list</b>
              <span class="wy-chip">Prioritized</span>
            </figcaption>
            <ul class="br"><li><span class="br-top"><span>Critical</span><b>68%</b></span>
                <span class="br-rail"><i style="--w:68%"></i></span></li><li><span class="br-top"><span>Important</span><b>24%</b></span>
                <span class="br-rail"><i style="--w:24%"></i></span></li><li><span class="br-top"><span>Monitor</span><b>8%</b></span>
                <span class="br-rail"><i style="--w:8%"></i></span></li></ul>
          </figure>
        </div>

        <div class="wy-pane" role="tabpanel">
          <div class="wy-txt">
            <span class="wy-mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4.2" y="6.2" width="15.6" height="12.4" rx="2.4"/><path d="M8 10.4h8M8 13.6h5.6"/><path d="M12 3.8v2.4"/></svg></span>
            <h3>Transparency in pricing</h3>
            <p>no lock-in or mandatory retainers after the auditing process</p>
          </div>
          <figure class="wy-fig">
            <figcaption><b>Engagement terms</b>
              <span class="wy-chip">No lock-in</span>
            </figcaption>
            <ul class="br"><li><span class="br-top"><span>Fixed audit scope</span><b>Yes</b></span>
                <span class="br-rail"><i style="--w:100%"></i></span></li><li><span class="br-top"><span>Mandatory retainer</span><b>No</b></span>
                <span class="br-rail"><i style="--w:8%"></i></span></li><li><span class="br-top"><span>Price shown up front</span><b>Yes</b></span>
                <span class="br-rail"><i style="--w:100%"></i></span></li></ul>
          </figure>
        </div>

        <div class="wy-pane" role="tabpanel">
          <div class="wy-txt">
            <span class="wy-mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.2 13.7 8 18.5 9.7 13.7 11.4 12 16.2 10.3 11.4 5.5 9.7 10.3 8Z"/><path d="M18.4 15.2 19.2 17.4l2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8Z"/></svg></span>
            <h3>AI Search (GEO) audit comes as part of the package</h3>
            <p>not as an extra costly option</p>
          </div>
          <figure class="wy-fig">
            <figcaption><b>Where the work goes</b>
              <span class="wy-chip">Included</span>
            </figcaption>
            <div class="dn-wrap">
              <svg class="dn" viewBox="0 0 120 120" role="img"
                   aria-label="Technical 28 per cent, Content 22, Backlinks 18, Competitors 14, AI search 12, Analytics 6">
                <circle class="dn-track" cx="60" cy="60" r="46"/>
                <g transform="rotate(-90 60 60)"><circle class="dn-s dn-1" cx="60" cy="60" r="46" stroke-dasharray="80.93 289.03" stroke-dashoffset="-0.00"/><circle class="dn-s dn-2" cx="60" cy="60" r="46" stroke-dasharray="63.59 289.03" stroke-dashoffset="-80.93"/><circle class="dn-s dn-3" cx="60" cy="60" r="46" stroke-dasharray="52.02 289.03" stroke-dashoffset="-144.52"/><circle class="dn-s dn-4" cx="60" cy="60" r="46" stroke-dasharray="34.68 289.03" stroke-dashoffset="-196.54"/></g>
              </svg>
              <span class="dn-mid"><b>GEO</b><em>Included</em></span>
              <ul class="dn-key"><li class="dn-1"><i></i><span>Technical</span><b>28%</b></li><li class="dn-2"><i></i><span>Content</span><b>22%</b></li><li class="dn-3"><i></i><span>Backlinks</span><b>18%</b></li><li class="dn-4"><i></i><span>AI search</span><b>12%</b></li></ul>
            </div>
          </figure>
        </div>

        <div class="wy-pane" role="tabpanel">
          <div class="wy-txt">
            <span class="wy-mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8.4" r="3.8"/><path d="M4.6 20.4a7.4 7.4 0 0 1 14.8 0"/></svg></span>
            <h3>One Senior strategist works from start to end</h3>
            <p>no hand-off rotation or junior members</p>
          </div>
          <figure class="wy-fig">
            <figcaption><b>Account ownership</b>
              <span class="wy-chip">Senior-led</span>
            </figcaption>
            <ul class="br"><li><span class="br-top"><span>Single strategist</span><b>100%</b></span>
                <span class="br-rail"><i style="--w:100%"></i></span></li><li><span class="br-top"><span>Hand-off rotation</span><b>0%</b></span>
                <span class="br-rail"><i style="--w:4%"></i></span></li><li><span class="br-top"><span>Junior pass-through</span><b>0%</b></span>
                <span class="br-rail"><i style="--w:4%"></i></span></li></ul>
          </figure>
        </div>

        <div class="wy-pane" role="tabpanel">
          <div class="wy-txt">
            <span class="wy-mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.6" y="5" width="16.8" height="15.4" rx="2.6"/><path d="M3.6 9.6h16.8M8.4 3.2v3.6M15.6 3.2v3.6"/></svg></span>
            <h3>5 to 10 days delivery time</h3>
            <p>confirmed before any process starts</p>
          </div>
          <figure class="wy-fig">
            <figcaption><b>Delivery window</b>
              <span class="wy-chip">Confirmed up front</span>
            </figcaption>
            <svg class="wyln" viewBox="0 0 320 136" fill="none" role="img"
                 aria-label="Audit progress rising from day one to day ten">
              <path class="wyln-area" d="M40,118 L40.0,108 L86.7,96 L133.3,82 L180.0,68 L226.7,48 L273.3,34 L300.0,22 L300,118 Z"/>
              <polyline class="wyln-line" points="40.0,108 86.7,96 133.3,82 180.0,68 226.7,48 273.3,34 300.0,22"/>
              <circle class="wyln-d" cx="40.0" cy="108" r="3.2"/><circle class="wyln-d" cx="86.7" cy="96" r="3.2"/><circle class="wyln-d" cx="133.3" cy="82" r="3.2"/><circle class="wyln-d" cx="180.0" cy="68" r="3.2"/><circle class="wyln-d" cx="226.7" cy="48" r="3.2"/><circle class="wyln-d" cx="273.3" cy="34" r="3.2"/><circle class="wyln-d" cx="300.0" cy="22" r="3.2"/>
              <text class="wyln-x" x="40.0" y="131">D1</text><text class="wyln-x" x="86.7" y="131">D3</text><text class="wyln-x" x="133.3" y="131">D4</text><text class="wyln-x" x="180.0" y="131">D5</text><text class="wyln-x" x="226.7" y="131">D7</text><text class="wyln-x" x="273.3" y="131">D8</text><text class="wyln-x" x="300.0" y="131">D10</text>
              <text class="wyln-y" x="32" y="121.0">0</text><text class="wyln-y" x="32" y="69.0">50%</text><text class="wyln-y" x="32" y="17.0">100%</text>
            </svg>
          </figure>
        </div>
      </div>
`;

body = body.slice(0, panesStart) + panes + body.slice(panesEnd);
fs.writeFileSync(bodyPath, body);
console.log("Restored why visuals");

const cssPath = path.join(ROOT, "app", "seo-audit-services.css");
let css = fs.readFileSync(cssPath, "utf8");
const mark = "/* why panes are copy-only now";
const i = css.indexOf(mark);
if (i >= 0) {
  css = css.slice(0, i).trimEnd() + "\n";
  fs.writeFileSync(cssPath, css);
  console.log("Removed single-column override");
}
