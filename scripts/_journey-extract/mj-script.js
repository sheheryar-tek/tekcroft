(function(){
  var r=document.getElementById('app-journey'); if(!r) return;
  var st=[].slice.call(r.querySelectorAll('.mj')), sc=[].slice.call(r.querySelectorAll('.ms')), fl=[].slice.call(r.querySelectorAll('.mf')),
      k=0, t=null, hold=false, reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  function set(i){ k=i; r.setAttribute('data-s',i); [].forEach.call(r.querySelectorAll('.sc'),function(e,j){ e.classList.toggle('on',j===i); }); [st,sc,fl].forEach(function(g){ g.forEach(function(e,j){ e.classList.toggle('on',j===i); }); });
    st.forEach(function(e,j){ e.classList.toggle('done',j<i); e.querySelector('.mj-h').setAttribute('aria-pressed',j===i?'true':'false'); }); }
  function play(){ if(reduce||t) return; t=setInterval(function(){ if(!hold) set((k+1)%st.length); },5000); r.classList.add('auto'); }
  function stop(){ clearInterval(t); t=null; r.classList.remove('auto'); }
  st.forEach(function(e,i){ e.addEventListener('click',function(){ set(i); stop(); play(); }); var hv=null; e.addEventListener('mouseenter',function(){ if(!window.matchMedia('(hover:hover)').matches) return; clearTimeout(hv); hv=setTimeout(function(){ if(k!==i) set(i); },220); }); e.addEventListener('mouseleave',function(){ clearTimeout(hv); }); });
  var L=r.querySelector('.mj-list'); L.addEventListener('mouseenter',function(){ hold=true; r.classList.add('hold'); }); L.addEventListener('mouseleave',function(){ hold=false; r.classList.remove('hold'); stop(); play(); });
  if('IntersectionObserver' in window){ new IntersectionObserver(function(es){ es.forEach(function(e){ e.isIntersecting?play():stop(); }); },{threshold:.3}).observe(r); } else play();
})();