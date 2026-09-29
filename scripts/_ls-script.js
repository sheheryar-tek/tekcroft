
(function(){
  var el=document.querySelector('#what-local [data-count]'); if(!el) return;
  var target=parseFloat(el.getAttribute('data-count'))||0, done=false;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function run(){
    if(done) return; done=true;
    if(reduce){ el.textContent=target; return; }
    var t0=null;
    requestAnimationFrame(function f(t){
      if(t0===null) t0=t;
      var p=Math.min((t-t0)/1400,1), e=1-Math.pow(1-p,3);
      el.textContent=Math.round(target*e);
      if(p<1) requestAnimationFrame(f);
    });
  }
  new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting) run(); }); },{threshold:.4})
    .observe(el);
})();
