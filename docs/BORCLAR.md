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
| A8 | `GorselIhtiyaci.adet` ilan ediliyor, **hat dinlemiyor** | ✅ KAPANDI (D-278) | Üç parça: `uretilenGorseller()` sıraya göre eşleştiriyor (yayma yok) · hat görsel üçlüsünü **açarak** dörde çıkardı · `varyantlar` yuva başına kadraj tarif ediyor. Fazlalık sıra brief'i BOŞ döndürüp adımı atlıyor: para harcanmıyor |
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

## FAZ-15.13 turundan kalanlar

- **D1 · `donen` briefi soyut konuda DİKDÖRTGEN fotoğraf üretiyor.** Gerçek koşu
  (`Geri kazanilmis elyaftan dort urun`): dört görselin üçü tam kadraj kumaş dokusuydu,
  tek bir NESNE değil. Arka plan silme kesecek bir özne bulamıyor ve beyaz daire
  fotoğrafın altında kalıyor. Brief "single product... full object in frame" diyor ama
  konu soyutken model dokuya kaçıyor. Şablon seçicisi `donen`i yalnız açıkça istendiğinde
  seçiyor; yine de brief nesne zorlamalı ya da denetim "kesik değil" diye ölçmeli.
- **D2 · Görsel adımlarının bir koşuda topluca düşmesi AÇIKLANMADI.** `editoryal`
  koşusunda üç `gorsel-uret` adımı da `failed` döndü; sağlayıcı hemen sonra doğrudan
  sınandığında tohumlu ve tohumsuz iki istek de başarılıydı. Hata kaydı yolu bu turda
  açıldı (D-287) ama sebep bir sonraki tekrarda okunacak.
- **D3 · `donen` podyumu yok.** Referansta (`image copy 3`) ürün küçük eliptik bir
  platformun üstünde duruyor; bizde `temas-golgesi` var, podyum yok (TODO 2.6).
- **D4 · 3B/izometrik ve botanik varlık seti yok.** Referansın köşe ögeleri (palmiye
  yaprakları) R-81 gereği kodlanamaz; kütüphane şart (TODO 2.3).
- **D5 · 3B sembol seti kurulmadı.** D-291 kaynağı ikiye ayırdı: nesne modelden, sembol
  küratörlü setten. Nesne yolu hazır (`gorsel-uret` + `gorsel-kirp`); sembol yolu için
  **3dicons** (CC0) ya da **Fluent Emoji** (MIT) kurulacak. Önce ÖLÇÜLMELİ: yirmi ikonun
  kaçı gerçekten 3B olmalı? Hepsini 3B yapmak, hepsini çizgi yapmak kadar tek sesli.
