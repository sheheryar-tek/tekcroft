
/* ══════════════════════════════════════════════════════════════════════
   Two jobs the hero page did not need until now.

   1. .rv reveals. The class and its transition were already in the
      stylesheet, but nothing was adding .in, so anything marked .rv on
      this page would have stayed at opacity 0. This is the homepage's
      own observer, with the same safety sweep for anything scrolled
      past before it fired.

   2. The count-up, matching the homepage's figures: the number counts,
      the prefix and suffix are wrapped so they can be set smaller, and
      a reduced-motion preference gets the final value straight away.
      Each figure's markup already holds its finished text, so with JS
      off the panel still reads correctly.
   ══════════════════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  var $$ = function(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- reveal on scroll ---------------- */
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if (en.isIntersecting){ en.target.classList.add("in"); io.unobserve(en.target); }
    });
  }, { threshold:0, rootMargin:"0px 0px -70px 0px" });
  $$(".rv").forEach(function(el){ io.observe(el); });

  /* safety net: anything already above the fold shows without waiting */
  requestAnimationFrame(function(){
    $$(".rv").forEach(function(el){
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("in");
    });
  });

  /* ---------------- the client carousel ----------------
     The slide moves the track a flat -50%, so the second half has to be
     an exact copy of the first for the loop to be invisible. Doing it
     here rather than in the markup means the eight logos are written
     once. Under a reduced-motion preference the track does not move and
     is laid out as a static wrapped row, so the copy is skipped — it
     would only show every client twice. */
  var track = document.getElementById("tbMarq");
  if (track && !calm) track.innerHTML += track.innerHTML;

  /* ---------------- count-up ---------------- */  function countUp(el){
    var raw = el.getAttribute("data-count");
    var target = parseFloat(raw);
    if (isNaN(target)) return;
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    /* How many decimals the authored value carries decides how the count
       is rounded and printed. Without this a rating of 4.9 counts up to a
       flat 5, because Math.round was the only rounding here. An integer
       target has no decimals and keeps the thousands separator it had. */
    var dec = (String(raw).split(".")[1] || "").length;
    function affix(t){ return t ? '<i class="fig-af">' + t + '</i>' : ""; }
    function show(n){
      var v = dec ? n.toFixed(dec)
                  : (n >= 1000 ? n.toLocaleString("en-US") : n);
      return affix(prefix) + v + affix(suffix);
    }
    if (calm){ el.innerHTML = show(target); return; }
    var t0 = null, dur = 1400;
    function frame(t){
      if (t0 === null) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      var e = 1 - Math.pow(1 - p, 3);
      el.innerHTML = show(dec ? +(target * e).toFixed(dec) : Math.round(target * e));
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  var ioCount = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if (!en.isIntersecting) return;
      countUp(en.target);
      ioCount.unobserve(en.target);
    });
  }, { threshold:.4 });
  $$("[data-count]").forEach(function(el){ ioCount.observe(el); });
})();
