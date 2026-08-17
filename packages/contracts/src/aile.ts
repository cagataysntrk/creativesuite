// HEDEF: packages/contracts/src/aile.ts
//
// Kompozisyon ailesi — kapalı GARANTİ, açık AİLE (FAZ-12.7 · §7.1 · D-254).
//
// *"Tek çeşidi yok, binlerce çeşidi var."* D-254 kapalı bir düzen enum'u kurdu ve bu
// doğruydu — ama kapalı olan **garanti katmanı**, açık olan **estetik katman**.
//
// ⚠ ⚠ **AİLE GÜVENLİĞİ GEVŞETEMEZ — ve bu tip sistemiyle zorlanıyor.** Güvenli alan,
// kontrast eşiği, chroma tavanı, kelime bütçesi ve `column_in_band` değişmezi bu arayüzde
// YOK. Alan yoksa aile onu söyleyemez; "yeni aile" her kısıtı delmenin yolu olamaz.
// Bir kural yalnız `KURALLAR.md`'de değişir (R-74), bir veri dosyasında değil.
//
// ⚠ Aile ESTETİK seçer: hangi süsleme yoğunluğu, hangi tipografi efekti, degrade açık mı,
// yuva hangi biçimde. Hepsi bu oturumda ölçülerek "bu ailede kapalı" diye işaretlenen
// şeyler (D-262 ailesi) — kapatma kararları artık bir yerde yaşıyor.

import type { Iskelet } from './iskelet.js'

/** Aile kimliği. Kapalı DEĞİL: ikincisi bir veri satırı, bir `case` değil. */
export type AileKimligi = string

/**
 * Alan şeması — kimliğin RENK ayağı.
 *
 * ⚠ ⚠ **Zemin renkleri ailenin, metin ve motif renkleri DEĞİL.** Metin `kontrast(zemin)`
 * ile TÜRETİLİYOR; aile onu seçemiyor. Seçebilseydi bir aile okunmaz bir çift yazabilir
 * ve garanti katmanı estetik katmana inerdi (FAZ-12.7'nin bütün mesele bu). Aile kötü bir
 * zemin seçerse kontrast metriği yakalar — kural gevşemez, yalnız yer değiştirir.
 *
 * ⚠ Değerler RAMPA token'ı ya da rol token'ı; serbest renk YOK (§12.1 chroma tavanı).
 */
export interface AlanSemasi {
  /** Gövde zeminleri, slayt sırasına göre DÖNÜYOR. En az bir üye. */
  readonly zeminler: readonly string[]
  /** Kapanış zemini — `null` ise döngüden alınır. Dizinin bittiği yer görsel olarak da bitmeli. */
  readonly kapanisZemini: string | null
  /**
   * İki alan mı — `false` ise sınır YOK, tuval tek renk.
   *
   * ⚠ Beş referansın üçünde tek alan var (Memphis, gece, editoryal): iki alan bir aile
   * kimliği, bir zorunluluk değil. `sablon.ts` bunu varsayıyordu.
   */
  readonly ikiAlan: boolean
}

/**
 * Yerleşim — kimliğin ÜÇÜNCÜ ayağı (renk ve süslemeden sonra).
 *
 * ⚠ ⚠ **Bu eksen olmadan yedi aile yedi VARYANT çıktı.** İlk render'da renk ve süsleme
 * ayrıldı ama metin sütunu yedisinde de aynı yerde, aynı payla, aynı hizada duruyordu —
 * yani ızgaraya bakınca "aynı tasarımın yedi boyası" görünüyordu. Bir aileyi aileden
 * ayıran şey rengi değil, **nereye ne koyduğu.**
 */
