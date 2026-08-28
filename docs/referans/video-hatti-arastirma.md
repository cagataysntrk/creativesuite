# Video hattı — araştırma ve mimari kararı

> Durum: **RAPOR**. Kod yazılmadı. Faz haritası bu belgenin sonunda.
> Ölçüm tarihi: 2026-08-28. Önceki araştırma: `docs/research/` (2026-08-14).

Depo sahibinin isteği: karosel hattının yanına **ikinci, tamamen izole bir video
hattı**. Hem dikey hem yatay. Firma ve genel konular. Gerektiğinde görsel üretilecek,
gerektiğinde ürün görseli verilecek. Müzik ve ses efektleri açık kaynaktan. Yerel ya da
ücretsiz modeller, Cloudflare dahil. Ve şablonla değil — *"yoksa her şey birbirinin
aynısı olur"*.

Ticari ürün değiliz; üretim kendimize. Lisans kısıtları buna göre gevşek okundu —
**yalnız Yasa 9 (onay ima eden yapay insan yok) ve Yasa 7 (kaynak damgası) duruyor.**

---

## 1 · Ölçülen gerçekler

Hepsi bu makinede, bu tarihte ölçüldü. Tahmin değil.

### 1.1 Donanım

```
CPU   : Intel i7-13650HX · 20 çekirdek
RAM   : 38 GB
GPU   : NVIDIA RTX 3050 Laptop · 6144 MiB VRAM
Disk  : 402 GB boş
ffmpeg: 6.1.1 (kurulu)
Chromium: playwright chromium-1194 (kurulu)
```

**Bu ölçüm bir kapı: yerel AI video üretimi bu makinede İMKÂNSIZ.**

| model | asgari VRAM | bizde |
|---|---|---|
| Wan 2.2 TI2V-5B (Apache-2.0) | 16 GB (offload bayraklarıyla) | 6 GB ✗ |
| HunyuanVideo-1.5 | 14 GB | 6 GB ✗ |

Önceki araştırma 24 GB'ı *"5 saniyelik klip 9 dakikadan az"* diye kaydetmişti. 6 GB o
tablonun en alt basamağının bile altında. Bu satırı yazmamak, altı ay sonra birinin
aynı denemeyi baştan yapması demekti.

**Ama aynı donanım deterministik render için fazlasıyla yeterli:** 20 çekirdek + 38 GB
+ ffmpeg + Chromium. Karosel hattı zaten bu ikilinin üstünde duruyor.

### 1.2 Cloudflare Workers AI — video yok

65 modelin tamamı tarandı:

| yetenek | durum |
|---|---|
| **video üretimi** | **HİÇ MODEL YOK** |
| görsel üretimi | 11 model (hat zaten `flux-2-klein-4b` kullanıyor) |
| konuşma tanıma (ASR) | `whisper-large-v3-turbo`, `deepgram/nova-3`, `deepgram/flux` |
| metinden konuşma (TTS) | `myshell-ai/melotts` (çok dilli), `deepgram/aura-1`, `aura-2-en`, `aura-2-es` |

Yani Cloudflare video **üretemez**. Verebileceği üç şey var ve üçü de değerli:
kare görseller, Türkçe altyazı için ASR, ve belki Türkçe seslendirme (melotts —
Türkçe kalitesi **ölçülmedi**, aura yalnız İngilizce/İspanyolca).

### 1.3 HyperFrames — zaten kanıtlanmış

`motion/kanit/` bu depoda duruyor ve boş bir iskelet değil:

- `hyperframes.json` → şema `hyperframes.heygen.com`, kayıt defteri `heygen-com/hyperframes`
- `package.json` → `hyperframes@0.7.109`, komutlar: `preview` · `check` · `render` · `publish`
- `renders/` → **altı gerçek mp4**, 2026-08-16 tarihli
- `index.html` → *"bu dosya bir örnek değil, bir KANITTIR: altı bileşenin de gerçek
  Chromium'da render edildiğini ve marka token'larını tükettiğini gösterir"*