- **D6 · `marka-isareti.ts` markanın imzasını KODLA çiziyor.** Gerekçesi ("brand/ altında
  logo dosyası yok") D-284'te geçersizleşti; gerçek logolar geldi. Modül canlı —
  `static.ts` ondan `markaCss`/`markaKilidi` alıyor ve o yol SEKİZ hattı besliyor, o
  yüzden göç ayrı bir karar. R-81 kapsamında.
- **D7 · `sablon-al` düz görselde metin kutusu çıkarmıyor.** PSD'de katman kutuları
  okunuyor; düz görselde yalnız palet. Kutu tahmini kasten yapılmadı (yanlış kutu,
  kutu olmamasından kötü) — istenirse OCR/bağlantılı-bileşen ile ölçülebilir hâle gelir.
- **D8 · Panel ölçeği yalnız İKİ şablonda ayarlandı.** `veri-hikayesi` 2,1 · `memphis` 1,7.
  Öteki dördünde panel yok; panel eklenirse ölçek de kararlaştırılmalı — varsayılan 1
  (web ölçüsü) ve o değer artık bilinçli bir seçim olmalı, miras değil.
- **D9 · `sus-baskin` alanı ölçüyor, KONTRASTı değil.** Soluk bir hayalet ile opak bir
  blok aynı sayılıyor. Bugün yetiyor (hiyerarşi tersliği alanla görünüyordu) ama bir
  şablon hayaleti çok soluk yapıp büyütürse kural haksız kırmızı verir.
- **D10 · BOŞ GÖRSEL "başarı" sayılıyor — denetimde deliği var.** Gerçek koşuda
  (`run_01a0143d`) 3. slaydın yuvasında figür yerine düz siyah bir dikdörtgen çıktı:
  sağlayıcı boş/karanlık bir görsel döndürdü, adım `ok` oldu, `kalite` 0 kusur dedi.
  **Ölçüldü:** yuva içi standart sapma 16,1 · ötekiler 39,2 / 45,1 / 51,1 — üçte biri.
  Aynı imza daha önce doğrudan sağlayıcı denemesinde de görüldü (dişli brief'i 17 KB
  siyah kare döndürmüştü). Eşik ölçülebilir: yuva içi std belirgin biçimde düşükse görsel
  yok demektir. `matlama-tutmuyor` köşe parlaklığına bakıyor, bu ayrı bir kusur.
  ⚠ Kontrol tarayıcıda yapılmalı (görsel bir veri URI'si; motorda PNG çözücü yok).
- **D11 · 2× render kaliteyi yükseltiyor ama sözleşme engelliyor.** `deviceScaleFactor: 2`
  harf kenarlarını gözle görülür temizliyor (bakıldı). Çıktı 2160×2700 oluyor; üç test
  1080×1350'yi doğruluyor ve haklılar. Doğru yol "2× çiz, 1×'e küçült" — küçültücü
  (`sharp`) kurulu değil, bir bağımlılık kararı gerekiyor.
- **D12 · Görsel kutusunun en/boyu kaynaktan türemiyor.** `genislik` ve `yukseklik` iki
  BAĞIMSIZ yüzde; `object-fit: contain` oranı koruduğu için kutunun bir kısmı sessizce
  boş kalıyor. `sahne`de ölçüldü: 518×1053 kutuya 0,80 oranlı görsel → 405 px boş.
  Katalog beklenen oranı bildirmeli ya da genişlik yükseklikten hesaplanmalı.
- **D13 · `sahne` oklarının bükümü 4320 px tuvalde düz kalıyor** (48–58 px). Kesimi
  aşıyorlar ama geçiş okunmuyor; ~300 px ölçüldü ve doğru görünüyor.
- **D14 · Oklar tek SVG katmanında (z-index 5), yani HER ZAMAN figürün önünde.**
  Referansta kıvrım figürün önünden geçip arkasından çıkıyor; bunun için okların iki
  katmana bölünmesi gerek.

- **D15 · KAPANDI.** Şablon modu artık `katalog-ornek.ts`e CERRAHİ yazıyor: dosya
  yeniden üretilmiyor, yalnız değişen literal ve değişen sayı değiştiriliyor — 999
  satırın 2'si. Yorumlar dosyanın asıl değeri ve olduğu gibi kalıyor. Belirsizlikte
  (eski değer blokta bir kezden farklı geçiyorsa) HİÇBİR ŞEY yazılmıyor ve sebebi
  bildiriliyor. Yasa 2 gereği bu bir öneri: onay `git diff` + commit.
- **D16 · Düzenleyici görselin EN/BOY oranını serbest bırakıyor.** Shift+sürükle yalnız
  `genislik` yazıyor, `yukseklik` şablondan geliyor; kutu oranı elle bozulabiliyor.
  D12 ile aynı kök: oran kaynaktan türemiyor. İkisi birlikte çözülmeli.
- **D17 · Düzenleyici yalnız metne ve görsel kutusuna dokunuyor.** Paneller, lekeler,
  oklar, kart zemini ve tipografi ölçeği düzenlenemiyor — bunlar `KatalogOrnegi`nin
  alanları ama editörde tutamağı yok. Photoshop benzeri hissin eksik yarısı burası.
- **D18 · Damga koşudan SONRA basılıyor, `PUBLISH` ise koşunun İÇİNDE.** `stampPng`
  `scripts/uret.mjs`te, `runPipeline` döndükten sonra çalışıyor; `yayinla` adımı ise
  hattın son adımı. Yani bir koşu gerçekten yayına gitseydi `publish.ts` damgasız
  varlık görür ve `disclosure_missing: stamp` ile dururdu. Bugün görünmüyor çünkü
  kanal sağlayıcısı hiç bağlı değil (V-16, `insan` blokajı) — yani kapı zaten
  önce duruyor. Doğru çözüm damgayı `RENDER`ın içine almak: render kendi yazdığı
  PNG'yi damgalar, `assets` çıktısı `stamped: true` taşır ve sıra sorunu kalkar.
  Bunun için uyum iddiasının koşu ÖNCESİNDE hesaplanması gerekiyor (bugün sonra
  hesaplanıyor) — küçük ama gerçek bir yeniden sıralama.
