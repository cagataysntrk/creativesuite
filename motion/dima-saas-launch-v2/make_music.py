import os, math, wave, json, subprocess, urllib.request
from pathlib import Path
import numpy as np

SR=48000
DUR=28.0
N=int(SR*DUR)
OUT=Path("assets")
OUT.mkdir(exist_ok=True)

def try_elevenlabs():
    key=os.getenv("ELEVENLABS_API_KEY","").strip()
    if not key:
        return False
    prompt=(
      "Instrumental premium SaaS product launch music, 28 seconds, modern upbeat electronic pop, "
      "around 120 BPM, clean punchy kick and clap, crisp hi-hats, warm syncopated synth bass, "
      "bright glassy pluck motif, airy premium pads, tasteful risers and impacts, optimistic and confident, "
      "high-end technology commercial, polished and minimal rather than aggressive. "
      "Structure: 0-4s restrained hook, 4-8s groove enters, 8-12s brighter lift, 12-16s product-demo drive, "
      "16-20s brief tension/build, 20-24s energetic payoff, 24-28s clean branded resolve. "
      "No vocals, no spoken words, no cinematic trailer braams, no dark ambient drone."
    )
    payload=json.dumps({"prompt":prompt,"music_length_ms":28000,"force_instrumental":True,"model_id":"music_v1"}).encode()
    req=urllib.request.Request("https://api.elevenlabs.io/v1/music",data=payload,method="POST",headers={"xi-api-key":key,"Content-Type":"application/json"})
    try:
        with urllib.request.urlopen(req,timeout=90) as r:
            data=r.read()
        if len(data)<20000:
            return False
        (OUT/"music_source.mp3").write_bytes(data)
        subprocess.run(["ffmpeg","-y","-loglevel","error","-i",str(OUT/"music_source.mp3"),"-ar",str(SR),"-ac","2",str(OUT/"launch_score_raw.wav")],check=True)
        return True
    except Exception as e:
        print("[music] ElevenLabs unavailable, using deterministic fallback:",e)
        return False

def onepole(x, cutoff):
    a=math.exp(-2*math.pi*cutoff/SR)
    y=np.empty_like(x)
    prev=0.0
    for i,v in enumerate(x):
        prev=(1-a)*v+a*prev
        y[i]=prev
    return y

def env_adsr(n,attack=.01,decay=.08,sustain=.65,release=.2):
    e=np.ones(n)*sustain
    a=min(n,int(attack*SR)); d=min(n-a,int(decay*SR)); r=min(n,int(release*SR))
    if a>0:e[:a]=np.linspace(0,1,a,endpoint=False)
    if d>0:e[a:a+d]=np.linspace(1,sustain,d,endpoint=False)
    if r>0:e[-r:]*=np.linspace(1,0,r)
    return e

def osc(freq,n,kind="sine",detune=0.0):
    t=np.arange(n)/SR
    f=freq*(2**(detune/1200))
    if kind=="sine": return np.sin(2*np.pi*f*t)
    if kind=="tri": return 2*np.abs(2*((f*t)%1)-1)-1
    if kind=="saw":
        return 2*((f*t)%1)-1
    return np.sin(2*np.pi*f*t)

def synth_note(freq,dur,kind="pluck"):
    n=max(1,int(dur*SR)); t=np.arange(n)/SR
    if kind=="pluck":
        s=(osc(freq,n,"sine")*.62+osc(freq*2,n,"sine")*.22+osc(freq*3,n,"sine")*.09+osc(freq*4,n,"sine")*.04)
        e=np.exp(-t/0.34)*(1-np.exp(-t/.008))
        return s*e
    if kind=="bass":
        s=osc(freq,n,"sine")*.78+osc(freq*2,n,"tri")*.18+osc(freq/2,n,"sine")*.15
        return onepole(s,420)*env_adsr(n,.008,.08,.72,.11)
    if kind=="pad":
        s=np.zeros(n)
        for cents,g in [(-9,.20),(0,.28),(9,.20),(-17,.10),(17,.10)]:
            s+=osc(freq,n,"saw",cents)*g
        return onepole(s,1400)*env_adsr(n,.35,.2,.74,.5)
    return osc(freq,n,"sine")*env_adsr(n)

