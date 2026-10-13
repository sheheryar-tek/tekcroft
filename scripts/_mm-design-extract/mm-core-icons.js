(function(){
  [].forEach.call(document.querySelectorAll('#mmCols .mm-svc-col'),function(col){
    var gp=col.querySelector('.mm-gp'), d=col.querySelector('.mm-row .mm-dot'); if(!gp||!d||gp.querySelector('.mm-gi')) return;
    var t=document.createElement('span'); t.className='mm-gt'; while(gp.firstChild) t.appendChild(gp.firstChild); gp.appendChild(t); var i=document.createElement('span'); i.className='mm-gi'; i.setAttribute('aria-hidden','true'); i.innerHTML=d.innerHTML; gp.insertBefore(i,gp.firstChild);
  });
})();
