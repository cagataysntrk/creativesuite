# DURUM

> Döngünün her turda okuduğu ve yazdığı tek durum dosyası.
> Bağlam sıfırlanırsa **önce burayı oku** (`CLAUDE.md` → "BAĞLAM COMPACT'LENDİYSE").

```yaml
# ── makine-okunur durum bloğu (LOOP§E) ───────────────────────────────────────
aktif_faz: 11
siradaki_adim: 13.1
son_guncelleme: 2026-08-17
bloke: ["2.9:insan", "3.7:insan", "3.8:insan", "3.14:insan", "4.13b:insan", "5.4b:insan", "5.5b:insan", "6.5b:insan", "6.9b:insan", "7.2b:insan", "7.5b:insan", "7.6b:insan", "7.8b:insan", "8.6:insan", "8.8b:insan", "8.3b:teknik"]
deneme_sayaci: {}
son_kanit: "FAZ-12.2 KAPANDI — raster islem dagarcigi ve FAZ-12 BITTI (12.8 haric, BLOKE:karar). Dagarcik IKI oge: keskinlik + duotone. yumusat/derinlik/cam/kabartma/3B YAZILMADI, hicbirinin bugun cagirani yok (D-261). Tuketici AILE: gorselIslemleri AileProfili de, oradan belgeye, oradan render a — zincir kapali. IKIZ KUME SINAVI: ring 0 render a bagimli olamadigi icin ad listesi iki yerde; karsilikli atanabilirlik TIP duzeyinde sinaniyor, ihlal turunda ailede ucuncu ad acildi -> iki ayri derleme hatasi. tipoEfektleri nde bu sinav YOK, borc kayitli. SIRA dagarcik tan cagirandan degil: keskinlik parlaklik ustunde, duotone parlaligi marka eksenine esliyor. Keskinlik SUS DEGIL DUZELTME: model 1024 uretiyor karosel 1080 istiyor; kenar enerjisi 2.04 -> 2.36, hale YOK, cekirdek toplami 1. FAZ-12.8 in Lanczos bagimliliginin cozdugu kaybin buyuk kismi bedava. PALET GARANTISINI DUOTONE TUTUYOR: doygun test gorselinde ortalama dE 12.79 -> 8.19 (-%36); kasten saturate(3.5) zincire sokuldu, duotone ardindan geldigi icin cikti DEGISMEDI. off_palette bu iste YANLIS ENSTRUMAN — dE>5 sayan ayrik metrik surekli duotone rampasinin ara tonlarini hep disarida sayiyor (%46 <-> %45); yanit veren okuma delta_e_2000. 8 test. FAZ-12 de tek acik: 12.8 BLOKE:karar (model agirligi indirme, S16 sinavi)."
```

## Neredeyiz

**FAZ 0–8 kapandı** (5 ve 6 şartlı: D-206 · D-217).
**43 kapı · 22 ihlal kırmızı · 1366 test.**
Faz tikleri faz dosyalarında; `git log` tek başına yol haritasıdır (D-85).

> **Kök neden, dört tekrar:** kod yazılır, üretim yolunda çağıranı olmaz — D-182 ·
> D-190 · D-224 · D-250. **"Çağıran var mı" ZİNCİR için sorulur**, tek adım için değil.
> FAZ 10'un mayını farklı: kod ÇAĞRILIYOR ama kimse doğruluğunu ölçmüyor.

> ⛔ **ON DÖRT ADIM İNSAN GİRDİSİ BEKLİYOR** — `2.9` · `3.7` · `3.8` · `3.14` · `4.13b` ·
> `5.4b` · `5.5b` · `6.5b` · `6.9b` · `7.2b` · `7.5b` · `7.6b` · `7.8b` · `8.6`.
> Sınıfları `insan` (D-157), o yüzden LOOP§G üçlü kuralına saymazlar: on dördü de plan
> hatası değil, planın `V-nn` olarak önceden kaydettiği dış bağımlılıklar. Döngü
> bağımsız adımlarla devam ediyor, ama bu ilan her turda burada durur.
>
> | Adım | Bekleyen | | Adım | Bekleyen |
> |---|---|---|---|---|
> | `2.9` | `just onayla corpus/*/*.md` | | `6.5b` | V-24 şelale anahtarları |
> | `3.7` `3.8` | V-16 anahtar (+~$3) | | `6.9b` | V-25 gerçek prospect |
> | `3.14` | `2.9`'a bağlı | | `7.2b` `7.6b` `7.8b` | V-26 Meta token |
> | `4.13b` | V-18 Tailscale+Telegram | | `7.5b` `8.8b` | V-27 OAuth kaydı |
> | `5.4b` `5.5b` | V-21/V-22 ses+altyazı | | `8.6` | V-10 hukukçu |

## Tamamlananlar

> **Bu tablo yalnız AKTİF fazı gösterir** (D-85). Önceki fazlar faz dosyalarındaki
> tiklerdedir ve `git log` tek başına yol haritasıdır.
>
> FAZ 0+1: 51 · **FAZ 2: 12/13** · **FAZ 3: 12/15** (şartlı, D-158) · **FAZ 4: 17/17** ·
> **FAZ 5: 8/10** (şartlı, D-206) · **FAZ 6: 10/12** (şartlı, D-217; `6.5b` V-24,
> `6.9b` V-25). Tikler faz dosyalarında.

