// HEDEF: packages/render/src/sablon-tipo.ts
//
// Tipografi katman stilleri — Photoshop'un katman paneli, canlı metinle (FAZ-12.1 · §7.2).
//
// ⚠ **R-20 MUTLAK:** hiçbir efekt metni görsele çevirmiyor. `background-clip: text` bile
// canlı metin bırakır — glif ölçümü, `notdef` sayımı ve Türkçe kapıları çalışmaya devam
// eder. Metnin raster olduğu an bu sistemin bütün ölçüm katmanı körleşir.
//
// ⚠ **Efekt SLAYT ROLÜNE göre seçilir, serbestçe değil.** Photoshop'ta her efekt her
// metne uygulanabilir; bir MARKA sisteminde uygulanamaz. *"Hepsi mümkün"* ile *"hepsi
// aynı anda"* arasındaki fark, tasarım ile şablon arasındaki farktır.
//
// ⚠ **BU AİLEDE ÇOĞU KAPALI — ve karar bakarak verildi.** Referans örneklerin hiçbirinde
// gölge, parıltı ya da bevel yok; dördü de DÜZ tipografi kullanıyor. Vinyette olduğu gibi
// (D-262 ailesi), yetenek duruyor ve parametrik; koyu zeminli ya da editoryal bir aile
// onları açar. Bugün açık olan iki şey var: OpenType özellikleri ve vurgu şeridi.

/** Kapalı efekt dağarcığı. Altıncısı bir KARAR ister. */
export const TIPO_EFEKTLERI = ['vurgu', 'kontur', 'degrade', 'golge', 'knockout'] as const
export type TipoEfekti = (typeof TIPO_EFEKTLERI)[number]

/**
 * OpenType özellikleri — görünmez ama gerçek kalite farkı.
 *
 * `kern` çift bazlı aralık, `liga` standart bağlar (fi, fl), `calt` bağlama duyarlı
 * alternatifler. Üçü de varsayılan olarak açık SAYILIR ama tarayıcılar arası davranış
 * değişiyor; açıkça yazmak belirsizliği kaldırıyor.
 *
 * ⚠ `dlig` (isteğe bağlı bağlar) KAPALI: Türkçe'de `fi` bağı `fı` ile karışabilir ve
 * dekoratif bağlar okunabilirliği düşürür. Süs değil, doğruluk aranıyor.
 */
export const OPENTYPE_CSS = `"kern" 1, "liga" 1, "calt" 1`

/**
 * Vurgu şeridi — bir ifadenin ARKASINA çekilen eğik bant.
 *
 * ⚠ **Karoselin en büyük tipografik eksiği buydu:** her satır aynı ağırlıkta okunuyordu.
 * Referanslarda bir ifade her zaman öne çıkar — renkle, ağırlıkla ya da şeritle.
 * Hiyerarşi bir slaytın İÇİNDE de gerekiyor, yalnız slaytlar arasında değil.
 *
 * ⚠ Şerit metnin ALTINDA — ama `z-index` ile DEĞİL, `background` degradesiyle: şerit
 * glifin arkasında bir arka plan katmanı, ayrı bir öge değil. (İlk sürümün yorumu
 * `z-index: -1` diyordu ve kod onu hiç basmıyordu — yorum ile kodun ayrışması.)
 * ⚠ `box-decoration-break: clone` satır kırılmasında da doğru çiziyor; tek satırlık
 * varsayım Türkçe'de tutmaz.
 * ⚠ Eğim 0: eğik bir şerit el yazısı hissi verir, bu aile geometrik.
 */
export const vurguCss = (serit: string, motif: string): string =>
  // ⚠ ⚠ **FOSFORLU KALEM DENENDİ ve KOYU ALANDA ALTI ÇİZİLİ GİBİ OKUNDU.** İlk sürüm
  // `linear-gradient(transparent 58%, serit 58%)` ile glifin ALT yarısını boyuyordu.
  // Açık kâğıt alanda çalışıyordu; koyu mürekkep alanda metin `--role-surface` (beyaz),
  // şerit amber oldu ve glifin üst yarısı beyaz-siyah, alt yarısı beyaz-amber kaldı:
  // düşük kontrast + ikiye bölünmüş glif = altı çizili görüntüsü. Gerçek koşu çıktısına
  // BAKINCA görüldü; hiçbir metrik göremezdi.
  //
  // ⚠ **Kök sebep yarım kaplamaydı, renk değil.** Bant glifi kısmen örtüyorsa metin
  // rengi hem zemine hem banda göre doğru olmak zorunda ve bu imkânsız. Bant TAM
  // kaplayınca tek bir karşıt renk yetiyor: `motif` zaten `kontrast(karsiAlan)` ve
  // `karsiAlan` şeridin kendisi — yani renk TÜRETİLMİŞ, seçilmiş değil.
  //
  // ⚠ Köşe yuvarlatma YOK: bu aile geometrik (eğik şerit el yazısı hissi verirdi, aynı
  // gerekçe). Yatay pay `em` cinsinden — punto değişince çip de ölçekleniyor.
  // ⚠ `box-decoration-break: clone`: satır kırılmasında her parça kendi çipini alıyor;
  // tek satırlık varsayım Türkçe'de tutmaz.
  `  .icerik strong { font-weight: inherit; color: ${motif}; background: ${serit};` +
  ` padding: 0.06em 0.14em; box-decoration-break: clone;` +
  ` -webkit-box-decoration-break: clone; }`

