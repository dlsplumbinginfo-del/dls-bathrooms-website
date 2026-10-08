import json
from pathlib import Path
from html import escape

root=Path(__file__).resolve().parents[1]
data=json.loads((root/'ideas/catalogue-data.json').read_text())
if len(data)!=50:raise SystemExit('This one-time expansion requires the original 50-room catalogue; already expanded.')
config=json.loads((root/'ideas/customiser-data.json').read_text())
# Concept footprints, never surveyed room measurements or fit guarantees.
briefs=[
 ('Pocket Stone','Cloakroom',18,1.2,1.8,'rectangle','half',False,'A tiny downstairs cloakroom with a compact green vanity and a tiled cistern ledge.'),
 ('Narrow Oak','Compact en suite',15,1.5,2.6,'rectangle','clean',False,'A narrow ensuite with shallow furniture, a rear shower and clean walls.'),
 ('Boxed-in Calm','Compact en suite',15,1.8,2.2,'rectangle','half',False,'A small ensuite with a half-height service wall and a useful continuous ledge.'),
 ('Clean Wall Compact','Compact en suite',15,1.8,2.2,'rectangle','clean',False,'A compact shower room without a full-width built-out wall or ledge.'),
 ('Little Family Bath','Bathroom',16,2.,2.4,'rectangle','clean','inset','A modest family bathroom with a straight shower-over-bath and compact furniture.'),
 ('L-shaped Retreat','Shower room',1,2.4,2.5,'L-shaped','half',False,'An L-shaped footprint with the shower tucked beside an existing projection.'),
 ('Long Room Ledge','Shower room',1,1.7,3.2,'rectangle','half',False,'A long narrow room with oak furniture and a slim tiled service ledge.'),
 ('Window Wall','Bathroom',16,2.1,2.5,'rectangle','clean','inset','A small family bathroom with a window, green feature tiles and a shower-over-bath.'),
 ('Slope & Stone','Compact en suite',15,2.,2.6,'loft','clean',False,'A loft ensuite with a lower ceiling zone and the shower in the taller part.'),
 ('Understairs Jewel','Cloakroom',18,.95,1.8,'loft','half',False,'A tiny understairs cloakroom with compact furniture and a half-tiled green palette.'),
 ('No-boxing White','Shower room',15,2.,2.4,'rectangle','clean',False,'A white shower room with a close-coupled WC and unbroken walls.'),
 ('Single-wall Services','Shower room',1,2.2,2.6,'rectangle','full',False,'A medium shower room with a full-height service wall and warm marble detail.'),
 ('Blush Pocket','Cloakroom',18,1.25,1.8,'rectangle','half',False,'A tiny cloakroom with blush tiles, green furniture and terrazzo.'),
 ('Recessed Shower','Shower room',15,2.1,2.7,'L-shaped','full',False,'A compact shower room with a recess, deep green feature tile and a clean niche.'),
 ('Stone Shelf Suite','Bathroom',16,2.5,2.8,'rectangle','ledge','inset','A medium family bathroom with a shower-over-bath and a slim stone ledge.'),
 ('Square & Simple','Compact en suite',15,2.,2.,'rectangle','clean',False,'A square ensuite with a corner shower, shallow vanity and simple pale tiles.'),
 ('Colour Corner','Bathroom',16,2.2,2.5,'rectangle','half','inset','A small family bathroom with a green feature wall and practical shower-over-bath.'),
 ('Hotel-scale Warmth','Bathroom',1,2.8,3.2,'rectangle','half','free','A medium bathroom with a bath, separate shower and warm oak and bronze detail.'),
 ('Compact Wetroom','Compact en suite',15,1.8,2.4,'rectangle','full',False,'A compact tiled wetroom direction with shallow furniture and pale terrazzo.'),
 ('Offset Door Ensuite','Compact en suite',15,2.1,2.4,'offset','half',False,'An ensuite direction for an offset entrance, with oak-effect tile and a WC ledge.'),
]
tile_choices=['tm-mylos','tm-dakaris','tm-baltico','c5851da6','e7a720cd','84b33a4f','tm-jaya','9f95cd40','aff4cfbd','9f95cd40','c5851da6','1df57186','8fe7b042','9f95cd40','tm-baltico','tm-marmo-grey','9f95cd40','84b33a4f','a424d7d8','tm-dakaris']
finishes=['Brushed Brass','Chrome','Brushed Bronze','Chrome','Chrome','Brushed Bronze','Brushed Bronze','Chrome','Matte Black','Brushed Brass','Chrome','Brushed Bronze','Brushed Brass','Matte Black','Brushed Bronze','Chrome','Brushed Brass','Brushed Bronze','Chrome','Brushed Bronze']
for room in data:
 room['layout']={'width':1.3 if room['room']=='Cloakroom' else 1.8 if room['room']=='Compact en suite' else 2.7 if room['room']=='Double basin' else 2.4,'depth':1.9 if room['room']=='Cloakroom' else 2.5 if room['room']=='Compact en suite' else 3.2 if room['room']=='Double basin' else 2.9,'shape':'rectangle','structure':'half','bath':'free' if any(p['category']=='Bath' for p in room['products']) else False,'status':'Concept footprint; dimensions are illustrative.'}
