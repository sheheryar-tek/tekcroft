
(function(){
  var dial=document.querySelector('[data-dial]'); if(!dial) return;
  var sec=document.getElementById('framework-v3');
  var nodes=[].slice.call(dial.querySelectorAll('.fw3-node'));
  var arcs=[].slice.call(dial.querySelectorAll('.fw3-arc'));
  var chips=[].slice.call(sec.querySelectorAll('.fw3-chip'));
  var at=0, timer=null, held=false;

  function show(k){
    at=(k+nodes.length)%nodes.length;
    nodes.forEach(function(n,i){ var on=i===at; n.classList.toggle('on',on); n.setAttribute('aria-selected',String(on)); });
    arcs.forEach(function(a,i){ a.classList.toggle('on', i===at); });
    chips.forEach(function(c,i){ c.classList.toggle('on', i===at); });
  }
  function play(){ stop(); if(!held) timer=setInterval(function(){ show(at+1); },2600); }
  function stop(){ clearInterval(timer); }
  function hold(){ held=true; stop(); clearTimeout(hold._t); hold._t=setTimeout(function(){ held=false; play(); },9000); }

  nodes.forEach(function(n,i){
    n.addEventListener('click',function(){ hold(); show(i); });
    n.addEventListener('mouseenter',function(){ show(i); });
    n.addEventListener('keydown',function(e){
      var to = e.key==='ArrowRight' ? i+1 : e.key==='ArrowLeft' ? i-1 : -1;
      if(to<0 || to>=nodes.length) return;
      e.preventDefault(); nodes[to].focus(); hold(); show(to);
    });
  });
  dial.addEventListener('mouseenter',stop);
  dial.addEventListener('mouseleave',function(){ if(!held) play(); });

  show(0);
  var io=new IntersectionObserver(function(es){ es.forEach(function(e){ e.isIntersecting ? play() : stop(); }); },{threshold:.25});
  io.observe(sec);
})();
