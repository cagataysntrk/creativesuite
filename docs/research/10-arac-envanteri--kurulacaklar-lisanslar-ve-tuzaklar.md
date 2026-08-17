# Araç envanteri — ne kurulacak, hangi lisansla, hangi tuzak

> **Soru:** "Photoshop seviyesinde estetik tasarım" için Chromium'un veremediği ne var ve
> onu vermek için ne kurmak gerekiyor?
>
> **Kapsam:** yalnız *yetenek* değil, *lisans*. Bu ticari bir ajans ürünü. Bir bağımlılığın
> lisansı yanlışsa yetenek ne kadar iyi olursa olsun giremez — ve en iyi iki araç tam da
> bu yüzden giremiyor.

---

## 0. Kabul kapısı — bir aracın girebilmesi için

1. **Lisans:** MIT · ISC · Apache-2.0 · BSD · CC0 · MPL. **GPL ve NC (non-commercial)
   REDDEDİLİR.** LGPL yalnız *değiştirilmemiş, sunucu tarafı, ayrı süreç* kullanımda.
2. **Chromium zaten yapabiliyorsa GİRMEZ.** R-30 tek render motoru; ikinci bir
   CSS/SVG alt kümesi ikinci bir Türkçe hata modudur.
3. **40 satır yazmak bir bağımlılıktan iyidir** (CLAUDE.md çalışma kuralı).
4. **Model ağırlıkları varlık deposuna girer, git'e değil** (D-248, içerik-adresli).

---

## 1. ⛔ TUZAKLAR — en iyi araçlar, girmesi yasak

Bunları önce yazıyorum çünkü "en iyi" listelerinin ilk sırasında bunlar var ve dikkatsiz
bir kurulum ürünü lisans ihlaline sokar.

| Araç | Yetenek | Lisans | Neden REDDEDİLDİ |
|---|---|---|---|
| **BRIA RMBG-2.0** | arka plan silme, kalitede lider | **CC BY-NC 4.0** | **Ticari kullanım YASAK** — BRIA ile ayrı ticari anlaşma gerekiyor. İronisi: RMBG-2.0 zaten **BiRefNet mimarisi** üstüne kurulu; biz MIT olan aslını alıyoruz. |
| **Potrace** | raster → vektör izleme | **GPL-2.0+** | Copyleft. Türev iş de GPL olmak zorunda; özel repoda kullanılamaz. |
| `rembg` varsayılanı | çok arka uçlu düzenleyici | MIT ama… | Kendisi MIT, fakat **`bria-rmbg` arka ucunu da paketliyor.** Kurulursa arka uç `birefnet-*` olarak SABİTLENMELİ; varsayılana bırakılamaz. |
| Adobe/Canva/Figma API | her şey | tescilli | Yerel komuta merkezi ilkesine aykırı (§16: kurtarma `git clone` + `cat`). |

⚠ **Kural adayı:** bir modelin ağırlıkları ile mimarisi ayrı lisanslanabilir. "BiRefNet
tabanlı" demek "MIT" demek DEĞİLDİR. Ağırlığın kendi lisansına bakılır.

---

## 2. ✅ Raster işleme — hangi motor

| Araç | Lisans | Karar |
|---|---|---|
| **Chromium (mevcut)** | BSD | **BİRİNCİL.** `filter` · `feColorMatrix` · `feTurbulence` · `feConvolveMatrix` · `mix-blend-mode` · `clip-path` · `mask-image` · `backdrop-filter` — duotone, grain, bulanıklık, keskinleştirme, halftone, vinyet, maskeleme hepsi burada ve **sıfır kurulum**. |
| **sharp** (libvips) | Apache-2.0 / libvips LGPLv3 | **İKİNCİL, dar kapsam.** Yalnız Chromium'un yapamadığı: format dönüşümü, EXIF temizliği, gerçek yeniden örnekleme (Lanczos), büyük görselin ön küçültmesi. LGPL: değiştirilmeden, sunucu tarafı, dağıtılan istemci paketine girmiyor → uygun. |
| ImageMagick | ImageMagick (Apache benzeri) | **GEREKSİZ** — sharp + Chromium örtüşüyor. İki raster motoru iki hata modu. |
| Jimp (saf JS) | MIT | **GEREKSİZ** — sharp'tan yavaş, Chromium'dan kabiliyetsiz. |