for index,(name,kind,base,w,d,shape,structure,bath,description) in enumerate(briefs):
 n=index+51;template=json.loads(json.dumps(data[base-1]));wall=next(t for t in config['tiles'] if t['id']==tile_choices[index]);floor=next(t for t in config['tiles'] if t['id']==('a424d7d8' if index in [6,12,18] else '84b33a4f'))
 template.update(n=n,id=f'DLS-{n:02d}',name=name,room=kind,description=description,image=f'images/layout-{n}.webp',thumbnail=f'images/layout-{n}.webp',curated=True,new=True,source_date='8 October 2026',metal=finishes[index],style='Colourful' if 'green' in wall['name'].lower() or 'pink' in wall['name'].lower() else 'Natural',variant_of=base,
  layout={'width':w,'depth':d,'shape':shape,'structure':structure,'bath':bath,'window':index==7,'status':'Concept footprint; final dimensions and clearances need a survey.'},
  customiser={'wall':wall['id'],'floor':floor['id'],'basin':'package-'+str(base),'finish':finishes[index],'structure':structure,'shape':shape,'toilet':'close' if structure=='clean' else 'wall','coverage':'half' if kind=='Cloakroom' else 'feature' if 'green' in wall['name'].lower() else 'all','niche':'without' if structure=='clean' or kind=='Cloakroom' else 'with','mirror':'LUNAR60','showerFloor':'wet' if index==18 else 'tray'})
 remove={'Feature / main wall tile','Floor tile','Other walls tile'}
 if kind=='Cloakroom':remove.update(['Shower kit','Shower screen','Screen profile pack','Shower tray','Shower waste','Niche','Niche lighting kit'])
 if structure=='clean':remove.update(['Toilet','Toilet seat','WC frame & cistern','Flush plate','Niche','Niche lighting kit'])
 if bath=='inset':remove.update(['Bath','Bath tap','Shower tray','Shower waste','Shower screen','Screen profile pack'])
 template['products']=[p for p in template['products'] if p['category'] not in remove]
 if structure=='clean':template['products'].append(dict(config['close_coupled']))
 if bath=='inset':
  template['products'].append({'category':'Bath','name':'Scudo straight single-ended bath direction','url':'https://thebathroomandtilecentre.co.uk/baths/straight-baths/scudo-round-single-ended-bath','brand':'Scudo','code':'','size':'Requested approximately 1700 x 700mm','quantity':1,'optional':False,'note':'Concept shape only. Exact model, dimensions, panel, waste and shower-over-bath suitability require supplier confirmation before a quote.'})
  template['products'].append({'category':'Bath screen','name':'Scudo Thalia single-panel bath screen direction','url':'https://www.scudo.co.uk/products/thalia-single-panel-bath-screen/','brand':'Scudo','code':'','size':'To confirm','quantity':1,'optional':False,'note':'Exact screen SKU, finish, bath compatibility and opening need confirmation.'})
 if bath=='free' and not any(p['category']=='Bath' for p in template['products']):template['products'].append(dict(next(p for p in config['bank'] if p['category']=='Bath')))
 for t,cat in [(wall,'Feature / main wall tile'),(floor,'Floor tile')]:template['products'].append({'category':cat,'name':t['name'],'brand':t['brand'],'url':t['url'],'code':'','size':t['size'],'quantity':'To measure','optional':False,'note':'Physical sample, measured quantity and suitability to confirm.'})
 # Each new room owns stable shortlist references; original references are untouched.
 for i,p in enumerate(template['products'],1):p.update(number=i,ref=f'{n}.{i}')
 template['tiles']=[{'role':'Feature / main wall','name':wall['name'],'url':wall['url']},{'role':'Floor','name':floor['name'],'url':floor['url']}]
 data.append(template)
(root/'ideas/catalogue-data.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
html=(root/'ideas/index.html').read_text()
cards=[]
for room in data[50:]:
 n=room['n']; name=escape(room['name']); desc=escape(room['description'])
 cards.append(f'<article class="look curated-concept" id="look-{n}" data-room="{room["room"]}" data-metal="{room["metal"]}" data-light="{room["light"]}"><div class="image-wrap"><a class="image-link" href="{room["image"]}" aria-label="Enlarge {name}"><img src="{room["thumbnail"]}" alt="Dimensional style model: {desc}" loading="lazy" width="768" height="576"><span class="look-id">{room["id"]}</span><span class="variation-badge">Room layout concept</span></a><button class="save-look" data-save-look="{n}" aria-pressed="false" aria-label="Save {name}" type="button"><span aria-hidden="true">♡</span> <span class="save-label">Save</span></button></div><div class="look-body"><div class="eyebrow">{room["room"]} / Concept {room["layout"]["width"]:g} × {room["layout"]["depth"]:g}m</div><h2>{name}</h2><p>{desc}</p><div class="card-actions"><a class="primary customise-link" href="/ideas/customise/?look={n}">Make this room yours</a><button class="quiet" data-share-look="{n}" type="button">Share look</button></div><details class="schedule variant-schedule" id="products-{n}"><summary>Products &amp; supplier links</summary><div class="product-panel"><p>Starting Scudo choices for a dimensional style model. Measurements, fitting details and any unconfirmed codes are checked before quotation.</p><a class="primary" href="/ideas/customise/?look={n}">Open choices &amp; product links</a></div></details></div></article>')
marker='</div><div class="swipe-controls">'
assert marker in html
html=html.replace(marker,''.join(cards)+marker,1)
for a,b in [('50 looks','70 looks'),('50 ideas','70 ideas'),('50-look','70-look'),('1 of 50','1 of 70')]:html=html.replace(a,b)
a='The AI room images are inspiration concepts, not photographs of supplied installations. All 30 newer looks are individually generated room concepts, so the full 70-look collection now has a separate room image for every design. Product proportions, tile patterns, grout, finish appearance and lighting can differ. Linked products and approved samples define the order.'
b='The original collection contains illustrated style concepts. The 20 new room directions use dimensional 3D models for small, narrow, loft and medium footprints. Every look opens a live 3D customiser. Furniture shapes and material textures are illustrative; linked supplier products and approved samples define your specification.'
html=html.replace(a,b)
(root/'ideas/index.html').write_text(html)
print('70 layouts, stable product references and catalogue cards written')
