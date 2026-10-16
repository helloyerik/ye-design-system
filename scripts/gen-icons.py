# Regenerate assets/icons: cd assets/icons && python3 ../../scripts/gen-icons.py (Pillow only)
import math,os
from PIL import Image, ImageDraw
def tri(cx,cy,w):
  h=w*math.sqrt(3)/2; return [(cx,cy-h/2),(cx+w/2,cy+h/2),(cx-w/2,cy+h/2)]
def png(size,frac,fg,bg,path,ss=8,round_=False):
  S=size*ss; im=Image.new('RGBA',(S,S),bg); d=ImageDraw.Draw(im)
  d.polygon(tri(S/2,S/2,S*frac),fill=fg)
  if round_:
    m=Image.new('L',(S,S),0); ImageDraw.Draw(m).ellipse((0,0,S-1,S-1),fill=255); im.putalpha(m)
  im=im.resize((size,size),Image.LANCZOS); im.save(path); return im
B,W=(0,0,0,255),(255,255,255,255)
def svgpts(n,frac): return ' '.join(f'{x:.2f},{y:.2f}' for x,y in tri(n/2,n/2,n*frac))
F=0.62; M=0.50
open('triangle.svg','w').write(f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><style>rect{{fill:#fff}}polygon{{fill:#000}}@media (prefers-color-scheme:dark){{rect{{fill:#000}}polygon{{fill:#fff}}}}</style><rect width="512" height="512" rx="96"/><polygon points="{svgpts(512,F)}"/></svg>\n''')
open('triangle-black-on-white.svg','w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="#fff"/><polygon points="{svgpts(512,F)}" fill="#000"/></svg>\n')
open('triangle-white-on-black.svg','w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="#000"/><polygon points="{svgpts(512,F)}" fill="#fff"/></svg>\n')
open('triangle-mark.svg','w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><polygon points="{svgpts(512,1.0)}" fill="currentColor"/></svg>\n')
icos=[png(s,F,B,W,f'/tmp/fav{s}.png') for s in (16,32,48)]
icos[2].save('favicon.ico',sizes=[(16,16),(32,32),(48,48)],append_images=icos[:2])
png(32,F,B,W,'favicon-32.png')
png(180,F,W,B,'apple-touch-icon.png')
png(192,F,W,B,'icon-192.png'); png(512,F,W,B,'icon-512.png')
png(192,M,W,B,'icon-maskable-192.png'); png(512,M,W,B,'icon-maskable-512.png')
# Android: adaptive (108dp canvas, safe 66dp circle) + legacy mipmaps
AF=0.42
for d,s in {'mdpi':48,'hdpi':72,'xhdpi':96,'xxhdpi':144,'xxxhdpi':192}.items():
  os.makedirs(f'android/mipmap-{d}',exist_ok=True)
  png(s,0.58,W,B,f'android/mipmap-{d}/ic_launcher.png')
  png(s,0.52,W,B,f'android/mipmap-{d}/ic_launcher_round.png',round_=True)
os.makedirs('android/drawable',exist_ok=True); os.makedirs('android/mipmap-anydpi-v26',exist_ok=True); os.makedirs('android/values',exist_ok=True)
pts=tri(54,54,108*AF)
path='M'+' L'.join(f'{x:.2f},{y:.2f}' for x,y in pts)+' Z'
open('android/drawable/ic_launcher_foreground.xml','w').write(f'''<?xml version="1.0" encoding="utf-8"?>
<!-- ye-design-system app icon: solid equilateral triangle (white) inside the 66dp safe zone of a 108dp adaptive canvas. -->
<vector xmlns:android="http://schemas.android.com/apk/res/android" android:width="108dp" android:height="108dp" android:viewportWidth="108" android:viewportHeight="108">
    <path android:fillColor="#FFFFFF" android:pathData="{path}"/>
</vector>
''')
open('android/drawable/ic_launcher_monochrome.xml','w').write(open('android/drawable/ic_launcher_foreground.xml').read())
open('android/values/ic_launcher_background.xml','w').write('<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#000000</color>\n</resources>\n')
for n in ['ic_launcher','ic_launcher_round']:
  open(f'android/mipmap-anydpi-v26/{n}.xml','w').write('<?xml version="1.0" encoding="utf-8"?>\n<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n    <background android:drawable="@color/ic_launcher_background"/>\n    <foreground android:drawable="@drawable/ic_launcher_foreground"/>\n    <monochrome android:drawable="@drawable/ic_launcher_monochrome"/>\n</adaptive-icon>\n')
# preview
pv=Image.new('RGB',(1040,300),(128,128,128))
items=[('favicon-32.png',96),('apple-touch-icon.png',180),('icon-512.png',180),('icon-maskable-512.png',180),('android/mipmap-xxxhdpi/ic_launcher_round.png',180)]
x=20
for f,s in items:
  im=Image.open(f).convert('RGBA').resize((s,s),Image.NEAREST if s==96 else Image.LANCZOS); pv.paste(im,(x,60),im); x+=s+20
# white-bg variant + dark
im=Image.new('RGBA',(180,180),(0,0,0,0)); png(180,F,W,B,'/tmp/d.png')
pv.save('preview.png')
