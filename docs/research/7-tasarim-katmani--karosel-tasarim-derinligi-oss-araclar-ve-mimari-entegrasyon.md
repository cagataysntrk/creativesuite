# Karosel tasarım derinliği: OSS araçlar, görsel kaynakları ve mimari entegrasyon

**Tarih:** 2026-08-16
**Soru:** İlk üretilen karosel örneği neden "siyah zemin + beyaz yazı"dan ibaret?
Photoshop/Illustrator seviyesinde, estetik derinliği ve hikâyesi olan, birbirinden
kopuk olmayan karoseller üretmek için ne gerekiyor — hangi araç, hangi OSS, hangi
kütüphane, hangi görsel kaynağı — ve bunlar mimariye nasıl oturur?
**Yöntem:** Kod okuması (doğrulanmış, dosya:satır ile) + web araştırması (Cloudflare
Workers AI kataloğu, stok görsel lisansları, OFL font manzarası) + operatörün hedef
olarak verdiği iki karosel şablonunun analizi ve renk ölçümü.

> **Referans analizi sonradan eklendi ve önceliği DEĞİŞTİRDİ** (bölüm 3). İlk taslak
> fotoğrafik yolu (AI görsel + stok) merkeze koyuyordu; referanslar vektörel/geometrik
> yolu gösterdi. Bölüm 6 ve 7 bu yüzden ikincil önceliğe düştü — silinmedi, çünkü
> fotoğrafik yol ileride yine gerekecek.

> Bu dosya `docs/research/README.md`'nin `## Dizin` listesinde görünmez: o README
> `scripts/extract-research.mjs` tarafından ÜRETİLİYOR (satır 213-216) ve elle
> düzenlenmesi R-65 ihlalidir. İndeks, üreteç bir daha koştuğunda oluşur.

---

## 1. Bulgu: çıktı basit değil, tasarım katmanı henüz yok

Dört sebep, hepsi kodda görülebilir. Hiçbiri tasarım tercihi değil.

| # | Sebep | Kanıt |
|---|---|---|
| 1 | **Font `DejaVu Sans`** | `packages/render/src/static.ts:71`, `packages/render/src/deck/pdf.ts:77`. Repoda tek bir `@font-face` yok. `V-02` (hangi latin-ext font lisanslanacak) açık. Amatör görünümün en büyük tek payı bu. |
| 2 | **Üretilen görsel kompozite hiç girmiyor** | `composeBody` (`packages/engine/src/verbs/bodies.ts:243-254`) yalnız `urunCekimleri`'ni okuyor — o da `inputs` içinde `capture` anahtarı arıyor (`bodies.ts:345-365`). `gorsel-uret` adımının çıktısı `inputs`'ta duruyor ve **sessizce düşüyor**. Cloudflare'den gelen fabrika fotoğrafı hiçbir bloğa dönüşmüyor. |
| 3 | **`toHtml` tek sütunlu flex** | `static.ts:66-78` — `display:flex; flex-direction:column; justify-content:center; padding:96px`. Katman yok, ızgara yok, maske yok, gradyan yok. Arka plan `var(--role-bg)` = `oklch(0.16 0.010 250)`, yani siyah. |
| 4 | **`kind: 'post'` sabit** | `bodies.ts:260`. `DocumentKind`'da `'carousel-slide'` TANIMLI (`packages/kernel/src/doc/model.ts:102`) ama **hiçbir yerde üretilmiyor**. Slayt rolü (kapak/gövde/kanıt/kapanış), slayt indeksi, slayt sayısı belge modelinde yok. |

Ek olarak `LAYOUTS` bugün dört ve dördü de tipografi odaklı:
`['statement', 'claim-proof', 'list', 'quote']` (`packages/render/src/layout/enum.ts:29`).
Kompozisyon, ızgara, katman, doku, kenar boşluğu ritmi modelde temsil edilmiyor.

**Sonuç:** Görülen şey "makine üretimi kreatif"in kendisi değil, henüz yazılmamış bir
katmanın yokluğu. Mimari yanlış değil — eksik.

---

## 2. Kritik engel: chroma yasası kreatif paleti bloke ediyor

Bu, plandaki en önemli ve en çok gözden kaçacak madde.

`checkChroma` **her marka yüzeyine** uygulanıyor (`scripts/tokens.mjs:159` temel ağaç,
`scripts/tokens.mjs:186` her yüzey ağacı). Sınırlar:

```
CHROMA_LIMITS = { fill: 0.02, line: 0.04, text: 0.06, signal: 0.16 }
                                    (packages/registry/src/tokens.ts:279-284)
```

`areaClassOf` (`tokens.ts:293-302`) `role.bg`'yi `fill` sayıyor → **C ≤ 0.02**.

Yeni bir `brand/<id>/tokens/kreatif.surface.tokens.json` açmak kod değişikliği
gerektirmiyor — üreteç regex'i `^([a-z]+)\.surface\.tokens\.json$` (`tokens.mjs:55`)
onu otomatik derliyor ve `[data-surface='kreatif']` bloğu üretiyor. **Ama** doygun bir
`role.bg` kapıdan geçemez. Yüzey ağacı ayrıca kendi rampasını tanımlayamaz
(`tokens.mjs:172` — `role` dışında anahtar reddediliyor), yani "rampalar muaf"
kaçamağı da yok: denetlenen şey ÇÖZÜLMÜŞ değer.

§12.1'in ISA-101 gerekçesi ("renk ANORMALLİK demektir; her yerde renk varsa hiçbir
yerde uyarı yoktur") **komuta merkezi için** yazılmış — "izleme kabini" tezi (§4b).
Kreatif çıktı için aynı yasa tam ters yönde çalışıyor: bir Instagram karoseli anormallik
bildirmez, dikkat çeker.

**Gerekli değişiklik sırası** (CLAUDE.md "sessiz düzeltme yok"):
1. `KURALLAR.md` — chroma kuralı yüzey-kapsamlı hâle gelir
2. `docs/ANAYASA.md §12.1` — gerekçe "kabuk yüzeyi" olarak daraltılır
3. `packages/registry/src/tokens.ts` — `checkChroma` yüzey adını alır

Bu madde kapanmadan bölüm 7'deki hiçbir palet çalışmaz.

### Referanstan ölçüm: engel teorik değil

Operatörün hedef olarak verdiği iki karosel şablonundan baskın renk ölçüldü (PNG →
sRGB → OKLCH, `node:zlib` ile, bağımlılıksız):

| Referans | Baskın marka rengi | Kaplama | Chroma | `fill` sınırı | Aşım |
|---|---|---|---|---|---|
| sarı şablon | `oklch(0.804 0.156 87)` | %16,7 (tuvalin tamamı; slaytların içinde baskın zemin) | **0,156** | 0,02 | **7,8×** |

Yani hedef estetiğin taşıyıcı rengi bugünkü kapının **yedi buçuk katı**. Bu bir ayar
meselesi değil: `fill: 0.02` sarı bir zemini griye indirir. Kural değişmeden referans
estetiği üretilemez.

---

## 3. Referans analizi — hedef estetik ne İSTİYOR

İki referans şablon incelendi (`image.png`, `image copy.png`). İkisi de aynı şeyi
söylüyor ve bu, önceliği değiştiriyor.

### En önemli gözlem: ikisinde de FOTOĞRAF YOK

Hiç. Ne stok, ne AI. Estetiğin tamamı **vektörel ve geometrik**: renk blokları, akan
şekiller, dev rakamlar, tipografi. Bunun üç sonucu var:

1. **Hedef estetik AI görsel üretimine hiç ihtiyaç duymuyor.** Tamamen CSS + SVG ile
   üretilebilir — ve **deterministik** olarak, her koşuda birebir aynı. Kalite bir
   kotaya, bir sağlayıcı uptime'ına ya da bir modelin o günkü keyfine bağlı değil.
2. Bölüm 6 (Cloudflare flux-2) ve bölüm 7 (stok görsel) bu hedef için **öncelik
   değildir**. Onlar fotoğrafik yolun araçları; referanslar vektörel yolu gösteriyor.
   İkisi birbirini dışlamıyor ama sıra bellidir: önce vektörel, sonra fotoğrafik.
3. Golden test bu yolda **gerçekten** çalışır: deterministik çıktının piksel/metrik
   referansı anlamlıdır. AI görselli bir slaytta golden yalnız tipografiyi doğrulayabilir.

### Referanslarda olup bizim modelde olmayan altı öge

Hepsi CSS/SVG, hepsi kapalı sözlük olarak modellenebilir, hiçbiri serbest CSS
gerektirmiyor:

