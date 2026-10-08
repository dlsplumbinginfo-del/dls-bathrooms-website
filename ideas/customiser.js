'use strict';
(async()=>{
 const $=id=>document.getElementById(id),query=new URLSearchParams(location.search);
 const node=(tag,text,cls)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n;};
 try{
  const responses=await Promise.all([fetch('catalogue-data.json'),fetch('customiser-data.json')]);
  if(responses.some(r=>!r.ok))throw new Error('Catalogue unavailable');
  const [looks,config]=await Promise.all(responses.map(r=>r.json()));
  const {RoomPreview,illustratedTile}=await import('./room-preview.js');
  const room=looks.find(d=>d.n===Number(query.get('look')))||looks[0],key='dls-customiser-v2-'+room.n;
  const visual=config.room_visualiser?.[String(room.n)];
  const originalWall=room.products.find(p=>p.category==='Feature / main wall tile'),originalFloors=room.products.filter(p=>p.category.toLowerCase().includes('floor tile'));
  const tileById=id=>config.tiles.find(t=>t.id===id),tileByURL=url=>config.tiles.find(t=>t.url===url);
  const preset=room.customiser||{},originalWallTile=tileByURL(originalWall?.url)||config.tiles[0];
  const initial={finish:preset.finish||room.metal,wall:preset.wall||originalWallTile.id,floor:preset.floor||'original',basin:preset.basin||'original',tap:preset.tap||'original',width:preset.width||'room',worktop:preset.worktop||'matched',niche:preset.niche||'auto',mirror:preset.mirror||'original',roomWidth:String(room.layout?.width||2.4),roomDepth:String(room.layout?.depth||2.9),shape:preset.shape||room.layout?.shape||'rectangle',structure:preset.structure||'half',toilet:preset.toilet||'wall',coverage:preset.coverage||'all',pattern:'stacked',grout:'matched',lighting:room.light==='Cool white'?'cool':'warm',showerFloor:preset.showerFloor||'tray'};
  let stored={};try{stored=JSON.parse(localStorage.getItem(key)||'{}');}catch{}
  const shareKeys=Object.keys(initial);
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
  const allowed={shape:['rectangle','L-shaped','loft','offset'],structure:['clean','half','full','ledge'],toilet:['wall','close'],coverage:['all','feature','half'],pattern:['stacked','vertical'],grout:['matched','white','dark'],lighting:['warm','cool'],showerFloor:['tray','wet']};
  for(const [k,values] of Object.entries(allowed))if(!values.includes(state[k]))state[k]=initial[k];
  if(!Number.isFinite(Number(state.roomWidth))||Number(state.roomWidth)<.9||Number(state.roomWidth)>5)state.roomWidth=initial.roomWidth;
  if(!Number.isFinite(Number(state.roomDepth))||Number(state.roomDepth)<1.4||Number(state.roomDepth)>6)state.roomDepth=initial.roomDepth;
  if(state.mirror!=='original'&&!config.bank.some(p=>p.category==='Mirror'&&p.code===state.mirror))state.mirror='original';
  let model=null;try{model=new RoomPreview($('live-room'),config,info=>{$('fit-notes').textContent=info.warnings.join(' ');$('model-loading').hidden=true;$('mobile-room-image').src=room.image;});}catch(error){$('model-loading').textContent='The live model is unavailable on this device. Your product choices still work.';console.warn(error);}
  $('room-stage').style.display='none';
  new IntersectionObserver(entries=>{$('mobile-room-preview').hidden=entries[0].isIntersecting;}).observe($('live-room'));
  $('mobile-room-preview').addEventListener('click',()=>{$('view-live').click();$('live-room').scrollIntoView({behavior:'smooth',block:'start'});});
  for(const [id,view] of [['view-live','room'],['view-plan','plan'],['view-inspiration','inspiration']])$(id).addEventListener('click',()=>{for(const v of ['view-live','view-plan','view-inspiration'])$(v).setAttribute('aria-pressed',String(v===id));$('live-room').hidden=view==='inspiration';$('room-stage').style.display=view==='inspiration'?'block':'none';$('model-note').textContent=view==='inspiration'?'The starting inspiration stays unchanged. Return to Live room to see your choices.':'Illustrative layout and material model. Drag sideways to look around; DLS checks the actual room.';if(view!=='inspiration'){model?.setView(view);model?.resize();}});
  let range='all',search='';
  document.querySelectorAll('[data-range]').forEach(b=>b.addEventListener('click',()=>{range=b.dataset.range;document.querySelectorAll('[data-range]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));renderTiles();}));
  $('tile-search').addEventListener('input',()=>{search=$('tile-search').value.trim().toLowerCase();renderTiles();});
  $('title').textContent=room.name+' · make it yours';$('ref').textContent=room.id+' / Your choices';$('back').href=new URL('./?look='+room.n,document.baseURI).href;document.title=room.id+' · Make it yours | DLS Bathrooms';
  const colours={'Brushed Bronze':'#a88465','Brushed Brass':'#c3a66b','Chrome':'linear-gradient(135deg,#777,#eee,#aaa)','Matte Black':'#242424','Gunmetal':'#666b6d','Brushed Nickel':'#aaa99e'};
  config.finishes.forEach(f=>{const b=node('button',null);b.type='button';b.dataset.finish=f;const sw=node('span',null,'finish-swatch');sw.style.setProperty('--swatch',colours[f]);sw.setAttribute('aria-hidden','true');b.append(sw,node('span',f));b.addEventListener('click',()=>{state.finish=f;render();});$('finish-options').append(b);});
  const slug=t=>new URL(t.url).pathname.split('/').filter(Boolean).pop();
  const floorIdsFor=()=>config.tiles.filter(t=>state.showerFloor==='wet'?t.wet_room_floors===true:t.bathroom_floors===true);
  function options(select,items,value){select.replaceChildren();items.forEach(([id,label])=>{const o=node('option',label);o.value=id;select.append(o);});select.value=value;}
  function tileButtons(containerId,kind,items,value){
   const container=$(containerId);container.replaceChildren();
   items.forEach(({id,tile,label})=>{if(!tile)return;const button=node('button',null);button.type='button';button.dataset[kind]=id;button.setAttribute('aria-pressed',String(id===value));const photo=config.photos[tile.url];if(photo){const image=node('img');image.src=photo.image;image.alt='';image.loading='lazy';image.addEventListener('error',()=>{image.replaceWith(illustratedTile(tile));});button.append(image);}else button.append(illustratedTile(tile));button.append(node('strong',label||tile.name),node('small',(tile.tier||'Premium')+(tile.price_reference?' · guide £'+tile.price_reference.toFixed(2)+'/m²':'')+' · '+(photo?'Supplier sample':'Illustrative swatch')));button.addEventListener('click',()=>{state[kind]=id;render();const selected=container.querySelector('[data-'+kind+'="'+id+'"]');selected?.focus({preventScroll:true});});container.append(button);});
  }
  const wallPool=()=>config.tiles.filter(t=>(range==='all'||t.tier===range)&&(!search||t.name.toLowerCase().includes(search)));
  let renderedWallPool='';
  function renderTiles(){const tiles=wallPool(),pool=tiles.map(t=>t.id).join('|');if(pool!==renderedWallPool){tileButtons('wall-options','wall',tiles.map(t=>({id:t.id,tile:t})),state.wall);renderedWallPool=pool;}document.querySelectorAll('#wall-options [data-wall]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.wall===state.wall)));if(!tiles.length)$('wall-options').replaceChildren(node('p','No tiles match. Try another word or All ranges.'));}
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
  const mirrors=config.bank.filter(p=>p.category==='Mirror').filter((p,i,a)=>a.findIndex(x=>x.code===p.code)===i);
  options($('mirror-select'),[['original','Keep the starting mirror'],...mirrors.map(p=>[p.code,p.name+' · '+p.code])],state.mirror);
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
   if(p.category==='Bath screen'){const exact=config.bank.find(q=>q.category==='Bath screen'&&q.finish===state.finish);if(exact)return exact;review.push('Bath screen: this finish is offered by Scudo but its exact code still needs confirmation.');return {...p,code:'',finish:state.finish};}
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
   if(state.mirror!=='original'){source=source.filter(p=>p.category!=='Mirror');source.push({...mirrors.find(p=>p.code===state.mirror),quantity:1});}
   if(state.toilet==='close'){source=source.filter(p=>!['Toilet','Toilet seat','WC frame & cistern','Flush plate'].includes(p.category));source.push({...config.close_coupled});}
   else if(source.some(p=>p.code==='COMPLETE-TOILET-SET-2')){source=source.filter(p=>p.category!=='Toilet');for(const category of ['Toilet','Toilet seat','WC frame & cistern','Flush plate']){const item=config.bank.find(p=>p.category===category&&(category!=='Flush plate'||p.finish===state.finish));if(item)source.push({...item,quantity:1});}}
   if(state.showerFloor==='wet'&&room.room!=='Cloakroom'){source=source.filter(p=>!['Shower tray','Shower waste'].includes(p.category));review.push('Tiled wetroom: former, compatible floor drain, tanking, falls and floor depth require a separate specification and price. A tray waste is not a tiled-floor drain.');}
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
   const wall=tileById(state.wall),makeTile=(t,cat,size)=>({category:cat,name:t.name,url:t.url,brand:t.brand||'Mandarin Stone',code:t.supplier_sku||'',size,quantity:'To measure',note:'Confirm samples, grout and measured area.',optional:false});
   source.push(makeTile(wall,'Feature / main wall tile',wall.wall_format_mm?wall.wall_format_mm.join(' x ')+'mm':wall.size));
   if(state.coverage==='feature'){const side=tileById('c5851da6');source.push(makeTile(side,'Other walls tile',side.size));}
   if(state.floor==='original')source.push(...originalFloors);else{const floor=tileById(state.floor);source.push(makeTile(floor,'Floor tile',floor.selected_size_mm?floor.selected_size_mm.join(' x ')+'mm':floor.size));}
   const products=source.flatMap(p=>{
    if(p.category==='Mirror'&&state.mirror!=='original')return [p];
    if(p.category==='Basin tap'||p.category==='Bath screen'||state.finish!==room.metal||room.variant_of){const q=replacement(p);if(q===null)return [];if(!q){review.push(p.category+': matching '+state.finish+' product to be confirmed by DLS.');return [];}return [{...q,quantity:p.quantity,optional:p.optional,category:p.category}];}return [p];
   });
   const fixedCategories=['Basin','Shelf brackets','Furniture handle','Furniture handles','Furniture legs'];
   for(const product of products){const fixed=fixedCategories.includes(product.category)?fixedProductFinish(product):null;if(fixed&&fixed!==state.finish)review.push('Fixed product finish: '+product.name+' is '+fixed+' and does not change to '+state.finish+'. Choose another basin/furniture option or ask DLS to confirm a verified alternative.');}
   review.push('Approximate footprint: '+state.roomWidth+' × '+state.roomDepth+'m; '+state.shape+'. '+structureLabels[state.structure]+'. '+coverageLabels[state.coverage]+'. Tile direction: '+state.pattern+'; grout: '+state.grout+'; lighting feel: '+state.lighting+'. DLS confirms services, ventilation, access and clearances.');
   if(state.coverage==='half')review.push('Upper-wall preparation and painting need a separate specification.');
   if(state.showerFloor==='wet'){const floor=state.floor==='original'?tileByURL(originalFloors[0].url):tileById(state.floor);if(floor?.wet_room_floors!==true)review.push('Selected floor has no verified wetroom-floor suitability. Please choose a verified wetroom tile.');}
   if(products.some(p=>p.category==='Bath')&&!products.some(p=>p.category==='Bath tap'))review.push('Bath filling, waste/overflow, panels or support and the complete valve arrangement need a separate compatible Scudo specification.');
   for(const product of products)if(product.brand==='Scudo'&&!product.code)review.push(product.category+': exact Scudo code and compatibility need confirmation.');
   return products;
  }
  function shareURL(){const u=new URL('customise/',document.baseURI);u.searchParams.set('look',room.n);for(const k of shareKeys)u.searchParams.set(k,state[k]);return u.href;}
  function catalogueURL(){return new URL('./',document.baseURI).href;}
  function material(label,p,isTile=false){
   const box=node('article',null,'material'+(isTile?' tile':'')),photo=config.photos[p.url];
   if(photo){const im=node('img');im.src=photo.image;im.alt=p.name;im.loading='lazy';box.append(im);}else if(isTile){box.append(illustratedTile(p),node('small','Illustrative swatch · view the supplier sample','sample-note'));}
   const text=node('div',null,'text');text.append(node('strong',label),node('p',p.name));if(p.code)text.append(node('small','Scudo code: '+p.code,'product-code'));const link=node('a','View supplier product');link.href=p.url;link.target='_blank';link.rel='noopener noreferrer';text.append(link);box.append(text);return box;
  }
  function textList(){return [room.id+' / '+room.name,'Finish preference: '+state.finish,'Approximate room: '+state.roomWidth+' × '+state.roomDepth+'m · '+state.shape,'Wall detail: '+structureLabels[state.structure],'Requested basin/furniture width: '+widthLabels[state.width],'Worktop preference: '+worktopLabels[state.worktop],'Niche: '+nicheLabels[state.niche],'Chosen bathroom and product links: '+shareURL(),'Full DLS bathroom ideas catalogue: '+catalogueURL(),'','Please confirm my DLS price, including available discounts.','',...selectedProducts.map(p=>[p.category+': '+p.name,[p.brand,p.code,p.finish,p.size,'Qty: '+p.quantity].filter(Boolean).join(' · '),p.url,p.note].join('\n')),'','DLS to confirm:',...review,'Room measurements, samples, water pressure, stock and installation.'].join('\n\n');}
  const structureLabels={clean:'Clean wall / no continuous boxing',half:'Half-height service wall and ledge',full:'Full-height service wall',ledge:'Slim ledge only'},coverageLabels={all:'All walls tiled',feature:'Feature wall with pale side walls',half:'Half-height tiles with painted upper walls'};
  let history=[JSON.stringify(state)],historyIndex=0,replaying=false;
  let toastTimer;function toast(message){$('status').textContent=message;$('status').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('status').classList.remove('show'),3500);}
  let renderedFloorPool='';
  function render(){
   for(const [id,k] of [['shape-select','shape'],['structure-select','structure'],['toilet-select','toilet'],['coverage-select','coverage'],['pattern-select','pattern'],['grout-select','grout'],['lighting-select','lighting'],['shower-floor-select','showerFloor'],['mirror-select','mirror'],['room-width','roomWidth'],['room-depth','roomDepth']])$(id).value=state[k];
   $('shower-floor-field').hidden=room.room==='Cloakroom'||room.layout?.bath==='inset';
   $('wall-select').value=state.wall;$('width-select').value=state.width;$('worktop-select').value=state.worktop;$('niche-select').value=state.niche;
   const floorChoices=floorIdsFor(tileById(state.wall)).filter(t=>t.url!==originalFloors[0].url);
   options($('floor-select'),[['original','Keep '+tileByURL(originalFloors[0].url).name],...floorChoices.map(t=>[t.id,t.name])],state.floor);
   if(!$('floor-select').value){state.floor='original';$('floor-select').value='original';}
   options($('wall-select'),config.tiles.map(t=>[t.id,t.name]),state.wall);renderTiles();
   const floorPoolKey=floorChoices.map(t=>t.id).join('|');if(floorPoolKey!==renderedFloorPool){tileButtons('floor-options','floor',[{id:'original',tile:tileByURL(originalFloors[0].url),label:'Starting floor'},...floorChoices.map(t=>({id:t.id,tile:t}))],state.floor);renderedFloorPool=floorPoolKey;}document.querySelectorAll('#floor-options [data-floor]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.floor===state.floor)));
   const pkg=selectedPackage(),mount=pkg?.tap_mount|| (room.products.find(p=>p.category==='Basin tap').name.toLowerCase().includes('wall')?'wall':'mono');
   const tapOptions=[['original',mount==='wall'?'Keep the starting wall-mounted position':'Keep the starting basin-mounted position'],['mono','Basin-mounted mono tap'],['wall','Wall-mounted tap'],['tall','Tall countertop tap']];
   if(!tapOptions.some(t=>t[0]===state.tap))state.tap='original';
   options($('tap-select'),tapOptions,state.tap);
   selectedProducts=specification();
   try{model?.update(room,state,selectedProducts);}catch(error){console.warn('3D preview failed; product choices remain available',error);model=null;$('model-loading').hidden=false;$('model-loading').textContent='The 3D preview is unavailable on this device. Your chosen products and finishes remain selected.';$('view-inspiration').click();$('view-live').disabled=true;$('view-plan').disabled=true;}
   review.push(...(model?.warnings||[]));
   $('finish-help').textContent='Tap a colour. The live room and available coordinated Scudo products update together.';
   $('wall-help').textContent='Choose from '+config.tiles.length+' tiles. The live room changes immediately.';
   document.querySelectorAll('[data-finish]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.finish===state.finish)));
   $('finish-note').textContent=visual?'The style preview and available coordinated Scudo fittings update together. Any fixed-colour furniture part is clearly flagged below.':'The available coordinated Scudo fittings update below. Any fixed-colour furniture part is clearly flagged for DLS review.';
   $('basin-note').textContent=(pkg?.note||'The original basin and furniture are kept together. Other combinations include their own matching unit or shelf; final dimensions are checked for your room.')+' Size and worktop selections are requests until DLS confirms a compatible Scudo product code.';
   const floor=state.floor==='original'?tileByURL(originalFloors[0].url):tileById(state.floor);
   $('tile-note').textContent='These are supplier tile samples. DLS will confirm the real samples, quantities and floor suitability before ordering.';
   $('room-image').src=config.room_previews?.[String(room.n)]?.[state.finish]||room.image;$('floor-layer').hidden=true;$('finish-layer').hidden=true;$('visual-badge').hidden=true;
   $('room-image').alt='Starting inspiration: '+room.description;
   $('finish-help').textContent='Tap a colour. The live room and available coordinated Scudo products update together.';
   $('wall-help').textContent='Choose a tile to see it in the live room.';
   $('finish-note').textContent='The live finish changes. Fixed-colour furniture parts are flagged below.';
   $('tile-note').textContent='Supplier photos and labelled illustrative swatches show material directions. Confirm physical samples and suitability with DLS.';
   $('preview-label').textContent='Your live layout and material choices';
   $('preview-note').textContent='Illustrative 3D layout, not an exact Scudo product render. Linked products and physical samples define your quotation.';
   const summary=$('choice-summary');summary.replaceChildren();[
    'Metal: '+state.finish,
    'Wall: '+tileById(state.wall).name,
    'Floor: '+(state.floor==='original'?'Original floor':floor.name),
     'Vanity: '+(selectedProducts.find(p=>p.category==='Vanity')?.name||pkg?.name||room.furniture),
     'Mirror: '+(selectedProducts.find(p=>p.category==='Mirror')?.name||'DLS to confirm')
   ].forEach(value=>summary.append(node('span',value,'choice-chip')));
   const board=$('selected-board');board.replaceChildren();const wall=tileById(state.wall);
   board.append(material('Wall tile',{...wall},true),material('Floor tile',{...floor},true));
   const basin=selectedProducts.find(p=>p.category==='Basin'),tap=selectedProducts.find(p=>p.category==='Basin tap');
   if(basin)board.append(material('Basin',basin));if(tap)board.append(material('Tap · '+state.finish,tap));const vanity=selectedProducts.find(p=>p.category==='Vanity'),mirror=selectedProducts.find(p=>p.category==='Mirror');if(vanity)board.append(material('Vanity',vanity));if(mirror)board.append(material('Mirror',mirror));
   const list=$('product-list');list.replaceChildren();selectedProducts.forEach(p=>{const li=node('li'),a=node('a',p.category+': '+p.name+(p.optional?' · optional':''));a.href=p.url;a.target='_blank';a.rel='noopener noreferrer';li.append(a,node('p',[p.brand,p.code,p.finish,p.size,'Qty: '+p.quantity].filter(Boolean).join(' · ')));if(p.note)li.append(node('p',p.note));list.append(li);});
   $('item-count').textContent=selectedProducts.length+' linked items';$('review-notes').replaceChildren(node('strong','DLS to confirm'));for(const note of [...new Set(review)])$('review-notes').append(node('p',note));
   $('whatsapp').href='https://wa.me/447539037841?text='+encodeURIComponent('Hi DLS, please price my customised bathroom, including the available DLS discounts.\n\n'+room.id+' — '+room.name+'\nFinish: '+state.finish+'\nWall: '+wall.name+'\nFloor: '+(state.floor==='original'?'Original floor scheme':floor.name)+'\nBasin: '+(pkg?.name||room.furniture)+'\nRequested basin/furniture width: '+widthLabels[state.width]+'\nWorktop preference: '+worktopLabels[state.worktop]+'\nNiche: '+nicheLabels[state.niche]+'\nTap position: '+$('tap-select').selectedOptions[0].textContent+'\n\nView my chosen bathroom and all its product links:\n'+shareURL()+'\n\nBrowse the full DLS bathroom ideas catalogue:\n'+catalogueURL()+'\n\nPlease confirm exact Scudo codes, sizes, availability and fitting details.');
   $('mobile-whatsapp').href=$('whatsapp').href;
   const snapshot=JSON.stringify(state);if(!replaying&&history[historyIndex]!==snapshot){history=history.slice(0,historyIndex+1);history.push(snapshot);historyIndex++;}
   $('undo-design').disabled=historyIndex===0;$('redo-design').disabled=historyIndex===history.length-1;
   $('quote-form').href='/quote?design='+encodeURIComponent(shareURL());
   try{localStorage.setItem(key,snapshot);}catch{}
   window.dlsCustomiser={room:room.n,state:{...state},products:selectedProducts.map(p=>({...p})),review:[...review],shareUrl:shareURL(),visual:model?{type:'live-3d',serial:model.serial,warnings:model.warnings}:null};
  }
  $('wall-select').addEventListener('change',()=>{state.wall=$('wall-select').value;render();});$('floor-select').addEventListener('change',()=>{state.floor=$('floor-select').value;render();});$('basin-select').addEventListener('change',()=>{state.basin=$('basin-select').value;const pkg=selectedPackage(),width=packageWidth(pkg||{name:'',products:[]});state.width=width||'room';state.tap='original';render();});$('tap-select').addEventListener('change',()=>{state.tap=$('tap-select').value;render();});$('width-select').addEventListener('change',()=>{state.width=$('width-select').value;render();});$('worktop-select').addEventListener('change',()=>{state.worktop=$('worktop-select').value;render();});$('niche-select').addEventListener('change',()=>{state.niche=$('niche-select').value;render();});
  for(const [id,k] of [['shape-select','shape'],['structure-select','structure'],['toilet-select','toilet'],['coverage-select','coverage'],['pattern-select','pattern'],['grout-select','grout'],['lighting-select','lighting'],['shower-floor-select','showerFloor'],['mirror-select','mirror'],['room-width','roomWidth'],['room-depth','roomDepth']])$(id).addEventListener('change',()=>{const value=$(id).value;if(k==='roomWidth'||k==='roomDepth'){if(!$(id).checkValidity()){toast('Enter dimensions within the shown range');$(id).value=state[k];return;}}state[k]=value;render();});
  $('undo-design').addEventListener('click',()=>{if(historyIndex>0){state=JSON.parse(history[--historyIndex]);replaying=true;render();$('basin-select').value=state.basin;replaying=false;}});
  $('redo-design').addEventListener('click',()=>{if(historyIndex<history.length-1){state=JSON.parse(history[++historyIndex]);replaying=true;render();$('basin-select').value=state.basin;replaying=false;}});
  const versionsKey=key+'-versions';let versions=[];try{versions=JSON.parse(localStorage.getItem(versionsKey)||'[]').filter(v=>v&&typeof v.url==='string'&&v.url.startsWith(location.origin+'/ideas/customise/')).slice(0,6);}catch{}
  function showVersions(){$('saved-designs').replaceChildren();versions.forEach((v,i)=>{const row=node('div'),a=node('a',v.label),remove=node('button','Remove');a.href=v.url;remove.type='button';remove.addEventListener('click',()=>{versions.splice(i,1);try{localStorage.setItem(versionsKey,JSON.stringify(versions));}catch{}showVersions();});row.append(a,remove);$('saved-designs').append(row);});}
  $('save-design').addEventListener('click',()=>{versions.unshift({label:tileById(state.wall).name+' · '+state.finish,url:shareURL()});versions=versions.slice(0,6);try{localStorage.setItem(versionsKey,JSON.stringify(versions));toast('Version saved on this device');}catch{toast('Device storage unavailable. Copy your design link instead.');}showVersions();});showVersions();
  $('reset').addEventListener('click',()=>{state={...initial};$('wall-select').value=state.wall;$('basin-select').value=state.basin;render();toast('Starting choices restored');});
  $('share').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(shareURL());toast('Your chosen bathroom link is copied');}catch{const t=node('textarea');t.value=shareURL();document.body.append(t);t.select();const ok=document.execCommand('copy');t.remove();toast(ok?'Your chosen bathroom link is copied':'Use Download my product list to save your choices');}});
  $('download').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([textList()],{type:'text/plain;charset=utf-8'})),a=node('a');a.href=url;a.download=room.id+'-my-bathroom-choices.txt';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);});
  render();$('loading').hidden=true;$('app').hidden=false;
 }catch(e){console.error(e);$('loading').hidden=true;$('error').hidden=false;}
})();
