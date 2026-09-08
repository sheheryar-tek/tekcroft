/* === mm-script === */

/* ══════════════════════════════════════════════════════════════════════
   SERVICES MEGA MENU
   SERVICES is the single source of truth — the panel, the hero copy and
   the burger accordion are all built from it.
   ══════════════════════════════════════════════════════════════════════ */
(function(){
var SERVICES = [
  { title:"SEO", href:"/#services", icon:"chart", img:"team",
    items:[
      {name:"Ecommerce SEO Services", href:"/services/ecommerce-seo", note:"Rankings for product and category pages.", img:"table"},
      {name:"SEO Audit Services", href:"/#services", note:"Find what is holding the site back.", img:"mentor"},
      {name:"On-Page SEO Services", href:"/#services", note:"Titles, content and internal links.", img:"meeting"},
      {name:"Technical SEO Services", href:"/#services", note:"Crawling, speed and indexing fixes.", img:"devs"},
      {name:"AI SEO Services", href:"/#services", note:"Get cited inside AI answers.", img:"laptops"}
    ]},
  { title:"Local SEO", href:"/#services", icon:"pin", img:"keys",
    items:[
      {name:"Local SEO Services", href:"/#services", note:"Rank across your whole service area.", img:"keys"},
      {name:"Google Business Profile Optimization", href:"/#services", note:"Turn the listing into calls and visits.", img:"docs"},
      {name:"Franchise SEO Services", href:"/#services", note:"One system across every location.", img:"meeting"}
    ]},
  { title:"Web and Software Development", href:"/#services", icon:"code", img:"laptops",
    items:[
      {name:"Web Design and Development Services", href:"/#services", note:"Sites built to convert, not just to look good.", img:"laptops"},
      {name:"Software Development Services", href:"/#services", note:"Custom platforms and internal tools.", img:"devs"},
      {name:"Mobile App Development Services", href:"/#services", note:"iOS and Android, one codebase.", img:"table"}
    ]},
  { title:"AI Development and Automation", href:"/#services", icon:"chip", img:"devs",
    items:[
      {name:"AI Development Services", href:"/#services", note:"Models wired into your own stack.", img:"devs"},
      {name:"AI Chatbot Development Services", href:"/#services", note:"Answer customers day and night.", img:"mentor"},
      {name:"AI Agent Development Services", href:"/#services", note:"Run multi-step work end to end.", img:"meeting"}
    ]}
];

var BG = {
  team:"/images/contact-js1-f207a4ecb2.webp",
  keys:"/images/contact-js2-7092bd4a0e.webp",
  laptops:"/images/contact-js3-4d5ef9c7a5.webp",
  devs:"/images/contact-js4-d3a8bdb7b4.webp",
  meeting:"/images/contact-js5-fda6a66872.webp",
  table:"/images/contact-js6-98303d83e8.webp",
  docs:"/images/contact-js7-002d3a99e2.webp",
  mentor:"/images/contact-js8-b5a1342f92.webp"
};
var BG_IDLE = 'meeting';
var BG_KEYS = Object.keys(BG);

var ICONS = {
  chart:'<path d="M5 19V5"/><path d="M9.5 19v-6.5"/><path d="M14 19V9"/><path d="M18.5 19v-4"/>',
  pin:'<path d="M19.5 10.4c0 4.9-7.5 10.4-7.5 10.4S4.5 15.3 4.5 10.4a7.5 7.5 0 0 1 15 0Z"/><circle cx="12" cy="10.3" r="2.5"/>',
  code:'<path d="M8.6 8 4.4 12l4.2 4"/><path d="M15.4 8l4.2 4-4.2 4"/><path d="M13.2 5.6 10.8 18.4"/>',
  chip:'<rect x="7" y="7" width="10" height="10" rx="2.2"/><path d="M10 3.6v3.4M14 3.6v3.4M10 17v3.4M14 17v3.4M3.6 10H7M3.6 14H7M17 10h3.4M17 14h3.4"/>'
};
var DOWN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
function ic(n){ return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+ICONS[n]+'</svg>'; }
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

var panel = document.getElementById('mmPanel');
var btn   = document.getElementById('mmTrigger');
if(!panel || !btn) return;

/* ── one column per core service ── */
document.getElementById('mmCols').innerHTML = SERVICES.map(function(s){
  return '<div class="mm-svc-col">'
    + '<a class="mm-gp" href="'+s.href+'" data-img="'+s.img+'" data-title="'+esc(s.title)+'"'
    + ' data-note="Everything under '+esc(s.title)+'.">'+esc(s.title)+'</a>'
    + s.items.map(function(it){
        return '<a class="mm-row" href="'+it.href+'" data-img="'+it.img+'"'
          + ' data-title="'+esc(it.name)+'" data-note="'+esc(it.note)+'">'
          + '<span class="mm-dot">'+ic(s.icon)+'</span>'
          + '<span><span class="mm-n">'+esc(it.name)+'</span>'
          + '<span class="mm-dsc">'+esc(it.note)+'</span></span></a>';
      }).join('')
    + '</div>';
}).join('');

/* ── the hero image stack ── */
var stack = panel.querySelector('.mm-stack');
stack.innerHTML = BG_KEYS.map(function(k){
  return '<img src="'+BG[k]+'" alt="" loading="lazy" data-key="'+k+'"'+(k===BG_IDLE?' data-on="true"':'')+'>';
}).join('');
function showBg(key){
  var want = key || BG_IDLE;
  [].slice.call(stack.children).forEach(function(img){
    img.setAttribute('data-on', img.dataset.key === want ? 'true' : 'false');
  });
}

/* ── open, close, and the caret that points at the trigger ── */
var hideTimer = null, showTimer = null;
var titleEl = panel.querySelector('.mm-title'), noteEl = panel.querySelector('.mm-note');
var baseTitle = titleEl.textContent, baseNote = noteEl.textContent;

function placeCaret(){
  var box = panel.querySelector('.mm-panel').getBoundingClientRect();
  var r = btn.getBoundingClientRect();
  panel.querySelector('.mm-caret').style.setProperty('--caret-x', (r.left + r.width/2 - box.left) + 'px');
}
function reset(){
  showBg(null);
  titleEl.textContent = baseTitle;
  noteEl.textContent  = baseNote;
}
function open(){
  clearTimeout(hideTimer);
  panel.hidden = false;
  btn.setAttribute('aria-expanded','true');
  placeCaret();
}
function close(){
  clearTimeout(showTimer);
  panel.hidden = true;
  btn.setAttribute('aria-expanded','false');
  reset();
}
function closeSoon(){ clearTimeout(hideTimer); hideTimer = setTimeout(close, 180); }

btn.addEventListener('click', function(e){ e.stopPropagation(); panel.hidden ? open() : close(); });
btn.addEventListener('mouseenter', function(){ clearTimeout(hideTimer); showTimer = setTimeout(open, 90); });
btn.addEventListener('mouseleave', function(){ clearTimeout(showTimer); closeSoon(); });

panel.addEventListener('mouseenter', function(){ clearTimeout(hideTimer); });
panel.addEventListener('mouseleave', closeSoon);
panel.addEventListener('click', function(e){ if(e.target.closest('a,[data-modal]')) close(); });

/* the photograph and the hero copy follow whatever is hovered */
var follow = function(e){
  var hit = e.target.closest('.mm-row,.mm-gp');
  if(!hit) return;
  showBg(hit.dataset.img);
  titleEl.textContent = hit.dataset.title;
  noteEl.textContent  = hit.dataset.note;
};
panel.addEventListener('mouseover', follow);
panel.addEventListener('focusin', follow);
panel.querySelector('.mm-svc-cols').addEventListener('mouseleave', reset);

document.addEventListener('click', function(e){
  if(!panel.hidden && !e.target.closest('.mm') && e.target !== btn) close();
});
document.addEventListener('keydown', function(e){
  if(e.key === 'Escape' && !panel.hidden){ close(); btn.focus(); }
});
window.addEventListener('resize', function(){ if(!panel.hidden) placeCaret(); });
window.addEventListener('scroll', function(){ if(!panel.hidden) placeCaret(); }, {passive:true});

/* ── Services inside the burger menu ── */
var mslot = document.getElementById('mmMobile');
if(mslot){
  mslot.innerHTML = SERVICES.map(function(s,i){
    return '<button class="mm-acc" type="button" aria-expanded="false" aria-controls="mmacc'+i+'">'
      + esc(s.title) + DOWN + '</button>'
      + '<div class="mm-accp" id="mmacc'+i+'" data-open="false"><div>'
      + s.items.map(function(it){ return '<a href="'+it.href+'">'+esc(it.name)+'</a>'; }).join('')
      + '</div></div>';
  }).join('');
  mslot.addEventListener('click', function(e){
    var h = e.target.closest('.mm-acc');
    if(!h) return;
    var p = document.getElementById(h.getAttribute('aria-controls'));
    var isOpen = p.dataset.open === 'true';
    p.dataset.open = isOpen ? 'false' : 'true';
    h.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
  });
}
})();

