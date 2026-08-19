# Katalog merkezli hat — konu girer, karosel çıkar

**Yöneten kararlar:** D-268 (serbest üretim yok) · D-269 (ne kurulacak) · Yasa 13
**Hat:** `registry/pipelines/instagram-karosel.pipeline.yaml`
**Koşu:** `sops exec-env secrets/secrets.enc.yaml 'just uret instagram-karosel "<konu>"'`

> ⚠ Bu belge **gerçek bir koşunun defterine** dayanıyor, tasarıma değil. Anlatılan hat ile
> koşan hat aynı; ayrıştıklarında `katalog-dikis.test.ts` kırmızıya döner.

---

## 1. Zincir

```
konu
 └─ metin-uret     GENERATE  text.generate   → { lines: [...] }
     └─ sablon-uyarla  GENERATE  text.generate   → { uyarlama }
         │  ├── ① katalogdan ŞABLON SEÇİLİR (deterministik, model çağırmaz)
         │  └── ② agent şablonun DOLU taslağını konuya uyarlar
         └─ kompozit   COMPOSE  → { panorama }
             │  şablonun kompozisyonu + agentın içeriği, deterministik birleşme
             ├─ gorsel-brief  GENERATE  → şablonun ilan ettiği görselin brief'i
             ├─ gorsel-uret   GENERATE  image.generate
             └─ render     RENDER  → N × PNG + ölçülmüş kusur listesi
                 │  tek geniş tuval (N × 1080 × 1350), sonra dilimleme
                 ├─ gorsel-yargi / tasarim-yargi   agent BAKAR
                 ├─ kalite     VALIDATE
                 └─ onay       PROPOSE (insan kapısı) → yayinla
```

## 2. Şablon nasıl seçiliyor

Seçim **içeriğin ölçülen şeklinden** çıkıyor; anahtar kelime listesi yok (Türkçe eklemeli,
sözlük her çekimde delinir ve delindiğinde sessizce yanlış şablon seçilir).

| Sinyal | Ölçüm | Seçilen |
|---|---|---|
| Zaman serisi | ≥3 farklı yıl | `veri-hikayesi` |
| Sayısal yoğunluk | satırların ≥%50'sinde rakam | `veri-hikayesi` |
| Numaralı ritim | ≥3 `1.`/`2)` satırı | `akan-alan` |
| Soru ritmi | satırların ≥%40'ı `?` ile bitiyor | `memphis` |
| Anlatı | yukarıdakilerin hiçbiri | `sahne` |

**İçerikten seçilemeyenler:** `donen` (daire maskeli ürün fotoğrafı) ve `editoryal`
(tam kaplama fotoğraf). Metinde "ürün" geçmesi bir ürün fotoğrafının çekilebileceği
anlamına gelmiyor; bunlar `sablon` kısıtıyla **açıkça istenir**.

**İki sert kural:**
- Satır sayısı şablonun **alt** sınırının altındaysa şablon elenir. Üst sınırı aşmak
  eleme sebebi değil: uyarlama fazlayı birleştirebilir, eksiği uyduramaz.
- Görsel üretilemiyorsa (anahtar yok) katalog **iki kayda** iner — görselsiz şablonlar.
  Kimliği yer tutucudan ibaret bir karosel teslim etmektense seçimi daraltmak doğru.

Seçim **gerekçe yazar**; seçilemezse hat **DURUR**. Sessizce varsayılana düşmek,
istenmeyen bir tasarımı istenmiş gibi teslim etmek olurdu.

## 3. Uyarlama neyi değiştirebilir

| Değiştirilebilir | Değiştirilemez (şemada alanı YOK) |
|---|---|
| `ustBaslik`, `baslik`, `govde` | bant geometrisi, alan sınırı noktaları |
| `hayalet` (kısa: rakam/sembol) | görsel konumları ve kırpma biçimi |
| `rayaSol`, `rayaOrta` (**kaynak**) | tipografi reçetesi, yerleşim, zemin dokusu |
| panel **verisi** | panel **tipi**, kart zemini, kart sayısı |

