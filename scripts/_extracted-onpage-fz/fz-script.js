
(function(){
  var run=document.querySelector('#framework-v2 .fz-run'); if(!run) return;
  var rows=[].slice.call(run.querySelectorAll('.fz-row'));
  rows.forEach(function(r,i){ r.style.setProperty('--k', i); });
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var at=0, timer=null, held=false;
  function light(i){ at=(i+rows.length)%rows.length;
    rows.forEach(function(r,k){ r.classList.toggle('is-live', k===at); }); }
  function play(){ stop(); if(!held) timer=setInterval(function(){ light(at+1); }, 2200); }
  function stop(){ clearInterval(timer); }

  rows.forEach(function(r,i){
    r.addEventListener('mouseenter',function(){ held=true; stop(); light(i); });
    r.addEventListener('mouseleave',function(){ held=false; play(); });
  });
  light(0);
  var io=new IntersectionObserver(function(es){ es.forEach(function(e){ e.isIntersecting ? play() : stop(); }); },{threshold:.2});
  io.observe(run);
})();