Ve iki karar zaten verilmiş:

- **GSAP CDN'i KALDIRILDI.** Gerekçe Yasa 12: *"bir ay ihmal edilse de çalışır"* bir
  CDN'in ayakta olmasına bağlanamaz. Hareket CSS'te, süreler token'da, ikisi de depoda.
- **D-201 / V-20:** `--player-ready-timeout 2000`. Kompozisyonlar CSS tabanlı ve
  HyperFrames player runtime'ını çalıştırmıyor; varsayılan 45 sn'lik bekleme 6 sn'lik
  bir videoyu 1 dk 34 sn'de render ettiriyordu, 8,3 sn'ye düştü.

npm'deki son sürüm **0.8.17**, depo **0.7.109**'a sabitlenmiş. Lisans Apache-2.0.
Aradaki kırıcı değişiklikler **ölçülmedi**.

⚠ Önceki araştırmanın uyarısı: `hyperframes.app` ve `github.com/hyperframes/hyperframes`
**ilgisiz üçüncü taraflar** — Apache-2.0 bir projeye ücretli bulut render satıyorlar.
Yalnız `heygen-com/hyperframes` çekilecek.

### 1.4 Deponun kendi sınırları

```
DOKUZ FİİL (R-02, onuncu yok):
  COMPOSE · GENERATE · INGEST · PROPOSE · PUBLISH · RENDER · RESOLVE · SELECT · VALIDATE
```

Video hattı **yeni fiil getiremez**. İyi haber: getirmesine gerek yok — bölüm 3'te.

Üç video hattı dosyası zaten var ama **iskelet**: `reels` (5 adım), `demo-video` (10),
`explainer-video` (8). Beyan ettikleri tek yetenek `audio.tts`. Video yeteneği hiç yok,
sağlayıcısı hiç yok. Yani niyet yazılmış, hat kurulmamış.

Üç TTS tanımlayıcısı var: `chatterbox` (yerel), `elevenlabs`, `gemini-tts`.

---

## 2 · Bu ölçümlerin ELEDİĞİ seçenekler

Bir raporun en yararlı kısmı, denenmeyecek şeylerin listesidir.

| seçenek | neden elendi |
|---|---|
| Yerel Wan 2.2 / HunyuanVideo | 6 GB VRAM, asgari 14–16 GB |
| Cloudflare'den video üretimi | katalogda video modeli yok |
| OpenAI Sora | 24 Eylül 2026'da kapandı (önceki araştırma) |
| Şablon kataloğu (karoselin aynısı) | sahibin itirazı doğru — bölüm 3.2 |
| ACE-Step ile **Türkçe şarkı sözü** | 19 dil destekliyor, Türkçe listede yok |
| Deepgram `aura` ile Türkçe seslendirme | yalnız `en` ve `es` sürümleri var |

Kalan tek gerçekçi üretken video yolu: **ücretli API** (Veo 3.1 Lite ~$0.05/sn,
LTX-2.3 ~$0.06/sn — önceki araştırmadan). Bu bir zorunluluk değil, bir seçenek; bölüm
3.1 onsuz da yüksek kalite üretilebileceğini savunuyor.

---

## 3 · Mimari

### 3.1 İki katman — ve asıl iş alt katmanda

Önceki araştırmanın önerisi ölçümlerle birebir uyuşuyor:

> *"AI üretimini yalnız **çekilmiş görünmesi gereken** kareler için kullan; logo,
> tipografi, marka renkleri, ekran görüntüsü veya Türkçe ekran metni içeren her şeyi
> deterministik HTML render et — difüzyon modelleri Türkçe aksanları ve senin tam hex
> kodlarını asla güvenilir biçimde çizmez."*

