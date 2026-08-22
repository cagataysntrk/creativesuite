# FAZ 18 — Dizayn sistemi karosele iniyor

**Amaç:** Markanın gerçek dizayn sistemi (`examples/design-system-master/`, gitignore'lu)
karoselin tipografisini, paletini ve kompozisyonunu yönetir. Altı şablon birbirinden
farklı ama **tek bir Instagram ızgarasında yan yana geldiğinde bir aile** olarak okunur.

**Yöneten kararlar:** D-317 (dört aile) · D-318 (palet) · Yasa 4 (tek render motoru) ·
Yasa 5 (bedava ve premium tipografide aynı) · R-81 (kodlanmış öge yasak)

> **Sistem "neden"i söylüyor, biz "nerede"yi.** `DESIGN.md` bir web/ürün yüzeyi için
> yazıldı; karosel bir PAZARLAMA yüzeyi ve 1080×1350'lik bir tuval. Kural aynı, ölçek
> farklı: sistemin display ölçeği 76 px'lik bir sayfa içindir, bizim kapağımız 1080 px.
> Ölçek uyarlanır, KURAL uyarlanmaz.

---

## 18.1 — Tip ölçeği: dört aile, dört rol    [x]

📖 §7.2 · D-317
🔗 FAZ-17.3
🛠 Plus Jakarta Sans (gövde) · Source Serif 4 (kapak H1'i) · Montserrat (bölüm başlığı) ·
   JetBrains Mono (rakam, künye, eyebrow). El yazısı vurgu satırı ve `wdth` ekseni emekli.
📁 `packages/render/src/fonts.ts` · `scripts/font-getir.mjs` · `brand/*/fonts/`
✅ Dört ailenin dördü de 15/15 Türkçe kod noktası · `Ş`≠`Ș` · `latn/TRK`
🧪 Beşinci aile ekle → `tasarim` kapısı kırmızı
💾 `feat(render): tip olcegi dizayn sisteminden` · `Refs: FAZ-18.1 · §7.2`

## 18.2 — Palet: yakın-monokrom zemin, tek karneli aksan    [x]

📖 §12.1 · D-318
🔗 FAZ-18.1
🛠 Nötrler chroma 0; kanvas `#040404`, kâğıt `#fafafa`. Aksanın iki adımı
   (`#3477f9` koyuda, `#0b5bf0` kâğıtta). Vurgu çipi, alfa harmanlı soluk metin ve
   mavi zeminler emekli.
📁 `brand/brd_upcytech/tokens/` · `packages/render/src/panorama.ts`
✅ Aksan hiçbir şablonda zemin ya da büyük yüzey değil · kâğıt slaytlar da marka mavisini taşıyor
🧪 Zemin token'ını aksana çevir → kontrast ölçümü ve `tasarim` kapısı görür
💾 `feat(render): palet dizayn sisteminden` · `Refs: FAZ-18.2 · §12.1`

## 18.3 — Kompozisyon: kapak KAHRAMAN, gövde ENSTRÜMAN    [ ]

📖 §7.1 · D-268
🔗 FAZ-18.2
🛠 Her şablon tek tek çizilip BAKILACAK. Kapakta başlık kadrajı taşıyacak (bugün %5–19);
   gövde slaytları sistemin "enstrüman paneli" dilini kuracak: yüzey adımı + hairline,
   gölge yok, degrade yok, ışık odağı yok. Boş kalan alanlar İÇERİKLE dolacak —
   süslemeyle değil.
📁 `packages/render/src/katalog-ornek.ts` · `packages/render/src/panorama.ts`
✅ Altı kapağın altısında başlık bloğu kadrajın ≥%18'i · degrade/gölge/ışık ögesi sıfır
🧪 Bir şablona degrade zemin koy → `tasarim` kapısı ya da denetim görüyor
💾 `feat(render): kompozisyon dizayn sistemine oturdu` · `Refs: FAZ-18.3 · §7.1`

## 18.4 — Izgara sınavı: altı şablon TEK sayfa    [ ]

📖 §7.1
🔗 FAZ-18.3
🛠 Altı şablonun kapakları 3×2 ızgarada yan yana konur ve **bakılır**: hepsi aynı
   hesaba ait mi, yoksa altı ayrı hesap mı? Ayrım layout'tan gelmeli; palet, tip ölçeği
   ve künye ortak kalmalı.
📁 `docs/referans/` (kontak baskı) · `packages/render/src/katalog-ornek.ts`
✅ Izgarada aile okunuyor; hiçbir şablon "başka bir marka" gibi durmuyor
🧪 Bir şablonun aksanını değiştir → ızgarada hemen sırıtıyor
💾 `feat(render): izgara sinavi` · `Refs: FAZ-18.4 · §7.1`

## 18.5 — Corpus ve marka metni sistemin sesine geçiyor    [ ]

📖 §11.4 · R-13
🔗 FAZ-18.2
🛠 Dizayn sisteminin `brand/public/` mesaj evleri ve ses kuralları corpus'a iniyor:
   kanıtsız üstünlük iddiası (`lider`, `en iyi`), boş kategori sözcüğü (`yenilikçi`,
   `AI-powered`) ve kaynaksız sayı YASAK; kontroller çıplak emir kipi, cümleler *siz*.
📁 `corpus/messaging/` · `corpus/positioning/` · `packages/engine/src/plan/`
✅ Üretilen metinde yasak sözcük sıfır · her sayının kaynağı var
🧪 İsteme `lider` yazdır → kapı reddediyor
💾 `feat(corpus): ses dizayn sisteminden` · `Refs: FAZ-18.5 · §11.4`

## 18.6 — Gerçek koşu: uçtan uca çıktı ve kalite    [ ]

📖 §13
🔗 FAZ-18.3 · FAZ-18.5
🛠 Panelden gerçek bir karosel üretilir, dışa aktarılır ve slayt slayt BAKILIR.
📁 `derived/runs/`
✅ Çıktı ızgarada aile olarak duruyor; kusur sayısı bir önceki koşudan düşük
🧪 —
💾 çalıştırma commit'i (`Run:` · `Actor:` · `Kind:`)
