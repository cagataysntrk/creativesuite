# Referans karosellerin tasarım temeli

> **ÜRETİLMİŞ DOSYA** — elle düzenlenmez. Üreteci: `node scripts/tasarim-temeli.mjs`
> (FAZ-10.2 · D-255). Buradaki her sayı bir ölçümdür; hiçbiri seçilmemiştir.

**Kaynak:** `docs/research/referans/karosel-sablon.png` · 800×320 px
**Yerleşim zemini:** `#cccccc` — slayt değil, ölçüme girmiyor
**Ölçüm fonksiyonu:** `pixelStats` — *kendi çıktımızı ölçen fonksiyonun aynısı*,
ΔE2000 eşiği `paletteMatch = 5`

## Segmentasyon: ne işe yaradı, ne yaramadı

**Yatay boşluk sinyali YOK.** Tamamen zemin renginde olan sütun sayısı: **0**
(genişliğin 0.0%'i). Yan slaytlar bu çözünürlükte piksel piksel
bitişik — aralarındaki boşluk 800 px genişlikte alt-piksel kalıyor. Slaytları
yatay boşluktan ayırmaya çalışmak bu görselde **çalışmaz** ve ilk denemede sessizce
iki bölge buldu; betik artık bunu bir başarı saymıyor, ikiden az bölgede DURUYOR.

**Dikey uzanım sinyali VAR.** Merkez slayt yan slaytlardan uzun; aynı `(üst, alt)`
çiftini paylaşan bitişik sütunlar bir bölge sayılıyor. Bulunan bölgeler:

| Bölge | x | y | Kendi paleti | Palet dışı | Ortalama ΔE |
|---|---|---|---|---|---|
| 1 | 13–309 | 0–243 | `#cccccc` `#e9b726` `#ffffff` | 9.5% | 2.5 |
| 2 | 312–490 | 0–257 | `#ffffff` `#cccccc` `#e9b626` | 13.8% | 3.3 |
| 3 | 490–783 | 0–250 | `#cccccc` `#e9b626` `#161616` | 20.4% | 2.7 |

## Türetilen eşik

| Metrik | Ölçülen en yüksek | Eşik | Nasıl |
|---|---|---|---|
| **T10** palet dışı piksel | 20.4% | **%41** | ölçülenin iki katı |

Ortalama ΔE en yüksek: **3.3** — referans kendi paletine bu
kadar yakın duruyor.

**Neden iki kat:** referans bir üst sınır değil, ailenin bir örneği. Ölçüleni birebir
eşik yapmak referansın kendisini sınırda bırakır ve meşru bir varyasyonu reddeder.
İki kat, "aynı aileden mi" sorusunu cevaplar; "birebir aynı mı" sorusunu değil.

## Referanstan TÜRETİLEMEYEN eşikler — ve neden

Bu bölüm bir eksiklik listesi değil, bir **ret** listesi. Türetilmiş gibi yazılan bir
sayı, kaynağı unutulduğunda ölçüm sanılır.

**T9 metin kaplama — TÜRETİLEMEZ.** Bizim `textCoverage` fonksiyonumuz pikselden
değil **belge modelinden** ölçüyor (karakter sayısı × tahmini karakter alanı) ve bunun
gerekçesi kendi dosyasında yazılı: OCR tabanlı ölçüm deterministik değil. Referansın
belge modeli YOK — elimizde yalnız pikseller var. Pikselden çıkan bir sayıyı
modelden çıkan bir eşiğe dayandırmak, iki farklı büyüklüğü karşılaştırmak olurdu.
Eşik yerinde kalıyor: **%20**, kaynağı Meta'nın reklam
kuralı — belgelenmiş, dışsal ve bizden bağımsız bir ölçüt.

**T11 tip ölçeği — TÜRETİLEMEZ.** Anti-aliasing ve harf yüksekliği farkı 34 px ile
36 px arasını pikselden ayırt edilemez yapar. Bu eşik referanstan değil kendi
gramerimizden geliyor: `static.ts` tam olarak üç boyut tanımlıyor (`h1`, `h2`, `p`)
ve dördüncüsü bir KARAR gerektirir. Eşik **3** — ölçüm değil kısıt, ve bu ayrım burada
yazılı olduğu için savunulabilir.

## Ölçüm sırasında çıkan İKİ KUSUR

Bu bölüm referans hakkında değil, **bizim çıktımız** hakkında. İkisi de eşiği
türetirken ortaya çıktı — ölçmenin asıl getirisi de bu oldu.

### 1. Palet dışı ölçümü GÖRSEL BLOKLARINI dışlamak zorunda

Kendi slaytlarımız aynı yöntemle ölçüldü:

| Slayt | Palet dışı | Ortalama ΔE |
|---|---|---|
| `01-kapak` | 1.0% | 0.2 |
| `02-govde` | 1.2% | 0.2 |
| `03-govde` | 2.7% | 0.5 |
| `04-kapanis` | **24.8%** | **6.3** |

Üçü referanstan (9.5–20.4%) belirgin biçimde daha disiplinli, biri aykırı. Aykırı
slayta BAKILDI: alanın ~%60'ı bir AI fotoğrafı. Fotoğraf tanımı gereği palet
dışıdır — bu bir tasarım kusuru değil. Yani T10 ölçümü görsel bloklarının kapladığı
bölgeyi DIŞLAMAK zorunda; dışlamazsa görsel içeren her slayt limiti patlatır ve kapı
kısa sürede kapatılır. **Yanlış pozitif de bir hatadır.**

### 2. Metin sütununu daraltmak Türkçede metni daraltmıyor

`guvenliMetinYuzdesi` metin kutusunu %36'ya (389 px) kilitliyor. Buna rağmen kapak
slaytında metin hâlâ eğri sınırını kesiyor. Sebep Türkçeye özgü ve yapısal:
`iyileştiremezsiniz` kelimesi 76 px puntoda ~690 px yer kaplıyor. **Kelime bölünmez;
kutudan taşar.** Kutuyu daraltmak, taşmayı görünmez yapmıyor — yalnız hangi kenardan
taştığını değiştiriyor.

Bu, R-23'ün (Türkçe genişleme yapısaldır) tipografi tarafındaki karşılığı ve
T2 metriğinin nasıl ölçüleceğini belirliyor: kapsayıcı genişliği değil, **en uzun
kelimenin render genişliği** güvenli sütunla karşılaştırılmalı.

Düzeltme R-30'a takılıyor: taşma BÖLER, asla küçültmez — ama tek kelime bölünemez.
Yani punto, güvenli sütuna sığacak şekilde ÖNCEDEN seçilmeli (otomatik küçültme
değil, ölçülmüş bir tip ölçeği). Bu iş FAZ-10.2b'ye açıldı.

**`karosel-mockup.png` ÖLÇÜLMEDİ.** O bir mockup fotoğrafı: slaytlar perspektifle
eğik, üzerlerinde gölge, arkada duvar dokusu var. Ondan çıkacak sayı tasarım hakkında
değil fotoğrafın kendisi hakkında bilgi verir.
