// HEDEF: packages/contracts/src/katalog.ts
//
// Şablon kataloğu — beş referansın KESİNTİSİZ karşılıkları (§7.1 · D-254).
//
// ⚠ ⚠ **KATALOGA EKLEMEK İŞİ BİTİRMEZ.** Bir şablon ancak KULLANILABİLİRSE kataloğa
// aittir: ihtiyaç duyduğu görsel üretilebiliyor mu, metin şekli hattan çıkıyor mu,
// kesintisizlik gerçekten kuruluyor mu. O yüzden her kayıt ihtiyacını AÇIKÇA ilan
// ediyor — ilan edilmeyen bir ihtiyaç, koşu anında sessiz bir boşluk olur.
//
// ⚠ ⚠ **ÜÇ ŞABLONUN TAŞIYICISI BİR GÖRSEL.** `ornek-1`de kesik öznenin kolu, `ornek-2`de
// daire maskeli ürün, `ornek-4`te tam kaplama fotoğraf. Bunlar dekor değil: kesimi aşan
// öge onlar. Görsel üretilemezse şablon YER TUTUCU ile çiziliyor ve eksiklik görünür
// kalıyor — sessizce metin-only bir sürüme düşmek, tasarımı tanınmaz hâle getirirdi.
//
// ⚠ Renkler TOKEN. Referanstaki turuncu/kırmızı/yeşil rotasyonu birebir kopyalanmadı:
// marka rampasının dışına çıkmak §12.1 chroma tavanını delerdi. Kimliği taşıyan şey
// renklerin kendisi değil, DÖNMESİ.

/** Şablonun ihtiyaç duyduğu görsel — hat bunu üretmekle yükümlü. */
export interface GorselIhtiyaci {
  /**
   * Kaç görsel gerekiyor. `slayt-basina` her karta bir tane ister (kesik özne
   * referansında her karede farklı poz var).
   */
  readonly adet: 'slayt-basina' | number
  /** Nasıl kırpılacak — kompozisyondaki rolü belirliyor. */
  readonly kirpma: 'kesik' | 'daire' | 'tam'
  /**
   * Brief'in sabit kısmı; konuya özgü kısım hat tarafından ekleniyor.
   *
   * ⚠ **R-20:** hiçbir brief metin istemiyor. "no text, no lettering" kuralı hattın
   * brief kurucusunda ve burada tekrarlanmıyor — iki yerde yazılan bir kural, bir yerde
   * unutulur.
   */
  readonly briefTemeli: string
}

/** Kesimi aşan süreklilik ögesinin tarifi. */
export type BantTarifi =
  | { readonly tip: 'egri'; readonly aciklama: string }
  | { readonly tip: 'kemer'; readonly aciklama: string }
  | { readonly tip: 'ok'; readonly aciklama: string }
  | { readonly tip: 'yok'; readonly aciklama: string }

export interface KatalogSablonu {
  readonly id: string
  readonly ad: string
  /** Hangi referanstan ölçüldü — iddia değil, izlenebilirlik. */
  readonly kaynak: string
  /** Kaç slayt aralığında çalışıyor. */
  readonly slayt: { readonly min: number; readonly max: number }
  /** Zemin token'ı; kart başına dönüyorsa `rotasyon` dolu. */
  readonly zemin: string
  /** Kart başına dönen zeminler — boşsa tek zemin. */
  readonly rotasyon: readonly string[]
  readonly bant: BantTarifi
  readonly gorsel: GorselIhtiyaci | null
  /** Başlık puntosunun tavana oranı — sesin yüksekliği. */
  readonly baslikPayi: number
  /** Şablonun BUGÜN kullanılabilir olup olmadığı ve sebebi. */
  readonly kullanilabilir: { readonly durum: boolean; readonly sebep: string }
}

const AMBER = 'var(--role-bg)'
const KAGIT = 'var(--role-surface)'
const MUREKKEP = 'var(--role-line-edge)'
const AMBER_ACIK = 'var(--ramp-marka-amber-200)'
const AMBER_KOYU = 'var(--ramp-marka-amber-600)'

/** Görsel şeridi bugün kapalı: bedava şeritte `image.generate` sağlayıcısı yok. */
const GORSEL_KAPALI = {
  durum: false,
  sebep:
    'Taşıyıcı görsel üretilemiyor: bedava şeritte `image.generate` sağlayıcısı yok ' +
    '(FAZ-11.6 / 13.3 tetikleyicisi). Yer tutucuyla çiziliyor, kompozisyon görünüyor.',
} as const

