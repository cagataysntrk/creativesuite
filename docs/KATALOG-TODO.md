# Katalog mükemmelleştirme — yapılacaklar

> Depo sahibinin 2026-08-18 yönergesi, madde madde. Her satır **ölçülebilir** bir kabul
> taşıyor; "bakılıp onaylandı" yeterli değil, neye bakıldığı yazılı.
>
> ⚠ **Bu listenin kendisi bir sınav:** referanslar `examples/` altında duruyor. Bir
> madde ancak çıktı referansın YANINA konup karşılaştırıldığında kapanır.

**Son güncelleme:** 2026-08-18 (A8 kapandı · yan yana kompozisyon · kabul testi bağlandı · yuva tohumu)

---

## 0 — Marka paleti (EN ÖNCE, çünkü hepsi buna dayanıyor)

| # | İş | Durum | Kabul |
|---|---|---|---|
| 0.1 | Logolardan renk ölçümü | ✅ | `#0090fc` = `oklch(0.647 0.189 251.2)` ölçüldü |
| 0.2 | Mavi rampa (200/500/600/800) | ✅ | `ramp.marka.mavi-*` üretildi |
| 0.3 | `role.bg` → marka mavisi | ✅ | Kreatif zemin artık markanın; amber KARŞI aksan (D-276) |
| 0.4 | Siyah logo için ikinci palet varyantı | ✅ | **Ölçüldü: ikinci palet YOK, olmamalı.** Siyah sürüm tamamen `#000000` — yeni bir renk getirmiyor. Gerçek ihtiyaç bir SEÇİM kuralıydı: koyu zemin → mavi sürüm, açık zemin → siyah. `koyuMu()` zaten ölçüyor (D-284) |
| 0.5 | Logonun kendisi karosele giriyor mu | ✅ | Alt rayın solunda, zemine göre sürüm seçerek (D-284). Kaynak PNG'ler 500×500'dü ve işaret %2,4'ünü kaplıyordu: alfa kutusundan **ortak** kutuyla kırpıldı (338×78), yoksa zemin değişince logo zıplıyordu |

## 1 — Şablonlar asıllarına benzeyecek (EN ÖNEMLİ)

⚠ Ölçülen farklar, referans referans:

