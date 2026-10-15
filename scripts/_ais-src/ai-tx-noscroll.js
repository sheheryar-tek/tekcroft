
/* the radios sit at the top of the section; letting a label focus one scrolled the page up to it.
   Check the radio ourselves and focus it without scrolling. */
(function(){
  var root=document.getElementById('tech-v4'); if(!root) return;
  [].forEach.call(root.querySelectorAll('label.ax-tab[for]'),function(l){
    l.addEventListener('click',function(e){
      var r=document.getElementById(l.getAttribute('for')); if(!r) return;
      e.preventDefault(); r.checked=true;
      try{ r.focus({preventScroll:true}); }catch(_){}
    });
  });
})();
