<script id="spl-script">
(function(){
  var stage=document.querySelector('#search-split [data-split]'); if(!stage) return;
  var chips=[].slice.call(stage.querySelectorAll('.spl-chip'));
  var order=['gsearch','aio','gmaps','chatgpt','plx','gemini'];
  var idx=0, timer=null, held=false;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function type(panel){
    var el=panel.querySelector('.spl-typed'); if(!el) return;
    clearTimeout(el._t);               /* one timer per field, so two lanes can type at once */
    var q=el.getAttribute('data-q')||'', n=0;
    if(reduce){ el.textContent=q; return; }
    el.textContent='';
    (function step(){ el.textContent=q.slice(0,++n); if(n<q.length) el._t=setTimeout(step,26); })();
  }
  function show(key){
    var lane=null;
    stage.querySelectorAll('.spl-panel').forEach(function(pn){
      if(pn.dataset.p===key) lane=pn.closest('.spl-lane');
    });
    if(!lane) return;
    /* only this lane changes surface; the other lane keeps showing its own,
       dimmed, so both channels stay on screen at once */
    lane.querySelectorAll('.spl-panel').forEach(function(pn){
      var on=pn.dataset.p===key;
      pn.classList.toggle('on',on);
      if(on){ replay(pn); type(pn); }
    });
    lane.querySelectorAll('.spl-chip').forEach(function(c){ c.setAttribute('aria-selected', String(c.dataset.s===key)); });
    stage.querySelectorAll('.spl-lane').forEach(function(l){ l.classList.toggle('is-live', l===lane); });
  }
  function replay(pn){ /* restart the panel's own little animations */
    pn.querySelectorAll('.spl-r,.spl-pin,.spl-biz,.spl-l,.spl-cites').forEach(function(el){
      el.style.animation='none'; void el.offsetWidth; el.style.animation='';
    });
  }
  function next(){ idx=(idx+1)%order.length; show(order[idx]); }
  function play(){ stop(); if(!held) timer=setInterval(next,3600); }
  function stop(){ clearInterval(timer); }

  function hold(ms){ held=true; stop(); clearTimeout(hold._t);
    hold._t=setTimeout(function(){ held=false; play(); }, ms||12000); }

  chips.forEach(function(c){
    c.addEventListener('click',function(){ hold(); idx=order.indexOf(c.dataset.s); show(c.dataset.s); });
    /* a chip row is a row: the arrow keys walk it, as a tab strip should */
    c.addEventListener('keydown',function(e){
      var row=[].slice.call(c.parentElement.children), at=row.indexOf(c);
      var to = e.key==='ArrowRight' ? at+1 : e.key==='ArrowLeft' ? at-1 : -1;
      if(to<0 || to>=row.length) return;
      e.preventDefault(); row[to].focus(); row[to].click();
    });
    /* hovering a surface holds it open long enough to read */
    c.addEventListener('mouseenter',function(){ if(!c.matches('[aria-selected="true"]')){ idx=order.indexOf(c.dataset.s); show(c.dataset.s); } });
  });
  stage.addEventListener('mouseenter',stop); stage.addEventListener('mouseleave',function(){ if(!held) play(); });

  show('aio'); show(order[0]);
  var io=new IntersectionObserver(function(es){ es.forEach(function(e){ e.isIntersecting ? play() : stop(); }); },{threshold:.25});
  io.observe(stage);
})();
</script>