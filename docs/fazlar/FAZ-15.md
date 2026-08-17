# FAZ 15 — Katalog merkezli üretim: dolu taslak, seçim, uyarlama

**Amaç:** Katalog sistemin merkezi olur. Şablon boş iskelet değil **dolu taslaktır**;
hat konuya göre birini SEÇER, agent onu **çoğaltıp düzenler**, kendi işini denetler.
**Yöneten kararlar:** D-268 · D-254 · Yasa 13
**Ön koşul:** panorama render + katalog kaydı var (FAZ-13 kapandı)
**Çıkış kriteri:** 15.1–15.10 tikli · altı şablon örnek belgesiyle render ediliyor ·
hat konudan bitmiş karosele kesintisiz koşuyor · eski slayt-başına yol arşivde

> **Sıra bağlayıcı.** 15.2 malzemeyi kurar, 15.3 taşıyıcıyı, 15.4 içeriği doldurur.
> 15.5–15.8 hattı bağlar. 15.9 eskiyi gömer, 15.10 belgeler. Atlanan adım sonrakini boşa
> çıkarır: örneksiz bir şablon seçilemez, seçilemeyen bir şablon uyarlanamaz.

---

## 15.1 — Envanter ve karar: ne kurulacak, ne kurulmayacak    [x]