`uyarla` şunları **reddediyor**: kart sayısı uyuşmazlığı · boş başlık · yarım `**` işareti ·
panel tipi değişikliği · panel ekleme/silme · **şablonun `ÖRNEK VERİ` işaretinin
kalması** (Yasa 8: kaynaksız sayısal iddia yayınlanamaz).

## 4. Render sonrası denetim

`render` adımı PNG yazdıktan sonra aynı belgeyi DOM'da ölçüyor (ek maliyet yok):

| Kusur | Ne ölçülüyor |
|---|---|
| `tasma` | metin kutusu içeriğini **kırpıyor** mu (`overflow` görünür değilse) |
| `punto-cokmesi` | bir kartın uzun kelimesi **tüm** karoselin ölçeğini düşürüyor mu |
| `kesim-uzeri-metin` | okunacak metin kesim çizgisini geçiyor mu |
| `kesintisizlik-yok` | şablon süreklilik iddia ediyor ama hiçbir öge kesimi **aşmıyor** |
| `kart-disi` | metin tuvalin dışına taşıyor mu |
| `eksik-glif` | marka fontunun `unicode-range` kapsamı dışında karakter var mı |
| `matlama-tutmuyor` | `kesik` görselin köşe parlaklığı; zemin siyah değilse kesim tutmaz |
| `yer-tutucu` | görsel üretilemedi ve yerine çerçeve çizildi — **eksik çıktı yayına gitmez** |
| `ifsa-gorunmuyor` | belge AI ifşası taşıdığını söylüyor ama şerit slaytta yok/gizli |
| `ifsa-okunmuyor` | ifşa görselin üstüne düşüyor, metin zemine karışıyor (Md. 50 görünürlük) |

Kusurlar susturulmuyor: çıktıya giriyor, `kalite` ve insan onay kapısı görüyor.

⚠ `yer-tutucu` gerçek bir koşuda bulundu: `gorsel-uret` sağlayıcı politikasıyla
reddedildi (`IMAGE_PROMPT_REJECTED`), bir yuva boş kaldı, son slaytta kesik çizgili bir
kutu kaldı — ve `kalite` **"0 kusur, geçti"** dedi. Denetim taşmayı ölçüyordu, EKSİĞİ
değil. Yer tutucu bilerek çiziliyor (eksiklik görünür kalmalı); doğru davranış onu
silmek değil, yayına gitmesini engellemek.
Düzeltme turu `denetimTuru` ile en fazla **iki** tur; yalnız **kesin iyileşme** kabul
ediliyor ve düzeltme yine `uyarla`dan geçtiği için kompozisyonu bozamıyor.

## 5. Dosya yapısı — ne nerede ve neden

| Dosya | Halka | Neden orada |
|---|---|---|
| `packages/contracts/src/katalog.ts` | contracts | Şablon KAYDI: id, slayt aralığı, görsel ihtiyacı, kullanılabilirlik. `engine` onu render'a bağımlı olmadan okuyabilmeli. |
| `packages/render/src/katalog-ornek.ts` | render | Şablonun DOLU taslağı. `PanoramaBelgesi` render'ın tipi ve contracts onu göremez (halka sırası). |
| `packages/render/src/panorama.ts` | render | Tek geniş tuval + dilimleme, tipografi reçetesi, yerleşim. |
| `packages/render/src/zemin.ts` | render | Zemin reçetesi: degrade, ışık, tarama, vinyet, gren. |
| `packages/render/src/panorama-denetim.ts` | render | DOM ölçümü. Belgeye değil ÇIKTIYA bakıyor. |
| `packages/engine/src/plan/sablon-sec.ts` | engine | Deterministik seçim. |
| `packages/engine/src/plan/sablon-uyarla.ts` | engine | Sözleşme + birleştirme + istem. |
| `packages/engine/src/plan/denetim-turu.ts` | engine | Düzeltme turu, tavan iki. |
| `packages/engine/src/verbs/bodies.ts` | engine | **Dikiş**: `COMPOSE` katalog dalı, `RENDER` panorama dalı, `GENERATE` uyarlama dalı. |