/**
 * Kontur — BİLDİRİM olarak, seçicisiz.
 *
 * ⚠ ⚠ **Seçicili sürüm bir REGRESYON üretti ve ancak BAKINCA görüldü.** `konturCss`
 * tam bir kural (`.hayalet { … }`) döndürüyordu ve `static.ts` onu **kapanmamış bir
 * `.hayalet {` bloğunun ORTASINA** basıyordu: CSS bozuldu, tarayıcı hata kurtarmaya
 * girdi, `color: transparent` düştü ve dev rakam KONTUR yerine DOLU çıktı.
 * 42 kapı ve 1613 test yeşildi; kusuru yalnız gerçek çıktıya bakmak yakaladı.
 *
 * Bildirim biçimi bu hatayı temsil edilemez kılıyor: çağıran onu ancak bir bloğun
 * İÇİNE koyabilir.
 * ⚠ `kalinlik: 0` → görünmez rakam. "Kontur kapalı" bu ailede tam olarak bunu demek:
 * dolu bir dev rakam bu gramerde hiç yok.
 */
export const konturBildirimi = (renk: string, kalinlik: number): string =>
  `-webkit-text-stroke: ${kalinlik}px ${renk}; color: transparent;`

// ── YAZILMAYAN ÜÇ EFEKT: degrade · gölge · knockout ─────────────────────────
//
// ⚠ ⚠ **ÜRETEÇLERİ SİLİNDİ, GEREKÇELERİ KALDI.** Üçü de yazılmıştı, üçünün de çağıranı
// YOKTU ve dağarcıkta durmaları "yakında lazım olur" varsayımına dayanıyordu. Aynı turda
// FAZ-12.2 tam bu sebeple bir üreteci silmişti (`degradeYuzeyi`); bağımsız doğrulama
// tutarsızlığı yakaladı — bir kuralı bir dosyada uygulayıp komşusunda uygulamamak,
// kuralı olmamasından kötüdür. Bilgi değerlidir, ölü kod değil:
//
// • **degrade dolgu** — kontrast metriği (T4) TEK renk üstünden ölçüyor; degradeyle dolan
//   bir başlığın en açık durağı zeminle kontrastını kaybedebilir ve ölçüm bunu göremez.
//   Açılması için önce ölçümün EN KÖTÜ durağı bulması gerekiyor: bu bir adım, bir CSS
//   satırı değil. (`background-clip: text` R-20'yi bozmaz — metin canlı kalır.)
// • **gölge** — referans örneklerin dördünde de gölgesiz düz tipografi var. §12.1'in gölge
//   yasağı KONSOL yüzeyine ait ama bu ailenin dili de düz. Koyu zeminli bir aile açar.
// • **knockout** (`mix-blend-mode: difference`) — çözdüğü sorun bu ailede YOK: metin
//   `column_in_band` değişmezi gereği eğri sınırını hiç geçmiyor, yani iki zemin üstünde
//   duran bir metin hiç oluşmuyor.
//
// Üçü de bir gün gerekirse yazılır; o gün yeniden yazmanın maliyeti, bugün ölü durmanın
// maliyetinden düşük.

/**
 * `**vurgu**` işaretini `<strong>`a çevirir — KAÇIRILMIŞ metin üstünde.
 *
 * ⚠ Sıra şart: önce `kacir`, sonra bu. Ters sırada model metnindeki `<` bir etikete
 * dönüşür ve içerik enjeksiyonu olur.
 * ⚠ Açgözlü DEĞİL (`[^*]+`): iki ayrı vurgu tek bir bloğa yapışmasın.
 */
export const vurguyuIsaretle = (kacirilmis: string): string =>
  kacirilmis.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