```
KATMAN A — DETERMİNİSTİK (yerel · bedava · kotasız)
  HyperFrames + CSS + Chromium + ffmpeg
  → tipografi, marka, Türkçe metin, logo, veri, ürün görselinin yerleşimi
  → hareket: CSS, süreler token'da
  → hattın GÖVDESİ burası

KATMAN B — ÜRETKEN (kotalı · seçime bağlı)
  → yalnız "çekilmiş görünmesi gereken" saniyeler
  → yerelde imkânsız; iki yol:
      B1) Cloudflare kare görsel + KATMAN A'da deterministik hareket
          (Ken Burns, parallax, 2.5D katman kaydırma, maske açılımı)
      B2) ücretli video API'si — açıkça seçilen, varsayılan olmayan bir adım
```

**B1 hafife alınacak bir şey değil.** Karosel hattı zaten 1024×1280 nesne görselleri
üretiyor, arka planını siliyor ve alfa kanalı veriyor. Alfası olan bir nesne, iki-buçuk
boyutlu bir sahnede gerçekten hareket eder: derinlik katmanları farklı hızda kayar,
ışık üstünden geçer, gölge uzar. Bu "slayt gösterisi" değil.

### 3.2 Şablon değil GRAMER

Sahibin itirazı: *"sanırım şablonlarla olmaz video üretimi yoksa her şey birbirinin
aynısı olur."* Doğru — ve sebebi yapısal.

Karosel kataloğunda sabit olan **yerleşim**: yuvalar, sütun oranları, kırpma. Dört
slaytta on yuva. Zaman yokken bu işe yarıyor.

Videoda sabit yerleşim, sabit **ritim** demek — ve ritim tekrarlanınca izleyici üçüncü
videoda kalıbı görüyor. Sabitlenecek şey yerleşim değil, **dilbilgisi** olmalı:

```
VURUŞ (beat) — zamanın en küçük anlamlı birimi, bir NİYETİ var
    kanca · iddia · kanıt · dönüş · kapanış

HAREKET İLKELİ — küçük ve birleşebilir bir sözlük
    gir · çık · tut · it · aç · say · kaydır · maskele

KISIT KÜMESİ — estetiği koruyan çit
    güvenli alan · kontrast eşiği · tip ölçeği · süre bütçesi · en fazla N ilkel/vuruş

SEÇİM İÇERİKTEN
    kaç vuruş, hangi sırada, hangi ilkelle → konu ve kanıt sayısı belirler
```

Bir cümle her seferinde farklıdır ama dilbilgisi aynıdır. İki video aynı gramerden
çıkar ve birbirine benzemez; çünkü değişen şey **kaç vuruş, hangi niyetle, ne kadar
sürdüğü** — konudan türüyor.

Bu, Yasa 13'ün ("serbest üretim yok, katalog merkezli") ihlali değil **zamana
uyarlanmış hâli**: hat yine düzen icat etmiyor, bir gramerden cümle kuruyor.

### 3.3 Yeni fiil YOK

Dokuz fiil yetiyor:

| adım | fiil | yetenek (yeni) |
|---|---|---|
| konu ve kanıt seçimi | `SELECT` · `GENERATE` | mevcut |
| senaryo → vuruş listesi | `GENERATE` | `text.generate` (mevcut) |
| görsel üretimi | `GENERATE` | `image.generate` (mevcut) |
| arka plan silme | `GENERATE` | `image.matte` (mevcut) |
| **sahne kurulumu** | `COMPOSE` | — (saf, sağlayıcısız) |
| **kare render** | `RENDER` | — (yerel Chromium) |
| **kodlama/birleştirme** | `RENDER` | — (yerel ffmpeg) |
| müzik | `GENERATE` | **`audio.music`** (yeni yetenek) |
| ses efekti | `GENERATE` | **`audio.sfx`** (yeni yetenek) |
| seslendirme | `GENERATE` | `audio.tts` (tanımlı, sağlayıcısı bağlanmamış) |
| altyazı | `GENERATE` | **`audio.transcribe`** (yeni yetenek) |
| denetim | `VALIDATE` | — |
| onay | `PROPOSE` | — |

