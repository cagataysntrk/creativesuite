// HEDEF: packages/render/src/kompozit.ts
//
// Katman yığını — Photoshop'un katman paneli, SIRASI VERİ (FAZ-13.2 · §7.1 · R-30).
//
// **Neden var:** slayt zaten bir kompozit — dolgu · süsleme · hayalet rakam · doku ·
// vinyet · içerik · kimlik. Ama sıra `static.ts` içine dağılmış SEKİZ AYRI `z-index`
// sayısıydı ve **üçü beraberdi**: `.alan` ile `.susleme` ikisi de 1, `.hayalet` ·
// `.doku` · `.vinyet` üçü de 2. Beraberlikte sırayı CSS değil DOM sırası belirler.
//
// ⚠ ⚠ **Bu bir biçimsel düzeltme değil, sessiz bir kusur sınıfı.** `.doku` katmanı
// `mix-blend-mode: overlay` taşıyor; hayalet rakamın ÜSTÜNDE ama metnin ALTINDA olmak
// zorunda. Bugün doğru yerde duruyor — ama bunu sağlayan şey bir karar değil, iki `<div>`in
// yazılma sırası. Aradaki bir satır taşınsa doku rakamın altına düşer ve kimse görmez;
// tam olarak "yeşil kapı, kırık çıktı" sınıfı.
//
// ⚠ **Sıra İÇERİKTEN türemez.** Türeseydi aynı konu iki koşuda iki farklı kompozit verir
// ve golden test kurulamazdı. Sıra gramerin kendisi: sabit, kapalı, tek yerde.
//
// ⚠ **Katman sayısı KAPALI (yedi).** Sekizincisi bir karar ister. Sınırsız katman,
// Photoshop'un özgürlüğünü ve tutarsızlığını birlikte getirir; şablon olmaktan çıkar.
//
// ⚠ **Öge-içi çok kaynaklı montaj (görsel + degrade + doku tek maskede) YAZILMADI.**
// Bugün çağıranı yok: fotoğraf yuvası tek kaynak alıyor ve üstüne işlem zinciri
// uygulanıyor (FAZ-12.2). Çağıranı olmayan üreteç bu projenin yedi kez tekrarladığı
// hatası (D-261) — bu turda bir tanesi silindi, ikincisi yazılmadı.

/**
 * Katman yığını — DİPTEN TEPEYE, kapalı.
 *
 * Her adın karşılığı `static.ts`teki CSS sınıfı. Sıra bu dizinin kendisi; `z-index`
 * ondan TÜRETİLİYOR, elle yazılmıyor.
 */
export const KATMAN_SIRASI = [
  /** Renk alanı — akan eğrinin doldurduğu taraf. */
  'alan',
  /** Geometrik süslemeler — kontur, dolgu değil. */
  'susleme',
  /** Hayalet rakam — dev, kırpılmış, yalnız kontur. */
  'hayalet',
  /** Baskı dokusu — `overlay`, rakamın ÜSTÜNDE metnin ALTINDA olmak ZORUNDA. */
  'doku',
  /** Kenar vinyeti — okuma yönlendirmesi. */
  'vinyet',
  /** Metin sütunu. */
  'icerik',
  /** Kimlik şeridi: sayaç · kulp · navigasyon · marka işareti. */
  'kimlik',
] as const

export type Katman = (typeof KATMAN_SIRASI)[number]

/**
 * Bir katmanın `z-index`i — 1 tabanlı, dizideki yerinden.
 *
 * ⚠ **Beraberlik ÜRETİLEMEZ.** İki katman aynı sayıyı alamıyor çünkü sayı indeksin
 * kendisi. Eski sekiz elle yazılmış sabitte üç beraberlik vardı ve hiçbiri kasıtlı değildi.
 */
export const z = (katman: Katman): number => KATMAN_SIRASI.indexOf(katman) + 1

/**
 * Bir katmanın ötekinin üstünde olup olmadığı — niyeti KODDA sınamak için.
 *
 * Testler bunu kullanıyor: "doku hayaletin üstünde, içeriğin altında" cümlesi bir yorum
 * olarak yaşarsa bir gün yalan olur; okuma olarak yaşarsa olamaz.
 */
export const ustunde = (a: Katman, b: Katman): boolean => z(a) > z(b)
