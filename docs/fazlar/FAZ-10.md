# FAZ 10 — Tasarım katmanı: karosel kalitesi ÖLÇÜLÜR

**Amaç:** Karosel çıktısı, göz kararıyla değil **ölçülerek** onaylanabilsin; ölçü
geçtiğinde çıktı referans ailesiyle aynı kalitede olsun.
**Yöneten kararlar:** D-21, D-24, D-254, D-255
**Ön koşul:** FAZ 8 kapalı · `sablon.ts` grameri yerinde (D-254)
**Çıkış kriteri:** **20 ardışık karosel**, hepsinde bloklayıcı tasarım metriği yeşil VE
görsel yargı adımı sıfır kritik bulgu üretiyor — üst üste, düzeltme yapılmadan.

> **Bu faz neden var (D-255):** FAZ 3 "görsel üretebiliyor mu" sorusunu kapattı, "iyi mi"
> sorusunu değil. İkisi ayrı sorudur ve ikincisinin kapısı yoktu: bir slaytın metni eğri
> sınırını kesse, hayalet rakam navigasyonla çakışsa, kapak 12 satırlık bir duvar olsa
> **41 kapının hiçbiri kırmızıya dönmüyordu**. Üçü de gerçekten oldu ve üçünü de ancak
> PNG'ye tek tek bakarak buldum. Göz güvenilir bir kapı değildir: yorulur, alışır,
> gözetimsiz koşuda hiç yoktur.

---

## 10.1 — Tarayıcı oturumu: karosel başına bir Chromium    [ ]

📖 §7.1 · R-30 · D-24
🔗 —
🛠 `withPage` her çağrıda Chromium açıp kapatıyor; `renderStatic` bunu **slayt başına ve
   kalite basamağı başına** çağırıyor. Kapsamlı bir oturum eklenir: bir karosel için bir
   kez açılır, tüm slaytlar basılır, `finally` ile kapanır. **Singleton DEĞİL** — süreç
   ömrü boyunca ayakta duran tarayıcı gözetimsiz koşuda sızıntı biriktirir; `browser.ts`
   içindeki `finally` yorumu tam bunu engellemek için yazılmış ve korunuyor.
📁 `packages/render/src/browser.ts` · `packages/render/src/static.ts`
✅ Ölçüm tekrarlanır ve kayıtlıdır. Bugünkü temel bu makinede ölçüldü:
   `5 slayt · ayrı tarayıcı 3656 ms` · `tek oturum 704 ms` · **5.2x**.
   Kabul: 5 slaytlık karosel render süresi **≥3x** düşüyor, çıktı bayt bazında AYNI.
🧪 Oturum içinde bir sayfa hata fırlatsın → tarayıcı yine kapanıyor (`ps aux | grep
   chromium` boş). Sızdıran bir sürüm yazılıp kırmızıya döndürülür.
💾 `perf(render): karosel başına tek tarayıcı oturumu` · `Refs: FAZ-10.1 · §7.1`

---

## 10.2 — Referansların ölçülmesi: eşikler tahmin edilmez    [ ]

📖 §11.1, §12.1 · R-74 · D-253
🔗 —
🛠 İki referans karosel (`docs/research/referans/*.png`) **ölçülür**: metin kaplama
   oranı, palet dışı piksel payı, farklı tip boyutu sayısı, kenar payı, kontrast oranı.
   Çıktı `docs/referans/tasarim-temeli.md` — her sayı ölçüm komutuyla birlikte.
📁 `scripts/tasarim-temeli.mjs` · `docs/referans/tasarim-temeli.md`
✅ Her eşik bir ÖLÇÜMDEN geliyor, hiçbiri yuvarlak sayı olduğu için seçilmemiş.
   ⚠ **Bu adım 10.3'ten ÖNCE gelmek zorunda.** Chroma tavanında ders alındı (D-253):
   0.156 değeri ölçüldüğü için savunulabildi; tahmin edilseydi ilk itirazda düşerdi.
   Eşiği önce koyup sonra ölçmek, eşiği kendi çıktımıza göre ayarlamak demektir.
🧪 —
💾 `docs(docs): referans karosellerin tasarım temeli` · `Refs: FAZ-10.2 · §11.1`