export interface Yerlesim {
  /**
   * Metin sütununun yatay yeri.
   * `sinir` — sınıra yaslı (iki alanlı ailenin doğal hâli) ·
   * `orta` — tuvalin ortasında · `kenar` — kenara sertçe yaslı.
   */
  readonly kolon: 'sinir' | 'orta' | 'kenar'
  /** Kenar payı çarpanı. Editoryal aile 2,2 ile nefes alır; poster 0,8 ile sıkışır. */
  readonly payPayi: number
  /** Dikey hiza — gövde slaytlarında. Kapak her zaman alta yaslı (gramerin kuralı). */
  readonly dikey: 'orta' | 'alt' | 'ust'
}

/** Alanları ayıran sınırın biçimi. */
export const SINIR_BICIMLERI = ['egri', 'kosegen', 'yok'] as const
export type SinirBicimi = (typeof SINIR_BICIMLERI)[number]

/** Hayalet rakamın biçimi. `yok` gerçek bir seçim: referansların dördünde rakam yok. */
export const HAYALET_BICIMLERI = ['kontur', 'yok'] as const
export type HayaletBicimi = (typeof HAYALET_BICIMLERI)[number]

/**
 * Bir ailenin estetik parametreleri.
 *
 * ⚠ Her alan bu oturumda BAKARAK verilmiş bir kararın karşılığı. Değerler ailenin;
 * kararın gerekçesi kodda, ait olduğu modülün yorumunda.
 */
export interface AileProfili {
  readonly id: AileKimligi
  /** İnsan okunur ad — plan gerekçesinde geçiyor. */
  readonly ad: string
  /** Süsleme yoğunluğu 0–1 (D-262). Açık kâğıt alanda seyrek, koyu zeminde yoğun. */
  readonly suslemeYogunlugu: number
  /** Vinyet gücü 0 = kapalı. Düz alanlı ailede 0.1 bile alanı çamurlaştırıyor (ölçüldü). */
  readonly vinyetGucu: number
  /** Degrade yüzeyleri açık mı. Düz alan bu ailenin tasarımının kendisi. */
  readonly degrade: boolean
  /** Fotoğraf yuvasının biçimi. */
  readonly yuvaBicimi: 'alan' | 'maske'
  /** Zemin/dolgu şeması — kimliğin renk ayağı. */
  readonly alan: AlanSemasi
  /** Alan sınırının biçimi. `ikiAlan: false` ise anlamsız ve `yok` olmalı. */
  readonly sinir: SinirBicimi
  /** Dev hayalet rakam — var mı, ve tuval genişliğinin yüzdesi kaç. */
  readonly hayalet: { readonly bicim: HayaletBicimi; readonly olcekYuzde: number }
  /**
   * Başlık puntosunun ÖLÇÜLEN tavana oranı (0–1].
   *
   * ⚠ Tavanın kendisi ailenin DEĞİL: `baslikTavaniPx` en uzun Türkçe kelimenin sütuna
   * sığdığı en büyük değer (R-23) ve bir garanti. Aile yalnız o tavanın ALTINDA kalmayı
   * seçebilir — editoryal aile 0,38 ile minik tipografi yapar, poster ailesi 1,0 ile
   * tavana dayanır. Tavanı AŞMAK temsil edilemez.
   */
  readonly tipoPayi: number
  /** Kullanılabilir süsleme tipleri — kapalı dağarcıktan alt küme. */
  readonly suslemeTipleri: readonly (
    'blob' | 'nokta' | 'tarama' | 'halka' | 'kare' | 'yay' | 'cizgi'
  )[]
  /** Yerleşim — kimliğin üçüncü ayağı. */
  readonly yerlesim: Yerlesim
  /**
   * Kompozisyon iskeleti — TASARIMIN KENDİSİ.
   *
   * ⚠ ⚠ Renk, süsleme ve tipografi ölçeği bir şablonu tarif etmeye YETMİYOR; yedi aile
   * bunlarla tanımlandığında ızgarada tek tasarımın yedi boyası göründü. Bir şablonu
   * şablon yapan şey çizgileri, açıları, bölmeleri ve hangi ögenin nerede durduğudur.
   */
  readonly iskelet: Iskelet
  /** Panoramik süreklilik açık mı (FAZ-12.4). */
  readonly panorama: boolean
  /** Ritim oranları — yay bütçelerinin ölçülen tabana göre payı (FAZ-14.1). */
  readonly ritim: { readonly gerilim: number; readonly donus: number }
  /** Açık tipografi efektleri — kapalı dağarcıktan alt küme (FAZ-12.1). */
  readonly tipoEfektleri: readonly ('vurgu' | 'kontur' | 'degrade' | 'golge' | 'knockout')[]
  /**
   * Fotoğraf yuvasına uygulanan raster işlemler — kapalı dağarcık (FAZ-12.2).
   *
   * ⚠ Dağarcığın kendisi `packages/render`de; burada kümenin İKİZİ duruyor çünkü ring 0
   * render'a bağımlı olamaz. İkizin ayrışması DERLEME hatası veriyor: `gorsel-islem.ts`
   * iki kümenin karşılıklı atanabilirliğini tip düzeyinde sınıyor. `tipoEfektleri`de bu
   * sınav YOKTU ve iki liste sessizce ayrışabilirdi — aynı hata iki kez yapılmadı.
   */
  readonly gorselIslemleri: readonly ('matlama' | 'keskinlik' | 'duotone')[]
}

