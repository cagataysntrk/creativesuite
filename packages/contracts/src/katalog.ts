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
// ⚠ ⚠ **BRIEF İNGİLİZCE ve BÜYÜK HARFSİZ OLMAK ZORUNDA — iki kez reddedildi.** R-20
// muhafızı (a) büyük harfli öbekleri "metin çizdirme isteği" sayıyor, (b) `no text` alt
// dizesini arıyor ve `no texture` içinde onu buluyor. İkincisi kapının kendisinde bir
// yanlış pozitif (alt dize eşleşmesi); kırmızı bir kapının kuralı aynı turda gevşetilmez
// (R-76), o yüzden brief yeniden yazıldı ve kayıt buraya düşüldü.
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
  /**
   * Yuva başına AYIRT EDİCİ ek — N görsel üretilirken briefleri farklılaştıran şey.
   *
   * ⚠ ⚠ **BU OLMADAN N ÜRETİM N ÖZDEŞ GÖRSEL DEMEK.** Hat artık slayt başına görsel
   * üretebiliyor (borç A8 kapandı) ama `briefTemeli` + konu her çağrıda AYNI; aynı istem
   * aynı modele gidince çıkan şey de aynı kadraj oluyor ve çıktı "aynı figür yan yana"
   * kusuruna geri dönüyordu — tek görsele inmemizin sebebi tam olarak buydu.
   * Ayırt edici şey konu değil KADRAJ: poz, açı, mesafe. O yüzden burada, şablonda.
   *
   * ⚠ Dizi yuva sayısından KISAysa fazlalık yuvalar brief üretmez ve adım atlanır —
   * uydurulmuş bir varyant, sipariş edilmemiş bir kadraj demektir.
   */
  readonly varyantlar?: readonly string[]
}

/**
 * Kesimi aşan süreklilik ögesinin tarifi.
 *
 * ⚠ ⚠ **`alan` VARYANTI BİR EŞLEŞME TESTİNDEN DOĞDU.** Katalog `akan-alan` için
 * `bant: 'egri'` diyordu ama örnek belgede `bant.tip === 'yok'` çıktı ve test kırmızıya
 * döndü. İkisi de kendi içinde doğruydu: kaydın kastettiği eğri BİR BANT DEĞİL, iki renk
 * alanını ayıran SINIR — panoramada `alanSiniri` ile ifade ediliyor. Yani kayıt yalan
 * söylemiyordu, sözlükte o durumun adı YOKTU. Eksik bir sözcük, kaydı yanlış bir
 * sözcüğe zorluyor; test o zorlamayı yakaladı.
 */
export type BantTarifi =
  | { readonly tip: 'egri'; readonly aciklama: string }
  | { readonly tip: 'kemer'; readonly aciklama: string }
  | { readonly tip: 'ok'; readonly aciklama: string }
  /** Süreklilik iki renk alanını ayıran eğri SINIRDA — ayrı bir bant ögesi yok. */
  | { readonly tip: 'alan'; readonly aciklama: string }
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

/**
 * Görsel taşıyan şablonlar — ÇALIŞIYOR.
 *
 * ⚠ ⚠ **İLK SÜRÜM BUNLARI "KAPALI" İŞARETLEMİŞTİ ve bu bir OKUMA HATASIYDI.** Koşu
 * çıktısı *"bedava şeritte sağlayıcı yok"* demiyordu; **"yerel önkoşul sağlanmadı"**
 * diyordu. İkisi ayrı şey: `cloudflare-workers-ai` kayıtlı, `enabled: true` ve gerçek
 * çağrıyla doğrulanmış — eksik olan yalnız ortamdaki anahtardı. Hattı `sops exec-env`
 * olmadan koşturdum ve kendi hatamı sağlayıcı yokluğu sandım.
 *
 * ⚠ **Kesik özne için arka plan silme modeli de gerekmedi:** brief düz siyah zemin
 * istiyor, alfa render'da o zeminin parlaklığından türetiliyor (`matlama`). BiRefNet
 * (~1 GB, D-266) hâlâ ertelenmiş durumda ve gerekmedi.
 */