| # | Referans | Bizdeki fark | Durum |
|---|---|---|---|
| 1.1 | `image copy 2` (sahne) — kesik özne kadrajın **~%40'ı**, KAHRAMAN | ✅ Sorun ölçek değil YERLEŞİMdi: tek yuva dört slayda düşüyordu. A8 kapandı (D-278), `sahne` DÖRT yuva; her karede bir özne, y%22'den alt kenara kesik. Doluluk %5–9 → %10,6–14,1 | ✅ |
| 1.2 | `image copy 2` — oklar **el çizimi fırça şeridi** | ✅ `perfect-freehand` (MIT, 31KB, sıfır bağımlılık, determinist); açıklık 8→17, büküm 13→52 | ✅ |
| 1.3 | `image copy 2` — **el yazısı ikinci yüz** ("Instagram" kelimesi) | ✅ Caveat (OFL) bağlandı, altı kapakta `elYazisi` vurgu satırı. Sınır R-76 uyarınca ayrı turda 2→3 oldu ve karşılığında **beyan edilmemiş aile tavanı 0** geldi — net sonuç daha sıkı kapı (D-285) | ✅ |
| 1.4 | `image copy 4` (memphis) — lekeler **dev**, kesim aşıyor | ✅ 6→9 leke, boyut 130–210 → 170–430 px (slaytın ~%35'i), üçü kesim üstünde, iki aksan | ✅ |
| 1.5 | `image copy 4` — **iki aksan** (turuncu + lacivert) | ✅ mavi + amber (D-276) | ✅ |
| 1.6 | `image.png` (akan-alan) — bölme güçlü eğri | ✅ Fark eksende değil **GENLİKTEydi**: %9 → %42 salınım. Eksen yatay kaldı (dikey sınır kesimde kırılır — kayıtlı gerekçe); tepe %44'te tutuldu, metne girmiyor | ✅ |
| 1.7 | `image.png` — `#003` indeks etiketi + alt "swipe" göstergesi | ✅ Hayaletler dolduruldu: `sahne`/`donen`/`editoryal` artık `01`–`04` dev indeks taşıyor (D-281); alt sayaç da duruyor | ✅ |

## 2 — Kodlanmış öge YASAĞI (sahibin en sert kuralı)

| # | İş | Durum | Not |
|---|---|---|---|
| 2.1 | Kütüphane araştırması | 🟡 | D-275 reddetti; yeniden arandı ve **`perfect-freehand` KURULDU** — kontur matematiği 40 satır değil, R-75 eşiğinin üstünde |
| 2.2 | El çizimi ok/fırça | ✅ | `perfect-freehand` · `roughjs` (MIT, tohumlanabilir) sonraki aday |
| 2.3 | 3B/izometrik varlık seti | 🔴 | GLB ikinci motor ister (Yasa 4); PNG/SVG set aranmalı |
| 2.4 | Kural: yeni jenerik öge KODLANMAZ | ✅ | **R-81 + `kodlanmis-oge` kapısı** (D-279). Sayım dondu; kasten yeni rozet eklendi → kırmızı. Kırpma kapsam dışı: fotoğrafın kadrajı, çizilmiş şekil değil |

## 3 — Zemin, tipografi, kutular

| # | İş | Durum | Kabul |
|---|---|---|---|
| 3.1 | Boşluk ritmi 1:3 | ✅ | 14 / 44 / 132 px |
| 3.2 | Panel tek ayıraç | ✅ | Zemin+çerçeve+yarıçap → tek aksan çizgisi |
| 3.3 | Hacimli organik leke | ✅ | Degrade + ışık + gölge (`blob`) |
| 3.4 | Zemin reçetesi | ✅ | Bant 36px→8px ölçüldü |
| 3.5 | Tasarım rehberi | ✅ | §10'un ölçütleri `katalog-kabul.test.ts` ile bağlandı (D-281). Bağlanır bağlanmaz **beş gerçek boşluk** buldu. Rehberin atıf yaptığı üç fonksiyon panorama belgesine uymuyordu; ölçütler veriden yeniden hesaplandı |
| 3.6 | §7 tek kahraman kuralı | ✅ | `sahne`de dört özne, her biri kadrajın ~%52'si ve y%22'den alt kenara kesik (D-278). Ölçülen doluluk %5–9 → %10,6–14,1 |

## 4 — Hat ve çıktı

| # | İş | Durum |
|---|---|---|
| 4.1 | Arka plan silme hatta bağlı | ✅ `gorsel-kirp` · `kusurSayisi: 0` ölçüldü |
| 4.2 | Foto tema uyumu + temas gölgesi | ✅ `tema-uyum`, `temas-golgesi` |
| 4.3 | `content/` çıktıları tazelenecek | 🔴 Eski render'lar duruyor |
| 4.4 | `GorselIhtiyaci.adet` hat tarafından dinlenmiyor | ✅ Borç A8 kapandı (D-278): hat görsel üçlüsünü **açarak** dörde çıkardı, dağıtım sıraya göre, varyant + tohum kadrajı ayrıştırıyor |

---

## Sıra (bağımlılığa göre)

**Kapananlar:** 0.1–0.5 · 1.1 · 1.2 · 1.3 · 1.4 · 1.5 · 1.6 · 1.7 · 2.1 · 2.2 · 2.4 · 3.1–3.6 · 4.1 · 4.2 · 4.4

**Kalan sıra:**
1. **2.3** — 3B/izometrik varlık seti. GLB ikinci motor ister (Yasa 4); PNG/SVG set aranacak.
3. **4.3** — EN SON: katalog bitince `content/` çıktıları yeniden üretilir.
