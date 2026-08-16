# DURUM

> Döngünün her turda okuduğu ve yazdığı tek durum dosyası.
> Bağlam sıfırlanırsa **önce burayı oku** (`CLAUDE.md` → "BAĞLAM COMPACT'LENDİYSE").

```yaml
# ── makine-okunur durum bloğu (LOOP§E) ───────────────────────────────────────
aktif_faz: 6
siradaki_adim: 7.1
son_guncelleme: 2026-08-16
bloke: ["2.9:insan", "3.7:insan", "3.8:insan", "3.14:insan", "4.13b:insan", "5.4b:insan", "5.5b:insan", "6.5b:insan", "6.9b:insan"]
deneme_sayaci: {}
son_kanit: "6.9 ZINCIRI KAPANDI, TESLIM 6.9b ye ayrildi. prospectDeckZinciri bes kapiyi SIRAYLA kosuyor ve ILK HATADA duruyor; YENI KURAL YAZMIYOR — her kural kendi sahibinde, burada olan tek sey sira. Sira MALIYET sirasi: tazelik bir tarih karsilastirmasi, lexicon butun belgeyi tariyor; ikisi birden bozuksa TAZELIK konusuyor. UCTAN UCA KANIT tek kosuda: gercek urun cekimi (yerel sunucu, ayni Chromium) + grafik + PDF, zincir 5/5 GECTI, 25862 bayt 1 sayfa. Iki ihlal dogru kapilarda durdu: kaynaksiz sayi → lexicon, 15 gunluk kaynak → tazelik. GERCEK DELIK BULUNDU: lexicon linter inin metin() fonksiyonu GRAFIK BLOGUNU gormuyordu — 6.2 de blok tipini ben ekledim, linter i guncellemedim, switch olmadigi icin derleyici susmustu; Fire oranini %40 dusurduk basligi tamamen kaciyordu. Duzeltildi ve kanitlandi: duzeltme geri alininca 2 test kirmizi. 6.9 un ✅ i GERCEK prospect istiyor — o insan girdisi (V-25), uydurulmus sirket dogruluk kaynagina giren kurgudur. ONCEKI: 6.8 KAPANDI. Urun ekran goruntusu icin YENI BIR BAYRAK degil, DORDUNCU BIR DAYANAK eklendi: product_capture (captureRunId + demoRef ZORUNLU). aiGenerated: true ile birlikte iddia EDILEMIYOR — ikisi birden dogruysa biri yalandir ve sistem hangisi oldugunu bilemez, o yuzden iddia hic KURULMUYOR. Ayni kural iki anda uygulaniyor ama TEK: uretimde assertCompliance, yayinda inspectManifest → fabricated_product_shot. GERCEK CEKIM KANITI: yerel bir urun ayaga kaldirildi ve ayni Chromium ile cekildi — 1200x700 PNG, 13665 bayt, demoRef bagli; sabit bekleme YOK, hazir seciciyle beklendi. Yayin yuklemi testi: gercek cekim true, uretilmis false, kaynaksiz false. Oncesi icin git log ve docs/fazlar/FAZ-6.md."
```

## Neredeyiz

**FAZ 6'DA 9/11 ADIM KAPALI** — deck PDF, grafik/diyagram, LinkedIn dökümanı, prospect
kaydı ve `INGEST` şelalesi ayakta. FAZ 5 şartlı kapalı (D-206; `aac` ses akışı yok,
`5.4b`/`5.5b` blokajı, tikle örtülmedi). **36 kapı · 11 ihlal kırmızı.**

> **Çıkış kriterinin bir maddesi karşılanmadı ve tikle ÖRTÜLMEDİ** (D-206):
> `ffprobe` **aac** doğrulayamıyor — ses akışı yok, çünkü TTS (`5.4b`, V-21) ve ASR
> (`5.5b`, V-22) insan girdisi bekliyor. Video tarafı ölçüldü: h264 · yuv420p ·
> 1920×1080. "İzlendi" kısmı bir insan eylemidir; sistem onu iddia edemez.

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
> **FAZ 4: 17/17** · **FAZ 5: 8/10** (şartlı, D-206). Tikler faz dosyalarında.