def kick():
    dur=.28;n=int(dur*SR);t=np.arange(n)/SR
    f=130*np.exp(-t*26)+47
    ph=2*np.pi*np.cumsum(f)/SR
    body=np.sin(ph)*np.exp(-t/0.085)
    click=np.random.default_rng(1).normal(0,1,n)*np.exp(-t/.009)
    return body*.93+click*.035

def clap(seed):
    dur=.16;n=int(dur*SR);t=np.arange(n)/SR;r=np.random.default_rng(seed)
    noise=r.normal(0,1,n)
    noise=noise-onepole(noise,900)
    env=(np.exp(-t/.035)+.55*np.exp(-np.maximum(0,t-.025)/.028)*(t>.025)+.35*np.exp(-np.maximum(0,t-.052)/.024)*(t>.052))
    return noise*env*.22

def hat(seed,openhat=False):
    dur=.22 if openhat else .075;n=int(dur*SR);t=np.arange(n)/SR;r=np.random.default_rng(seed)
    noise=r.normal(0,1,n); hp=noise-onepole(noise,5000)
    return hp*np.exp(-t/(.11 if openhat else .021))*(.11 if openhat else .075)

def riser(dur,seed):
    n=int(dur*SR);t=np.arange(n)/SR;r=np.random.default_rng(seed)
    noise=r.normal(0,1,n); hp=noise-onepole(noise,3500)
    tone=np.sin(2*np.pi*(280*t+520*(t*t/dur)))
    e=(t/dur)**2.2
    return (hp*.035+tone*.04)*e

def impact(seed):
    n=int(.9*SR);t=np.arange(n)/SR;r=np.random.default_rng(seed)
    f=72*np.exp(-t*4)+38;ph=2*np.pi*np.cumsum(f)/SR
    return np.sin(ph)*np.exp(-t/.30)*.7 + r.normal(0,1,n)*np.exp(-t/.08)*.028

L=np.zeros(N);R=np.zeros(N)
musicL=np.zeros(N);musicR=np.zeros(N)
drumL=np.zeros(N);drumR=np.zeros(N)

def put(busL,busR,sig,start,pan=0,gain=1):
    s=int(start*SR)
    if s>=N:return
    n=min(len(sig),N-s)
    a=math.cos((pan+1)*math.pi/4);b=math.sin((pan+1)*math.pi/4)
    busL[s:s+n]+=sig[:n]*gain*a;busR[s:s+n]+=sig[:n]*gain*b

BPM=120
beat=60/BPM
bar=beat*4

# C major / A minor color, premium and optimistic.
prog=[
  [130.81,164.81,196.00,246.94], # Cmaj7
  [98.00,123.47,146.83,196.00],  # G(add4-ish)
  [110.00,130.81,164.81,196.00], # Am7
  [87.31,110.00,130.81,164.81],  # Fmaj7
]

