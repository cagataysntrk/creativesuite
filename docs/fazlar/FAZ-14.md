# FAZ 14 — Üretim sırası: tasarım planı ve tabanın önceliği

**Amaç:** Var olan hattı **yeniden sıralamak ve bir adım eklemek** — yeni bir hat kurmak
değil. `instagram-post` hattı bugün on bir adımlı, DAG'lı, yetenek tabanlı ve çalışıyor.
Eksik olan üç şey var ve üçü de sıraya dair.
**Yöneten kararlar:** D-241, D-243, D-254, D-256, D-261
**Ön koşul:** FAZ-11 dağarcığı (11.1–11.3 ✓ — düzen · süsleme · ikon · diyagram yeter)
**Sıra:** ⚠ **FAZ-12 ve 13'ten ÖNCE.** Zengin bir dağarcığın seçicisi yoksa zenginlik
gürültüdür; ve 14 sonraya kalırsa 12/13'ün eklediği her yetenek plana geri takılır.
**Çıkış kriteri:** Tasarım kararları `derived/runs/` altında **gerekçesiyle yazılı**; görsel
üretimi tabandan SONRA koşuyor ve yalnız planın işaretlediği yuvaları dolduruyor.

> ⚠ **ÖNCE DOĞRULANDI — hat var ve sanılandan olgun.** İddia etmeden okundu:
> `registry/pipelines/instagram-post.pipeline.yaml` on bir adım tanımlıyor —
> `cozumle`(RESOLVE) → `bilgi-sec`(SELECT) → `metin-uret`(text.generate) →
> `gorsel-brief`(text.generate) → `gorsel-uret`(image.generate) → `kompozit`(COMPOSE) →
> `render`(RENDER) → `gorsel-yargi`(image.critique) → `kalite`(VALIDATE) →
> `onay`(PROPOSE, insan kapısı) → `yayinla`(PUBLISH).
> Ayrıca her koşu `donmus-plan.json` yazıyor (sıra, sağlayıcı, maliyet tahmini, tohum) ve
> alt metin zaten zorunlu (**R-34**, Türkçe `alt_tr` ≤125 karakter).
> **"Metin önce, sonra görsel, sonra kontrol" zaten böyle çalışıyor.**
>
> ⚠ **Öyleyse eksik ne:** üç şey, ve hiçbiri "hat yok" değil.
> 1. **Tasarım kararları hiçbir yerde YAZILI değil.** `donmus-plan.json` *hangi adım,
>    hangi sağlayıcı, ne maliyet* donduruyor — ama *hangi düzen, hangi görsel öge, neden*
>    demiyor. O kararlar `composeBody`/`paginateDocument` içinde kod dalları olarak
>    veriliyor ve hiçbir artefakta düşmüyor. *"Bu slayt neden böyle tasarlandı?"* cevapsız.
> 2. **`gorsel-uret`, `render`'dan ÖNCE koşuyor ve brief'i `bilgi-sec`'ten alıyor.** Yani
>    görsel, gireceği slaydı **görmeden** üretiliyor: hangi biçim, hangi rol, hangi boşluk —
>    hiçbiri bilinmiyor. **Dikdörtgen fotoğraf sınıfı kusurun kökü tam olarak budur.**
>    Kullanıcının tarif ettiği yöntem tersi: *önce temeli deterministik hazırla, sonra
>    eklenecek görseli tarif et, sonra gönder.*
> 3. **Hikâye yayı yok.** Metin bir gönderi olarak üretiliyor; kanca → gerilim → çözüm →
>    davet diye bir yapı hiçbir yerde tanımlı değil.

---

## 14.1 — Senaryo: hikâye yayı, karosel kurallarına göre    [ ]