// ── Rampa kısayolları ────────────────────────────────────────────────────────
//
// ⚠ Hepsi TOKEN. Serbest renk yazmak §12.1 chroma tavanını atlatmanın yolu olurdu;
// token yazmak onu kurguyla korur (FAZ-12.9'un degrade duraklarıyla aynı ilke).
const AMBER = 'var(--role-bg)'
const KAGIT = 'var(--role-surface)'
const MUREKKEP = 'var(--role-line-edge)'
const AMBER_ACIK = 'var(--ramp-marka-amber-200)'
const AMBER_KOYU = 'var(--ramp-marka-amber-600)'

/**
 * Bugünkü tek aile: amber ↔ mürekkep iki alan, akan eğri, dev hayalet rakam.
 *
 * Parametreleri uydurulmadı — hepsi bu oturumda ölçülerek ya da bakarak seçildi:
 * süsleme 0.25 (yoğun tarama kâğıt alanda kalabalıktı), vinyet 0 (0.1'de amber 215→229
 * arası değişiyordu, düz olması gereken alan degradeye dönüyordu), degrade kapalı (aynı
 * sebep), gölge/degrade/knockout kapalı (referansların dördü de düz tipografi; knockout'un
 * çözdüğü sorun bu ailede yok — metin eğri sınırını hiç geçmiyor).
 */
export const TEMEL_AILE: AileProfili = {
  id: 'temel',
  ad: 'Temel — amber/mürekkep, akan eğri, hayalet rakam',
  suslemeYogunlugu: 0.25,
  vinyetGucu: 0,
  degrade: false,
  yuvaBicimi: 'alan',
  panorama: false,
  ritim: { gerilim: 0.7, donus: 0.6 },
  tipoEfektleri: ['vurgu', 'kontur'],
  // ⚠ Keskinlik SÜS DEĞİL DÜZELTME: model 1024² üretiyor, karosel 1080² istiyor ve
  // `cover` büyütürken yumuşatıyor. Duotone renk tutarlılığını YAPISAL kılıyor.
  gorselIslemleri: ['keskinlik', 'duotone'],
  alan: { zeminler: [AMBER, KAGIT], kapanisZemini: MUREKKEP, ikiAlan: true },
  sinir: 'egri',
  hayalet: { bicim: 'kontur', olcekYuzde: 52 },
  tipoPayi: 1,
  suslemeTipleri: ['nokta', 'halka', 'kare', 'yay'],
  yerlesim: { kolon: 'sinir', payPayi: 1, dikey: 'orta' },
  iskelet: {
    metin: { x: 0, y: 0, genislik: 62, yukseklik: 100 },
    rakam: { x: 62, y: 55, genislik: 46, yukseklik: 42 },
    gorsel: { x: 0, y: 40, genislik: 62, yukseklik: 40 },
    susleme: { x: 66, y: 14, genislik: 30, yukseklik: 34 },
    cizgi: { tip: 'egri', merkez: 73, genlik: 5 },
    tipo: { baslikPayi: 1, govdeOrani: 0.53, satirAraligi: 1.1 },
  },
}

