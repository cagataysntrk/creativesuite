# FAZ 14 — Üretim sırası: tasarım planı ve tabanın önceliği

**Amaç:** Var olan hattı **yeniden sıralamak ve bir adım eklemek** — yeni bir hat kurmak
değil. `instagram-post` hattı bugün on bir adımlı, DAG'lı, yetenek tabanlı ve çalışıyor.
Eksik olan üç şey var ve üçü de sıraya dair.
**Yöneten kararlar:** D-241, D-243, D-254, D-256, D-261
**Kapanış:** LOOP§D 1. tur koşuldu; bulgular aşağıda tek tek kapatıldı. `just verify`
**ilk kez yeşil** (golden font değişikliğinden beri bayattı, yenilendi ve yeni temelin
marka fontu + `notdef=0` olduğu doğrulandı).
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

## 14.1 — Senaryo: hikâye yayı, karosel kurallarına göre    [x] 2026-08-17

📖 §7.2, §11.4 · R-32
🔗 —
🛠 `metin-uret` bugün bir gönderi metni üretiyor. Karosel bir gönderi değil bir **dizi**:
   kanca (durdurur) → gerilim (sorunu büyütür) → çözüm (bizim payımız) → davet.
   Yay, `metin-uret` çıktısına eklenen bir yapı olarak tanımlanır; slayt rolleri
   (`kapak/govde/kapanis`) ona bağlanır.
📁 `packages/contracts/src/senaryo.ts` · `senaryo.test.ts` ·
   `packages/engine/src/metin-akisi.ts` · `packages/render/src/tasarim-olcum.ts`
✅ ⚠ **HALKA 0'a kondu, engine'e değil — ve asıl kazanç bu.** Kelime tavanları BUGÜNE
   KADAR İKİ YERDE yazılıydı: `icerikPromptu` modele söylüyordu, `tasarim-olcum.ts`
   `KELIME_TAVANI` sabitinde tekrarlıyor ve yorumunda *"`icerikPromptu` ile AYNI sayılar"*
   diyordu. **Bir yorum bir zorlama değildir** — biri değişse öbürü sessizce ayrışırdı.
   Artık tek tanım var; prompt da ölçüm de oradan okuyor.
   ⚠ **Ritim YAPISAL, temenni değil.** Eskiden dört gövde satırının dördü de 30 kelimelik
   aynı bütçeyi paylaşıyordu — sonuç dört EŞİT paragraf, referans örneklerin hiçbirinde
   olmayan tek şey. Yay her işleve kendi bütçesini veriyor: kanca 8 · gerilim 21 · kanıt 30 ·
   dönüş 18 · davet 14.
   ⚠ **Taban ÖLÇÜLDÜ, oranlar EDİTÖRYEL (D-262).** 8/30/14 zaten ölçülmüş değerler; gerilim
   ve dönüş, ölçülen 30'un oranı olarak türetildi ve `RitimOranlari` ile parametrik —
   bir kompozisyon ailesi kendi ritmini kurabilir.
   ⚠ **UÇLAR sabit, ORTA esnek:** kanca ilk, davet son; ara `kanit` tekrarıyla doluyor.
   Dört slaytlık da dokuz slaytlık da karosel aynı hikâyeyi taşıyor.
   ⚠ **D-260 KORUNDU:** kapak slaydındaki 21 kelimelik destek satırı hâlâ başlık bütçesine
   karşı ölçülmüyor; yay dışı slayt sayısında eski rol davranışı aynen sürüyor.
🧪 **11 + 4 test + ihlal:** `slaytIslevi` çağrısını `null`a sabitle → *"AYNI metin, FARKLI
   slayt"* ve *"DÖNÜŞ en sıkı"* kırmızı. Ayrıca: talimat bütçeleri kendi yazmıyor ·
   ritim parametrik · ölçülen tabanlar korundu · kanca nokta ile bitmiyor.
