'use strict';
(async()=>{
 const $=id=>document.getElementById(id),query=new URLSearchParams(location.search);
 const node=(tag,text,cls)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n;};
 try{
  const responses=await Promise.all([fetch('catalogue-data.json'),fetch('customiser-data.json')]);
  if(responses.some(r=>!r.ok))throw new Error('Catalogue unavailable');
  const [looks,config]=await Promise.all(responses.map(r=>r.json()));
  const room=looks.find(d=>d.n===Number(query.get('look')))||looks[0],key='dls-customiser-v2-'+room.n;
  const visual=config.room_visualiser?.[String(room.n)];
  const originalWall=room.products.find(p=>p.category==='Feature / main wall tile'),originalFloors=room.products.filter(p=>p.category.toLowerCase().includes('floor tile'));
  const tileById=id=>config.tiles.find(t=>t.id===id),tileByURL=url=>config.tiles.find(t=>t.url===url);
  const preset=room.customiser||{},originalWallTile=tileByURL(originalWall.url);
  const initial={finish:preset.finish||room.metal,wall:preset.wall||originalWallTile.id,floor:preset.floor||'original',basin:preset.basin||'original',tap:preset.tap||'original',width:preset.width||'room',worktop:preset.worktop||'matched',niche:preset.niche||'auto'};
  let stored={};try{stored=JSON.parse(localStorage.getItem(key)||'{}');}catch{}
  const shareKeys=['finish','wall','floor','basin','tap','width','worktop','niche'];
  const shared=shareKeys.some(k=>query.has(k));
  let state={...initial,...(shared?Object.fromEntries(shareKeys.filter(k=>query.has(k)).map(k=>[k,query.get(k)])):stored)};
  if(!config.finishes.includes(state.finish))state.finish=initial.finish;
  if(!tileById(state.wall))state.wall=initial.wall;
  if(state.floor!=='original'&&!tileById(state.floor))state.floor='original';
  if(state.basin!=='original'&&!config.packages.some(p=>p.id===state.basin))state.basin='original';
  if(!['original','wall','tall','mono'].includes(state.tap))state.tap='original';
  if(!['room','450','500','550','600','700','750','800','900','1200','1200-double'].includes(state.width))state.width='room';
  if(!['matched','pure-white','marble-light','oak','dark-stone'].includes(state.worktop))state.worktop='matched';
  if(!['auto','with','without'].includes(state.niche))state.niche='auto';
  $('title').textContent=room.name+' · make it yours';$('ref').textContent=room.id+' / Your choices';$('back').href=new URL('./?look='+room.n,document.baseURI).href;document.title=room.id+' · Make it yours | DLS Bathrooms';
  const colours={'Brushed Bronze':'#a88465','Brushed Brass':'#c3a66b','Chrome':'linear-gradient(135deg,#777,#eee,#aaa)','Matte Black':'#242424','Gunmetal':'#666b6d','Brushed Nickel':'#aaa99e'};
  config.finishes.forEach(f=>{const b=node('button',null);b.type='button';b.dataset.finish=f;const sw=node('span',null,'finish-swatch');sw.style.setProperty('--swatch',colours[f]);sw.setAttribute('aria-hidden','true');b.append(sw,node('span',f));b.addEventListener('click',()=>{state.finish=f;render();});$('finish-options').append(b);});
  const slug=t=>new URL(t.url).pathname.split('/').filter(Boolean).pop();
  const floorIdsFor=wall=>{
   const s=slug(wall),names=s.includes('black')?['fusion-black','fusion-light-grey','fusion-white','pebble-white']:s.includes('pink')||s.includes('sand')||s.includes('ivory')||s.includes('orange')?['fusion-sand','fusion-white','pebble-white','fusion-light-grey']:['fusion-white','fusion-light-grey','pebble-white','fusion-sand'];
   return names.map(n=>config.tiles.find(t=>slug(t).startsWith(n)&&t.wet_room_floors===true)).filter(Boolean);
  };
  function options(select,items,value){select.replaceChildren();items.forEach(([id,label])=>{const o=node('option',label);o.value=id;select.append(o);});select.value=value;}
  function tileButtons(containerId,kind,items,value){
   const container=$(containerId);container.replaceChildren();
   items.forEach(({id,tile,label})=>{const button=node('button',null);button.type='button';button.dataset[kind]=id;button.setAttribute('aria-pressed',String(id===value));const photo=config.photos[tile.url];if(photo){const image=node('img');image.src=photo.image;image.alt='';image.loading='lazy';button.append(image);}button.append(node('strong',label||tile.name));button.addEventListener('click',()=>{state[kind]=id;render();});container.append(button);});
  }
  const wallPool=()=>{const originals=originalWallTile,chosen=tileById(state.wall);let names=room.style==='Natural'?['fusion-sand','hoxton-ivory','hoxton-bottle-green']:['hoxton-pink','hoxton-bottle-green','fusion-white'];return [chosen,originals,...names.map(n=>config.tiles.find(t=>slug(t).startsWith(n))).filter(Boolean)].filter(Boolean).filter((v,i,a)=>a.findIndex(t=>t.id===v.id)===i);};
  options($('wall-select'),wallPool().map(t=>[t.id,t.name]),state.wall);
  const selectedPackage=()=>state.basin==='original'?null:config.packages.find(p=>p.id===state.basin);
  const packageWidth=p=>{const match=[p.name,...p.products.map(x=>x.name+' '+x.code+' '+(x.size||''))].join(' ').match(/\b(450|500|550|600|700|750|800|900|1200)\b/);return match?match[1]:null;};
  const packageSignature=p=>p.products.map(x=>x.code||x.url).sort().join('|');
  const availablePackages=()=>{const seen=new Set();return config.packages.filter(p=>{const signature=packageSignature(p);if(seen.has(signature))return false;seen.add(signature);return true;}).sort((a,b)=>(Number(packageWidth(a))||9999)-(Number(packageWidth(b))||9999)||a.name.localeCompare(b.name));};
  options($('basin-select'),[['original','Keep '+room.furniture],...availablePackages().map(p=>[p.id,p.name])],state.basin);
  if(!$('basin-select').value){state.basin='original';$('basin-select').value='original';}
  const widthLabels={room:'Let DLS size it to the room','450':'450mm request','500':'500mm request','550':'550mm request','600':'600mm request','700':'700mm request','750':'750mm request','800':'800mm request','900':'900mm request','1200':'1200mm single-basin request','1200-double':'1200mm double-basin request'};
  const worktopLabels={matched:'Match the selected furniture','pure-white':'Pure white','marble-light':'Light marble effect','oak':'Natural oak','dark-stone':'Dark stone effect'};
  const nicheLabels={auto:'Keep this look’s niche detail',with:'Include a niche','without':'No niche / clean wall'};
  options($('width-select'),Object.entries(widthLabels),state.width);
  options($('worktop-select'),Object.entries(worktopLabels),state.worktop);
  options($('niche-select'),Object.entries(nicheLabels),state.niche);
  const fixedProductFinish=p=>{const text=(p.finish+' '+p.name+' '+p.code).toLowerCase();if(text.includes('matte black')||text.includes('matt black')||p.code==='SHELPH-BRA-BLACK')return 'Matte Black';if(text.includes('brushed brass'))return 'Brushed Brass';if(text.includes('brushed bronze'))return 'Brushed Bronze';if(text.includes('gunmetal'))return 'Gunmetal';if(text.includes('chrome'))return 'Chrome';return null;};
  function replacement(p){
   if(p.category==='Basin tap'){
    const type=state.tap==='original'?(p.name.toLowerCase().includes('wall')?'wall':p.name.toLowerCase().includes('tall')?'tall':'mono'):state.tap;
    const exact=config.bank.find(q=>q.category==='Basin tap'&&q.finish===state.finish&&(type==='wall'?q.name.toLowerCase().includes('wall'):type==='tall'?q.name.toLowerCase().includes('tall'):!q.name.toLowerCase().includes('wall')&&!q.name.toLowerCase().includes('tall')));
    if(exact)return exact;
    const available=config.bank.find(q=>q.category==='Basin tap'&&q.finish===state.finish);
    if(available)review.push('Basin tap position: '+state.finish+' is available in a different Scudo tap format; DLS will confirm the position and reach before ordering.');
    return available;
   }
   if(p.category==='Mirror'){
    if(!p.name.startsWith('Aubrey 500'))return p;
    if(state.finish==='Chrome')return config.bank.find(q=>q.category==='Mirror'&&q.code==='LUNAR80');
    return config.bank.find(q=>q.category==='Mirror'&&q.name==='Aubrey 500 x 800'&&q.scheme_finish===state.finish);
   }
   if(p.category==='Niche'){
    const available=config.bank.find(q=>q.category===p.category&&q.scheme_finish===state.finish&&q.name.includes(p.name.includes('300 x 300')?'300 x 300':'600 x 300'));
    if(!available)review.push('Niche: there is no verified Scudo metal niche in '+state.finish+' in this catalogue. DLS will confirm a tiled niche or remove it from the quotation.');
    return available||null;
   }
   if(p.category==='Screen profile pack'&&state.finish==='Chrome')return null;
   if(p.category==='Shower kit'&&p.name.includes('Rigid Riser')){
    if(p.finish===state.finish)return p;
    const exact=config.bank.find(q=>q.category==='Shower kit'&&q.finish===state.finish&&q.name.includes('Rigid Riser'));
    if(exact)return exact;
    const available=config.bank.find(q=>q.category==='Shower kit'&&q.finish===state.finish);
    if(available)review.push('Shower format: the verified '+state.finish+' Scudo option uses a handset and bracket; DLS will confirm the complete shower arrangement.');
    return available;
   }
   if(['Shower kit','Flush plate','Screen profile pack','Shower waste','Basin waste','Basin trap','Bath tap','Toilet roll holder','Towel ring','Robe hook','Tumbler holder','Double towel rail'].includes(p.category))return config.bank.find(q=>q.category===p.category&&q.finish===state.finish);
   return p;
  }
  let selectedProducts=[],review=[];
  function specification(){
   const pkg=selectedPackage();review=[];
   let source=room.products.map(p=>({...p,scheme_finish:room.metal}));
   if(pkg){source=source.filter(p=>!['Vanity','Basin','Shelf brackets','Furniture handles','Furniture handle','Furniture legs'].includes(p.category));source.unshift(...pkg.products.map(p=>({...p,scheme_finish:state.finish})));source=source.map(p=>['Basin tap','Basin waste','Basin trap'].includes(p.category)?{...p,quantity:1}:p);review.push(pkg.note||'Furniture size, wall support, tap holes, bowl reach and waste routing need a room survey.');}
   const chosenWidth=packageWidth(pkg||{name:room.furniture,products:room.products.filter(p=>['Vanity','Basin'].includes(p.category))});
   if(state.width!=='room'){
    if(state.width==='1200-double')review.push('1200mm double-basin requirement: DLS must confirm the exact Scudo furniture, basin configuration, tap spacing and service clearances.');
    else if(!chosenWidth||chosenWidth!==state.width)review.push(widthLabels[state.width]+' basin/furniture requirement: DLS must match an exact Scudo unit and confirm clearances before ordering.');
   }
   if(state.worktop!=='matched')review.push('Worktop direction: '+worktopLabels[state.worktop]+'. Exact Scudo worktop code, cut-outs, joints and finished length must be confirmed.');
   if(state.niche==='without')source=source.filter(p=>!['Niche','Niche lighting kit'].includes(p.category));
   if(state.niche==='with'&&!source.some(p=>p.category==='Niche'))review.push('Add a niche: DLS must confirm the exact Scudo niche size and matching finish after checking wall depth and waterproofing.');
   source=source.filter(p=>p.category!=='Feature / main wall tile'&&!p.category.toLowerCase().includes('floor tile'));
   const wall=tileById(state.wall),makeTile=(t,cat,size)=>({category:cat,name:t.name,url:t.url,brand:t.brand||'Mandarin Stone',code:'',size,quantity:'To measure',note:'Confirm samples, grout and measured area.',optional:false});
   source.push(makeTile(wall,'Feature / main wall tile',wall.wall_format_mm?wall.wall_format_mm.join(' x ')+'mm':wall.size));
   if(state.floor==='original')source.push(...originalFloors);else{const floor=tileById(state.floor);source.push(makeTile(floor,'Floor tile',floor.selected_size_mm?floor.selected_size_mm.join(' x ')+'mm':floor.size));}
   const products=source.flatMap(p=>{
    if(p.category==='Basin tap'||state.finish!==room.metal||room.variant_of){const q=replacement(p);if(q===null)return [];if(!q){review.push(p.category+': matching '+state.finish+' product to be confirmed by DLS.');return [];}return [{...q,quantity:p.quantity,optional:p.optional,category:p.category}];}return [p];
   });
   const fixedCategories=['Basin','Shelf brackets','Furniture handle','Furniture handles','Furniture legs'];
   for(const product of products){const fixed=fixedCategories.includes(product.category)?fixedProductFinish(product):null;if(fixed&&fixed!==state.finish)review.push('Fixed product finish: '+product.name+' is '+fixed+' and does not change to '+state.finish+'. Choose another basin/furniture option or ask DLS to confirm a verified alternative.');}
   return products;
  }
  function shareURL(){const u=new URL('customise/',document.baseURI);u.searchParams.set('look',room.n);for(const k of shareKeys)u.searchParams.set(k,state[k]);return u.href;}
  function catalogueURL(){return new URL('./',document.baseURI).href;}
  function material(label,p,isTile=false){
   const box=node('article',null,'material'+(isTile?' tile':'')),photo=config.photos[p.url];
   if(photo){const im=node('img');im.src=photo.image;im.alt=p.name;im.loading='lazy';box.append(im);}
   const text=node('div',null,'text');text.append(node('strong',label),node('p',p.name));if(p.code)text.append(node('small','Scudo code: '+p.code,'product-code'));const link=node('a','View supplier product');link.href=p.url;link.target='_blank';link.rel='noopener noreferrer';text.append(link);box.append(text);return box;
  }
  function textList(){return [room.id+' / '+room.name,'Finish preference: '+state.finish,'Requested basin/furniture width: '+widthLabels[state.width],'Worktop preference: '+worktopLabels[state.worktop],'Niche: '+nicheLabels[state.niche],'Chosen bathroom and product links: '+shareURL(),'Full DLS bathroom ideas catalogue: '+catalogueURL(),'','Please confirm my DLS price, including available discounts.','',...selectedProducts.map(p=>[p.category+': '+p.name,[p.brand,p.code,p.finish,p.size,'Qty: '+p.quantity].filter(Boolean).join(' · '),p.url,p.note].join('\n')),'','DLS to confirm:',...review,'Room measurements, samples, water pressure, stock and installation.'].join('\n\n');}
  let toastTimer;function toast(message){$('status').textContent=message;$('status').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('status').classList.remove('show'),3500);}
  function render(){
   $('wall-select').value=state.wall;$('width-select').value=state.width;$('worktop-select').value=state.worktop;$('niche-select').value=state.niche;
   const floorChoices=floorIdsFor(tileById(state.wall)).filter(t=>t.url!==originalFloors[0].url);
   options($('floor-select'),[['original','Keep the original sand floor'],...floorChoices.map(t=>[t.id,t.name])],state.floor);
   if(!$('floor-select').value){state.floor='original';$('floor-select').value='original';}
   tileButtons('wall-options','wall',wallPool().map(t=>({id:t.id,tile:t})),state.wall);
   tileButtons('floor-options','floor',[{id:'original',tile:tileByURL(originalFloors[0].url),label:'Original sand'},...floorChoices.map(t=>({id:t.id,tile:t}))],state.floor);
   const pkg=selectedPackage(),mount=pkg?.tap_mount|| (room.products.find(p=>p.category==='Basin tap').name.toLowerCase().includes('wall')?'wall':'mono');
   const tapOptions=[['original',mount==='wall'?'Keep the starting wall-mounted position':'Keep the starting basin-mounted position'],['mono','Basin-mounted mono tap'],['wall','Wall-mounted tap'],['tall','Tall countertop tap']];
   if(!tapOptions.some(t=>t[0]===state.tap))state.tap='original';
   options($('tap-select'),tapOptions,state.tap);
   selectedProducts=specification();
   document.querySelectorAll('[data-finish]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.finish===state.finish)));
   $('finish-note').textContent=visual?'The style preview and available coordinated Scudo fittings update together. Any fixed-colour furniture part is clearly flagged below.':'The available coordinated Scudo fittings update below. Any fixed-colour furniture part is clearly flagged for DLS review.';
   $('basin-note').textContent=(pkg?.note||'The original basin and furniture are kept together. Other combinations include their own matching unit or shelf; final dimensions are checked for your room.')+' Size and worktop selections are requests until DLS confirms a compatible Scudo product code.';
   const floor=state.floor==='original'?tileByURL(originalFloors[0].url):tileById(state.floor);
   $('tile-note').textContent='These are supplier tile samples. DLS will confirm the real samples, quantities and floor suitability before ordering.';
   const preview=config.room_previews[String(room.n)]?.[state.finish];
   if(visual){
    $('room-image').src=visual.walls[state.wall]||room.image;
    const floorLayer=visual.floors[state.floor]||'',finishLayer=visual.finishes[state.finish]||'';
    $('floor-layer').src=floorLayer;$('floor-layer').hidden=!floorLayer;
    $('finish-layer').src=finishLayer;$('finish-layer').hidden=!finishLayer;
    $('visual-badge').hidden=false;
    $('finish-help').textContent='Tap a colour. The style preview and the available coordinated taps, shower and details change together.';
    $('wall-help').textContent='Tap a tile below and watch the walls change.';
   }else{
    $('room-image').src=preview||room.image;
    $('floor-layer').hidden=true;$('finish-layer').hidden=true;$('visual-badge').hidden=true;
    $('finish-help').textContent='Tap a colour. The available coordinated Scudo products update below; the room picture stays as style inspiration.';
    $('wall-help').textContent='Tap a wall tile. Its supplier sample and your product list update below.';
   }
   $('room-image').alt='Bathroom design preview: '+room.description;
   const unchanged=shareKeys.every(k=>state[k]===initial[k]);
   $('preview-label').textContent=visual?state.finish+' · wall and floor preview':preview?'Illustrative '+state.finish+' finish preview':room.curated?'Starting unique room concept':room.variant_of?'Starting style variation':'Starting room illustration';
   $('preview-note').textContent=visual?'Metal finish, wall tile and floor tile change independently as a style preview. The linked supplier items below define the quotation.':unchanged?'Style inspiration. Every selected supplier product is linked below.':'Your product choices update below. The room image remains the starting style visual; it is not an exact product CGI.';
   const summary=$('choice-summary');summary.replaceChildren();[
    'Metal: '+state.finish,
    'Wall: '+tileById(state.wall).name,
    'Floor: '+(state.floor==='original'?'Original floor':floor.name)
   ].forEach(value=>summary.append(node('span',value,'choice-chip')));
   const board=$('selected-board');board.replaceChildren();const wall=tileById(state.wall);
   board.append(material('Wall tile',{...wall},true),material('Floor tile',{...floor},true));
   const basin=selectedProducts.find(p=>p.category==='Basin'),tap=selectedProducts.find(p=>p.category==='Basin tap');
   if(basin)board.append(material('Basin',basin));if(tap)board.append(material('Tap · '+state.finish,tap));
   const list=$('product-list');list.replaceChildren();selectedProducts.forEach(p=>{const li=node('li'),a=node('a',p.category+': '+p.name+(p.optional?' · optional':''));a.href=p.url;a.target='_blank';a.rel='noopener noreferrer';li.append(a,node('p',[p.brand,p.code,p.finish,p.size,'Qty: '+p.quantity].filter(Boolean).join(' · ')));if(p.note)li.append(node('p',p.note));list.append(li);});
   $('item-count').textContent=selectedProducts.length+' linked items';$('review-notes').replaceChildren(node('strong','DLS to confirm'));for(const note of [...new Set(review)])$('review-notes').append(node('p',note));
   $('whatsapp').href='https://wa.me/447539037841?text='+encodeURIComponent('Hi DLS, please price my customised bathroom, including the available DLS discounts.\n\n'+room.id+' — '+room.name+'\nFinish: '+state.finish+'\nWall: '+wall.name+'\nFloor: '+(state.floor==='original'?'Original floor scheme':floor.name)+'\nBasin: '+(pkg?.name||room.furniture)+'\nRequested basin/furniture width: '+widthLabels[state.width]+'\nWorktop preference: '+worktopLabels[state.worktop]+'\nNiche: '+nicheLabels[state.niche]+'\nTap position: '+$('tap-select').selectedOptions[0].textContent+'\n\nView my chosen bathroom and all its product links:\n'+shareURL()+'\n\nBrowse the full DLS bathroom ideas catalogue:\n'+catalogueURL()+'\n\nPlease confirm exact Scudo codes, sizes, availability and fitting details.');
   $('mobile-whatsapp').href=$('whatsapp').href;
   try{localStorage.setItem(key,JSON.stringify(state));}catch{}
   window.dlsCustomiser={room:room.n,state:{...state},products:selectedProducts.map(p=>({...p})),review:[...review],shareUrl:shareURL(),visual:visual?{base:$('room-image').src,floor:$('floor-layer').src,finish:$('finish-layer').src}:null};
  }
  $('wall-select').addEventListener('change',()=>{state.wall=$('wall-select').value;render();});$('floor-select').addEventListener('change',()=>{state.floor=$('floor-select').value;render();});$('basin-select').addEventListener('change',()=>{state.basin=$('basin-select').value;const pkg=selectedPackage(),width=packageWidth(pkg||{name:'',products:[]});state.width=width||'room';state.tap='original';render();});$('tap-select').addEventListener('change',()=>{state.tap=$('tap-select').value;render();});$('width-select').addEventListener('change',()=>{state.width=$('width-select').value;render();});$('worktop-select').addEventListener('change',()=>{state.worktop=$('worktop-select').value;render();});$('niche-select').addEventListener('change',()=>{state.niche=$('niche-select').value;render();});
  $('reset').addEventListener('click',()=>{state={...initial};$('wall-select').value=state.wall;$('basin-select').value=state.basin;render();toast('Starting choices restored');});
  $('share').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(shareURL());toast('Your chosen bathroom link is copied');}catch{const t=node('textarea');t.value=shareURL();document.body.append(t);t.select();const ok=document.execCommand('copy');t.remove();toast(ok?'Your chosen bathroom link is copied':'Use Download my product list to save your choices');}});
  $('download').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([textList()],{type:'text/plain;charset=utf-8'})),a=node('a');a.href=url;a.download=room.id+'-my-bathroom-choices.txt';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);});
  render();$('loading').hidden=true;$('app').hidden=false;
 }catch(e){console.error(e);$('loading').hidden=true;$('error').hidden=false;}
})();