Yeni olan **yetenek adları**, fiil değil. R-02 duruyor.

### 3.4 İzolasyon — karosel hattı zarar görmez

Sahibin şartı: *"diğer pipeline asla zarar görmemeli, tamamen bağımsız izole olmalı."*

| ne | nerede | karosele teması |
|---|---|---|
| video paketi | `packages/motion/` (yeni) | yok |
| video hatları | `registry/pipelines/video-*.pipeline.yaml` | yok |
| video sağlayıcıları | `registry/providers/*.provider.yaml` (yeni dosyalar) | yok |
| video kapıları | `scripts/gates/video-*.mjs` (yeni) | yok |
| çalıştırma defteri | `derived/runs/` (aynı defter, ayrı hat kimliği) | **paylaşılan, ekleme-yalnız** |
| marka token'ları | `brand/` | **paylaşılan, salt okuma** |
| çekirdek | `packages/kernel` | **paylaşılan, salt okuma** |

Üç paylaşılan nokta kasıtlı: **marka tektir**, defter tektir, çekirdek tektir. Video
hattı bunlara **yazmaz** (defter hariç, o da ekleme-yalnız ve kendi koşu dizinine).

⚠ `packages/render` **hiç değiştirilmeyecek.** Karosel panoraması oraya bağlı ve bu
turda öğrendiğim gibi (punto ölçümü) oradaki her satırın bir gerekçesi var. Video kendi
render motorunu `packages/motion` içinde kuracak; ortak olan tek şey `brand/`.

### 3.5 Üret ekranı

Sahibin tarifi: *"üret sayfasında 2 seçenek olacak — 1 karosel, 1 de video. Videoya
tıklayınca orada video dikey yatay ölçek vs seçilecek."*

```
ÜRET
 ├─ Karosel        → mevcut akış, hiç değişmez
 └─ Video
     ├─ biçim   : dikey 9:16 · yatay 16:9 · kare 1:1
     ├─ süre    : 8–15 sn (kanca) · 15–30 sn (anlatı) · 30–60 sn (derin)
     ├─ kip     : firma · genel
     ├─ ses     : sessiz · müzik · müzik + seslendirme
     └─ görsel  : üret · ürün görseli yükle
```

---

## 4 · Ses ve müzik

| ihtiyaç | seçenek | lisans | maliyet | not |
|---|---|---|---|---|
| müzik yatağı | **ACE-Step v1.5** | Apache-2.0 | yerel/bedava | 6 GB'de koşar mı **ÖLÇÜLMEDİ** |
| müzik yatağı | Suno / Udio | ücretsiz katman | 0 | ticari değiliz → serbest, ama **elle**, API değil |
| müzik yatağı | ElevenLabs Music v2 | ticari | $0.15/dk | tek birinci-taraf API'si |
| ses efekti | Freesound (CC0 süzgeci) | CC0 | 0 | **kütüphane**, üretim değil — en ucuz yol |
| ses efekti | ElevenLabs SFX | ticari | $0.12/dk | istem→efekt |
| seslendirme TR | Cloudflare `melotts` | — | bedava | Türkçe kalitesi **ÖLÇÜLMEDİ** |
| seslendirme TR | `chatterbox` (yerel) | tanımlayıcı var | bedava | bağlanmamış |
| seslendirme TR | ElevenLabs | ticari | $0.10/1k karakter | önceki araştırma: en iyi Türkçe |
| altyazı | **faster-whisper** `language='tr'` | MIT | yerel/bedava | `word_timestamps=True` → kelime zamanlaması |
| altyazı | Cloudflare `whisper-large-v3-turbo` | — | neuron | yerel yeterse gerek yok |

**Kararsız üç şey ve ölçüm borcu bunlar:** ACE-Step 6 GB'de koşuyor mu, melotts Türkçesi
yayına çıkacak kalitede mi, Freesound CC0 kataloğu bir sanayi markasına yetiyor mu.

