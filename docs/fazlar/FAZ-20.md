# FAZ 20 — VİDEO ATÖLYESİ

> KAPSAM: kendine-yeten
> **Bağlam sıfırlandıysa: bu dosya + `docs/referans/video-hatti-arastirma.md` yeter.**
> Video işi karosel hattından **bağımsız** ilerler; FAZ-19'u beklemez, engellemez.
> ⚠ Bu bir HAT değil ATÖLYE. Neden — §3.

---

## 0 · DEPO SAHİBİNİN TALEBİ — bağlam sıfırlansa da bu kalır

Sahibin kendi cümleleri. Yorum değil, alıntı.

- *"Üretimde ikinci dev bir pipeline oluşturacağız, bu video üretim pipeline'ı olacak,
  hyperframes kullanacağız."*
- *"Müzik için de açık kaynak vs ne varsa mükemmelce kullanacağız, ses efektleri de öyle."*
- *"Yerelde çalışan AI modelleri ya da ücretsiz AI modelleri varsa Cloudflare'de onları
  da kullanabiliriz."*
- *"Karoseller gibi üst düzey hem yatay hem dikey motion videolar ortaya çıkaracağız,
  gerektiğinde görsel oluşturacaksın, gerektiğinde ürün görseli vereceğim."*
- *"Firma ve genel olacak konular."* → karoseldeki `firma`/`genel` kipinin aynısı.
- *"Sanırım şablonlarla olmaz video üretimi, yoksa her şey birbirinin aynısı olur; daha
  esnek ama estetik olmasını sağlayacak bir pipeline gerekli olabilir."*
- *"Bunu geliştirirken diğer pipeline asla zarar görmemeli, tamamen bağımsız izole olmalı."*
- *"Üret sayfasında 2 seçenek olacak: 1 karosel, 1 de video. Videoya tıklayınca orada
  video dikey yatay ölçek vs seçilecek."*
- *"Hem şirketin yazılımlarını tanıtacak videolar hem de genel içerikler üreteceğiz."*
- *"Gerçekten etkileyici tasarım geçiş efekt ses müzik video içeriği olmalı, MÜKEMMEL
  OLMALIYIZ."*
- *"Ticari ürün değiliz, her şeyi kullanabiliriz, kendimize üretim yaptıracağız, rahat ol."*
- *"AGPL bizi bağlamaz… repoyu public etmiyoruz."*
- *"Open source'lardan müthiş faydalanmak lazım, kod yazmak kontrol etmek zor iş."*
- *"Kodları gerekli yerleri birebir alalım, bize uygun şekilde; kafamıza göre olmasın,
  kolaylaştıralım işimizi."*
- *"Karoselde öyle yaptık diye bunda da böyle yapacağız diye şart mı var? Belki videoda
  hat sadece işi zorlaştırır ve esnekliği öldürür."* → **mimariyi bu değiştirdi, §3**
- *"Yayını siktir et, video yayınları manuel olacak tamamen."*
- *"Determinizm de o kadar önemli değil, zaten generative iş yapıyoruz; o kural karosel
  içindi belki."*

### Değişmeyen iki yasa

Lisans gevşedi, bunlar gevşemedi:

- **Yasa 9** — onay ima eden yapay insan üretilmez (Reklam Yönetmeliği Md. 27/12).
- **Yasa 7** — her varlık üretim anında damgalanır. Stok arşivinden inen her karenin
  kaynağı ve lisansı `kunye.json`a **o an** yazılır; sonradan retrofit imkânsız.

---

## 1 · BELGELER — nerede ne var

| ne | nerede |
|---|---|
| Bu faz | `docs/fazlar/FAZ-20.md` |
| Araştırma + karar gerekçeleri | `docs/referans/video-hatti-arastirma.md` |
| Ödünç alınan beceriler | `odunc/openmontage/` (463 dosya) |
| Ödünç künyesi | `odunc/KAYNAK.md` |
| Önceki kanıt (2026-08-16) | `motion/kanit/` — altı gerçek mp4 |
| Marka hareket CSS'i | `motion/components/marka.css` |
| Ölçüm defteri | `docs/kurallar/OLCUMLER.md` |

---

## 2 · ÖLÇÜLEN GERÇEKLER — tahmin yok, hepsi bu makinede

```
CPU   : Intel i7-13650HX · 20 çekirdek
RAM   : 38 GB
GPU   : NVIDIA RTX 3050 Laptop · 6144 MiB VRAM
Disk  : 402 GB boş
ffmpeg: 6.1.1 (kurulu)  ·  Chromium: playwright chromium-1194 (kurulu)
```

**Yerel AI video üretimi bu makinede İMKÂNSIZ** — ve bu bir kapı, bir daha denenmeyecek:

| model | asgari VRAM | bizde |
|---|---|---|
| Wan 2.2 TI2V-5B | 16 GB | 6 GB ✗ |
| HunyuanVideo-1.5 | 14 GB | 6 GB ✗ |
| MiniMax H3 (yerel) | 4 × 22 GB | 1 × 6 GB ✗ |

**Cloudflare'de video modeli YOK.** 65 model tarandı. Verebileceği üç şey: kare görsel
(hat zaten `flux-2-klein-4b` kullanıyor), ASR (`whisper-large-v3-turbo`, `nova-3`), TTS
(`melotts` çok dilli; `aura` yalnız `en`/`es` — Türkçe yok).

**Edge TTS'te iki Türkçe nöral ses var ve API anahtarı gerekmiyor:**
`tr-TR-EmelNeural` (kadın) · `tr-TR-AhmetNeural` (erkek).

---

## 3 · MİMARİ — HAT DEĞİL ATÖLYE

⚠ ⚠ **BU KARAR BİR İTİRAZDAN DOĞDU ve itiraz haklıydı.** İlk taslakta karoselin hat
modelini video için de önerdim. Sahip sordu: *"Karoselde öyle yaptık diye bunda da böyle
yapacağız diye şart mı var?"* Hattı alışkanlıktan savunuyordum.

**Fark yapısal:**

- **Karosel TÜRETİLEBİLİR.** Katalog yerleşimi sabitliyor — dört slayt, on yuva.
  Girdiden çıktıya bir yol var, insan birkaç kapıda onaylıyor. Hat oraya oturuyor.
- **Video TÜRETİLMEZ, BULUNUR.** Hareketi dene, bak, easing'i değiştir, tekrar. Yirmi
  tur sürer. Her turu adım listesi + manifest + yetenek yönlendirmesinden geçirmek,
  ürettiği değerin kat kat üstünde sürtünme.

Üstelik hattın karoselde kazandırdıklarının çoğu videoda **zaten yok**: sağlayıcı
yönlendirmesi (sağlayıcılar sabit), bütçe tavanı (üretim bedava), yayın kuyruğu (yayın
tamamen elle).

### Atölye şekli

```
derived/videolar/<id>/
  kompozisyon.html     ← ASIL İŞ BURADA (HyperFrames sözleşmesi)
  varliklar/           ← stok klip · üretilmiş nesne · ses · müzik
  render/              ← her deneme bir mp4
  kunye.json           ← neyin nereden geldiği (Yasa 7)
```

Ajan + `odunc/openmontage` becerileri burada çalışıyor: **render et, BAK, değiştir,
tekrar.** Adım listesi yok, kapı yok, manifest yok.

### İzolasyon — neredeyse tam

| paylaşılan | nasıl |
|---|---|
| `brand/` | **salt okuma** — marka tek |
| `derived/blobs` | isteğe bağlı; karoselin alfa kanallı nesneleri videoda kullanılabilir |

| paylaşılmayan | gerekçe |
|---|---|
| yayın kuyruğu · takvim | **video elle yayınlanıyor** |
| adım listesi · manifest · kapılar | video döngüsel |
| yetenek→sağlayıcı yönlendirme | sağlayıcılar sabit |
| **`packages/render/`** | ⚠ **TEK SATIR DEĞİŞMEYECEK** — karosel panoraması orada |

⚠ Ödünç kod `odunc/` altında, **kaynak ağacının dışında**. Sebep ölçüldü: `packages/`
altına konunca dört kapı kırmızı döndü (`format`, `lint`, `rings`, `secret-rotasyon`),
çünkü her kapı `packages/`'i bizim kaynağımız sayıyor. Emsal `examples/` — aynı gerekçe.

---

## 4 · MOTOR VE ARAÇLAR

### Motor: HyperFrames

`hyperframes@0.8.17` · Apache-2.0 · `npx` ile npm'den (**yerele indirilmiyor** — sahibin
kararı: *"gerekirse indirir onu kopyalarız"*). Gerekirse tek komut:
`npm pack hyperframes@0.7.109`.

⚠ ⚠ **BİR TUR REMOTION ÖNERDİM VE YANLIŞTI.** Gerekçem determinizmdi; teknik olarak
doğru bir gözlemdi ama **deponun mevcut şeklini görmezden geliyordu**: bu deponun bütün
render bilgisi HTML/CSS dizesi üretmek üzerine kurulu (`panorama.ts`). Remotion React
ister; o bilgiyi taşımak bir yılın dersini yeniden yazmaktı. Doğru soru *"hangi motor
daha iyi"* değil, *"hangi motor bu deponun zaten bildiği şeyi konuşuyor"*.
Sahip ayrıca determinizmin video tarafında önemli olmadığını söyledi — R-06 karosel içindi.

