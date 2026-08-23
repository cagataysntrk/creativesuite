# DURUM

> Döngünün her turda okuduğu ve yazdığı tek durum dosyası.
> Bağlam sıfırlanırsa **önce burayı oku** (`CLAUDE.md` → "BAĞLAM COMPACT'LENDİYSE").

```yaml
# ── makine-okunur durum bloğu (LOOP§E) ───────────────────────────────────────
aktif_faz: 18
siradaki_adim: 18.13
son_guncelleme: 2026-08-23
bloke: ["2.9:insan", "3.7:insan", "3.8:insan", "3.14:insan", "4.13b:insan", "5.4b:insan", "5.5b:insan", "6.5b:insan", "6.9b:insan", "7.2b:insan", "7.5b:insan", "7.6b:insan", "7.8b:insan", "8.6:insan", "8.8b:insan", "11.5:insan", "11.6:insan", "11.9:insan", "12.8:insan", "13.3:insan", "8.3b:teknik"]
deneme_sayaci: {}
son_kanit: "KESIK OZNE CIZILIYOR AMA GORUNMUYORDU. memphisin kagit kartinda beyaz cizgili figur beyaz zeminde yalniz TEMAS GOLGESINDEN seciliyordu. Var olan hicbir olcum goremezdi: gorsel oradaydi, kutusu dogruydu, metni ortmuyordu, kesime uzakti. Kusur sablonda degil VARLIGIN KUTUPLULUGUNDA — ayni hat, koyu murekkepli bir varlikta ayni kagit kartta kusursuz cikiyor (editoryal slayt 2). Hangi kutupta uretilecegini hat garanti edemiyor. tema-uyum adiyla uyum vaat ediyordu ve hicbir seye uymuyordu: sabit bir sicaklik matrisiydi ve intercept +0,03 ile goruntuyu ACIYORDU, yani kagit kartta durumu KOTULESTIRIYORDU. Sebep yapisal — gorseller kartlarin DISINDA ayri bir katmanda yasiyor ve hicbir kartin rengini miras almiyor; cevap yalniz KONUMDAN gelir. Zincir artik her gorsel icin o soruyu soruyor. OLCUT IKI KEZ YANLIS SECILDI: ortalama luma farki temas golgesini gorunurluk saniyor, medyan ise ince bir ozneyi (olcum sehpasi) gorunmez saniyor. Dogru soru ne kadar murekkep var degil, OLAN MUREKKEP AYIRT EDILIYOR MU — siluetin p90 luma farki. Esik 120 OKUNDU: calisan dokuz gorselde 226-249, uc hayalette 48-81. Duzeltmeden sonra memphis 134-140, donenin kagit kartindaki iki urun de 240 ve 242den 254 ve 249a cikti. Kural iptal edilince tam olarak o uc gorsel kirmizi. AYRICA memphis oznesi kadraj kenarinda kesiliyordu, sahne ile ayni zemin cizgisine alindi (y 53, ray 1259da). KURAL KITABI BOLUNDU: R-96 tavani delecekti ve D-322 tavan bir kez yukselir demisti; yukseltilmedi, gerekceler docs/kurallar/OLCUMLER.mdye tasindi, KURALLAR.md 480den 464e indi ve on dort kuralin gerekcesi budanmadan yasiyor. Kendi testlerim paketi kirilganlastirmisti (18 fazladan tarayici denetimi, zaman asimlari) — kadraj testleri tek dosyada sablon basina TEK denetime indi. 45 kapi yesil, 2063 test."
```

## Neredeyiz

**FAZ 0–8 kapandı** (5 ve 6 şartlı: D-206 · D-217).
**46 kapı · 24 ihlal kırmızı · 1836 test.**
Faz tikleri faz dosyalarında; `git log` tek başına yol haritasıdır (D-85).

> **Kök neden, ON tekrar:** kod yazılır, üretim yolunda çağıranı olmaz — D-182 · D-190 ·
> D-224 · D-250 · D-261 · **D-270 (mimarinin tamamı)**. Zincir için sorulur, adım için değil.
> ⛔ **YİRMİ ADIM İNSAN GİRDİSİ BEKLİYOR** — `2.9` `3.7` `3.8` `3.14` `4.13b` `5.4b`
> `5.5b` `6.5b` `6.9b` `7.2b` `7.5b` `7.6b` `7.8b` `8.6` `8.8b` `11.5` `11.6` `11.9`
> `12.8` `13.3`. Sınıfı `insan` (D-157): plan hatası değil dış bağımlılık. ⚠ `3.14`
> `2.9`'a bağlı; `11.5`/`11.9` BiRefNet, `11.6`/`13.3` ücretli görsel bekliyor.

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
| **18.1** · tip ölçeği markanın dizayn sisteminden: dört aile, dört rol; el yazısı ve `wdth` emekli (D-317) | 2026-08-22 |
| **18.2** · palet sistemden: chroma 0 nötrler, `#040404` kanvas, aksanın iki adımı; vurgu çipi emekli (D-318) | 2026-08-22 |
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
