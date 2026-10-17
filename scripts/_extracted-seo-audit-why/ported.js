(function(){
  var root=document.getElementById('audit-why'); if(!root) return;
  var tabs=[].slice.call(root.querySelectorAll('.awy-tab')), panes=[].slice.call(root.querySelectorAll('.awy-pane')), cur=0, t=null, held=false,
      reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  function set(k){ cur=(k+tabs.length)%tabs.length; tabs.forEach(function(b,i){ b.classList.toggle('on',i===cur); b.setAttribute('aria-selected',String(i===cur)); });
    panes.forEach(function(p,i){ p.classList.remove('on'); if(i===cur){ void p.offsetWidth; p.classList.add('on'); } }); }
  function play(){ if(reduce||held) return; stop(); t=setInterval(function(){ set(cur+1); },4500); }
  function stop(){ clearInterval(t); t=null; }
  tabs.forEach(function(b,i){ b.addEventListener('click',function(){ held=true; stop(); set(i); clearTimeout(play._h); play._h=setTimeout(function(){ held=false; play(); },10000); }); });
  var st=root.querySelector('.awy-stage'); st.addEventListener('mouseenter',stop); st.addEventListener('mouseleave',function(){ if(!held) play(); });
  set(0);
  if('IntersectionObserver' in window){ new IntersectionObserver(function(es){ es.forEach(function(e){ e.isIntersecting?play():stop(); }); },{threshold:.3}).observe(root); } else play();
})();