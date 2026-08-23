# FAZ 18 — Dizayn sistemi karosele iniyor

**Amaç:** Markanın gerçek dizayn sistemi (`examples/design-system-master/`, gitignore'lu)
karoselin tipografisini, paletini ve kompozisyonunu yönetir. Altı+ şablon birbirinden
farklı ama tek bir Instagram ızgarasında yan yana geldiğinde **bir aile** olarak okunur.

**Yöneten kararlar:** D-317 · D-318 · D-319 · D-320 · D-321 · Yasa 4 · Yasa 5 · R-81

> **Araştırma ÖNCE yapıldı, sonra kodlandı.** 18.0 üç bağımsız araştırmanın raporu ve
> sonraki her adım o raporlardan bir maddedir. Sayılar **kaynağıyla** duruyor; ölçüm
> gerekçeleri `docs/kurallar/OLCUMLER.md`'de.

---

## 18.0 — Araştırma tabanı: spec · tasarım disiplini · marka farkı    [x]

📖 §7.1 · D-321
🔗 FAZ-17.3
🛠 Üç paralel araştırma: (a) Instagram 2026 spec'i (birincil kaynak Meta dokümanı);
   (b) seamless tasarım disiplini — görme bilimi (Legge & Bigelow 2011), Butterick,
   NN/g, Müller-Brockmann; (c) dizayn sistemi ↔ hat marka seti farkı.
📁 `docs/referans/arastirma-2026-08.md`
✅ Her sayı kaynağıyla · çelişen kaynaklar İKİSİ DE yazılı · doğrulanamayan "doğrulanmadı"

## 18.1 — Tip ölçeği: dört aile, dört rol    [x]

📖 §7.2 · D-317
🛠 Plus Jakarta Sans (gövde) · Source Serif 4 (kapak H1) · Montserrat (bölüm başlığı) ·
   JetBrains Mono (rakam, künye). El yazısı ve `wdth` ekseni emekli.
✅ Dördü de 15/15 Türkçe kod noktası · `Ş`≠`Ș` · `latn/TRK` · beşinci aile kırmızı

## 18.2 — Palet: yakın-monokrom zemin, tek karneli aksan    [x]

📖 §12.1 · D-318
🛠 Nötrler chroma 0; kanvas `#040404`, kâğıt `#fafafa`. Aksanın iki adımı; vurgu çipi ve
   mavi zeminler emekli. ✅ Aksan hiçbir şablonda zemin ya da büyük yüzey değil

## 18.3 — Süreklilik: ölçek çizgisi, kesim üstü görsel    [x]

📖 §7.1 · D-319
🛠 Degrade/gren/vinyet emekli; `olcek` bandı geldi. `sahne`de görsel slayt başına değil
   **kesim başına** — depo sahibi: *"tek görsel iki sayfanın ortasında olmalı."*
✅ `sahne` 12 → 2 kusur · çakışma 8 → 0 · kusur kasten üretildi, kırmızı döndü

## 18.4 — Tanımsız token çağrısı kapısı    [x]

📖 §4.1 · D-320
🛠 D-318 amber rampasını emekli etti, `aile.ts` çağırmaya devam etti. **CSS tanımsız
   `var()` için hata VERMEZ** — ögeyi sessizce şeffaf bırakır.
✅ 52 token · 325 dosya · tanımsız çağrı 0 · `--ramp-marka-yok-1` kırmızı döndü

---

## 18.5 — Okunabilirlik tabanı: gövde 36 px ALTINA İNEMEZ    [x]

📖 §7.2 · D-321
🔗 FAZ-18.4
🛠 ⚠ ⚠ **EN KRİTİK AÇIK.** Kritik punto 0,2° açısal x-yüksekliği → **taban 36 px, hedef
   40–48**. `govdeOrani` GÖRELİ ve tabanı ezebiliyordu; ölçüldü — bugün **34 px**.
📁 `packages/render/src/panorama.ts` · `punto-esigi.test.ts`
✅ Gövde 34 → **36 px** · taban tuval genişliğine ORANTILI · `govdeOrani` ezemiyor ·
   kural **R-83**
🧪 `govdeTabani` 24'e sabitlendi → `sahne` 4 + `donen` 4 `punto-esik-alti` kusuru, geri alındı

## 18.6 — Ölçü bandı: satır 45–75 karakter    [x]

📖 §7.2 · D-321
🔗 FAZ-18.5
🛠 Satır aralığı ÖLÇÜLDÜ ve zaten doğruydu. **Asıl kusur satır UZUNLUĞUYDU ve ters
   yöndeydi:** `donen` 19, `editoryal` 27, `sahne` 30 karakter — bandın çok altı. Sebep:
   gövde başlığın sütununa hapsedilmişti; `govdeSutunu` eklendi.
✅ `donen` 19 → 49 · `editoryal` 27 → 55 · `akan-alan` 45 → 57 · kural **R-86**
🧪 Alt sınır herkese dayatıldı → altı şablon kırmızı; kusur sütun KAPASİTESİNE bağlandı
   → dengede. "Sağlanması imkânsız bir şey isteyen ölçüm, ölçüm değil gürültüdür."
💾 `feat(render): olcu bandi` · `Refs: FAZ-18.6 · §7.2`

## 18.7 — Dikiş disiplini: HER kesimde taşıyıcı    [x]

📖 §7.1 · D-321
🔗 FAZ-18.3
🛠 **Dikiş mekânsal değil ZAMANSAL:** izleyici iki slaydı yan yana görmez; sürekliliği
   kısa süreli bellek kuruyor ve bellekte **gist** kalıyor. Her kesimde en az bir taşıyıcı
   ÖLÇÜLEREK doğrulanıyor — "kesintisiz" iddiası test edilmeden kabul edilmiyor.
✅ Ölçüm kesim BAŞINA · `donen` haksız kusuru düştü (ölçek bandı artık tanınıyor) ·
   `memphis` 2 + `editoryal` 2 GİZLİ boş kesim bulundu ve kapatıldı · kural **R-87**
🧪 Görselleri kesim arasına sıkıştır → boş kesimlerin x'iyle kırmızı; `gorseller: []`
   yazmak YANLIŞ olurdu — iddia da düşer ve ölçüm hiç çalışmaz
💾 `feat(render): her kesimde tasiyici` · `Refs: FAZ-18.7 · §7.1`

## 18.8 — Güvenli alan ve metin payı ölçülüyor    [x]

📖 §7.1 · D-321
🔗 FAZ-18.7
🛠 Üst dolgu **68 → 80 px**. Metin **≤%30**, kapak %42. Kontrast ≥4,5:1, zemin gerçek
   render'dan örnekleniyor. ⚠ Dolaşımdaki safe-zone sayıları doğrulanmadı — çoğu Reels
   rakamının akışa yanlış taşınması.
✅ Üst dolgu 68 → **80** · altı şablonda `guvenli-alan-disi` 0 · metin ≤%30 (kapak %42) ·
   gövde başlığı 0,82 çarpanıyla indi · kural **R-88**
🧪 Panel metin sayıldı → `veri-hikayesi`nin beş kartı kırmızı; panel ayrıldı → temiz.
   Tek eşik denendi → kapak ile gövde çelişti; iki eşik uzlaştırdı.
💾 `feat(render): guvenli alan ve metin payi` · `Refs: FAZ-18.8 · §7.1`

## 18.9 — Kelime bütçesi: başlık ≤8, slayt ≤28    [x]

📖 §11.4 · D-321
🔗 FAZ-18.6
🛠 *"5–8 kelimelik kanca"* pazarlama sezgisi DEĞİL, geometri: başlık bakışlık olacak +
   2–3 satıra sığacak. Gövde ≈20 kelime.
✅ Sınır hem İSTEME yazılı hem uyarlamada zorlanıyor · ret RENDER'dan ÖNCE · kural **R-89**
🧪 11 kelimelik başlık → ret; 3 kelimelik → geçer (alt sınır zorlanmıyor: kısa başlık
   kusur değil, çoğu zaman daha güçlü); 28+ kelimelik slayt → ret
⏭ Kapak "tek başına tam gönderi" ve son slaytta tek CTA — 18.16'ya (şablon ailesi)
💾 `feat(engine): kelime butcesi` · `Refs: FAZ-18.9 · §11.4`

## 18.10 — Yayın sözleşmesi: 10 slayt · JPEG    [x]

📖 §9.2 · D-321
🔗 FAZ-17.3
🛠 ⚠ **Graph API karoseli 10 ile sınırlıyor** (uygulama 20; yayın yolumuz API) ve yalnız
   **JPEG** kabul ediyor; `publish.ts` slayt sayısını hiç kontrol etmiyordu, `panorama.ts`
   PNG yazıyordu.
📁 `packages/providers/src/publish.ts` · `packages/render/src/panorama.ts`
✅ 11 slayt → `too_many_assets` · PNG → `unsupported_format` · hat artık `.jpg` yazıyor
   ve `renderPanorama` biçimi UZANTIDAN okuyor · kural **R-90**
🧪 11 slayt → ret (yükleyici hiç çağrılmadı); tam 10 → geçti; PNG yolu → ret
⏭ Dilim boyut eşitliği 18.11'e — aynı sabiti paylaşıyorlar
💾 `feat(providers): yayin sozlesmesi` · `Refs: FAZ-18.10 · §9.2`

## 18.11 — Tuval oranı TEK kaynaktan; 3:4 bir parametre    [x]

📖 §7.1 · D-321
🔗 FAZ-18.10
🛠 Instagram 29 May 2025'ten beri **3:4 (1080×1440)** destekliyor. ⚠ **Bedeli:** 3:4 Meta
   reklamında KULLANILAMAZ. Karar "hangi oran" değil, **"oran bir parametre olsun"**.
✅ `VARSAYILAN_TUVAL` tek kaynak · altı şablon + `bodies.ts` + `strateji.ts` ondan okuyor ·
   varsayılan 4:5 · kural **R-91**
🧪 Sabit 3:4'e çevrildi → altı şablon 1080×1440 çizildi, kusur SAYISI ARTMADI; geri alındı.
⏭ `lanes.ts`'e `3:4` şeridi → 18.13c
💾 `feat(contracts): tuval orani tek kaynaktan` · `Refs: FAZ-18.11 · §7.1`

## 18.12 — Marka imzası üretim yoluna bağlandı    [x]

📖 §4.1 · §4.3 · D-321
🔗 FAZ-18.4
🛠 ⚠ ⚠ **LOGO ÜRETİM HATTINDA HİÇ BASILMIYOR.** Dosyalar ve `logo.ts` var; tek çağıran
   editör önizlemesi — `uret.mjs`te `logo` kelimesi hiç geçmiyor.
✅ `uret.mjs` logoyu yüklüyor ve `COMPOSE`a geçiyor · karosel imza taşıyor (çizildi ve
   BAKILDI: alt rayda) · kural **R-92**
🧪 Test modülü DEĞİL ÇAĞRIYI sınıyor: `uret.mjs` bir CLI ve davranış testi kopukluğu
   göremezdi. Logo verilmeyince imzanın sessizce kaybolduğu da ölçülüyor.
⏭ Eksik roller, ölçek emit'i ve `brd_dima` → 18.13c
💾 `feat(engine): marka imzasi uretim yolunda` · `Refs: FAZ-18.12 · §4.3`

## 18.13 — Ölçeklenmeyen px'ler: ölçek TEK tabandan    [x]

📖 §7.1 · D-329 · R-99
🔗 FAZ-18.12
🛠 Ölçeklenen kısım doğruydu (başlık ikili arama, `--panel-olcek`); kırık olan KROM'du:
   `.ray-logo{24/104px}` · `.kilometre-etiket{16px}` · `.kilometre-nokta{13px}` ·
   `.ray{18px, bottom 46px}` · kart dolgusu `80/64/190px`. `olc(px) = round(px × G/1080)`
   tek taban.
📁 `packages/render/src/panorama.ts` · `olcek-tabani.test.ts`
✅ 1080 → 1350'de yedi ölçünün yedisi de %25 büyüdü
🧪 Tek `olc(18)` çıplak `18px`e döndürüldü → *"ray puntosu: 18 → 18, beklenen ≈22,5"*
💾 `refactor(render): olcek tek tabandan` · `Refs: FAZ-18.13 · §7.1`

## 18.13b — Taban çizgisi ızgarası    [ ]

📖 §7.1 · D-329
🔗 FAZ-18.13
🛠 Müller-Brockmann: `TABAN = gövdePuntosu × satırAralığı` = 40×1,35 = **54 px**.
   ⚠ Kapsam DAR (D-329'da ölçüldü): kartın DIŞ DOLGUSU bir çerçeve, ritmin parçası değil.
   Kural bloklar ARASI boşluğa ait. 54'ün yarımlarına izin vermek kuralı anlamsız kılıyor
   (27 ile her sayı ifade edilebilir); tam kat ya da hiç.
📁 `packages/render/src/panorama.ts`
✅ Blok arası her dikey boşluk 54'ün (tuvale çevrilmiş) tam katı
🧪 Bir boşluğu 54'ün katı olmayan bir sayıya çek → ölçüm ADIYLA söylesin
💾 `refactor(render): taban cizgisi izgarasi` · `Refs: FAZ-18.13b · §7.1`

## 18.13c — Eksik roller, ölçek emit'i ve `brd_dima`    [ ]

📖 §4.1 · §4.3 · D-320
🔗 FAZ-18.12
🛠 Eksik roller: `fg-on-brand` (alt marka eklendiği gün sessizce beyaz basılır),
   `border-strong`, `state-info`; `state-danger`/`state-error` tek ada iniyor. Ölçek
   (spacing **48·64·96**, radius 4·6·8·12·16) `tokens.css`e emit edilmiyor. `brd_dima`
   gerçek bir alt marka DEĞİL: UpcyTech mavisini basıyor, fontu ve logosu yok.
📁 `scripts/tokens.mjs` · `brand/brd_dima/`
✅ Roller emit ediliyor · `brd_dima` ile uçtan uca koşu ölmüyor
🧪 Rolü sil → `token-cagrisi` kırmızı; `brd_dima` ile koş → font/logo eksikliği ADIYLA
💾 `feat(brand): eksik roller ve olcek emit` · `Refs: FAZ-18.13c · §4.1`

## 18.14 — Ses: yasak terim listesi sistemin sözlüğüne genişliyor    [ ]

📖 §11.4 · D-321
🔗 FAZ-18.2
🛠 Bugünkü `YASAK_TERIMLER` **altı** terim; sistemin listesi ~20 (`lider` · `en iyi` ·
   `öncü` · `yenilikçi` · `çözüm odaklı` · `dijital dönüşüm` · `akıllı` · `gelişmiş`…).
   ⚠ Üç CANLI ihlal: `veri-katmanindan-karara.md:45` · `imalat-verimlilik-konumu.md:29` ·
   `era.yaml:12` — sonuncusu DEĞİŞMEZ, `KARARLAR.md`'ye not düşülüyor.
   ⚠ `veri-yoksa-once-veri.md:54` `registry/lexicon/tr` diyor — **böyle bir yol yok**.
📁 `packages/engine/src/saglik/strateji.ts` · `corpus/`
✅ Liste ~20 terim · corpus'ta canlı ihlal 0 · hayalet yol gerçek yerle değişti
🧪 `lider` yaz → kapı kırmızı
💾 `feat(engine): yasak terim listesi genisledi` · `Refs: FAZ-18.14 · §11.4`

## 18.15 — Kaynak satırı: sistemin İMZASI karosele iniyor    [ ]

📖 §8 · §11.4 · D-321
🔗 FAZ-18.12
🛠 Sistemin tek imzası bu (*"imza renk değil, kaynak satırıdır"*) ve bizde HİÇ yok. Veri
   var (`claim_source` kapısı çalışıyor), **görsel yuva yok**. Mono + BÜYÜK HARF, sayı
   taşıyan slaytta ZORUNLU; dolmadığında görünür boş kutu.
📁 `packages/contracts/src/katalog.ts` · `packages/render/src/panorama.ts`
✅ Sayı taşıyan her slaytta kaynak satırı · boşken görünür şekilde boş
🧪 Kaynaksız sayı koy → yuva boş kutu çiziyor, sessizce gizlemiyor
💾 `feat(render): kaynak satiri` · `Refs: FAZ-18.15 · §8`

## 18.16 — Şablon ailesi büyüyor: altı → on    [ ]

📖 §7.1 · D-268
🔗 FAZ-18.9 · FAZ-18.13
🛠 Depo sahibi: *"sadece sahne yok, altı tane muazzam şablon olacak, hatta daha fazla."*
   Her yeni şablon: referans oku → modele kur → **çiz ve BAK** → 18.5–18.13 kapılarından
   geçir. Taşıyıcı güç sırası: renk alanı > çizgi/eğri > geometrik form > ok > fotoğraf.
📁 `packages/contracts/src/katalog.ts` · `packages/render/src/katalog-ornek.ts`
✅ On şablon · her biri kendi tipografi imzasını taşıyor · hepsi kapılardan geçiyor
🧪 Yeni şablonu kapılardan geçirmeden ekle → `katalog-kabul` kırmızı
💾 `feat(render): sablon ailesi buyudu` · `Refs: FAZ-18.16 · §7.1`

## 18.17 — Izgara sınavı: on şablon TEK sayfa    [ ]

📖 §7.1
🔗 FAZ-18.16
🛠 Kapaklar ızgarada yan yana konur ve **bakılır**: hepsi aynı hesaba mı ait? Ayrım
   layout'tan gelmeli; palet, tip ölçeği ve künye ortak kalmalı.
📁 `docs/referans/`
✅ Izgarada aile okunuyor; hiçbir şablon "başka bir marka" gibi durmuyor
🧪 Bir şablonun aksanını değiştir → ızgarada hemen sırıtıyor
💾 `feat(render): izgara sinavi` · `Refs: FAZ-18.17 · §7.1`

## 18.18 — Gerçek koşu: uçtan uca çıktı ve kalite    [ ]

📖 §13
🔗 FAZ-18.17
🛠 Panelden gerçek karosel üretilir, dışa aktarılır, slayt slayt BAKILIR.
📁 `derived/runs/`
✅ Çıktı ızgarada aile olarak duruyor; kusur sayısı önceki koşudan düşük
🧪 —
💾 çalıştırma commit'i (`Run:` · `Actor:` · `Kind:`)
