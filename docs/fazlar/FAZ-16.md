# FAZ 16 — Tam editör, tak-çalıştır depo, bağlamsız giriş

**Amaç:** İki kapı. (1) Üretilmiş her şey **elle mükemmelleştirilebilir** olmalı —
yazının yeri, puntosu, ögenin silinmesi dahil. (2) Depoyu ilk kez gören bir agent
(ya da takım arkadaşı) **tek komutla** karosel üretebilmeli.

**Yöneten kararlar:** D-301 (veri düzenlenir, piksel değil) · D-307 (Canva dışa aktarım
hedefi, düzenleme döngüsü değil) · Yasa 4 · Yasa 11 · Yasa 13

---

## 16.1 — Metin de görsel gibi: taşı, ölçekle, sil    [x]

📖 §7.1 · D-301
🔗 FAZ-15.14
🛠 Bugün yalnız görsel kutusu sürükleniyor; metin yalnız İÇERİK olarak düzenlenebiliyor.
   Depo sahibi: *"yazıların yerleri de görseller gibi değiştirilmeli, büyüme küçültme,
   öge silme"*.
   ⚠ ⚠ **KÖK SORU: metnin yeri nereye YAZILIYOR?** Görselin `x/y/genislik`i var, metnin
   YOK — kart içinde flex akışında duruyor. Serbest konum vermek kompozisyonu yok eder
   (Yasa 13: hat düzen icat etmez). Doğru çözüm ARADA: kartın kendi ızgarasında
   **kaydırma payı** (`kayma: {x, y}`) ve **punto çarpanı** (`olcek`), sınırlı aralıkta.
   Böylece elle ince ayar mümkün, kompozisyon bozulmaz.
📁 `packages/render/src/panorama.ts` · `scripts/duzenleyici.mjs`
✅ Metin sürüklenebiliyor, Shift ile puntosu değişiyor, silinen alan belgeden düşüyor,
   `git diff` katalogda karşılığını gösteriyor
🧪 Kayma aralığını aş → denetim `kart-disi` veriyor
💾 `feat(render): metin kaymasi ve punto carpani` · `Refs: FAZ-16.1 · §7.1`

## 16.2 — Editörde tipografi ve renk paneli    [x]

📖 §7.1 · §12.1
🔗 FAZ-16.1
🛠 Şablonun `tipografi` reçetesi (genişlik, ağırlık, satır aralığı, harf aralığı) ve
   kart zemini editörden değiştirilebilmeli. ⚠ Renk **serbest seçilmez**: marka
   rampasından seçilir (R-35 · `tokens` kapısı). Serbest hex bir marka ihlalidir.
📁 `scripts/duzenleyici.mjs` · `packages/render/src/panorama.ts`
✅ Panelden yapılan her değişiklik belgeye yazıyor ve katalogda karşılığı çıkıyor
🧪 Rampa dışı renk seç → editör reddediyor
💾 `feat(cli): tipografi ve zemin paneli` · `Refs: FAZ-16.2 · §12.1`

## 16.3 — Öge ekleme: kendi görselini koy    [x]

📖 §7.2 · R-20
🔗 FAZ-16.1
🛠 Depo sahibi kendi fotoğrafını yuvaya koyabilmeli. Dosya editöre sürüklenir, blob
   deposuna damgalanır (R-11), yuvaya bağlanır. ⚠ Model üretimi DEĞİL — insan varlığı;
   `claim_source` ve `alt_tr` yine zorunlu (R-34).
📁 `scripts/duzenleyici.mjs` · `packages/engine/src/blobs.ts`
✅ Elle konan görsel damgalanıyor, render'a giriyor, defterde izi var
🧪 `alt_tr` olmadan koy → yayın kapısı kırmızı
💾 `feat(cli): elle gorsel yerlestirme` · `Refs: FAZ-16.3 · §7.2`

## 16.4 — `SKILLS.md`: bağlamsız agent tek komutla üretiyor    [x]

📖 §16 · Yasa 12
🔗 —
🛠 Depo sahibi: *"bağlamı olmayan, repoyu tanımayan bir chatteki agent bile anında
   bunu çalıştırabilmeli"*. Ürün başına bir dosya: `docs/skills/karosel.md`,
   ilerde `reels.md`. Her biri TEK ekranda: önkoşul, tek komut, ne bekleneceği,
   nerede duracağı (insan kapısı), nasıl revize edileceği.
   ⚠ `CLAUDE.md` derin bağlam içindir; `SKILLS.md` **sıfır bağlam** içindir. İkisi
   ayrı okuyucu için yazılır ve karıştırılırsa ikisi de işe yaramaz.
