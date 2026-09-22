import math,wave,subprocess,json
from pathlib import Path
import numpy as np
SR=48000;DUR=22.4;N=int(SR*DUR);BPM=126;beat=60/BPM;OUT=Path("assets");OUT.mkdir(exist_ok=True)
def lp(x,c):
    a=math.exp(-2*math.pi*c/SR);y=np.empty_like(x);p=0.0
    for i,v in enumerate(x):
        p=(1-a)*v+a*p;y[i]=p
    return y
def osc(f,n,s="sine"):
    t=np.arange(n)/SR
    if s=="saw": return 2*((f*t)%1)-1
    if s=="tri": return 2*np.abs(2*((f*t)%1)-1)-1
    return np.sin(2*np.pi*f*t)
def env(n,a=.008,d=.06,s=.7,r=.1):
    e=np.ones(n)*s;na=min(n,int(a*SR));nd=min(n-na,int(d*SR));nr=min(n,int(r*SR))
    if na:e[:na]=np.linspace(0,1,na,endpoint=False)
    if nd:e[na:na+nd]=np.linspace(1,s,nd,endpoint=False)
    if nr:e[-nr:]*=np.linspace(1,0,nr)
    return e
def note(f,d=.4,kind="pluck"):
    n=max(1,int(d*SR));t=np.arange(n)/SR
    if kind=="bass": return lp(osc(f,n)*.76+osc(f*2,n,"tri")*.18,560)*env(n,.005,.05,.7,.08)
    if kind=="pad": return lp(osc(f,n,"saw")*.4+osc(f*.997,n,"saw")*.25+osc(f*1.004,n,"saw")*.25,1500)*env(n,.3,.2,.72,.45)
    return (osc(f,n)*.58+osc(f*2,n)*.24+osc(f*3,n)*.08)*np.exp(-t/.22)*(1-np.exp(-t/.006))
def kick(seed):
    n=int(.25*SR);t=np.arange(n)/SR;f=145*np.exp(-t*30)+48;ph=2*np.pi*np.cumsum(f)/SR;r=np.random.default_rng(seed)
    return np.sin(ph)*np.exp(-t/.075)*.95+r.normal(0,1,n)*np.exp(-t/.007)*.025
def clap(seed):
    n=int(.13*SR);t=np.arange(n)/SR;r=np.random.default_rng(seed);x=r.normal(0,1,n);x=x-lp(x,1500)
    return x*(np.exp(-t/.03)+.4*np.exp(-np.maximum(0,t-.03)/.02)*(t>.03))*.17
def hat(seed):
    n=int(.055*SR);t=np.arange(n)/SR;r=np.random.default_rng(seed);x=r.normal(0,1,n);x=x-lp(x,6500)
    return x*np.exp(-t/.016)*.06
def riser(d,seed):
    n=int(d*SR);t=np.arange(n)/SR;r=np.random.default_rng(seed);x=r.normal(0,1,n);x=x-lp(x,3800)
    return (x*.025+np.sin(2*np.pi*(240*t+800*t*t/(2*d)))*.035)*(t/d)**2
L=np.zeros(N);R=np.zeros(N);ML=np.zeros(N);MR=np.zeros(N);DL=np.zeros(N);DR=np.zeros(N)
def put(l,r,s,st,pan=0,g=.2):
    i=int(st*SR)
    if i>=N:return
    n=min(len(s),N-i);a=math.cos((pan+1)*math.pi/4);b=math.sin((pan+1)*math.pi/4)
    l[i:i+n]+=s[:n]*g*a;r[i:i+n]+=s[:n]*g*b
prog=[[130.81,164.81,196,246.94],[98,123.47,146.83,196],[110,130.81,164.81,196],[87.31,110,130.81,164.81]]
roots=[65.41,49,55,43.65];bar=beat*4
for bi in range(int(DUR/bar)+1):
    st=bi*bar;ch=prog[bi%4]
    for j,f in enumerate(ch):put(ML,MR,note(f,bar+.35,"pad"),st,-.3+j*.2,.13 if st<3 else .18)
    order=[0,2,1,3,2,1,3,1]
    for k in range(8):
        tt=st+k*beat/2
        if tt>=DUR:break
        put(ML,MR,note(ch[order[k]]*(2 if tt>6 else 1),.32),tt,-.35 if k%2==0 else .35,.11 if tt<3 else .16)
    if st>=3:
        for off in [0,.7,1.42]:put(ML,MR,note(roots[bi%4],.33,"bass"),st+off,0,.31)
kicks=[]
for i,bt in enumerate(np.arange(0,DUR,beat)):
    if bt<1.2:continue
    put(DL,DR,kick(100+i),bt,0,.78 if bt>3 else .55);kicks.append(bt)
    if bt>3 and i%2:put(DL,DR,clap(200+i),bt,0,.72)
    if bt>3:put(DL,DR,hat(300+i),bt+beat/2,-.25 if i%2==0 else .25,.72)
for n,st in enumerate([3.2,6.4,10.4,14.6,18.6]):
    put(DL,DR,riser(.68,500+n),st-.68,0,.9)
duck=np.ones(N)
for kt in kicks:
    s=int(kt*SR);e=min(N,s+int(.16*SR));x=np.arange(e-s)/max(1,e-s-1);duck[s:e]=np.minimum(duck[s:e],.58+.42*x**.62)
ML*=duck;MR*=duck
st=np.stack([ML+DL,MR+DR],1);fade=np.ones(N);fade[:int(.12*SR)]=np.linspace(0,1,int(.12*SR));fade[-int(.5*SR):]=np.linspace(1,0,int(.5*SR));st*=fade[:,None];st=np.tanh(st*1.18);st=st/(np.max(np.abs(st))+1e-9)*.9
pcm=(st*32767).astype(np.int16);raw=OUT/"score_raw.wav"
with wave.open(str(raw),"wb") as w:w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes(pcm.tobytes())
subprocess.run(["ffmpeg","-y","-loglevel","error","-i",str(raw),"-af","loudnorm=I=-14:TP=-1.0:LRA=6","-ar",str(SR),"-ac","2",str(OUT/"score.wav")],check=True)
Path("music-meta.json").write_text(json.dumps({"bpm":BPM,"duration":DUR,"direction":"bright premium SaaS launch, faster and punchier","source":"original deterministic"},indent=2))
