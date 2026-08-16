# DURUM

> Döngünün her turda okuduğu ve yazdığı tek durum dosyası.
> Bağlam sıfırlanırsa **önce burayı oku** (`CLAUDE.md` → "BAĞLAM COMPACT'LENDİYSE").

```yaml
# ── makine-okunur durum bloğu (LOOP§E) ───────────────────────────────────────
aktif_faz: 7
siradaki_adim: 7.2
son_guncelleme: 2026-08-16
bloke: ["2.9:insan", "3.7:insan", "3.8:insan", "3.14:insan", "4.13b:insan", "5.4b:insan", "5.5b:insan", "6.5b:insan", "6.9b:insan"]
deneme_sayaci: {}
son_kanit: "FAZ 6 DENETIMININ 12 BULGUSU DA KAPANDI (D-216). Hepsi ayni siniftandi: kod yazilmis, uretim yolunda cagirani yok. RENDER govdesi artik format: pdf ve flatten okuyor (%PDF- olculdu, bayt tavani asiminda REDDEDIYOR) · INGEST fiil govdesi yazildi ve fiil haritasina girdi · zincir VALIDATE te kosuyor (bayat kaynak, uretilmis ekran, altinci alan hatti durduruyor) · runVerb uc cagri yerine de baglandi, ingestGate artik uretimde kosuyor · captureProductShot RENDER da, role: product_screenshot artik productShots in KAYNAGI · diagram blok tipi belge modeline girdi ve okuyan HER yer guncellendi · just kvkk-sil insan girisi acildi ve gercek bir kayit uzerinde ucdan uca kosturuldu. BULGU 5 IN ASIL SEBEBI ozetle() BEYAZ LISTESIYDI: govdeler anahtarlari uretse bile manifest ozeti onlari ELIYORDU. ARADA GERCEK BIR TASARIM CELISKISI CIKTI: writeManifest politika kusurlu manifesti HIC yazmiyordu, yani kurali cigneyen kosu defterden tamamen kayboluyordu — ihlalin kaydi olmamasi ihlalden kotudur; kusurlar bicim/politika diye ayrildi. Ayrica blok-css kapisi yazildi (kendi ilk surumu import satirini kullanim saniyordu) ve batarya YAMA moduyla genisletildi. 1113 test, 36 kapi, 12 ihlal kirmizi."
```

## Neredeyiz

**FAZ 6'nın 12 denetim bulgusu KAPANDI** (D-216). Doğrulama agent'ı fazın çekirdek
iddiasını çürütmüştü: kod yazılmış, üretim yolunda çağıranı yoktu. Şimdi zincir
kesintisiz — adım çıktısı → manifest → dedektör → yayın blokajı, uçtan uca ölçüldü.
**İkinci doğrulama turu sırada** (D-79: üçüncü tur açılmaz). **36 kapı · 12 ihlal
kırmızı · 1113 test.**

> **Kök neden, üçüncü tekrar:** D-182 donmuş planı yazdı ama `uret.mjs` çağırmıyordu ·
> D-190 düğmeyi çizdi ama `onClick` yoktu · şimdi aynı hata **bir seviye yukarıda**:
> `tazeMi`nin çağıranı var (`inspectManifest`) ama `inspectManifest` o veriyi hiç
> görmüyor, çünkü yazan yok. **"Çağıran var mı" tek adım için değil, ZİNCİR için
> sorulmalı:** üretim girişinden kurala kesintisiz yol var mı?

> FAZ 5'in `aac` maddesi de karşılanmadı ve tikle örtülmedi (D-206): ses akışı yok,
> `5.4b`/`5.5b` insan girdisi bekliyor. Video ölçüldü: h264 · yuv420p · 1920×1080.

> ⛔ **DOKUZ ADIM İNSAN GİRDİSİ BEKLİYOR** — `2.9` · `3.7` · `3.8` · `3.14` · `4.13b` ·
> `5.4b` · `5.5b` · `6.5b` · `6.9b`.
> Sınıfları `insan` (D-157), o yüzden LOOP§G üçlü kuralına saymazlar: dokuzu da plan
> hatası değil, planın `V-nn` olarak önceden kaydettiği dış bağımlılıklar. Döngü
> bağımsız adımlarla devam ediyor, ama bu ilan her turda burada durur.
>
> | Adım | Bekleyen | Ne gerekiyor |
> |---|---|---|
> | `2.9` | insan onayı | `just onayla corpus/*/*.md` → 7 kayıt `draft` |
> | `3.7` | V-16 | `CF_ACCOUNT_ID`+`CF_API_TOKEN` ya da `FAL_KEY` |
> | `3.8` | V-16 | aynı + ~$3 gerçek para |
> | `3.14` | `2.9` | onaylı corpus olmadan `NO_CONTEXT` |
> | `4.13b` | V-18 | Tailscale kurulumu + gerçek Telegram token'ı |
> | `5.4b` | V-21 | `chatterbox` ağırlıkları (~2 GB) + `GEMINI_API_KEY` + `ELEVENLABS_API_KEY` |
> | `5.5b` | V-22 | `whisper.cpp` kurulumu ya da gerçek `GROQ_API_KEY` |
> | `6.5b` | V-24 | Bright Data · Tavily · ihale-mcp · borsa-mcp anahtarları |
> | `6.9b` | V-25 | gerçek bir prospect kaydı (+ `2.9` onayı) |

