(function(){
  var rail=document.querySelector('[data-tm]'); if(!rail) return;
  var items=[].slice.call(rail.querySelectorAll('.tm-item'));
  items.forEach(function(el){ var b=document.createElement('span'); b.className='tm-prog';
    b.setAttribute('aria-hidden','true'); el.appendChild(b); });
  var at=0, timer=null, held=false;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function show(i){
    at=(i+items.length)%items.length;
    items.forEach(function(el,k){ var on=k===at; el.classList.toggle('on',on);
      el.setAttribute('aria-selected',String(on));
      if(on){ var b=el.querySelector('.tm-prog'); if(b){ b.style.animation='none'; void b.offsetWidth; b.style.animation=''; } }
    });
  }
  function play(){ stop(); rail.classList.remove('paused'); if(!held && !reduce) timer=setInterval(function(){ show(at+1); },6000); }
  function stop(){ clearInterval(timer); }
  function hold(){ held=true; stop(); rail.classList.add('paused'); clearTimeout(hold._t);
    hold._t=setTimeout(function(){ held=false; play(); },12000); }
  items.forEach(function(el,i){
    el.addEventListener('mouseenter',function(){ show(i); });
    el.addEventListener('click',function(){ hold(); show(i); });
    el.addEventListener('keydown',function(e){
      if(e.key==='Enter'||e.key===' '){ e.preventDefault(); hold(); show(i); return; }
      var to = e.key==='ArrowRight'||e.key==='ArrowDown' ? i+1 : e.key==='ArrowLeft'||e.key==='ArrowUp' ? i-1 : -1;
      if(to<0||to>=items.length) return;
      e.preventDefault(); items[to].focus(); hold(); show(to);
    });
  });
  rail.addEventListener('mouseenter',function(){ stop(); rail.classList.add('paused'); });
  rail.addEventListener('mouseleave',function(){ rail.classList.remove('paused'); if(!held) play(); });
  show(0);
  var io=new IntersectionObserver(function(es){ es.forEach(function(e){ e.isIntersecting ? play() : stop(); }); },{threshold:.25});
  io.observe(rail);
})();