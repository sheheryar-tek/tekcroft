
(function(){
  var secs={1:document.getElementById('about'),2:document.getElementById('about-v2'),3:document.getElementById('about-v3'),4:document.getElementById('about-v4'),5:document.getElementById('about-v5'),6:document.getElementById('about-v6'),7:document.getElementById('about-v7')};
  var btns=[].slice.call(document.querySelectorAll('.vsw-ab button'));
  function pick(v){
    Object.keys(secs).forEach(function(k){ if(secs[k]) secs[k].hidden=(+k!==+v); });
    btns.forEach(function(b){ var on=+b.dataset.v===+v; b.classList.toggle('on',on); b.setAttribute('aria-pressed',on); });
    try{ localStorage.setItem('tk-about-variant',v); }catch(e){}
  }
  var saved=6; try{ saved=+localStorage.getItem('tk-about-variant')||6; }catch(e){}
  btns.forEach(function(b){ b.addEventListener('click',function(){ pick(b.dataset.v); }); });
  pick(saved);
})();
