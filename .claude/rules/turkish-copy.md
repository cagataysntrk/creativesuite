---
paths: ["corpus/**", "content/**", "docs/**"]
---

# Türkçe metin yazarken

## Sert kurallar

- **Görsel modeline Türkçe metin çizdirilmez** (R-20). Metinsiz üret, gerçek fontla
  kompozit et. Ideogram kendi dokümanında aksanlı Latin'i render edemeyebileceğini
  kabul ediyor.
- **`.toUpperCase()` yasak** (R-21). `'i'.toUpperCase()` → `I`, olması gereken `İ`.
  Yalnız `kernel/src/text/case.ts` case dönüştürür.
- **CSS `text-transform: uppercase` yalnız `lang="en"` öğede** (R-22).
- **Genişlik Türkçe'ye göre ölçülür** (R-23). "Onayla" sığar; gerçek etiket
  "Onayla ve depoya işle" olur ve kırpar. Sabit genişlik yok.

## Dil sınırı (D-37)

| Türkçe | İngilizce |
|---|---|
| Belge nesri, içerik, UI etiketleri | Tanımlayıcılar, şema anahtarları |
| Yorum satırları | Log olay adları, enum değerleri |
| Commit gövdesi | Dosya adları, commit tipleri, hata `code` |

Gerçek hata Türkçe'nin `code: "SAĞLAYICI_HATASI"` gibi bir **enum değerine** sızmasıdır,
nesre değil.

## Kaynaksız sayı yok

Sayısal iddia `claim_source` olmadan yayınlanamaz (R-32). Eski sitedeki
"1.247 İlan", "1.234.567 ton CO2" gibi yer tutucular **asla taşınmaz**.
