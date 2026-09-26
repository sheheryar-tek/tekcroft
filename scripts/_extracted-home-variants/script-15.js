
(function(){
  var secs={1:document.getElementById('industries'),2:document.getElementById('industries-v2'),3:document.getElementById('industries-v3'),4:document.getElementById('industries-v4')};
  var btns=[].slice.call(document.querySelectorAll('.vsw-ind button'));
  function pick(v){
    Object.keys(secs).forEach(function(k){ if(secs[k]) secs[k].hidden=(+k!==+v); });
    btns.forEach(function(b){ var on=+b.dataset.v===+v; b.classList.toggle('on',on); b.setAttribute('aria-pressed',on); });
    try{ localStorage.setItem('tk-ind-variant',v); }catch(e){}
  }
  var saved=4; try{ saved=+localStorage.getItem('tk-ind-variant')||4; }catch(e){}
  btns.forEach(function(b){ b.addEventListener('click',function(){ pick(b.dataset.v); }); });
  pick(saved);
})();
