import math, wave, json, subprocess
from pathlib import Path
import numpy as np

SR=48000; DUR=25.2; N=int(SR*DUR); BPM=124.0
beat=60/BPM; bar=beat*4
OUT=Path("assets"); OUT.mkdir(exist_ok=True)

def onepole(x, cutoff):
    a=math.exp(-2*math.pi*cutoff/SR); y=np.empty_like(x); p=0.0
    for i,v in enumerate(x):
        p=(1-a)*v+a*p; y[i]=p
    return y

def osc(freq,n,shape="sine",phase=0.0):
    t=np.arange(n)/SR
    if shape=="saw": return 2*((freq*t+phase/(2*math.pi))%1)-1
    if shape=="tri": return 2*np.abs(2*((freq*t+phase/(2*math.pi))%1)-1)-1
    return np.sin(2*math.pi*freq*t+phase)

def adsr(n,a=.008,d=.08,s=.66,r=.12):
    e=np.ones(n)*s; na=min(n,int(a*SR)); nd=min(n-na,int(d*SR)); nr=min(n,int(r*SR))
    if na:e[:na]=np.linspace(0,1,na,endpoint=False)
    if nd:e[na:na+nd]=np.linspace(1,s,nd,endpoint=False)
    if nr:e[-nr:]*=np.linspace(1,0,nr)
    return e

def pluck(f,dur=.42):
    n=max(1,int(dur*SR));t=np.arange(n)/SR
    s=osc(f,n)*.58+osc(f*2,n)*.22+osc(f*3,n)*.10+osc(f*4,n)*.04
    return s*np.exp(-t/.22)*(1-np.exp(-t/.006))

def bass(f,dur=.36):
    n=max(1,int(dur*SR));s=osc(f,n)*.75+osc(f*2,n,"tri")*.16+osc(f/2,n)*.16
    return onepole(s,520)*adsr(n,.005,.05,.72,.09)

def pad(f,dur):
    n=int(dur*SR);s=np.zeros(n)
    for cents,g in [(-10,.18),(0,.24),(10,.18),(-20,.08),(20,.08)]:
        ff=f*(2**(cents/1200));s+=osc(ff,n,"saw")*g
    return onepole(s,1700)*adsr(n,.28,.15,.74,.4)

def kick(seed):
    n=int(.26*SR);t=np.arange(n)/SR;f=138*np.exp(-t*28)+48;ph=2*np.pi*np.cumsum(f)/SR
    rng=np.random.default_rng(seed)
    return np.sin(ph)*np.exp(-t/.078)*.95+rng.normal(0,1,n)*np.exp(-t/.008)*.024

def clap(seed):
    n=int(.14*SR);t=np.arange(n)/SR;r=np.random.default_rng(seed)
    x=r.normal(0,1,n);x=x-onepole(x,1300);e=np.exp(-t/.034)+.45*np.exp(-np.maximum(0,t-.032)/.025)*(t>.032)
    return x*e*.18

def hat(seed,openhat=False):
    n=int((.18 if openhat else .055)*SR);t=np.arange(n)/SR;r=np.random.default_rng(seed)
    x=r.normal(0,1,n);x=x-onepole(x,6200)
    return x*np.exp(-t/(.09 if openhat else .017))*(.075 if openhat else .055)

def impact(seed):
    n=int(.75*SR);t=np.arange(n)/SR;r=np.random.default_rng(seed);f=86*np.exp(-t*5)+38;ph=2*np.pi*np.cumsum(f)/SR
    return np.sin(ph)*np.exp(-t/.22)*.64+r.normal(0,1,n)*np.exp(-t/.07)*.025

def riser(dur,seed):
    n=int(dur*SR);t=np.arange(n)/SR;r=np.random.default_rng(seed);x=r.normal(0,1,n);hp=x-onepole(x,3600);env=(t/dur)**2.1
    chirp=np.sin(2*np.pi*(220*t+720*t*t/(2*dur)))
    return (hp*.028+chirp*.035)*env

L=np.zeros(N);R=np.zeros(N);ML=np.zeros(N);MR=np.zeros(N);DL=np.zeros(N);DR=np.zeros(N)
def put(l,r,s,start,pan=0,g=.2):
    i=int(start*SR)
    if i>=N:return
    n=min(len(s),N-i);a=math.cos((pan+1)*math.pi/4);b=math.sin((pan+1)*math.pi/4)
    l[i:i+n]+=s[:n]*g*a;r[i:i+n]+=s[:n]*g*b