📖 §7.2, §11.4 · R-32
🔗 —
🛠 `metin-uret` bugün bir gönderi metni üretiyor. Karosel bir gönderi değil bir **dizi**:
   kanca (durdurur) → gerilim (sorunu büyütür) → çözüm (bizim payımız) → davet.
   Yay, `metin-uret` çıktısına eklenen bir yapı olarak tanımlanır; slayt rolleri
   (`kapak/govde/kapanis`) ona bağlanır.
📁 `packages/engine/src/senaryo.ts` · `metin-akisi.ts`
✅ ⚠ **Yay ROL üstüne kurulur, rol yayın üstüne değil** — roller zaten var ve ölçülü;
   senaryo onlara *işlev* verir, yeni bir taksonomi getirmez.
   ⚠ Kelime bütçeleri (D-260) geçerli ve **blok TÜRÜNE göre** ölçülür — bu metrikte üç kez
   birim hatası yapıldı, dördüncüsü yapılmasın.
   ⚠ **R-32:** senaryo, kaynaksız sayı üretmenin yolu değil.
🧪 Kancasız senaryo (doğrudan çözümle başlayan) → `kalite` uyarısı.
💾 `feat(engine): senaryo yayi` · `Refs: FAZ-14.1 · §7.2`

## 14.2 — `tasarla` adımı: kararlar GEREKÇESİYLE yazılı    [ ]

