import math,wave,subprocess,json
from pathlib import Path
import numpy as np
SR=48000;DUR=24.6;N=int(SR*DUR);BPM=118.0;beat=60/BPM;OUT=Path("assets");OUT.mkdir(exist_ok=True)
def lp(x,c):
 a=math.exp(-2*math.pi*c/SR);y=np.empty_like(x);p=0.0
 for i,v in enumerate(x):p=(1-a)*v+a*p;y[i]=p
 return y
def osc(f,n,s="sine"):
 t=np.arange(n)/SR
 if s=="saw":return 2*((f*t)%1)-1
 if s=="tri":return 2*np.abs(2*((f*t)%1)-1)-1
 return np.sin(2*np.pi*f*t)
def env(n,a=.01,d=.08,s=.65,r=.12):
 e=np.ones(n)*s;na=min(n,int(a*SR));nd=min(n-na,int(d*SR));nr=min(n,int(r*SR))
 if na:e[:na]=np.linspace(0,1,na,endpoint=False)
 if nd:e[na:na+nd]=np.linspace(1,s,nd,endpoint=False)
 if nr:e[-nr:]*=np.linspace(1,0,nr)
 return e
def mallet(f,d=.55):
 n=int(d*SR);t=np.arange(n)/SR
 return (osc(f,n)*.62+osc(f*2,n)*.20+osc(f*3,n)*.08)*np.exp(-t/.28)*(1-np.exp(-t/.008))
def bass(f,d=.36):
 n=int(d*SR);return lp(osc(f,n)*.78+osc(f*2,n,"tri")*.16,480)*env(n,.006,.05,.7,.09)
def pad(f,d):
 n=int(d*SR);return lp(osc(f,n,"saw")*.34+osc(f*.995,n,"saw")*.22+osc(f*1.005,n,"saw")*.22,1300)*env(n,.4,.2,.72,.5)
def thump(seed):
 n=int(.22*SR);t=np.arange(n)/SR;f=100*np.exp(-t*24)+45;ph=2*np.pi*np.cumsum(f)/SR;r=np.random.default_rng(seed)
 return np.sin(ph)*np.exp(-t/.07)*.72+r.normal(0,1,n)*np.exp(-t/.008)*.015
def click(seed):
 n=int(.055*SR);t=np.arange(n)/SR;r=np.random.default_rng(seed);x=r.normal(0,1,n);x=x-lp(x,5200);return x*np.exp(-t/.015)*.07
def snap(seed):
 n=int(.11*SR);t=np.arange(n)/SR;r=np.random.default_rng(seed);x=r.normal(0,1,n);x=x-lp(x,1800);return x*np.exp(-t/.026)*.12
def riser(d,seed):
 n=int(d*SR);t=np.arange(n)/SR;r=np.random.default_rng(seed);x=r.normal(0,1,n);x=x-lp(x,3600);return (x*.023+np.sin(2*np.pi*(180*t+610*t*t/(2*d)))*.028)*(t/d)**2
ML=np.zeros(N);MR=np.zeros(N);DL=np.zeros(N);DR=np.zeros(N)
def put(l,r,s,st,pan=0,g=.2):
 i=int(st*SR)
 if i>=N:return
 n=min(len(s),N-i);a=math.cos((pan+1)*math.pi/4);b=math.sin((pan+1)*math.pi/4)
 l[i:i+n]+=s[:n]*g*a;r[i:i+n]+=s[:n]*g*b

# harmonic bed: Em add9 / Cmaj7 / G6 / Dsus2
prog=[[82.41,98.0,123.47,164.81],[65.41,82.41,98.0,123.47],[98.0,123.47,146.83,164.81],[73.42,98.0,110.0,146.83]]
roots=[41.20,32.70,49.0,36.71];bar=beat*4
bars=int(DUR/bar)+2
for bi in range(bars):
 st=bi*bar;ch=prog[bi%4]
 for j,f in enumerate(ch):put(ML,MR,pad(f,bar+.4),st,-.3+j*.2,.12 if st<3 else .17)
 # sparse mallet motif, not constant arpeggio
 patt=[0,.75,1.5,2.25,3.0]
 for k,off in enumerate(patt):
  tt=st+off*beat
  if tt<DUR:put(ML,MR,mallet(ch[[0,2,1,3,2][k]]*(2 if tt>10 else 1),.46),tt,-.3 if k%2==0 else .3,.13 if tt<6 else .18)
 if st>=3:
  for off in [0,1.25,2.75]:
   tt=st+off*beat
   if tt<DUR:put(ML,MR,bass(roots[bi%4],.34),tt,0,.28)

# syncopated percussion: no four-on-floor
kicks=[]
pattern=[0,1.5,2.75]
for bi in range(bars):
 st=bi*bar
 for off in pattern:
  tt=st+off*beat
  if tt<1.0 or tt>=DUR:continue
  put(DL,DR,thump(100+bi*7+int(off*10)),tt,0,.72 if tt>3 else .48);kicks.append(tt)
 # snaps on displaced beats
 for off in [1.0,3.0]:
  tt=st+off*beat
  if tt>=3 and tt<DUR:put(DL,DR,snap(200+bi*9+int(off*10)),tt,.05,.48)
 # tiny clicks in 16ths
 for k in [1,3,5,7,10,13]:
  tt=st+k*(beat/4)
  if tt>=3 and tt<DUR:put(DL,DR,click(300+bi*20+k),tt,-.35 if k%2 else .35,.48)

# transition swells
for i,st in enumerate([3.0,6.8,11.8,15.9,20.4]):put(DL,DR,riser(.72,500+i),st-.72,0,.85)

# final glass motif
for i,f in enumerate([329.63,392,493.88,659.25,493.88,783.99]):
 tt=20.4+i*.42
 if tt<DUR:put(ML,MR,mallet(f,.7),tt,-.25+i*.1,.24)

# sidechain light
duck=np.ones(N)
for kt in kicks:
 s=int(kt*SR);e=min(N,s+int(.15*SR));x=np.arange(e-s)/max(1,e-s-1);duck[s:e]=np.minimum(duck[s:e],.68+.32*x**.7)
ML*=duck;MR*=duck
st=np.stack([ML+DL,MR+DR],1);fade=np.ones(N);fade[:int(.16*SR)]=np.linspace(0,1,int(.16*SR));fade[-int(.65*SR):]=np.linspace(1,0,int(.65*SR));st*=fade[:,None];st=np.tanh(st*1.15);st=st/(np.max(np.abs(st))+1e-9)*.90
pcm=(st*32767).astype(np.int16);raw=OUT/"score_raw.wav"
with wave.open(str(raw),"wb") as w:w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes(pcm.tobytes())
subprocess.run(["ffmpeg","-y","-loglevel","error","-i",str(raw),"-af","loudnorm=I=-14:TP=-1.0:LRA=7","-ar",str(SR),"-ac","2",str(OUT/"score.wav")],check=True)
Path("music-meta.json").write_text(json.dumps({"bpm":BPM,"duration":DUR,"direction":"minimal future-product groove; syncopated percussion, mallet motif, no four-on-floor","source":"original deterministic"},indent=2))
