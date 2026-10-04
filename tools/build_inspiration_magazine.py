import json,io,html,shutil
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from reportlab.lib.utils import ImageReader
from PIL import Image
ROOT=Path(__file__).resolve().parent.parent
DS=json.loads((ROOT/'inspiration-data.json').read_text())
OUT=ROOT/'inspiration-magazine.pdf'
pdfmetrics.registerFont(TTFont('Sans','/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('SansBold','/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'))
pdfmetrics.registerFont(TTFont('Serif','/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf'))
pdfmetrics.registerFontFamily('Sans',normal='Sans',bold='SansBold')
W,H=841.89,595.28;PAPER='#F6F3EC';INK='#242820';MUTED='#61675C';ACC='#A3522D'
c=canvas.Canvas(str(OUT),pagesize=(W,H));c.setTitle('DLS Bathroom Inspiration - 20 Looks');c.setAuthor('DLS Bathrooms Ltd')
styles={k:ParagraphStyle(k,fontName='Sans',fontSize=s,leading=l,textColor=HexColor(INK)) for k,s,l in [('body',9,13.5),('small',7.2,10.2),('title',25,29),('large',13,19)]};styles['title'].fontName='Serif'
def para(t,x,y,w,style='body'):
 p=Paragraph(t,styles[style]);_,h=p.wrap(w,900);p.drawOn(c,x,y-h);return y-h
def text(t,x,y,size=9,font='Sans',colour=INK):
 c.setFillColor(HexColor(colour));c.setFont(font,size);c.drawString(x,y,t)
def pic(d,x,y,w,h,small=False):
 im=Image.open(ROOT/d['image'].lstrip('/')).convert('RGB');b=io.BytesIO();im.save(b,'JPEG',quality=90,optimize=True);b.seek(0);c.drawImage(ImageReader(b),x,y,w,h)
def link(name,url):return '<link href="'+html.escape(url,quote=True)+'" color="'+ACC+'"><u>'+html.escape(name)+'</u></link>'
def start(page,section):
 c.setFillColor(HexColor(PAPER));c.rect(0,0,W,H,fill=1,stroke=0)
 text('DLS BATHROOMS',28,H-28,10,'SansBold');text(section,575,H-28,8,colour=MUTED)
 c.setStrokeColor(HexColor('#D5D7CC'));c.line(28,H-40,W-28,H-40)
 text('AI-GENERATED DESIGN CONCEPTS  |  OCTOBER 2026',28,20,7,colour=MUTED);text(str(page).zfill(2),W-42,20,8,colour=MUTED)
def field(label,content,x,y,w=228):
 text(label.upper(),x,y,7,'SansBold',ACC);return para(content,x,y-7,w)-16
start(1,'THE INSPIRATION COLLECTION')
pic(DS[11],28,113,526,350.67)
text('DLS-12 / FLOATING OAK',28,98,8,'SansBold',ACC)
x=582;y=509
text('20 LOOKS',x,y,11,'SansBold',ACC)
y=para('A bathroom<br/>that feels<br/>like you.',x,y-18,228,'title')-23
y=para('Materials, colour and light.<br/>Curated by DLS Bathrooms.',x,y,228,'large')-24
y=para('Choose your favourite look, mix the details you like, and ask us to adapt the style to your room.',x,y,228)-22
y=para(link('Explore the collection online','https://dlsbathrooms.co.uk/inspiration'),x,y,228)-17
y=para(link('Plan your bathroom','https://dlsbathrooms.co.uk/quote'),x,y,228)-18
para('Stockport &amp; Manchester<br/>07539 037841<br/>info@dlsbathrooms.co.uk',x,y,228,'small')
para('All images are AI-generated concepts, not completed DLS installations or exact product photographs. Your room, product samples, confirmed specifications and quotation determine the final design. Tiles and niche lighting are sourced separately from the sanitary fittings.',28,77,W-56,'small');c.showPage()
start(2,'FIND YOUR FAVOURITE');text('The twenty looks',28,H-78,25,'Serif')
for i,d in enumerate(DS):
 col=i%5;row=i//5;x=28+col*159;y=H-110-row*109
 pic(d,x,y-81,147,98)
 text(f"{d['n']:02d}  {d['name']}",x,y-94,7.2,'SansBold')
 c.linkURL('https://dlsbathrooms.co.uk/inspiration#look-'+str(d['n']).zfill(2),(x,y-100,x+147,y+17),relative=0)
c.showPage()
for d in DS:
 start(d['n']+2,d['id']+' / '+d['room'].upper())
 text(f"{d['n']:02d}",28,H-84,25,'Serif',ACC)
 text(d['name'],75,H-84,27,'Serif')
 text(d['style'].upper()+'  /  '+d['metal'].upper(),28,H-104,8,'SansBold',MUTED)
 pic(d,28,105,526,350.67)
 text('AI-GENERATED DESIGN CONCEPT',28,91,7,'SansBold',ACC)
 para(d['description'],28,76,526,'body')
 x=582;y=460
 y=field('Furniture direction',html.escape(d['furniture']),x,y)
 y=field('Tiles / Mandarin Stone','<br/>'.join(html.escape(t['role'])+': '+link(t['name'],t['url']) for t in d['tiles']),x,y)
 y=field('Lighting direction',f"{d['kelvin']}K {d['light'].lower()}. Niche and ceiling lighting are separately specified. Mirror settings vary.",x,y)
 text('APPROXIMATE DIGITAL PALETTE',x,y,7,'SansBold',ACC);y-=24
 for i,colour in enumerate(d['palette']):
  xx=x+i*75;c.setFillColor(HexColor(colour));c.rect(xx,y,66,15,fill=1,stroke=0);text(colour,xx,y-12,6.5,colour=MUTED)
 y-=30;y=para('Palette values are visual references, not manufacturer finish codes.',x,y,228,'small')-17
 y=para(link('Ask about '+d['id'],'https://dlsbathrooms.co.uk/quote?looks='+str(d['n'])),x,y,228)-13
 y=para('Confirm final products, sizes, tile pattern, samples, stock and price with your quotation. These images cannot guarantee exact product appearance.',x,y,228,'small')
 assert y>45,(d['n'],y)
 c.showPage()
c.save();print(OUT,OUT.stat().st_size,'bytes')
if Path('/mnt/data').exists():
 target=Path('/mnt/data/DLS_Bathroom_Inspiration_20_Looks.pdf');shutil.copy2(OUT,target);print(target)
