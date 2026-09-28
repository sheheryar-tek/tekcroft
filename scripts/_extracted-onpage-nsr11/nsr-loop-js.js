
/* three copies of the five screens: the middle one is the real set, and
   the scroll jumps back to it after crossing either edge, so the rail
   runs on without a seam */
(function(){
  var stage=document.querySelector('#ai-search [data-nsr]'); if(!stage) return;
  var rail=stage.querySelector('.nsr-rail');
  var nodes=[].slice.call(stage.querySelectorAll('.nsr-node'));
  var real=[].slice.call(rail.children);
  var n=real.length;
  var before=real.map(function(c){ return c.cloneNode(true); });
  var after=real.map(function(c){ return c.cloneNode(true); });
  before.forEach(function(c){ c.classList.remove('on'); c.setAttribute('data-clone','1'); rail.insertBefore(c, real[0]); });
  after.forEach(function(c){ c.classList.remove('on'); c.setAttribute('data-clone','1'); rail.appendChild(c); });
  var all=[].slice.call(rail.children);

  var at=2, animating=false, timer=null, held=false;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function centre(el, smooth){
    rail.scrollTo({left: el.offsetLeft - (rail.clientWidth - el.offsetWidth)/2,
                   behavior: smooth && !reduce ? 'smooth' : 'auto'});
  }
  function mark(){
    all.forEach(function(c,i){ c.classList.toggle('on', (i % n) === at && !animating ? true : (i % n)===at); });
    /* only the middle set keeps the outline, so one card reads as live */
    all.forEach(function(c,i){ if(i<n || i>=2*n) c.classList.remove('on'); });
    nodes.forEach(function(x,i){ var on=i===at; x.classList.toggle('on',on); x.setAttribute('aria-selected',String(on)); });
  }
  function go(i, dir){
    var prev=at; at=(i+n)%n;
    var target;
    if(dir==='next' && at < prev) target=all[2*n + at];          /* forward past the end */
    else if(dir==='prev' && at > prev) target=all[at];           /* back past the start */
    else target=all[n + at];
    mark(); centre(target, true);
    if(target!==all[n+at]){
      animating=true;
      setTimeout(function(){ centre(all[n+at], false); animating=false; mark(); }, reduce?0:520);
    }
  }
  function play(){ stop(); if(!held && !reduce) timer=setInterval(function(){ go(at+1,'next'); },4200); }
  function stop(){ clearInterval(timer); }
  function hold(){ held=true; stop(); clearTimeout(hold._t); hold._t=setTimeout(function(){ held=false; play(); },10000); }

  nodes.forEach(function(x,i){
    x.addEventListener('mouseenter',function(){ go(i, i>at?'next':'prev'); });
    x.addEventListener('click',function(){ hold(); go(i, i>at?'next':'prev'); });
  });
  var prevBtn=stage.querySelector('.nsr-arw.prev'), nextBtn=stage.querySelector('.nsr-arw.next');
  if(prevBtn) prevBtn.addEventListener('click',function(){ hold(); go(at-1,'prev'); });
  if(nextBtn) nextBtn.addEventListener('click',function(){ hold(); go(at+1,'next'); });
  stage.addEventListener('mouseenter',stop);
  stage.addEventListener('mouseleave',function(){ if(!held) play(); });

  requestAnimationFrame(function(){ mark(); centre(all[n+at], false); });
  var io=new IntersectionObserver(function(es){ es.forEach(function(e){ e.isIntersecting ? play() : stop(); }); },{threshold:.25});
  io.observe(stage);
  window.addEventListener('resize',function(){ centre(all[n+at], false); });
})();