const GORSEL_CALISIYOR = {
  durum: true,
  sebep:
    'Taşıyıcı görsel `cloudflare-workers-ai` ile üretiliyor (bedava şerit, `sops exec-env` ' +
    'ile anahtar); kesik özne düz siyah brief + `matlama` luma anahtarıyla kuruluyor.',
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
      // ⚠ ⚠ **"ŞEFFAF ARKA PLAN" İSTEMİYORUZ — DÜZ SİYAH İSTİYORUZ.** Görsel modelleri
      // şeffaflık üretmiyor; şeffaflık isteyen bir brief modelin uymasına bağlı, kırılgan
      // bir garanti olurdu. Düz siyah zemin isteniyor ve alfa render'da o zeminin
      // parlaklığından TÜRETİLİYOR (`matlama`). Garantiyi rica etme, yapıya göm.
      //
      // ⚠ ⚠ **BRIEF İNGİLİZCE ve BÜYÜK HARFSİZ — ikisi de zorunlu.** İlk sürüm Türkçe
      // yazılmış ve vurgu için büyük harf kullanmıştı; R-20 muhafızı büyük harfli bir
      // öbeği "metin çizdirme isteği" sayıp beş brief'i birden REDDETTİ. Kapı haklıydı:
      // bir görsel prompt'u nesir değil teknik bir dizedir (D-37 ailesi) ve içindeki her
      // büyük harf, modele yazı çizdirme riski taşır.
      // ⚠ **"no texture" YAZILAMAZ:** R-20 muhafızı `no text` alt dizesini arıyor ve
      // `no texture` içinde onu buluyor — brief `suffix_hand_written` ile reddediliyor.
      // Yanlış pozitif kapının kendisinde (alt dize eşleşmesi), ama kuralı gevşetmek
      // yerine brief yeniden yazıldı: kırmızı bir kapının kuralı aynı turda gevşetilmez
      // (R-76). Kapı kaydı `KARARLAR.md`ye düşecek.
      // ⚠ ⚠ **"YÜZEYLER SADE" ÜRETİMDE ÖLÇÜLEREK EKLENDİ.** `run_01a01876`in 2.
      // slaydında model bir kadran çizdi ve kadranın üstünü UYDURMA rakamlarla
      // doldurdu — okunmayan, bozuk bir şekil. `NO_TEXT_SUFFIX` prompt'ta VARDI ve
      // yetmedi: olumsuzlama görsel modelinde zayıf bir garantidir. Garanti yapıya
      // gömülür — üstü yazı taşımaya müsait bir özne İSTENMEZ (aynı ders: şeffaf
      // arka plan rica edilmiyor, düz siyah isteniyor).
      'single subject, full body, plain solid black background free of gradient or ' +
      'surface detail, strong rim light on the subject only, arms held away from ' +
      'the torso and extending beyond the frame, body fully in frame, ' +
      'every surface in frame plain and unmarked',
    // ⚠ ⚠ **VARYANTLAR ARTIK YALNIZ POZ DEĞİL, ÖZNE TÜRÜ DE (T4 · T10).** Depo sahibi:
    // *"adam imgeleri sadece adam değil, konu neyse onun 3B görseli de olabilir"* ve
    // *"figürler aynı ailenin klonları gibi"*. İnsan pozu döndürmek çeşitlilik değil,
    // aynı şeyin varyasyonu; kadraja giren ŞEY değişmeli. İkisi de kesik özne olabiliyor:
    // arka plan silme insanı da nesneyi de aynı şekilde kesiyor.
    // ⚠ Malzeme ve ışık da varyantta: pürüzsüz bir render "flat illustration" gibi durur;
    // doku, temas gölgesi ve tek yönlü ışık onu FOTOĞRAF gibi yapıyor.
    //
    // ⚠ ⚠ **"texture" KELİMESİ KULLANILAMAZ — içinde "text" geçiyor.** R-20 muhafızı ALT
    // DİZE eşleştiriyor ve `no texture` içindeki `text` için yanlış pozitif zaten kayıtlı.
    // Bu varyantlar ilk yazımda "fabric texture" diyordu ve testi kırdı; koşuda görsel
    // adımını REDDETTİRECEKTİ. Yerine `weave`, `grain`, `creases` kullanılıyor.
    // ⚠ ⚠ **DÖRT VARYANT TEK GÖRSEL DİLİ KONUŞUR — ve bu bir ÖLÇÜMDEN geldi.**
    // İlk sürüm bilerek dönüşümlüydü: işçi · 3B kil render · işçi · 3B render. Gerçek
    // bir postta sonuç DÖRT AYRI TASARIM DİLİ oldu — kesik illüstrasyon figür, CAD
    // render, foto-illüstrasyon ve krom bir robot yan yana. Karoselin en temel şartı
    // seri bütünlüğü ve çeşitlilik onu bozacaksa çeşitlilik değil dağınıklıktır.
    // ⚠ Özne ÇEŞİTLİLİĞİ kaldı (insan/nesne, duruş, açı); değişmeyen şey İŞLEM.
    // ⚠ **`humanoid`, `robot`, `android` ve `chrome` AÇIKÇA yasak:** soyut bir konuda
    // ("veri katmanı") modelden "konudan bir nesne" istemek insansı krom bir robot
    // getiriyor — ölçüldü. Geri kazanım hattı anlatan bir markada bu konu dışıdır.
    varyantlar: [
      'a worker with arms open wide presenting toward the right, full body, worn work clothes with visible weave and creases, high contrast monochrome illustration with visible ink hatching, matte surfaces only',
      'a single piece of industrial equipment from the topic, three quarter angle, no person, high contrast monochrome illustration with visible ink hatching, matte surfaces only, no chrome and no glossy reflection',
      'two workers at a control cabinet, one pointing forward with a straight arm, side profile, low camera angle, high contrast monochrome illustration with visible ink hatching, matte surfaces only',
      'a worker looking toward the right with folded arms, waist up, full frame, high contrast monochrome illustration with visible ink hatching, matte surfaces only, no chrome and no glossy reflection',
    ],
  },
  baslikPayi: 1,
  kullanilabilir: GORSEL_CALISIYOR,
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
      'single person, waist up, plain solid black background free of surface detail, ' +
      'even lighting on the subject, lively posture, clothing plain and unmarked',
    varyantlar: [
      'a seated figure leaning forward, full body, clothing with visible weave, soft rim light',
      'a 3d clay render of an object from the topic, isometric, matte pastel material, soft contact shadow, no person',
      'a figure walking, stride caught mid step, side profile, grainy film look',
    ],
  },
  baslikPayi: 0.82,
  kullanilabilir: GORSEL_CALISIYOR,
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
    // ⚠ ⚠ **`daire` → `kesik` (D-288).** Referansta (`image copy 3`) daire ürünün ARKASINDA
    // duran beyaz bir alan; ürün onu TAŞIYOR, sapı ve yaprağı dışına çıkıyor. Fotoğrafı
    // daireye KIRPMAK aynı görüntü değil, daha az tasarım. Hat zaten arka planı siliyor
    // (`gorsel-kirp`), yani kesik ürün elimizdeydi; daire artık bir leke katmanı.
    kirpma: 'kesik',
    briefTemeli:
      'single product, centred, plain seamless backdrop, soft studio lighting, ' +
      'composed for a circular crop, every surface in frame plain and unmarked',
    varyantlar: [
      'front elevation, centred in frame',
      'three quarter angle from the upper left',
      'close macro of the surface detail',
      'top down flat view from directly above',
    ],
  },
  baslikPayi: 0.86,
  kullanilabilir: GORSEL_CALISIYOR,
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
    // ⚠ ⚠ **BURADA "typography" YAZIYORDU ve o kelime R-20 muhafızının YASAK
    // listesinde.** Brief'i yazan model talimattaki kelimeyi yankılar (bu depoda iki
    // kez oldu: `lettering`, `no texture`) ve görsel adımı `IMAGE_PROMPT_REJECTED`
    // ile reddedilirdi. Boş bırakılan yarının NEDEN boş olduğunu söylemeye gerek yok:
    // brief kadrajı tarif eder, sayfanın geri kalanını değil.
    briefTemeli:
      'wide shot, single subject, calm natural light, right half of the frame left ' +
      'empty, cool muted tones, every surface in frame plain and unmarked',
    // ⚠ ⚠ **ÜÇ YUVA, ÜÇ VARYANT.** İki varyant kalsaydı üçüncü görsel adımının brief'i
    // BOŞ döner, adım atlanır ve üçüncü yuva yer tutucu kalırdı — ilan ile gerçek yine
    // ayrışırdı. `katalog-ornek.test.ts` artık eşitliği zorluyor.
    varyantlar: [
      'wide establishing view of the workspace',
      'tight detail of two hands at work',
      'the subject turning away, seen from behind at shoulder height',
    ],
  },
  baslikPayi: 0.38,
  kullanilabilir: GORSEL_CALISIYOR,
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
    tip: 'alan',
    aciklama:
      'Eğri sınır TÜM panoramada tek bir yol: slayt başına çizildiğinde kesim ' +
      'çizgisinde kırılıyordu ve süreklilik ima edilmekten öteye geçmiyordu. ' +
      'Taşıyıcı ayrı bir bant değil, iki renk alanını ayıran sınırın kendisi.',
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