---

## 10.3 — Tasarım metrikleri ve `tasarim` kapısı    [ ]

📖 §11.1, §7.2 · R-30 · D-255
🔗 10.2 (eşikler oradan gelir)
🛠 İki katmanlı ölçüm. **Model katmanı** (saf, ucuz, her koşuda): belge modeli +
   `SlaytKimligi`den hesaplanır. **Piksel katmanı** (render sonrası): mevcut
   `qa/pixels.ts` üstüne. Kapı ikisini de okur; **bloklayıcı** olanlar aşağıda.
📁 `packages/render/src/tasarim-olcum.ts` · `scripts/gates/tasarim.mjs`
✅ Tablodaki her metrik hesaplanıyor ve kapı eşiği aşanı REDDEDİYOR:

| # | Metrik | Eşik | Katman | Sınıf |
|---|---|---|---|---|
| T1 | `notdef` glif sayısı | **0** | piksel | bloklayıcı |
| T2 | Metin kutusu ↔ eğri bandı kesişimi | **0 px** | model | bloklayıcı |
| T3 | Hayalet rakam ↔ alt şerit örtüşmesi | **0 px** | model | bloklayıcı |
| T4 | Gövde metni / zemin kontrastı | **≥ 4.5:1** | model | bloklayıcı |
| T5 | İçerik ↔ kenar payı | **≥ 88 px** | model | bloklayıcı |
| T6 | Kullanılan font ailesi sayısı | **= 2** | model | bloklayıcı |
| T7 | Komşu iki slaytta aynı zemin | **0 çift** | model | bloklayıcı |
| T8 | Kelime: kapak / gövde / kapanış | **≤8 / ≤30 / ≤14** | model | bloklayıcı |
| T9 | Metin kaplama oranı | *10.2'den* | piksel | uyarı |
| T10 | Palet dışı piksel payı | *10.2'den* | piksel | uyarı |
| T11 | Farklı tip boyutu sayısı | *10.2'den* | model | uyarı |
| T12 | ΔE2000, marka kehribarına | **≤ 5.0** | piksel | uyarı |

   **Neden T2–T3–T8 bloklayıcı:** üçü de bu hafta GERÇEKTEN oldu. Bir kapı, olmuş bir
   hatayı yakalamıyorsa kapı değil, temennidir.
   **Neden T9–T12 uyarı:** estetik tercih payı var; sıfır tolerans, meşru bir tasarımı
   reddeder. Uyarılar sayılır ve teslimat görünümünde raporlanır.
🧪 T2'yi kasten ihlal et (`guvenliMetinYuzdesi`'ni 70 yap) → kapı kırmızı, çıktıda
   ihlal eden slayt ve piksel bandı yazılı. T6, T7, T8 için de birer ihlal koşulur.
💾 `feat(gates): tasarım metrikleri ve kapısı` · `Refs: FAZ-10.3 · §11.1`

---

## 10.4 — İçerik-güdümlü düzen seçimi    [ ]

📖 §7.1 · R-30 · D-254
🔗 10.3
🛠 `LayoutEnum` **kapalı kalır** (bu bilinçli bir karar, gevşetilmiyor); düzeni içerikten
   seçen **saf** bir fonksiyon eklenir. Slayt rolü (kapak/gövde/kapanış) teslimat
   damgasında zaten var, `renderBody`ye taşınır. Seçim kuralları:
   sayı içeren cümle → istatistik · sıralı liste → adım · güçlü vurgu → çıkarım kutusu ·
   "önce/sonra" dili → karşılaştırma.
📁 `packages/render/src/layout/secim.ts` · `packages/engine/src/verbs/bodies.ts`
✅ Saf fonksiyon, girdi→çıktı tablosuyla test edilmiş. Aynı içerik her zaman aynı düzeni
   veriyor (deterministik). Enum'a yeni değer EKLENMİYOR — kapı bunu doğruluyor.
🧪 Enum dışı bir düzen adı döndür → derleme hatası.
💾 `feat(render): düzen içerikten seçiliyor` · `Refs: FAZ-10.4 · §7.1`

---

## 10.5 — Görsel yargı: `image.critique` yeteneği    [ ]