/**
 * **Veri hikâyesi** — nüfus karoselinin dili: veriden çizilen eğri altı slaydı kat ediyor.
 *
 * ⚠ Bu şablon görselsiz ÇALIŞIYOR ve bu yüzden kataloğun ilk kullanılabilir kaydı:
 * kesimi aşan öge bir fotoğraf değil, verinin kendisi.
 */
export const VERI_HIKAYESI: KatalogSablonu = {
  id: 'veri-hikayesi',
  ad: 'Veri hikâyesi — eğri altı slaydı kat ediyor',
  kaynak: 'panorama referansı (nüfus karoseli)',
  slayt: { min: 4, max: 8 },
  zemin: MUREKKEP,
  rotasyon: [],
  bant: {
    tip: 'egri',
    aciklama:
      'Eğri VERİDEN çiziliyor: x tüm panoramaya yayılıyor, kilometre taşları gerçek ' +
      'olaylara denk geliyor. Süs olsaydı silinebilirdi; veriden türediği için silinemiyor.',
  },
  gorsel: null,
  baslikPayi: 1,
  kullanilabilir: {
    durum: true,
    sebep: 'Görsel gerektirmiyor; taşıyıcı öge veri eğrisi. Hat bugün üretebiliyor.',
  },
}

/**
 * **Sahne** — `ornek-1`: koyu zemin, kesik özne, akan oklar.
 *
 * ⚠ İKİ süreklilik ögesi birden: öznenin kolu kesimi aşıyor VE oklar bir karttan
 * diğerine gidiyor. Göz devamı iki kanaldan kuruyor; biri eksik olursa etki yarıya iner.
 */
export const SAHNE: KatalogSablonu = {
  id: 'sahne',
  ad: 'Sahne — kesik özne kesimi aşıyor, oklar akıyor',
  kaynak: 'ornek-1',
  slayt: { min: 3, max: 6 },
  zemin: MUREKKEP,
  rotasyon: [],
  bant: {
    tip: 'ok',
    aciklama:
      'El çizimi yaylar kart ARALARINDA duruyor, metnin üstünden geçmiyor: nüfus ' +
      'karoselinde oklar başlıkların ortasından geçince okunmaz oldu ve silindi.',
  },
  gorsel: {
    adet: 'slayt-basina',
    kirpma: 'kesik',
    briefTemeli:
      'arka planı tamamen şeffaf, tek özne, boydan çekim, dramatik yan ışık, ' +
      'kollar gövdeden AÇIK (kadraj dışına uzanacak), koyu zemine oturacak',
  },
  baslikPayi: 1,
  kullanilabilir: GORSEL_KAPALI,
}

/**
 * **Memphis** — `ornek-3`: beyaz zemin, geometrik leke dili, kesik özneler.
 *
 * ⚠ Burada süreklilik ögesi YOK ve bu bilinçli: referansta da slaytlar bağımsız duruyor,
 * onları bağlayan şey desen dili. Kesintisizlik her şablonun şartı değil — **iddia
 * edilmediği sürece.** İddia edip kuramamak, kurmamaktan kötüdür.
 */
export const MEMPHIS: KatalogSablonu = {
  id: 'memphis',
  ad: 'Memphis — beyaz zemin, geometrik leke dili',
  kaynak: 'ornek-3',
  slayt: { min: 4, max: 8 },
  zemin: KAGIT,
  rotasyon: [],
  bant: {
    tip: 'yok',
    aciklama:
      'Referansta slaytlar bağımsız; bağlayan şey desen dili ve soru ritmi. Olmayan bir ' +
      'sürekliliği iddia etmemek, zayıf bir süreklilik kurmaktan dürüst.',
  },
  gorsel: {
    adet: 'slayt-basina',
    kirpma: 'kesik',
    briefTemeli:
      'arka planı tamamen şeffaf, tek kişi, bel üstü, düz aydınlatma, ' +
      'beyaz zemine oturacak, canlı duruş',
  },
  baslikPayi: 0.82,
  kullanilabilir: GORSEL_KAPALI,
}

