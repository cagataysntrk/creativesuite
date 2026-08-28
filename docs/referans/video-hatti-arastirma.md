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
**Motor kararı bu (EK B, Karar 1).** `npx` ile npm'den koşuyor; yerele indirilmiyor —
sahibin kararı: *"sadece locale indirme dedim… gerekirse indirir onu kopyalarız."*
Gerekirse tek komut: `npm pack hyperframes@0.7.109`.

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

---

# EK B · NİHAİ KARARLAR ve TAM YOL HARİTASI

> Bu bölüm **§7'nin yerine geçer.** Oradaki faz haritası taslaktı; bu kesin.
> Karar tarihi: 2026-08-28.

## B.0 · Sahibin kapattığı sorular

Bunlar tartışılmaz — karar verildi, gerekçesi yazıldı, bir daha açılmaz.

| soru | karar | sahibin sözü |
|---|---|---|
| Lisans (AGPL vb.) | **Bağlamıyor.** Depo private, dağıtım yok, ticari ürün yok. | *"agpl bizi bağlamaz, biz zaten kendimize yapıyoz… repoyu public etmiyoruz"* |
| Açık kaynak kullanımı | **Azami.** Hazır olanı al, yeniden yazma. | *"open source'lardan müthiş faydalanmak lazım, kod yazmak kontrol etmek zor iş"* |
| HyperFrames kaynağı | **İndirilmiyor.** Tarball sigortası yeterli. | *"hyperframes'i boşver indirmeyi… gerekirse indirir onu kopyalarız"* |
| Kalite çıtası | **Ödünsüz.** | *"gerçekten etkileyici tasarım, geçiş, efekt, ses, müzik… mükemmel olmalıyız"* |
| Kapsam | **İki tür içerik** | *"hem şirketin yazılımlarını tanıtacak videolar hem de genel içerikler"* |

⚠ Değişmeyen tek şey **Yasa 9** (onay ima eden yapay insan üretilmez — Reklam
Yönetmeliği Md. 27/12) ve **Yasa 7** (her varlık üretim anında damgalanır). Bunlar
lisans değil, yayın sorumluluğu.

---

## B.1 · Nihai teknoloji kararları

### Karar 1 — Render motoru: **HyperFrames**