/**
 * Kayıtlı aileler. **Veri, kod değil** — ikinci aile buraya bir satır.
 *
 * ⚠ Şu an TEK aile var ve bu dürüst hâl: ikinci aileyi bir referans örnek talep etmeden
 * yazmak, kullanıcısı olmayan çeşitlilik üretmek olurdu. `docs/referans/ornekler/`
 * beş ayrı aile gösteriyor; ikincisi (editoryal, örnek 4) FAZ-13'ten sonra ölçülerek açılır.
 */
/**
 * Akıcı aile — referans örnek 1'in dili: yön veren çizim slaytlar arasında akıyor.
 *
 * ⚠ **Bu aile bir KANITTAN doğdu, bir istekten değil.** Panorama, degrade ve yoğun
 * süsleme üç ayrı adımda uygulandı ve üçü de `temel` ailede BAKARAK kapatıldı — çünkü
 * o ailenin alanı düz ve düzlüğü tasarımın kendisi. Üç "kapalı yetenek" biriktiğinde
 * ortaya çıkan şey eksik bir aile değil, İKİNCİ bir ailedir. `docs/referans/ornekler/`
 * beşini birden gösteriyor; bu, ornek-1'in karşılığı.
 *
 * ⚠ Garanti katmanı burada da yok: aile yalnız estetik seçiyor.
 */
export const AKICI_AILE: AileProfili = {
  id: 'akici',
  ad: 'Akıcı — yön veren çizim slaytlar arasında akıyor',
  suslemeYogunlugu: 0.55,
  vinyetGucu: 0,
  // ⚠ **AÇIK — ve açılma sebebi ölçüm, tercih değil.** Dolgu alanı 233,182,36'dan
  // 220,167,16'ya iniyor: derinlik okunuyor, alan çamurlaşmıyor. Kâğıt alan bu
  // ailede de DÜZ kalıyor çünkü rampada ikinci bir kâğıt durağı yok — karar rampanın.
  degrade: true,
  yuvaBicimi: 'alan',
  panorama: true,
  ritim: { gerilim: 0.75, donus: 0.55 },
  tipoEfektleri: ['vurgu', 'kontur'],
  gorselIslemleri: ['keskinlik', 'duotone'],
  alan: { zeminler: [AMBER, KAGIT], kapanisZemini: MUREKKEP, ikiAlan: true },
  sinir: 'egri',
  hayalet: { bicim: 'kontur', olcekYuzde: 52 },
  tipoPayi: 1,
  suslemeTipleri: ['blob', 'nokta', 'tarama', 'halka', 'kare', 'yay'],
  yerlesim: { kolon: 'sinir', payPayi: 1, dikey: 'orta' },
  iskelet: {
    metin: { x: 0, y: 0, genislik: 62, yukseklik: 100 },
    rakam: { x: 62, y: 55, genislik: 46, yukseklik: 42 },
    gorsel: { x: 0, y: 40, genislik: 62, yukseklik: 40 },
    susleme: { x: 64, y: 10, genislik: 34, yukseklik: 60 },
    cizgi: { tip: 'egri', merkez: 73, genlik: 5 },
    tipo: { baslikPayi: 1, govdeOrani: 0.53, satirAraligi: 1.1 },
  },
}

