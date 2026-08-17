# FAZ 11 — Görsellik dili: yuvalar, süslemeler, ikonlar

**Amaç:** Karosel görselliği stok fotoğrafla değil, **kapalı bir öge dağarcığıyla** kurulsun;
her slaytta görsel öge tipi içerikten seçilsin ve marka tutarlılığı bozulmasın.
Ayrıca: **Photoshop sınıfı işleme, Photoshop olmadan** — maskeleme, duotone, karışım kipi,
bulanıklık, doku, degrade, kırpma **ve tipografi efektleri**. Chromium bunların hepsini
standart olarak veriyor; tek render motoru yasası (R-30) sayesinde hepsi TEK yerde.
**Yöneten kararlar:** D-254, D-255, D-261
**Ön koşul:** FAZ-10 gramer ve ölçüm katmanı yerinde
**Çıkış kriteri:** Fotoğraf **varsayılan olmaktan çıkmış**; bir karoselin görselliği
diyagram, süsleme ve ikon dağarcığıyla kurulabiliyor ve 20 ardışık kabul koşusu (FAZ-10.7)
bu dille geçiyor.

> **Bu faz neden var:** FAZ-10.7'de bulduğum görsel kusurların çoğu tek kökten geliyordu —
> **oraya ait olmayan bir öge.** Fotoğraf kutu gibi duruyordu, altında boşluk kalıyordu,
> `kaydır ››` ile çakışıyordu, mavi/turuncu makineler amber alanla çarpışıyordu. Her
> seferinde belirtiyi yamadım. Doğru soru *"bu fotoğraf neden burada?"* idi ve cevabı
> utandırıcı: **bağlı olan tek görsel yol oydu.** `chart` ve `diagram` çizicileri repoda
> yazılı ve test edilmişti; üretim hattı sıfır tane üretiyordu.
>
> ⚠ **Kural (D-261):** bir düzeltme iki denemede tutmuyorsa yamaya devam edilmez, ÖNCÜL
> sorgulanır. Ölçüt: *bu öge oraya ait mi?*

---

## 11.1 — `AKIŞ` yuvası: diyagram fotoğrafın yerine    [x] 2026-08-17

📖 §7.1, §7.6 · R-32 · D-261
🔗 —
🛠 Metin adımı isteğe bağlı bir `AKIŞ:` bölümü döndürür (3–5 adım, `ad | çıktı`);
   `akisiAyir` onu ayırır ve satırlardan ÇIKARIR, `COMPOSE` `diagram` bloğuna çevirir.
   Akış varsa fotoğraf EKLENMEZ — aynı slaytta iki görsel öge referans ailesinde yok.
📁 `packages/engine/src/metin-akisi.ts` · `packages/engine/src/verbs/bodies.ts` ·
   `packages/engine/src/metin-akisi.test.ts`
✅ **`chart` DEĞİL `diagram` seçildi ve sebebi kural:** `chart` veri noktası ister, R-32
   kaynaksız sayıyı yasaklar ve corpus'ta sayı yok — grafik yolu kaynak gelene kadar
   kapalı. Akış diyagramı sayısızdır, engelsizdir.
   Düğüm tavanı ÇİZİCİDEN geliyor (`MAX_DUGUM`), ayrıştırıcıda tekrar yazılmıyor.
🧪 20 test: akış ayrılıyor ve satırlardan çıkıyor · `|` ayrımı · ayrıntısız düğüm ·
   AKIŞ yoksa satırlar dokunulmadan dönüyor · tek düğüm ve tavan üstü GEÇERSİZ ama
   satırlar yine temizleniyor (yarım akış metne düşerse çöp görünür).
💾 `feat(engine): akis diyagrami fotografin yerine` · `Refs: FAZ-11.1 · §7.6`

---

## 11.2 — Süsleme dağarcığı: geometrik, kapalı, deterministik    [x] 2026-08-17

📖 §7.1, §12.1 · D-254
🔗 11.1
🛠 Referans örnek 4'ün dili: **blob · nokta ızgarası · taralı daire · kontur halka ·
   küçük kare.** Hepsi SVG/CSS, sıfır bağımlılık, `SlaytKimligi`den türetilmiş konum ve
   ölçek — yani deterministik ve slayttan slayta değişen.
