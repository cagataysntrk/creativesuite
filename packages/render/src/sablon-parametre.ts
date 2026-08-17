// Şablon parametreleri — gramerin AYARLANABİLİR sayıları (§7.1 · FAZ-10.6 · D-257).
//
// **Gramer kapalı, sayılar değil.** D-254 gramerin kapalı olduğunu söylüyor: kaç kural
// olduğu, hangi ögelerin bulunduğu bir KARAR. Ama o kuralların sayısal ayarları —
// eğrinin nerede aktığı, kenar payı, hayalet rakamın büyüklüğü — bir referanstan
// türetilebilir ve türetilmelidir. Aksi hâlde her yeni referans elle çözümlenir ve
// ikinci referansta ilkiyle tutarsız kalır.
//
// ⚠ **Bu dosya VARSAYILANI taşıyor, türetilmiş dosyayı DEĞİL.** Türetme `PROPOSE` eder,
// insan uygular (R-14 · D-31): `scripts/sablon-turet.mjs` bir JSON yazar, o JSON'u
// buraya taşımak bir commit'tir. Otomatik uygulansaydı bir referans görseli, hiçbir
// insan bakmadan tüm markanın tipografisini değiştirebilirdi.

/**
 * Gramerin sayısal ayarları — **KAPALI alan listesi**.
 *
 * Yeni bir alan eklemek, gramere yeni bir serbestlik derecesi eklemek demek ve bir
 * karar ister. Alanların çoğu ölçülebilir; ölçülemeyenler burada AÇIKÇA işaretli.
 */
export interface SablonParametreleri {
  /** Eğri sınırının salınım bandı, tuval genişliğinin yüzdesi. */
  readonly bantMin: number
  readonly bantMax: number
  /** Eğrinin kontrol noktalarının merkezden sapması, yüzde. */
  readonly genlik: number
  /** İçerik kenar payı, px. */
  readonly kenarPayi: number
  /** Sayacın kapladığı üst bant, px — üste yaslı içerik bunu aşmak zorunda. */
  readonly sayacBandi: number
  /**
   * Başlık puntosu tavanı, px.
   *
   * ⚠ **REFERANSTAN TÜRETİLEMEZ.** Bu sayı dilin kendisinden geliyor: en uzun Türkçe
   * kelimenin güvenli sütuna sığdığı en büyük değer (`docs/referans/tip-olcegi.md`).
   * İngilizce bir referanstan ölçülen punto, Türkçe metinde taşar — referansın
   * `Showcase`ı 8 karakter, bizim `taşıyabileceğimizin` 19.
   */
  readonly baslikTavaniPx: number
  /** Hayalet rakamın puntosu, px. */
  readonly hayaletPx: number
  /** Hayalet rakamın kontur kalınlığı, px. */
  readonly hayaletKonturPx: number
}

/**
 * Yürürlükteki parametreler.
 *
 * **Her sayının kaynağı belli:** ya bir ölçüm, ya bir kısıt. "Güzel duruyor" diye
 * seçilmiş sayı yok — olsaydı ilk itirazda savunulamazdı (D-253 dersi).
 */
export const VARSAYILAN: SablonParametreleri = {
  // Referansta ölçülen bant %52–73 (slayt genişliğinin yüzdesi, sınıf geçişleriyle).
  // Bizimki DAHA SAĞDA ve sebebi dilsel: metin sütunu %62 olmak zorunda, çünkü
  // `taşıyabileceğimizin` 64 px'te 582 px'lik içerik genişliği istiyor. Referans
  // İngilizce ve daha dar bir sütunla idare ediyor. **Referansı birebir kopyalamak
  // Türkçe metni eğrinin içine sokardı** — bu bir sapma değil, bir uyarlama.
  bantMin: 69,
  bantMax: 78,
  genlik: 5,
  kenarPayi: 88,
  sayacBandi: 52,
  baslikTavaniPx: 64,
  hayaletPx: 560,
  hayaletKonturPx: 3,
}

/**
 * Sütun ile eğri arasındaki NEFES, yüzde puanı.
 *
 * ⚠ Tek yerde duruyor çünkü iki tüketicisi var: en kötü slayt için küresel sabit
 * (`guvenliYuzde`) ve slayt başına hesap (`guvenliKolonYuzdesi`). İki kopya olsaydı
 * biri değişip diğeri unutulurdu — bu dosyanın zaten üç kez aldığı ders.
 */
export const NEFES_YUZDESI = 2

/**
 * Metin sütununun güvenli genişliği, yüzde — parametrelerden TÜRETİLİYOR.
 *
 * ⚠ **Bu, EN KÖTÜ slaytın değeri**: `bantMin` bandın metne en çok yaklaştığı ucu, yani
 * bu sayı beş slaytın hepsinde geçerli ama dördünde GEREKSİZ dar. Slayt başına hesap
 * `guvenliKolonYuzdesi`de (FAZ-12.10); bu sabit slayttan bağımsız tüketiciler için
 * (gramer değişmezi, tip ölçeği) duruyor.
 */
export const guvenliYuzde = (p: SablonParametreleri): number => p.bantMin - p.genlik - NEFES_YUZDESI
