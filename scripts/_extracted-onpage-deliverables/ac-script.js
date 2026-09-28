
(function(){
 document.querySelectorAll('[data-acc]').forEach(function(acc){
  var items=[].slice.call(acc.querySelectorAll('.ac-item'));
  var at=0, timer=null, held=false;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function show(i){
    at=(i+items.length)%items.length;
    items.forEach(function(el,k){ var on=k===at; el.classList.toggle('on',on); el.setAttribute('aria-selected',String(on)); });
  }
  function play(){ stop(); acc.classList.remove('paused'); if(!held && !reduce) timer=setInterval(function(){ show(at+1); },5000); }
  function stop(){ clearInterval(timer); }
  function hold(){ held=true; stop(); acc.classList.add('paused'); clearTimeout(hold._t);
    hold._t=setTimeout(function(){ held=false; play(); },12000); }

  items.forEach(function(el,i){
    el.addEventListener('mouseenter',function(){ show(i); });
    el.addEventListener('click',function(){ hold(); show(i); });
    el.addEventListener('keydown',function(e){
      if(e.key==='Enter' || e.key===' '){ e.preventDefault(); hold(); show(i); return; }
      var to = e.key==='ArrowRight'||e.key==='ArrowDown' ? i+1 : e.key==='ArrowLeft'||e.key==='ArrowUp' ? i-1 : -1;
      if(to<0 || to>=items.length) return;
      e.preventDefault(); items[to].focus(); hold(); show(to);
    });
  });
  acc.addEventListener('mouseenter',function(){ stop(); acc.classList.add('paused'); });
  acc.addEventListener('mouseleave',function(){ acc.classList.remove('paused'); if(!held) play(); });

  /* the open panel lights up under the pointer */
  acc.addEventListener('pointermove',function(e){
    var open=acc.querySelector('.ac-item.on'); if(!open) return;
    var r=open.getBoundingClientRect();
    open.style.setProperty('--mx', Math.min(Math.max((e.clientX-r.left)/r.width,0),1).toFixed(3));
    open.style.setProperty('--my', Math.min(Math.max((e.clientY-r.top)/r.height,0),1).toFixed(3));
  });

  show(0);
  var io=new IntersectionObserver(function(es){ es.forEach(function(e){ e.isIntersecting ? play() : stop(); }); },{threshold:.25});
  io.observe(acc);
 });
})();