📁 `packages/render/src/sablon-susleme.ts` · `sablon-susleme.test.ts` ·
   `packages/render/src/static.ts`
✅ **RENDER EDİLDİ VE BAKILDI** — nokta ızgarası + halka (çift indeks) ve taralı daire
   (tek indeks) dolgu tarafında, hayalet rakamın üstünde, metin sütununa girmeden.
   ⚠ **Slayt başına EN FAZLA İKİ öge.** Referansta bol süsleme var ama o tasarımın zemini
   BEYAZ ve başka hiçbir şey yok; bizde iki renk alanı, akan eğri ve dev hayalet rakam
   zaten var. Beşini birden koymak "zengin" değil KALABALIK olurdu.
   **Kapak SÜSSÜZ:** ızgarada ilk kare bir cümledir, bir desen değil.
   ⚠ **Yoğunluk bir PARAMETRE, sabit değil (D-262):** taralı daireyi tek bir slaytta
   kalabalık buldum ve çizgi sayısını global olarak düşürdüm — tek bağlamın ölçüsünü tüm
   tasarımlara uygulamak. Aynı yoğun tarama koyu zeminli bir ailede DOĞRU olurdu. Dağarcık
   kapalı (beş şekil), parametreleri açık. Ayırt edici soru: *"bu sayı her tasarımda aynı mı
   olmalı?"*
   Süsleme katmanı ayrı bir SVG: alan katmanı `preserveAspectRatio="none"` ile geriliyor
   ve aynı viewBox'a konsaydı her daire ELİPS olurdu.
🧪 **8 test + ihlal:** süslemeyi metin sütununa taşı → `METİN SÜTUNUNA girmiyor` kırmızı.
   Ayrıca: tuval dışına taşmıyor · kapak süssüz · en fazla iki öge · deterministik ·
   yalnız kapalı dağarcık · her tip geçerli SVG · **tarama daireyi TAM kaplıyor** (ilk
   sürüm `x-r`den başlıyordu, sol alt yarı boş kalıyor ve daire KAMA gibi görünüyordu).
💾 `feat(render): geometrik susleme dagarcigi` · `Refs: FAZ-11.2 · §7.1`

---

## 11.3 — İkon dağarcığı: gömülü SVG, kapalı liste    [x] 2026-08-17

📖 §7.1 · R-20 · D-261
🔗 11.2
🛠 Liste slaytlarında madde çizgisi yerine **ikon**. Kaynak: MIT/ISC lisanslı bir SVG
   seti (Lucide ISC · Phosphor MIT · Tabler MIT · Iconoir MIT — dördü de atıfsız ticari
   kullanıma açık). Fontlar gibi **GÖMÜLÜ**: seçilen ikonlar `brand/<id>/ikonlar/`
   altına alınır, çalışma anında ağdan çekilmez.
📁 `packages/render/src/sablon-ikon.ts` · `sablon-ikon.test.ts` · `static.ts`
✅ **RENDER EDİLDİ VE BAKILDI** — üç madde, üç doğru ikon: takvim/ekip/belge ve
   kutu/düşüş/enerji. Metin sütununu bozmuyor, madde çizgisinin yerine geçiyor.
   ⚠ **PLANDAN SAPMA:** kaynak bir MIT/ISC seti değil, **kendi çizimimiz**. Üç sebep
   `sablon-ikon.ts` başında yazılı — 40 satır kuralı, denetlenecek lisans olmaması, ve
   kontur kalınlığının setin değil MARKANIN ölçüsünden gelmesi. Yalnız tam kurulabilir
   ilkeller kullanıldı (çizgi, çember, dikdörtgen, yay); ezberden `path` verisi yazılsaydı
   bozuk çizilir ve ancak bakınca görülürdü.
   ⚠ **Kazananı KELİME sırası belirliyor, ikon listesi değil.** *"Üretim hattı iki saat
   durdu"* iki kök içeriyor; ilk sürümde kazananı `IKONLAR` dizisindeki konum seçiyordu —
   keyfî. Türkçe cümle KONUYU başa koyar, o yüzden ilk eşleşen KELİME kazanıyor.
   ⚠ **Eşleşme kelime BAŞINDA aranıyor.** `includes` ile `ara`→"p**ara**metre",
   `kaza`→"**kaza**nç", `süre`→"**süre**ç" çarpışıyordu. Türkçe sonek dilidir: kök başta
   durur, ek öne gelmez.
   ⚠ **Eşleşme yoksa ikon YOK** — indekse göre zorla atamak, takvimden bahseden satırın
   yanına fabrika koyardı. Anlamsız ikon, ikonsuzluktan kötüdür.
   ⚠ **34 px BAKINCA düzeltildi:** 28 px'te ikon 34 px metnin yanında cılız kalıyordu;
   24 birimlik ızgarada şekiller ~19 birim doldurduğu için kutu boyutu görünen boyut değil.