| Öge | Referansta | Ne işe yarıyor | Karşılığı |
|---|---|---|---|
| **Slayt sayacı** | `#002` `#003` `#005` — küçük mono etiket, sağ üst | "Kopuk değil" hissinin yarısı. Okuyucu nerede olduğunu bilir. | `slideIndex` / `slideCount` belge modelinde |
| **Navigasyon ögesi** | `>>> Swipe` alt çizgiyle, son slaytta `<< Back` | Kaydırmayı DAVET ediyor — carousel'in tek etkileşim metriği | `slideRole`'e bağlı sabit bileşen |
| **Hayalet rakam** | Dev outline "1 2 3 4", kırpılmış (bleed), dolgu yok | Tek başına derinlik yaratan öge. Metin değil, DOKU. | SVG text + `stroke`, `paint-order` |
| **Akan şekil ayırıcı** | Aynı S-eğrisi her slaytta, yön değişiyor | **Süreklilik motifi** — ızgaraya bakınca tek şey görünmesini sağlayan asıl mekanizma | Tek SVG path, döneme ait, `clip-path` |
| **Renk rolü rotasyonu** | Slayt 1 sarı zemin / 2 beyaz / 3 siyah / 4 sarı | Ritim. Aynı palet, değişen dağılım. | `slideIndex % n` → rol takası |
| **Asimetrik renk bloğu** | Yuvarlatılmış köşe, oran slayttan slayta değişiyor | Kompozisyon nefesi | Izgara slot politikası |

Tipografi tarafında referanslar **iki kademe** kullanıyor: kalın grotesk başlık + küçük
nötr gövde. Bugünkü `h1 72px / h2 48px / p 34px` (`static.ts:73-75`) fena değil ama
kontrastı zayıf ve hepsi aynı ağırlıkta. Referanslardaki fark ağırlık ve renk
kontrastından geliyor, boyuttan değil.

### Bunun plana etkisi

Bölüm 9'un sıra tablosu bu yüzden şöyle daralıyor: **1 (font) → 4 (chroma kuralı) →
5 (kreatif palet) → 3 (katmanlı `toHtml`) → 6 (şablon kümesi + altı öge)**. Madde 2
(üretilen görseli tüketmek), 7 (flux-2 referans/seed) ve 9 (Pexels) fotoğrafik yola
aittir ve referans estetiği için **bloke edici değildir** — ama madde 2 zaten harcanan
bir kotayı çöpe attığı için yine de kapatılmalı.

---

## 4. Ne kurmalı — cevap: neredeyse hiçbir şey

Repo yasası: "Bağımlılık eklemeden önce dur. 40 satır yazmak bir bağımlılıktan iyidir."
R-30 tek motor diyor. Araştırmanın en net sonucu: **sıfır yeni runtime bağımlılığı
gerekiyor.** Chromium zaten var, zaten tek başlatıcıdan geçiyor (`browser.ts`) ve modern
CSS'in tamamını bedava getiriyor.

| İhtiyaç | Çözüm | Yeni bağımlılık |
|---|---|---|
| Gradyan mesh, ışık, derinlik | katmanlı `radial-gradient` + `conic-gradient` | yok |
| Film grenı / doku | inline SVG `<feTurbulence>` → `data:` URI arka plan | yok |
| **Duotone — markanın en güçlü izi** | `filter: grayscale(1)` + `mix-blend-mode: color` marka rengiyle | yok |
| Okunabilirlik perdesi (scrim) | `linear-gradient(to top, oklch(…), transparent 60%)` | yok |
| Maske / kırpma | `mask-image`, `clip-path` | yok |
| Izgara | CSS Grid, 4px taban (§12.3 zaten tanımlı) | yok |
| Optik tipografi | `text-wrap: balance`, negatif `letter-spacing`, `font-variation-settings` | yok |
| Görsel yerleşimi | `object-fit: cover` + `object-position` | yok |

### Kasten reddedilecekler

| Aday | Neden hayır |
|---|---|
| `sharp` / `jimp` / `canvas` | §11.1 zaten reddetmiş: ikinci bir PNG çözücü = ikinci renk profili yorumu = farklı ΔE. Piksel okuma zaten Chromium `<canvas>` üzerinden. |
| Satori | D-24: ligature/kerning/WOFF2 yok, ikinci CSS alt kümesi = ikinci Türkçe hata modu. |
| Herhangi bir tasarım/şablon kütüphanesi (Canva/Gamma benzeri) | D-21: müşteriler o çıktıyı tanıyor ve "size özel yazılım yaparız" iddiasını çürütüyor. |
| `culori` (OKLCH matematiği) | `packages/render/src/qa/deltae.ts` zaten OKLCH ayrıştırıyor ve ΔE2000 hesaplıyor. İkinci bir renk motoru = iki farklı sayı. |
| `fontkit` / `opentype.js` (glif kapsamı doğrulaması) | Golden metrik koşumu (`packages/render/src/golden/metrics.ts`) bunu zaten Chromium'da yapıyor: `notdef` sayısı, glif kutuları, `fontFamily`. |

