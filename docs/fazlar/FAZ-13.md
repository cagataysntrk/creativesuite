# FAZ 13 — Estetik yargı: kompozisyon, çeşitlilik, eleştiri

**Amaç:** FAZ-11 ve 12 *kudret* veriyor — dağarcık, efekt, doku, degrade. Ama kudret
estetik değildir. Bu faz üç eksiği kapatıyor: kompozisyonun **ilkeleri** (neden bir yerleşim
diğerinden iyi), **çeşitliliğin ölçümü** ("binlerce çeşit" doğrulanabilir mi) ve **makinenin
yargısı** (her çıktıya insan bakmadan kalite nasıl bilinir).
**Yöneten kararlar:** D-254, D-255, D-256, D-261
**Ön koşul:** FAZ-12 efekt ve ritim katmanı yerinde
**Çıkış kriteri:** Sistem, kendi çıktısını estetik olarak **puanlayabiliyor**; iki farklı
konudan iki **ölçülebilir biçimde farklı** karosel çıkıyor; kör karşılaştırmada referans
ailesiyle aynı sınıfta duruyor.
✅ **Üçü de gösterildi (2026-08-17).** Puanlama: `design.critique` gerçek modelle koştu.
Çeşitlilik: anlatı konusu → `akici` (panorama açık), kanıtlı konu → `temel` — parmak izi
uzaklığı **0,5** (altı alanın üçü farklı). Kör kabul: medyan aralıkları örtüşüyor.
⚠ Kabul sayacı (0/20) FAZ-12'nin kriteri; bu fazınki değil.

> **Bu faz neden var:** FAZ-10'da ölçüm aracının kendisi ON KEZ bozuk çıktı ve her seferinde
> ancak *koşup bakınca* görüldü. Göz tek yargıçtı. Bir karosel `kalite` kapısının her
> metriğini geçip yine de **çirkin** olabilir — çünkü ölçtüklerimiz kusurun YOKLUĞU,
> güzelliğin VARLIĞI değil. Kontrast 10,5 olabilir ve kompozisyon yine dağınık durabilir.
>
> ⚠ **Ayrım:** `kalite` kapısı *kabul edilemezi* eler (kırpma, çakışma, okunamama).
> Bu faz *iyiyi* arar. İkisi karıştırılırsa ya kapı öznel olur ya estetik zorunlu — ikisi de yanlış.

---

## 13.1 — Kompozisyon ilkeleri: görsel ağırlık, optik merkez, boşluk ölçeği    [x] 2026-08-17

📖 §7.1 · D-254, D-255
🔗 —
🛠 Şu ana kadar her yerleşim sayısı **ölçümden** geldi (band %69–78, sütun %62, h1 64px) —
   ve bu doğruydu. Ama ölçülen şey *taşma*ydı; *denge* hiç ölçülmedi. Dört ilke, dördü de
   hesaplanabilir:
   - **Görsel ağırlık:** her ögenin alan × kontrast × doygunluk ağırlığı; sol/sağ ve
     üst/alt momentleri. Dengesiz kompozisyon burada sayıya dönüşür.
   - **Optik merkez:** göz geometrik merkezi değil, ondan ~%5 YUKARISINI merkez sayar.
     Dikey ortalama şu an geometrik — bu yüzden bazı slaytlar "aşağı kaymış" duruyor.
   - **Boşluk ölçeği:** boşluklar keyfî piksel değil, tek bir ölçekten (örn. 8·13·21·34)
     seçilir. Şu an her boşluk ayrı sayı.
   - **Göz yolu:** kapak → gövde → kapanış boyunca ağırlık merkezinin izlediği yol; zikzak
     değil, tutarlı bir yön olmalı.