💾 `feat(engine): senaryo yayi` · `Refs: FAZ-14.1 · §7.2`

## 14.2 — `tasarla` adımı: kararlar GEREKÇESİYLE yazılı    [x] 2026-08-17

📖 §3.5, §7.1 · D-254, D-255
🔗 14.1, 12.7
🛠 Hatta yeni bir adım: `tasarla`, **verb `COMPOSE`** (yeni fiil YOK — `kompozit` ile aynı
   etki sınıfı; `metin-uret`/`gorsel-brief` zaten `text.generate`'i paylaşıyor).
   Çıktısı `tasarim-plani.json`.
   ⚠ ⚠ **NİYET planlanır, ÖLÇÜM planlanamaz.** İlk taslak "plan düzeni de seçer" diyordu;
   kod okununca yanlış çıktı: `duzenSec` sayfalayıcının İÇİNDE (`layout/enum.ts`), sayfa
   başına koşuyor, çünkü **kaç bloğun sığdığını bilen tek yer orası.** Düzeni önden seçmek
   ya sayfalamayı ya düzeni yalan yapardı.
   Bu yüzden plan iki katmanlı: **politika** (aile · süsleme yoğunluğu · görsel öge kuralı ·
   panorama · yay) önden ve gerekçeli; **gerçekleşme** (kaç slayt, hangi düzen, hangi blok
   nerede) koşuda kaydedilir. 14.4 gerçekleşmeyi politikaya karşı denetler.
📁 `packages/contracts/src/tasarim-plani.ts` · `packages/engine/src/plan/tasarla.ts` +
   `tasarla.test.ts` · `packages/engine/src/verbs/bodies.ts` · `gorsel-kompozit.test.ts`
✅ ⚠ **Plan POLİTİKA üstünde bir sözleşme.** Render politikadan sapamaz; saparsa 14.4
   yakalar. Ölçümden çıkan düzen bir sapma DEĞİL, plana geri yazılan bir gerçekleşmedir.
   ⚠ **Gerekçe alanı ZORUNLU.** *"Bu slaytta diyagram var çünkü içerikte üç adımlı bir akış
   geçiyor."* — bu cümle olmadan seçim denetlenemez.
   ⚠ **DETERMİNİSTİK** (model çağırmaz): aynı senaryo → aynı plan. Model danışmanlığı ayrı
   bir karar; buraya karıştırılmaz.
   ⚠ ⚠ **AYRI DOSYA YAZILMADI — ve bu R-04.** Taslak `tasarim-plani.json` diyordu; yazılsaydı
   `COMPOSE` çalışma ağacına yazan bir fiil olurdu, oysa yasa yalnız `PROPOSE`un yazmasına
   izin veriyor. Plan adım ÇIKTISI olarak dönüyor ve defteri yazan `manifest-writer` onu
   `manifest.json`a koyuyor: planın yaşadığı yer yine `derived/runs/<id>/` (§3.5), ama onu
   oraya koyan fiil değil KOŞUCU. Yeni bir yan etki sınıfı açılmadı.
   ⚠ Plan ~2 KB → D-263'ün 8 KB eleme eşiğinin altında; **gerekçeler defterde aynen
   okunabilir.** Okunamayan bir gerekçe, olmayan bir gerekçedir.
   ⚠ **Gerekçeyi tip sistemi zorlayamıyor** (boş dize de `string`) — `planKusurlari` zorluyor.
🧪 **10 + 4 test + ihlal:** `tasarimPlani`yi compose çıktısından çıkar → dört üretim-yolu
   testi kırmızı (zincir kopukluğu D-261'in tam biçimi). Ayrıca: gerekçesiz plan geçersiz ·
   determinizm · yay↔işlev tutarlılığı · kapak/kapanış öge almıyor · diyagram ile görsel
   İKİSİ BİRDEN konmuyor · öge gövdenin ORTASINDA · düzen planda YOK.
💾 `feat(engine): tasarim plani adimi` · `Refs: FAZ-14.2 · §7.1`

## 14.3 — Sıra düzeltmesi: TABAN önce, model sonra    [x] 2026-08-17

📖 §7.1, §7.2 · R-20, D-241, D-243, D-261
🔗 14.2
🛠 **Hattın en önemli değişikliği.** Bugün: `gorsel-brief` → `gorsel-uret` → `kompozit` →
   `render`. Görsel, gireceği slaydı görmeden doğuyor.
   Yenisi: `kompozit` → `gorsel-brief` → `gorsel-uret` → `yuva-doldur` → `render`.
   Brief artık **yuvayı görerek** yazılıyor: kaçıncı slayt, yayda hangi işlev, ve
   **yanında duracak SATIR** — görselin desteklemesi gereken şey konu değil o cümle.
   ⚠ **`taban-render` bu adımdan ÇIKARILDI, FAZ-11.6'ya taşındı.** Taban PNG'sini
   tüketen tek şey görselden-görsele üretim; o gelmeden her koşuda ikinci bir render
   koşturmak, tüketicisi olmayan makine kurmaktır — bu fazın kapatmaya çalıştığı zincir
   kopukluğunun tam tersi biçimi.
📁 `registry/pipelines/instagram-post.pipeline.yaml` · `packages/engine/src/verbs/bodies.ts` ·
   `packages/engine/src/metin-akisi.ts` · `packages/engine/src/plan/tasarla.ts` ·
   `packages/engine/src/hat-sirasi.test.ts`
✅ ⚠ **Görsel üretimi KOŞULLU oldu.** Plan yuva işaretlemezse `gorselBriefPromptu` `null`
   dönüyor, brief üretilmiyor, `gorsel-uret` besinsiz kalıyor. **Koşucuya "adım atla"
   yeteneği EKLENMEDİ** — zincir kendiliğinden sönüyor.
   ⚠ ⚠ **DÖNGÜSEL BAĞIMLILIK bulundu ve kırıldı (D-264):** sıra çevrilince plan kendi
   kuyruğunu ısırdı — yuvayı `gorselVar` ile açıyordu, ama görsel artık plandan SONRA
   üretiliyor. Yuva bir **politika kararıdır**, bir gözlem değil. `yuvaIstendi` hattan
   geliyor; ileride kompozisyon ailesi verecek (FAZ-12.7).
   ⚠ **`yuva-doldur` yeni bir gövde GEREKTİRMEDİ:** aynı `composeBody`, görsel artık
   girdide. `metin-uret`/`gorsel-brief` ikilisinin `text.generate`i paylaşması gibi.
   ⚠ **R-20 mutlak:** modele giden taban METİN İÇERMEZ. Taban render'da metin varsa
   maskelenir; model metnin üstüne çizerse çıktı REDDEDİLİR, yamanmaz.
   ⚠ **Bu bir RENDER DEĞİŞİKLİĞİDİR** → kabul sayacı 1'e çekilir (kabul-20 kuralı (c)).
   ⚠ İki render adımı iki motor DEĞİLDİR (R-30): aynı Chromium, aynı CSS, iki geçiş.
🧪 **5 hat testi + 5 zincir testi + iki ihlal:** `gorsel-brief`in `kompozit` bağını kopar →
   *"brief KOMPOZİTTEN besleniyor"* kırmızı; `kompozit`i yine `gorsel-uret`ten beslet →
   *"kompozit görselden ÖNCE"* kırmızı. Bu bağlar koparsa **hiçbir kapı kırmızıya
   dönmezdi**: brief yine üretilir, koşu yine geçerdi — yalnız görsel gireceği slaydı
   görmezdi. `verbs` kapısı *"bu fiili çağıran hat var mı"* diye sorar; bu testler bir
   adım ötesini sorar: *"bu adım DOĞRU adımdan besleniyor mu"*.
   ⚠ Hat YAML'ı doğrudan okunmuyor — `loadPipeline` üstünden; `chokepoints` kapısı ilk
   sürümü haklı olarak reddetti (R-05, yapılandırma çözücü tek yerde).
💾 `feat(engine): taban once model sonra` · `Refs: FAZ-14.3 · §7.1`

## 14.4 — Denetim: plan ile çıktı uyuşuyor mu    [x] 2026-08-17

📖 §7.1 · D-255, D-256, D-259
🔗 14.3, 13.5
🛠 Üç ayrı katman: (a) **uyum** — çıktı planı uyguladı mı; (b) **metrik** — mevcut `kalite`
   ve `tasarim`; (c) **yargı** — `gorsel-yargi` (var) + `design.critique` (13.5).
📁 `packages/render/src/plan-denetim.ts` + `plan-denetim.test.ts` ·
   `packages/engine/src/verbs/bodies.ts` · `packages/engine/src/plan-uyum.test.ts`
✅ ⚠ **Üç katman AYRI kalır.** Uyumsuzluk bir HATA (render bozuk), metrik ihlali bir RET
   (çıktı kabul edilemez), estetik bulgu bir ÖNERİ. Aynı kovaya konursa ya estetik zorunlu
   olur ya hata görmezden gelinir.
   ⚠ ⚠ **Denetim ÜRETİLEN dosyaya bakar, kapının kendi kurgusuna değil** (D-259):
   *"kapı repoyu korur, çıktıyı değil."* `tasarimOlc` yalnız kapıda koşuyordu.
   ⚠ **Ayrımın yeri hata TAKSONOMİSİ:** uyumsuzluk `internal`/`PLAN_MISMATCH`, metrik
   `policy_blocked`/`QA_OUT_OF_TOLERANCE`. Uyum ÖNCE koşuyor — ikisi de bozukken uyum
   kazanmalı, yoksa bir render hatası "tolerans dışı" diye raporlanır ve içerik suçlanır.
   ⚠ **İNDEKS eşleştirmesi YAPILMIYOR.** Plan SATIR sırasına göre yazılıyor, sayfalayıcı
   satırları slaytlara bölüyor (6 satır → 5 slayt). İndeks indekse bakmak, bu fazda dört
   kez tekrarlanan birim uyuşmazlığının (D-260 ailesi) beşinci biçimi olurdu. Onun yerine
   **konumdan bağımsız** şeyler karşılaştırılıyor: kaç görsel öge, hangi türden, damgalar
   yerinde mi, yayın uçları doğru mu.
   ⚠ **Fotoğrafın sessizce geri gelmesini yakalayan tek yer burası** (D-261).
   ⚠ Plan yoksa denetim ATLANIYOR — eski belgeler ve PDF yolu plansız geliyor.
   ⚠ ⚠ **DOĞRULAMA BULGUSU — denetim YANLIŞ belgeye bakıyordu.** `Object.values(inputs)
   .find(…)` İLK eşleşeni alıyordu: `kompozit`in belgesini, `render`ın gerçekten
   tükettiği `yuva-doldur` belgesini değil. Yuva dolduğu gün plan 1 görsel bekler,
   denetlenen belgede 0 vardır → **yanlış `PLAN_MISMATCH`**; aynı yanlış belge QA'ya da
   gidiyordu. `inputs` topolojik sırada dolduğu için artık EN SON belge alınıyor.
   Testi var, ihlali kanıtlandı.
   ⚠ **BORÇ KAPANDI:** render artık slayt `digests`ini de yazıyor. Defter yolu ve boyutu
   yazıyordu ama içeriği kanıtlayan hiçbir şey yazmıyordu; dosya değişse defter aynı
   kalırdı. Yol nereye bakılacağını, digest NEYİN bulunması gerektiğini söylüyor (D-263).
🧪 **8 + 5 test + ihlal:** uyum denetimini `if (false && …)` ile kapat → *"UYUMSUZLUK bir
   HATADIR"* ve *"uyumsuzluk metrikten ÖNCE"* kırmızı. Gerçek koşuda doğrulandı: hat
   uçtan uca yeşil, plan ve 5 digest defterde.
💾 `feat(render): plan denetimi` · `Refs: FAZ-14.4 · §7.1`

## 14.5 — Yuva doldurma: opsiyonel adım, ret sayılır    [x] 2026-08-17

📖 §7.2, §8.1 · R-20, D-256, D-261
🔗 14.3, 11.6
🛠 Dönen görsel yuvaya oturur, `image.critique` (mevcut `gorsel-yargi`) ile sınanır, marka
   paletine tabi kılınır (duotone 11.7 ya da vektörleştirme 13.3).
📁 `registry/pipelines/instagram-post.pipeline.yaml` · `packages/engine/src/run.ts` ·
   `packages/engine/src/opsiyonel-adim.test.ts` · `packages/engine/src/run.test.ts`
✅ ⚠ ⚠ **YETENEK VARDI, KULLANILMIYORDU — ama sanılan yerde değil.** Önce "koşucuda
   opsiyonel adım desteği yok" diye kaydettim; kodu okuyunca yanlış çıktı: `isteğeBagli`
   motorda tanımlı, `run.ts:722`de bağlı ve testi de var. Eksik olan **hiçbir hat
   adımının `optional: true` taşımamasıydı** — yani yetenek üretimde hiç devreye
   girmiyordu. Yeteneğin var olması, kullanılıyor olması demek değildir (D-261 ailesi,
   beşinci tekrar).
   ⚠ **Fotoğraf taşıyıcı öge DEĞİL** (§8.2 · D-261): üretilemezse karosel diyagram, ikon
   ve tipografiyle tam çıkar. Koşuyu öldürmesi orantısızdı. `gorsel-brief` ve
   `gorsel-uret` opsiyonel; **`metin-uret`, `kompozit`, `render`, `kalite`, `onay`,
   `yayinla` DEĞİL** — opsiyonel bir kapı, kapı değildir.
   ⚠ **Üç durum, üç anlam:** `ok` işini yaptı · `skipped` koştu ama yapılacak iş yoktu ·
   `failed` denedi olmadı. `StepStatus` bu üçlüyü kernel'de zaten taşıyordu; eksik olan
   onu ÜRETEN yoldu. Atlanan adıma `ok` demek defterde *"brief üretildi"* yalanı
   bırakırdı; `failed` demek DOĞRU bir kararı hata gibi gösterirdi.
   ⚠ **Ret KAYBOLMUYOR:** düşen opsiyonel adımın hatası `errors` altında defterde kalır
   (D-256). Sessizce yutulan ret, olmayan rettir.
   ⚠ Alt metin zaten zorunlu (**R-34**) — yeni iş değil, mevcut kuralın kapsamı.
🧪 **4 + 2 test + iki ihlal:** `gorsel-uret`i zorunlu yap → *"görsel adımları opsiyonel"*
   kırmızı; atlama işaretini yok say → *"ATLANAN adım `skipped`"* kırmızı.
   **Üretimde doğrulandı:** gerçek koşuda plan diyagram seçti, `gorsel-brief` ve
   `gorsel-uret` defterde `skipped` + `sebep: prompt-yok`.
   ⚠ **DÜZELTME (bağımsız doğrulama):** "hat uçtan uca yeşil" demiştim — DEĞİL. Koşu
   `onay` adımında insan kapısında duruyor (`awaitingGate: insan-onayi`) ve bu DOĞRU
   davranış (§5.4). Doğrusu: `kalite`ye kadar yeşil. Ayrıca `skipped` yalnız EN YENİ
   koşuda; ondan önceki üç defter aynı durumu `status: ok` + `atlandi: true` diye
   yazmış — o defterler değişiklikten ÖNCEKİ koşulardır ve düzeltilmez (append-only).
💾 `feat(engine): yuva doldurma` · `Refs: FAZ-14.5 · §7.2`