/**
 * **Memphis** — beyaz zemin, süsleme dili taşıyor (referans örnek 3).
 *
 * ⚠ **TEK ALAN ve bu kimliğin kendisi:** renk sınırı yok, tuvali taşıyan şey geometrik
 * ögelerin yoğunluğu. `sablon.ts` iki alanı VARSAYIYORDU; beş referansın üçünde yok.
 * ⚠ Hayalet rakam YOK: dev rakam `temel`in imzası, burada süsleme onun yerini alıyor.
 */
export const MEMPHIS_AILE: AileProfili = {
  id: 'memphis',
  ad: 'Memphis — beyaz zemin, geometrik süsleme dili',
  suslemeYogunlugu: 0.85,
  vinyetGucu: 0,
  degrade: false,
  yuvaBicimi: 'maske',
  panorama: false,
  ritim: { gerilim: 0.7, donus: 0.6 },
  tipoEfektleri: ['vurgu'],
  gorselIslemleri: ['keskinlik', 'duotone'],
  alan: { zeminler: [KAGIT], kapanisZemini: AMBER, ikiAlan: false },
  sinir: 'yok',
  hayalet: { bicim: 'yok', olcekYuzde: 0 },
  tipoPayi: 0.82,
  suslemeTipleri: ['blob', 'nokta', 'tarama', 'halka', 'kare'],
  yerlesim: { kolon: 'orta', payPayi: 1.15, dikey: 'orta' },
  iskelet: {
    // Metin ORTADA ve DAR: süsleme tuvali çevreliyor, metin bir ada.
    metin: { x: 24, y: 46, genislik: 52, yukseklik: 42 },
    rakam: null,
    gorsel: { x: 30, y: 8, genislik: 40, yukseklik: 32 },
    susleme: { x: 2, y: 2, genislik: 96, yukseklik: 96 },
    cizgi: { tip: 'yok' },
    tipo: { baslikPayi: 0.82, govdeOrani: 0.6, satirAraligi: 1.25 },
  },
}

/**
 * **Gece** — koyu zemin, tek amber aksan, slaytlar arasında akan yön (referans örnek 1).
 *
 * ⚠ Vinyet burada AÇIK: `temel`de 0.1 bile düz amber alanı çamurlaştırıyordu (ölçüldü),
 * ama koyu zeminde vinyet tam da aradığı işi yapıyor — okuma yönlendirmesi. **Aynı
 * parametre, farklı ailede farklı doğru.** D-262'nin en net örneği.
 */
export const GECE_AILE: AileProfili = {
  id: 'gece',
  ad: 'Gece — mürekkep zemin, amber aksan, akan yön',
  suslemeYogunlugu: 0.5,
  vinyetGucu: 0.18,
  degrade: false,
  yuvaBicimi: 'maske',
  panorama: true,
  ritim: { gerilim: 0.8, donus: 0.5 },
  tipoEfektleri: ['vurgu', 'kontur'],
  gorselIslemleri: ['keskinlik', 'duotone'],
  alan: { zeminler: [MUREKKEP], kapanisZemini: AMBER, ikiAlan: false },
  sinir: 'yok',
  hayalet: { bicim: 'kontur', olcekYuzde: 46 },
  tipoPayi: 0.95,
  suslemeTipleri: ['yay', 'halka'],
  yerlesim: { kolon: 'kenar', payPayi: 1.1, dikey: 'alt' },
  iskelet: {
    // Metin SOL ALTTA bir blok; dev rakam sağda tuvalin yarısını tutuyor.
    metin: { x: 7, y: 52, genislik: 46, yukseklik: 38 },
    rakam: { x: 52, y: 14, genislik: 50, yukseklik: 62 },
    gorsel: { x: 52, y: 12, genislik: 46, yukseklik: 44 },
    susleme: { x: 60, y: 60, genislik: 38, yukseklik: 34 },
    cizgi: { tip: 'yok' },
    tipo: { baslikPayi: 0.95, govdeOrani: 0.45, satirAraligi: 1.05 },
  },
}

