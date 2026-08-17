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

## 10.1 — Tarayıcı oturumu: karosel başına bir Chromium    [x] 2026-08-17

📖 §7.1 · R-30 · D-24
🔗 —
🛠 `renderStatic` slayt başına VE kalite basamağı başına Chromium açıyordu. Kapsamlı
   oturum: karosel başına bir kez açılır, `finally` ile kapanır. **Singleton DEĞİL** —
   süreç ömrü boyunca yaşayan tarayıcı gözetimsiz koşuda sızıntı biriktirir.
📁 `packages/render/src/browser.ts` · `packages/render/src/static.ts`
✅ **ÖLÇÜLDÜ** (aynı belge, iki yol, sha256 karşılaştırmalı): `oturumsuz 3795 ms` ·
   `oturumlu 776 ms` · **4.9x** (kabul ≥3x) · çıktı **bayt bayt özdeş**. Gerçek koşu
   5 slayt üretti, hepsi tolerans içi; `pgrep -fc chromium` 32 → 29, birikme yok.
🧪 **KOŞULDU.** Oturumun içinde kasten `throw` → `ok: false · render_failed · kasten
   fırlatıldı`, `chromium önce=32 sonra=32` → sızıntı yok. `finally` başarı yolunda
   değil HER yolda kapatıyor; hata yutulmuyor, tipli dönüyor.
💾 `perf(render): karosel başına tek tarayıcı oturumu` · `Refs: FAZ-10.1 · §7.1`

---

## 10.2 — Referansların ölçülmesi: eşikler tahmin edilmez    [x] 2026-08-17

📖 §11.1, §12.1 · R-74 · D-253
🔗 —
🛠 Referans karoseller **ölçülür**; çıktı `docs/referans/tasarim-temeli.md`, her sayı
   ölçüm komutuyla birlikte.