📁 `packages/render/src/kompozisyon-olcum.ts` + testi · `packages/render/src/tasarim-olcum.ts`
✅ ⚠ **Bunlar KAPI değil, RAPOR — ve `limit` bir eşik değil TANIM ARALIĞININ ucu.** Okuma
   yapısal olarak `out` olamıyor; uyarı eşiği gerçek. Kapı 35 okuma yeşil + 6 uyarı verdi.
   ⚠ ⚠ **AĞIRLIK PİKSELDEN DEĞİL GRAMERDEN:** PNG çözücü bağımlılığı gerekirdi ve piksel
   bir ÖRNEKLEM, gramer tasarımın kendisi. FAZ-12.10'un ZARFI burada YANLIŞ alet olurdu —
   zarf alanı üstten sınırlar, denge hesabı gerçek alanı ister. *Aynı şekil, farklı soru.*
   ⚠ ⚠ **İLK METRİK GRAMERİN KENDİSİNİ KUSUR RAPORLUYORDU.** "Zikzak sayısı" beş slaytta
   3/3 döndü — çünkü dolgu tarafı her slaytta yer değiştiriyor ve ritim tam olarak budur
   (D-254). Ölçtüğü doğruydu, ölçmesi gereken değildi. Yerine `yolSapmasi`: kütle, o
   slaytta dolgunun bulunduğu tarafta mı (bugün 0/5). **Ölçüm aracının tasarımla
   çatışması** bu projede tekrarlayan sınıf.
   ⚠ ⚠ **ÖLÇÜLDÜ: kompozisyon optik merkezin 10–15 PUAN ALTINDA.** Hipotezim hayalet
   rakamdı — YANLIŞ çıktı: rakamsız hesap yalnız 1,7 puan düşürüyor. Sebep `akanEgri`nin
   kendi asimetrisi; alt lob dolguyu aşağıda genişletiyor. Eğriyi değiştirmek bütün
   golden'ları yeniler ve BAKMAYI gerektirir — bu adım rapor adımı, düzeltme bir karar.
   ⚠ **Boşluk ölçeği Fibonacci ve KAPALI** (8·13·21·34·55·89). Bugünkü altı değerin
   hiçbiri oturmuyor (kenar payı 88, ölçekte 89); 1 px için golden yenilemek kazandığından
   fazlasını riske atardı. Ölçüm sapmayı raporluyor.
   ⚠ **Kayıtlı borç:** boşluk listesi `tasarim-olcum.ts`te ELLE yazılı, `static.ts`ten
   türemiyor — yeni bir boşluk eklenince ölçüm onu görmez.
🧪 9 test + ihlal turu: `optical_offset` limiti 5'e çekildi → dört slayt SINIR DIŞI
   (okuma gerçek, totoloji değil), geri alındı → kapı yeşil, uyarılar duruyor.
💾 `feat(render): kompozisyon olcumu` · `Refs: FAZ-13.1 · §7.1`

## 13.2 — Kompozit: çok katmanlı montaj    [x] 2026-08-17

📖 §7.1 · R-30
🔗 12.2, 12.9
🛠 *"Montajlama"* — tek görsel yerleştirmek değil, birden çok katmanı maske, karışım kipi
   ve degrade ile birleştirmek. Bir katman = kaynak (görsel · şekil · degrade · doku) +
   maske + karışım kipi + opaklık + dönüşüm. Photoshop'un katman panelinin karşılığı.
📁 `packages/render/src/kompozit.ts` + testi · `static.ts` · `sablon-filtre.ts` ·
   `marka-isareti.ts`
✅ ⚠ ⚠ **YIĞIN ZATEN VARDI — SEKİZ AYRI SABİT HÂLİNDE, VE ÜÇÜ BERABERDİ.** `.alan`/
   `.susleme` ikisi de 1; `.hayalet`/`.doku`/`.vinyet` üçü de 2. Beraberlikte sırayı CSS
   değil DOM sırası belirler. `.doku` `mix-blend-mode: overlay` taşıyor ve rakamın ÜSTÜNDE,
   metnin ALTINDA olmak ZORUNDA — bugün doğru yerdeydi ama bunu sağlayan şey bir karar
   değil, iki `<div>`in yazılma sırasıydı. Sessiz kusur sınıfı: bir satır taşınsa bozulur.
   ⚠ **Sıra artık VERİ:** yedi adlı katman, `z-index` indeksten türüyor. Beraberlik
   ÜRETİLEMEZ. Sekizinci katman bir karar ister.
   ⚠ ⚠ **ÇIKTI DEĞİŞMEDİ ve bu ÖLÇÜLDÜ, varsayılmadı:** yedi render (5 slaytlık şerit +
   iki yuva biçimi) önce/sonra **piksel-özdeş** (`ImageChops.difference` → bbox `None`).
   Kaza kaldırıldı, görüntü korundu.
   ⚠ **Sıra İÇERİKTEN türemez** — türeseydi aynı konu iki koşuda iki kompozit verirdi.
   ⚠ **Öge-içi çok kaynaklı montaj (görsel + degrade + doku tek maskede) YAZILMADI:**
   bugün çağıranı yok, yuva tek kaynak alıp üstüne işlem zinciri uyguluyor (FAZ-12.2).
   Çağıranı olmayan üreteç bu projenin yedi kez tekrarladığı hatası (D-261).
