# DURUM

> Döngünün her turda okuduğu ve yazdığı tek durum dosyası.
> Bağlam sıfırlanırsa **önce burayı oku** (`CLAUDE.md` → "BAĞLAM COMPACT'LENDİYSE").

```yaml
# ── makine-okunur durum bloğu (LOOP§E) ───────────────────────────────────────
aktif_faz: 19
siradaki_adim: 19.10
son_guncelleme: 2026-08-26
bloke: ["2.9:insan", "3.7:insan", "3.8:insan", "3.14:insan", "4.13b:insan", "5.4b:insan", "5.5b:insan", "6.5b:insan", "6.9b:insan", "7.2b:insan", "7.5b:insan", "7.6b:insan", "7.8b:insan", "8.6:insan", "8.8b:insan", "11.5:insan", "11.6:insan", "11.9:insan", "12.8:insan", "13.3:insan", "18.18:insan", "8.3b:teknik"]
deneme_sayaci: {}
son_kanit: "ON URETIM PANELDE, SAHIBININ INCELEMESINI BEKLIYOR. Onceki turun butun varliklari KARANTINAYA alindi (424 + 10 mukerrer), bekleyen 40 onay gerekcesiyle kapatildi, sonra on sablonun onu da SIFIRDAN uretildi: 43 slayt, hepsi tasarim-onayi kapisinda. Hicbir sey SILINMEDI (Yasa 10/11): byte'lar derived/karantina'da, defterler diskte, kararlar gerekceli. ⛔ SAHIBIN DURAN TALIMATLARI: (1) YAYIN YOK — yayinla adimina girilmez. (2) SABLONLARA DOKUNMA, o is BITTI; simdi uretim ve panel test ediliyor. (3) Kapilar OPT-IN oldu (SUITE_KAPILAR=1) cunku her commit dakikalar aliyordu; tests kapisi fast'tan all'a gecti. Kapilar silinmedi, just check/verify ile kosuyor. URETIM YOLU: uret-bir.sh <sablon> <konu> (job tmp) ya da panelden Uret ekrani; ikisi de metin-onayi kapisinda durur, onay + /api/kosu/<id>/surdur ile tamamlanir. BULUNAN VE KAPATILAN DORT KOK KUSUR: (a) sema SEKLI veriyordu ANLAMI vermiyordu — harf butcesi, govde butcesi, tahmin alaninin anlami ve pano oge sayisi isteme yazilmiyordu; editoryal ve alinti bu yuzden HIC uretemiyordu. (b) SABIT YUZDE degisken metni tasiyamaz — alinti'nin aksan alani %52'de sabitti, uzun baslikta knockout metin kagitta kayboluyordu; derinlik artik punto oturduktan SONRA olculup basligla govdenin ARASINA kilitleniyor. (c) 'kesildi mi' sorusunun SAYISI yoktu — model doku uretince rembg kesemiyor ve slayta KOSELI dikdortgen dusuyor; kesme betigi artik saydam payi olcup disari veriyor (gercek nesne %41,4 · kesilmemis kare %0,0). (d) PANELDE SABLON SECIMI SESSIZCE YOK SAYILIYORDU: RunLauncher'in useCallback bagimlilik listesinde sablon yoktu, isteğe hep '' gidiyordu — panelden baslatilan HER kosuda sablonu hat kendi seciyordu. ACIK KALAN: sahibin 4. maddesi (acik kaynak web gorselleri secenegi) HIC YAPILMADI. Sahibi on uretime tek tek bakip madde madde geri bildirim verecek. TUZAKLAR (hepsi bu turda bedel odetti): sablon degismezinin icindeki yoruma ters tirnak R-98 15 kez · yoruma KESME ISARETI koymak denetim-tavani tarayicisini bozuyor · puntoOlcumu icinde getBoundingClientRect YASAK (kendini olcen sinama) · apps/ui TARAYICIDA kosar, node:fs ice aktaramaz ve registry'yi kendi cozemez · git add -A derived/runs'u gelistirme commit'ine karistirir (D-156) · commit kapsami acik listeden (uretim gecerli DEGIL) · konu satiri 72 karakter · serit araclari dist'ten cizer, kaynak degisince once tsc -b. ALET YALANLARI: bu turda olcum aleti 20+ kez yalan soyledi; UC kez 'panel bozuk' diye YANLIS teshis koydum (kayitta BAYAT satir arayarak). Bir kusur bildirmeden once aletin kendisini sina."

```

## Neredeyiz

**FAZ 0–8 kapandı** (5 ve 6 şartlı: D-206 · D-217).
**52 kapı · 24 ihlal kırmızı · 898 test.**
Faz tikleri faz dosyalarında; `git log` tek başına yol haritasıdır (D-85).

