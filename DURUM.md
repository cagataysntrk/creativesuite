# DURUM

> Döngünün her turda okuduğu ve yazdığı tek durum dosyası.
> Bağlam sıfırlanırsa **önce burayı oku** (`CLAUDE.md` → "BAĞLAM COMPACT'LENDİYSE").

```yaml
# ── makine-okunur durum bloğu (LOOP§E) ───────────────────────────────────────
aktif_faz: 8
siradaki_adim: FAZ-8-KAPANIS
son_guncelleme: 2026-08-16
bloke: ["2.9:insan", "3.7:insan", "3.8:insan", "3.14:insan", "4.13b:insan", "5.4b:insan", "5.5b:insan", "6.5b:insan", "6.9b:insan", "7.2b:insan", "7.5b:insan", "7.6b:insan", "7.8b:insan", "8.6:insan", "8.8b:insan", "8.3b:teknik"]
deneme_sayaci: {}
son_kanit: "FAZ 7 KAPANDI — iki dogrulama turu, D-79 tavani uygulandi. 2. TUR 1. TURUN KAPATMA IDDIASINI CURUTTU: PUBLISH fiil haritasindaydi ama grep -rn PUBLISH registry/ SIFIR satir veriyordu — hicbir hat cagirmiyordu. AYNI SINIF HATA UC KEZ ve her seferinde BIR SEVIYE YUKARI: D-216 gövde yok → D-222 govde yok → D-224 hat adimi yok. Insan hafizasi uc kez tutamadi; fiil-haritasi kapisi artik IKI soru soruyor (govde bagli mi + cagiran hat var mi), iki yonde ihlal edilip kirmiziya donduruldu, yorum satirlari sayilmiyor. KISIR DONGU KIRILDI: publish defter yoksa duruyordu, defter ancak basarili yayinla olusuyordu → ilk gercek yayin HICBIR ZAMAN mumkun degildi; just defter-baslat acildi (idempotent, bozuk defteri ONARMAZ). YANLIS POZITIF: yineleme anahtari yalniz assets[0].digest idi, ayni kapakla farkli metin ZATEN YAYINDA diye blokluyordu — artik platform+yerlesim+tum varliklar+metin (R-44). Desteklenmeyen platform ciplak TypeError veriyordu → tipli ret. Platform sayfa siniri editoryal tavandan ONCE (350 sayfa max:10 cevabi aliyordu). doktor simdi ZORUNLU (opsiyoneldi, testi yoktu). faz-yollari IKI KEZ kordu: sarilmis satir + 0.A.1 baslik bicimi. durum kapisi artik SAYAC TAZELIGI zorluyor (36/13 yaziyordu, gercek 38/15). SIRADA 8.1: matris modulu hazir, DIKLIK OLCUTU OFAT — tam izgara ogrenme tasarimi DEGIL (3x3x3te 27 render, OFAT 7; Meta kombinasyonu SUNUCUDA kuruyor)."
```

## Neredeyiz

**FAZ 6 ŞARTLI KAPANDI** (D-217). **İki doğrulama turu koştu, 28 bulgunun hepsi kapandı.** Birinci tur 12, ikinci tur 16
bulgu verdi — ikisi de aynı sınıftan: **kod yazılmış, üretim yolunda çağıranı yok.**
İkinci tur ayrıca benim ilk turda açtığım bir gerilemeyi yakaladı (PDF yolunda lexicon
hiç koşmuyordu) ve **kendi kendini onaylayan bir test çiftini** ortaya çıkardı.
**D-79: üçüncü tur AÇILMAZ.** **40 kapı · 15 ihlal kırmızı · 1291 test.**
**FAZ 7 KAPANDI (2026-08-16).** İki tur, 2 blokaj + 8 major + 5 minor; hepsi kapandı
ya da gerekçesiyle reddedildi (D-222 · D-223 · D-224).

> **Kök neden, üçüncü tekrar:** D-182 donmuş planı yazdı ama `uret.mjs` çağırmıyordu ·
> D-190 düğmeyi çizdi ama `onClick` yoktu · şimdi aynı hata **bir seviye yukarıda**:
> `tazeMi`nin çağıranı var (`inspectManifest`) ama `inspectManifest` o veriyi hiç
> görmüyor, çünkü yazan yok. **"Çağıran var mı" tek adım için değil, ZİNCİR için
> sorulmalı:** üretim girişinden kurala kesintisiz yol var mı?