🧪 6 test + ihlal turu: bir katman yeniden adlandırıldı → tüketicide DERLEME hatası;
   sekizinci katman eklendi → iki test kırmızı; geri alındı → altısı da yeşil.
💾 `feat(render): kompozit katmanlar` · `Refs: FAZ-13.2 · §7.1`

## 13.3 — Vektörleştirme ve markaya yeniden boyama    [ ] BLOKE:karar

📖 §7.1, §12.1 · D-253
🔗 11.6, 12.9
🛠 Model çıktısının renk sapması kalıcı bir sorun: brief'e "monokrom" yazmak yalvarmaktır,
   duotone (11.7) filtredir. **Vektörleştirme yapısal çözümdür:** raster → SVG → her dolgu
   marka rampasına EŞLENİR. Sapma matematiksel olarak imkânsız hâle gelir.
   Araç: **VTracer (MIT)** — renkli görsel destekliyor. ⛔ Potrace **GPL**, giremez.
📁 —
✅ ⚠ **KARAR GEREKİYOR:** yeni bir ikili bağımlılık (Rust). §16 sınavı — bir ay ihmal
   edilse de çalışmalı; kurulamazsa hat duotone'a düşmeli, çökmemeli.
   ⚠ Vektörleştirme her görsele uygun DEĞİL: fotoğrafik doku posterize olur. Yalnız
   grafik/illüstratif çıktılar için.
💾 —

## 13.4 — Çeşitlilik ölçümü: "binlerce çeşit" doğrulanabilir mi    [x] 2026-08-17

📖 §7.1 · D-254, D-255
🔗 12.7
🛠 12.7 açık bir kompozisyon ailesi kuruyor. Ama **çeşitlilik iddiası ölçülmezse kendi
   lehimize yorumlanır** — tıpkı kabul sayacının yorumlanabilmesi gibi (FAZ-10.7). İki
   karoselin gerçekten farklı olduğunu ölçen bir imza: kullanılan düzen · efekt profili ·
   süsleme tipleri · degrade varlığı · veri ögesi tipi · panorama fazı → **kompozisyon
   parmak izi**. Farklı konulardan üretilen N karoselin parmak izi dağılımı raporlanır.
📁 `packages/render/src/cesitlilik.ts` + testi · `scripts/docs-uret.mjs` ·
   `docs/referans/cesitlilik-defteri.md` (üretilmiş) · `packages/kernel/src/doc/model.ts`
✅ ⚠ **KARAR benzerliği, piksel değil.** Altı alan, ölçümden ÖNCE sabitlendi; yedincisinin
   gerekçesi "çeşitlilik düşük çıktı" olamaz. İhlal turunda sahte bir alan eklendi → iki
   test kırmızı, geri alındı → yeşil.
   ⚠ ⚠ **DEFTER RAHATSIZ EDİCİ GERÇEĞİ SÖYLÜYOR: iki aile altı alanın YALNIZ İKİSİNDE
   ayrışıyor (uzaklık 0,33).** `tipoEfektleri` ve `gorselIslemleri` ikisinde de aynı.
   Metrik kusuru değil — `akici`nin bugün `temel`in süslü hâli olduğunun SAYISI. Şablon
   genelleştirme notu (bu dosyanın sonu) bunu niteliksel olarak söylüyordu; artık ölçülü.
   ⚠ ⚠ **ÖLÇÜM BOŞLUĞU BİR ZİNCİR KOPUKLUĞUNU AÇTI (sekizinci, D-261).** `tipoEfektleri`
   `AileProfili`de VARDI, belgeye hiç girmiyordu, render hiç okumuyordu — vurgu şeridi
   koşulsuz basılıyordu. Parmak izi o alanı ölçemeyip sabit yazmak zorunda kalınca görüldü;
   alan belgeye eklendi, render aileden okuyor. *Ölçemediğin şey, bağlanmamış olabilir.*
   ⚠ **Alanın KAYNAĞI kayıtlı (`ALAN_KAYNAGI`).** İlk defter `duzenler` ve `veriOgesi`ni de
   "farklılaşmıyor" diye suçluyordu; ikisini aile SEÇMİYOR (plandan/içerikten gelir) ve
   sabit içerikte zorunlu olarak aynı çıkar. Ölçümün kime ne sorduğunu bilmemek ölçümü
   yanlış yapar.
   ⚠ **Dağılım tek puan DEĞİL:** `benzersiz` + `ortalamaUzaklik`. Tek puan, "hepsi aynı" ile
   "hepsi biraz farklı"yı aynı sayıya indirebilirdi.
   ⚠ Çeşitlilik bir KAPI değil: aynı girdi aynı izi vermeli (R-06).