📖 §3.5, §7.1 · D-254, D-255
🔗 14.1, 12.7
🛠 Hatta yeni bir adım: `tasarla`, **verb `COMPOSE`** (yeni fiil YOK — `kompozit` ile aynı
   etki sınıfı, iki adım bir fiili paylaşabilir; `metin-uret`/`gorsel-brief` zaten
   `text.generate`'i paylaşıyor). Çıktısı `tasarim-plani.json`: slayt başına **düzen ·
   kompozisyon ailesi · görsel öge tipi · efekt profili · panorama fazı · vurgu**, ve her
   seçim için tek satırlık **gerekçe**.
📁 `packages/contracts/src/tasarim-plani.ts` · `packages/engine/src/verbs/bodies.ts` ·
   `registry/pipelines/instagram-post.pipeline.yaml`
✅ ⚠ **Plan bir SÖZLEŞME, öneri değil.** `render` plandan sapamaz; saparsa 14.4 yakalar.
   ⚠ **Gerekçe alanı ZORUNLU.** *"Bu slaytta diyagram var çünkü içerikte üç adımlı bir akış
   geçiyor."* — bu cümle olmadan seçim denetlenemez.
   ⚠ **DETERMİNİSTİK** (model çağırmaz): aynı senaryo → aynı plan. Golden test bunun üstünde
   durur. Model danışmanlığı ayrı bir karar; buraya karıştırılmaz.
   ⚠ `donmus-plan.json` ile KARIŞTIRILMAZ: o *yürütme* planı (sıra, sağlayıcı, maliyet),
   bu *tasarım* planı. İkisi `derived/runs/` altında yan yana durur ve silinmez (§3.5).
🧪 Gerekçesiz plan → derleme hatası. Aynı senaryoyu iki kez planla → aynı çıktı.
💾 `feat(engine): tasarim plani adimi` · `Refs: FAZ-14.2 · §7.1`

## 14.3 — Sıra düzeltmesi: TABAN önce, model sonra    [ ]

📖 §7.1, §7.2 · R-20, D-241, D-243, D-261
🔗 14.2
🛠 **Hattın en önemli değişikliği.** Bugün: `gorsel-brief` → `gorsel-uret` → `kompozit` →
   `render`. Görsel, gireceği slaydı görmeden doğuyor.
   Yenisi: `tasarla` → `kompozit` → **`taban-render`** → `gorsel-brief` → `gorsel-uret` →
   `yuva-doldur` → `render`. Brief artık **tabanı ve yuvayı görerek** yazılıyor: hangi
   biçim, hangi boyut, hangi renk komşuluğu, çevresinde ne var.
📁 `registry/pipelines/instagram-post.pipeline.yaml` · `packages/engine/src/verbs/bodies.ts`
✅ ⚠ **Görsel üretimi KOŞULLU olur:** plan hiçbir yuvayı `deterministik: false` işaretlemediyse
   `gorsel-uret` HİÇ koşmaz. Bugün her koşuda koşuyor ve çoğu zaman gereksiz — hem kota hem
   tutarlılık kaybı. *"Her ihtimale karşı bir görsel üret"* tam olarak D-261'in kusuruydu.
   ⚠ **R-20 mutlak:** modele giden taban METİN İÇERMEZ. Taban render'da metin varsa
   maskelenir; model metnin üstüne çizerse çıktı REDDEDİLİR, yamanmaz.
   ⚠ **Bu bir RENDER DEĞİŞİKLİĞİDİR** → kabul sayacı 1'e çekilir (kabul-20 kuralı (c)).
   ⚠ İki render adımı iki motor DEĞİLDİR (R-30): aynı Chromium, aynı CSS, iki geçiş.
🧪 Plan hiçbir yuvayı işaretlemesin → `gorsel-uret` atlanır ve koşu yine de tam çıktı verir.
   Metin içeren taban modele gönder → reddedilir.
💾 `feat(engine): taban once model sonra` · `Refs: FAZ-14.3 · §7.1`

## 14.4 — Denetim: plan ile çıktı uyuşuyor mu    [ ]

📖 §7.1 · D-255, D-256, D-259
🔗 14.3, 13.5
🛠 Üç ayrı katman: (a) **uyum** — çıktı planı uyguladı mı; (b) **metrik** — mevcut `kalite`
   ve `tasarim`; (c) **yargı** — `gorsel-yargi` (var) + `design.critique` (13.5).
📁 `packages/render/src/plan-denetim.ts`
✅ ⚠ **Üç katman AYRI kalır.** Uyumsuzluk bir HATA (render bozuk), metrik ihlali bir RET
   (çıktı kabul edilemez), estetik bulgu bir ÖNERİ. Aynı kovaya konursa ya estetik zorunlu
   olur ya hata görmezden gelinir.
   ⚠ ⚠ **Denetim ÜRETİLEN dosyaya bakar, kapının kendi kurgusuna değil** (D-259):
   *"kapı repoyu korur, çıktıyı değil."* `tasarimOlc` yalnız kapıda koşuyordu.
🧪 Planı uygulamayan render → uyum kırmızı, estetik yargı YEŞİL kalabilir (ayrılığın kanıtı).
💾 `feat(render): plan denetimi` · `Refs: FAZ-14.4 · §7.1`

## 14.5 — Yuva doldurma: ret SAYILIR, sonsuz deneme yok    [ ]

📖 §7.2, §8.1 · R-20, D-256, D-261
🔗 14.3, 11.6
🛠 Dönen görsel yuvaya oturur, `image.critique` (mevcut `gorsel-yargi`) ile sınanır, marka
   paletine tabi kılınır (duotone 11.7 ya da vektörleştirme 13.3).
📁 `packages/engine/src/tamamlama.ts`
✅ ⚠ **Üç ret sonrası yuva BOŞ bırakılır** ve plan deterministik alternatife düşer. Sonsuz
   yeniden deneme kotayı çöpe atar — `fdcfde2` dersi (*"üretilen görsel belgeye girmiyordu,
   kota çöpe gidiyordu"*).
   ⚠ **Retler sayılır ve gerekçesi yazılır** (D-256 deseni). Sessizce yutulan ret, olmayan
   rettir.
   ⚠ Alt metin zaten zorunlu (**R-34**): yuvaya oturan görsel de `alt_tr` alır ya da
   `decorative: true` işaretlenir. Yeni iş değil, mevcut kuralın kapsamı.
🧪 Dördüncü denemeyi zorla → hata; yuva boş ve alternatif uygulanmış olmalı.
💾 `feat(engine): yuva doldurma` · `Refs: FAZ-14.5 · §7.2`