**Sonuç: Chromium birincil, `sharp` yalnız piksel boru hattı için.**

---

## 3. ✅ Arka plan silme / özne kesme

| Araç | Lisans | Not |
|---|---|---|
| **BiRefNet** | **MIT** | Ticari kullanım serbest. Varyantlar: `general` · `portrait` · `matting` · `HR` (2048²). ~17 FPS. Kesik özne (FAZ-11.5) için doğru seçim. |
| `rembg` | MIT | BiRefNet'i çalıştırmanın kolay yolu — **arka uç `birefnet-general` olarak sabitlenmeli.** |
| SAM 2 | Apache-2.0 | Nokta/kutu ipucuyla segmentasyon. Arka plan silmede aşırı; "şu nesneyi kes" derse gerekir. |
| U²-Net / ISNet | Apache-2.0 | Eski nesil, BiRefNet'ten zayıf. Yedek. |

**Karar: BiRefNet (MIT), yerel ONNX, ağırlık varlık deposunda.**

---

## 4. ✅ Büyütme ve onarım

| Araç | Lisans | Not |
|---|---|---|
| **Real-ESRGAN** | **BSD-3** | 2×/4× büyütme. Model çıktısı 1024² geliyor, karosel 1080² — tam da eksik olan kadar. |
| GFPGAN / CodeFormer | ⚠ karışık | Yüz onarımı. **§11.3 gereği yapay insan üretmiyoruz** — ihtiyaç yok, lisans tartışması da yok. |
| SwinIR | Apache-2.0 | Real-ESRGAN yedeği. |

---

## 5. ✅ Vektörleştirme

| Araç | Lisans | Not |
|---|---|---|
| **VTracer** | **MIT** | Raster → SVG, **renkli** görsel destekliyor. Potrace'in pahalı optimal-poligon aramasını atlıyor. |
| Potrace | GPL-2.0+ | ⛔ yukarı bak. |

**Kullanım:** üretilen görseli vektöre çevirip marka paletine **yeniden boyamak** — duotone'un
daha sert kardeşi. Model çıktısının renk sapmasını yapısal olarak çözer.

---

## 6. ✅ İkon setleri — gömülü, ~20 ögelik kapalı alt küme

| Set | Lisans | Not |
|---|---|---|
| **Lucide** | **ISC** | Tutarlı 24px ızgara, tek kontur kalınlığı. **Birincil aday.** |
| Phosphor | MIT | Altı ağırlık — çeşitlilik ister ama tutarlılığı zorlaştırır. |
| Tabler | MIT | 5000+ ikon; alt küme seçimi zorunlu. |
| Iconoir | MIT | Bağımlılıksız, saf SVG. |
| Simple Icons | CC0 | ⚠ **marka logoları** — CC0 ama *marka hakkı* ayrı. Yalnız gerçek entegrasyonları göstermek için. |

**Karar: Lucide'den ~20 ikonluk KAPALI alt küme, font gibi GÖMÜLÜ** (D-252 deseni). Ağdan
çekilmez; bir ay ihmal edilse de çalışır (§16).

---

## 7. ✅ İllüstrasyon kütüphaneleri — "çok fazla görsel kütüphane var"ın karşılığı

| Kütüphane | Lisans | Not |
|---|---|---|
| **Open Peeps** | **CC0** | Elle çizilmiş modüler insanlar. Kısıtsız. |
| **Humaaans** | **CC0** | Modüler gövde/baş/poz. Kısıtsız. |
| **DrawKit** (ücretsiz paketler) | MIT | SaaS/teknoloji odaklı. |
| unDraw | özel lisans | Ticari serbest, atıf gerekmez — ⚠ **AI eğitiminde kullanımı YASAK.** Biz eğitmiyoruz, kullanıyoruz: uygun. Yine de tek renkli tema özelliği bizim amber'e birebir oturuyor. |
| Storyset | ücretsiz + atıf | Atıf zorunluluğu karoselde yer kaplar — **düşük öncelik.** |