### ⚠ Türkçe altyazı tuzağı — zaten depoda yazılı

Önceki araştırmadan, ve bu depo aynı dersi R-21'de kendi kabuk seviyesinde yaşadı:

1. **Font kapsamı:** `ı` ve `İ` için tam Latin Extended-A kapsayan bir font seçilmezse
   kutu çizilir.
2. **Büyük harf dönüşümü:** `toUpperCase()` Türkçede `i → I` yapar. Yerel duyarlı
   dönüşüm şart — **R-21 bunu zaten yasaklıyor** ve `turkish-case` kapısı zorluyor.

---

## 5 · Biçimler ve güvenli alanlar

Önceki araştırmadan, doğrulanmış:

```
DİKEY 9:16 · 1080×1920
  Meta güvenli alan: üst %14 · alt %35 · yan %6
  → 1080×1920'de 269px üst, 672px alt, 65px yan
  → kullanılabilir bant: 950 × 979
  ⚠ Alt %35 çok geniş: metin oraya konamaz. Bu, karoselden EN BÜYÜK farkı.

YATAY 16:9 · 1920×1080
  LinkedIn: MP4, 3sn–30dk, 360–1920px, ±%5 oran toleransı, 75KB–500MB

KARE 1:1 · 1080×1080
  Instagram akış videosu — Meta artık akışta bile 9:16 öneriyor
```

---

## 6 · Doğrulanmamış — açık ölçüm borçları

Bir raporun dürüstlüğü burada ölçülür.

| # | soru | neden önemli |
|---|---|---|
| V-a | ACE-Step v1.5 6 GB VRAM'de koşuyor mu | müzik yerel mi kalır, dışarı mı çıkar |
| V-b | `melotts` Türkçe kalitesi | seslendirme bedava mı, ücretli mi |
| V-c | HyperFrames 0.7.109 → 0.8.17 kırıcı değişiklik | sabitleme sürdürülür mü |
| V-d | Chromium'da 1080×1920 · 30fps · 30sn render süresi | bir videonun gerçek maliyeti |
| V-e | Freesound CC0 kataloğunun sanayi teması kapsamı | SFX üretilecek mi, seçilecek mi |
| V-f | HyperFrames'in kendi player runtime'ı bize ne katar | D-201 onu atlıyor; atlamaya devam mı |

---

## 7 · Faz haritası — FAZ-20

Aktif faz 19. Video hattı **FAZ-20** olur ve karosel hattına hiç dokunmaz.

### FAZ-20.1 — Ölçüm borçlarını kapat
`V-a`…`V-f`. Kod yazmadan önce ölçülecek. Özellikle **V-d** (render süresi) mimariyi
belirler: 30 saniyelik bir video 5 dakikada çıkıyorsa akış başka, 45 saniyede çıkıyorsa
başka kurulur.

### FAZ-20.2 — `packages/motion` iskeleti + biçim sözleşmesi
Biçim, süre, güvenli alan ve tip ölçeği **tipte**. Karosel `panorama.ts`ine hiç
dokunulmadan, kendi `sahne.ts`i. Kapı: `packages/render` değişmemiş olacak.

