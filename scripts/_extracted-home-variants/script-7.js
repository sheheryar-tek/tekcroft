
(function(){
  var secs={1:document.getElementById('ai-ecosystem'),2:document.getElementById('search-split'),3:document.getElementById('search-split-v3')};
  var btns=[].slice.call(document.querySelectorAll('.vsw button'));
  function pick(v){
    Object.keys(secs).forEach(function(k){ if(secs[k]) secs[k].hidden = (+k !== +v); });
    btns.forEach(function(b){ var on = +b.dataset.v === +v; b.classList.toggle('on',on); b.setAttribute('aria-pressed',on); });
    try{ localStorage.setItem('tk-ai-variant', v); }catch(e){}
    window.dispatchEvent(new Event('resize'));   /* the rail re-centres when it becomes visible */
  }
  var saved=3; try{ saved = +localStorage.getItem('tk-ai-variant') || 3; }catch(e){}
  btns.forEach(function(b){ b.addEventListener('click',function(){ pick(b.dataset.v); }); });
  pick(saved);
})();