/* === block-1 === */

(function(){
  "use strict";
  var $  = function(s, r){ return (r || document).querySelector(s); };
  var $$ = function(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------------- theme ---------------- */
  var root = document.documentElement;
  $$(".js-theme").forEach(function(btn){
    btn.addEventListener("click", function(){
      root.setAttribute("data-theme",
        root.getAttribute("data-theme") === "dark" ? "light" : "dark");
      btn.classList.toggle("spin");
    });
  });

  /* ---------------- button labels ----------------
     The ink wipe is a positioned ::before and would paint over a loose text
     node, so every button's own words get wrapped once, here. */
  $$(".btn").forEach(function(btn){
    if (btn.querySelector(".btn-label")) return;
    Array.prototype.slice.call(btn.childNodes).forEach(function(node){
      if (node.nodeType !== 3) return;
      var text = node.nodeValue.replace(/\s+/g, " ").trim();
      if (!text) return;
      var label = document.createElement("span");
      label.className = "btn-label";
      label.textContent = text;
      btn.replaceChild(label, node);
    });
  });

  /* ---------------- nav ---------------- */
  var nav = $("#nav"), burger = $(".js-burger"), mnav = $(".js-mnav");

  function navHeight(){
    if (nav) root.style.setProperty("--nav-h", nav.offsetHeight + "px");
  }
  navHeight();
  window.addEventListener("resize", navHeight);

  var queued = false;
  function onScroll(){
    queued = false;
    if (nav) nav.classList.toggle("stuck", window.scrollY > 12);
  }
  window.addEventListener("scroll", function(){
    if (queued) return;
    queued = true;
    requestAnimationFrame(onScroll);
  }, { passive:true });
  onScroll();

  function closeMenu(){
    if (!mnav) return;
    mnav.classList.remove("open");
    burger.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
  }
  if (burger && mnav){
    burger.addEventListener("click", function(){
      var open = mnav.classList.toggle("open");
      burger.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    mnav.addEventListener("click", function(e){ if (e.target.closest("a,button")) closeMenu(); });
  }

  /* every "Get a Free Proposal" points at whichever form is on screen */
  $$("[data-jump]").forEach(function(el){
    el.addEventListener("click", function(){
      var form = $(".hs:not([hidden]) form[data-lead]") || $("form[data-lead]");
      if (!form) return;
      closeMenu();
      form.scrollIntoView({ behavior:"smooth", block:"center" });
      var first = form.querySelector("input,select,textarea");
      if (first) setTimeout(function(){ first.focus({ preventScroll:true }); }, 420);
    });
  });

  /* ---------------- the hero's one entrance ---------------- */
  function play(sec){
    if (!sec) return;
    sec.classList.remove("play");
    void sec.offsetWidth;              /* let the removal land before it replays */
    sec.classList.add("play");
  }
  requestAnimationFrame(function(){
    requestAnimationFrame(function(){ play($(".hs:not([hidden])")); });
  });

  /* ---------------- variant switch ----------------
     Review control. Delete this block with its markup and styles once one
     of the two is chosen. */
  var sw = $(".vsw");
  if (sw){
    sw.addEventListener("click", function(e){
      var b = e.target.closest("button[data-variant]");
      if (!b) return;
      var want = b.dataset.variant;
      $$(".vsw button").forEach(function(x){
        x.setAttribute("aria-pressed", x.dataset.variant === want ? "true" : "false");
      });
      $$(".hs").forEach(function(sec){ sec.hidden = sec.id !== "hero-" + want; });
      play($("#hero-" + want));
      window.scrollTo({ top:0, behavior:"auto" });
    });
  }

  /* ---------------- why-section variant switch ----------------
     The same review control as the hero's, on its own attribute so the
     two switches cannot answer each other's clicks. Delete this block
     with its markup and styles once one of the two is chosen. */
  var swWhy = $(".vsw-why");
  if (swWhy){
    swWhy.addEventListener("click", function(e){
      var b = e.target.closest("button[data-why]");
      if (!b) return;
      var want = b.dataset.why;
      $$(".vsw-why button").forEach(function(x){
        x.setAttribute("aria-pressed", x.dataset.why === want ? "true" : "false");
      });
      var one = document.getElementById("why");
      var two = document.getElementById("why-2");
      if (one) one.hidden = want !== "1";
      if (two) two.hidden = want !== "2";
      /* the section that has just appeared has never been scrolled past,
         so its reveals would sit at opacity 0 until the next scroll */
      var shown = want === "1" ? one : two;
      if (shown) $$(".rv", shown).forEach(function(el){ el.classList.add("in"); });
    });
  }

  /* ---------------- the forms ----------------
     The rules hang off each field's own data-rule rather than an id, so the
     form can be moved or duplicated without touching the script. Nothing is
     checked until a person has tried to send once; after that every field
     re-checks itself as it is corrected. */
  var EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

  var RULES = {
    name   : function(v){ return v.length >= 2 ? "" : "Please tell us your name."; },
    email  : function(v){ return !v ? "Please add an email we can reply to."
                                    : EMAIL.test(v) ? "" : "That email does not look right."; },
    phone  : function(v){ return v.replace(/\D/g, "").length >= 7 ? ""
                                    : "Please add a number we can reach you on."; },
    service: function(v){ return v ? "" : "Pick the service you are after."; }
  };

  $$("form[data-lead]").forEach(function(form){
    var live = false;
    var fields = $$("[data-rule]", form);

    function check(el){
      var key = el.dataset.rule;
      var box = el.closest(".hs-field");
      var msg = RULES[key] ? RULES[key](el.value.trim()) : "";
      box.setAttribute("data-bad", msg ? "true" : "false");
      el.setAttribute("aria-invalid", msg ? "true" : "false");
      box.querySelector(".hs-err").textContent = msg;
      return !msg;
    }

    fields.forEach(function(el){
      ["input", "change", "blur"].forEach(function(ev){
        el.addEventListener(ev, function(){ if (live) check(el); });
      });
    });

    form.addEventListener("submit", function(e){
      e.preventDefault();
      live = true;
      var bad = null;
      fields.forEach(function(el){ if (!check(el) && !bad) bad = el; });
      if (bad){ bad.focus(); return; }
      form.setAttribute("data-sent", "true");
      form.scrollIntoView({ behavior:"smooth", block:"center" });
    });
  });
})();


/* === tb-script === */

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

  /* ---------------- count-up ---------------- */
  function countUp(el){
    var target = parseFloat(el.getAttribute("data-count"));
    if (isNaN(target)) return;
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    function affix(t){ return t ? '<i class="fig-af">' + t + '</i>' : ""; }
    function show(n){
      return affix(prefix) + (n >= 1000 ? n.toLocaleString("en-US") : n) + affix(suffix);
    }
    if (calm){ el.innerHTML = show(target); return; }
    var t0 = null, dur = 1400;
    function frame(t){
      if (t0 === null) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      var e = 1 - Math.pow(1 - p, 3);
      el.innerHTML = show(Math.round(target * e));
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


/* === ft-script === */

/* The footer's run of service names. One row written twice, because the
   slide travels exactly half the track — so the copy arrives where the
   original left and the loop has no seam. */
(function(){
  "use strict";
  var el = document.getElementById("ftMarq");
  if (!el) return;
  var row = ["SEO","Ecommerce SEO","Technical SEO","Product page SEO",
             "Category page SEO","Content optimization","Local SEO",
             "Answer engine visibility","Link building","CRO",
             "Analytics","Reporting"]
    .map(function(t){ return "<span>" + t + "</span><i></i>"; }).join("");
  el.innerHTML = row + row;
})();


/* === ct-hero-script === */

/* Publishes the pointer's place in the band as two numbers between -1 and
   1. Nothing else: which layer moves, and how far, is the stylesheet's,
   so the depths can be re-tuned without touching this.

   Reads are cheap but a pointermove fires far more often than the screen
   redraws, so the write is deferred to the next frame and any moves in
   between are dropped — one write per frame rather than one per event.
   Left alone on touch screens, where there is no pointer to follow. */
(function(){
  "use strict";
  var hero = document.querySelector(".ct-hero");
  if (!hero) return;
  if (!window.matchMedia("(hover: hover)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var x = 0, y = 0, queued = false;
  function write(){
    queued = false;
    hero.style.setProperty("--mx", x.toFixed(3));
    hero.style.setProperty("--my", y.toFixed(3));
  }
  hero.addEventListener("pointermove", function(e){
    var r = hero.getBoundingClientRect();
    x = (e.clientX - r.left) / r.width  * 2 - 1;
    y = (e.clientY - r.top)  / r.height * 2 - 1;
    if (queued) return;
    queued = true;
    requestAnimationFrame(write);
  });
  hero.addEventListener("pointerleave", function(){
    x = 0; y = 0;
    if (!queued){ queued = true; requestAnimationFrame(write); }
  });
})();