🧪 7 test: determinizm · farklı aile+içerik uzaklık > 0,5 · SLAYT SIRASI çeşitlilik değil
   (alanlar sıralı) · alan listesi kapalı · her alanın kaynağı belli · boş küme çökmüyor.
💾 `feat(render): cesitlilik parmak izi` · `Refs: FAZ-13.4 · §7.1`

## 13.5 — `design.critique`: makinenin estetik yargısı    [x] 2026-08-17

📖 §8.1, §7.1 · D-256, D-261
🔗 13.1
🛠 `image.critique` (D-256) ÜRETİLEN GÖRSELİ yargılıyor. Eksik olan: **bitmiş slaydı**
   yargılayan bir yetenek. Kapalı kategoriler — `denge` · `hiyerarsi` · `bosluk` ·
   `tutarlilik` · `okunabilirlik` · `sikicilik`. Her bulgu sınırlayıcı kutu + şiddet + gerekçe.
   Yeni bir fiil DEĞİL: `image.critique` gibi GENERATE altında bir yetenek (D-256 deseni).
📁 `packages/engine/src/tasarim-yargi.ts` + testi · `gorsel-yargi.ts` · `packages/engine/src/verbs/bodies.ts` ·
   `packages/providers/src/claude-code.ts` · `registry/providers/claude-code.provider.yaml` ·
   `registry/pipelines/instagram-post.pipeline.yaml`
✅ ⚠ ⚠ **PLANIN ÖNCÜLÜ ESKİMİŞTİ.** Adım *"`image.critique` üretilen görseli yargılıyor,
   eksik olan bitmiş slaydı yargılayan yetenek"* diyordu. `gorsel-yargi.ts` okundu:
   prompt zaten *"N slaytlık karoselin M. slaydı, tuval 1080×1350"* diyor ve RENDER
   EDİLMİŞ slaydı yargılıyor. Eksik olan yüzey değil **EKSEN**: var olan altı kategori
   kusurun YOKLUĞUNU arıyor, bu adımın altısı iyinin VARLIĞINI.
   ⚠ ⚠ **`sikicilik` DEĞİL `carpicilik` — ölçüm hatasından kaçınma.** Öteki beşinde yüksek
   puan iyi, `sikicilik`te kötü olurdu; yönü kardeşlerine ters tek bir alan ortalamayı
   sessizce bozar. Altı alanın altısında da yüksek = iyi.
   ⚠ **Doğrulayıcı YENİDEN YAZILMADI (R-05):** `bulguyuDogrula` kategori dağarcığını
   parametre alıyor, iki yetenek de onu çağırıyor. İkinci bir kopya biri sıkılaşıp öbürü
   gevşediğinde hangisinin gerçek olduğunu belirsizleştirirdi.
   ⚠ **Eksik kategori sessizce 0 SAYILMIYOR, sessizce ATLANMIYOR da:** sıfır saymak
   ölçülmemişi kötü ilan eder, atlamak eksikliği gizler. `toplamPuan` eksikte `null` —
   beş kategoriden ortalama, altıdan ortalamayla karşılaştırılamaz (13.6 tam bunu yapacak).
   ⚠ Ondalık puan reddediliyor: `3.7` olmayan bir hassasiyet iddia eder.
   ⚠ ⚠ **HAT KOŞUSU BİR §16 İHLALİ ORTAYA ÇIKARDI ve düzeltildi.** Adaptör `--model`
   geçmiyordu, yani CLI'ın VARSAYILANINA bağlıydı; o varsayılan yukarı akışta kaldırılan
   bir modele sabitliydi ve her çağrı `404` verdi — hat ilk `GENERATE` adımında durdu.
   Üstelik **stderr BOŞTU**: hata metni stdout'taki JSON'da (`is_error`) duruyordu ve
   `{"code":1,"stderr":""}` hiçbir şey söylemiyordu. İkisi de kapatıldı; ayrıca çıkış
   kodu 0 iken `is_error: true` gelen hâl de artık yakalanıyor.
   ⚠ ⚠ **GERÇEK MODELLE KOŞULDU ve ÖLÇÜM ile YARGI BAĞIMSIZ OLARAK AYNI ŞEYİ SÖYLEDİ.**
   Altı kategori de puanlandı, sıfır reddedilen, toplam 3,67/5. `denge` 4/5'in gerekçesi:
   *"dev rakamın sağ-alt köşede yığılması kompozisyonu hafifçe aşağı-sağa çekiyor"* —
   13.1'in optik merkez ölçümü de kompozisyonun 10–15 puan AŞAĞIDA olduğunu söylüyordu.
   İki ayrı yöntem, aynı bulgu; adımın *"ölçüm ile yargı birbirini doğrular"* kriteri
   kanıtla karşılandı. En düşük ikisi `hiyerarsi` ve `tutarlilik` 3/5 — ikisi de yeni
   bilgi (rakam metni bastırıyor; süslemelerin çizgi kalınlıkları aynı aileden değil).
   ⚠ Yargı ÖNERİR, uygulamaz (§5.4). Doğrulama turu tavanı İKİ.
