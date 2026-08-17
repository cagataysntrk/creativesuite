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
 * ⚠ Şerit metnin ALTINDA (`z-index: -1`) ve `box-decoration-break: clone` ile satır
 * kırılmasında da doğru çiziliyor — tek satırlık varsayım Türkçe'de tutmaz.
 * ⚠ Eğim 0: eğik bir şerit el yazısı hissi verir, bu aile geometrik.
 */
export const vurguCss = (serit: string, metin: string): string =>
  // ⚠ **ŞERİT, yalnız renk DEĞİL — ilk sürüm bakınca yetersiz çıktı.** Sadece rengi
  // değiştirmek `--role-text-muted` ile `--role-text` arasında ayırt edilemeyecek kadar
  // küçük bir fark bırakıyordu: efekt vardı, işini yapmıyordu (ikon boyutuyla aynı sınıf).
  // Üstelik bu dosyanın yorumu "şerit" diyordu ve kod yalnız renk yazıyordu — yorum ile
  // kodun ayrışması, bu projenin defalarca yakaladığı hata biçimi.
  //
  // ⚠ **Fosforlu kalem deseni:** degrade %58'e kadar şeffaf, sonra dolu. Şerit glifin
  // ALT yarısında duruyor; üstünü kaplasaydı kontrastı düşürür ve okumayı zorlaştırırdı.
  // Metin tam güçte (`${metin}`), soluk değil: vurgulanan ifade en okunaklı olan olmalı.
  `  .icerik strong { font-weight: inherit; color: ${metin};` +
  ` background: linear-gradient(transparent 58%, ${serit} 58%);` +
  ` box-decoration-break: clone; -webkit-box-decoration-break: clone; }`

/**
 * Kontur — hayalet rakamın zaten kullandığı efekt, burada ADLANDIRILDI.
 *
 * Dağarcığın parçası olması kasıtlı: bir efekt kodda varsa ama dağarcıkta yoksa,
 * ikinci bir kullanım ikinci bir uygulama yazar (R-05'in tipografi karşılığı).
 */
export const konturCss = (secici: string, renk: string, kalinlik: number): string =>
  `  ${secici} { -webkit-text-stroke: ${kalinlik}px ${renk}; color: transparent; }`

/**
 * Degrade dolgu — metin bir renk geçişiyle dolar, CANLI metin kalarak.
 *
 * ⚠ **BU AİLEDE KAPALI.** Kontrast metriği (T4) tek bir renk üstünden ölçüyor; degradeyle
 * dolan bir başlığın en açık durağı zeminle kontrastını kaybedebilir ve ölçüm bunu
 * göremez. Açılması için önce ölçümün en KÖTÜ durağı bulması gerekiyor — o bir adım,
 * bir CSS satırı değil.
 */
export const degradeCss = (secici: string, bas: string, son: string): string =>
  `  ${secici} { background: linear-gradient(90deg, ${bas}, ${son});` +
  ` -webkit-background-clip: text; background-clip: text; color: transparent; }`

/**
 * Gölge — derinlik.
 *
 * ⚠ **BU AİLEDE KAPALI.** Referans örneklerin dördünde de gölgesiz düz tipografi var;
 * §12.1'in gölge yasağı konsola ait ama bu ailenin dili de düz. Koyu zeminli bir aile açar.
 */
export const golgeCss = (secici: string, renk: string, bulanik: number): string =>
  `  ${secici} { text-shadow: 0 2px ${bulanik}px ${renk}; }`

/**
 * Knockout — metin zemine göre TERS döner, iki alanda da okunur.
 *
 * ⚠ **BU AİLEDE KAPALI ve sebebi yapısal:** metin hiçbir zaman eğri sınırını geçmiyor
 * (`column_in_band` değişmezi bunu zorluyor), yani iki zemin üstünde duran bir metin
 * hiç oluşmuyor. Knockout'un çözdüğü sorun bu ailede YOK.
 */
export const knockoutCss = (secici: string): string =>
  `  ${secici} { mix-blend-mode: difference; color: #fff; }`

/**
 * `**vurgu**` işaretini `<strong>`a çevirir — KAÇIRILMIŞ metin üstünde.
 *
 * ⚠ Sıra şart: önce `kacir`, sonra bu. Ters sırada model metnindeki `<` bir etikete
 * dönüşür ve içerik enjeksiyonu olur.
 * ⚠ Açgözlü DEĞİL (`[^*]+`): iki ayrı vurgu tek bir bloğa yapışmasın.
 */
export const vurguyuIsaretle = (kacirilmis: string): string =>
  kacirilmis.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