⚠ **Ama:** modüler insan illüstrasyonu §11.3 ile sınanmalı — *"onay ima eden yapay insan
üretilmez"*. Bir çizim müşteri referansı gibi durursa reklam mevzuatına girer. **Soyut,
şematik kullanım serbest; "memnun müşteri" tasviri yasak.**

---

## 8. ✅ Desen · doku · arka plan — kurulum GEREKMİYOR

Bunların tamamı SVG/CSS, üreteci 40 satır. Kütüphane değil, **dağarcık**:

| Ne | Nasıl |
|---|---|
| Nokta/çizgi/ızgara/tarama deseni | SVG `<pattern>` — ✅ FAZ-11.2'de var |
| Grain / kâğıt dokusu | `feTurbulence` + `feComponentTransfer` |
| Mesh / grain degrade | üst üste `radial-gradient` + gürültü katmanı |
| Blob | sabit kontrol noktalı `path` — ✅ FAZ-11.2'de var |
| Dalga / katman ayracı | `path` — akan eğrimiz zaten bu |
| Izometrik ızgara, topografya | SVG `<pattern>` |
| Halftone / dither | `feImage` + `feComposite` ya da doğrudan nokta ızgarası |

**Hero Patterns / Haikei / SVGBackgrounds gibi siteler ÜRÜN değil, ÖRNEK kaynağı.**
Çıktıları statik SVG; kopyalanır, üretilmez. Bağımlılık eklemeye değmez.

---

## 9. ✅ Veri görselleştirme

| Araç | Lisans | Karar |
|---|---|---|
| **kendi çizicimiz** | — | **BİRİNCİL.** `chart.ts` + `diagram.ts` zaten var. Karosel grafikleri 3–5 veri noktalı; D3 kurmak topu tüfekle vurmak. |
| D3 | ISC | Ölçek/eksen/yay yardımcıları için *seçmeli* — `d3-shape` tek başına alınabilir (yay, çizgi, alan üreteçleri). Halka grafik için `d3-shape` 40 satırdan ucuz olabilir. |
| ECharts / Chart.js | Apache-2.0 / MIT | ⛔ **Canvas'a çiziyorlar** → metin raster olur → glif ölçümü ve Türkçe kapıları ÇALIŞMAZ. Reddedildi. |
| Vega-Lite | BSD-3 | Gramer güzel ama ağır; karosel için gereksiz soyutlama. |

⚠ **Sert kural adayı:** *karoselde hiçbir metin canvas'a çizilmez.* Metin SVG/DOM'da
kalırsa `notdef` sayımı, kontrast ve kelime bütçesi ölçülebilir; canvas'a düştüğü an
ölçüm kapıları kör olur — R-20'nin veri görselleştirmedeki karşılığı.

---

## 10. ✅ Tipografi araçları

| Araç | Lisans | Not |
|---|---|---|
| **Chromium'un HarfBuzz'ı** | MIT | Şekillendirme zaten yapılıyor — Türkçe için doğru sonucu veren şey bu. |
| `fontkit` / `opentype.js` | MIT | Glif metriği, `notdef` tespiti — ✅ golden testte kullanılıyor. |
| `subset-font` (harfbuzzjs) | MIT | Font altkümeleme: latin-ext'i küçültür, gömülü dosya küçülür. **Düşük öncelik**, çalışıyor. |
| Google Fonts / Fontsource | OFL | ✅ Archivo gömülü (D-252). |

**Kurulacak yeni tipografi aracı YOK.** Eksik olan araç değil, **kullanım**: `hyphens`,
`font-feature-settings`, `background-clip: text`, `textPath` — hepsi Chromium'da, hiçbiri
bağlı değil. → FAZ-12.

---

## 11. ✅ Renk

| Araç | Lisans | Not |
|---|---|---|
| **kendi OKLCH katmanımız** | — | ✅ Rampa, rol, chroma tavanı, ΔE2000 — hepsi yazılı. |
| `culori` | MIT | Zaten var mı diye bakılmalı; yoksa 40 satır kuralı geçerli. |
| `colorthief` / `node-vibrant` | MIT | Görselden baskın renk çıkarma — **duotone eşiklerini seçmek için işe yarar.** Ama histogram kodumuz zaten var. |

---

## 12. ⛔ Alternatif render motorları — reddedildi

