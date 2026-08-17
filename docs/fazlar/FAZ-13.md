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

## 13.1 — Kompozisyon ilkeleri: görsel ağırlık, optik merkez, boşluk ölçeği    [ ]

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
📁 `packages/render/src/kompozisyon-olcum.ts` · `tasarim-olcum.ts`
✅ ⚠ **Bunlar KAPI değil, RAPOR.** Denge eşiği aşılırsa uyarı üretilir, koşu düşmez.
   Estetiği zorunlu kılmak "kabul edilemez" ile "tercih edilmeyen"i karıştırmaktır ve
   sistem kendi zevkini dayatmaya başlar.
   ⚠ **Optik merkez FAZ-10 ölçümlerini geçersiz kılmaz** ama dikey hizayı kaydırır —
   `hayaletPx` ve `sayacBandi` yeniden ölçülür (D-261: değişen çıktıysa sayaç sıfırlanır).
   ⚠ Boşluk ölçeği KAPALI; beşinci bir değer bir karar ister.
🧪 Ağırlık momenti eşiği aşan bir kompozisyon → raporda uyarı; kapı YEŞİL kalır (kasıtlı).
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