/**
 * **Dönen** — aynı düzen, her slaytta başka zemin (referans örnek 2).
 *
 * ⚠ Rotasyon marka rampasının İÇİNDE: amber-500 → amber-200 → kâğıt → amber-600.
 * Referans turuncu/kırmızı/yeşil/sarı dönüyor; onu birebir kopyalamak marka dışına
 * çıkmak olurdu. **Kimliği taşıyan şey renklerin kendisi değil, DÖNMESİ.**
 */
export const DONEN_AILE: AileProfili = {
  id: 'donen',
  ad: 'Dönen — zemin her slaytta değişiyor, ürün daire maskede',
  suslemeYogunlugu: 0.35,
  vinyetGucu: 0,
  degrade: false,
  yuvaBicimi: 'maske',
  panorama: false,
  ritim: { gerilim: 0.7, donus: 0.65 },
  tipoEfektleri: ['vurgu'],
  gorselIslemleri: ['keskinlik', 'duotone'],
  alan: {
    zeminler: [AMBER, AMBER_ACIK, KAGIT, AMBER_KOYU],
    kapanisZemini: MUREKKEP,
    ikiAlan: false,
  },
  sinir: 'yok',
  hayalet: { bicim: 'yok', olcekYuzde: 0 },
  tipoPayi: 0.86,
  suslemeTipleri: ['halka', 'blob'],
  yerlesim: { kolon: 'orta', payPayi: 1.3, dikey: 'orta' },
  iskelet: {
    // Metin ÜST BANT, tam genişlik; görsel altta ORTADA daire.
    metin: { x: 10, y: 12, genislik: 80, yukseklik: 26 },
    rakam: null,
    gorsel: { x: 28, y: 42, genislik: 44, yukseklik: 44 },
    susleme: { x: 4, y: 4, genislik: 92, yukseklik: 92 },
    cizgi: { tip: 'yok' },
    tipo: { baslikPayi: 0.86, govdeOrani: 0.58, satirAraligi: 1.2 },
  },
}

/**
 * **Editoryal** — neredeyse boş, minik tipografi (referans örnek 4).
 *
 * ⚠ ⚠ **Bizimkinin TAM ZIDDI ve bu yüzden en değerli sınav.** `tipoPayi: 0.38` tavanın
 * çok altında: aile tavanı AŞAMAZ ama altında kalmayı seçebilir. Süsleme YOK, hayalet
 * YOK, sınır YOK — kimliği taşıyan tek şey BOŞLUK. Bir ailenin "hiçbir şey eklememeyi"
 * seçebilmesi, aile katmanının gerçekten açık olduğunun kanıtı.
 */
export const EDITORYAL_AILE: AileProfili = {
  id: 'editoryal',
  ad: 'Editoryal — devasa boşluk, minik zarif tipografi',
  suslemeYogunlugu: 0,
  vinyetGucu: 0,
  degrade: false,
  yuvaBicimi: 'alan',
  panorama: false,
  ritim: { gerilim: 0.5, donus: 0.45 },
  tipoEfektleri: [],
  gorselIslemleri: ['keskinlik', 'duotone'],
  alan: { zeminler: [KAGIT], kapanisZemini: null, ikiAlan: false },
  sinir: 'yok',
  hayalet: { bicim: 'yok', olcekYuzde: 0 },
  tipoPayi: 0.38,
  suslemeTipleri: [],
  yerlesim: { kolon: 'kenar', payPayi: 2.2, dikey: 'ust' },
  iskelet: {
    // Metin MİNİK ve ÜST SOLDA; görsel sağ yarıyı tam kaplıyor. Boşluk baskın öge.
    metin: { x: 9, y: 13, genislik: 33, yukseklik: 34 },
    rakam: null,
    gorsel: { x: 52, y: 0, genislik: 48, yukseklik: 100 },
    susleme: { x: 0, y: 0, genislik: 1, yukseklik: 1 },
    cizgi: { tip: 'yok' },
    tipo: { baslikPayi: 0.38, govdeOrani: 0.86, satirAraligi: 1.55 },
  },
}

