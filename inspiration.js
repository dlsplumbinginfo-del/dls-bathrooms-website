(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const looks=JSON.parse(document.getElementById('look-data').textContent);
  const cards=[...document.querySelectorAll('.look')];
  const byId=new Map(looks.map(x=>[String(x.n),x]));
  const key='dls-inspiration-favourites-v1';
  const saved=new Set();
  let onlySaved=false;
  try { const raw=JSON.parse(localStorage.getItem(key)||'[]'); if(Array.isArray(raw))raw.filter(n=>byId.has(String(n))).forEach(n=>saved.add(String(n))); } catch {}
  const shared=new URLSearchParams(location.search).get('looks');
  if(shared){shared.split(',').filter(n=>byId.has(n)).forEach(n=>saved.add(n));onlySaved=saved.size>0;}
  const filters=['room','style','lighting'].map(id=>document.getElementById(id));
  const count=document.getElementById('result-count'), empty=document.getElementById('empty');
  const savedFilter=document.getElementById('saved-filter'),bar=document.getElementById('shortlist');
  const dialog=document.getElementById('look-dialog');let activeLook=null,lastTrigger=null;
  function codes(){return [...saved].sort((a,b)=>a-b).map(n=>byId.get(n));}
  function whatsapp(list){const names=list.map(d=>`${d.id} — ${d.name}`).join('\n');return 'https://wa.me/447539037841?text='+encodeURIComponent('Hello DLS Bathrooms, I like these bathroom inspiration looks:\n'+names+'\n\nPlease help me adapt the style to my room and confirm the products, availability and a supply-and-fit quotation.\nMy postcode: \nRoom size: \nPreferred changes: ');}
  function sync(){
    try{localStorage.setItem(key,JSON.stringify([...saved]));}catch{}
    document.querySelectorAll('[data-save]').forEach(b=>{const yes=saved.has(b.dataset.save);b.setAttribute('aria-pressed',String(yes));b.textContent=yes?'♥':'♡';b.setAttribute('aria-label',`${yes?'Remove':'Save'} ${byId.get(b.dataset.save).name}${yes?' from favourites':' to favourites'}`);});
    savedFilter.textContent=`Favourites (${saved.size})`;savedFilter.setAttribute('aria-pressed',String(onlySaved));
    bar.hidden=!saved.size;
    document.getElementById('saved-count').textContent=`${saved.size} ${saved.size===1?'look':'looks'} saved`;
    document.getElementById('saved-codes').textContent=codes().map(d=>d.id).join(', ');
    document.getElementById('enquire-saved').href=whatsapp(codes());
    document.getElementById('quote-saved').href='/quote?looks='+codes().map(d=>d.n).join(',');
    filter();
  }
  function filter(){let shown=0;cards.forEach(c=>{const match=(!filters[0].value||c.dataset.room===filters[0].value)&&(!filters[1].value||c.dataset.style===filters[1].value)&&(!filters[2].value||c.dataset.lighting===filters[2].value)&&(!onlySaved||saved.has(c.dataset.n));c.hidden=!match;if(match)shown++;});count.textContent=`${shown} of ${looks.length} looks${onlySaved?' · favourites':''}`;empty.hidden=shown>0;}
  filters.forEach(s=>s.addEventListener('change',filter));
  savedFilter.addEventListener('click',()=>{onlySaved=!onlySaved;sync();});
  function reset(){filters.forEach(s=>s.value='');onlySaved=false;sync();}
  document.querySelectorAll('[data-reset]').forEach(b=>b.addEventListener('click',reset));
  document.addEventListener('click',e=>{const save=e.target.closest('[data-save]');if(save){const n=save.dataset.save;saved.has(n)?saved.delete(n):saved.add(n);sync();}const open=e.target.closest('[data-open]');if(open&&typeof dialog.showModal==='function'){e.preventDefault();openLook(open.dataset.open,open);}});
  function openLook(n,trigger){const d=byId.get(String(n));if(!d)return;activeLook=d;lastTrigger=trigger;document.getElementById('dialog-title').textContent=d.name;document.getElementById('dialog-code').textContent=`${d.id} · AI-generated design concept`;const im=document.getElementById('dialog-image');im.src=d.image;im.alt=`AI bathroom concept: ${d.name}. ${d.description}`;document.getElementById('dialog-whatsapp').href=whatsapp([d]);const sb=document.getElementById('dialog-save');sb.dataset.save=String(d.n);sb.setAttribute('aria-label','Save '+d.name+' to favourites');document.getElementById('dialog-details').href='#look-'+String(d.n).padStart(2,'0');sync();dialog.showModal();document.body.classList.add('modal-open');}
  dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');lastTrigger?.focus({preventScroll:true});});
  document.getElementById('close-dialog').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
  document.getElementById('dialog-details').addEventListener('click',()=>{const n=activeLook.n;dialog.close();reset();const c=document.getElementById('look-'+String(n).padStart(2,'0'));c.querySelector('details').open=true;setTimeout(()=>c.scrollIntoView({block:'start'}),0);});
  let timer;
  function toast(msg){const box=document.getElementById('toast');box.textContent=msg;box.hidden=false;clearTimeout(timer);timer=setTimeout(()=>box.hidden=true,3500);}
  document.getElementById('copy-shortlist').addEventListener('click',async()=>{const url=new URL(location.href);url.hash='collection';url.search='';url.searchParams.set('looks',codes().map(d=>d.n).join(','));try{await navigator.clipboard.writeText(url.href);toast('Link copied — share it with someone planning the room.');}catch{document.getElementById('share-url').value=url.href;document.getElementById('share-fallback').hidden=false;document.getElementById('share-url').select();toast('Select and copy the link below.');}});
  sync();
})();