Tek gerçek "kurulum" fonttur — ve o da bir paket değil, `brand/<id>/fonts/` altına
vendor edilen bir varlıktır (§16: bir ay ihmal edilse de çalışır; kurtarma `git clone`).

---

## 5. Font — en yüksek kaldıraç (V-02)

Türkçe'deki tehlike `İ ı ğ ş Ğ Ş`. Repo bunu doğrulayacak koşumu **zaten yazmış**:
§7.2'nin kanıt dizesi `İstanbul'da yazılım çözümleri: ığüşöç ĞÜŞÖÇ`, golden metrik
`notdef = 0` şartı. Yani font seçildiği gün doğrulaması hazır — seçim bir insan kararı,
doğrulama makine işi.

Üç rol, hepsi SIL OFL (ticari kullanım serbest, vendor edilebilir, latin-ext tam):

| Rol | Aday | Not |
|---|---|---|
| Display / kapak | **Archivo Expanded** veya **Bricolage Grotesque** | Değişken; genişlik ekseni editoryal karakter veriyor. Kapak slaytı buradan gücünü alır. |
| Display alternatif (serif) | **Fraunces** | Opsiyel eksen (`SOFT`, `WONK`) gerçek bir görsel kişilik taşıyor; "yazıdan öte" hissini tek başına kurabilir. |
| Metin | **Inter** veya **Manrope** | Değişken, latin-ext tam, nötr. Gövde slaytları. |
| Sayı | mevcut mono kuralı | §12.2 `tabular-nums slashed-zero` korunur. |

**Teknik entegrasyon:** `DocumentModel`'e `tokenCss` kardeşi bir `fontCss` alanı; woff2
**base64 gömülü**. Gerekçe `static.ts:60-64`'ün kendi yorumunda zaten yazılı: harici
dosya render anında yüklenemezse çıktı sessizce varsayılan fontla üretilir ve bunu
kimseye söylemez. Font için bu daha da sert — `document.fonts.ready` beklemesi
(`static.ts:174`) yalnız gömülü font varsa bir şey ifade eder.

---

## 6. Cloudflare tarafı — mevcut model tablosu eskimiş

> **İkincil öncelik.** Referans estetiği fotoğraf kullanmıyor (bölüm 3). Bu bölüm
> fotoğrafik yol içindir ve o yol ileride yine gerekecek — ama referans şablonlarını
> üretmek için hiçbiri gerekmiyor.

`packages/providers/src/image/cloudflare.ts:52-57` bugün:

```
'1:1'  → @cf/black-forest-labs/flux-1-schnell      (JSON, sabit 1024×1024)
'4:5'  → @cf/bytedance/stable-diffusion-xl-lightning (ham JPEG, width/height kabul)
'9:16' → aynı
'16:9' → aynı
```

Workers AI kataloğu bu arada büyümüş:

- **FLUX.2 [klein] 4B / 9B** (2026-01) ve **flux-2-dev** (2025-11) Workers AI'da.
  flux-2-dev fiyatlaması karo×adım tabanlı ($0.00021 girdi / $0.00041 çıktı, 512×512
  karo başına adım başına) — yani **bedava değil**, şerit kararı. `klein` serisi bedava
  şeridin doğal yükseltmesi.
- **Referans görsel desteği**: `input_image_0` … `input_image_7`, her biri <512×512,
  HTTPS URL ya da `data:image/…;base64,…`. Artı **seed** (tekrar üretilebilirlik).
  → **Marka tutarlılığının asıl kaldıracı bu.** §7.3'ün LoRA'sına (~$3, fal) para
  vermeden, dönem başına sabit bir referans seti + sabit seed ile her slayt ve her
  karosel aynı görsel dili konuşur.
- **img2img / inpainting**: `@cf/runwayml/stable-diffusion-v1-5-img2img`,
  `@cf/runwayml/stable-diffusion-v1-5-inpainting`. Bir görseli 4:5'ten 9:16'ya
  *uzatmak* için — yeniden üretmek yerine.
- **Vision**: `@cf/meta/llama-3.2-11b-vision-instruct`, `moondream3.1-9B-A2B`.

Hepsi **adaptör içi** değişiklik. R-40 korunur: hat hâlâ yetenek ister, model adı yazmaz.

### İki uyarı

1. `ASPECT_PIXELS['4:5']` = 1024×1280 ama karosel 1080×1350 render ediliyor. Kompozitte
   `object-fit: cover` bunu kapatır — ama bilinçli olmalı, sessiz bir ölçek uyuşmazlığı
   değil.
2. **Vision modeli QA raporuna danışman okuma olarak girer, kapı olarak DEĞİL.** Reponun
   tüm kalite mimarisi deterministik (`measure.ts` yorumu: "aynı piksel dizisi her zaman
   aynı sayıyı vermeli"). "Bu kompozisyon dengesiz mi" sorusunun cevabı her koşuda
   değişirse `just verify` anlamını kaybeder.

`fal` (premium şerit) hâlâ `enabled: false` ve V-16 bloklu (fiyat anlık görüntüsü
doğrulanmamış, `FAL_KEY` kasada yok). Bu plandaki her şey bedava şeritte çalışır.

---

## 7. Stok görsel — Pexels, Unsplash değil

> **İkincil öncelik**, bölüm 6 ile aynı gerekçeyle.

| Kaynak | Ticari | Atıf | Karara etkisi |
|---|---|---|---|
| **Pexels API** | serbest | **gerekmiyor** | 200 istek/saat. Sisteme uyan tek seçenek. |
| Unsplash API | serbest | **API üzerinden ZORUNLU** — fotoğrafçı + Unsplash, tıklanabilir bağlantıyla | Instagram karoselinde tıklanabilir bağlantı yok. **Uyumsuz.** |
| Openverse / Wikimedia (CC-BY) | serbest | zorunlu | Aynı sorun. |

İkisi de **tazminat (indemnification) ve model release vermiyor.** B2B imalat markası
için bu gerçek bir risk. Ayrıca R-9 zaten onay ima eden yapay insanı yasaklıyor
(Reklam Yönetmeliği Md. 27/12) — insan içeren stok görsel bu kapıya da girer.

**Pratik sonuç: stok birincil kaynak değil, doku/fallback kaynağıdır.** Birincil hat
AI-üretimi soyut/endüstriyel doku + gerçek ürün çekimi (§7.7 zaten var, `timeline.json`
ile). Müşterinin kendi tesis fotoğrafı (izinli) her ikisini de yener.

**Entegrasyon noktası yeni bir fiil değil**: `packages/providers/src/ingest/` zaten
`provenance.ts` + `waterfall.ts` taşıyor. Pexels bir `INGEST` adaptörü olur; lisans,
kaynak URL ve fotoğrafçı manifeste yazılır ve `inspectManifest` onu denetleyebilir.

---

## 8. Marka izi — beş kilit

"Instagram'a genel bakınca güzel dursun" sorusunun mühendislik cevabı. Beşi de
deterministik; hiçbiri "dikkat et" değil.

1. **Palet kilidi** — her fotoğraf duotone + perde katmanından geçer, dolayısıyla hiçbir
   görsel yabancı renk getiremez. Mevcut ΔE + palet-dışı QA kapısı (`measure.ts`) bunu
   zaten *ölçüyor*; bugün eksik olan, kompozitörün bunu *garanti etmesi*. Ölçen kapı var,
   sağlayan katman yok.
2. **Izgara kilidi** — tek 12 sütunlu ızgara, 4px taban ölçek (§12.3), güvenli alanlar
   (`placements.ts`, `safe-area.test.ts`).
3. **Tip kilidi** — kapalı ölçek; display yüzü tam iki boyutta kullanılır.
4. **Motif kilidi** — dönem başına tek tekrar eden öge (kural çizgisi, köşe işareti,
   slayt sayacı). Yeri belli: `brand/<id>/eras/<slug>/`. R-11 (üretim anında dönem
   damgası) bunu geriye dönük tutarlı yapıyor; dönem değişince motif değişir, eski
   varlıklar eski motifle kalır ve bu DOĞRU davranıştır.
5. **Seed / referans kilidi** — dönem başına sabit referans görsel seti + sabit seed
   (§5).

Üstüne **slayt rolleri**: `cover` (görsel kanca) → `body` (ritim) → `proof` (iniş) →
`cta` (kapanış). Hikâye budur. Farklı düzenler, aynı ızgara.

---

## 9. Mimariye entegrasyon — dosya dosya

**Kritik nokta: yeni motor gerekmiyor.** R-30 (tek motor), R-23 (böl, küçültme), kapalı
düzen kümesi, "kernel `attributes` okumaz", `COMPOSE` saf — hiçbiri değişmiyor. Belge
modeli düz blok listesinden **katmanlı slayt modeline** büyüyor; düzen kümesi 4'ten ~8'e
çıkıyor ama **kapalı kalıyor**.

| Sıra | Dosya | Değişiklik | Neden bu sırada |
|---|---|---|---|
| 1 | `brand/<id>/fonts/` + `kernel/src/doc/model.ts` | `fontCss` alanı, woff2 base64 gömülü | En yüksek görsel kazanç / satır oranı. Diğer her şeyi güzelleştirir. |
| 2 | `engine/src/verbs/bodies.ts` `composeBody` | `image.generate` çıktısını **tüket** (bugün düşüyor); `kind: 'carousel-slide'`; slayt rolü ata | Zaten üretilen ve para/kota harcanan bir varlık çöpe gidiyor. |
| 3 | `render/src/static.ts` `toHtml` | Asıl tasarım burada: arka plan katmanı → işlem katmanı (duotone/perde/gren) → ızgara → içerik | Tek sütun flex'in yerini alır. |
| 4 | `KURALLAR.md` + `ANAYASA.md §12.1` → `registry/src/tokens.ts` | Chroma yasası yüzey-kapsamlı olur | **Kural önce, kod sonra.** Bu olmadan 5 kırmızı. |
| 5 | `brand/<id>/tokens/kreatif.surface.tokens.json` | Kreatif palet | Üreteç regex'i zaten tanıyor — kod değişikliği yok. |
| 6 | `render/src/layout/enum.ts` | Düzenler `{ad, ızgara, slotlar, arka plan politikası, tip rampası}` olur; ~8 şablon | Kapalı küme korunur; beşincisi hâlâ bir kod değişikliğidir. |
| 7 | `providers/src/image/cloudflare.ts` | flux-2 klein + referans görsel + seed; yeni yetenek `image.edit` | Marka izi bölüm 8, madde 5'e bağlanır. |
| 8 | `render/src/qa/measure.ts` | Kompozisyon okumaları | Aşağıda. |
| 9 | `providers/src/ingest/` | Pexels adaptörü, lisans provenance'ıyla | En düşük öncelik: fallback kaynağı. |

**Referans estetiği için gerçek sıra** (bölüm 3): **1 → 4 → 5 → 3 → 6**. Madde 2, 7 ve 9
fotoğrafik yola aittir ve referans şablonlarını üretmek için bloke edici değildir.
Madde 2 yine de kapatılmalı — bugün harcanan bir kotanın çıktısı çöpe gidiyor.

### 9.1 Belge modeli genişlemesi — dikkat noktası

`model.ts`'in dosya başı uyarısı aynen geçerli: *"Belge modeli kasten FAKİR… Zengin
olsaydı `RENDER` bir şablon motoruna dönerdi."* Yeni alanlar bu yüzden **kapalı sözlük**
olmak zorunda — serbest CSS değil:

```
BackgroundLayer = { kind: 'image' | 'gradient' | 'solid' | 'color-block',
                    treatment: 'duotone' | 'scrim' | 'blur' | 'grain' | 'none' }
