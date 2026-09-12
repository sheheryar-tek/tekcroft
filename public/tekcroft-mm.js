
/* ══════════════════════════════════════════════════════════════════════
   SERVICES MEGA MENU
   SERVICES is the single source of truth — the panel, the hero copy and
   the burger accordion are all built from it.
   ══════════════════════════════════════════════════════════════════════ */
(function(){
var SERVICES = [
  { title:"SEO", href:"#services", icon:"chart", img:"team",
    items:[
      {name:"Ecommerce SEO Services", href:"/services/ecommerce-seo", note:"Rankings for product and category pages.", img:"table"},
      {name:"SEO Audit Services", href:"/services/seo-audit-services", note:"Find what is holding the site back.", img:"mentor"},
      {name:"On-Page SEO Services", href:"#services", note:"Titles, content and internal links.", img:"meeting"},
      {name:"Technical SEO Services", href:"/services/technical-seo", note:"Crawling, speed and indexing fixes.", img:"devs"},
      {name:"AI SEO Services", href:"#services", note:"Get cited inside AI answers.", img:"laptops"}
    ]},
  { title:"Local SEO", href:"#services", icon:"pin", img:"keys",
    items:[
      {name:"Local SEO Services", href:"#services", note:"Rank across your whole service area.", img:"keys"},
      {name:"Google Business Profile Optimization", href:"#services", note:"Turn the listing into calls and visits.", img:"docs"},
      {name:"Franchise SEO Services", href:"#services", note:"One system across every location.", img:"meeting"}
    ]},
  { title:"Web and Software Development", href:"#services", icon:"code", img:"laptops",
    items:[
      {name:"Web Design and Development Services", href:"#services", note:"Sites built to convert, not just to look good.", img:"laptops"},
      {name:"Software Development Services", href:"#services", note:"Custom platforms and internal tools.", img:"devs"},
      {name:"Mobile App Development Services", href:"#services", note:"iOS and Android, one codebase.", img:"table"}
    ]},
  { title:"AI Development and Automation", href:"#services", icon:"chip", img:"devs",
    items:[
      {name:"AI Development Services", href:"#services", note:"Models wired into your own stack.", img:"devs"},
      {name:"AI Chatbot Development Services", href:"#services", note:"Answer customers day and night.", img:"mentor"},
      {name:"AI Agent Development Services", href:"#services", note:"Run multi-step work end to end.", img:"meeting"}
    ]}
];

var BG = {
  team:"/images/mm-team.webp",
  keys:"/images/mm-keys.webp",
  laptops:"/images/mm-laptops.webp",
  devs:"/images/mm-devs.webp",
  meeting:"/images/mm-meeting.webp",
  table:"/images/mm-table.webp",
  docs:"/images/mm-docs.webp",
  mentor:"/images/mm-mentor.webp"
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
  return '<img src="'+BG[k]+'" alt="" width="760" height="507" loading="lazy" decoding="async" data-key="'+k+'"'+(k===BG_IDLE?' data-on="true"':'')+'>';
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


/* ---------------- FAQ accordion ----------------
   One open at a time. The panel is a grid row moving between 0fr and 1fr,
   so it opens to whatever height its own text needs and nothing has to be
   measured; height:auto cannot be transitioned, and measuring scrollHeight
   forces a layout on every open. */
(function(){
  var list = document.querySelector('.faq-list');
  if(!list) return;
  list.addEventListener('click', function(e){
    var btn = e.target.closest('.faq-q');
    if(!btn) return;
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    var isOpen = btn.getAttribute('aria-expanded') === 'true';
    list.querySelectorAll('.faq-q').forEach(function(b){
      b.setAttribute('aria-expanded','false');
      document.getElementById(b.getAttribute('aria-controls')).dataset.open = 'false';
    });
    if(!isOpen){
      btn.setAttribute('aria-expanded','true');
      panel.dataset.open = 'true';
    }
  });
})();


/* ---------------- reviews ----------------
   The same three reviews the rotating quote used, shown together. The row
   is a grid at full width and a snap track below that; the arrows and dots
   only appear where it actually scrolls. */
(function(){
  var track = document.getElementById('grTrack');
  if(!track) return;

  /* PLACEHOLDER REVIEWS — same status as the three the rotating quote
     carried: written for layout, not collected from clients. Replace every
     one of these with the real Google review before this goes live. */
  var GR = [
    { name:"Dana Whitfield", initials:"DW", guide:true,
      meta:"24 reviews \u00b7 6 photos", when:"2 weeks ago",
      text:"We had three agencies before this one. TekCroft is the first that could tell me, in one sentence, what my money bought last month.",
      tags:["SEO","Paid Media","B2B SaaS"], helpful:24 },
    { name:"Marcus Reyes", initials:"MR", guide:false,
      meta:"8 reviews \u00b7 2 photos", when:"1 month ago",
      text:"They rebuilt the site and then ranked it. Not having to referee between two vendors was worth the fee on its own.",
      tags:["Web Build","SEO"], helpful:18 },
    { name:"Priya Raman", initials:"PR", guide:false,
      meta:"11 reviews", when:"2 months ago",
      text:"The free review found a redirect chain that had been eating a third of our organic traffic for two years. They sent it before we paid them anything.",
      tags:["Technical SEO","Audit"], helpful:32 },
    { name:"Elena Fischer", initials:"EF", guide:true,
      meta:"31 reviews \u00b7 4 photos", when:"3 months ago",
      text:"Placeholder review. One strategist owns the account, the dashboard is live, and the monthly call is about decisions rather than screenshots.",
      tags:["Local SEO","Reporting"], helpful:15 },
    { name:"Tobias Lang", initials:"TL", guide:false,
      meta:"6 reviews", when:"4 months ago",
      text:"Placeholder review. Audit in week one, strategy in week two, campaigns live in week four, and nothing in between that we had to chase.",
      tags:["Onboarding","Paid Media"], helpful:9 },
    { name:"Amara Diallo", initials:"AD", guide:false,
      meta:"17 reviews \u00b7 1 photo", when:"5 months ago",
      text:"Placeholder review. They said no to two things we asked for and explained why, which is the part that made us trust the rest of it.",
      tags:["Ecommerce SEO","CRO"], helpful:21 }
  ];

  var STAR = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 3.6 2.7 5.5 6 .9-4.35 4.25 1.03 6L12 17.42 6.62 20.25l1.03-6L3.3 10l6-.9z"/></svg>';
  function stars(n){
    var out = '';
    for (var i = 0; i < 5; i++) out += STAR;
    return '<span class="gr-stars" role="img" aria-label="Rated ' + n + ' out of 5">' + out + '</span>';
  }
  function esc(t){ return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  track.innerHTML = GR.map(function(r){
    return '<article class="gr-card">'
      + '<div class="gr-top">'
      +   '<span class="gr-av" aria-hidden="true">' + esc(r.initials) + '</span>'
      +   '<span class="gr-who"><b>' + esc(r.name)
      +     (r.guide ? '<span class="gr-guide">Local Guide</span>' : '') + '</b>'
      +     '<span>' + esc(r.meta) + '</span></span>'
      +   '<span class="gr-kebab" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="12" cy="19" r="1.7"/></svg></span>'
      + '</div>'
      + '<div class="gr-meta">' + stars(5) + '<span class="gr-when">' + esc(r.when) + '</span></div>'
      + '<p class="gr-text">' + esc(r.text) + '</p>'
      + '<div class="gr-tags">' + r.tags.map(function(t){
            return '<span class="gr-tag">' + esc(t) + '</span>'; }).join('') + '</div>'
      + '<div class="gr-foot">'
      +   '<button type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10.5v9H4.5v-9Z"/><path d="M7 10.5 11 3a2 2 0 0 1 2 2v4h5.4a1.6 1.6 0 0 1 1.6 2l-1.5 7a2 2 0 0 1-2 1.5H7Z"/></svg>Helpful (' + r.helpful + ')</button>'
      +   '<button type="button">Share</button>'
      + '</div></article>';
  }).join('');

  /* the rating shown in the bar */
  var starSlot = document.getElementById('grBarStars');
  if (starSlot) starSlot.innerHTML = stars(4.8);

  /* arrows and dots — one page per card's worth of scroll */
  var prev = document.getElementById('grPrev'),
      next = document.getElementById('grNext'),
      dots = document.getElementById('grDots');
  if(!prev || !next || !dots) return;

  /* The controls belong to the content, not to the breakpoint: they show
     whenever there is more than one page of cards and hide when the row
     fits, at any width. */
  var nav = dots.parentElement;

  /* The gap is read off the track rather than hard-coded, so the step stays
     right as the layout's clamp() resolves differently at each width. */
  function step(){
    var card = track.firstElementChild;
    if(!card) return 1;
    var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;
    return Math.max(1, card.offsetWidth + gap);
  }
  function perView(){ return Math.max(1, Math.round(track.clientWidth / step())); }
  function pages(){ return Math.max(1, track.children.length - perView() + 1); }
  function at(){ return Math.round(track.scrollLeft / step()); }

  function paint(){
    /* PERF_MM_V2: read layout first, write later (avoids forced reflow) */
    var sw = track.scrollWidth, cw = track.clientWidth, sl = track.scrollLeft;
    var scrolls = sw - cw > 4;
    var stepW = 1;
    if (scrolls){
      var card = track.children[0];
      if (card){
        var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;
        stepW = Math.max(1, card.offsetWidth + gap);
      }
    }
    nav.style.display = scrolls ? 'flex' : 'none';
    if(!scrolls) return;

    var pv = Math.max(1, Math.round(cw / stepW));
    var n = Math.max(1, track.children.length - pv + 1);
    var i = Math.min(Math.round(sl / stepW), n - 1);
    if (dots.children.length !== n){
      dots.innerHTML = '';
      for (var k = 0; k < n; k++){
        var b = document.createElement('button');
        b.className = 'gr-dot'; b.type = 'button';
        b.setAttribute('aria-label', 'Go to review ' + (k + 1));
        b.dataset.i = k;
        dots.appendChild(b);
      }
    }
    [].slice.call(dots.children).forEach(function(b, k){
      b.setAttribute('aria-current', k === i ? 'true' : 'false');
    });
    prev.disabled = i <= 0;
    next.disabled = i >= n - 1;
  }
  function go(dir){ track.scrollBy({ left: dir * step(), behavior:'smooth' }); }

  prev.addEventListener('click', function(){ go(-1); });
  next.addEventListener('click', function(){ go(1); });
  dots.addEventListener('click', function(e){
    var b = e.target.closest('.gr-dot'); if(!b) return;
    track.scrollTo({ left: b.dataset.i * step(), behavior:'smooth' });
  });
  track.addEventListener('scroll', paint, { passive:true });
  window.addEventListener('resize', paint);
  paint();
})();