> FAZ 5'in `aac` maddesi de karşılanmadı ve tikle örtülmedi (D-206): ses akışı yok,
> `5.4b`/`5.5b` insan girdisi bekliyor. Video ölçüldü: h264 · yuv420p · 1920×1080.

> ⛔ **ON DÖRT ADIM İNSAN GİRDİSİ BEKLİYOR** — `2.9` · `3.7` · `3.8` · `3.14` · `4.13b` ·
> `5.4b` · `5.5b` · `6.5b` · `6.9b` · `7.2b` · `7.5b` · `7.6b` · `7.8b` · `8.6`.
> Sınıfları `insan` (D-157), o yüzden LOOP§G üçlü kuralına saymazlar: on dördü de plan
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
> | `7.2b` | V-26 | Meta uygulaması + token **ve** HTTP adaptörü (kod da eksik) |
> | `7.5b` | V-27 | uygulama kaydı + dört değişken **ve** OAuth komutu (kod da eksik) |
> | `7.6b` | V-26 | gerçek token → yenileme çağrısı denenebilsin |
> | `7.8b` | V-26 | gerçek token → günlük insight çekimi koşabilsin |
> | `8.6` | V-10 | Türk hukukçu → KVKK metinleri (**LLM'e yazdırılmaz**) |
> | `8.8b` | V-27 | gerçek anahtar → gerçekten döndürülebilsin |

## Tamamlananlar

> **Bu tablo yalnız AKTİF fazı gösterir** (D-85). Önceki fazlar faz dosyalarındaki
> tiklerdedir ve `git log` tek başına yol haritasıdır.
>
> FAZ 0+1: 51 · **FAZ 2: 12/13** · **FAZ 3: 12/15** (şartlı, D-158) · **FAZ 4: 17/17** ·
> **FAZ 5: 8/10** (şartlı, D-206) · **FAZ 6: 10/12** (şartlı, D-217; `6.5b` V-24,
> `6.9b` V-25). Tikler faz dosyalarında.

| Adım | Tarih |
|---|---|
| **FAZ 7 (9/9)** · yayın hattı; iki denetim turu (D-222·223·224) | 2026-08-16 |
| **8.1** · dik varyant matrisi; diklik OFAT'la ölçülüyor (D-225) | 2026-08-16 |
| **8.2** · reklam linter'ı; ikinci şahıs × özellik kesişimi | 2026-08-16 |
| **8.3** · uyum panosu; ifşa kapısı yayın hattına bağlandı | 2026-08-16 |
| **8.4** · haftalık doctor; damga YOK — alarm saati, doğruluk değil | 2026-08-16 |
| **8.5** · proaktif katman; gözlemsiz öneri kurulamıyor, tavan 3 | 2026-08-16 |
| **8.7** · geri yükleme tatbikatı; ÜÇ gerçek kusur buldu | 2026-08-16 |
| **8.8** · rotasyon tablosu kodla senkron; kapı 5 anahtar buldu | 2026-08-16 |
| **8.9** · yerel MCP (D-226 kabul, dar); yükleme bağlı, tek yazma yolu | 2026-08-16 |

## Sıradaki adım

**FAZ 8 KAPANIŞI** (`LOOP§D`). Yedi adım kapandı, ikisi bilinçli olarak insana bloke
(`8.6` KVKK · `8.8b` gerçek rotasyon). Sıradaki iş kapanış protokolü: her ✅ için somut
kanıt, sonra **bağımsız doğrulama agent'ı** — **en fazla İKİ tur** (D-79). Üçüncü tur
açılmaz; ikinci turda bulunmayan minor'dur ve FAZ 9 denetim turlarına düşer.

## Devreden borçlar

QA/bağlam girdisi 0/18 (`2.9` blokajı) · bileşen testi FAZ 9'a · V-19 +%30 görsel
ölçüm · V-24 şelale anahtarları ve ADAPTÖRLERİ (→ 6.5b) ·
V-25 gerçek prospect (→ 6.9b) · V-26 Meta token (→ 7.2b) · V-27 OAuth kaydı (→ 7.5b).

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