> **Kök neden, ON tekrar:** kod yazılır, üretim yolunda çağıranı olmaz — D-182 · D-190 ·
> D-224 · D-250 · D-261 · **D-270 (mimarinin tamamı)**. Zincir için sorulur, adım için değil.
> ⛔ **YİRMİ BİR ADIM İNSAN GİRDİSİ BEKLİYOR** — `2.9` `3.7` `3.8` `3.14` `4.13b` `5.4b`
> `5.5b` `6.5b` `6.9b` `7.2b` `7.5b` `7.6b` `7.8b` `8.6` `8.8b` `11.5` `11.6` `11.9`
> `12.8` `13.3` `18.18`. Sınıfı `insan` (D-157): plan hatası değil dış bağımlılık.
> ⚠ ⚠ **FAZ 19 = TASARIM FAZI, belge NİHAİ HALİNDE** (`docs/fazlar/FAZ-19.md`, tavanda):
> talepler · dört denetimin yargısı · tanı · **on şablon on tema matrisi** · on beş adım. **Bağlam sıfırlanırsa ÖNCE orayı oku.**
> ⚠ **İki referans:** `docs/referans/seamless-arastirma-2026-08.md` (**985+ = AŞAMA 2
> REÇETE**) · `docs/referans/tasarim-denetimi-2026-08.md`. ⚠ ⚠ **TUZAK:** o dosyada İKİ
> ayrı `A`/`B`/`C` var — RAPOR 2'nin `B`si RENK, **AŞAMA 2'nin `B`si ŞABLON ŞABLON
> REÇETE.** "Reçetenin B'si" hep ikincisidir.
> ⚠ **SIRADAKİ İŞ 19.8 — GÖRSEL DİLİ VE YÜZEY ZANAATI.** "Kutu değil yüzey" altı kuralı: `border-radius` 0 ya da ≥28 px (4-12 px tam olarak "bootstrap kartı" bandı) · saf renk yok (taban + soft-light gren + 1 px iç ışık) · görsel kesim taşıyıcısı.
> ⚠ **YAYIN YOK.** Degrade yasağının kapsamı değişti: optik degrade serbest.

## Tamamlananlar

> **Yalnız AKTİF faz** (D-85); öncekiler faz dosyalarındaki tiklerde. FAZ 0+1: 51 ·
> FAZ 2: 12/13 · FAZ 3: 12/15 (D-158) · FAZ 4: 17/17 · FAZ 5: 8/10 (D-206) ·
> FAZ 6: 10/12 (D-217) · FAZ 15: 12/14 (katalog merkezli üretim kapandı).