prog=[
 [130.81,164.81,196.00,246.94],
 [98.00,123.47,146.83,196.00],
 [110.00,130.81,164.81,196.00],
 [87.31,110.00,130.81,164.81]
]
roots=[65.41,49.00,55.00,43.65]
bars=int(math.ceil(DUR/bar))
for bi in range(bars):
    start=bi*bar;ch=prog[bi%4]
    pg=.11 if start<3.8 else (.17 if start<19.5 else .20)
    for j,f in enumerate(ch):put(ML,MR,pad(f,bar+.35),start,-.28+j*.18,pg)
    # syncopated arp
    order=[0,2,1,3,2,1,3,1]
    for k in range(8):
        st=start+k*(beat/2)
        if st>=DUR:break
        octave=2 if st>=7.6 else 1
        g=.10 if st<3.8 else (.14 if st<19.5 else .18)
        put(ML,MR,pluck(ch[order[k]]*octave,.34),st,-.35 if k%2==0 else .35,g)

# bass enters quickly after hook
for bi in range(bars):
    start=bi*bar
    if start<3.6: continue
    root=roots[bi%4]
    for off in [0,.72,1.45]:
        st=start+off
        if st>=DUR:continue
        g=.30 if not (15.0<st<16.6) else .13
        put(ML,MR,bass(root,.34),st,0,g)

kick_times=[]
for i,bt in enumerate(np.arange(0,DUR,beat)):
    if bt<1.45: continue
    kg=.54 if bt<3.8 else .78
    put(DL,DR,kick(100+i),bt,0,kg);kick_times.append(bt)
    if bt>=3.8 and i%2==1:put(DL,DR,clap(200+i),bt,0,.70)
    if bt>=3.8:
        put(DL,DR,hat(300+i),bt+beat/2,-.28 if i%2==0 else .28,.65)
        if i%4==3:put(DL,DR,hat(500+i,True),bt+beat/2,.38,.36)

# extra push in payoff
for st in [19.35,20.80,21.77,23.22]:
    put(DL,DR,kick(int(st*10)),st,0,.48);kick_times.append(st)

# scene transition effects approximately on scene changes
trans=[3.87,7.74,11.61,15.48,19.35,23.22]
for i,st in enumerate(trans):
    put(DL,DR,riser(.72,700+i),st-.72,0,.95)
    put(DL,DR,impact(800+i),st,0,.70 if i!=4 else .90)

# premium bright motif for final two scenes
motif=[523.25,659.25,783.99,659.25,587.33,659.25,783.99,1046.50]
for i,f in enumerate(motif):
    st=19.35+i*(beat/2)
    if st<DUR:put(ML,MR,pluck(f,.45),st,-.22 if i%2==0 else .22,.25)
for i,f in enumerate([659.25,783.99,1046.50,1318.51]):
    st=23.22+i*.42
    if st<DUR:put(ML,MR,pluck(f,.80),st,-.18+i*.12,.22)

# sidechain
duck=np.ones(N)
for kt in kick_times:
    s=int(kt*SR);ln=int(.17*SR);e=min(N,s+ln)
    if e>s:
        x=np.arange(e-s)/max(1,e-s-1);curve=.60+.40*(x**.62);duck[s:e]=np.minimum(duck[s:e],curve)
ML*=duck;MR*=duck

# short stereo delay
def delay(x,ms,g=.10):
    d=int(ms*SR/1000);y=x.copy()
    if d<len(x):y[d:]+=x[:-d]*g
    return y
ML=delay(ML,122,.10)+delay(MR,190,.04)
MR=delay(MR,137,.10)+delay(ML,205,.035)

L=ML+DL;R=MR+DR
st=np.stack([L,R],axis=1)
fade=np.ones(N);fade[:int(.14*SR)]=np.linspace(0,1,int(.14*SR));fade[-int(.55*SR):]=np.linspace(1,0,int(.55*SR));st*=fade[:,None]
st=np.tanh(st*1.16);st=st/(np.max(np.abs(st))+1e-9)*.90
pcm=(st*32767).astype(np.int16)
raw=OUT/"launch_score_raw.wav"
with wave.open(str(raw),"wb") as w:
    w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes(pcm.tobytes())
subprocess.run(["ffmpeg","-y","-loglevel","error","-i",str(raw),"-af","loudnorm=I=-14:TP=-1.0:LRA=6","-ar",str(SR),"-ac","2",str(OUT/"launch_score.wav")],check=True)
Path("music-meta.json").write_text(json.dumps({"source":"deterministic_original","bpm":BPM,"duration_sec":DUR,"direction":"bright premium SaaS launch, energetic and clean, no vocals","copyright":"original; no sampled reference audio"},indent=2),encoding="utf-8")