| Adım | Tarih |
|---|---|
| **6.1** · Deck IR + `page.pdf()`; metin katmanı korunuyor (D-207) | 2026-08-16 |
| **6.2** · Grafik + diyagram; ECharts ölçülüp reddedildi (D-209) | 2026-08-16 |
| **6.3** · `linkedin-document`; düzleştirme tek motorla (D-211) | 2026-08-16 |
| **6.4** · Prospect = corpus; KVKK silmesi mezar taşı bırakıyor (D-212) | 2026-08-16 |
| **6.5** · `INGEST` şelalesi; tarayıcı yok, karantina + sidecar (D-213) | 2026-08-16 |
| **6.6** · 14 günlük tazelik; `isPublishable` bayat kaynağı bloklıyor | 2026-08-16 |
| **6.7** · Kişiselleştirme tavanı; sayı `KURALLAR.md`'den okunuyor (D-214) | 2026-08-16 |
| **6.8** · Ürün ekranı dördüncü uyum DAYANAĞI; çekim ≠ üretim | 2026-08-16 |
| **6.9** · `prospect-deck` zinciri; beş kapı sırayla, ilk hatada durur | 2026-08-16 |

## Sıradaki adım

**FAZ 6 KAPANIŞ TURU** (LOOP§D) — dokuz adımın dokuzu tikli, ikisi (`6.5b`, `6.9b`)
bilinçli `BLOKE: insan`. Sırada bağımsız doğrulama agent'ı var: her ✅ kriterini faz
dosyasından okuyup kodda gerçekten karşılandığını arayacak, **en fazla iki tur** (D-79).
Ardından **`7.1` — platform spec tablosu kod olarak** (§9.1): her satır `sourceUrl` +
`verifiedAt` taşıyacak ve üç aylık drift denetçisi kurulacak.

## Devreden borçlar

QA/bağlam girdisi 0/18 (`2.9` blokajı) · bileşen testi FAZ 9'a · V-19 +%30 görsel
ölçüm · V-23 LinkedIn döküman sınırı (→ 7.3) · V-24 şelale anahtarları (→ 6.5b) ·
V-25 gerçek prospect (→ 6.9b).

## Bloke adımlar

> Not: golden metrikler bugün SİSTEM fontuyla donduruldu; marka fontu geldiğinde
> (V-02) temel yeniden alınır — bu bir düzeltme, bir blokaj değil (D-144).

**`2.9` — insan onayı bekliyor (D-83).** Yedi corpus kaydı `propose()` ile yazıldı,
`status: draft` indi, retrieval'a görünmüyorlar. Onları `active` yapmak agent'ın işi
değil (R-14). Kullanıcı kayıtları okuyup `just onayla corpus/*/*.md` çalıştırınca adım
kapanır; ardından `just reindex` ve çalıştırma commit'i.

**Okurken dikkat:** `positioning`, `icp`, `offer` kayıtları HİPOTEZ (V-07) — dikey
seçimi üçüncü taraf verisinden çıkarım.

✅ **2026-08-15'te sessiz bir engel kaldırıldı (D-167):** altı kaydın `era_id`si
`era_imalat_2026` yazıyordu, dönemin gerçek adı `imalat-2026`. Onayladığınızda kayıtlar
`active` olacak ama retrieval onları YİNE görmeyecekti — onay işe yaramamış gibi
görünürdü. Ölçüldü: düzeltmeyle onay sonrası **7 kayıt** geliyor, düzeltmesiz **1**.

**`3.7` · `3.8` — V-16.** `sops exec-env` altında `CF_ACCOUNT_ID`+`CF_API_TOKEN` ya da
`FAL_KEY`; `3.8` ayrıca ~$3 gerçek para. Anahtarsız `image.generate` hiçbir sağlayıcıya
çözülmüyor.

**`4.13b` — V-18.** `tailscale` kurulu değil, `TELEGRAM_BOT_TOKEN` yer tutucu. Bot
mantığı ve yüzey sınırı test edilmiş; kalan iş yalnız gerçek erişim.

**`3.14` — `2.9`'a bağlı.** Onaylı corpus olmadan hat `bilgi-sec`te `NO_CONTEXT` ile
duruyor; doğru davranış (R-13), atlatılmıyor. `2.9` açıldığı gün FAZ 3 TAM kapanır.