slideRole       = 'cover' | 'body' | 'proof' | 'cta'
slideIndex / slideCount : number
ornament        = 'ghost-numeral' | 'flow-divider' | 'counter' | 'swipe-hint' | 'none'
```

`ornament` bölüm 3'teki altı ögenin taşıyıcısıdır. **Sayı değil, ROL taşır**: hangi
rakamın basılacağı `slideIndex`ten, hangi eğrinin çizileceği DÖNEMDEN gelir. Ögeyi
"şu SVG'yi çiz" diye modellemek, belge modeline işaretleme sokmak olurdu.

Bir `style?: string` alanı eklendiği gün "tek render motoru" yasası şablon diline kaçar.
Altı ögenin tamamı bu yüzden enum; hiçbiri serbest CSS ya da serbest path değil.

### 9.2 QA: hangi kompozisyon metrikleri deterministik?

`measure.ts`'e eklenebilecekler — **yalnız hesaplanabilir olanlar**:

- **Metnin gerçek arkaplanına karşı kontrastı.** Bugün ölçülmüyor ve yeni katmanla
  birlikte en olası sessiz hata bu: zayıf bir perde, okunmayan bir başlık üretir ve
  hiçbir kapı görmez.
- **Güvenli alan çakışması** — `placements.ts` verisi zaten var.
- **En büyük boş dikdörtgen** (kompozisyon nefesi) ve metin bloğu alan dengesi.
- **Slaytlar arası ΔE sapması** — aynı karoselin slaytları arasındaki palet kayması.
  "Izgara tek şey görünüyor mu" sorusunun gerçek sayısal karşılığı budur ve bugün
  hiçbir yerde ölçülmüyor.

`textCoverage` (`measure.ts`) kaba bir karakter-alanı kestirimi ve öyle olduğu yorumda
yazılı. Gerçek glif metrikleri font geldiğinde (V-02) golden koşumundan gelir — yani
1. madde bu metriği de düzeltir.

---

## 10. Açık kalemler — insan kararı, kod değil

| Kalem | Ne gerekiyor |
|---|---|
| **V-02** | Hangi font vendor edilecek? Zaten kayıtlı insan borcu. |
| **Kreatif palet** | Marka görsel dili ne? `brand/brd_upcytech/derived-tokens/brand-facts.json` bugün bilinçli olarak renk DEĞERİ taşımıyor ("model renk seçmez"). Kreatif yüzey için bir palet KARARI gerekiyor. Referans şablon iki renk + siyah kullanıyor (`oklch(0.804 0.156 87)` + beyaz + `oklch(0.200 0 90)`) — üç değerlik bir karar, ama karar. |
| **§12.1 kapsamı** | Chroma yasası kabuğa mı ait, her yüzeye mi? Bu bir anayasa değişikliği ve **ölçülmüş bir engel**: referans sarısı sınırın 7,8 katı. |
| **Motif** | `imalat-2026` döneminin tekrar eden görsel ögesi ne? Referanslarda bu bir S-eğrisi ayırıcı; bizde ne olacağı marka kararı. Dönem dosyasında yaşar, dönem değişince değişir. |
| **V-16** | fal premium şerit hâlâ bloklu; bu plan onsuz çalışır ama LoRA yolu kapalı kalır. |

---

## Kaynaklar

- [Workers AI Models kataloğu](https://developers.cloudflare.com/workers-ai/models/)
- [FLUX.2 [dev] on Workers AI (blog)](https://blog.cloudflare.com/flux-2-workers-ai/)
- [FLUX.2 [dev] changelog](https://developers.cloudflare.com/changelog/post/2025-11-25-flux-2-dev-workers-ai/)
- [FLUX.2 [klein] 4B changelog](https://developers.cloudflare.com/changelog/post/2026-01-15-flux-2-klein-4b-workers-ai/)
- [FLUX.2 [klein] 9B changelog](https://developers.cloudflare.com/changelog/post/2026-01-28-flux-2-klein-9b-workers-ai/)
- [stable-diffusion-v1-5-img2img](https://developers.cloudflare.com/workers-ai/models/stable-diffusion-v1-5-img2img/)
- [stable-diffusion-v1-5-inpainting](https://developers.cloudflare.com/workers-ai/models/stable-diffusion-v1-5-inpainting/)
- [Unsplash lisansı: API'de atıf zorunlu mu](https://www.licenseorg.com/blog/unsplash-license-attribution-required)
- [Ücretsiz stok fotoğraf lisans tuzakları (Unsplash/Pexels/Pixabay)](https://www.licenseorg.com/blog/free-stock-photos-licensing-traps)
- [Ücretsiz görsel API'leri karşılaştırması 2026](https://siliconbased.dev/free-image-apis)
- [OFL fontları](https://openfontlicense.org/ofl-fonts/)
- [2026'da değişken fontlar](https://fontcompressor.com/blog/best-variable-fonts)
- [SIL font ailesi ve dil desteği](https://software.sil.org/fonts/)

**Ölçüm:** bölüm 2 ve 3'teki OKLCH değerleri, operatörün verdiği iki PNG'den `node:zlib`
ile (bağımlılıksız PNG çözme → sRGB → OKLCH) ölçüldü. Tahmin değil.
