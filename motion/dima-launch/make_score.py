import numpy as np, wave, math, json
from pathlib import Path
SR=48000; DUR=21.6; N=int(SR*DUR); L=np.zeros(N); R=np.zeros(N)
def add(sig,start=0,pan=0,gain=1):
 s=int(start*SR);n=min(len(sig),N-s)
 if n<=0:return
 a=math.cos((pan+1)*math.pi/4);b=math.sin((pan+1)*math.pi/4);L[s:s+n]+=sig[:n]*gain*a;R[s:s+n]+=sig[:n]*gain*b
def kick(seed=0):
 dur=.32;n=int(dur*SR);tt=np.arange(n)/SR;f=58*np.exp(-tt*8)+42;phase=2*np.pi*np.cumsum(f)/SR;rng=np.random.default_rng(seed)
 return np.sin(phase)*np.exp(-tt/.10)*.62+rng.normal(0,1,n)*np.exp(-tt/.018)*.006
def click(seed=0):
 dur=.12;n=int(dur*SR);tt=np.arange(n)/SR;rng=np.random.default_rng(seed)
 return rng.normal(0,1,n)*np.exp(-tt/.025)*.07+np.sin(2*np.pi*2200*tt)*np.exp(-tt/.035)*.05
def pluck(freq,dur=.8):
 n=int(dur*SR);tt=np.arange(n)/SR;sig=np.sin(2*np.pi*freq*tt)+.4*np.sin(4*np.pi*freq*tt)+.16*np.sin(6*np.pi*freq*tt)
 return sig*np.exp(-tt/.28)*(1-np.exp(-tt/.008))*.28
def impact(seed=1):
 dur=1.2;n=int(dur*SR);tt=np.arange(n)/SR;rng=np.random.default_rng(seed)
 return np.sin(2*np.pi*(52-18*tt)*tt)*np.exp(-tt/.45)*.42+rng.normal(0,1,n)*np.exp(-tt/.18)*.04+np.sin(2*np.pi*740*tt)*np.exp(-tt/.22)*.04
def riser(dur=.75,seed=2):
 n=int(dur*SR);tt=np.arange(n)/SR;rng=np.random.default_rng(seed);env=(tt/dur)**2
 return rng.normal(0,1,n)*env*.014+np.sin(2*np.pi*(180+520*(tt/dur)**2)*tt)*env*.03
bar=2.4
chords=[(73.42,110,146.83),(58.27,87.31,116.54),(87.31,130.81,174.61),(65.41,98,130.81),(73.42,110,146.83),(58.27,87.31,116.54),(87.31,130.81,174.61),(65.41,98,130.81),(73.42,110,146.83)]
for i,ch in enumerate(chords):
 dur=bar+.35;n=int(dur*SR);tt=np.arange(n)/SR;fade=np.minimum(1,tt/.55)*np.minimum(1,(dur-tt)/.55);sig=np.zeros(n)
 for k,f in enumerate(ch):sig+=np.sin(2*np.pi*f*tt+.17*k)*[.16,.11,.07][k]+np.sin(2*np.pi*f*2*tt+.1*k)*.022
 add(sig*fade,i*bar,-.12 if i%2==0 else .12,.72)
beat=.6
for bi,bt in enumerate(np.arange(0,DUR,beat)):
 if bi%4==0:add(kick(bi),bt,0,.85)
 if bi%2==1:add(click(bi),bt,-.35 if bi%4==1 else .35,.7)
 n=int(.33*SR);tt=np.arange(n)/SR;add(np.sin(2*np.pi*55*tt)*np.exp(-tt/.18)*.18,bt,0,.46 if bi%4 else .7)
for i,(a,f) in enumerate(zip([1.2,3.6,6.0,8.4,11.4,13.8,16.2,19.2],[293.66,349.23,440,392,293.66,523.25,440,349.23])):add(pluck(f),a,-.25 if i%2==0 else .25,.72)
for i,a in enumerate([2.4,4.8,7.2,10.8,14.4,18.0]):add(impact(10+i),a,0,.62 if a!=10.8 else .82);add(riser(.75,30+i),a-.75,0,.8)
for f,pan in [(1174.66,-.3),(1396.91,.3),(1760,0)]:add(pluck(f,1.8)*.55,18.25,pan,.7)
st=np.stack([L,R],axis=1);fade=np.ones(N);fade[:int(.25*SR)]=np.linspace(0,1,int(.25*SR));fade[-int(.8*SR):]=np.linspace(1,0,int(.8*SR));st*=fade[:,None];st=np.tanh(st*1.35);st=st/(np.max(np.abs(st))+1e-9)*.92;pcm=(st*32767).astype(np.int16)
Path('assets').mkdir(exist_ok=True)
with wave.open('assets/launch_score.wav','wb') as w:w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes(pcm.tobytes())
Path('audiomap.json').write_text(json.dumps({'version':1,'audio':{'path':'assets/launch_score.wav','duration_sec':DUR,'sr':SR},'tempo':{'bpm':100,'beats_per_bar':4},'grid':{'beats_sec':[round(float(x),3) for x in np.arange(0,DUR,beat)],'downbeats_sec':[round(float(x),3) for x in np.arange(0,DUR,bar)]},'key_moments':[{'t':x,'kind':'SCENE'} for x in [2.4,4.8,7.2,10.8,14.4,18.0]],'design':'original procedural cinematic launch score; no sampled music'},indent=2),encoding='utf-8')