🧪 **9 test + ihlal:** `ikonSvg('kahve', …)` → `error TS2345` (kapalı birleşim).
   Ayrıca gerçek Türkçe satır tablosu · kelime-içi eşleşmeme · Türkçe küçük harf
   (`ISRAF` noktasız I ile eşleşMEZ ve bu DOĞRU) · determinizm · 24×24 ızgara taşması.
💾 `feat(render): gomulu ikon dagarcigi` · `Refs: FAZ-11.3 · §7.1`

---

## 11.4 — Fotoğraf yuvaları: maske ve alan    [x] 2026-08-17

📖 §7.1 · D-261
🔗 11.2
🛠 Fotoğraf kalırsa **işlenmiş** kalır. İki yuva: `maske` (daire ya da eğri şekliyle
   `clip-path`) ve `alan` (yarım kareyi uçtan uca dolduran). Referans örnek 5'in dili.
   Dikdörtgen serbest fotoğraf ARTIK YOK.
📁 `packages/kernel/src/doc/model.ts` · `packages/render/src/static.ts` ·
   `packages/contracts/src/tasarim-plani.ts` · `packages/engine/src/plan/tasarla.ts`
✅ Yuva belge modelinde ROL olarak duruyor (`yuva: 'alan' | 'maske'`), çizim render'da.
   **Yuvasız görsel `validateDocument` tarafından REDDEDİLİYOR** — serbest dikdörtgen
   fotoğraf artık temsil EDİLEMİYOR. Ürün ekran çekimi hariç: o bir kanıttır.
   ⚠ **Biçim bir POLİTİKA** (D-264 deseni): görselin ne olduğuna bakıp seçilemez, çünkü
   görsel plandan SONRA üretiliyor. Hat/aile söylüyor, plan gerekçesini yazıyor.
   ⚠ ⚠ **DİYAGRAM İLE FOTOĞRAF AYRI SLAYTLARA AYRILDI — bağımsız doğrulama bulgusu.**
   İkisi aynı indeks için (`ortaIndex`) yarışıyordu ve `icerikPromptu` her konuda AKIŞ
   istediği için diyagram neredeyse her zaman kazanıyordu: `gorsel_yuvasi: true` fiilen
   **ölü bir kısıttı** ve altı gerçek koşuda `yuva-doldur` bir kez bile yuva doldurmadı.
   *"Aynı slaytta iki görsel öge olmaz"* kuralı SLAYT başınadır, karosel başına değil.
   Yuva artık `gerilim` slaydında (kancadan hemen sonra — referans örnek 2'nin dili).
   ⚠ **`maske` çapı PİKSEL, yüzde değil.** İki deneme `aspect-ratio` ve `flex: none` ile
   denendi, ikisinde de daire kenarından DÜZ KESİLDİ: kutu kare olmuyordu ve
   `clip-path: circle(50%)` kare olmayan kutuda yarıçapı KÖŞEGENDEN hesaplıyor. Çap
   güvenli sütunun içerik genişliğinden türetiliyor — yeni sayı değil.
🧪 Yuvasız görsel bloğu → `validateDocument` `image_without_slot`; testler kırmızı.
💾 `feat(render): fotograf yuvalari maske ve alan` · `Refs: FAZ-11.4 · §7.1`

---

## 11.5 — Kesik özne: arka plan silme    [ ] BLOKE:karar

📖 §7.3 · §17 · D-261
🔗 11.4
🛠 Referans örnek 2 ve 3'ün dili: arka planı silinmiş özne, şeffaf PNG. Yerel yol
   **BiRefNet (MIT)** — planda "yerelde bedava çalışacaklar" listesinde zaten adı geçiyor.
📁 —
✅ ⚠ **Lisans tuzağı belgeli:** Bria RMBG **CC BY-NC** ve MIT `rembg` paketinin içinde
   geliyor — yanlışlıkla seçilmesi kolay (§17). Seçilen model ve lisansı `KARARLAR.md`ye
   yazılmadan bağlanmaz.
   ⚠ Yeni bir bağımlılık ve ~1 GB ağırlık; bir KARAR ister, bir import değil.
🧪 —
💾 —

---

## 11.6 — Taban → model: kompozisyonu GÖREN üretim    [ ] BLOKE:karar

📖 §7.3, §8.2 · R-20 · D-261
🔗 11.4
🛠 Kullanıcının tarif ettiği sektör pratiği: **taban deterministik render edilir, modele
   gönderilir, model ögeleri ekler.** Bugünkü akışın tersi — bugün model KÖR üretiyor ve
   biz sonucu bir kutuya sıkıştırıyoruz; FAZ-10.7'deki bütün görsel kusurlar buradan.
   Modelin kompozisyonu görmesi, nereye ne sığacağını bilmesi demek.
📁 —
✅ ⚠ **Metin katmanı modele GİTMEZ.** Dönen görselin ÜSTÜNE yeniden basılır — böylece
   tipografi hiçbir zaman modelden geçmez ve `ğ ş İ ı` garantisi (R-20) korunur. Tasarım
   metrikleri dönen varlığa da koşar.
   ⚠ Yeni yetenek: görselden görsele (img2img/inpaint), yeni sağlayıcı yolu. `GENERATE`
   fiili altında kalır — dokuzuncu fiil eklenmez.
🧪 —
💾 —

---

## 11.7 — Renk işleme: duotone ve marka tonlaması    [ ]

📖 §7.1, §12.1 · D-261
🔗 11.4
🛠 **Envanter ölçüldü ve utandırıcı:** render katmanında `object-fit` dışında HİÇBİR
   görsel işleme kullanılmıyor. `filter`, `mix-blend-mode`, `clip-path`, `feColorMatrix`
   — hepsi Chromium'da standart, hepsi bedava, hiçbiri kullanılmamış.
   Yapılacak: `feColorMatrix` ile **duotone** — fotoğrafın parlaklığı marka amber↔mürekkep
   ekseni üstüne eşlenir. Ek olarak doygunluk düşürme ve `mix-blend-mode: multiply`
   ile alan üstüne bindirme.
📁 `packages/render/src/sablon-filtre.ts` · `packages/render/src/static.ts`
✅ ⚠ **Bu, marka tutarlılığı sorununu YAPISAL çözüyor.** FAZ-10.7'de mavi/turuncu bir
   fotoğraf amber alanla çarpıştı ve ben brief'e "monokrom yaz" diye YALVARDIM — modelin
   uymasına bağlı, kırılgan bir çözüm. Duotone ise girdiden bağımsız: HANGİ fotoğraf
   gelirse gelsin marka ekseninde çıkar. Prompt'a güvenmek yerine çıktıyı dönüştürmek.
   Kabul: doygun bir test görseli duotone'dan geçince palet dışı payı ölçülür ve düşer.
🧪 Duotone kapalıyken ve açıkken aynı görsel ölçülür; fark ölçüyle gösterilir.
💾 `feat(render): duotone ve marka tonlamasi` · `Refs: FAZ-11.7 · §12.1`

---

## 11.8 — Doku ve derinlik: grain, bulanıklık, degrade, vinyet    [ ]

📖 §7.1 · R-30 · D-261
🔗 11.7
🛠 `feTurbulence` ile ince grain (baskı hissi), `filter: blur()` ile arka katman
   derinliği, `linear/radial-gradient` ile alan geçişleri, kenar vinyeti. Hepsi CSS/SVG,
   sıfır bağımlılık, deterministik.
📁 `packages/render/src/sablon-filtre.ts`
✅ ⚠ **Gölge YASAĞI konsol yüzeyine aittir (§12.1), kreatif yüzeye değil.** İkisini
   karıştırmak, bir enstrüman kuralını bir kreatif kurala çevirmek olurdu. Kreatif
   yüzeyde derinlik meşru; ölçü chroma tavanı ve kontrast metriğiyle korunuyor.
   Grain opaklığı tavanlı: doku bir his, bir gürültü değil.
🧪 Grain opaklığını tavana çıkar → metin kontrastı metriği kırmızı.
💾 `feat(render): doku, bulaniklik ve degrade` · `Refs: FAZ-11.8 · §7.1`

---

## 11.9 — Yerel raster işlemleri: ölçek, kırpma, arka plan    [ ] BLOKE:karar

📖 §7.3 · §17 · D-261
🔗 11.5
🛠 CSS/SVG'nin yapamadıkları: **upscale** (Real-ESRGAN), **akıllı kırpma** (belirginlik
   haritası), **arka plan silme** (BiRefNet). Üçü de planın "yerelde bedava çalışacaklar"
   listesinde ve üçü de ikili çalıştırmak demek.
