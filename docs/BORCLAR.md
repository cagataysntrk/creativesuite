# Borçlar — kalan işler

> Kullanıcının açık isteği üzerine tutulan liste. Her satır: **ne**, **neden henüz yok**,
> **ne zaman ödenir**. Tahmin yok; bilinmeyen "bilinmiyor" yazılır.

**Son güncelleme:** 2026-08-18 · **Aktif faz:** FAZ-15

---

## A — Görsel zenginleştirme (kullanıcının son yönergesi)

| # | Borç | Durum | Not |
|---|---|---|---|
| A1 | **Arka plan silme** | ✅ **ÖDENDİ** | `rembg` + BRIA RMBG 2.0 kuruldu, `local-rembg` sağlayıcısı yazıldı, `image.matte` yeteneği |
| A2 | Arka plan silme **hatta bağlanması** | ✅ **ÖDENDİ** | `gorsel-kirp` adımı; base64 boru (ikili veri utf8'de bozuluyordu) |
| A3 | **3D element kütüphanesi** | ✅ **KARARA BAĞLANDI (D-275)** | Hazır kütüphane REDDEDİLDİ (ikinci render motoru / `Math.random`); imza degrade+ışık+gölge ve `blob` leke tipiyle kendimiz veriyoruz |
| A4 | **Doodle/illüstrasyon kütüphanesi** | ✅ **KARARA BAĞLANDI (D-275)** | `humaaans` CC BY atıf + fotoğrafik öznelerle çakışıyor; ikon setleri çıktıyı DAHA jenerik yapar |
| A5 | **Foto manipülasyon** | 🟡 KISMİ | `tema-uyum` (renk derecelendirme) + `temas-golgesi` eklendi. **Perspektif ve ışık yönü eşleme YOK** |
| A6 | Şablonların **zenginleştirilmesi** | 🟡 KISMİ | Boşluk ritmi 1:3, panel tek ayıraç, hayalet katman, hacimli blob **uygulandı**. §7 (tek kahraman) ve §9 (hikâye) HENÜZ değil |
| A8 | `GorselIhtiyaci.adet` ilan ediliyor, **hat dinlemiyor** | 🔴 AÇIK | Katalog `slayt-basina` diyor; DAG dinamik çoğaltma yapmıyor ve tek görsel üretiliyor. `sahne` tek geniş yuvaya çevrildi (referansa sadık), ama İLAN ile GERÇEK hâlâ ayrı |
| A7 | `content/` çıktılarının tazelenmesi | 🔴 AÇIK | Eski render'lar duruyor; katalog merkezli hatla yeniden üretilmeli |

⚠ **A3/A4 için ölçüt (rehber §4, §6):** kütüphane "ikon seti" değil **kompozisyon ögesi**
vermeli. Jenerik bir ikon seti eklemek `sablon-ikon.ts`in üstüne ikinci bir jenerik
katman koyar — kullanıcının "ai durmamalı" dediği şeyin tam tersi.

## B — Katalog ve tasarım

| # | Borç | Durum | Not |
|---|---|---|---|
| B1 | Katalog 6 → 20-30 şablon | 🔴 AÇIK | Her yeni şablon: referans oku → panorama modeline kur → render et → **BAK** |
| B2 | Tasarım rehberi ölçütlerinin **kapıya** bağlanması | 🔴 AÇIK | Rehber §10'daki altı ölçüt bugün belge; kapı değil |
| B3 | `donen` köşe süslemesi | 🔴 AÇIK | Referansta var, bizde yok |
| B4 | `editoryal` gerçek fotoğrafla doğrulama | 🔴 AÇIK | Yer tutucuyla render edildi; gerçek fotoğrafla bakılmadı |

## C — Hat ve altyapı

| # | Borç | Durum | Not |
|---|---|---|---|
| C1 | Düzeltme turu **ikinci tur** | 🟡 KISMİ | DAG döngü taşımadığı için bir tur açıldı; ikincisi altı adım daha ister |
| C2 | `matlama` işleminin emekliliği | 🔴 AÇIK | `rembg` bağlanınca luma anahtarı gereksizleşiyor; iki teknik bir arada durmamalı |
| C3 | FAZ-12 çıkış kriteri | 🔴 AÇIK | Kabul sayacı 0/20 |
| C4 | FAZ 9 denetim turları | 🔴 AÇIK | 9.1–9.6 hiç koşmadı |
| C6 | Görsel işlem sözlüğünün **üçüncü kopyası** sınavsız | 🔴 AÇIK | `kernel/doc/model.ts` · `gorsel-islem.ts` ↔ `aile.ts` arasında `_kumelerAyni` var, üçüncüsü yok; iki yeni işlem eklenince sessizce ayrıştı |
| C5 | Slayt-başına yolun tam emekliliği | 🟡 KISMİ | Karosel için emekli (D-271); `static.ts` sekiz hattı beslediği için KALDI |

## D — Bilinen sınırlar (borç değil, kayıt)

- `donen` ve `editoryal` içerikten seçilemiyor, açıkça istenmeli — bu bir dürüstlük
  kararı, eksiklik değil (`sablon-sec.ts`).
- `sahne` şablonunda başlık iki, gövde tek satır: oklar dar şeritte duruyor.
- Yirmi adım insan girdisi bekliyor (`DURUM.md` ⛔ satırı).