📁 `SKILLS.md` · `docs/skills/karosel.md` · `README.md`
✅ Depoyu hiç görmemiş bir agent yalnız `SKILLS.md` okuyup karosel üretebiliyor
   (bağımsız doğrulama agent'ıyla sınandı)
🧪 Komutu bozuk yaz → doğrulama agent'ı üretemiyor
💾 `docs(docs): sifir baglam giris belgesi` · `Refs: FAZ-16.4 · §16`

## 16.5 — Tak-çalıştır: klonla, tek komut, üretime devam    [x]

📖 §16 · Yasa 12
🔗 FAZ-16.4
🛠 Takım arkadaşı klonlayıp tek komutla üretebilmeli ve GEÇMİŞ korunmalı. Bugün
   `corpus/`, `brand/`, katalog ve defterler depoda; eksik olan **kurulum tek komutu**
   ve önkoşul denetimi (Node sürümü, Chromium, `sops` anahtarı, rembg).
   ⚠ Büyük ikili varlıklar dışarıda kalır (R-64) — onlar `derived/blobs`ta ve
   yeniden üretilebilir; kompozisyon (`panorama.json`) depoda (D-302).
📁 `justfile` · `README.md` · `scripts/setup.sh`
✅ Temiz klonda `just setup` eksikleri sayıyla söylüyor, `just uret` koşuyor
🧪 Bir önkoşulu kaldır → `just setup` onu ADIYLA bildiriyor
💾 `feat(repo): tek komut kurulum denetimi` · `Refs: FAZ-16.5 · §16`

## 16.6 — "Yeni bir karosel üret" tekrar etmiyor    [x]

📖 §11.4 · D-268
🔗 FAZ-16.4
🛠 Depo sahibi: *"sistem önceki oluşturulanlardan FARKLI yeni bir tane planlayıp"*.
   Bugün konu insandan geliyor; konusuz çağrıda hat duruyor. Defterdeki geçmiş
   koşular okunup **işlenmiş konular** ve **kullanılmış şablonlar** çıkarılmalı;
   yeni koşu ikisinden de kaçınmalı.
   ⚠ Rastgelelik değil KAYIT: seed'li rng (R-06) ile geçmişten ELENMİŞ bir aday
   kümesi. "Farklı" ölçülebilir olmalı, hissedilir değil.
📁 `packages/engine/src/plan/` · `registry/pipelines/instagram-karosel.pipeline.yaml`
✅ Konusuz çağrı geçmişte olmayan bir konu + son üç koşuda kullanılmayan bir şablon seçiyor
🧪 Aynı konuyu iki kez iste → ikincisi farklı şablon seçiyor ya da gerekçeyle duruyor
💾 `feat(engine): tekrar etmeyen konu secimi` · `Refs: FAZ-16.6 · §11.4`

## 16.7 — Çeşitlilik metinde başlıyor: `metin-uret` şekil değiştirmiyor    [x]

📖 §11.4 · D-308 · D-268
🔗 FAZ-16.6
🛠 ⚠ ⚠ **16.6 BAĞLANDI VE ÇALIŞTI, AMA ÜRETİMDE TEKRAR SÜRDÜ — ve sebebi ölçüldü.**
   Şablon çeşitlilik kuralı son kullanılanları eliyor; iki gerçek koşuda kısıt gövdeye
   ulaştı (`son_kullanilan = 'sahne,veri-hikayesi,donen'`) ve yine `sahne` seçildi.
   Kural doğru davrandı: eleme yalnız BAŞKA UYGUN ADAY varsa uygulanıyor ve o
   içeriklerde yoktu.
   ⚠ Kök daha derinde: `metin-uret` konudan bağımsız olarak **aynı şekli** üretiyor.
   Açıkça "2019 2021 2023 2025 rakamlarla" denen bir konuda bile çıktı anlatı oldu,
   sayısal ritim taşımadı — ve sayısal ritim olmadan `veri-hikayesi` puan alamıyor.
   **Şablon çeşitliliği içerik çeşitliliğinin sonucudur, sebebi değil.**
   ⚠ Çözüm sırayı ters çevirmek DEĞİL (şablon önce seçilirse içerik ona uydurulur ve
   Yasa 13 tersine döner). Çözüm `metin-uret` istemine geçmişin ŞEKLİNİ söylemek:
   "son üç karosel anlatı biçimindeydi" → model başka bir ritim kurar.
📁 `packages/engine/src/verbs/bodies.ts` · `packages/engine/src/plan/gecmis.ts`
✅ Zaman serisi konusunda üretilen satırlar sayısal ritim taşıyor ve şablon değişiyor
🧪 Şekil ipucunu kaldır → aynı konuda yine anlatı çıkıyor
💾 `feat(engine): metin sekli gecmisten kaciniyor` · `Refs: FAZ-16.7 · §11.4`

## 16.8 — Biçim kuralı ÖLÇÜLÜYOR: istenen ritim geldi mi    [ ]

📖 §11.4 · D-309 · R-70
🔗 FAZ-16.7
🛠 16.7 ritmi sayılabilir bir sözleşmeye çevirdi ve gerçek koşuda tuttu (`akan-alan`
   seçildi). Ama **uyulup uyulmadığı ölçülmüyor**: model sözleşmeyi görmezden gelirse
   hat sessizce eski şekle döner ve bunu ancak defteri elle okuyan biri fark eder.
   ⚠ Bu deponun kendi kuralı: ölçülmeyen bir kural bir temennidir. Aynı ders başlık
   kelime bütçesinde (D-305) ve sayaç yasağında (D-303) çıktı — ikisinde de istem
   söylüyor VE `uyarla` reddediyor.
   ⚠ Ret değil ÖLÇÜM + kayıt: metin adımı bir model çağrısı, reddetmek bir tur daha
   yakar. Önce defterde `ritim_tutmadi` görünsün; tur harcamaya değip değmediği
   sayılarla konuşulsun.
📁 `packages/engine/src/metin-akisi.ts` · `packages/engine/src/verbs/bodies.ts`
✅ İstenen ritim ile üretilen şekil karşılaştırılıyor ve uyuşmazlık deftere yazılıyor
🧪 Numaralı ritim iste, numarasız metin ver → defterde uyuşmazlık görünüyor
💾 `feat(engine): ritim uyumu olculuyor` · `Refs: FAZ-16.8 · §11.4`