⚠ **Kayıt `contracts`ta, örnek `render`da ve bağ aynı `id`.** İki liste iki ayrı pakette
ve hiçbir derleme hatası onları birbirine bağlamıyor — `katalog-ornek.test.ts` iki yönlü
eşleşmeyi zorluyor (her kaydın örneği, her örneğin kaydı var).

## 6. Gerçek koşu — kanıt

`sops exec-env secrets/secrets.enc.yaml 'just uret instagram-karosel "Geri kazanim kapasitesi"'`

```
✓ cozumle · bilgi-sec · metin-uret · sablon-uyarla · kompozit · gorsel-brief
✓ gorsel-uret (cloudflare-workers-ai) · yuva-doldur · render
✓ gorsel-yargi · tasarim-yargi · kalite
⏸ insan kapısında durdu: insan-onayi
4 varlık damgalandı ve depoya alındı
```

Defterden: `kompozit {sablonId: 'sahne'}` · `render {panoramaGenisligi: 1080}` ·
`kalite {kusurSayisi: 1, bulgular: ['marka fontunun kapsamı dışında: ✓'], gecti: false}`.

⚠ **Denetim gerçek bir kusur yakaladı:** model metne `✓` karakteri koydu ve marka fontu
onu kapsamıyor. Koşu durmadı; kusur `kalite` çıktısına ve insan onay kapısına gitti.

## 6b. Bağlanırken çıkan ALTI kopuk halka

Zincir kurulurken hiçbiri testle değil, **gerçek koşuyla** bulundu:

| # | Belirti | Kök neden |
|---|---|---|
| 1 | `renderPanorama` sıfır çağıran | mimari `just uret`ten erişilemezdi (D-270) |
| 2 | adım sessizce atlandı | zorunlu adımda boş istem "atlandı" sayılıyordu |
| 3 | altı şablon birden elendi | eleme iki yönlüydü; 11 satır > 8 kart |
| 4 | `ADAPTATION_UNPARSEABLE` | istem JSON şemasını hiç söylemiyordu |
| 5 | `gorsel-brief` atlandı | brief kurucusu eski `tasarimPlani`ni arıyordu |
| 6 | görsel üretildi, YER TUTUCU çizildi | `.find()` ilk panoramayı (boş olanı) alıyordu |

⚠ Ayrıca hat iki kez **21 dakika asıldı**: `claude` CLI daemon'u stdout borusunu tutuyor,
Node `close` yaymıyordu ve 10 dakikalık zaman aşımı da aynı olaya bağlıydı (D-272).

## 7. Bilinen sınırlar

- `donen` ve `editoryal` **yalnız açıkça istenerek** seçilebiliyor.
- `sahne` şablonunda başlık en fazla iki satır olmalı: oklar metin ile kesik özne
  arasındaki dar şeritte duruyor.
- Slayt-başına render yolu (`static.ts` · `AileProfili`) **kaldı ve kalmalı**: sekiz hat
  ondan besleniyor (deck, LinkedIn dökümanı, prospect-deck, reels, explainer…). Emekli
  olan şey **karosel için aile seçimi** (D-271); `docs/arsiv/aile-tabanli-karosel/`.
- ⚠ **`matlama` modelin uymasına bağlı.** Brief düz siyah zemin istiyor ama bu bir RİCA:
  model açık zemin üretirse luma anahtarı kesmiyor ve fotoğraf dikdörtgen kalıyor.
  Artık ÖLÇÜLÜYOR (`matlama-tutmuyor`) ama otomatik düzeltilmiyor — yeniden üretim
  ya da arka plan silme modeli (BiRefNet, ertelendi) ayrı bir karar.
- Düzeltme turu (`denetimTuru`) yazıldı ve test edildi ama **hatta bağlı değil**: kusurlar
  bugün rapor ediliyor, otomatik düzeltilmiyor. Bağlanması FAZ-15.9'un kalanı.