| Araç | Lisans | Neden |
|---|---|---|
| Satori + resvg | MPL-2.0 | JSX → SVG. Hızlı, ama **CSS alt kümesi FARKLI** → R-30 ihlali, ikinci Türkçe hata modu. |
| Puppeteer/Playwright | Apache-2.0 | ✅ Zaten Chromium'u bu şekilde sürüyoruz. |
| Remotion | özel (ücretli eşik) | Video için. FAZ-5'te değerlendirilir; şirket boyutuna göre lisans ücreti var — **ücretsiz değil.** |
| Motion Canvas | MIT | Video alternatifi, canvas tabanlı → metin sorunu (bkz. §9). |

---

## 13. Üretken görsel — mevcut hatta ne ekleniyor

| Yetenek | Nasıl | Durum |
|---|---|---|
| Metin→görsel | Yönlendirici üstünden (model ID pipeline'da yok — R-?/§8.1) | ✅ var |
| **Görsel→görsel** (taban render + tarif) | Aynı sağlayıcı, `image` girişiyle | ⛔ **EKSİK** → FAZ-11.6. Kullanıcının tarif ettiği yöntem tam olarak bu. |
| Yapı kontrolü (ControlNet / IP-Adapter) | Sağlayıcı destekliyorsa parametre | ⛔ araştırılacak |
| Görsel eleştiri (`image.critique`) | GENERATE yeteneği | ✅ D-256 |

**Not:** ControlNet/IP-Adapter kurulum değil, **sağlayıcı parametresi** — yerel model
çalıştırmıyoruz, yönlendiriciden yetenek istiyoruz (§8.1).

---

## 14. Kurulum kararı — özet

| Ne zaman | Ne | Neden |
|---|---|---|
| **Şimdi (kurulum YOK)** | Chromium filtreleri, karışım kipleri, maskeler, `background-clip: text`, `hyphens`, `textPath`, desen/doku üreteçleri | Hepsi bedava, hepsi kullanılmıyor. **En yüksek getiri burada.** |
| **Şimdi (küçük)** | Lucide alt kümesi (ISC), gömülü | Font deseninin aynısı, ağ bağımsız |
| **Yakında** | `sharp` (Apache-2.0) | Format/EXIF/yeniden örnekleme |
| **FAZ-11.5/11.9** | BiRefNet (MIT), Real-ESRGAN (BSD) | Ağırlık indirmesi + ONNX çalıştırma; gerçek karar gerektirir |
| **Değerlendirilecek** | VTracer (MIT), `d3-shape` (ISC), Open Peeps/Humaaans (CC0) | İhtiyaç doğduğunda |
| **ASLA** | BRIA RMBG (NC), Potrace (GPL), ECharts/Chart.js (canvas), Satori (ikinci motor) | Lisans ya da mimari ihlali |

---

## 15. Bu araştırmanın tek cümlelik sonucu

**Eksik olan araç değil, kullanım.** Ölçüldü: render katmanında `object-fit` dışında
hiçbir görsel işleme çağrısı yoktu. Photoshop'un katman stillerinin ve filtrelerinin
neredeyse tamamı Chromium'da standart, bedava ve kurulumsuz duruyor. Kurulum gerektiren
üç şey var — arka plan silme, büyütme, vektörleştirme — ve üçünün de MIT/BSD karşılığı
mevcut. **Önce bedava olanı bağla, sonra ağırlık indir.**

## Kaynaklar

- [BiRefNet — Hugging Face (MIT)](https://huggingface.co/ZhengPeng7/BiRefNet)
- [BRIA RMBG-2.0 — Hugging Face (CC BY-NC 4.0)](https://huggingface.co/briaai/RMBG-2.0)
- [Real-ESRGAN — LICENSE (BSD-3)](https://github.com/xinntao/Real-ESRGAN/blob/master/LICENSE)
- [VTracer (MIT)](https://github.com/visioncortex/vtracer)
- [Potrace — Wikipedia (GPL-2.0+)](https://en.wikipedia.org/wiki/Potrace)
- [sharp / libvips lisans tartışması](https://github.com/lovell/sharp/issues/3565)
- [Open Peeps (CC0)](https://www.openpeeps.com/)
- [unDraw lisansı](https://pixels.market/blog/undraw-license)