| Adım | Tarih |
|---|---|
| **11.1** · akış diyagramı fotoğrafın yerine | 2026-08-17 |
| **11.2** · geometrik süsleme dağarcığı, yoğunluk parametre | 2026-08-17 |
| **11.3** · 20 ikonluk kapalı dağarcık, içerikten seçilen | 2026-08-17 |
| **14.1** · hikâye yayı halka 0'da; kelime tavanı artık TEK kaynak | 2026-08-17 |
| **14.2** · tasarım planı gerekçeli, deftere adım çıktısı olarak giriyor | 2026-08-17 |
| **14.3** · taban önce model sonra; görsel üretimi KOŞULLU (D-264) | 2026-08-17 |
| **14.4** · plan↔çıktı uyumu; üç katman ayrı, slayt digest'i defterde | 2026-08-17 |
| **12.6** · marka işareti: harf formu, üçüncü yaklaşımda öncül değişti | 2026-08-17 |
| **12.4** · panorama: akan şey zemin değil süsleme; İKİNCİ aile doğdu | 2026-08-17 |
| **12.7** · kompozisyon ailesi; garanti ailede YOK, zorlama yoklukla | 2026-08-17 |
| **12.5** · karşılaştırma bloğu; halka/KPI/ilerleme R-32 arkasında | 2026-08-17 |
| **12.1** · tipografi efektleri; vurgu şeridi — slayt içi hiyerarşi | 2026-08-17 |
| **12.3** · Türkçe heceleme bağlandı; kod vardı, üretim hiç çağırmıyordu | 2026-08-17 |
| **11.7** · duotone: renk tutarlılığı yapısal, prompt'a yalvarma bitti | 2026-08-17 |
| **11.4** · fotoğraf yuvaları; yuvasız görsel reddediliyor | 2026-08-17 |
| **11.8** · grain tavanlı; vinyet ölçülerek kapalı bırakıldı | 2026-08-17 |
| **14.5** · görsel adımları opsiyonel; atlanan adım `skipped`, ret defterde | 2026-08-17 |

## Sıradaki adım

**FAZ 11 — GÖRSELLİK DİLİ** (D-261) ve **FAZ 14 — OMURGA** birlikte yürüdü. FAZ-10.7'de
bulduğum görsel kusurların çoğu tek kökten geliyordu: **oraya ait olmayan bir öge.**
Fotoğrafı dört kez yamadım, dördü de belirtiye yamaydı; doğru soru *"bu fotoğraf neden
burada?"* idi ve cevabı: bağlı olan tek görsel yol oydu.

**FAZ-14 kapandı** (beş adım, bağımsız doğrulama 1. turu koşuldu ve bulguları kapatıldı):
metin → kompozit (taban + tasarım planı) → brief (yuvayı görerek) → görsel (koşullu) →
yuva-doldur → render. Görsel artık gireceği slaydı **görerek** üretiliyor.

**SIRADAKİ 11.4** — fotoğraf yuvaları (maske/alan). Sonra 11.5–11.10 → 12 → 13.
⚠ **Kabul sayacı 0/20.** Yeni hat dört gerçek koşuda doğrulandı: 3 kusur bulundu ve
kapatıldı (boş prompt atlama sayılmıyordu · atlanan adım maliyet yazmıyordu · yay işlevi
slayt sırasından türetiliyordu). Dördüncü koşu tüm metrikleri geçti ama **bakınca diyagram
çerçeveden taşıyordu** — akış dikeye çevrildi, `list` düzeni ortalandı. Render değişti,
sayaç yine 0.

⚠ KARARLAR.md 561/600 — kapanmış kararlar `docs/kararlar/ARSIV-2026.md`'ye devredilmeli.

⚠ **FAZ-10.7 kabul koşusu FAZ 11 dilinin üstünde tekrarlanacak** — görsellik değişti,
eski koşular güncel çıktıyı temsil etmiyor.

## Devreden borçlar

QA/bağlam 0/18 (`2.9`) · bileşen testi FAZ 9'a · V-19 · V-24 (→6.5b) · V-25 (→6.9b) ·
V-26 (→7.2b) · V-27 (→7.5b) · `3.12b` R2 · varlıklar indekste yok · önizleme yok.

## Bloke adımlar

> Not: golden metrikler SİSTEM fontuyla donduruldu; marka fontu gelince (V-02) temel
> yeniden alınır — düzeltme, blokaj değil (D-144).

**`2.9` — insan onayı bekliyor (D-83).** Yedi kayıt `draft` indi, retrieval'a görünmüyor.
`active` yapmak agent'ın işi değil (R-14): `just onayla corpus/*/*.md` → `just reindex`.

**Dikkat:** `positioning`/`icp`/`offer` HİPOTEZ (V-07) — dikey seçimi çıkarım.

✅ **Sessiz bir engel kaldırıldı (D-167):** altı kaydın `era_id`si yanlıştı; ölçüldü,
düzeltmeyle 7 kayıt geliyor, düzeltmesiz 1.

**`3.7` · `3.8` — V-16.** `CF_ACCOUNT_ID`+`CF_API_TOKEN` ya da `FAL_KEY` (+~$3).
Anahtarsız `image.generate` hiçbir sağlayıcıya çözülmüyor.

**`4.13b` — V-18.** `tailscale` yok, token yer tutucu; mantık test edilmiş.
**`3.14` — `2.9`'a bağlı.** Onaylı corpus olmadan `bilgi-sec` `NO_CONTEXT` ile duruyor
(R-13, atlatılmıyor). `2.9` açıldığı gün FAZ 3 TAM kapanır.
