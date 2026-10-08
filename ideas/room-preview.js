import * as T from './vendor/three.module.js';

// A dimensional style model, not a manufacturer CAD model or an installation plan.
const palettes={Chrome:'#c5cbd0','Brushed Bronze':'#9c7457','Brushed Brass':'#b5a060','Matte Black':'#242729',Gunmetal:'#596065','Brushed Nickel':'#aeb1a7'};
export function tileAppearance(tile){
 const n=tile.name.toLowerCase();
 const color=n.includes('green')?'#315745':n.includes('pink')?'#c39283':n.includes('violetta')?'#eee5dc':n.includes('blue')?'#56728a':n.includes('orange')?'#b86c42':n.includes('black')||n.includes('anthracite')?'#393b3a':n.includes('wood')||n.includes('jakob')||n.includes('dakaris')?'#b1936f':n.includes('grey')?'#b4b6b2':n.includes('sand')||n.includes('beige')?'#cfc4ad':'#e7e4d9';
 return {color,kind:n.includes('marble')||n.includes('carrara')?'marble':n.includes('terrazzo')?'terrazzo':n.includes('wood')||n.includes('jakob')||n.includes('dakaris')?'wood':n.includes('hoxton')||n.includes('zen')?'brick':'stone',gloss:n.includes('gloss')};
}
export function illustratedTile(tile,size=256){
 const c=document.createElement('canvas');c.width=c.height=size;const x=c.getContext('2d'),a=tileAppearance(tile);
 x.fillStyle=a.color;x.fillRect(0,0,size,size);
 let seed=[...tile.id].reduce((s,v)=>s+v.charCodeAt(0),71);const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 if(a.kind==='marble'){for(let i=0;i<9;i++){x.strokeStyle=tile.name.includes('Violetta')?'#755d6960':'#797e7950';x.lineWidth=1+rnd()*3;x.beginPath();let y=rnd()*size;x.moveTo(0,y);for(let j=0;j<8;j++){y+=(rnd()-.4)*size/3;x.lineTo(j*size/7,y);}x.stroke();}}
 else if(a.kind==='wood'){for(let i=0;i<55;i++){x.strokeStyle=i%4?'#67513935':'#efd1a455';x.lineWidth=rnd()*3;x.beginPath();const z=rnd()*size;x.moveTo(z,0);x.bezierCurveTo(z+12,70,z-8,170,z,size);x.stroke();}}
 else if(a.kind==='terrazzo'){for(let i=0;i<450;i++){x.fillStyle=['#81756960','#8d958860','#c3a89190','#ffffffa0'][i%4];x.beginPath();x.ellipse(rnd()*size,rnd()*size,1+rnd()*4,1+rnd()*3,rnd()*6,0,Math.PI*2);x.fill();}}
 else {for(let i=0;i<2200;i++){x.fillStyle=rnd()>.5?'#ffffff08':'#00000008';x.fillRect(rnd()*size,rnd()*size,2+rnd()*12,1+rnd()*5);}}
 if(a.kind==='brick'){for(let row=0;row<4;row++){x.strokeStyle='#ede6d599';x.lineWidth=2;x.strokeRect(0,row*size/4,size,size/4);x.beginPath();x.moveTo(row%2?size/2:size/4,row*size/4);x.lineTo(row%2?size/2:size/4,(row+1)*size/4);x.stroke();}}
 return c;
}
export class RoomPreview{
 constructor(container,config,onReady){
  this.config=config;this.container=container;this.textures=new Map();this.materials=new Map();this.serial=0;
  this.scene=new T.Scene();this.scene.background=new T.Color('#e9e7e0');
  this.camera=new T.PerspectiveCamera(60,1,.02,40);
  this.renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true,alpha:false,powerPreference:'low-power'});
  this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFSoftShadowMap;
  this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=.95;
  this.renderer.domElement.setAttribute('aria-label','Live three-dimensional bathroom layout preview');this.renderer.domElement.setAttribute('role','img');container.append(this.renderer.domElement);
  this.scene.add(new T.HemisphereLight(0xffffff,0x8c877a,1.8));
  this.sun=new T.DirectionalLight(0xfff5e4,2.3);this.sun.position.set(-1.5,4,3);this.sun.castShadow=true;this.sun.shadow.mapSize.set(2048,2048);this.sun.shadow.camera.left=-5;this.sun.shadow.camera.right=5;this.sun.shadow.camera.top=5;this.sun.shadow.camera.bottom=-5;this.sun.shadow.bias=-.0005;this.scene.add(this.sun);
  this.fill=new T.PointLight(0xffeac9,8,8,2);this.scene.add(this.fill);
  this.group=new T.Group();this.scene.add(this.group);this.view='room';this.yaw=0;
  const observer=new ResizeObserver(()=>this.resize());observer.observe(container);this.observer=observer;
  let down=null;this.renderer.domElement.style.touchAction='pan-y';
  this.renderer.domElement.addEventListener('pointerdown',e=>{down={x:e.clientX,start:this.yaw};});
  this.renderer.domElement.addEventListener('pointermove',e=>{if(down&&Math.abs(e.clientX-down.x)>8){this.yaw=Math.max(-.3,Math.min(.3,down.start+(e.clientX-down.x)/900));this.positionCamera();}});
  addEventListener('pointerup',()=>down=null);this.onReady=onReady;this.resize();
 }
 resize(){const w=this.container.clientWidth||640,h=Math.max(260,w*.75);this.renderer.setSize(w,h,false);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();this.draw();}
 mat(color,extra={}){const k=color+JSON.stringify(extra);if(!this.materials.has(k))this.materials.set(k,new T.MeshStandardMaterial({color,roughness:.6,...extra}));return this.materials.get(k);}
 tileMat(tile,w,h,state,rotate=false){
  const key=tile.id+'|'+w+'|'+h+'|'+state.pattern+'|'+state.grout+'|'+rotate;
  if(this.materials.has(key))return this.materials.get(key);
  const a=tileAppearance(tile),size=1024,canvas=illustratedTile(tile,size),cx=canvas.getContext('2d');
  const sample=this.config.photos[tile.url],cached=this.textures.get(tile.id);
  if(cached)cx.drawImage(cached,0,0,size,size);
  else if(sample&&!this.textures.has(tile.id)){this.textures.set(tile.id,null);const im=new Image();im.onload=()=>{this.textures.set(tile.id,im);for(const [k,m] of this.materials)if(k.startsWith(tile.id+'|')){m.map?.dispose();m.dispose();this.materials.delete(k);}if(this.current)this.update(...this.current);};im.src=sample.image;}
  // Grout and laying pattern are material directions; final tile sizes remain supplier specifications.
  cx.strokeStyle=state.grout==='dark'?'#5e5d57':state.grout==='white'?'#f4f2ea':'#b6ada0';cx.lineWidth=3;cx.strokeRect(1.5,1.5,size-3,size-3);
  const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.wrapS=texture.wrapT=T.RepeatWrapping;
  const dims=tile.wall_format_mm||tile.selected_size_mm||[1200,600];let tw=dims[0]/1000,th=dims[1]/1000;
  if(a.kind==='brick'){tw=.48;th=.24;}
  if(rotate||state.pattern==='vertical'){[tw,th]=[th,tw];texture.rotation=Math.PI/2;}
  texture.repeat.set(w/Math.max(.1,tw),h/Math.max(.1,th));texture.anisotropy=Math.min(8,this.renderer.capabilities.getMaxAnisotropy());
  const material=new T.MeshStandardMaterial({map:texture,roughness:a.gloss?.22:.75,color:'#ffffff',side:T.DoubleSide});this.materials.set(key,material);return material;
 }
 add(geometry,material,pos,parent=this.group){const mesh=new T.Mesh(geometry,material);mesh.position.set(...pos);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
 box(w,h,d,pos,material,parent){return this.add(new T.BoxGeometry(w,h,d),material,pos,parent);}
 plane(w,h,pos,rotation,material){const p=this.add(new T.PlaneGeometry(w,h),material,pos);p.rotation.set(...rotation);p.castShadow=false;return p;}
 cylinder(r,h,pos,material,parent){return this.add(new T.CylinderGeometry(r,r,h,24),material,pos,parent);}
 rounded(w,h,d,pos,material,parent,r=.025){
  const s=new T.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);
  const g=new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSize:.006,bevelThickness:.006,bevelSegments:2,steps:1,curveSegments:16});g.translate(0,0,-d/2);return this.add(g,material,pos,parent);
 }
 basin(w,parent,top=.85){
  const white=this.mat('#f3f3ef',{roughness:.16}),inside=this.mat('#d9dcd7',{roughness:.25});
  this.rounded(w+.025,.07,.37,[0,top,0],white,parent,.018);
  const bowl=this.add(new T.SphereGeometry(.19,40,24,0,Math.PI*2,Math.PI/2,Math.PI/2),inside,[0,top+.04,.018],parent);bowl.scale.set(Math.min(w*.75,.38)/.38,.35,.7);bowl.material=inside;inside.side=T.DoubleSide;
  const drain=this.cylinder(.015,.005,[0,top-.015,.018],this.mat('#777b7b',{metalness:.8,roughness:.25}),parent);
 }
 furniture(pkg,width,metal,mirror,tap,state,loc){
  const g=new T.Group();g.position.set(...loc);g.rotation.y=-Math.PI/2;this.group.add(g);
  const text=(pkg?.name||'')+' '+(pkg?.products||[]).map(p=>p.name).join(' '),n=text.toLowerCase();
  const color=n.includes('green')?'#3d5a49':n.includes('black')?'#272c2b':n.includes('blue')?'#3f586c':n.includes('grey')?'#9a9f9b':n.includes('white')?'#e4e7e2':'#b39571';
  const m=this.mat(color,{roughness:.55}),shelf=n.includes('shelf'),standing=n.includes('standing');
  if(shelf){this.box(width,.065,.38,[0,.72,0],m,g);this.basin(Math.min(width,.58),g,.81);}
  else {this.rounded(width,.46,.36,[0,.59,0],m,g,.045);this.basin(width,g,.85);if(state.worktop!=='matched'){const colors={'pure-white':'#fafaf5','marble-light':'#d9d8d0',oak:'#b9976c','dark-stone':'#343b3c'};this.box(width+.035,.035,.38,[0,.893,0],this.mat(colors[state.worktop]),g);this.basin(Math.min(width,.55),g,.95);}if(standing)this.box(width*.85,.32,.3,[0,.22,0],m,g);
   if(n.includes('fluted')||n.includes('curve'))for(let x=-width/2+.025;x<width/2-.02;x+=.022)this.box(.006,.41,.011,[x,.59,.19],this.mat(color,{roughness:.4}),g);
   else this.box(width-.04,.004,.004,[0,.57,.19],this.mat('#66695b'),g);
  }
  const mt=this.mat(palettes[metal]||'#adb4b4',{metalness:.87,roughness:metal==='Matte Black'?.5:.3});
  if(tap==='wall'){const p=this.cylinder(.014,.15,[0,1.05,-.2],mt,g);p.rotation.x=Math.PI/2;this.cylinder(.026,.012,[.11,1.05,-.25],mt,g).rotation.x=Math.PI/2;}
  else {this.cylinder(.014,tap==='tall'?.28:.15,[0,tap==='tall'?1.03:.95,-.13],mt,g);const p=this.cylinder(.012,.1,[0,tap==='tall'?1.16:1.02,-.09],mt,g);p.rotation.x=Math.PI/2;}
  const mirrorName=mirror?.name||'Lunar 600';const dim=mirrorName.match(/(400|500|600|800)/);const mw=Number(dim?.[1]||600)/1000,round=/lunar|round|macie/i.test(mirrorName),mh=round?mw:.8;
  const back=this.mat('#f2e6c3',{emissive:'#ffe4a8',emissiveIntensity:.45}),reflect=this.mat('#a3b6b4',{metalness:.65,roughness:.14});
  if(round){let rim=this.add(new T.CircleGeometry(mw/2+.015,64),back,[0,1.55,-.172],g);this.add(new T.CircleGeometry(mw/2,64),reflect,[0,1.55,-.161],g);}
  else {this.rounded(mw+.025,mh+.025,.01,[0,1.55,-.17],back,g,.08);this.rounded(mw,mh,.01,[0,1.55,-.156],reflect,g,.07);}
 }
 toilet(x,z,state,metal){
  const g=new T.Group();g.position.set(x,0,z);this.group.add(g);const ceramic=this.mat('#f2f3ef',{roughness:.18});
  if(state.toilet==='close')this.rounded(.36,.42,.16,[0,.6,-.16],ceramic,g,.035);
  const bowl=this.add(new T.SphereGeometry(1,40,24),ceramic,[0,.36,.1],g);bowl.scale.set(.19,.17,.255);
  const seat=this.add(new T.TorusGeometry(.15,.013,12,48),ceramic,[0,.49,.09],g);seat.rotation.x=Math.PI/2;seat.scale.set(1,1.5,1);
  this.rounded(.34,.025,.42,[0,.475,.08],this.mat('#e8eae5'),g,.08);
  if(state.toilet==='close')this.rounded(.21,.23,.2,[0,.14,.0],ceramic,g,.025);
  else this.rounded(.22,.125,.27,[0,.29,-.03],ceramic,g,.035);
  if(state.toilet!=='close')this.rounded(.22,.14,.01,[x,1.0,z-.28],this.mat(palettes[metal],{metalness:.8,roughness:.3}),this.group,.015);
 }
 bath(x,z,mode,metal){
  const g=new T.Group();g.position.set(x,0,z);this.group.add(g);const ceramic=this.mat('#f5f5ef',{roughness:.18});
  this.rounded(.7,.52,1.65,[0,.31,0],ceramic,g,mode==='inset'?.04:.22);
  const rim=this.add(new T.TorusGeometry(.3,.028,16,64),ceramic,[0,.59,0],g);rim.rotation.x=Math.PI/2;rim.scale.set(1,2.45,1);
  const inside=this.add(new T.SphereGeometry(1,48,24,0,Math.PI*2,Math.PI/2,Math.PI/2),this.mat('#d3dcd8',{roughness:.2,side:T.DoubleSide}),[0,.59,0],g);inside.scale.set(.275,.43,.68);
 }
 update(room,state,products){
  this.current=[room,{...state},products];this.state={...state};this.room=room;
  // Geometries change with layout. Cached materials and tile textures are reused.
  this.group.traverse(o=>{if(o.isMesh)o.geometry.dispose();});this.group.clear();
  const w=Number(state.roomWidth||room.layout?.width||2.4),d=Number(state.roomDepth||room.layout?.depth||2.8),h=2.4;
  this.w=w;this.d=d;const tile=id=>this.config.tiles.find(t=>t.id===id)||this.config.tiles[0];
  const wall=tile(state.wall),floor=state.floor==='original'?this.config.tiles.find(t=>room.products.some(p=>p.category.toLowerCase().includes('floor tile')&&p.url===t.url))||tile('84b33a4f'):tile(state.floor);
  const wm=this.tileMat(wall,w,h,state),fm=this.tileMat(floor,w,d,state),paint=this.mat('#ebe9e1');
  this.wallSurfaces=[];
  const tiled=(mesh,tileId,name)=>{mesh.userData.tileId=tileId;mesh.userData.tiledSurface=name;this.wallSurfaces.push({name,tileId});return mesh;};
  const half=state.coverage==='half';
  tiled(this.plane(w,half?1.2:h,[0,(half?1.2:h)/2,0],[0,0,0],wm),wall.id,'back');
  if(half)this.plane(w,1.2,[0,1.8,-.002],[0,0,0],paint);
  for(const side of [-1,1]){
   const sideTile=state.coverage==='feature'?tile('c5851da6'):wall;
   const sideMat=this.tileMat(sideTile,d,h,state);
   tiled(this.plane(d,half?1.2:h,[side*w/2,(half?1.2:h)/2,d/2],[0,-side*Math.PI/2,0],sideMat),sideTile.id,side<0?'left':'right');
   if(half)this.plane(d,1.2,[side*w/2,1.8,d/2],[0,-side*Math.PI/2,0],paint);
  }
  this.floorTileId=floor.id;
  this.plane(w,d,[0,0,d/2],[-Math.PI/2,0,0],fm);
  const structure=state.structure||room.layout?.structure||'half',boxDepth=structure==='full'?.22:structure==='half'?.2:0;
  if(boxDepth){const height=structure==='full'?h:1.12;tiled(this.box(w,height,boxDepth,[0,height/2,boxDepth/2],wm),wall.id,'service wall');if(structure==='half')this.box(w+.015,.025,.25,[0,1.14,.11],this.mat('#e4ded0'));}
  if(structure==='ledge')this.box(w,.045,.14,[0,1.14,.08],wm);
  if(state.shape==='offset')tiled(this.box(.25,h,.55,[-w/2+.125,h/2,d-.275],wm),wall.id,'offset wall');
  if(state.shape==='L-shaped'){tiled(this.box(.65,h,.7,[w/2-.325,h/2,.35],wm),wall.id,'return wall');}
  if(state.shape==='loft'){const left=-w/2,span=Math.min(.85,w*.65),geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute([left,1.75,0,left,1.75,d,left+span,h,d,left,1.75,0,left+span,h,d,left+span,h,0],3));geometry.computeVertexNormals();const roof=this.add(geometry,this.mat('#ebe9e1',{side:T.DoubleSide}),[0,0,0]);roof.userData.ceiling=true;}
  if(room.layout?.window){this.rounded(.65,.48,.025,[w/2-.5,1.85,boxDepth+.02],this.mat('#526561'));this.rounded(.57,.4,.025,[w/2-.5,1.85,boxDepth+.04],this.mat('#d9e8e4',{emissive:'#dae8e5',emissiveIntensity:.2}));}
  const mt=this.mat(palettes[state.finish]||'#c5cbd0',{metalness:.8,roughness:.3});const shower=room.room!=='Cloakroom',hasBath=products.some(p=>p.category==='Bath')||room.layout?.bath;
  let showerW=Math.min(w*.6,1.05),showerD=.95;
  if(shower&&(!hasBath||room.layout?.bath==='free')){const base=state.showerFloor==='wet'?fm:this.mat('#eeeae2',{roughness:.27});this.box(showerW,.045,showerD,[-w/2+showerW/2,.025,boxDepth+showerD/2],base);
   let glass=this.materials.get('glass');if(!glass){glass=new T.MeshPhysicalMaterial({color:'#cfe2df',transparent:true,opacity:.16,roughness:.1,metalness:0,side:T.DoubleSide,depthWrite:false});this.materials.set('glass',glass);}
   this.plane(showerW*.72,1.98,[-w/2+showerW*.36,1.03,boxDepth+showerD],[0,0,0],glass);
   this.box(.018,1.98,.025,[-w/2+.01,1.02,boxDepth+showerD],mt);this.box(showerW*.72,.016,.016,[-w/2+showerW*.36,2.02,boxDepth+showerD],mt);
  }
  if(shower){const sx=-w/2+.42,sz=boxDepth+.08;this.cylinder(.028,.055,[sx,1.16,sz],mt).rotation.x=Math.PI/2;this.cylinder(.012,.9,[sx,1.65,sz],mt);const arm=this.cylinder(.012,.34,[sx,2.08,sz+.17],mt);arm.rotation.x=Math.PI/2;this.cylinder(.12,.02,[sx,2.07,sz+.32],mt);
   if(state.niche==='with'||state.niche==='auto'&&products.some(p=>p.category==='Niche')){this.rounded(.57,.27,.012,[sx,1.35,sz+.004],this.mat('#474b43'),this.group,.015);this.box(.54,.008,.024,[sx,1.465,sz+.012],this.mat('#ead69e',{emissive:'#ffe1a0',emissiveIntensity:.5}));}
  }
  const tx=room.room==='Cloakroom'?-.12:w/2-.37;this.toilet(tx,boxDepth+(state.shape==='L-shaped'?.98:.28),state,state.finish);
  const selectedVanity=products.find(p=>p.category==='Vanity'),selectedBasin=products.find(p=>p.category==='Basin');
  const pkg=this.config.packages.find(p=>p.id===state.basin)||{name:room.furniture,products:[selectedVanity,selectedBasin].filter(Boolean)};
  const text=pkg.name+' '+pkg.products.map(p=>p.name+' '+p.code).join(' '),exact=text.match(/\b(450|500|600|700|750|800|900|1200)\b/),requested=state.width==='room'?Number(exact?.[1]||600):Number(state.width.split('-')[0]);
  const width=Math.max(.4,Math.min(1.2,requested/1000));
  const mirror=products.find(p=>p.category==='Mirror');const cabinetZ=Math.max(1.15,Math.min(d-.48,hasBath?d*.72:d*.67));
  this.furniture(pkg,width,state.finish,mirror,state.tap==='original'?(products.find(p=>p.category==='Basin tap')?.name.toLowerCase().includes('wall')?'wall':products.find(p=>p.category==='Basin tap')?.name.toLowerCase().includes('tall')?'tall':pkg.tap_mount||'mono'):state.tap,state,[w/2-.185,0,cabinetZ]);
  if(room.layout?.bath==='inset'){const glass=this.mat('#d0e3df',{transparent:true,opacity:.2,side:T.DoubleSide,depthWrite:false});this.plane(.8,1.5,[-w/2+.72,1.34,boxDepth+.5],[0,Math.PI/2,0],glass);this.box(.015,1.5,.02,[-w/2+.72,1.34,boxDepth+.1],mt);}
  if(hasBath)this.bath(-w/2+.37,room.layout?.bath==='free'?d-1:d/2,room.layout?.bath==='inset'?'inset':'free',state.finish);
  this.fill.position.set(w*.2,2.15,d*.68);this.fill.color.set(state.lighting==='cool'?'#edf4ff':'#ffe8c8');this.sun.color.set(state.lighting==='cool'?'#f4f8ff':'#fff4e0');
  this.warnings=[];
  if(room.room!=='Cloakroom'&&w<1.5)this.warnings.push('This room width needs a bespoke layout check.');
  if(width>d-1.05)this.warnings.push('The requested furniture may conflict with the shower or door zone.');
  if(hasBath&&(d<2.1||w<1.7))this.warnings.push('A bath may not fit this footprint with usable access.');
  if(state.toilet==='wall'&&structure==='clean')this.warnings.push('A wall-hung WC needs sufficient existing wall depth or a local frame enclosure.');
  if(state.showerFloor==='wet'&&floor.wet_room_floors!==true)this.warnings.push('This floor tile has no verified wetroom-floor suitability. Choose a verified wetroom tile or keep a tray.');
  this.serial++;this.positionCamera();this.onReady?.({warnings:this.warnings,width,dimensions:[w,d],serial:this.serial});
 }
 positionCamera(){if(!this.w)return;this.group.traverse(o=>{if(o.userData.ceiling)o.visible=this.view!=='plan';});if(this.view==='plan'){this.camera.position.set(0,Math.max(this.w,this.d)*1.6,this.d/2+.001);this.camera.up.set(0,0,-1);this.camera.lookAt(0,0,this.d/2);}else{this.camera.up.set(0,1,0);this.camera.position.set(this.yaw*this.w,1.7,this.d+.8);this.camera.lookAt(0,1.05,.65);}this.camera.updateProjectionMatrix();this.draw();}
 setView(view){this.view=view;this.positionCamera();}
 draw(){if(this.renderer)this.renderer.render(this.scene,this.camera);}
 async capture4K(){
  const gl=this.renderer.getContext(),limit=Math.min(gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),gl.getParameter(gl.MAX_TEXTURE_SIZE));
  if(limit<3840)throw new Error('This device cannot render a 4K image.');
  const previousRatio=this.renderer.getPixelRatio(),previousAspect=this.camera.aspect;
  const width=this.container.clientWidth||640,height=Math.max(260,width*.75);
  try{
   this.renderer.setPixelRatio(1);this.renderer.setSize(3840,2160,false);this.camera.aspect=3840/2160;this.camera.updateProjectionMatrix();this.draw();
   return await new Promise((resolve,reject)=>this.renderer.domElement.toBlob(blob=>blob?resolve(blob):reject(new Error('Image export failed on this device.')),'image/png'));
  }finally{
   this.renderer.setPixelRatio(previousRatio);this.renderer.setSize(width,height,false);this.camera.aspect=previousAspect;this.camera.updateProjectionMatrix();this.draw();
  }
 }
}
