# FAZ 17 — Adım adım onay: üretim bir SOHBET değil, bir HAT

**Amaç:** Depo sahibi işi chat'ten başlatır, **her adımı UI'dan onaylar**, sonda editörde
genel revizyonu yapar ve "yayına hazır" der. API'ler bağlandığında yayın zamanı
planlanır — o da bir karardır, otomatik değil.

**Yöneten kararlar:** Yasa 2 (agent önerir, insan uygular) · D-301 · §4c (onay bir KAPIDIR)

> Mekanizma zaten var: bir adım `gate:` ilan eder, koşu orada DURUR, `awaitingGate`
> deftere yazılır ve `just onay <run> onayla` + `just uret --devam <run>` sürdürür.
> Eksik olan şey kapıların YERİ (yalnız sonda) ve onların bir YÜZÜ olmaması.

---

## 17.1 — Kapılar adımlara yayılıyor: metin · tasarım · yayın    [x]

📖 §4c · Yasa 2
🔗 FAZ-16.10
🛠 Bugün tek kapı en sonda (`insan-onayi`). Depo sahibi *"metin oluşturunca onayıma
   düşecek, onayladıktan sonra devam"* dedi — yani onay üretimin SONUNDA değil,
   maliyetin ÖNÜNDE olmalı. Metin yanlışsa görsel üretmenin anlamı yok ve parası
   boşa gider.
   ⚠ Kapı sayısı ARTMIYOR gibi görünmeli: her kapı bir duraktır ve gereksiz durak
   akışı öldürür. Üç kapı: **metin** (ucuz, en erken), **tasarım** (render sonrası,
   görsel maliyeti ödenmiş), **yayın** (bugünkü `insan-onayi`).
📁 `registry/pipelines/instagram-karosel.pipeline.yaml`
✅ Koşu metin sonrası duruyor; `just onay … onayla` + `--devam` ile ilerliyor
🧪 Onaysız `--devam` → hat aynı kapıda duruyor, sessizce geçmiyor
💾 `feat(registry): adim kapilari` · `Refs: FAZ-17.1 · §4c`

## 17.2 — Kapının YÜZÜ: komuta merkezi ana ekranı    [x]

📖 §4c · D-301
🔗 FAZ-17.1
🛠 ⚠ ⚠ **TEŞHİS YANLIŞTI VE KULLANIM DÜZELTTİ.** Bu adım "editöre koşu paneli ekle"
   diye yazılmıştı; oysa komuta merkezi (`just dev`, `apps/ui`) ZATEN vardı ve içinde
   `OnayKuyrugu` dahil on dokuz ekran duruyordu. Kusur eksiklik değil GÖRÜNMEZLİKTİ:
   açılış ekranı yalnız *"komut paletini açmak için ⌘K — menü yok"* diyordu ve paneli
   ilk açan kişi *"tek ekran var, onay ekranını göremedim"* dedi. Keşfedilemeyen bir
   ekran, olmayan bir ekrandır.
   ⚠ Palet KALDIRILMADI — hızlı yol o. Kaldırılan şey, paletin TEK yol olmasıydı.
   ⚠ *"Başka üret"* bir REDDİR ve gerekçesi negatif kısıt olarak sonraki denemeye
   girer (D-191) — gerekçesiz ret, aynı çıktıyı ikinci kez üretir.
📁 `scripts/duzenleyici.mjs` · `scripts/duzenleyici-istemci.js`
✅ Bekleyen kapı panelde görünüyor, onay koşuyu sürdürüyor, ret gerekçesi kaydediliyor
🧪 Gerekçesiz ret dene → panel gerekçe istiyor
💾 `feat(cli): kosu paneli ve kapi onayi` · `Refs: FAZ-17.2 · §4c`

## 17.3 — Yayın zamanı: bir KARAR, otomatik değil    [x]

📖 §11 · R-46
🔗 FAZ-17.2
🛠 API'ler bağlandığında yayın anı planlanacak. ⚠ Bu bir optimizasyon değil bir karar:
   hat en iyi saati ÖNERİR, insan seçer, seçim deftere yazılır. Otomatik yayın,
   Yasa 2'nin ihlalidir.
   ⚠ Öneri kaynağı ölçüm olmalı — geçmiş yayınların etkileşimi. Veri yokken hat
   *"veri yok, saat öneremem"* demeli; uydurulmuş bir saat, kaynaksız bir iddiadır.
📁 `registry/pipelines/` · `packages/engine/src/plan/`
✅ Yayın adımı saat ÖNERİYOR, gerekçesiyle; insan seçmeden yayın yok
🧪 Geçmiş veri olmadan saat iste → hat öneri yapmıyor, sebebini yazıyor
💾 `feat(engine): yayin zamani onerisi` · `Refs: FAZ-17.3 · §11`