/**
 * **Dönen** — `ornek-2`: aynı düzen, her slaytta başka zemin, daire maskeli ürün.
 *
 * ⚠ Rotasyon marka rampasının İÇİNDE. Referans turuncu→kırmızı→yeşil→sarı dönüyor;
 * birebir kopyalamak marka dışına çıkmak olurdu. Kimlik renklerde değil, DÖNMEDE.
 */
export const DONEN: KatalogSablonu = {
  id: 'donen',
  ad: 'Dönen — zemin her slaytta değişiyor, ürün daire maskede',
  kaynak: 'ornek-2',
  slayt: { min: 3, max: 6 },
  zemin: AMBER,
  rotasyon: [AMBER, AMBER_ACIK, KAGIT, AMBER_KOYU],
  bant: {
    tip: 'yok',
    aciklama: 'Süreklilik renk rotasyonunun kendisi: her kart öncekinin devamı gibi okunuyor.',
  },
  gorsel: {
    adet: 'slayt-basina',
    kirpma: 'daire',
    briefTemeli:
      'arka planı tamamen şeffaf, tek ürün, merkezde, yumuşak stüdyo ışığı, ' +
      'daire maskeye oturacak',
  },
  baslikPayi: 0.86,
  kullanilabilir: GORSEL_KAPALI,
}

/**
 * **Editoryal** — `ornek-4`: fotoğraf hâkim, tipografi minik, devasa boşluk.
 *
 * ⚠ Bizimkinin TAM ZIDDI ve o yüzden kataloğun en değerli kaydı: bir katalog ancak
 * kendi zıddını barındırabiliyorsa katalogdur. `baslikPayi: 0.38` tavanın çok altında.
 */
export const EDITORYAL: KatalogSablonu = {
  id: 'editoryal',
  ad: 'Editoryal — tam kaplama fotoğraf, minik zarif tipografi',
  kaynak: 'ornek-4',
  slayt: { min: 3, max: 6 },
  zemin: KAGIT,
  rotasyon: [],
  bant: {
    tip: 'yok',
    aciklama:
      'Süreklilik fotoğrafın kendisinden: tam kaplama görsel kesimi aşarak sonraki ' +
      'slayda devam ediyor. Çizgi ya da desen yok — boşluk ve fotoğraf yetiyor.',
  },
  gorsel: {
    adet: 2,
    kirpma: 'tam',
    briefTemeli:
      'geniş kadraj, tek konu, sakin doğal ışık, sağ yarısı boş kompozisyon ' +
      '(metin oraya oturacak), soğuk ton',
  },
  baslikPayi: 0.38,
  kullanilabilir: GORSEL_KAPALI,
}

/**
 * **Akan alan** — `ornek-5`: iki renk alanı, akan eğri sınır, dev hayalet rakam.
 *
 * ⚠ Bu, FAZ-10 gramerinin kaynağı ve tek görselsiz referans. Panorama modeline
 * taşınınca eğri artık slayt başına değil TÜM panoramaya çiziliyor: eskiden süreklilik
 * ima ediliyordu, şimdi kuruluyor.
 */
export const AKAN_ALAN: KatalogSablonu = {
  id: 'akan-alan',
  ad: 'Akan alan — iki renk alanı, eğri sınır, dev hayalet rakam',
  kaynak: 'ornek-5',
  slayt: { min: 4, max: 8 },
  zemin: AMBER,
  rotasyon: [AMBER, KAGIT],
  bant: {
    tip: 'egri',
    aciklama:
      'Eğri sınır TÜM panoramada tek bir yol: slayt başına çizildiğinde kesim ' +
      'çizgisinde kırılıyordu ve süreklilik ima edilmekten öteye geçmiyordu.',
  },
  gorsel: null,
  baslikPayi: 1,
  kullanilabilir: {
    durum: true,
    sebep: 'Görsel gerektirmiyor; taşıyıcı öge eğri sınır ve hayalet rakam.',
  },
}

export const KATALOG: readonly KatalogSablonu[] = [
  VERI_HIKAYESI,
  AKAN_ALAN,
  SAHNE,
  MEMPHIS,
  DONEN,
  EDITORYAL,
]

/** Bugün gerçekten koşabilen şablonlar. */
export const kullanilabilirSablonlar = (): readonly KatalogSablonu[] =>
  KATALOG.filter((s) => s.kullanilabilir.durum)

export const sablonBul = (id: string): KatalogSablonu | null =>
  KATALOG.find((s) => s.id === id) ?? null