📁 —
✅ ⚠ Her biri AYRI bir karar ve ayrı bir bağımlılık; toplu "görsel işleme paketi" diye
   bağlanmaz. Lisans tuzağı belgeli: Bria RMBG **CC BY-NC**, MIT `rembg` içinde paketli.
   ⚠ Alt süreç çalıştırma tek darboğazdan geçmek zorunda (`chokepoints.json`).
🧪 —
💾 —

## 11.10 — İllüstrasyon kütüphanesi: CC0 modüler, markaya boyanmış    [ ]

📖 §7.1, §11.3 · D-252
🔗 11.3, 11.7
🛠 *"Çok fazla görsel kütüphane var."* Doğru — ve lisansları ayrıştırıldı:

| Kütüphane | Lisans | Not |
|---|---|---|
| **Open Peeps** | **CC0** | Elle çizilmiş, modüler (baş/gövde/poz). Kısıtsız. |
| **Humaaans** | **CC0** | Modüler insan. Kısıtsız. |
| DrawKit (ücretsiz) | MIT | SaaS/teknoloji sahneleri. |
| unDraw | özel | Ticari serbest, atıf gerekmez; ⚠ AI eğitiminde kullanımı yasak (biz kullanıyoruz, eğitmiyoruz). |
| Storyset | atıf zorunlu | Atıf karoselde yer kaplar → düşük öncelik. |

📁 `assets/illustration/` (gömülü SVG alt kümesi) · `packages/render/src/illustrasyon.ts`
✅ ⚠ **SVG olarak gömülür ve markaya BOYANIR** — `fill` değerleri token'a bağlanır, dosyadaki
   ham renk kullanılmaz. Boyanmazsa kütüphanenin kendi paleti markayı ezer; çeşitlilik
   uğruna tutarlılık kaybedilmiş olur.
   ⚠ **§11.3 sınavı zorunlu:** *onay ima eden yapay insan üretilmez.* Soyut/şematik figür
   serbest; **"memnun müşteri" tasviri YASAK** — çizim de olsa Reklam Yönetmeliği Md. 27/12
   kapsamına girer. Bu, illüstrasyonun modelle üretilmesiyle değil KULLANIMIYLA ilgili.
   ⚠ Kapalı alt küme: kütüphanenin tamamı değil, seçilmiş ~15 sahne. Ağdan çekilmez (§16).
🧪 Boyanmamış (ham renkli) bir illüstrasyon yerleştir → `kalite` palet dışı ile kırmızı.
💾 `feat(render): illustrasyon dagarcigi` · `Refs: FAZ-11.10 · §7.1`
