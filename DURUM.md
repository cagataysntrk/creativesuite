# DURUM

> Döngünün her turda okuduğu ve yazdığı tek durum dosyası.
> Bağlam sıfırlanırsa **önce burayı oku** (`CLAUDE.md` → "BAĞLAM COMPACT'LENDİYSE").

```yaml
# ── makine-okunur durum bloğu (LOOP§E) ───────────────────────────────────────
aktif_faz: 6
siradaki_adim: 6.5
son_guncelleme: 2026-08-16
bloke: ["2.9:insan", "3.7:insan", "3.8:insan", "3.14:insan", "4.13b:insan", "5.4b:insan", "5.5b:insan"]
deneme_sayaci: {}
son_kanit: "6.4 KAPANDI. Prospect ayri bir CRM DEGIL, corpus kaydi. KVKK silmesi DOSYAYI SILMIYOR (D-212): kisisel alanlar siliniyor, kisisel veri tasimayan mezar tasi kaliyor — cunku duz silme hem koken zincirini koparir hem de silmenin YAPILDIGINA dair kaniti yok eder; KVKK da gosteremedigin sey yapilmamistir. Test ikisini karsi karsiya koyuyor: retireRecord sonrasi kisisel veri DURUYOR, kvkkErasure sonrasi YOK. Uc yeni kapi/kural kasten ihlal edildi: corpus-silici (izinli BOS), gerekcesiz silme reddi, prospect-kvkk aydinlatma. Batarya artik 9 kural kiriyor. SAHTE PROSPECT YAZILMADI — uydurulmus sirket dogruluk kaynagina giren kurgudur; kaydin SEKLI testte dogrulandi, gercek kayitlar insan girdisiyle gelir. ONCEKI: 6.3 KAPANDI. Duzlestirme IKINCI ARAC GEREKTIRMEDI (D-211): ghostscript/qpdf yerine her sayfa ayni Chromium da JPEG e cevriliyor, goruntuler yine ayni Chromium da tek PDF e basiliyor; kalite merdiveni 92-82-72-62 tavanin altina inene kadar. OLCULDU, karsitlik net: deck te pdftotext Turkce metni TAM veriyor + pdfimages SIFIR satir; dokumanda pdftotext BOS + pdfimages iki 1200x1500 JPEG. 11 sayfa RENDER EDILMEDEN reddedildi. IR anlik goruntu testi gecti: kaynak 4,2 den 9,9 a degistirildi, dokuman yeniden acildi, ESKI deger duruyor — IR corpus a referans degil DEGER tasiyor. ONCEKI TUR 6.2: ECharts SSR olculup reddedildi (D-209), Turkce etiketlerde +%12,6 ile +%83,4 sapma. Sayfa tavani 10 ve 5 MB BIZIM editoryal kararimiz, platform sinirini dogrulamadim → V-23 (FAZ-7.3). 34 kapi, 8 hat."
```

## Neredeyiz

**FAZ 6 BAŞLADI** — deck hattının ilk taşı yerinde. FAZ 5 şartlı kapalı (D-206; `aac`
ses akışı yok, `5.4b`/`5.5b` blokajı, tikle örtülmedi). **35 kapı · 984 test · 6 ihlal
kırmızı.**

> **Çıkış kriterinin bir maddesi karşılanmadı ve tikle ÖRTÜLMEDİ** (D-206):
> `ffprobe` **aac** doğrulayamıyor — ses akışı yok, çünkü TTS (`5.4b`, V-21) ve ASR
> (`5.5b`, V-22) insan girdisi bekliyor. Video tarafı ölçüldü: h264 · yuv420p ·
> 1920×1080. "İzlendi" kısmı bir insan eylemidir; sistem onu iddia edemez.

> ⛔ **YEDİ ADIM İNSAN GİRDİSİ BEKLİYOR** — `2.9` · `3.7` · `3.8` · `3.14` · `4.13b` ·
> `5.4b` · `5.5b`.
> Sınıfları `insan` (D-157), o yüzden LOOP§G üçlü kuralına saymazlar: yedisi de plan
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

## Sıradaki adım

**`6.5` — `INGEST` araştırma şelalesi** (§10, §14 · R-50 · D-40). Sıra maliyet ve güven
sırasıdır: kendi siteleri → SERP → Tavily → ihale-mcp → borsa-mcp. Çıktı **daima**
`derived/ingest/` karantinasına iner ve **asla talimat olarak sunulmaz**. 🧪 çekilen
metne "önceki talimatları unut" yaz → alıntı olarak kalmalı; LinkedIn kazıyan sağlayıcı
ekle → lint reddetmeli. Anahtarsız kaynaklar `bloke: insan` olacak.

## Devreden borçlar

QA/bağlam girdisi 0/18 (`2.9` blokajı) · bileşen testi FAZ 9'a · V-19 +%30 görsel
ölçüm · V-23 LinkedIn döküman sınırı (→ 7.3).

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