# Pads, section-aware.
for bi,start in enumerate(np.arange(0,DUR,bar)):
    chord=prog[bi%4]
    section=int(start//4)
    pad_gain=.12 if section==0 else (.19 if section in [1,2,3] else .15)
    for j,f in enumerate(chord):
        put(musicL,musicR,synth_note(f,bar+.55,"pad"),start,pan=(-.32+.21*j),gain=pad_gain)

# Pluck ostinato; brighter after 8s.
arp_offsets=[0,2,1,3,2,1,3,1]
for bi,start in enumerate(np.arange(0,DUR,bar)):
    chord=prog[bi%4]
    section=int(start//4)
    if section==0 and bi%2==1: continue
    for k in range(8):
        st=start+k*(beat/2)
        if st>=DUR: break
        f=chord[arp_offsets[k%len(arp_offsets)]]*(2 if section>=2 else 1)
        g=.11 if section==0 else (.16 if section<5 else .20)
        put(musicL,musicR,synth_note(f,.42,"pluck"),st,pan=(-.38 if k%2==0 else .38),gain=g)

# Bass enters at 4s, brief pullback around 16-18, then returns.
root=[65.41,49.00,55.00,43.65]
for bi,start in enumerate(np.arange(4,DUR,bar)):
    idx=int(start/bar)%4
    for q,off in enumerate([0,.75,1.5]):
        st=start+off
        if 16<=st<18: g=.12
        else: g=.34 if st<24 else .26
        put(musicL,musicR,synth_note(root[idx],.42,"bass"),st,0,g)

# Drums: clean four-on-the-floor with syncopation.
kick_times=[]
for i,bt in enumerate(np.arange(0,DUR,beat)):
    sec=bt//4
    if bt<2: continue
    # sections 0 intro is sparse; 4s onward full.
    if bt<4 and i%2: continue
    kg=.64 if bt<4 else .78
    put(drumL,drumR,kick(),bt,0,kg); kick_times.append(bt)
    if i%2==1 and bt>=4: put(drumL,drumR,clap(i),bt,0,.72)
    # 8th hats.
    if bt>=4:
        put(drumL,drumR,hat(i*7),bt+.25,-.25 if i%2==0 else .25,.62)
        if i%4==3: put(drumL,drumR,hat(i*11,True),bt+.25,.38,.42)

# Extra syncopated kick in energetic parts.
for st in [8.75,10.75,12.75,14.75,20.75,22.75]:
    put(drumL,drumR,kick(),st,0,.48); kick_times.append(st)

# Section transitions.
for n,st in enumerate([4,8,12,16,20,24]):
    put(drumL,drumR,riser(.75,100+n),st-.75,0,.90)
    put(drumL,drumR,impact(200+n),st,0,.72 if st!=20 else .88)

# Bright payoff motif at 20s and clean resolve at 24.
motif=[523.25,659.25,783.99,659.25,587.33,659.25,783.99,1046.5]
for i,f in enumerate(motif):
    put(musicL,musicR,synth_note(f,.55,"pluck"),20+i*.5,-.18 if i%2==0 else .18,.28)
for i,f in enumerate([523.25,659.25,783.99,1046.5]):
    put(musicL,musicR,synth_note(f,1.1,"pluck"),24+i*.55,-.20+i*.13,.22)

# Sidechain music bus around kicks for clean product-launch pulse.
duck=np.ones(N)
for kt in kick_times:
    s=int(kt*SR);length=int(.20*SR)
    end=min(N,s+length)
    if end>s:
        x=np.arange(end-s)/(max(1,end-s-1))
        curve=.56+.44*(x**.65)
        duck[s:end]=np.minimum(duck[s:end],curve)
musicL*=duck;musicR*=duck

# Stereo ambience / short feedback delays.
def delay_mix(x,ms,feedback=.16):
    d=int(ms*SR/1000);y=x.copy()
    if d<len(x):y[d:]+=x[:-d]*feedback
    if 2*d<len(x):y[2*d:]+=x[:-2*d]*(feedback*.55)
    return y
musicL=delay_mix(musicL,130,.13)+delay_mix(musicR,210,.055)
musicR=delay_mix(musicR,145,.13)+delay_mix(musicL,225,.045)

L=musicL+drumL;R=musicR+drumR
# Gentle saturation and mastering.
st=np.stack([L,R],axis=1)
fade=np.ones(N);fade[:int(.18*SR)]=np.linspace(0,1,int(.18*SR));fade[-int(.7*SR):]=np.linspace(1,0,int(.7*SR))
st*=fade[:,None]
st=np.tanh(st*1.18)
peak=np.max(np.abs(st))+1e-9
st=st/peak*.91
pcm=(st*32767).astype(np.int16)
with wave.open(str(OUT/"launch_score_raw.wav"),"wb") as w:
    w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes(pcm.tobytes())

def main():
    source="deterministic_fallback"
    if try_elevenlabs():
        source="elevenlabs_music_v1"
    # Normalize whichever source was produced.
    raw=OUT/"launch_score_raw.wav"
    subprocess.run(["ffmpeg","-y","-loglevel","error","-i",str(raw),"-af","loudnorm=I=-14:TP=-1.0:LRA=7","-ar",str(SR),"-ac","2",str(OUT/"launch_score.wav")],check=True)
    Path("music-meta.json").write_text(json.dumps({
      "source":source,"duration_sec":DUR,"target_bpm":BPM,
      "brief":"original premium modern SaaS product launch; upbeat electronic; no vocals",
      "copyright":"original/generated for this project; no sampled reference audio"
    },indent=2),encoding="utf-8")

if __name__=="__main__":
    main()
