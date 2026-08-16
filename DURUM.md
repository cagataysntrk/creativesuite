# DURUM

> Döngünün her turda okuduğu ve yazdığı tek durum dosyası.
> Bağlam sıfırlanırsa **önce burayı oku** (`CLAUDE.md` → "BAĞLAM COMPACT'LENDİYSE").

```yaml
# ── makine-okunur durum bloğu (LOOP§E) ───────────────────────────────────────
aktif_faz: 6
siradaki_adim: 6.8
son_guncelleme: 2026-08-16
bloke: ["2.9:insan", "3.7:insan", "3.8:insan", "3.14:insan", "4.13b:insan", "5.4b:insan", "5.5b:insan", "6.5b:insan"]
deneme_sayaci: {}
son_kanit: "6.7 KAPANDI ve KARARLAR.md ARSIVLENDI (591 → 306; FAZ 4-5 in 14 karari docs/kararlar/ARSIV-2026.md e devredildi, citations yesil). Tavan sayisi KODA YAZILMIYOR, KURALLAR.md R-36 dan OKUNUYOR (D-214): kisisellestirme kapisi iki degeri karsilastiriyor, ayrisirlarsa kirmizi. Yani tavani degistirmenin tek yolu once kural kitabidir (R-74). Iki ihlal bicimi de kirmizi dondu: sabiti 6 yap (AYRISMIS) · ikinci bir tanim ekle (tum kaynak taraniyor, sabit dosya listesi DEGIL — ilk surumum uc dosya adi sayiyordu ve biri ayni turda tasininca kapi ENOENT ile coktu). Kural once KURALLAR.md e yazildi ve AYRI docs(docs) commit i aldi (R-76). Kapi yayin yuklemine BAGLI: isPublishable alti alanda false. Siralama gerekceli — kaniti guclu olan kaliyor, zayif kanit gucluyu eleyemiyor. Batarya 11 kural kiriyor. ONCEKI: 6.6 KAPANDI. 14 gunluk tazelik kapisi YAYIN YUKLEMINE BAGLI — asil sinav buydu: fonksiyonun dogru cevap vermesi yetmez, cagiran olmasi gerekir (D-182 dersi). inspectManifest artik stale_source kusuru uretiyor ve isPublishable 15 gunluk kaynakta false donuyor. Karsilastirma SAAT OKUMADAN yapiliyor: olcu calistirmanin kendi createdAt i, yani replay yillar sonra da ayni cevabi veriyor. Gelecek tarihli kaynak da reddediliyor — saati bozuk bir makineden gelen sidecar her zaman taze bir kaynak yaratirdi. FIKSTUR DERSI TEKRARLANDI: ilk bagllanma testim kisa SHA ve maliyetsiz metered adim tasiyordu, iki alakasiz kusur uretti ve test bagllanmadi dedi — oysa bagllanmisti; yanlis fikstur yanlis teshis. Oncesi icin git log ve docs/fazlar/FAZ-6.md."
```

## Neredeyiz

**FAZ 6'DA 7/10 ADIM KAPALI** — deck PDF, grafik/diyagram, LinkedIn dökümanı, prospect
kaydı ve `INGEST` şelalesi ayakta. FAZ 5 şartlı kapalı (D-206; `aac` ses akışı yok,
`5.4b`/`5.5b` blokajı, tikle örtülmedi). **36 kapı · 11 ihlal kırmızı.**

> **Çıkış kriterinin bir maddesi karşılanmadı ve tikle ÖRTÜLMEDİ** (D-206):
> `ffprobe` **aac** doğrulayamıyor — ses akışı yok, çünkü TTS (`5.4b`, V-21) ve ASR
> (`5.5b`, V-22) insan girdisi bekliyor. Video tarafı ölçüldü: h264 · yuv420p ·
> 1920×1080. "İzlendi" kısmı bir insan eylemidir; sistem onu iddia edemez.

> ⛔ **SEKİZ ADIM İNSAN GİRDİSİ BEKLİYOR** — `2.9` · `3.7` · `3.8` · `3.14` · `4.13b` ·
> `5.4b` · `5.5b` · `6.5b`.
> Sınıfları `insan` (D-157), o yüzden LOOP§G üçlü kuralına saymazlar: sekizi de plan
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

## Sıradaki adım

**`6.8` — Gerçek ürün ekran görüntüleri** (§10, §11.4 · R-32, R-33 · FAZ-5.6'ya bağlı).
Ürün ekran görüntüleri **gerçek Playwright çekimi**, asla üretilmiş. Adı geçen bir
prospect'e giden deck'te uydurma bir dashboard **olgusal bir iddiadır**: ürünün
yapmadığı bir şeyi yaptığını söyler ve ilk demoda çöker. ✅ deck'teki her görüntü
`source_run_id` taşıyıp gerçek bir çekime bağlanmalı. 🧪 üretilmiş bir görseli ürün
ekranı olarak koy → uyum kapısı reddetmeli.

## Devreden borçlar

QA/bağlam girdisi 0/18 (`2.9` blokajı) · bileşen testi FAZ 9'a · V-19 +%30 görsel
ölçüm · V-23 LinkedIn döküman sınırı (→ 7.3) · V-24 şelale anahtarları (→ 6.5b).

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