### FAZ-20.3 — Hareket sözlüğü (ilkeler)
`gir · çık · tut · it · aç · say · kaydır · maskele`. CSS'te, süreler token'da, GSAP
yok (D-201'in kararı korunur). Her ilkelin kanıtı: gerçek Chromium'da render edilmiş
bir mp4.

### FAZ-20.4 — Vuruş grameri
`kanca · iddia · kanıt · dönüş · kapanış`. Vuruş sayısı ve sırası **içerikten**
türetiliyor; şablon tablosu yok. Kapı: aynı konudan iki koşu **farklı vuruş dizisi**
üretmeli (tekdüzelik ölçülerek reddedilir).

### FAZ-20.5 — Kare render + ffmpeg kodlama
`RENDER` fiili, yerel Chromium → PNG dizisi → ffmpeg → mp4. Kotasız, bedava.
Kapı: çıktı gerçekten oynuyor ve süresi beyan edilenle aynı.

### FAZ-20.6 — Görsel katmanı (B1: 2.5B hareket)
Karoselin ürettiği alfa kanallı nesneler derinlik katmanlarına yerleşiyor. Ürün görseli
yükleme yolu da burada. Kapı: `gorsel-zemine-karismasin` denetiminin video karşılığı.

### FAZ-20.7 — Ses: müzik yatağı + SFX
V-a ve V-e'nin sonucuna göre yerel ya da kütüphane. Kapı: sessiz video da geçerli bir
çıktı (ses zorunlu değil).

### FAZ-20.8 — Seslendirme + altyazı
`audio.tts` + `faster-whisper` kelime zamanlaması → animasyonlu altyazı.
Kapı: Türkçe `ı/İ` kutu çizmiyor, büyük harf dönüşümü yerel duyarlı (R-21).

### FAZ-20.9 — Denetim (video kalite kapısı)
Karoselin `panorama-denetim`inin video karşılığı: güvenli alan taşması, kontrast,
okuma süresi (bir metin ekranda kaç saniye durmalı), kesme ritmi.

### FAZ-20.10 — Üret ekranı ikiye ayrılıyor
Karosel / Video seçimi, biçim ve süre kontrolleri. Kapı: karosel akışı **hiç
değişmemiş** olacak — `uctan-uca` mevcut ölçümlerini aynen geçmeli.

### FAZ-20.11 — Yayın paketi
Video için `GONDERI.md` karşılığı: kapak karesi, altyazı dosyası, platform başına
biçim. Yayın **yok** — paket çıkarılır, insan yükler.

---

## 8 · Bir uyarı

Karosel hattı bir yılın dersleriyle dolu: punto oturtma, dikiş bandı, kesim, aksan
alanı, Türkçe büyük harf, zemin kontrastı. Video hattı bunların **hepsini yeniden**
öğrenecek, üstüne zamanı ekleyecek.

O yüzden FAZ-20.1 (ölçüm) atlanmamalı. Bu turda öğrendiğim şey tam buydu: `min-height`
bir taban olduğu için oturma ölçümü tabana çöktü ve bir şablonu tek başına okunmaz
yaptı — ve bunu ancak **çizip bakınca** gördüm.

---

# EK A · Ürün ve depo taraması (2026-08-28)

Depo sahibinin verdiği yirmi kalem tek tek bakıldı. Karar ölçütü **bu deponun
kısıtları**, ürünün kendi kalitesi değil: 6 GB VRAM · Cloudflare'de video modeli yok ·
Türkçe · yerel öncelikli · Yasa 12 (bir ay ihmal edilse de çalışır).

## A.1 · Alındı — doğrudan işimize yarıyor

### HyperFrames · `heygen-com/hyperframes` · ★42 962 · Apache-2.0
Katman A'nın motoru. Bu depoda **zaten kanıtlanmış** (`motion/kanit`, altı mp4).
**Yerele çekildi** (bu turda): `vendor/hyperframes/` içinde 0.7.109 ve 0.8.17 npm
tarball'ları + depo dışında tam ayna klon. Gerekçe sahibin kendi cümlesi: *"bi gün priv
yaparlarsa."*

### OpenMontage · `calesthio/OpenMontage` · ★53 045 · AGPL-3.0
**Bu taramanın en değerli bulgusu.** Ajanla sürülen açık kaynak video üretim sistemi;
on bir hat, her biri `research → proposal → script → scene_plan → assets → edit →
compose` akışını izliyor ve her aşamanın bir *"director skill"*i (markdown talimat
dosyası) var — bizim `docs/kurallar/` yaklaşımımızın birebir eşi.

⭐ **`Documentary Montage` hattı bizim en büyük boşluğumuzu kapatıyor:** CLIP ile
indekslenmiş **ücretsiz** stok arşivinden (Pexels, Archive.org, NASA, Wikimedia,
Unsplash) tematik montaj — kendi tanımıyla *"paid generation API'siz gerçek görüntülü
videolar"*. Yerel GPU yok ve Cloudflare video üretmiyorken, gerçek görüntüye ulaşmanın
tek bedava yolu bu.

Ön koşullar: Python 3.10+ · ffmpeg · Node 18+ · bir AI kodlama asistanı. **Dördü de
bu makinede var.**

⚠ **AGPL-3.0 — kodu bu depoya KOPYALANMAZ.** Ticari ürün değiliz, kullanmak serbest;
ama AGPL bulaşıcıdır ve kopyalanan kod bütün depoyu kapsamına alır. Doğru kullanım:
**ayrı süreç olarak çalıştır**, fikirlerini ve hat şemasını al.

### MoneyPrinterTurbo · `harry0703/MoneyPrinterTurbo` · ★117 944 · MIT
README'nin kendi cümlesi bizim donanım ölçümümüzün aynısı: *"bulut LLM, bulut TTS ve
çevrimiçi materyale dayanıyorsan CPU ve RAM GPU'dan daha önemli."*

Üç şeyi hazır getiriyor:
- **Edge TTS** — Microsoft'un ücretsiz TTS'i, **API anahtarı gerektirmiyor**, Türkçe
  sesleri var. `melotts`in Türkçe kalitesini ölçmeden önce denenecek ilk şey bu.
- **Pexels · Pixabay · Coverr** ücretsiz stok entegrasyonu
- Altyazıyı **TTS zaman damgalarından** üretiyor — GPU'suz, hızlı

MIT olduğu için **kod ödünç alınabilir** (AGPL'in aksine).

### ffmpeg-analyse-video-skill · `fabriqaai/ffmpeg-analyse-video-skill` · ★27
Küçük ama tam yerine oturuyor: ffmpeg ile kare çıkarıp görüyle **zaman damgalı özet**
üretiyor. Bu, karosel hattındaki *"ÇİZ ve PNG'ye BAK"* kuralının video karşılığı —
ürettiğimiz videoyu geri okuyup *"gerçekten ne oldu"* diye sormak. FAZ-20.9'un
(video denetimi) doğal aracı.

## A.2 · Denenecek — ölçüm borcu var

| ne | ★ | lisans | neden ilginç | ölçülecek |
|---|---|---|---|---|
| **pireel** `pireel/pireel` | 1 083 | AGPL-3.0 | MCP üzerinden **ajanla sürülebilen** açık CapCut alternatifi; çok izli zaman çizelgesi | insan onayı kapımızla eşleşir mi — hat taslak üretir, insan ince ayar yapar |
| **OpenChatCut** `0xsline/OpenChatCut` | 1 428 | AGPL-3.0 | yerel-öncelikli, konuşarak video düzenleme | pireel ile aynı niş; ikisinden **biri** seçilir |
| **openart.ai** | — | SaaS | 100+ model, ücretsiz katman, görsel+video+müzik | ücretsiz katmanın **video kotası** ve çıktı hakları doğrulanmadı; API'siz ise Suno gibi elle kullanılır |
| **Phosphene** `mrbizarro/Phosphene` | 190 | MIT | Hailuo H3 + LTX-2.5'i **yerelde** koşturuyor (Mac) | bizde Mac yok ama bellek yönetimi tekniği okunmaya değer |

## A.3 · Elendi — ve gerekçesi ölçüm

| ne | gerekçe |
|---|---|
| **Raylight** | Çok-GPU paralelliği (FSDP/USP). Referans kurulum **4 × 22 GB RTX 2080 Ti**. Bizde 1 × 6 GB. |
| **MiniMax H3 / Hailuo** (yerel) | Aynı sebep — `Eanya-Tonic/2080ti-minimax-h3` dört kart kullanıyor. API olarak ücretli: Katman B'nin **seçeneği**, varsayılanı değil. |
| **LongCat-Video** (Meituan, ★7 698, MIT) | Tek-GPU çıkarım yolu var ama bu sınıf bir model 6 GB'a sığmıyor. Barındırılmış API'si yok. |
| **Voicebox** | Meta ağırlıkları **hiç yayımlamadı**. `SpeechifyInc/Meta-voicebox` (★596, MIT) 2023'ten beri güncellenmemiş. Türkçe için Edge TTS ve ElevenLabs zaten önde. |
| **flick.tech** | Sosyal medya pazarlama platformu — video üretimi değil. Konu dışı. |
| **OpenGenerativeAI** | Bu adla ciddi bir proje **bulunamadı** (en yükseği ★1). Muhtemelen ad yanlış hatırlandı — netleştirilmeli. |

## A.4 · Kapalı kutu ama FİKİR kaynağı

Hattımıza giremezler (API'siz ya da kapalı) — ama üçü de bizim yapmak istediğimiz şeyin
ticari hâli ve mimarileri okunmaya değer.

- **poko.video** — *"repo, PDF ya da PowerPoint'i motion videoya çevir; ajan senaryo
  yazar, sahneleri kurar ve **makinende yerelde render eder**"*. **Mimarisi bizimkine
  en yakın olan.** Aynı bahis: ajan + yerel deterministik render.
- **motion.so** — *"motion design için frontier agent; videoyu tarif et, tasarlasın,
  animasyonlasın ve render etsin"*. Doğrudan rakip/referans.
- **vidrush.ai** — uzun form için *"araştırma, senaryo, seslendirme, görüntü, kurgu,
  kapak"* — FAZ-20 akışının ticari eşi.
- **ChatCut** — `ChatCut-Inc/agent-plugin` (★827) var, yani ürün **ajanla sürülebiliyor**;
  ürün sitesi bu taramada yanıt vermedi.

## A.5 · Doğrulanamadı

`motionpromo` · `clipmasters` · `joy ai video editor` · `vimax` · `chatcut.com` —
siteler yanıt vermedi ya da boş döndü. Tahmin yazmaktansa boş bırakıyorum; adları
netleştirirsen tekrar bakılır.

## A.6 · Bu taramanın mimariye etkisi

Ana rapordaki iki katmanlı yapı **değişmiyor** ama Katman B'nin içi doldu. Yerel üretim
imkânsızken *"çekilmiş görünmesi gereken"* saniyeler için üç yol var ve üçü de bedava:

```
B1) Cloudflare kare görsel + Katman A'da 2.5B deterministik hareket   (zaten planlı)
B2) ÜCRETSİZ STOK ARŞİVİ + anlamsal arama  ← YENİ, OpenMontage'ın yolu
    Pexels · Pixabay · Coverr · Archive.org · NASA · Wikimedia
B3) ücretli video API'si                                              (son çare)
```

**B2 sanayi konularında B1'den güçlü olabilir.** "Titreşim sensörü", "konveyör bandı",
"vardiya" gibi konularda gerçek fabrika görüntüsü, üretilmiş bir 3B nesneden daha
inandırıcı. Ve kota harcamıyor.

⚠ **Yasa 7 burada da geçerli:** stok arşivinden gelen her karenin kaynağı ve lisansı
üretim anında damgalanmalı — karoseldeki `.kaynak.json` deseninin aynısı. Sonradan
retrofit imkânsız.

### Faz haritasına etkisi

- **FAZ-20.1'e eklendi:** Edge TTS Türkçe kalitesi ölçülecek (melotts'tan önce).
- **FAZ-20.6 ikiye ayrıldı:** B1 (üretilmiş nesne + 2.5B hareket) ve **B2 (stok arşivi
  + anlamsal arama)**. B2 önce ölçülecek: daha ucuz ve sanayi konusunda muhtemelen
  daha güçlü.
- **FAZ-20.9'a araç geldi:** `ffmpeg-analyse-video-skill` — üretilen videoyu geri okuma.
