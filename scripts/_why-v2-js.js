
/* The strip: one listener on the rail rather than one per button, and the
   open pane is found by the index the button carries. Arrow keys move
   between tabs because a tablist is expected to answer them. */
(function(){
  "use strict";
  var box = document.querySelector("[data-tabs]");
  if (!box) return;
  var tabs  = Array.prototype.slice.call(box.querySelectorAll(".wy-tab")),
      panes = Array.prototype.slice.call(box.querySelectorAll(".wy-pane"));

  function open(i){
    tabs.forEach(function(t, n){
      t.classList.toggle("on", n === i);
      t.setAttribute("aria-selected", n === i ? "true" : "false");
    });
    panes.forEach(function(p, n){ p.classList.toggle("on", n === i); });
  }

  box.querySelector(".wy-rail").addEventListener("click", function(e){
    var b = e.target.closest(".wy-tab");
    if (b) open(tabs.indexOf(b));
  });

  box.querySelector(".wy-rail").addEventListener("keydown", function(e){
    var i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    var to = e.key === "ArrowRight" || e.key === "ArrowDown" ? i + 1
           : e.key === "ArrowLeft"  || e.key === "ArrowUp"   ? i - 1 : -1;
    if (to < 0 && to !== -1) to = tabs.length - 1;
    if (to === -1) return;
    e.preventDefault();
    to = to % tabs.length;
    tabs[to].focus(); open(to);
  });

  /* the reveal, so the section arrives the way the rest of the site does */
  var io = new IntersectionObserver(function(en){
    en.forEach(function(x){
      if (x.isIntersecting){ x.target.classList.add("in"); io.unobserve(x.target); }
    });
  }, { threshold:0, rootMargin:"0px 0px -70px 0px" });
  Array.prototype.slice.call(document.querySelectorAll(".rv")).forEach(function(el){
    io.observe(el);
  });
  requestAnimationFrame(function(){
    Array.prototype.slice.call(document.querySelectorAll(".rv")).forEach(function(el){
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("in");
    });
  });
})();