`motion/kanit` HyperFrames'in bu depoda çalıştığını **zaten kanıtlıyor**: altı mp4, marka
token'ları tüketiliyor, GSAP CDN'i Yasa 12 gereği kaldırılmış, D-201
`--player-ready-timeout 2000` kararı verilmiş (6 sn'lik video 1 dk 34 sn → 8,3 sn).

### Kurulacak dört şey

| ne | sürüm | lisans | ne için |
|---|---|---|---|
| `hyperframes` | 0.8.17 | Apache-2.0 | render motoru |
| `edge-tts` | 7.2.8 | LGPL-3.0 | Türkçe seslendirme, **anahtar yok** |
| `faster-whisper` | 1.2.1 | MIT | Türkçe altyazı, kelime zamanlaması |
| `open-clip-torch` | 3.3.0 | MIT | stok klip anlamsal eşleme |

Gerisi kurulu: `ffmpeg` 6.1.1 · `playwright` 1.62.1 · `rembg` · `Pillow`.

### KOMPOZİSYON SÖZLEŞMESİ — özü burada, tamamı `odunc/openmontage/hyperframes-core/`

Bağlam sıfırlandığında 13 referans dosyasını yeniden okumaya gerek kalmasın diye özü
buraya alındı. Ayrıntı için: `references/data-attributes.md` · `tracks-and-clips.md` ·
`sub-compositions.md` · `variables-and-media.md`.

**Kök öge** — her kompozisyonda bir tane:

| öznitelik | zorunlu | ne |
|---|:---:|---|
| `data-composition-id` | ✅ | `window.__timelines` anahtarıyla **aynı olmak zorunda** |
| `data-width` / `data-height` | ✅ | `1920x1080` · `1080x1920` · `1080x1080` |
| `data-duration` | ✅ | saniye — **render süresi**, GSAP zaman çizelgesi uzunluğu değil |
| `data-fps` | — | CLI bayrağı ezebilir |

Kök `position: relative`, piksel ölçüsü açık, `overflow: hidden`.

**Klip** — zamanlı çocuk ögeler:

| öznitelik | zorunlu | ne |
|---|:---:|---|
| `class="clip"` | ✅ | ⚠ **YOKSA öge bütün kompozisyon boyunca görünür kalır** ve `data-start`/`data-duration` yok sayılır. `<video>`/`<audio>`'da yazılmaz. |
| `id` | ✅ | zaman çizelgesi hedefi, hata ayıklama |
| `data-start` | ✅ | saniye |
| `data-duration` | ✅ | `div`/`img`/alt kompozisyon için zorunlu |
| `data-track-index` | ✅ | aynı izde klipler **çakışamaz** |

⚠ ⚠ **KLİPLER KÖKÜN DOĞRUDAN ÇOCUĞU OLMAK ZORUNDA.** Sarmalayıcı `<div>` içine konan
klip **kaydedilmez** — en görünür hâli: sarmalayıcıdaki bir `<video>` hiç seek edilmez
ve **siyah render eder**. Dönüştürmek gerekiyorsa sarmalayıcıyı klibin İÇİNE koy.

**Zaman çizelgesi** — GSAP, duraklatılmış, kayıt defterine yazılmış:

```js
window.__timelines = window.__timelines || {}
const tl = gsap.timeline({ paused: true })
tl.from('#baslik', { y: 48, opacity: 0, duration: 0.6, ease: 'power3.out' }, 0.2)
window.__timelines['main'] = tl        // ← data-composition-id ile AYNI
```

⚠ ⚠ **ÖDÜNÇ ÖRNEK GSAP'I CDN'DEN ÇEKİYOR — BİZ ÇEKMEYECEĞİZ.** `minimal-composition.md`
`cdn.jsdelivr.net`'ten yüklüyor; Yasa 12 bunu yasaklıyor ve `motion/kanit` bu kararı
2026-08-16'da zaten vermiş: *"render anında ağ çağrısı; bir ay ihmal edilse de çalışır
bir CDN'in ayakta olmasına bağlanamaz."* GSAP yerel dosyadan yüklenecek — ödünç aldığımız
38 ilkel zaten `../assets/gsap.min.js` diyor.

**Görünürlük penceresi iki uçta da kapsayıcı:** klip `start ≤ t ≤ start + duration`
boyunca görünür. `data-duration`'a oturan bir açılım **son karede görünür**; bitirmek
için erken kesmeye gerek yok.

**Taşma kaçış kapısı:** `data-layout-allow-overflow` — ⚠ patlama yarıçapı geniş, alt
ağaca miras kalıyor ve `text-clipping`, `content-cramped-container`,
`foreground-over-panel` denetimlerini de susturuyor. En dar kapsama ver.

### `hyperframes inspect` — hazır kalite gözü

Çerçevenin kendi denetimi var ve bizim E1–E6'mızın bir kısmını zaten ölçüyor:
`text-clipping` · `content-cramped-container` · `foreground-over-panel` ·
`primary-offscreen`. Son ikisi `allow-overflow` altında **bile** koşuyor.

⚠ `inspect` örneklenmiş anlarda `getBoundingClientRect` ölçüyor, **render edilmiş piksel
değil** — yani `overflow: hidden` görüntüyü kırpar ama bulguyu susturmaz. Bu, karoseldeki
*"yakalamak önlemek değildir"* dersinin çerçeve tarafındaki hâli.

### Görüntü kaynağı — üç yol, sırayla

```
1) STOK ARŞİVİ        Pexels · Pixabay · Coverr · Archive.org · NASA · Wikimedia
                      → "gerçek fabrika, gerçek makine" gereken her yer · BEDAVA
2) ÜRETİLMİŞ NESNE    CF flux-2-klein-4b → arka plan sil → alfa → 2.5B sahne
                      → marka denetimli · karosel hattı bunu zaten üretiyor
3) ÜCRETLİ VİDEO API  → KAPALI, açıkça seçilmedikçe koşmaz
```

### Ses

- **Seslendirme:** Edge TTS · `tr-TR-EmelNeural` · `tr-TR-AhmetNeural`
- **Altyazı:** faster-whisper yerel, `language='tr'`, `word_timestamps=True`
- **Müzik:** ⚠ **ÜRETİLMİYOR, SEÇİLİYOR.** Her koşuda yeni müzik çeşitlilik değil
  **tutarsızlık** getirir; marka sesi diye bir şey kalmaz. Küratörlü kütüphane
  (`gerilim · çözüm · teknik · sakin · atılım`) + **BPM meta verisi** — BPM olmadan
  E4 ölçülemez. ACE-Step bir **deney**, varsayılan değil.
- **Efekt:** Freesound CC0 küratörlü paket

---

## 4b · ATÖLYE DÖNGÜSÜ — somut komutlar

Bağlam sıfırlandığında iş buradan devam eder. Tahmin yok, komut var.

### Yeni video başlat

```bash
export PATH="$HOME/.nvm/versions/node/v22.23.2/bin:$PATH"   # ⚠ node 22 ŞART
mkdir -p derived/videolar/<id>/{varliklar,render}
cd derived/videolar/<id>
npx --yes hyperframes@0.8.17 init          # iskelet + hyperframes.json
```

`motion/kanit/package.json` çalışan bir örnek — komutları oradan al.

### Döngü

```
1. kompozisyon.html'i yaz/değiştir
2. npx hyperframes render --player-ready-timeout 2000
3. BAK                                    ← atlanmaz
4. beğenmedin → 1'e dön
```

⚠ **`--player-ready-timeout 2000` ŞART (D-201).** Kompozisyonlarımız CSS/GSAP tabanlı ve
HyperFrames player runtime'ını çalıştırmıyor; varsayılan 45 sn'lik bekleme 6 sn'lik bir
videoyu **1 dk 34 sn**'de render ettiriyordu, bayrakla **8,3 sn**'ye indi.

### "BAK" ne demek — operasyonel tanım

Karoselde kural *"ÇİZ ve PNG'ye BAK"*tı. Videoda bir mp4'e doğrudan bakılamaz; kare
çıkarılır:

```bash
# beş eşit aralıklı kare — hızlı göz
ffmpeg -i render/<son>.mp4 -vf "fps=1/4" -frames:v 5 render/kare-%02d.png

# belirli bir ana bak
ffmpeg -ss 3.5 -i render/<son>.mp4 -frames:v 1 render/an-3.5.png

# ilk ve son kare (açılış ve kapanış kritik)
ffmpeg -i render/<son>.mp4 -vf "select=eq(n\,0)" -frames:v 1 render/ilk.png
```

Sonra `Read` ile PNG'ye **gerçekten bak**. `odunc/openmontage/video-understand/` ve
`ffmpeg/` becerileri bu iş için hazır tarifler taşıyor.

⚠ **Kanıtsız "bitti" yok.** Video için bu, mp4'ün varlığı değil — **karesine bakılmış
olması** demektir. Bu turda karosel tarafında öğrenilen ders birebir geçerli: `min-height`
tuzağını ancak çizip bakınca gördüm.

### Marka bağlama — her kompozisyonun başında

```html
<link rel="stylesheet" href="../../../brand/brd_upcytech/derived-tokens/tokens.css" />
<link rel="stylesheet" href="../../../packages/ui/src/theme.css" />
<link rel="stylesheet" href="../../../motion/components/marka.css" />
```

Yol derinliği `derived/videolar/<id>/` içinden. `motion/kanit/index.html` çalışan örnek.

### Bir hareket ilkelini markaya bağlama — tarif

38 ilkel `odunc/openmontage/music-to-video/references/motion-primitives/<ad>/index.html`.

```
1. index.html'i oku — HAREKETİ anla (zamanlama, easing, dönüşüm sırası)
2. Gömülü rengi SÖK:   --hg-violet: #7c3aed   →   var(--role-aksan)
                       --hg-bg:     #0a0a0f   →   var(--role-bg)
                       --hg-fg:     #f5f5fa   →   var(--role-text)
3. Gömülü fontu SÖK:   font-family: Inter     →   marka yüzü (theme.css)
4. Süreleri token'a:   duration: 0.6          →   var(--dur-*)
5. Render et ve BAK
```

⚠ `ui-tema` kapısı gömülü rengi zaten yakalıyor — sökmezsen kapı öter (§4.1).

## 5 · ÖDÜNÇ ALINAN — elimizde ne var

`odunc/openmontage/` · OpenMontage `cd9f3c1f0336` · AGPL-3.0 · 463 dosya · 12 MB.

| beceri | dosya | ne veriyor |
|---|---|---|
| `hyperframes-core` | 13 | **kompozisyon sözleşmesi**: `data-*` zamanlama, `class="clip"`, iz/klip, alt kompozisyon, determinizm kuralları, storyboard formatı |
| `hyperframes-animation` | 115 | animasyon adaptörleri (GSAP, Lottie, Three, WAAPI) + tasarım şablonları |
| `hyperframes-creative` | 67 | yaratıcı yön |
| `hyperframes-media` | 40 | medya yerleştirme, ses, video |
| `hyperframes-cli` · `-registry` | 17 | CLI ve kayıt defteri |
| **`music-to-video`** | 132 | ⭐ **38 hareket ilkeli, HTML olarak** |
| `motion-graphics` · `visual-style` | 39 | hareket grafiği ve üslup |
| `playwright-recording` · `synthetic-screen-recording` | 3 | **yazılım tanıtımı** |
| `sound-effects` · `music` · `acestep` | 6 | ses, müzik |
| `text-to-speech` · `speech-to-text` | 8 | seslendirme, altyazı |
| `ffmpeg` · `video-edit` · `video-toolkit` · `video-understand` | 8 | kodlama, kurgu, **videoyu geri okuma** |
| `media-use` · `create-video` · `web-design-guidelines` | 30 | medya kullanımı, genel yön |

### 38 hareket ilkeli

```
3d-card-flip · bg-flow-field · binary-decrypt · blur-resolve · braam-punch
chromatic-split · chrome-sweep · counting-punch · crash-zoom-in · datamosh-smear
directional-fill · dolly-zoom · electric-arc · flash-cut · gooey-metaball
hard-cut · hypercut-whip · iris-open · kinetic-letter-in · liquid-morph
mask-reveal · mosaic-pack · neon-flicker · outline-to-fill · palette-flip
particle-burst · pixel-dissolve · radial-burst-lines · screen-shake
slot-machine-reveal · spotlight-sweep · staggered-exit · text-spectral-rays
text-wave-distort · tile-mosaic · typewriter-reveal · word-grid-burst
```

⚠ ⚠ **OLDUĞU GİBİ KULLANILAMAZ.** Çoğu gömülü renk ve font taşıyor (`--hg-violet:
#7c3aed`, `Inter`). §4.1: *"marka token'ları varken gömülü renk, marka değiştiğinde
değişmeyen bir pikseldir"* — ve `ui-tema` kapısı bunu zaten yakalıyor.
**Alınacak şey HAREKETİN KENDİSİ** (zamanlama, easing, dönüşüm sırası); renk ve tipografi
`brand/brd_upcytech/derived-tokens/tokens.css`e bağlanacak.

✅ İlkeller GSAP'ı **yerel dosyadan** yüklüyor (`../assets/gsap.min.js`), CDN'den değil —
D-201'in kuralına uyuyor.

---

## 6 · İKİ ÜRETİM TÜRÜ — aynı gramer, farklı malzeme

| | **YAZILIM TANITIMI** (firma) | **GENEL İÇERİK** |
|---|---|---|
| görüntü | gerçek ekran kaydı (Playwright/rrweb) | stok arşivi + üretilmiş nesne |
| ses | seslendirme ağırlıklı | müzik ağırlıklı |
| sayı | **kaynaktan** (R-32 firma kipi) | serbest (genel kipi) |
| vuruş | 5–8 (özellik başına bir) | 3–5 |
| süre | 30–60 sn | 8–30 sn |
| çıkış | yatay 16:9 + dikey | dikey 9:16 öncelikli |

---

## 7 · ŞABLON DEĞİL GRAMER

Sahibin itirazı doğru: sabit yerleşim videoda sabit **ritim** demek, ve ritim
tekrarlanınca izleyici üçüncü videoda kalıbı görür.

```
VURUŞ        kanca · iddia · kanıt · dönüş · kapanış
HAREKET      38 ilkelden seçilen, en fazla 2/vuruş
GEÇİŞ        anlamdan türüyor: aynı fikir→kesme · karşıtlık→itme · zaman→kayma
KISIT        güvenli alan · kontrast · tip ölçeği · süre bütçesi
SEÇİM        kaç vuruş, hangi sırada → KONUDAN
```

Bir cümle her seferinde farklıdır, dilbilgisi aynıdır.

### Biçimler

```
DİKEY  9:16 · 1080×1920   Meta güvenli alan: üst %14 · alt %35 · yan %6
                          → kullanılabilir bant 950×979
                          ⚠ alt %35 çok geniş: metin oraya KONAMAZ
YATAY 16:9 · 1920×1080    LinkedIn: MP4, 3sn–30dk, 360–1920px, ±%5
KARE   1:1 · 1080×1080
```

---

## 7b · TÜRKÇE — videoda karoselden FARKLI çalışan üç şey

Karoselin Türkçe dersleri geçerli (R-20 · R-21 · R-22) ama videoda üç ek tuzak var.

**1. Altyazıda `ı/İ` — font kapsamı.** Altyazı `ffmpeg`/`libass` ile gömülüyorsa font
tam Latin Extended-A kapsamak zorunda; kapsamazsa `ı` ve `İ` **kutu** çizer. Marka
yüzleri (Archivo · Literata · Martian Mono) Türkçe sınavından geçti — başka yüz
sokulmayacak.

**2. Büyük harf dönüşümü — R-21 videoda daha tehlikeli.** Altyazı üreteci kelime
zamanlamasından metin kuruyor; oraya sızacak bir `toUpperCase()` `i → I` yapar ve
**her karede** görünür. Yalnız `kernel/src/text/case.ts` dönüştürür.

**3. Okuma hızı — E2'nin sayısı.** Türkçe ≈ **15 karakter/saniye**. Sözcükler uzun ve
ekli; İngilizce için hesaplanmış bir süre Türkçede yetmez. Bir vuruşun süre bütçesi
metnin karakter sayısından türetilir:

```
asgari_süre = karakter_sayısı / 15 + 0.4      (0.4 sn göz yakalama payı)
```

⚠ Bu sayı **ölçülmedi**, kabul edilen bir başlangıç. 20.5'te gerçek altyazıyla
sınanacak; yanlışsa `docs/kurallar/OLCUMLER.md`'ye doğrusu yazılır.

## 8 · ESTETİK SÖZLEŞMESİ — "mükemmel olmalıyız" ölçülebilir hâlde

Bir çıta ölçülemiyorsa çıta değildir.

| # | kural | ölçüm |
|---|---|---|
| E1 | **ölü kare yok** | 12 kareden uzun donma kusur |
| E2 | **okuma süresi yeter** | Türkçe ≈15 karakter/sn |
| E3 | **geçiş anlamlı** | tür vuruş ilişkisinden türüyor; rastgele geçiş kusur |
| E4 | **ses görüntüyle hizalı** | kesme, müzik vuruşuna ±80 ms |
| E5 | **güvenli alan** | 9:16'da üst %14 / alt %35 / yan %6 içinde metin yok |
| E6 | **kontrast** | karoseldeki `gorsel-zemine-karismasin`ın video hâli |

⚠ E4 en çok fark yaratan ve en çok atlanan: **kesmenin müzikle hizalı olması**, bir
videoyu amatörden profesyonele geçiren tek teknik ayrıntıdır. Küratörlü müzik kararı
(§4) bunu mümkün kılıyor — BPM biliniyorsa kesme noktaları hesaplanabilir.

⚠ Atölyede bunlar **kapı değil geri bildirim**: kapı sürtünmedir, ölçüm faydadır.

---

## 8b · ⚠ ⚠ KAPSAM AYRIMI — karosel kuralları videoya, video kuralları karosele KARIŞMAZ

Depo sahibi: *"Karosel kuralları ile kapıları, video birbirine karışmamalı, ikisi farklı.
Hata ile yanlış karar aldırmasınlar."*

**Bu risk teorik değil, bu oturumda iki kez gerçekleşti:**

1. R-06 (determinizm) videoya uygulanmaya kalkıldı ve mimariyi yanlış yöne çekti.
   Sahip düzeltti: *"o kural karosel içindi."*
2. Ödünç kod `packages/` altına konunca **dört karosel kapısı** (`format`, `lint`,
   `rings`, `secret-rotasyon`) bizim yazmadığımız kodda kırmızı döndü.

Bir kuralın kapsamı yazılı değilse, **her kural her yere uygulanır** — ve yanlış yerde
uygulanan doğru bir kural, yanlış bir karardır.

### Kural kapsamı — hangi kural nereye ait

| kural | karosel | video | not |
|---|:---:|:---:|---|
| **Yasa 7** kaynak damgası | ✅ | ✅ | stok karesinin lisansı `kunye.json`a |
| **Yasa 9** yapay insan yasağı | ✅ | ✅ | yayın sorumluluğu, lisanstan bağımsız |
| **Yasa 12** ihmal edilse de çalışır | ✅ | ✅ | CDN'e bağlanma (D-201 zaten uyguluyor) |
| **R-20** görsel modeline metin çizdirme | ✅ | ✅ | üretilmiş görselde geçerli |
| **R-21** `toUpperCase` yasak | ✅ | ✅ | **altyazıda kritik** — `ı/İ` |
| **R-22** `text-transform` yalnız `lang="en"` | ✅ | ✅ | |
| **R-32** kaynaksız sayı yok | ✅ | ✅ | firma kipinde; genel kipte serbest |
| **R-51** secret adı, değeri asla | ✅ | ✅ | |
| **R-06** determinizm | ✅ | ❌ | sahip: *"generative iş yapıyoruz"* |
| **Yasa 13** katalog merkezli, serbest üretim yok | ✅ | ❌ | videoda **gramer** var, katalog yok |
| **R-83…R-104** karosel tasarım kuralları | ✅ | ❌ | punto oturtma, dikiş bandı, kesim — karosel geometrisi |
| **R-02** dokuz fiil | ✅ | ❌ | video atölye, fiil kullanmıyor |
| **R-79** tur içinde nokta atışı test | ✅ | ❌ | atölyede test değil **BAKMA** var |
| **E1…E6** estetik sözleşmesi | ❌ | ✅ | §8, yalnız video |
| adım manifesti · bütçe tavanı · kapılar | ✅ | ❌ | atölyede yok |

⚠ **Tereddütte kural UYGULANMAZ, SORULUR.** Bir karosel kuralının videoya uyup uymadığı
belirsizse, uygulamak değil sormak doğrudur: yanlış uygulanan bir kural sessizce yanlış
bir mimari üretir ve bunu ancak çıktıya bakınca fark edersin.

### Kapı kapsamı — mekanik ayrım

Kural yazmak yetmez, **kapılar da birbirine bulaşmamalı**. Üç mekanik ayrım:

**1. Ad öneki.** Video kapıları `scripts/gates/video-*.mjs`. Karosel kapıları mevcut
adlarını korur. Ad, kapsamı ilk bakışta söyler.

**2. Kapsam beyanı.** Her kapı dosyasının başında `# GROUP:` satırının yanına:

```
// GROUP: fast
// KAPSAM: karosel        ← ya da: video · ortak
```

`ortak` olanlar: `secret-adlari`, `repo-hygiene`, `commit-msg`, `turkish-case`,
`chokepoints`. Gerisi `karosel`.

**3. Yol ayrımı.** Karosel kapıları şu yolları **taramaz**:

```
derived/videolar/**      ← video atölyesi
odunc/**                 ← ödünç kod (zaten hariç: eslint + prettier)
motion/**                ← hareket kütüphanesi
```

Video kapıları da şunları taramaz:

```
packages/render/**       ← karosel panoraması
registry/pipelines/**    ← karosel hatları
derived/runs/**          ← karosel defteri
```

⚠ Bu ayrım **kasten ihlal edilerek** sınanacak: bir video dosyasını bilerek karosel
kuralına aykırı yaz ve karosel kapısının **sessiz kaldığını** gör. Kapının yanlış yerde
ötmediğini görmek, doğru yerde öttüğünü görmek kadar önemli.

## 9 · ADIMLAR

Sıra bağımlılığa göre. Tören yok.

### 20.1 — ÖLÇÜM (kod yok)    [ ]

| # | ölçüm | neden |
|---|---|---|
| a | **1080×1920 · 30 fps · 20 sn render süresi** | döngü hızını bu belirliyor; 5 dakikaysa yirmi tur imkânsız |
| b | Edge TTS Türkçe: iki sesi de dinle | yayına çıkar mı |
| c | faster-whisper `tr` kelime zamanlaması doğruluğu | altyazı yerel mi kalır |
| d | Pexels/Pixabay sanayi terimleriyle arama kalitesi | stok yolu birincil olabilir mi |
| e | Playwright video kaydı kalitesi (1080p, kare düşürme) | tanıtım yolu kurulabilir mi |

Okunacak: `odunc/openmontage/hyperframes-cli/` · `ffmpeg/`.
**Kapı:** beş ölçüm `docs/kurallar/OLCUMLER.md`'ye yazılmadan 20.2 başlamaz.

### 20.2 — İLK KOMPOZİSYON: marka bağlanmış tek kare    [ ]

`odunc/openmontage/hyperframes-core/references/minimal-composition.md`'den başla.
`motion/components/marka.css` ve `brand/.../tokens.css` bağlan.

**Kanıt:** marka rengi ve fontuyla, güvenli alan içinde render edilmiş bir PNG — **BAK**.

### 20.3 — HAREKET İLKELLERİ: 38 tanesi markaya bağlanıyor    [ ]

Gömülü renk/font sökülüp token'a bağlanıyor. Sanayi/B2B tonuna uyanlar önce:
`mask-reveal` · `typewriter-reveal` · `counting-punch` · `directional-fill` ·
`iris-open` · `crash-zoom-in` · `blur-resolve` · `staggered-exit` · `outline-to-fill`

**Kanıt:** her ilkel için render edilmiş mp4, gözle bakılmış.

### 20.4 — VURUŞ GRAMERİ    [ ]

`odunc/openmontage/hyperframes-core/references/storyboard-format.md` okunacak — format
zaten tanımlı.

**Kanıt:** aynı konudan iki video, **farklı vuruş dizisi**.

### 20.5 — SES: seslendirme · altyazı · müzik · efekt    [ ]

Edge TTS → faster-whisper → altyazı. Küratörlü müzik + BPM. Freesound CC0.
Okunacak: `text-to-speech` · `speech-to-text` · `sound-effects` · `music`.

**Kanıt:** kesme müzik vuruşuna ±80 ms oturmuş bir video (E4).
⚠ Türkçe: `ı/İ` kutu çizmiyor; büyük harf dönüşümü yerel duyarlı (**R-21**).

### 20.6 — GÖRÜNTÜ: stok arşivi    [ ]

Pexels/Pixabay/Coverr + `open-clip-torch` anlamsal eşleme. Okunacak: `media-use`.
⚠ **Yasa 7:** her karenin kaynağı ve lisansı indirme anında `kunye.json`a.

### 20.7 — GÖRÜNTÜ: üretilmiş nesne + 2.5B    [ ]

Karoselin alfa kanallı nesneleri derinlik katmanlarına. Ürün görseli yükleme de burada.
**Ölçüm:** E6 (kontrast).

### 20.8 — YAZILIM TANITIMI    [ ]

`playwright-recording` + `synthetic-screen-recording`. Bölüm sınırlarını **betik** koyuyor
— bedava, kesin, AI gerektirmiyor.

### 20.9 — KALİTE GÖZÜ    [ ]

`ffmpeg-analyse-video-skill` deseni: üretilen videoyu **geri oku**, ne olduğunu sor.
E1–E6 burada ölçülür. Okunacak: `video-understand`.

### 20.10 — ÜRET EKRANINDA VİDEO SEKMESİ    [ ]

Karosel / Video. Video seçilince: biçim · süre · kip · ses · görsel kaynağı.
⛔ **Yayın düğmesi YOK** — çıktı klasörü açılır.
**Kapı:** karosel akışı hiç değişmemiş — `uctan-uca` mevcut ölçümlerini aynen geçiyor.

### 20.11 — KAPSAM AYRIMI KAPIYA ÇEVRİLİYOR    [ ]

§8b'nin mekanik hâli: kapı adları, `// KAPSAM:` beyanı, yol dışlamaları.

**Kanıt:** bir video dosyası bilerek karosel kuralına aykırı yazılıyor ve karosel kapısı
**sessiz kalıyor**; sonra bir karosel dosyası aynı şekilde bozuluyor ve kapı **ötüyor**.
İki yönü de görmeden kapanmaz.

---

## 10 · AÇIK BORÇLAR

| # | ne | durum |
|---|---|---|
| V-v1 | ACE-Step 6 GB'de koşuyor mu | ölçülmedi — müzik üretimi masada mı |
| V-v2 | `melotts` Türkçe kalitesi | ölçülmedi — Edge TTS yeterse gereksiz |
| V-v3 | HyperFrames 0.7.109 → 0.8.17 kırıcı değişiklik | ölçülmedi |
| V-v4 | Freesound CC0 sanayi teması kapsamı | ölçülmedi |

---

## 11 · ⛔ DURAN TALİMATLAR

- **YAYIN YOK.** Video yayınları **tamamen elle**. Panelde yayın düğmesi olmayacak.
- **`packages/render/` DOKUNULMAZ.** Karosel panoraması orada.
- **Şablon TASARIMINA dokunma** — karosel kataloğu bu fazın kapsamı dışında.
- **Tezgâh node 22 ile kalkar** (v20'de `better-sqlite3` segfault).
- **Kanıtsız "bitti" yok.** Video için bu demek: **ÇİZ ve mp4'e BAK.**
- Gerçek sağlayıcıya ölçüm çağrısı yapmadan önce **izin iste** — kotalı sağlayıcıda
  bir bake-off günlük kotayı bitirebiliyor (2026-08-28'de oldu).