## Tamamlananlar

> **Bu tablo yalnız AKTİF fazı gösterir** (D-85). Önceki fazlar faz dosyalarındaki
> tiklerdedir ve `git log` tek başına yol haritasıdır.
>
> FAZ 0+1: 51 adım · **FAZ 2: 12/13** · **FAZ 3: 12/15** (şartlı, D-158) ·
> **FAZ 4: 17/17** · **FAZ 5: 8/10** (şartlı, D-206) · **FAZ 6: 9/11** (şartlı;
> `6.5b` V-24, `6.9b` V-25). Tikler faz dosyalarında.

| Adım | Tarih |
|---|---|
| **6.1** · deck PDF; metin katmanı korunuyor (D-207) | 2026-08-16 |
| **6.2** · grafik + diyagram; ECharts reddedildi (D-209) | 2026-08-16 |
| **6.3** · LinkedIn dökümanı; düzleştirme tek motorla (D-211) | 2026-08-16 |
| **6.4** · prospect = corpus; KVKK mezar taşı (D-212) | 2026-08-16 |
| **6.5** · `INGEST` şelalesi; tarayıcı yok (D-213) | 2026-08-16 |
| **6.6** · 14 günlük tazelik kapısı | 2026-08-16 |
| **6.7** · kişiselleştirme tavanı; sayı kural kitabından (D-214) | 2026-08-16 |
| **6.8** · ürün ekranı dördüncü uyum dayanağı | 2026-08-16 |
| **6.9** · `prospect-deck` zinciri; beş kapı sırayla | 2026-08-16 |
| **6.10** · denetimin 12 bulgusu üretim yoluna bağlandı (D-216) | 2026-08-16 |
| **7.1** · spec drift denetçisi; güvenli alan ayrı (D-215) | 2026-08-16 |

## Sıradaki adım

**İKİNCİ DOĞRULAMA TURU** (LOOP§D · D-79) — 12 bulgunun hepsi kapandı, agent yeniden
koşacak. Temiz derse FAZ 6 kapanır; bulguları varsa kapatılır ve **üçüncü tur açılmaz**.

Ardından **`7.2` — Meta adaptörü** (§9.2 · R-46): IG feed/carousel/Reels/Stories +
Threads. `content_publishing_limit` **her yayından önce** sorgulanır; token yenileme işi
**ilk gün** kurulur — Meta uzun ömürlü token 60 günde ölür ve yenilemenin başarısızlığı
sessiz değil **bloklayıcı** olmalıdır.

## Devreden borçlar

QA/bağlam girdisi 0/18 (`2.9` blokajı) · bileşen testi FAZ 9'a · V-19 +%30 görsel
ölçüm · V-23 LinkedIn döküman sınırı (→ 7.3) · V-24 şelale anahtarları (→ 6.5b) ·
V-25 gerçek prospect (→ 6.9b).

## Bloke adımlar

> Not: golden metrikler bugün SİSTEM fontuyla donduruldu; marka fontu geldiğinde
> (V-02) temel yeniden alınır — bu bir düzeltme, bir blokaj değil (D-144).

**`2.9` — insan onayı bekliyor (D-83).** Yedi kayıt `draft` indi, retrieval'a görünmüyor.
`active` yapmak agent'ın işi değil (R-14): `just onayla corpus/*/*.md` → `just reindex`.

**Okurken dikkat:** `positioning`, `icp`, `offer` kayıtları HİPOTEZ (V-07) — dikey
seçimi üçüncü taraf verisinden çıkarım.

✅ **Sessiz bir engel kaldırıldı (D-167):** altı kaydın `era_id`si yanlıştı; onay işe
yaramamış görünecekti. Ölçüldü: düzeltmeyle 7 kayıt geliyor, düzeltmesiz 1.

**`3.7` · `3.8` — V-16.** `CF_ACCOUNT_ID`+`CF_API_TOKEN` ya da `FAL_KEY`; `3.8` ayrıca
~$3 gerçek para. Anahtarsız `image.generate` hiçbir sağlayıcıya çözülmüyor.

**`4.13b` — V-18.** `tailscale` yok, `TELEGRAM_BOT_TOKEN` yer tutucu; mantık test edilmiş.

**`3.14` — `2.9`'a bağlı.** Onaylı corpus olmadan hat `bilgi-sec`te `NO_CONTEXT` ile
duruyor; doğru davranış (R-13), atlatılmıyor. `2.9` açıldığı gün FAZ 3 TAM kapanır.
