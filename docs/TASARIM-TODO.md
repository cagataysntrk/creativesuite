# Katalog tasarım turu — depo sahibinin 2026-08-18 brief'i

> Tek odak: **tasarım**. Katalog mükemmel olana kadar başka işe bakılmıyor.
> Her madde **bakarak** kapanır; "yeşil test" burada kanıt değil.

| # | İş | Durum |
|---|---|---|
| T1 | Sayaç etiketleri kaldırıldı → konuyu söyleyen etiketler (`AYRIŞTIRMA`, `ÖLÇÜM`, `İMZA`) | ✅ |
| T2 | Mavi: chroma 0,192→0,132, ton 251,5→242. Zemin eskitmeli lacivert, amber→**bakır** (amber zaten stok şablondandı) | ✅ |
| T3 | Zemin merdiveni: `mavi-700` eskitmeli lacivert + `mavi-300` buzlu ara basamak; derinlik iki komşu tondan | ✅ |
| T4 | `sahne` ve `memphis` varyantlarının yarısı artık *3d clay render of the subject matter, no person* | ✅ |
| T5 | Display: Archivo → **Bricolage Grotesque** (OFL). Yan yana render edilip seçildi; Türkçe çizdirilerek doğrulandı. Genişlik ekseni 62–125% → 75–100%, şablon değerleri oranla taşındı | ✅ |
| T6 | `.sayi` −0,045em · `.hayalet` −0,055em | ✅ |
| T7 | Altı şablonda `ustDoku`: koyu zeminde gren 18–22, açık zeminde 12–16 (aynı doku iki zeminde aynı güçte olamaz) | ✅ |
| T8 | Kartlara inset ışık (üst 1px açık, alt 1px koyu, renkler karttan türüyor); temas gölgesi zaten `temas-golgesi` | ✅ |
| T9 | Aralıklar düzensizleştirildi (`donen` 25'er eşitti → 8/34/62/86). ⚠ `sahne`de fazla kaçtı ve %44 çakışma ölçüldü; kolon 0,56→0,46 ile geri alındı | ✅ |
| T10 | Varyantlar poz + ÖZNE TÜRÜ + malzeme/ışık taşıyor. ⚠ `texture` kelimesi kullanılamıyor: içinde `text` geçiyor ve R-20 muhafızı alt dize eşleştiriyor | ✅ |

**Ölçüt:** madde kapanınca katalog panoraması yeniden üretilir ve BAKILIR.

## Tur içinde gelen ek

| # | İş | Durum |
|---|---|---|
| T11 | `memphis`ten renkli toplar/daireler kaldırıldı; kimlik **kart zemini renk rotasyonuna** taşındı | ✅ |
| T12 | `koyuMu()` token ADINA bakıyordu → lacivert kartta koyu metin. Artık `tokenCss`ten AÇIKLIK okunuyor | ✅ |
