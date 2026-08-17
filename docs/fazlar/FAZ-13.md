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
   ⚠ ⚠ **AĞIRLIK PİKSELDEN DEĞİL GRAMERDEN.** Ekran görüntüsünü çözmek bir PNG çözücü
   bağımlılığı isterdi; dahası piksel bir ÖRNEKLEM, gramer tasarımın kendisi. Eğri
   integralle örnekleniyor — FAZ-12.10'un ZARFI burada YANLIŞ alet olurdu: zarf alanı
   üstten sınırlar (metni uzak tutmak için geniş yanılmak güvenli), denge hesabı ise
   gerçek alanı ister. *Aynı şekil, farklı soru, farklı yaklaşım.*
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

## 13.2 — Kompozit: çok katmanlı montaj    [ ]

📖 §7.1 · R-30
🔗 12.2, 12.9
🛠 *"Montajlama"* — tek görsel yerleştirmek değil, birden çok katmanı maske, karışım kipi
   ve degrade ile birleştirmek. Bir katman = kaynak (görsel · şekil · degrade · doku) +
   maske + karışım kipi + opaklık + dönüşüm. Photoshop'un katman panelinin karşılığı.
📁 `packages/render/src/kompozit.ts`
✅ ⚠ **Katman sayısı SINIRLI (≤4).** Sınırsız katman, Photoshop'un özgürlüğünü ve
   tutarsızlığını birlikte getirir; şablon olmaktan çıkar.
   ⚠ **Katman sırası ANLAMLIDIR ve deterministik olmalı** — sıra içerikten türerse aynı
   konu iki koşuda iki farklı kompozit verir ve golden test kurulamaz.
   ⚠ Kompozit sonrası metrikler TEK SEFER, birleşmiş yüzey üzerinde ölçülür: katman katman
   ölçmek D-258'in tersi hatadır (bkz. `uret.mjs` olayı — yanlış kapsamda ölçüm QA'yı öldürür).
🧪 Beşinci katman ekle → derleme hatası. Katman sırasını içerikten türet → determinizm testi kırmızı.
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

## 13.4 — Çeşitlilik ölçümü: "binlerce çeşit" doğrulanabilir mi    [ ]

📖 §7.1 · D-254, D-255
🔗 12.7
🛠 12.7 açık bir kompozisyon ailesi kuruyor. Ama **çeşitlilik iddiası ölçülmezse kendi
   lehimize yorumlanır** — tıpkı kabul sayacının yorumlanabilmesi gibi (FAZ-10.7). İki
   karoselin gerçekten farklı olduğunu ölçen bir imza: kullanılan düzen · efekt profili ·
   süsleme tipleri · degrade varlığı · veri ögesi tipi · panorama fazı → **kompozisyon
   parmak izi**. Farklı konulardan üretilen N karoselin parmak izi dağılımı raporlanır.
📁 `packages/render/src/cesitlilik.ts` · `docs/referans/cesitlilik-defteri.md`
✅ ⚠ **Piksel benzerliği DEĞİL, KARAR benzerliği ölçülür.** İki karosel farklı renkte olup
   aynı kararları vermiş olabilir — bu çeşitlilik değil, boyamadır.
   ⚠ ⚠ **Bu metrik kendi kendini kandırmaya EN AÇIK olanı.** Parmak izine ne kadar çok alan
   koyarsam çeşitlilik o kadar yüksek çıkar. Alanlar ÖNCE sabitlenir, ölçüm SONRA yapılır;
   sonuç beğenilmediği için alan eklenmez. Bu cümle buraya bu yüzden yazıldı.
   ⚠ Çeşitlilik hedefi bir KAPI değil: aynı konudan iki kez üretmek benzer sonuç vermeli.
🧪 Aynı konuyu iki kez üret → parmak izleri AYNI (determinizm). Farklı konu → farklı.
💾 `feat(render): cesitlilik parmak izi` · `Refs: FAZ-13.4 · §7.1`

## 13.5 — `design.critique`: makinenin estetik yargısı    [ ]

📖 §8.1, §7.1 · D-256, D-261
🔗 13.1
🛠 `image.critique` (D-256) ÜRETİLEN GÖRSELİ yargılıyor. Eksik olan: **bitmiş slaydı**
   yargılayan bir yetenek. Kapalı kategoriler — `denge` · `hiyerarsi` · `bosluk` ·
   `tutarlilik` · `okunabilirlik` · `sikicilik`. Her bulgu sınırlayıcı kutu + şiddet + gerekçe.
   Yeni bir fiil DEĞİL: `image.critique` gibi GENERATE altında bir yetenek (D-256 deseni).
📁 `packages/engine/src/tasarim-yargi.ts`
✅ ⚠ **Ölçüm ile yargı BİRBİRİNİ DOĞRULAR.** 13.1 sayı üretir, bu adım cümle. İkisi
   çelişirse önce ÖLÇENİN doğruluğu sınanır — FAZ-10'da ölçüm aracı ölçülen şeyden daha
   sık bozuktu (on kez).
   ⚠ **Reddedilenler SAYILIR ve gerekçesi yazılır** (D-256 deseni). Sessizce yutulan bir
   eleştiri, olmayan bir eleştiridir.
   ⚠ Yargı ÖNERİR, uygulamaz (§5.4). Çıktısı bir rapor; düzeltmeyi insan onaylar.
   ⚠ **Doğrulama turu tavanı: İKİ.** "Sorun bul" denen bir model her turda sorun bulur;
   iki tur sonra kapatılır, yoksa sonsuz cila döngüsü olur.
🧪 Kusursuz bir referans slaydı ver → kritik bulgu ÜRETMEMELİ (yanlış pozitif sınavı).
💾 `feat(engine): tasarim yargisi` · `Refs: FAZ-13.5 · §8.1`

## 13.6 — Kör kabul: referansla aynı sınıfta mıyız    [ ]

📖 §7.1 · D-255
🔗 13.1, 13.4, 13.5
🛠 Nihai sınav. `examples/` altındaki dört referans karosel ile bizim çıktımız **etiketsiz**
   karıştırılır ve `design.critique` ikisini de puanlar. Bizimki referansların puan
   aralığına düşüyorsa faz kapanır; düşmüyorsa fark **hangi kategoride** açık, oraya dönülür.
📁 `docs/referans/kor-kabul.md`
✅ ⚠ **Referanslar KAZANMALI diye beklenmiyor** — beklenen AYNI ARALIK. Bizim çıktı daha
   yüksek puan alırsa bu iyi haber değil, **yargıcın bizim şablonumuza aşırı uyduğunun**
   işareti olabilir; o durumda yargıç sınanır.
   ⚠ Yargıç bizim çıktımızı üreten hattan bağımsız olmalı; aynı prompt ailesi hem üretip
   hem yargılarsa sınav kendi kendini onaylar.
🧪 Referans karoselleri yargıca ters etiketle ver → sıralama değişmemeli (etiket körlüğü).
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
