(function(){
var r=document.getElementById('chatbot-types'); if(!r) return;
var bs=[].slice.call(r.querySelectorAll('.tt')), ps=[].slice.call(r.querySelectorAll('.pn')), k=0, t=null, hold=false, reduce=matchMedia('(prefers-reduced-motion: reduce)').matches, tl=r.querySelector('.ct-tabs');
function set(i,f){ k=i; bs.forEach(function(b,j){ var on=j===i; b.classList.toggle('on',on); b.setAttribute('aria-selected',on?'true':'false'); b.tabIndex=on?0:-1; });
 ps.forEach(function(p,j){ p.hidden=j!==i; p.classList.toggle('on',j===i); }); [].forEach.call(r.querySelectorAll('.ct-dots i'),function(d,j){ d.classList.toggle('on',j===i); }); if(f) bs[i].focus();
 if(tl.scrollWidth>tl.clientWidth+2){ var a=bs[i].getBoundingClientRect(), c=tl.getBoundingClientRect(); tl.scrollBy({left:a.left-c.left-(c.width-a.width)/2,behavior:'smooth'}); } }
function play(){ if(reduce||t||matchMedia('(max-width:860px)').matches) return; t=setInterval(function(){ if(!hold) set((k+1)%bs.length); },6500); r.classList.add('auto'); }
function stop(){ clearInterval(t); t=null; r.classList.remove('auto'); }
bs.forEach(function(b,i){ b.addEventListener('click',function(){ set(i); stop(); play(); }); });
tl.addEventListener('keydown',function(e){ if(e.key==='ArrowRight'||e.key==='ArrowDown'){ e.preventDefault(); set((k+1)%bs.length,true); stop(); } if(e.key==='ArrowLeft'||e.key==='ArrowUp'){ e.preventDefault(); set((k+bs.length-1)%bs.length,true); stop(); } });
var x0=null,y0=null,pn=r.querySelector('.ct-pns'); pn.addEventListener('touchstart',function(e){x0=e.touches[0].clientX;y0=e.touches[0].clientY;},{passive:true});
pn.addEventListener('touchend',function(e){ if(x0===null) return; var dx=e.changedTouches[0].clientX-x0, dy=e.changedTouches[0].clientY-y0; x0=null; if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)){ set((k+(dx<0?1:bs.length-1))%bs.length); stop(); } },{passive:true});
var bx=r.querySelector('.ct-box'); bx.addEventListener('mouseenter',function(){hold=true;r.classList.add('hold');}); bx.addEventListener('mouseleave',function(){hold=false;r.classList.remove('hold');});
if('IntersectionObserver' in window){ new IntersectionObserver(function(es){ es.forEach(function(e){ e.isIntersecting?play():stop(); }); },{threshold:.3}).observe(r); } else play();
})();
