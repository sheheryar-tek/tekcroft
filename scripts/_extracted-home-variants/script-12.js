
/* the variants can be hidden when the page-wide counter makes its pass, so
   these figures get their own: they count once their section is on screen */
(function(){
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function run(el){
    var target=parseFloat(el.getAttribute('data-count'))||0;
    var suffix=el.getAttribute('data-suffix')||'';
    if(el.dataset.done) return; el.dataset.done='1';
    if(reduce){ el.textContent=target+suffix; return; }
    var t0=null, dur=1400;
    requestAnimationFrame(function frame(t){
      if(t0===null) t0=t;
      var p=Math.min((t-t0)/dur,1), e=1-Math.pow(1-p,3);
      el.textContent=Math.round(target*e)+suffix;
      if(p<1) requestAnimationFrame(frame);
    });
  }
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ run(e.target); io.unobserve(e.target); } });
  },{threshold:.4});
  function watch(){
    document.querySelectorAll('#about-v2 [data-count], #about-v3 [data-count], #about-v4 [data-count], #about-v5 [data-count], #about-v6 [data-count], #about-v7 [data-count]')
      .forEach(function(el){ if(!el.dataset.done) io.observe(el); });
  }
  watch();
  document.querySelectorAll('.vsw-ab button').forEach(function(b){
    b.addEventListener('click', function(){ setTimeout(watch, 60); });
  });
})();