// ── Referansta OLMAYAN iki aile ─────────────────────────────────────────────
//
// ⚠ Beşi referanstan ölçüldü; bu ikisi ölçümden değil KARARDAN doğuyor. İkisi de
// referansların hiçbirinin yapmadığı bir şeyi yapıyor — yoksa altıncı ve yedinci aile
// değil, birincinin varyantı olurlardı (çeşitlilik parmak izinin tam olarak yakaladığı şey).

/**
 * **Kesit** — sert köşegen kesik, poster dili.
 *
 * **Referansların hiçbirinde YOK:** beşinde sınır ya yumuşak bir eğri ya da hiç yok.
 * Sert bir köşegen, gözü tek bir yöne fırlatan en güçlü kompozisyon aracı ve bir posterin
 * imzasıdır. Mürekkep ↔ amber, kâğıt YOK: iki uç, ara ton yok.
 *
 * ⚠ `tipoPayi: 1` — tavana dayanıyor. Editoryal ailenin 0,38'iyle yan yana konduğunda
 * ikisi arasındaki fark bir renk farkı değil, bir SES farkı.
 * ⚠ Hayalet rakam kontur ve BÜYÜK (%62): köşegenin karşı yönünde bir denge ağırlığı.
 */
export const KESIT_AILE: AileProfili = {
  id: 'kesit',
  ad: 'Kesit — sert köşegen, mürekkep ↔ amber, poster sesi',
  suslemeYogunlugu: 0.2,
  vinyetGucu: 0,
  degrade: true,
  yuvaBicimi: 'alan',
  panorama: false,
  ritim: { gerilim: 0.85, donus: 0.5 },
  tipoEfektleri: ['vurgu', 'kontur'],
  gorselIslemleri: ['keskinlik', 'duotone'],
  alan: { zeminler: [MUREKKEP, AMBER], kapanisZemini: MUREKKEP, ikiAlan: true },
  sinir: 'kosegen',
  hayalet: { bicim: 'kontur', olcekYuzde: 62 },
  tipoPayi: 1,
  suslemeTipleri: ['kare'],
  yerlesim: { kolon: 'kenar', payPayi: 0.85, dikey: 'alt' },
  iskelet: {
    // Sert köşegen; metin SOL ALTA yaslı, rakam köşegenin karşı ucunda denge ağırlığı.
    // ⚠ Metin köşegen bandının (38–66) DIŞINDA: doğrulayıcı ilk sürümde kesişme buldu.
    // Bant içinde kalan bir satırın kontrastı satır ortasında değişirdi.
    metin: { x: 5, y: 56, genislik: 31, yukseklik: 34 },
    rakam: { x: 56, y: 6, genislik: 44, yukseklik: 46 },
    gorsel: { x: 54, y: 52, genislik: 44, yukseklik: 42 },
    susleme: { x: 58, y: 60, genislik: 36, yukseklik: 32 },
    cizgi: { tip: 'kosegen', merkez: 52, egim: 14 },
    tipo: { baslikPayi: 1, govdeOrani: 0.42, satirAraligi: 1 },
  },
}

/**
 * **Izgara** — görünür modüler ızgara, kılcal çizgiler, sessiz otorite.
 *
 * **Referansların hiçbirinde YOK:** beşi de ızgarayı GİZLİYOR. Burada ızgara görünür bir
 * ögedir — kılcal çizgiler tuvali böler, metin onlara oturur. İsviçre tipografisinin
 * kendi aracını göstererek konuşması.
 *
 * ⚠ Amber tek bir yerde: sayaç ve tek bir aksan çizgisi. Bir rengi AZ kullanmak, çok
 * kullanmaktan zor ve daha güçlü — `donen` ailesiyle karşıtlığı bu.
 * ⚠ `tipoPayi: 0.72` orta ses: ne poster ne fısıltı. Yedi ailenin ölçek dağılımı
 * 0,38 → 1,0 arasında ve bu bir yelpaze, üç değer değil.
 */