🧪 12 test: eksik/tekrar/ondalık/gerekçesiz puan · kutusuz ve tuval dışı bulgu · kusur
   kategorisi sızmıyor · bozuk çıktı çökmüyor · **üretim yolu** (`promptTuret` slayt
   yollarını görüyor) · slayt yoksa prompt boş.
💾 `feat(engine): tasarim yargisi` · `Refs: FAZ-13.5 · §8.1`

## 13.6 — Kör kabul: referansla aynı sınıfta mıyız    [x] 2026-08-17

📖 §7.1 · D-255
🔗 13.1, 13.4, 13.5
🛠 Nihai sınav. Beş referans karosel ile bizim çıktımız **etiketsiz** karıştırılıp
   `design.critique` ile puanlanır. Aynı aralıksa faz kapanır.
📁 `scripts/kor-kabul.mjs` · `docs/referans/kor-kabul.md` (üretilmiş) ·
   `packages/engine/src/tasarim-yargi.ts`
✅ ⚠ **Körlük ÜÇ katmanlı:** gramersiz prompt (referansı bizim bağlamımızla yargılatmak
   yargıcı şablonumuza ayarlardı) · deterministik karıştırma · etiketsiz dosya adı.
   ⚠ ⚠ **ASIL BULGU YARGICIN KENDİSİYDİ: tek koşu bir ölçüm DEĞİL.** Üçlü tekrarla
   **aynı görselde 1,5 puana varan yayılım** çıktı (`ornek-4`: 1,83 · 3,33 · 3,00).
   R-80: aynı girdiye iki farklı cevap veren ölçüm yeşil değildir. Betik `--tekrar K` ile
   **medyan** ve **yayılım** raporluyor. **Adımın "yargıcı sına" şartı böyle karşılandı.**
   ⚠ ⚠ **SONUÇ: AYNI SINIF — ama "daha iyiyiz" ÖLÇÜLMÜŞ DEĞİL.** Medyan aralıkları
   örtüşüyor (bizim 3,5–4,0 · referans 2,33–3,83); medyanımız ~1 puan yukarıda ama
   referans yayılımının ortalaması ~1,1, yani **fark gürültüyle aynı büyüklükte.**
   ⚠ **İkinci sinyal:** yayılımımız (ort. 0,53) referansınkinin (ort. 1,10) yarısı — bu
   iyi olduğumuzu değil, **yargıcın şablonumuza alışık olduğunu** da gösterebilir.
   ⚠ **Yöntem kusuru ölçülerek bulundu:** yer tutucu metinli slaytlarla bizimkiler
   2,5–3,5 çıktı, gerçek Türkçe başlıklarla 3,5–4,33'e. **Kör kabulün girdisi temsili
   OLMAK ZORUNDA** — yoksa ölçülen şey tasarım değil, test verisi.
