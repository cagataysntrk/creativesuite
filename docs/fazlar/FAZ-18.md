# FAZ 18 — Dizayn sistemi karosele iniyor

**Amaç:** Markanın gerçek dizayn sistemi (`examples/design-system-master/`, gitignore'lu)
karoselin tipografisini, paletini ve kompozisyonunu yönetir. Altı+ şablon birbirinden
farklı ama tek bir Instagram ızgarasında yan yana geldiğinde **bir aile** olarak okunur.

**Yöneten kararlar:** D-317 · D-318 · D-319 · D-320 · D-321 · Yasa 4 · Yasa 5 · R-81

> **Araştırma ÖNCE yapıldı, sonra kodlandı.** 18.0 üç bağımsız araştırmanın raporu ve
> sonraki her adım o raporlardan bir maddedir. Sayılar **kaynağıyla** duruyor; ölçüm
> gerekçeleri `docs/kurallar/OLCUMLER.md`'de.
>
> ⚠ **Kapanmış adımlar `📁` ve `✅`'ye indirildi.** Bir faz dosyasının işi *"bu adımda ne
> yapılacak"*; kapanmış adım o değil, arşivdir. Gerekçe `KARARLAR.md`'de, ölçüm
> `OLCUMLER.md`'de, commit `git log`'da — üç kopya yerine bir kayıt. `📁` KALIYOR:
> `faz-yollari` kapısı tikli adımların yollarını hâlâ doğruluyor.

---

## 18.0 — Araştırma tabanı: spec · tasarım disiplini · marka farkı    [x]

📁 `docs/referans/arastirma-2026-08.md`
✅ Her sayı kaynağıyla · çelişen kaynaklar İKİSİ DE yazılı · doğrulanamayan "doğrulanmadı"

## 18.1 — Tip ölçeği: dört aile, dört rol    [x]

✅ Dördü de 15/15 Türkçe kod noktası · `Ş`≠`Ș` · `latn/TRK` · beşinci aile kırmızı

## 18.2 — Palet: yakın-monokrom zemin, tek karneli aksan    [x]

✅ Nötrler chroma 0 · aksan hiçbir şablonda zemin ya da büyük yüzey değil

## 18.3 — Süreklilik: ölçek çizgisi, kesim üstü görsel    [x]

✅ `sahne` 12 → 2 kusur · çakışma 8 → 0 · kusur kasten üretildi, kırmızı döndü

## 18.4 — Tanımsız token çağrısı kapısı    [x]

✅ 52 token · 325 dosya · tanımsız çağrı 0 · `--ramp-marka-yok-1` kırmızı döndü

## 18.5 — Okunabilirlik tabanı: gövde 36 px ALTINA İNEMEZ    [x]

📁 `packages/render/src/panorama.ts` · `punto-esigi.test.ts`
✅ Gövde 34 → **36 px** · taban tuval genişliğine ORANTILI · `govdeOrani` ezemiyor · kural **R-83**

## 18.6 — Ölçü bandı: satır 45–75 karakter    [x]

✅ `donen` 19 → 49 · `editoryal` 27 → 55 · `akan-alan` 45 → 57 · kural **R-86**

## 18.7 — Dikiş disiplini: HER kesimde taşıyıcı    [x]

✅ Ölçüm kesim BAŞINA · `donen` haksız kusuru düştü (ölçek bandı artık tanınıyor) · `memphis` 2 + `editoryal` 2 GİZLİ boş kesim bulundu ve kapatıldı · kural **R-87**

## 18.8 — Güvenli alan ve metin payı ölçülüyor    [x]

✅ Üst dolgu 68 → **80** · altı şablonda `guvenli-alan-disi` 0 · metin ≤%30 (kapak %42) · gövde başlığı 0,82 çarpanıyla indi · kural **R-88**

## 18.9 — Kelime bütçesi: başlık ≤8, slayt ≤28    [x]

✅ Sınır hem İSTEME yazılı hem uyarlamada zorlanıyor · ret RENDER'dan ÖNCE · kural **R-89**

## 18.10 — Yayın sözleşmesi: 10 slayt · JPEG    [x]

📁 `packages/providers/src/publish.ts` · `packages/render/src/panorama.ts`
✅ 11 slayt → `too_many_assets` · PNG → `unsupported_format` · hat artık `.jpg` yazıyor ve `renderPanorama` biçimi UZANTIDAN okuyor · kural **R-90**

## 18.11 — Tuval oranı TEK kaynaktan; 3:4 bir parametre    [x]

✅ `VARSAYILAN_TUVAL` tek kaynak · altı şablon + `bodies.ts` + `strateji.ts` ondan okuyor · varsayılan 4:5 · kural **R-91**

## 18.12 — Marka imzası üretim yoluna bağlandı    [x]

✅ `uret.mjs` logoyu yüklüyor ve `COMPOSE`a geçiyor · karosel imza taşıyor (çizildi ve BAKILDI: alt rayda) · kural **R-92**

## 18.13 — Ölçeklenmeyen px'ler: ölçek TEK tabandan    [x]

📁 `packages/render/src/panorama.ts` · `olcek-tabani.test.ts`
✅ 1080 → 1350'de yedi ölçünün yedisi de %25 büyüdü

## 18.13b — Taban çizgisi ızgarası: ritim METİNDEN    [x]

📁 `packages/render/src/panorama.ts` · `taban-ritmi.test.ts`
✅ `başlık→gövde` her şablonda tam 1× kendi tabanı · `gövde→panel` `memphis`te tam 2×

## 18.13c — Alt marka gerçekten koşuyor: varlıklar devralınıyor    [x]

📁 `packages/render/src/marka-varlik.ts` · `logo.ts` · `scripts/uret.mjs`
✅ Gerçek koşu: *"font DEVRALINDI"* + *"marka işareti DEVRALINDI"*, hat font kapısını geçip içerik adımına kadar ilerledi (orada `NO_CONTEXT` — ilgisiz ve dürüst bir dur)

## 18.13d — Token YÜZEYE göre çözülüyor; iki ölü rol dirildi    [x]

📁 `scripts/gates/token-cagrisi.mjs` · `apps/ui/src/kabuk.css`
✅ Kapı birleşime bakıyordu ve iki CANLI kusuru gizliyordu: `state-danger` ve `accent`
   yalnız `kreatif`te tanımlıyken kabuk `console`da koşuyor — panelde uyarı gövdeyle aynı
   renkte, aktif sekmenin çerçevesi renksizdi. Kapı yüzey başına çözülünce dokuz ihlal
   daha çıktı. Panel açılıp BAKILDI: uyarı kırmızı, çerçeve mavi. Kural **R-102** · D-333
⏭ **Ölçek emit'i YAPILMADI ve sebebi ölçüldü:** kabukta hiç `border-radius` piksel
   değeri yok, `112px` hiç geçmiyor, altı `96px`in altısı da `min-inline-size` — sütun
   genişliği, boşluk adımı değil. 66 literalin 46'sı `1px` saç çizgisi. Ölçek zaten
   SİSTEME ait (§7.4), altı adımı var ve 111 kez çağrılıyor. Madde yanlış öncülden
   yazılmıştı; kullanılmayan adım eklemek ikinci bir ölçek demekti.

## 18.14 — Ses: yasak terim listesi sistemin sözlüğüne genişledi    [x]

📁 `packages/engine/src/saglik/strateji.ts` · `corpus/` · `scripts/kesif-roportaj.mjs`
✅ Altı → yirmi üç terim; kapı ÜÇ canlı ihlal buldu ve üçü de kapatıldı. Sınır
   ÖBEK/SIFAT ayrımında: `çözüm` meşru, `çözüm odaklı` değil — çıplak sıfat listesi doğru
   cümleleri de kırmızıya çevirirdi. `olcum-mesaj-evi.md` yasak listesini KOPYALADIĞI için
   kendi yasağını ihlal ediyordu. Hayalet yolun (`registry/lexicon/tr`) kökü bir
   ŞABLONDU — üretilen her yeni kayıt onu taşıyacaktı. Kural **R-103** · D-334

## 18.15 — Kaynak satırı: eksikliği artık SESSİZ değil    [x]

📁 `packages/render/src/panorama.ts` · `panorama-denetim.ts`
✅ Madde *"kaynak satırı bizde HİÇ yok"* diyordu; ÖLÇÜM aksini gösterdi — yuva var,
   çiziliyor, `sablon-uyarla` doğruluyor. Gerçek açık başkaydı: boş `rayaOrta` boş bir
   `<span>` basıyordu, slayt kusursuz GÖRÜNÜYOR ve kaynağını kaybetmiş oluyordu. Artık
   kesikli `KAYNAK YOK` kutusu basıyor ve denetim onu raporluyor. Çizildi ve BAKILDI.
   Kural **R-104** · D-335

## 18.16 — Şablon ailesi büyüdü: altı → on    [x]

📁 `packages/render/src/katalog-ornek.ts` · `panorama.ts` · `panorama-denetim.ts`
✅ `kavis` (kemer · geometri) · `alinti` (yalnız tipografi · kâğıt) · `karsilastirma`
   (alan süpürmesi · önce/sonra) · `dizin` (akış okları · adımlar). Dördü de GÖRSELSİZ —
   aile görsel-öncülüydü. Kapılar anında konuştu; asıl üç bulguyu GÖZ buldu ve üçü de
   ESKİ şablonları da etkiliyordu: `kemer` koordinat uzayı kırık, oklar yön vermiyor,
   çubuk grafiği veri taşımıyor (yuva 10 px). Kural **R-105** · D-337

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