📁 `scripts/tasarim-temeli.mjs` · `docs/referans/tasarim-temeli.md`
✅ **ÖLÇÜLDÜ** — `docs/referans/tasarim-temeli.md`. 3 bölge, palet dışı
   `9.5 · 13.8 · 20.4%`. Ölçüm **kendi çıktımızı ölçen fonksiyonla** (`pixelStats`).
   **Sonuç eşikten değerli — üç ret:** T9/T11 referanstan TÜRETİLEMEZ (biri belge
   modeli tabanlı, diğeri pikselden sayılamaz) · T10 görsel bloklarını DIŞLAMALI
   (bir slayt %24.8 verdi, bakıldı, alanın %60'ı AI fotoğrafıydı) · metin sütununu
   daraltmak Türkçede metni daraltmıyor → 10.2b.
🧪 **Ölçüm aracının KENDİSİ ihlal edildi.** Kova MERKEZİ palet girdisi yapılınca
   yuvarlama hatası ΔE 5.28 > `paletteMatch` 5.0 → her baskın renk "palet dışı", ölçüm
   %97.8 ve **iki farklı tasarıma AYNI sayı**. Ortalamaya geçildi. Betik ayrıca ikiden
   az bölgede DURUYOR: ilk sürüm sessizce 2 bölge bulup raporu yine yazıyordu.
💾 `docs(docs): referans karosellerin tasarım temeli` · `Refs: FAZ-10.2 · §11.1`

---

## 10.2b — Tip ölçeği: en uzun Türkçe kelime güvenli sütuna SIĞMALI    [x] 2026-08-17

📖 §7.2, §12.2 · R-23, R-30 · D-255
🔗 10.2 (kusur orada ölçüldü)
🛠 Kapak metni hâlâ eğriyi kesiyor ve sebep **kutu değil PUNTO**: kelime bölünmez,
   kutudan taşar (R-23). Temsili uzun Türkçe kelimeler render edilip ÖLÇÜLÜR, güvenli
   sütuna sığan en büyük punto seçilir.
📁 `packages/render/src/static.ts` · `packages/render/src/sablon.ts` ·
   `packages/render/src/sablon.test.ts` · `scripts/tip-olcegi.mjs` ·
   `docs/referans/tip-olcegi.md`
✅ **ÖLÇÜLDÜ** — 14 gerçek kelime (corpus'tan, uydurulmadı) × 10 punto.
   `%36 sütun → 301 px içerik → HİÇBİR punto sığmıyor` · `%62 → 582 px → 64 px`.
   76 px'te en geniş kelime `taşıyabileceğimizin` **665 px**: eski ayarda %120 taşma vardı.
   Uygulandı: bant %44–56 → **%69–78**, sütun **%62**, `h1` **64 px**. Otomatik küçültme
   YAZILMADI (R-30). Dört rol de render edildi ve GÖZLE doğrulandı: metin dört slaytta
   da tek alanın içinde.
   **İki yan kusur daha çıktı ve ikisi de aynı sınıftan** — renk, altında durduğu alandan
   değil zeminden seçiliyordu:
   1. **Hayalet rakam görünmezdi**: dört rolün ÜÇÜNDE `motif` dolgu rengiyle aynıydı.
      Bant ortadayken kusur gizliydi (rakam iki alana taşıyordu); bant kenara kayınca
      tamamen kayboldu. `motif` artık `kontrast(karsiAlan)`den TÜRETİLİYOR.
   2. **Kulp/sayaç/nav kontrastı çöküyordu**: kapanışta kâğıt kulp amber dolgu üstünde
      ~1.9:1 veriyordu. Üçü de artık altındaki alana göre renkleniyor.
🧪 **ÜÇ İHLAL KOŞULDU**, üçü de kırmızı: dar sütuna dönüş → 2 test düştü · motif = dolgu
   rengi → `motif, üstünde durduğu alanla AYNI renk olamaz` düştü · aynalama kaldırıldı →
   2 test düştü. ⚠ Bu test dosyası **1359 test hiçbir şey yakalamadığı için** yazıldı:
   geometriyi ve puntoyu değiştirdim, tek bir test bile kırılmadı.
💾 `fix(render): tip ölçeği en uzun Türkçe kelimeden türetiliyor` · `Refs: FAZ-10.2b · §7.2`

---

## 10.3 — Tasarım metrikleri ve `tasarim` kapısı    [x] 2026-08-17

📖 §11.1, §7.2 · R-30 · D-255
🔗 10.2 (eşikler ve ölçüm tanımı oradan)
🛠 İki katmanlı ölçüm. **Model katmanı** (saf, ucuz, her koşuda): belge modeli +
   `SlaytKimligi`den hesaplanır. **Piksel katmanı** (render sonrası): mevcut
   `qa/pixels.ts` üstüne. Kapı ikisini de okur; **bloklayıcı** olanlar aşağıda.
📁 `packages/render/src/tasarim-olcum.ts` · `scripts/gates/tasarim.mjs`
✅ **KOŞUYOR** — `✓ tasarim: 23 okuma tolerans içi`. Çıktı `QaReport`, komuta
   merkezindeki tolerans yüzeyiyle AYNI şekil. Kapı ÇALIŞTIRMAYI değil GRAMERİ
   denetliyor: üretim hiç yapılmasa bile gerilemeyi yakalıyor.
   ⚠ **T11 ilk sürümde YANLIŞ ŞEYİ ölçtü** — HTML'deki her `font-size`ı sayıp 11
   buluyordu (sayaç 26, kulp 24, nav 24, hayalet 560). Onlar krom; yalnız `h1/h2/p` → 3.
   Tablodaki her metrik hesaplanıyor, eşiği aşan REDDEDİLİYOR:

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
| T9 | Metin kaplama oranı | **≤ %20** | model | uyarı |
| T10 | Palet dışı — **görsel bloklar hariç** | **≤ %15** | piksel | uyarı |
| T11 | Farklı tip boyutu sayısı | **≤ 3** | model | uyarı |
| T12 | ΔE2000, marka kehribarına | **≤ 5.0** | piksel | uyarı |

   **T2–T3–T8 bloklayıcı çünkü üçü de bu hafta GERÇEKTEN oldu**; olmuş bir hatayı
   yakalamayan kapı, temennidir. **T9–T12 uyarı** çünkü estetik tercih payı var ve sıfır
   tolerans meşru bir tasarımı reddeder.
   ⚠ **Eşikler 10.2'den GELMEDİ — bu ölçümün sonucu, başarısızlık değil:** T9 model
   tabanlı (Meta reklam kuralı), T11 kendi gramerimizin kısıtı, T10 yürürlükteki palet
   limiti. İyileştirdiğini iddia eden bir sayı, kaynağı unutulduğunda ölçüm sanılırdı.
🧪 **DÖRT İHLAL KOŞULDU**, dördü de kırmızı ve okuma eyleme çevrilebilir:
   `slayt 1 metin taşması 191,0 px │ limit 0,0` · `komşu slaytta aynı zemin 2,0 çift` ·
   `slayt 1 kelime (kapak) 16,0 │ limit 8,0` · `slayt 1 metin kontrastı 1,1:1 │ limit 4,5`.
   T2 ve T7 kalıcı ihlal bataryasına eklendi.
   ⚠ **Bataryanın `durum` girdileri de düzeltildi:** çapaları `siradaki_adim: 10.1` idi ve
   o değer her turda değişiyor — ikinci turda "yama hedefi bulunamadı" verdiler. Çapa
   kapının KAYNAĞINA taşındı. Her tur kırılan bir ihlal testi, ihlal testlerini görmezden
   gelmeyi öğretir; kırılgan bir kapı kapatılmış bir kapıdır.
💾 `feat(gates): tasarım metrikleri ve kapısı` · `Refs: FAZ-10.3 · §11.1`

---

## 10.4 — İçerik-güdümlü düzen seçimi    [x] 2026-08-17

📖 §7.1 · R-30 · D-254
🔗 10.3
🛠 `LayoutEnum` **kapalı kalır** (bu bilinçli bir karar, gevşetilmiyor); düzeni içerikten
   seçen **saf** bir fonksiyon eklenir. Slayt rolü (kapak/gövde/kapanış) teslimat
   damgasında zaten var, `renderBody`ye taşınır. Seçim kuralları:
   sayı içeren cümle → istatistik · sıralı liste → adım · güçlü vurgu → çıkarım kutusu ·
   "önce/sonra" dili → karşılaştırma.
📁 `packages/render/src/layout/secim.ts` · `secim.test.ts` ·
   `packages/render/src/layout/adlar.ts` ·
   `packages/render/src/deck/pdf.ts` · `packages/engine/src/verbs/bodies.ts` · `scripts/uret.mjs`
✅ **ÜRETİM YOLUNA BAĞLANDI** — `uret.mjs` artık `layout: null` geçiyor (`null` = bir
   düzen adı değil, bir seçim KİPİ; enum'a `'auto'` eklemek onu kapalı olmaktan çıkarırdı).
   Seçim HER slayt için yeniden yapılıyor, bir kez değil. Ölçülen etki: 6 maddelik bir
   kontrol listesi **3 slayttan 2'ye** indi — sabit `'statement'` bütçesi içeriği
   istemediği yerden bölüyordu. 16 test, girdi→çıktı tablosu biçiminde.
   ⚠ **Planımdaki çelişki düzeltildi:** taslak "istatistik · adım · çıkarım kutusu ·
   karşılaştırma" diyordu — dördü de enum'da YOK ve aynı adımın kabul ölçütü "enum'a
   yeni değer eklenmiyor" diyordu. Doğru olan enum'u büyütmek değil, sinyalleri var olan
   dört düzene EŞLEMEK: bir "istatistik slaydı" zaten `claim-proof`tur.
🧪 **İKİ İHLAL KOŞULDU**, ikisi de kırmızı: öncelik sırası bozuldu → 2 test düştü ·
   enum dışı değer döndürüldü → 4 test düştü.
   ⚠ Testin kendisi **benim hatamı yakaladı**: `SAYISAL` deseni `4%` arıyordu, oysa
   Türkçede işaret sayıdan ÖNCE gelir (`%4`) ve bir kanıt cümlesi `statement` sanılıyordu.
   İngilizce sıradan devralınan her varsayım Türkçede bir kez daha sınanmalı.
💾 `feat(render): düzen içerikten seçiliyor` · `Refs: FAZ-10.4 · §7.1`

---

## 10.4b — Düzen adları görsel vaat taşıyor, motor karşılamıyor    [x] 2026-08-17

📖 §7.1 · R-30 · D-254
🔗 10.4
🛠 `LAYOUT_SPECS`in üç alanı da yalnız BÖLME kararına giriyor; `static.ts` `layout`u
   hiç görmüyor — `quote` seçmek alıntı gibi GÖRÜNMÜYOR. Adlar bir kompozisyon vaat
   ediyor, motor sayfalama bütçesi veriyor. Her düzen kendi kompozisyonunu alacak.
📁 `packages/render/src/sablon.ts` · `packages/render/src/static.ts` ·
   `packages/contracts/src/layout.ts` · `packages/kernel/src/doc/model.ts`
✅ **DÖRT DÜZEN RENDER EDİLDİ VE TEK TEK BAKILDI**, fark görsel: `statement` 64 px alta
   yaslı · `quote` 64 px ortalı + dev açılış tırnağı · `list` 46 px üste yaslı + madde
   ritmi · `claim-proof` 56 px + ilk gövde bloğu KANIT ŞERİDİ (sol kenar çizgisi).
   Düzen `SlaytKimligi.duzen`de taşınıyor: **rol, çizim değil** — model `quote` diyor,
   tırnağı `sablon.ts` çiziyor (D-254). Adlar `@suite/contracts`a taşındı çünkü kernel
   (ring 0) render'dan (ring 2) import edemez; tipi `string` yapmak halka kuralını
   çözmek değil DELMEK olurdu.
🧪 **İKİ İHLAL KOŞULDU**, ikisi de kırmızı: bir düzen punto tavanını (64) aştı →
   `hiçbir düzen ölçülen punto TAVANINI aşamaz` düştü · iki düzen aynı kompozisyonu
   verdi → `dört düzen BİRBİRİNDEN ayırt edilebilir` düştü.
   ⚠ **İki kusur render edilip GÖRÜLEREK bulundu:** (1) dev tırnak `.icerik::before` ile
   mutlak konumdaydı ve `.icerik` tam yükseklikte olduğu için çerçevenin tepesine düşüp
   KIRPILIYORDU → başlığın kendi `::before`ı olarak akışa alındı. (2) üste yaslı içerik
   sayaçla aynı bantta başlıyordu; bu metinde çakışmıyordu ama bir kelime daha uzun
   olsaydı binerdi — **çakışmayan bir çakışma, henüz görülmemiş bir çakışmadır**.
💾 `feat(render): düzenler kendi kompozisyonunu alıyor` · `Refs: FAZ-10.4b · §7.1`

---

## 10.5 — Görsel yargı: `image.critique` yeteneği    [x] 2026-08-17

📖 §8.2, §11.1 · R-14 · D-255
🔗 10.3 (metrikler önce; yargı, ölçülemeyeni ölçer)
🛠 **Yeni YETENEK, yeni fiil DEĞİL** — `GENERATE` altında koşar, ölçülür, defter yazar.
   Girdi: slayt PNG'si + gramer kuralları. Çıktı **yapılandırılmış**:
   `{ slayt, bolge: [x,y,w,h], kategori, siddet }` — serbest metin değil.
📁 `packages/engine/src/gorsel-yargi.ts` · `packages/engine/src/verbs/bodies.ts` ·
   `packages/providers/src/claude-code.ts` · `packages/render/src/browser.ts` ·
   `registry/pipelines/instagram-post.pipeline.yaml`
✅ **GERÇEK KOŞU YAPILDI** — `3 bulgu · 0 reddedildi`, üçü de sınırlayıcı kutulu, üçü de
   DOĞRU ve üçü de düzeltildi. En önemlisi **hiçbir metriğin görmediği** ve HER varlığı
   etkileyen bir kusurdu: Chromium alt-piksel yumuşatması harf kenarlarına renk saçağı
   bırakıyordu. Ölçüldü: **%6,6 → %0,0** (`--disable-lcd-text`).
   Hat adımı bağlı (`render` → `gorsel-yargi` → `kalite`), `fiil-haritasi` yeşil.
   ⚠ **`Read` aracı ÖLÇÜLEREK gerekti:** araçsız çağrı 5 dk'da dönmedi (etkileşimsiz
   kipte izin istemi asılıyor), `--allowedTools Read` ile 18 sn. Yalnız `Read`, yalnız
   BU yetenek — metin üretimi aracı almıyor.
🧪 **22 test, çoğu RED disiplini**: kutusuz · üç elemanlı · metin içeren · sıfır genişlik ·
   tuval dışı · negatif konum · liste dışı kategori/şiddet · boş açıklama · nesne olmayan
   → hepsi reddediliyor ve SEBEBİYLE sayılıyor. Karışık girdide geçerli bulgu korunuyor.
💾 `feat(engine): görsel yargı yeteneği` · `Refs: FAZ-10.5 · §11.1`

---

## 10.6 — Referans görselden şablon parametresi    [ ]

📖 §7.1, §4.1 · R-30 · D-254
🔗 10.5 (yargı olmadan türetilenin iyi olduğu ölçülemez)
🛠 Girdi bir referans karosel görseli; çıktı `sablon.ts`in okuduğu **parametre kümesi**:
   renk rolleri, eğri bandı, tip ölçeği, ızgara ölçüleri.
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
