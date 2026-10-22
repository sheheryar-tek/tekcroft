(function(){
  var r=document.getElementById('develop-apps'); if(!r) return;
  var sw=r.querySelector('.sw'), bs=[].slice.call(r.querySelectorAll('.sw-b')), ps=[].slice.call(r.querySelectorAll('.pn')), pill=r.querySelector('.sw-pill'), tb=r.querySelector('.qt'), k=0;
  function pos(){ var b=bs[k]; pill.style.width=b.offsetWidth+'px'; pill.style.transform='translateX('+b.offsetLeft+'px)'; }
  function set(i,focus){ k=i; bs.forEach(function(b,j){ var on=j===i; b.classList.toggle('on',on); b.setAttribute('aria-selected',on?'true':'false'); b.tabIndex=on?0:-1; });
    ps.forEach(function(p,j){ var on=j===i; p.hidden=!on; p.classList.toggle('on',on); });
    tb.setAttribute('data-hl',bs[i].getAttribute('data-col')); pos(); if(focus) bs[i].focus();
    if(sw.scrollWidth>sw.clientWidth+2){ var sr=sw.getBoundingClientRect(), br=bs[i].getBoundingClientRect(); sw.scrollBy({left:(br.left-sr.left)-(sr.width-br.width)/2,behavior:'smooth'}); } var qc=r.querySelector('.qcards'), c=qc&&qc.querySelector('.c-'+bs[i].getAttribute('data-col')); if(qc&&c&&qc.scrollWidth>qc.clientWidth) qc.scrollTo({left:c.offsetLeft-qc.offsetLeft,behavior:'smooth'}); }
  bs.forEach(function(b,i){ b.addEventListener('click',function(){ set(i); }); });
  sw.addEventListener('keydown',function(e){ if(e.key==='ArrowRight'){ e.preventDefault(); set((k+1)%bs.length,true);} if(e.key==='ArrowLeft'){ e.preventDefault(); set((k+bs.length-1)%bs.length,true);} });
  [].forEach.call(r.querySelectorAll('.qm-c.top'),function(h){ h.setAttribute('tabindex','0'); h.addEventListener('click',function(){ var c=(h.className.match(/c-([nxp])/)||[])[1]; if(c) tb.setAttribute('data-hl',c); }); });
  window.addEventListener('resize',pos); set(0);
  if(document.fonts&&document.fonts.ready) document.fonts.ready.then(pos);
})();