🧪 10 görsel × 3 tekrar = 30 puanlama; etiket körlüğü kopyalamayla, gramer körlüğü
   `gramer: false` ile sağlandı. Zincir kopukluğu koşuda yakalandı: `ayniAralikta`
   `index.ts`ten dışa açılmamıştı ve betik `is not a function` ile düştü.
💾 `feat(engine): kor kabul` · `Refs: FAZ-13.6 · §7.1`

---

## ⏸ FAZ 13 KAPANINCA DEĞERLENDİRİLECEK — şablon genelleştirme

**Kullanıcı kararı (2026-08-17):** *"Şablonu atayım, aynısını 1-2 denemede mükemmelce
yapan esnek estetik bir tasarım sistemi olsun; hatta çoğu kez şablon bile atmayayım —
içeriğe göre kendisi seçsin ya da yeni tasarlasın."* **Fazlar bitince** değerlendirilecek.
⛔ Bu bir adım DEĞİL: tiklenmez, şimdi başlanmaz.

**Neden bugün yapılamıyor:** `akici` ailesi bir veri satırı oldu ama `temel`in süslü hâli
çıktı — çünkü kimliği taşıyan şeyler (akan eğri, hayalet rakam, iki alanlı bölünme, tip
eşleşmesi) `sablon.ts`'te SABİT. Aile ancak süsleme yoğunluğu, vinyet, degrade, panorama,
yuva biçimi, ritim ve tipo efektleri diyebiliyor. **Satır yeterince şey söyleyemiyor.**

**Sıra — ilki olmadan diğer üçü havada kalır:**

1. **Kimlik parametrelerini `sablon.ts`'ten `AileProfili`ye taşı.** Alan bölünmesi biçimi,
   hayalet rakam var/yok + ölçeği, eğri tipi, tip ölçeği/ağırlık kontrastı. Asıl iş bu.
2. **Aile seçicisini `tasarla.ts`'e bağla.** Bugün `const aile = g.aile ?? TEMEL_AILE` —
   bir varsayılan, bir karar değil. Girdi: veri var mı · fotoğraf var mı · yayın · ton.
   Plan zaten her seçime `gerekce` yazıyor (FAZ-14.2); aile seçimi de öyle olmalı.
3. **Ölçüm aletini referansa çevir.** `tasarim` kapısının aleti (band % · sütun % ·
   kontrast · chroma · kenar payı · tip ölçeği) bugün BİZİM çıktımıza bakıyor. Aynı aleti
   referans görsele çevirince çıkan şey bir `AileProfili`dir — yeni icat değil, ters yön.
4. **Eleştirmen döngüsü** = 13.5 + 13.1 + 13.4. "1-2 denemede mükemmel"i sağlayan şey
   üretmek değil, **ikinci denemenin birinciden iyi olması**. Eleştirmen yoksa ikinci
   deneme daha iyi değil, sadece farklıdır. 13.4 olmadan da yirmi aile üretilir ve
   yirmisi aynı çıkar.

⚠ **Üretken aile güvenli — bedeli çoktan ödendi.** `AileProfili`de `kontrastEsigi`,
`guvenliAlan`, `chromaTavani`, `kelimeButcesi` alanları YOK; parametre uzayından rastgele
örneklenmiş bir aile bile ihlal edecek alan bulamıyor (FAZ-12.7 · D-254). Yeni kimlik
alanları eklenirken bu YOKLUK korunur — garanti katmanı aileye sızarsa üretkenlik biter.

⚠ **Dürüst sınır: "aynısı" değil, "aynı dili konuşan".** Referansın YAPISI yakalanabilir
(alan bölünmesi, ölçek, ağırlık kontrastı, satır uzunluğu, boşluk ritmi, palet ilişkisi).
HARF FORMU yakalanamaz: sahip olmadığımız bir yazı yüzü sahip olmadığımız bir yazı yüzüdür
ve R-20 gereği metni rasterleştirerek kopyalamak yasak. Bu beklenti önden söylenir.
