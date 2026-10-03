import fs from "fs";

const path = "lib/custom-software-development-body.html";
let s = fs.readFileSync(path, "utf8");

const start = s.indexOf('<section class="sec wc-sec" id="whyus"');
const end = s.indexOf('<section class="sec faq" id="faq"');
if (start < 0 || end < 0) {
  console.error("markers not found", { start, end });
  process.exit(1);
}

const next = `<section class="sec wy" id="why" data-ground="white">
  <div class="wrap wy-in">

    <div class="wy-say rv">
      <span class="smark"><b>Why choose us</b></span>
      <h2>Why Choose Tekcroft for <em>Custom Software Development</em></h2>
      <p>Here&rsquo;s what you get from Tekcroft, a custom software development company, on every project, regardless of project size.</p>
    </div>

    <div class="wy-box rv" style="--d:120ms" data-tabs>
      <div class="wy-rail" role="tablist" aria-label="Why choose Tekcroft for custom software development">
        <button class="wy-tab on" type="button" role="tab"
                data-p="0" aria-selected="true">You Own 100% of Your Code &amp; IP</button>
        <button class="wy-tab" type="button" role="tab"
                data-p="1" aria-selected="false">Senior Developers, Not Bait-and-Switch Junior Teams</button>
        <button class="wy-tab" type="button" role="tab"
                data-p="2" aria-selected="false">Enterprise-Grade Process, Priced for Growing Businesses</button>
        <button class="wy-tab" type="button" role="tab"
                data-p="3" aria-selected="false">Transparent Pricing, No Hidden Costs</button>
        <button class="wy-tab" type="button" role="tab"
                data-p="4" aria-selected="false">A Discovery-First Partner, Not a Ticket-Taking Vendor</button>
        <button class="wy-tab" type="button" role="tab"
                data-p="5" aria-selected="false">Long-Term Support, Not a One-and-Done Handoff</button>
      </div>

      <div class="wy-panes">
        <div class="wy-pane on" role="tabpanel">
          <div class="wy-txt">
            <span class="wy-mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 3h7l5 5v12a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 6 20V4.5A1.5 1.5 0 0 1 7.5 3z"/><path d="M14 3v5h5M9 13h6M9 16.5h4"/><path d="m9 10.2 1 1 2.2-2.2"/></svg></span>
            <h3>You Own 100% of Your Code &amp; IP</h3>
            <p>Full source code and all documentation and data are transferred to you without any exceptions.</p>
          </div>
          <figure class="wy-fig">
            <figcaption><b>What you get</b>
              <span class="wy-chip">On handover</span>
            </figcaption>
            <ul class="br"><li><span class="br-top"><span>Source code</span><b>Yours</b></span>
                <span class="br-rail"><i style="--w:100%"></i></span></li><li><span class="br-top"><span>Documentation</span><b>Handed over</b></span>
                <span class="br-rail"><i style="--w:92%"></i></span></li><li><span class="br-top"><span>Data</span><b>Exported to you</b></span>
                <span class="br-rail"><i style="--w:88%"></i></span></li></ul>
          </figure>
        </div>

        <div class="wy-pane" role="tabpanel">
          <div class="wy-txt">
            <span class="wy-mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16.5 7.2a2.8 2.8 0 1 0-5.6 0 2.8 2.8 0 0 0 5.6 0z"/><path d="M6.8 9a2.2 2.2 0 1 0-4.4 0 2.2 2.2 0 0 0 4.4 0zM21.6 9a2.2 2.2 0 1 0-4.4 0 2.2 2.2 0 0 0 4.4 0z"/><path d="M13.7 12.2c-3.1 0-5.6 2-5.6 4.6V19h11.2v-2.2c0-2.6-2.5-4.6-5.6-4.6z"/><path d="M6.2 14.4c-1.9.3-3.4 1.7-3.4 3.4V19h2.4M17.8 14.4c1.9.3 3.4 1.7 3.4 3.4V19h-2.4"/></svg></span>
            <h3>Senior Developers, Not Bait-and-Switch Junior Teams</h3>
            <p>The engineers on your initial call are the developers who build out your software.</p>
          </div>
          <figure class="wy-fig">
            <figcaption><b>Who builds it</b>
              <span class="wy-chip">Same people</span>
            </figcaption>
            <ul class="br"><li><span class="br-top"><span>Named engineers</span><b>On the call</b></span>
                <span class="br-rail"><i style="--w:100%"></i></span></li><li><span class="br-top"><span>Same people on the build</span><b>No hand-off</b></span>
                <span class="br-rail"><i style="--w:90%"></i></span></li><li><span class="br-top"><span>Every review</span><b>Same team</b></span>
                <span class="br-rail"><i style="--w:84%"></i></span></li></ul>
          </figure>
        </div>

        <div class="wy-pane" role="tabpanel">
          <div class="wy-txt">
            <span class="wy-mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.4 7.2h15.2v11.2H4.4z"/><path d="M8 7.2V5.4h8v1.8"/><path d="M8.6 12.2h6.8M8.6 15.4h4.4"/></svg></span>
            <h3>Enterprise-Grade Process, Priced for Growing Businesses</h3>
            <p>Same rigorous discovery, architectural, and QA processes that Fortune 1000 companies get, without enterprise-level overhead.</p>
          </div>
          <figure class="wy-fig">
            <figcaption><b>Always included</b>
              <span class="wy-chip">Every project</span>
            </figcaption>
            <ul class="br"><li><span class="br-top"><span>Discovery</span><b>Screen by screen</b></span>
                <span class="br-rail"><i style="--w:100%"></i></span></li><li><span class="br-top"><span>Architecture</span><b>Approved up front</b></span>
                <span class="br-rail"><i style="--w:92%"></i></span></li><li><span class="br-top"><span>QA</span><b>Alongside the build</b></span>
                <span class="br-rail"><i style="--w:86%"></i></span></li></ul>
          </figure>
        </div>

        <div class="wy-pane" role="tabpanel">
          <div class="wy-txt">
            <span class="wy-mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.6" y="5" width="16.8" height="14.4" rx="2.4"/><path d="M3.6 9.4h16.8M8.2 3.6v3.2M15.8 3.6v3.2"/></svg></span>
            <h3>Transparent Pricing, No Hidden Costs</h3>
            <p>You see the full engagement looks like end-to-end, before making any commitment.</p>
          </div>
          <figure class="wy-fig">
            <figcaption><b>Agreed before you sign</b>
              <span class="wy-chip">In writing</span>
            </figcaption>
            <ul class="br"><li><span class="br-top"><span>Scope</span><b>Written</b></span>
                <span class="br-rail"><i style="--w:100%"></i></span></li><li><span class="br-top"><span>Cost</span><b>Per milestone</b></span>
                <span class="br-rail"><i style="--w:90%"></i></span></li><li><span class="br-top"><span>Timeline</span><b>Dated</b></span>
                <span class="br-rail"><i style="--w:84%"></i></span></li></ul>
          </figure>
        </div>

        <div class="wy-pane" role="tabpanel">
          <div class="wy-txt">
            <span class="wy-mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="6.4"/><path d="m20 20-4.4-4.4"/></svg></span>
            <h3>A Discovery-First Partner, Not a Ticket-Taking Vendor</h3>
            <p>We resolve process confusion before you build it into software.</p>
          </div>
          <figure class="wy-fig">
            <figcaption><b>Before the first sprint</b>
              <span class="wy-chip">Discovery</span>
            </figcaption>
            <ul class="br"><li><span class="br-top"><span>Real process mapped</span><b>First</b></span>
                <span class="br-rail"><i style="--w:100%"></i></span></li><li><span class="br-top"><span>Contradictions raised early</span><b>Before code</b></span>
                <span class="br-rail"><i style="--w:90%"></i></span></li><li><span class="br-top"><span>Scope signed off</span><b>In writing</b></span>
                <span class="br-rail"><i style="--w:84%"></i></span></li></ul>
          </figure>
        </div>

        <div class="wy-pane" role="tabpanel">
          <div class="wy-txt">
            <span class="wy-mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.6 2.6M15.4 15.4 18 18M6 18l2.6-2.6M15.4 8.6 18 6"/></svg></span>
            <h3>Long-Term Support, Not a One-and-Done Handoff</h3>
            <p>Hosting, patches, and ongoing feature updates continue long past launch.</p>
          </div>
          <figure class="wy-fig">
            <figcaption><b>After launch</b>
              <span class="wy-chip">Same team</span>
            </figcaption>
            <ul class="br"><li><span class="br-top"><span>Hosting &amp; monitoring</span><b>Ongoing</b></span>
                <span class="br-rail"><i style="--w:100%"></i></span></li><li><span class="br-top"><span>Patches</span><b>On schedule</b></span>
                <span class="br-rail"><i style="--w:90%"></i></span></li><li><span class="br-top"><span>Feature updates</span><b>Same team</b></span>
                <span class="br-rail"><i style="--w:84%"></i></span></li></ul>
          </figure>
        </div>
      </div>

      <div class="wy-cta">
        <p>That&rsquo;s what makes Tekcroft a software development services company built for real partnerships, not one-off tickets.</p>
        <button class="btn btn-primary btn-lg" type="button" data-jump>Book a Free Discovery Call <span class="arw">&uarr;</span></button>
      </div>
    </div>

  </div>
</section>

`;

s = s.slice(0, start) + next + s.slice(end);
fs.writeFileSync(path, s);
console.log("ok", { start, end, len: next.length });
