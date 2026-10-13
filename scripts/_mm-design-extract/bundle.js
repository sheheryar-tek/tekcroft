/* === mm-core-icons === */
(function(){
  [].forEach.call(document.querySelectorAll('#mmCols .mm-svc-col'),function(col){
    var gp=col.querySelector('.mm-gp'), d=col.querySelector('.mm-row .mm-dot'); if(!gp||!d||gp.querySelector('.mm-gi')) return;
    var t=document.createElement('span'); t.className='mm-gt'; while(gp.firstChild) t.appendChild(gp.firstChild); gp.appendChild(t); var i=document.createElement('span'); i.className='mm-gi'; i.setAttribute('aria-hidden','true'); i.innerHTML=d.innerHTML; gp.insertBefore(i,gp.firstChild);
  });
})();

/* === mm-current-js === */
(function(){
  var panel=document.getElementById('mmPanel'); if(!panel) return;
  function norm(p){ return (p||'').replace(/\/+$/,'').toLowerCase(); }
  var here=norm(location.pathname), forced=(panel.getAttribute('data-current')||'').toLowerCase().trim();
  [].forEach.call(panel.querySelectorAll('.mm-row'),function(a){
    var name=(a.querySelector('.mm-n')||a).textContent.toLowerCase().trim(), hit=false;
    try{ var u=new URL(a.getAttribute('href'),location.href); hit = here && here!=='' && norm(u.pathname)===here && !u.hash; }catch(e){}
    if(!hit && forced) hit = name===forced;
    if(hit){ a.classList.add('is-current'); a.setAttribute('aria-current','page');
      var col=a.closest('.mm-svc-col'), gp=col&&col.querySelector('.mm-gp'); if(gp) gp.classList.add('is-current-parent');
      var t=document.getElementById('mmTrigger'); if(t) t.classList.add('is-current-parent'); }
  });
})();