| Adım | Tarih |
|---|---|
| **16.1** · metin de taşınıyor, ölçekleniyor, siliniyor — sınırlı pay, mutlak konum DEĞİL | 2026-08-18 |
| **16.4** · `SKILLS.md` + iki beceri dosyası; sıfır bağlamla tek komut | 2026-08-18 |
| **16.5** · `just setup` üretim önkoşullarını da sayıyor; eksik ADIYLA, çıkış kodu 1 | 2026-08-18 |
| **16.2** · müfettiş paneli: tipografi, kart, belge, seçili öge — hepsi canlı ve dosyaya yazıyor | 2026-08-18 |
| **16.3** · kendi görselini koy; şablona sabit fotoğraf REDDEDİLİYOR, üretilen ezilmiyor | 2026-08-18 |
| **16.6** · şablon çeşitliliği: son üç koşuda kullanılan eleniyor, geçmiş PLANA donuyor | 2026-08-18 |
| **16.7** · ritim MEKANİK kural oldu; gerçek koşuda ilk kez `akan-alan` seçildi | 2026-08-18 |
| **16.8** · ritim uyumu ölçülüp DEFTERE yazılıyor; beyaz liste altıncı kez alan eledi | 2026-08-18 |
| **16.9** · `defter-anahtarlari` kapısı; on alan daha sessizce eleniyormuş, yedisi kurtarıldı | 2026-08-18 |
| **16.10** · geri/ileri YIĞINI (tavan 50) + Ctrl+Z; düğme derinliği gösteriyor | 2026-08-18 |
| **17.1** · metin ve tasarım kapıları hatta; `just onay --kapi` ile tek kapı onaylanıyor | 2026-08-18 |
| **17.2** · komuta merkezi: görünür nav, koşu DETAYI (metin+slayt+kusur+onay), tıklama canlı | 2026-08-18 |
| **17.3** · yayın anı bir KARAR: hat ölçümden saat ÖNERİR, ölçüm yoksa susar; `PUBLISH` seçimsiz koşmuyor (D-314) | 2026-08-22 |
| **18.1-18.2** · tip ölçeği ve palet markanın dizayn sisteminden; el yazısı, `wdth`, vurgu çipi emekli (D-317, D-318) | 2026-08-22 |
| **18.0** · araştırma tabanı: Instagram spec + tasarım disiplini + marka farkı, hepsi kaynaklı (D-321) | 2026-08-23 |
| **18.3** · süreklilik ölçek çizgisi; `sahne`de görsel kesim üstünde, dörtten ikiye (D-319) | 2026-08-23 |
| **18.4** · tanımsız token çağrısı kapısı — CSS sessizce şeffaf bırakıyordu (D-320) | 2026-08-23 |
| **18.5** · gövde puntosu okuma eşiğine çıktı (34 → 36 px, açıya sabit); R-83 · R-84 · R-85 yazıldı | 2026-08-23 |
| **18.6** · ölçü bandı 45–75 karakter; gövde sütunu başlıktan ayrıldı, `donen` 19 → 49 (R-86) | 2026-08-23 |
| **18.7** · kesintisizlik HER kesimde ölçülüyor; `memphis` + `editoryal` gizli boş kesimleri kapandı (R-87) | 2026-08-23 |
| **18.8** · güvenli alan 80 px, metin payı ≤%30 (kapak %42); gövde başlığı kapaktan ayrıldı (R-88) | 2026-08-23 |
| **18.9** · kelime bütçesi: başlık ≤8, slayt ≤28; sınır isteme yazılı, ret render'dan önce (R-89) | 2026-08-23 |
| **18.10** · yayın sözleşmesi: API 10 slayt + yalnız JPEG; hat PNG yazıyordu, artık `.jpg` (R-90) | 2026-08-23 |
| **18.11** · tuval oranı tek sözleşme sabitinden; 3:4'e geçiş tek satır, ölçülerek doğrulandı (R-91) | 2026-08-23 |
| **18.12** · marka imzası üretim yoluna bağlandı — logo hiç basılmıyordu, zincirin yedinci kopukluğu (R-92) | 2026-08-23 |
| **18.13** · ölçek TEK tabandan: krom ölçeklenmiyordu, 1080→1350'de yedi ölçü de %25 büyüdü (R-99) | 2026-08-23 |
| **18.13b** · taban çizgisi ızgarası metinden türüyor — sabit 54 px altıdan beşinde yanlıştı (R-100) | 2026-08-23 |
| **18.13c** · alt marka gerçekten koşuyor: font ve logo da devralınıyor, adlar marka-nötr (R-101) | 2026-08-23 |
| **18.13d** · token yüzeye göre çözülüyor — iki ölü rol panelde gözle doğrulandı (R-102) | 2026-08-24 |
| **18.14** · yasak terim listesi 6 → 23; üç canlı ihlal ve hayalet yolun ŞABLON kökü kapandı (R-103) | 2026-08-24 |
| **18.15** · kaynak satırı eksikliği artık görünür kutu — sessiz boşluk imzasız çıktıyı imzalı gösteriyordu (R-104) | 2026-08-24 |
| **18.16** · şablon ailesi 6 → 10; yeni şablonlar ESKİ şablonların üç kusurunu ortaya çıkardı (R-105 · R-106) | 2026-08-24 |
| **18.17** · ızgara sınavı ÖLÇÜLEBİLİR: baskın ton onunda da 220°, krom birebir aynı (R-107) | 2026-08-24 |
| **19.1** · dört katmanlı tasarım denetimi: kapak · 45 iç slayt · zanaat/finiş · seamless panorama | 2026-08-24 |
| **19.2** · bağımsız seamless araştırması BİREBİR kopyalandı; sekiz ailede görsel işlemleri açıldı | 2026-08-24 |
| **19.3** · tatbik reçetesi: on tema, şablon şablon zemin/tipografi/taşıyıcı değerleri, ortak altyapı | 2026-08-24 |
| **19.4** · zemin ve yüzey: gren · yedi yüzey ailesi · ışık · vinyet malzemede · çizgili zemin | 2026-08-25 |
| **19.5** · tipografi: iki uç kapısı · aksan telafisi çürüdü · genişlik ekseni iki yöne · alıntıya atıf | 2026-08-25 |
| **19.6** · renk: beş palet · aksan dört rol · kontrast zeminden türüyor, gövde artık soluk değil | 2026-08-25 |
| **19.7** · kompozisyon: slayt rolü · aksan yüzeyi · kapak silueti · kapanış tek yüzey · marka iki kez | 2026-08-25 |

## Sıradaki adım

## FAZ 15 — katalog merkezli üretim (D-268 · D-269 · D-270)

**15.1–15.12 + 15.14 KAPALI · 15.9 ve 15.13 AÇIK.** Ayrıntı: `docs/fazlar/FAZ-15.md`.
Belge: `docs/referans/katalog-merkezli-hat.md`.

⚠ **ONUNCU ZİNCİR KOPUKLUĞU (D-270):** `renderPanorama`nın üretim yolunda SIFIR çağıranı
vardı — mimarinin tamamı `just uret`ten erişilemezdi. Bağlarken çıkan altı kopuk halkanın
hiçbiri testle, hepsi GERÇEK KOŞUYLA bulundu.

## Devreden borçlar

QA/bağlam 0/18 (`2.9`) · bileşen testi FAZ 9'a · V-19 · V-24/25/26/27 · `3.12b` R2 ·
varlıklar indekste yok · önizleme yok.

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
