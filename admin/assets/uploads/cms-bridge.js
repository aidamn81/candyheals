(function(){
  var CONTENT_KEY='candyContentV1',GALLERY_KEY='candyEventsGalleryV1',BG_KEY='candyBackgroundV1',HEADER_KEY='candyHeaderImageV1';
  function set(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
  fetch('/content/site.json',{cache:'no-cache'}).then(r=>r.json()).then(d=>{
    set(CONTENT_KEY,{eventsText:d.eventsText||'',typesText:d.typesText||'',aboutText:d.aboutText||'',showreelHTML:d.showreelHTML||''});
    set(BG_KEY,d.background||{});
    set(HEADER_KEY,d.header?{type:'url',value:d.header}:null);
    var g=Array.isArray(d.gallery)?d.gallery.map(it=>({name:(it.image||it||'').split('/').pop(),data:it.image||it})) : [];
    set(GALLERY_KEY,g);
  }).catch(()=>{});
})();