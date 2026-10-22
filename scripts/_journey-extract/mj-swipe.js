(function(){
  var r=document.getElementById('app-journey'); if(!r) return;
  var st=r.querySelector('.sb-stage'), it=[].slice.call(r.querySelectorAll('.mj')), x0=null, y0=null;
  function cur(){ for(var i=0;i<it.length;i++) if(it[i].classList.contains('on')) return i; return 0; }
  var L=r.querySelector('.mj-list'), nav=document.createElement('div'); nav.className='mj-nav';
  nav.innerHTML='<button type="button" class="mj-pv" aria-label="Previous step">&#8249;</button><span class="mj-ct"><b>1</b> / '+it.length+'</span><button type="button" class="mj-nx" aria-label="Next step">&#8250;</button>';
  L.appendChild(nav); var ct=nav.querySelector('b');
  nav.querySelector('.mj-pv').addEventListener('click',function(){ it[(cur()-1+it.length)%it.length].click(); });
  nav.querySelector('.mj-nx').addEventListener('click',function(){ it[(cur()+1)%it.length].click(); });
  new MutationObserver(function(){ var c=cur(); ct.textContent=c+1; L.style.setProperty('--p',c/(it.length-1)); }).observe(L,{subtree:true,attributes:true,attributeFilter:['class']});
  st.addEventListener('touchstart',function(e){ x0=e.touches[0].clientX; y0=e.touches[0].clientY; },{passive:true});
  st.addEventListener('touchend',function(e){ if(x0===null) return; var dx=e.changedTouches[0].clientX-x0, dy=e.changedTouches[0].clientY-y0; x0=null;
    if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)){ var n=cur()+(dx<0?1:-1); n=(n+it.length)%it.length; it[n].click(); } },{passive:true});
})();