📖 §8.2, §11.1 · R-14 · D-255
🔗 10.3 (metrikler önce; yargı, ölçülemeyeni ölçer)
🛠 **Yeni bir YETENEK, yeni bir fiil DEĞİL** — `GENERATE` altında çalışır, ölçülür,
   maliyeti önden görünür, defter yazar. Girdi: render edilmiş slayt PNG'si + tasarım
   kuralları. Çıktı: **yapılandırılmış** bulgu listesi, serbest metin değil:
   `{ slayt, bolge: [x, y, w, h], kategori, siddet }`.
📁 `registry/providers/*.provider.yaml` · `packages/engine/src/verbs/bodies.ts` ·
   `packages/engine/src/gorsel-yargi.ts`
✅ **Sınırlayıcı kutu ZORUNLU.** Kutusuz bulgu reddediliyor — akademik taraf bu konuda
   net (UICrit, ReLook) ve bu turda ampirik olarak doğrulandı: bulduğum dört kusurun
   dördü de bölgeye bağlıydı ve o yüzden düzeltilebildiler. *"Kompozisyon dengesiz"*
   eyleme çevrilemez; *"kapakta 120–460 px bandında metin eğri sınırını geçiyor"*
   çevrilebilir.
   Bulgular teslimat görünümüne ve tolerans okuması panosuna düşüyor.
🧪 Kutusuz bir bulgu enjekte et → reddediliyor. Bilerek kusurlu bir slayt (metin sınırı
   kesen) verilince kritik bulgu ÜRETİYOR — sessizce "temiz" demiyor.
💾 `feat(engine): görsel yargı yeteneği` · `Refs: FAZ-10.5 · §11.1`

---

## 10.6 — Referans görselden şablon parametresi    [ ]

📖 §7.1, §4.1 · R-30 · D-254
🔗 10.5 (yargı olmadan türetilenin iyi olduğu ölçülemez)
🛠 Girdi bir referans karosel görseli; çıktı `sablon.ts`in okuduğu **parametre kümesi**:
   renk rolleri, eğri bandı, tip ölçeği, ızgara ölçüleri, mikro öge yerleşimi.
📁 `packages/render/src/sablon-turet.ts` · `brand/brd_upcytech/sablonlar/`
✅ ⚠ **Çıktı HTML OLAMAZ.** Alandaki sekiz projenin hepsi referanstan HTML üretiyor ve o
   an golden tipografi metriği ölçülemez, Türkçe kapıları delinir, `COMPOSE`/`RENDER`
   sınırı silinir. Çıktı VERİ olursa aynı referans her zaman aynı grameri verir.
   Kabul: aynı referans iki kez verildiğinde bayt bayt aynı parametre kümesi.
🧪 HTML döndüren bir sürüm yaz → kapı kırmızı.
💾 `feat(render): referanstan şablon parametresi` · `Refs: FAZ-10.6 · §7.1`

---

## 10.7 — Kabul koşusu: 20 ardışık karosel    [ ]

📖 §15 · D-255
🔗 10.1–10.6
🛠 Yirmi farklı konuda karosel üretilir. Her biri için: tasarım kapısı + görsel yargı +
   **benim slayt slayt incelemem**. Sonuç `docs/referans/kabul-20.md`'ye yazılır —
   geçen ve DÜŞEN her koşu, düşme sebebiyle.
📁 `scripts/kabul-kosusu.mjs` · `docs/referans/kabul-20.md`
✅ **Sayaç sıfırlanır.** Bir koşu bloklayıcı metrikten düşerse ya da görsel yargı kritik
   bulgu verirse sayaç 0'a döner; kusur düzeltilir, baştan sayılır. Yirmi ardışık temiz
   koşu = faz kapanır ve göz kontrolü bırakılır.
   ⚠ **"20 üretildi, 17'si iyiydi" GEÇMEZ.** Ardışıklık şartı, düzeltilen kusurun
   gerçekten kapandığını kanıtlayan tek şeydir; oran, kuyruğu gizler.
🧪 —
💾 `docs(docs): 20 ardışık kabul koşusu` · `Refs: FAZ-10.7 · §15`