export const IZGARA_AILE: AileProfili = {
  id: 'izgara',
  ad: 'Izgara — görünür kılcal ızgara, tek amber aksan',
  suslemeYogunlugu: 0.28,
  vinyetGucu: 0,
  degrade: false,
  yuvaBicimi: 'alan',
  panorama: false,
  ritim: { gerilim: 0.65, donus: 0.6 },
  tipoEfektleri: ['vurgu'],
  gorselIslemleri: ['keskinlik', 'duotone'],
  alan: { zeminler: [KAGIT], kapanisZemini: MUREKKEP, ikiAlan: false },
  sinir: 'yok',
  hayalet: { bicim: 'yok', olcekYuzde: 0 },
  tipoPayi: 0.72,
  suslemeTipleri: ['cizgi', 'kare'],
  yerlesim: { kolon: 'orta', payPayi: 1.25, dikey: 'ust' },
  iskelet: {
    // Görünür kılcal ızgara; metin İKİNCİ sütuna oturuyor — ızgaradan kaçmıyor, ona yaslanıyor.
    metin: { x: 35, y: 24, genislik: 30, yukseklik: 54 },
    rakam: null,
    gorsel: { x: 67, y: 20, genislik: 29, yukseklik: 30 },
    susleme: { x: 0, y: 0, genislik: 100, yukseklik: 100 },
    cizgi: { tip: 'izgara', yatay: [18, 50, 82], dikey: [33, 66] },
    tipo: { baslikPayi: 0.72, govdeOrani: 0.62, satirAraligi: 1.35 },
  },
}

export const AILELER: readonly AileProfili[] = [
  TEMEL_AILE,
  AKICI_AILE,
  MEMPHIS_AILE,
  GECE_AILE,
  DONEN_AILE,
  EDITORYAL_AILE,
  KESIT_AILE,
  IZGARA_AILE,
]

export const aileBul = (id: AileKimligi): AileProfili | null =>
  AILELER.find((a) => a.id === id) ?? null

/** Bir ailenin garanti katmanına dokunup dokunmadığı — kusur listesi. */
export interface AileKusuru {
  readonly alan: string
  readonly sebep: 'gecersiz-aralik' | 'bilinmeyen-efekt' | 'bos-ad'
}

const ARALIKTA = (v: number): boolean => v >= 0 && v <= 1

/**
 * Aileyi doğrular.
 *
 * ⚠ **Burada kontrast eşiği ya da güvenli alan DENETLENMİYOR — çünkü aile onları
 * TAŞIMIYOR.** Denetlenecek bir alan yoksa gevşetilecek bir kural da yok: garanti
 * katmanının korunması bir kontrolle değil, YOKLUKLA sağlanıyor. En ucuz zorlama budur.
 */
export const aileKusurlari = (a: AileProfili): readonly AileKusuru[] => {
  const k: AileKusuru[] = []
  if (a.ad.trim() === '') k.push({ alan: 'ad', sebep: 'bos-ad' })
  if (!ARALIKTA(a.suslemeYogunlugu)) k.push({ alan: 'suslemeYogunlugu', sebep: 'gecersiz-aralik' })
  if (!ARALIKTA(a.vinyetGucu)) k.push({ alan: 'vinyetGucu', sebep: 'gecersiz-aralik' })
  if (!ARALIKTA(a.ritim.gerilim) || !ARALIKTA(a.ritim.donus))
    k.push({ alan: 'ritim', sebep: 'gecersiz-aralik' })
  return k
}