📖 §17, §3.8 · R-75
🛠 "Muazzam tasarım için ne yüklemeli" sorusunun **ölçülmüş** cevabı. Bulgu şimdiden
   net: `Archivo` **değişken genişlik (62–125)** ve `Inter` değişken ağırlık zaten
   depoda — panorama ikisini de SABİT kullanıyor. Yani eksik olan kütüphane değil,
   **kullanılmayan eksen**. Aynı soru şunlar için tek tek cevaplanır ve her ret
   gerekçesiyle §17'ye yazılır: ikon seti (çizim mi, OFL/ISC set mi), doku/gren
   (SVG `feTurbulence` yerel — bağımlılık gereksiz), renk uzayı (OKLCH token'ları var),
   grafik kütüphanesi (panel HTML'i 40 satır — R-75 reddeder).
📁 `packages/render/src/fonts.ts` · `docs/ANAYASA.md` §17 · `KARARLAR.md`
✅ Her aday için **kur / kurma** kararı gerekçeli yazıldı · kurulanların lisansı OFL/ISC/MIT
🧪 Kurulan bir bağımlılık varsa `deps` kapısı onu tanıyor; yoksa `deps` hâlâ boş
💾 `docs(docs): katalog malzeme envanteri` · `Refs: FAZ-15.1 · §17`

## 15.2 — Tipografi ekseni açılıyor — genişlik, ağırlık, optik    [x]

📖 §12.3, §7.2 · R-21, R-23
🔗 FAZ-15.1
🛠 `Archivo`nun `wdth` ekseni ve `Inter`in `wght`/`opsz`i şablon dilinde **parametre**
   olur. Poster kapağı `wdth 118`, dar sütun `wdth 78`; rakam panelleri `tnum` ile
   hizalanır. ⚠ Genişlik ekseni R-23'ü DELMEZ: en uzun Türkçe kelimenin güvenli sütuna
   sığması hâlâ ölçülen tavan, eksen yalnız o tavanın altında oynar.
📁 `packages/render/src/fonts.ts` · `packages/render/src/panorama.ts`
✅ Kapak başlığı ve gövde ölçülebilir biçimde AYRI genişlikte · `tnum` panellerde açık
🧪 `wdth 125` iste ve en uzun Türkçe kelimeyi ver → sütun taşmıyor, punto düşüyor
💾 `feat(render): degisken eksen tipografi` · `Refs: FAZ-15.2 · §12.3`

## 15.3 — Zemin dili: degrade, doku, gren, karışım    [x]

📖 §12.1, §12.4
🔗 FAZ-15.2
🛠 "Arkaplanlar sıradan olmayacak." Zemin bir token değil bir **reçete** olur:
   çok-duraklı degrade (rampadan türeyen), ışık odağı, `feTurbulence` gren, `mix-blend-mode`
   katmanı, kenar vinyeti. ⚠ Chroma tavanı HER durak için ayrı ölçülür (FAZ-12.9 dersi).
   ⚠ Gren bantlaşmayı gizleyen bir DÜZELTMEdir, süs değil — kaldırılırsa bantlaşma döner.
📁 `packages/render/src/panorama.ts` · `packages/render/src/sablon-degrade.ts`
✅ Altı şablonun altısı kendi zemin reçetesini taşıyor · hiçbiri düz token dolgu değil
🧪 Rampa dışı bir durak yaz → chroma kapısı kırmızı
💾 `feat(render): zemin recetesi — degrade doku gren` · `Refs: FAZ-15.3 · §12.1`

## 15.4 — Katalog dolu taslağa dönüyor — `ornek: PanoramaBelgesi`    [x]

📖 §7.1 · D-268 · Yasa 13
🔗 FAZ-15.3
🛠 **Bu adım fazın kalbi.** `KatalogSablonu` bugün yalnız TARİF ediyor. Ona tam bir
   `ornek: PanoramaBelgesi` eklenir: gerçek Türkçe başlıklar, gerçek gövde, gerçek panel
   verisi, gerçek hayalet rakam, gerçek görsel briefleri, gerçek bant noktaları.
   ⚠ **Sebep:** agent sıfırdan kompozisyon kurmayacak; **çoğaltıp düzenleyecek.** Boş bir
   iskelet her koşuda yeniden icat demektir ve icat, kalitenin en oynak yeridir.
   ⚠ Örnek içerik **kaynağını beyan eder** (`kaynak` + panel başına `rayaOrta`) — R-32:
   kaynaksız sayı örnekte de yayınlanamaz.
📁 `packages/contracts/src/katalog.ts` · `packages/render/src/katalog-ornek.ts`
   ⚠ Örnek `render`da, kayıt `contracts`ta: `PanoramaBelgesi` render'ın tipi ve contracts
   onu göremez (halka sırası). Bağ, aynı `id` ve iki yönlü bir eşleşme testi.
✅ Altı girişin altısında `ornek` dolu · her biri tek başına render edilip BAKILDI
🧪 Örneği R-32 ihlal edecek şekilde kaynaksız bırak → `iddia` kapısı kırmızı
💾 `feat(contracts): katalog dolu taslak — ornek belgeler` · `Refs: FAZ-15.4 · §7.1`

## 15.5 — Altı şablon tek tek mükemmelleştiriliyor    [x]

📖 §7.1, §12
🔗 FAZ-15.4
🛠 Her şablon **render edilir ve BAKILIR** (metrik yeşilken çıktı kırık olabilir).
   Bilinen açıklar: `donen` köşe süslemesi yok · `memphis` leke ritmi kart içinde kalıyor ·
   `editoryal` boşluğu taşımıyor · `sahne` okları zayıf · `akan-alan` hayalet rakamı düz.
   Ölçüt tek: **ikon, tablo, panel, süsleme — hiçbiri jenerik durmayacak.** Her öge ya
   içerikten türeyecek ya silinecek.
📁 `packages/render/src/panorama.ts` · `packages/render/src/katalog-ornek.ts`
✅ Altı şerit yan yana konuldu; hiçbiri diğerinin boyanmış hâli değil (çeşitlilik ≥ 0,6)
🧪 Bir şablonun taşıyıcı ögesini sil → kesintisizlik ölçümü o şablonu kırmızıya çeviriyor
💾 `feat(render): alti sablon — tasarim kalitesi` · `Refs: FAZ-15.5 · §7.1`

## 15.6 — Şablon seçimi hattın merkezine giriyor    [ ]

📖 §6, §7.1 · D-268
🔗 FAZ-15.5
🛠 Yeni adım `sablon-sec`: üretilmiş **içeriğin şekline** göre katalogdan şablon seçer —
   sayı yoğunsa `veri-hikayesi`, ürün varsa `donen`, tek güçlü fotoğraf varsa `editoryal`,
   liste/ritim varsa `memphis`. ⚠ Seçim **gerekçe yazar** (`neden`), yoksa denetlenemez.
   ⚠ `kullanilabilir.durum === false` olan şablon seçilemez — kapalı şablon öneri değil.
   ⚠ Serbest üretim yolu KALDIRILIR: katalog dışı kompozisyon temsil edilemez olacak.
📁 `packages/engine/src/plan/tasarla.ts` · `packages/engine/src/run.ts`
✅ Aynı metin iki farklı şekilde verilince İKİ farklı şablon seçiliyor · gerekçe defterde
🧪 Katalog dışı bir şablon id'si zorla → hat reddediyor, sessizce varsayılana düşmüyor
💾 `feat(engine): sablon secimi — katalog merkezli` · `Refs: FAZ-15.6 · §6`

## 15.7 — Uyarlama: agent örneği çoğaltıp konuya göre düzenliyor    [ ]

📖 §5.4, §7.1 · R-01
🔗 FAZ-15.6
🛠 Yeni adım `sablon-uyarla`. Girdi: seçilen şablonun `ornek` belgesi + konu + metin.
   Çıktı: **aynı yapıda** yeni `PanoramaBelgesi`. Agent kompozisyonu değil **içeriği**
   değiştirir: başlıklar, gövde, panel verisi, hayalet, brief'in konuya özgü kısmı.
   ⚠ Yapısal alanlar (bant noktaları, görsel konumları, `slaytGenisligi`) uyarlamada
   **kilitli** — agent onları yazamasın diye şemadan çıkarılır (yoklukla zorlama).
📁 `packages/engine/src/steps/` · `packages/contracts/src/`
✅ Aynı şablon iki ayrı konuyla uyarlandı; kompozisyon aynı, içerik tamamen farklı
🧪 Uyarlama çıktısına bant noktası ekletmeyi dene → şema reddediyor
💾 `feat(engine): sablon uyarlama adimi` · `Refs: FAZ-15.7 · §5.4`

## 15.8 — Son kontrol ve düzeltme turu    [ ]

📖 §11, §13 · R-71
🔗 FAZ-15.7
🛠 Hat render'dan sonra durmaz: agent çıktıya **bakar** (glif, kontrast, taşma,
   kesintisizlik, kaynak), bulduğu kusuru `duzelt` adımına verir, bir kez daha render eder.
   ⚠ **Tavan İKİ tur** — "sorun bul" diyen agent her turda sorun bulur (kayıtlı ders).
   ⚠ Düzeltme yalnız İÇERİK alanlarına dokunabilir; kompozisyonu değiştiremez.
📁 `packages/engine/src/steps/` · `packages/render/src/qa/`
✅ Kasten bozuk bir örnek (taşan başlık) hatta verildi → tur onu buldu ve düzeltti
🧪 Üçüncü tur iste → hat reddediyor, ikide duruyor
💾 `feat(engine): son kontrol ve duzeltme turu` · `Refs: FAZ-15.8 · §11`

## 15.9 — Eski sistem öldürülüyor ve arşivleniyor    [ ]

📖 §3.5, §16 · R-12, Yasa 10
🔗 FAZ-15.8
🛠 Slayt-başına render yolu (`sablon.ts` grameri + `AileProfili` sekiz aile + `aileSec`)
   emekliye ayrılır. ⚠ **Emeklilik silme değildir (Yasa 10):** kod
   `docs/arsiv/slayt-basina-render/` altına gerekçesiyle taşınır, kararı `KARARLAR.md`
   taşır, testleri arşive gider. ⚠ Bağımlı kapılar (`tasarim`, `cesitlilik`, goldenlar)
   panoramaya yönlendirilir — kapı silinmez, hedefi değişir.
📁 `packages/render/src/sablon*.ts` · `packages/contracts/src/aile.ts` · `scripts/gates/`
✅ Üretim yolunda tek render motoru kaldı (Yasa 4) · arşiv gerekçeli · kapı sayısı düşmedi
🧪 Arşivden bir modülü import etmeye çalış → `dependency-cruiser` reddediyor
💾 `refactor(render): slayt-basina yol emekli — panorama tek motor` · `Refs: FAZ-15.9 · §16`

## 15.10 — Mimari denetimi ve kullanım belgesi    [ ]

📖 §3, §7.1
🔗 FAZ-15.9
🛠 Dosya yapısı ve katman sınırları yeniden okunur: katalog `contracts`ta mı olmalı,
   örnek belgeler ayrı dosyada mı, `render` ring-0'a sızıyor mu. Sonra **kullanım
   belgesi**: konu → içerik → şablon seçimi → uyarlama → görsel → render → denetim →
   düzeltme → final, her adımın girdi/çıktısıyla. ⚠ Belge üretilmiş dosyaya değil,
   gerçek bir koşunun defterine dayanır — anlatılan hat ile koşan hat aynı olmalı.
📁 `docs/ANAYASA.md` §7.1 · `CLAUDE.md` · `DURUM.md`
✅ Gerçek bir koşu baştan sona belgeyle satır satır eşleşiyor · `citations` yeşil
🧪 Belgede olmayan bir adım ekle → belge ile defter uyuşmuyor, denetim yakalıyor
💾 `docs(docs): katalog merkezli hat — kullanim belgesi` · `Refs: FAZ-15.10 · §7.1`
