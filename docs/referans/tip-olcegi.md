# Tip ölçeği: en uzun Türkçe kelimeden türetildi

> **ÜRETİLMİŞ DOSYA** — elle düzenlenmez. Üreteci: `node scripts/tip-olcegi.mjs`
> (FAZ-10.2b · R-23 · §7.2). Buradaki her sayı bir ölçümdür.

**Ölçülen stil:** `static.ts`teki `h1` ile birebir — Marka Display 800, `font-stretch`
112%, `letter-spacing` -0.03em. Farklı olsaydı ölçüm başka bir tipografiyi ölçerdi.

**Kelimeler uydurulmadı:** corpus ve üretilmiş slayt metinlerinden toplandı, 14 adet.

## En geniş kelime, punto başına

| Punto | En geniş kelime | Genişlik |
|---|---|---|
| 44 px | `konumlandırmadan` | **385 px** |
| 48 px | `konumlandırmadan` | **420 px** |
| 52 px | `konumlandırmadan` | **455 px** |
| 56 px | `konumlandırmadan` | **490 px** |
| 60 px | `konumlandırmadan` | **525 px** |
| 64 px | `konumlandırmadan` | **560 px** |
| 68 px | `konumlandırmadan` | **595 px** |
| 72 px | `konumlandırmadan` | **630 px** |
| 76 px | `konumlandırmadan` | **665 px** |
| 80 px | `konumlandırmadan` | **700 px** |

## Hangi sütun genişliğinde hangi punto sığar

Tuval 1080 px, kenar payı 88 px. Kullanılabilir içerik = sütun − pay.

| Sütun | İçerik gen. | Sığan en büyük punto |
|---|---|---|
| %36 (389 px) | 301 px | **hiçbiri** — 44 px bile taşıyor |
| %44 (475 px) | 387 px | **44 px** |
| %52 (562 px) | 474 px | **52 px** |
| %58 (626 px) | 538 px | **60 px** |
| %62 (670 px) | 582 px | **64 px** |
| %68 (734 px) | 646 px | **72 px** |

## Karar

**Bugünkü ayar (%36 sütun, 76 px punto) ÇALIŞMIYOR** ve tablo bunu gösteriyor: %36'da içerik 301 px, sığan en büyük punto **yok** — yani 76 px zaten imkânsızdı.

Seçim iki değişkenli: sütunu genişletmek ya da puntoyu küçültmek. **İkisi de yapılıyor,**
çünkü tek başına ikisi de kötü: sadece punto küçültmek başlığı gövde metnine yaklaştırıp
hiyerarşiyi öldürür; sadece sütunu genişletmek eğriyi kenara sıkıştırıp motifi yok eder.

Referansta metin alanı karenin ~%62'sini kaplıyor ve eğri sınırı oradan geçiyor — yani
geniş sütun zaten ailenin özelliği, bizim %36'lık sütunumuz referanstan SAPMAYDI.