`hyperframes` (HeyGen · Apache-2.0 · ★42 962 · *"Write HTML. Render video. Built for
agents."*). `npx` ile npm'den koşar; **yerele indirilmiyor** — depo sahibinin kararı:
*"sadece locale indirme dedim… gerekirse indirir onu kopyalarız."*

**Neden HyperFrames — ve bu, bu deponun kendi şekline uyan karar:**

Bu deponun bütün render bilgisi **HTML/CSS dizesi üretmek** üzerine kurulu.
`panorama.ts` bir yılın dersini taşıyor: punto oturtma, dikiş bandı, aksan alanı,
Türkçe büyük harf, zemin kontrastı — hepsi CSS kuralları ve DOM ölçümü olarak yazılı.
HyperFrames tam olarak bunu yiyor: HTML ver, video al.

⚠ ⚠ **BİR TUR REMOTION ÖNERDİM VE YANLIŞTI.** Gerekçem determinizmdi (`useCurrentFrame`
kareyi saf girdi yapıyor, R-06'ya doğal uyuyor) ve teknik olarak doğru bir gözlemdi —
ama **deponun mevcut şeklini görmezden geliyordu**. Remotion React bileşeni ister;
`panorama.ts`in bütün tipografi bilgisini React'e taşımak, bir yılın dersini yeniden
yazmak demekti. Doğru soru *"hangi motor daha iyi"* değil, *"hangi motor bu deponun
zaten bildiği şeyi konuşuyor"*.

Ve HyperFrames bu depoda **zaten kanıtlanmış**: `motion/kanit`ta altı gerçek mp4 var,
marka token'ları tüketiliyor, GSAP CDN'i Yasa 12 gereği kaldırılmış, D-201
`--player-ready-timeout 2000` kararını çoktan vermiş (6 sn'lik video 1 dk 34 sn'den
8,3 sn'ye inmiş).

**Remotion'dan yine de faydalanılacak — motor olarak değil, FİKİR olarak.** MIT
lisanslı `@remotion/captions` kelime zamanlamasını altyazıya çevirmenin çözülmüş hâli;
`@remotion/transitions` geçiş kataloğu için okunacak referans. Kod ödünç alınabilir,
motor değişmez.

⚠ **Determinizm bir ölçüm borcu olarak duruyor** (FAZ-20.1'e eklendi): HyperFrames
CSS animasyonlu bir kompozisyonda kareleri nasıl örnekliyor, aynı kompozisyon iki kez
render edilince bayt bayt aynı çıkıyor mu. R-06 bu deponun yasası; cevap "hayır" ise
zamanı CSS'ten alıp kare numarasından türeten bir katman yazılır — motor yine değişmez.

### Karar 2 — Görüntü kaynağı: üç yol, sırayla

```
1) STOK ARŞİVİ  (birincil, bedava, kotasız)
   Pexels · Pixabay · Coverr · Archive.org · NASA · Wikimedia
   → "gerçek fabrika, gerçek makine, gerçek el" gereken her yerde
   → OpenMontage'ın Documentary Montage hattının yolu

2) ÜRETİLMİŞ NESNE + 2.5B HAREKET  (marka denetimli)
   Cloudflare flux-2-klein-4b → arka plan silme → alfa katman → derinlikli sahne
   → karosel hattı bunu ZATEN üretiyor; hareket Remotion'da

3) ÜCRETLİ VİDEO API'Sİ  (kapalı — açıkça seçilmedikçe koşmaz)
```

**Yerel AI video üretimi kapsam dışı** — 6 GB VRAM, asgari 14–16 GB. Ölçüldü, yazıldı,
bir daha denenmeyecek.

### Karar 3 — Ses

| katman | karar | gerekçe |
|---|---|---|
| **seslendirme** | **Edge TTS** · `tr-TR-EmelNeural` (K) · `tr-TR-AhmetNeural` (E) | API anahtarı YOK, bedava, iki nöral Türkçe ses — bu turda doğrulandı |
| **altyazı** | **faster-whisper** yerel, `language='tr'`, `word_timestamps=True` | 20 çekirdekte hızlı, kotasız; `@remotion/captions` kelime zamanlamasını tüketiyor |
| **müzik** | **Küratörlü yerel kütüphane** (birincil) | ⚠ aşağıda |
| **ses efekti** | **Freesound CC0 küratörlü paket** | aynı gerekçe |

⚠ ⚠ **MÜZİK ÜRETİLMİYOR, SEÇİLİYOR — ve bu bilinçli bir kalite kararı.** Her koşuda
yeni müzik üretmek çeşitlilik değil **tutarsızlık** getirir: marka sesi diye bir şey
kalmaz. Yirmi–otuz parçalık, ruh haline göre etiketlenmiş küratörlü bir kütüphane
(`gerilim · çözüm · teknik · sakin · atılım`) hem daha tutarlı hem kotasız hem Yasa 12
uyumlu. Üretim (ACE-Step) bir **deney** olarak FAZ-20.1'de ölçülür, varsayılan değil.

### Karar 4 — Yazılım tanıtım videoları: Playwright + rrweb

Şirketin yazılımını tanıtan video, stok görüntüyle ya da üretilmiş nesneyle yapılamaz —
**gerçek ekranı** göstermek gerekir. Zaten elimizde olan:

- **Playwright** kurulu (karosel hattı onu kullanıyor) → gerçek tarayıcı, gerçek UI
- Bölüm sınırları **senaryonun kendisinden** geliyor: hangi saniyede hangi özelliğin
  gösterildiğini betik biliyor. Önceki araştırmanın notu: *"bu bedava, kesin ve hiç AI
  gerektirmiyor"*
- **rrweb** (önceki araştırmanın *"en yüksek kaldıraçlı OSS bulgusu"*): oturumu olay
  akışı olarak kaydeder → sonsuz yeniden çekim, sıfır maliyet

Sonra Remotion: yakınlaştırma, imleç vurgusu, çağrı balonları, altyazı, ritim.

---

## B.2 · İki üretim türü — aynı gramer, farklı malzeme

| | **YAZILIM TANITIMI** (firma) | **GENEL İÇERİK** |
|---|---|---|
| görüntü | gerçek ekran kaydı (Playwright/rrweb) | stok arşivi + üretilmiş nesne |
| ses | seslendirme ağırlıklı | müzik ağırlıklı, seslendirme seçenek |
| sayı kullanımı | **kaynaktan** (R-32, firma kipi) | serbest (genel kipi) |
| vuruş sayısı | 5–8 (özellik başına bir) | 3–5 |
| süre | 30–60 sn | 8–30 sn |
| çıkış | yatay 16:9 (LinkedIn) + dikey | dikey 9:16 öncelikli |

Gramer aynı, malzeme farklı. İki ayrı hat değil, **bir hat iki kip** — karoselin
`firma`/`genel` ayrımının birebir devamı.

---

## B.3 · "Mükemmel olmalıyız" — estetik sözleşmesi

Bir çıta, ölçülebilir değilse çıta değildir. *"Etkileyici"* şu altı ölçüme çevriliyor
ve hepsi FAZ-20.9'un kapısına giriyor:

| # | kural | ölçüm |
|---|---|---|
| E1 | **Ölü kare yok** | Her karede ya hareket ya değişim var; 12 kareden uzun donma kusur. |
| E2 | **Okuma süresi yeter** | Ekrandaki metin, Türkçe okuma hızıyla (≈15 karakter/sn) okunacak kadar duruyor. |
| E3 | **Geçiş anlamlı** | Geçiş türü vuruş ilişkisinden türüyor: aynı fikir → kesme, karşıtlık → itme, zaman → kayma. Rastgele geçiş kusur. |
| E4 | **Ses görüntüyle hizalı** | Kesme, müziğin vuruşuna ±80 ms içinde oturuyor. |
| E5 | **Güvenli alan ihlali yok** | 9:16'da üst %14 / alt %35 / yan %6 içinde hiçbir metin ya da logo yok. |
| E6 | **Kontrast eşiği** | Karoseldeki `gorsel-zemine-karismasin` kuralının video hâli — her karede. |

⚠ E4 bu listenin en çok fark yaratanı ve en çok atlanan: **kesmenin müzikle hizalı
olması**, bir videoyu amatörden profesyonele geçiren tek teknik ayrıntıdır. Küratörlü
müzik kütüphanesi kararı (Karar 3) bunu mümkün kılıyor — parçanın BPM'i önceden
biliniyorsa kesme noktaları hesaplanabilir. Üretilmiş müzikte bilinmez.

---

## B.4 · İzolasyon sözleşmesi

Sahibin şartı: *"diğer pipeline asla zarar görmemeli."* Bu bir niyet değil, bir kapı
olacak.

```
YENİ (video hattına ait, karosel bunlara HİÇ dokunmaz)
  packages/motion/            → sahne, vuruş, gramer, kısıtlar
  packages/motion-render/     → Remotion kökü, bileşenler, geçişler
  registry/pipelines/video-*.pipeline.yaml
  registry/providers/*.provider.yaml  (edge-tts, stok arşivi, faster-whisper)
  scripts/gates/video-*.mjs
  brand/brd_upcytech/muzik/   → küratörlü müzik + SFX kütüphanesi
  derived/runs/<runId>/video/ → çıktılar

PAYLAŞILAN — SALT OKUMA
  brand/          marka tektir
  packages/kernel çekirdek tektir
  packages/contracts  fiiller ve şerit sözleşmesi

PAYLAŞILAN — EKLEME YALNIZ
  derived/runs/   defter tektir, her koşu kendi dizinine yazar

DOKUNULMAZ
  packages/render/    ⚠ karosel panoraması burada. TEK SATIR değişmeyecek.
```

**Kapı `video-izolasyon`:** video fazlarının hiçbir commit'i `packages/render/` altında
değişiklik içeremez. Kasten ihlal edilip kırmızıya döndüğü görülmeden faz kapanmaz.

---

## B.5 · FAZ-20 — tam yol haritası

On dört adım. Her adımın **kapısı** ve **kanıtı** var; kanıt görülmeden adım kapanmaz.

### FAZ-20.1 · Ölçüm borçları (kod yok)

Kod yazmadan ölçülecekler. Mimariyi bunlar belirliyor.

| # | ölçüm | neden mimariyi belirliyor |
|---|---|---|
| a | **Remotion'da 1080×1920 · 30 fps · 20 sn render süresi** | 5 dakikaysa akış başka, 45 saniyeyse başka |
| b | Edge TTS Türkçe kalitesi — iki sesi de dinle | yayına çıkar mı, ElevenLabs gerekir mi |
| c | faster-whisper `tr` kelime zamanlaması doğruluğu | altyazı yerel mi kalır |
| d | ACE-Step 6 GB'de koşuyor mu | müzik üretimi masada mı |
| e | Pexels/Pixabay API kotaları ve arama kalitesi (sanayi terimleri) | stok yolu birincil olabilir mi |
| f | Playwright video kaydı kalitesi (1080p, kare düşürme) | tanıtım videosu yolu kurulabilir mi |
| **g** | **HyperFrames determinizmi:** aynı kompozisyon iki kez render edilince bayt bayt aynı mı | R-06 deponun yasası; hayırsa zamanı kare numarasından türeten ince bir katman gerekir |

**Kapı:** yedi ölçümün yedisi `docs/kurallar/OLCUMLER.md`'ye yazılmadan FAZ-20.2 başlamaz.

### FAZ-20.2 · İskelet ve izolasyon kapısı

`packages/motion` + `packages/motion-render` doğuyor. Remotion kökü kuruluyor, marka
token'ları bağlanıyor (`motion/components/marka.css` taşınıyor).

**Kapı:** `video-izolasyon` — `packages/render/` değişmemiş. Kasten ihlal et, kırmızıyı gör.
**Kanıt:** marka renkleriyle tek kare render edilmiş bir PNG.

### FAZ-20.3 · Biçim ve güvenli alan sözleşmesi

Dikey/yatay/kare, süre bütçesi, güvenli alanlar **tipte**. 9:16'nın alt %35'i karoselden
en büyük fark ve tipte zorlanacak.

**Kapı:** güvenli alan dışına metin koyan bir kompozisyon derleme hatası verir.

### FAZ-20.4 · Hareket ilkelleri sözlüğü

`gir · çık · tut · it · aç · say · kaydır · maskele`. Her ilkel Remotion'da saf bir
fonksiyon: kare → stil. Süreler token'da.

**Kanıt:** her ilkel için render edilmiş bir mp4, gözle bakılmış.
**Kapı:** ilkel sayısı ≤ 10 — sözlük büyürse gramer olmaktan çıkar.

### FAZ-20.5 · Geçiş sözlüğü (E3'ün karşılığı)

`@remotion/transitions` üstüne, **anlam-güdümlü** seçim: aynı fikir → kesme,
karşıtlık → itme, zaman akışı → kayma, ölçek değişimi → yakınlaşma.

**Kapı:** geçiş türü vuruş ilişkisinden türetilmiş olacak; rastgele seçim reddedilir.

### FAZ-20.6 · Vuruş grameri

`kanca · iddia · kanıt · dönüş · kapanış`. Vuruş sayısı ve sırası **içerikten**.

**Kapı (en önemlisi):** aynı konudan iki koşu **farklı vuruş dizisi** üretmeli.
Tekdüzelik ölçülerek reddedilir — sahibin *"hepsi birbirinin aynısı olur"* korkusunun
kapıya çevrilmiş hâli.

### FAZ-20.7 · Kare render + ffmpeg kodlama

Remotion → kare dizisi → ffmpeg → mp4. Kotasız, yerel.

**Kapı:** çıktı gerçekten oynuyor, süresi beyan edilenle aynı, platform biçim
sınırlarında (LinkedIn 3sn–30dk, 360–1920px, ±%5 oran).

### FAZ-20.8 · Stok arşivi yolu (görüntü — birincil)

Pexels/Pixabay/Coverr/Archive.org araması, anlamsal eşleme, indirme, önbellek.

⚠ **Yasa 7:** her karenin kaynağı ve lisansı indirme anında damgalanır —
karoseldeki `.kaynak.json` deseninin aynısı. Sonradan retrofit imkânsız.
**Kapı:** damgasız hiçbir kare zaman çizelgesine giremez.

### FAZ-20.9 · Üretilmiş nesne yolu + 2.5B hareket

Karoselin ürettiği alfa kanallı nesneler derinlik katmanlarına. Ürün görseli yükleme de
burada.

**Kapı:** E6 (kontrast) — `gorsel-zemine-karismasin`ın video hâli, her karede.

### FAZ-20.10 · Ses: müzik yatağı + SFX

Küratörlü kütüphane, ruh hali etiketleri, **BPM meta verisi** (E4 için şart).
Miksaj: seslendirme varken müzik ducking.

**Kapı:** E4 — kesmeler müzik vuruşuna ±80 ms. Ve: sessiz video da geçerli çıktı.

### FAZ-20.11 · Seslendirme + altyazı

Edge TTS → faster-whisper → `@remotion/captions` → animasyonlu altyazı.

**Kapı:** Türkçe `ı/İ` kutu çizmiyor; büyük harf dönüşümü yerel duyarlı (R-21);
altyazı güvenli alan içinde.

### FAZ-20.12 · Yazılım tanıtım yolu

Playwright betiği panelde geziyor, bölüm sınırlarını **betik** koyuyor, rrweb olay
akışı defterde. Remotion: yakınlaştırma, imleç vurgusu, çağrı balonu.

**Kapı:** aynı betik iki kez koşturulduğunda **aynı bölüm sınırları** çıkıyor (R-06).

### FAZ-20.13 · Video denetimi (E1–E6)

Karoselin `panorama-denetim`inin video karşılığı. Altı estetik kuralı da ölçülüyor.
`ffmpeg-analyse-video-skill` deseni: üretilen videoyu **geri okuyup** ne olduğunu sor.

**Kapı:** kusurlu video yayın paketine giremez — *"yakalamak önlemek değildir"*.

### FAZ-20.14 · Üret ekranı ikiye ayrılıyor + yayın paketi

Karosel / Video seçimi; video seçilince biçim, süre, kip, ses, görsel kaynağı.
Yayın paketi: kapak karesi, altyazı dosyası, platform başına biçim.

**Kapı:** karosel akışı **hiç değişmemiş** — `uctan-uca` mevcut ölçümlerini aynen geçiyor.
⛔ **YAYIN YOK**: paket çıkarılır, insan yükler.

---

## B.6 · Riskler

| risk | erken uyarı | önlem |
|---|---|---|
| Render çok yavaş | FAZ-20.1(a) | süre bütçesi düşürülür, kare hızı 24'e iner |
| Stok arşivinde sanayi görüntüsü zayıf | FAZ-20.1(e) | 2.5B yolu (20.9) birincil olur |
| Edge TTS Türkçesi yayına yetmiyor | FAZ-20.1(b) | ElevenLabs'a düşülür (ücretli, açık seçim) |
| Gramer yine tekdüze çıkıyor | FAZ-20.6 kapısı | ilkel sözlüğü genişletilir, vuruş türü eklenir |
| HyperFrames determinist değil çıkıyor | FAZ-20.1(g) | zamanı kare numarasından türeten ince katman yazılır |
| HyperFrames deposu kapanıyor | — | `npm pack hyperframes@<sürüm>` tek komut; o gün indirilir |
| Video hattı karoseli bozuyor | `video-izolasyon` kapısı | her commit'te ölçülür |

---

## B.7 · Sıradaki adım

**FAZ-20.1.** Altı ölçüm, kod yazmadan. Özellikle (a) render süresi — o sayı gelmeden
kurulacak mimari bir tahmindir.

Bu turda öğrenilen ders tam da bu: `min-height` bir taban olduğu için oturma ölçümü
tabana çöktü, bir şablonu tek başına okunmaz yaptı ve bunu ancak **çizip bakınca**
gördüm. Video bu hatanın yirmi katını barındırıyor — çünkü zaman var.

---

# EK C · Kullanılacak açık kaynaklar — kesin liste

Sürüm ve lisanslar 2026-08-28'de **doğrulandı**, tahmin yok. *Nasıl* sütunu önemli:
bir bağımlılığı kurmakla kodunu ödünç almak aynı şey değil.

## C.1 · Çekirdek — hattın gövdesi

| ne | sürüm | lisans | nasıl | ne için |
|---|---|---|---|---|
| **hyperframes** | 0.8.17 | Apache-2.0 | `npx`, npm'den | **render motoru** — HTML ver, video al |
| **ffmpeg** | 6.1.1 | LGPL/GPL | kurulu | kodlama, birleştirme, miksaj, kare çıkarma |
| **playwright** | 1.62.1 | Apache-2.0 | kurulu | Chromium; yazılım tanıtımında ekran kaydı |

## C.2 · Ses

| ne | sürüm | lisans | nasıl | ne için |
|---|---|---|---|---|
| **edge-tts** | 7.2.8 | LGPL-3.0 | ayrı süreç | Türkçe seslendirme — **API anahtarı yok**, `tr-TR-EmelNeural` · `tr-TR-AhmetNeural` |
| **faster-whisper** | 1.2.1 | MIT | kütüphane | Türkçe altyazı, `word_timestamps=True` — yerel, kotasız |
| **Freesound** | — | CC0 süzgeci | varlık | ses efekti kütüphanesi (üretim değil, küratörlük) |
| ACE-Step v1.5 | — | Apache-2.0 | **deney** | müzik üretimi — 6 GB'de koşar mı FAZ-20.1(d) |

## C.3 · Görüntü kaynağı

| ne | lisans | nasıl | ne için |
|---|---|---|---|
| **Pexels · Pixabay · Coverr** | kendi ücretsiz lisansları | API | stok görüntü — birincil yol |
| **Archive.org · Wikimedia · NASA** | kamu malı / CC | API | arşiv görüntüsü |
| **open-clip-torch** | 3.3.0 · MIT | kütüphane | **anlamsal eşleme** — "titreşim sensörü" → doğru klip |
| **rembg** | 2.0.81 · MIT | zaten kurulu | arka plan silme (karosel hattı kullanıyor) |
| **Pillow** | 12.3.0 | zaten kurulu | akıllı kırpma (`otomatik-kirp.py`) |

## C.4 · Kod ödünç alınacaklar — kurulmuyor, OKUNUYOR

Sahibin kararı: *"open source'lardan müthiş faydalanmak lazım, kod yazmak kontrol etmek
zor iş."* Bunlar bağımlılık değil, **çözülmüş problem kaynağı**.

| ne | ★ | lisans | ne alınacak |
|---|---|---|---|
| **OpenMontage** | 53k | AGPL-3.0 | `Documentary Montage` hattının yolu: CLIP indeksli ücretsiz arşivden tematik montaj. Aşama akışı (`research → script → scene_plan → assets → edit → compose`) ve *"director skill"* deseni |
| **MoneyPrinterTurbo** | 118k | MIT | stok arama entegrasyonu; **altyazıyı TTS zaman damgalarından üretme** (GPU'suz); Edge TTS bağlama biçimi |
| **@remotion/captions** | — | MIT | kelime zamanlaması → ekranda altyazı; çözülmüş bir problem |
| **@remotion/transitions** | — | özel | geçiş kataloğu — **referans olarak okunacak**, kod alınmayacak |
| **ffmpeg-analyse-video-skill** | 27 | — | üretilen videoyu **geri okuma**: kare çıkar, görüyle zaman damgalı özet. FAZ-20.13'ün aracı |
| **rrweb** | 2.1.1 | MIT | oturumu olay akışı olarak kaydet → sonsuz yeniden çekim, sıfır maliyet |

⚠ **AGPL notu:** depo private, dağıtım yok, ticari ürün yok — sahibin kararı: *"agpl
bizi bağlamaz."* Kayıt için yazıldı, tartışma kapandı.

## C.5 · Kullanılmayacaklar — ve gerekçesi

| ne | neden |
|---|---|
| Remotion (motor olarak) | React ister; `panorama.ts`in bir yıllık CSS bilgisi taşınamaz. Yalnız MIT parçaları okunacak. |
| Wan 2.2 · HunyuanVideo · LongCat · MiniMax H3 (yerel) | 6 GB VRAM, asgari 14–16 GB |
| Raylight | çok-GPU; referans kurulum 4 × 22 GB |
| Voicebox | Meta ağırlıkları hiç yayımlamadı |
| WhisperX | Türkçe hizalama modeli varsayılanda yok; `faster-whisper` zaten yetiyor |
