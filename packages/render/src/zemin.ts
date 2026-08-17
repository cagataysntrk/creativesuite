// HEDEF: packages/render/src/zemin.ts
//
// Zemin reçetesi — arka plan bir TOKEN değil, KATMANLAR (FAZ-15.3 · §12.1 · D-269).
//
// ⚠ ⚠ **BU DOSYA BİR KALİTE ŞİKÂYETİNDEN DOĞDU.** Altı şablonun altısı da zeminini tek bir
// `var(--role-*)` dolgusuyla boyuyordu: düz amber, düz kâğıt, düz mürekkep. Referans
// karosellerde zemin hiçbir zaman düz değil — ışık bir yerden geliyor, bir tarama dokusu
// ritim tutuyor, kenarlar hafifçe koyulaşıyor. **Düz dolgu "sade" değil, YAPILMAMIŞ
// görünüyor.** Reçete o farkı ifade edilebilir kılıyor.
//
// ⚠ ⚠ **DURAKLAR YALNIZ RAMPA TOKEN'I — serbest renk TEMSİL EDİLEMİYOR.** `sablon-degrade.ts`
// bu ilkeyi SVG tarafında kurmuştu: chroma tavanı ayrı bir ölçümle değil, KURGUYLA
// korunuyor. Aynı ilke burada da geçerli; `#ff00aa` yazmanın yolu yok, çünkü tip yok.
// İkinci bir doğruluk kaynağı (ölçüm) açmıyoruz.
//
// ⚠ ⚠ **CSS ÜRETİCİSİ ARTIK YAZILIYOR ve bu bir öncül değişimi.** `sablon-degrade.ts`
// *"CSS karşılığı YAZILMADI ve bu bir karar… kullanıcısı doğduğunda yazılır"* diyordu.
// Kullanıcısı doğdu: panorama zemini bir SVG `<path>` değil, `#sahne`in arka planı.
// İki ÜRETİCİ değil iki HEDEF var — SVG dolgusu `<path>` için, bu CSS katmanları için.
// R-05 riski (iki tanım, biri eskir) yok: paylaşılan şey `RampaTokeni` tipinin kendisi.

import type { RampaTokeni } from './sablon-degrade.js'

/** Degrade durağı — konum yüzde, opaklık isteğe bağlı. */
export interface Durak {
  readonly renk: RampaTokeni
  readonly konum: number
  /** 0–100. Verilmezse tam opak. */
  readonly opaklik?: number
}

/**
 * Bir zemin katmanı. **Kapalı dağarcık** — altıncı bir tip bir KARAR ister, bir `case`
 * değil (`gorsel-islem.ts` ve `IKONLAR` ile aynı disiplin).
 */
export type ZeminKatmani =
  | {
      /** Doğrusal degrade — açı derece, 0 = yukarı. */
      readonly tip: 'dogrusal'
      readonly aci: number
      readonly duraklar: readonly Durak[]
    }
  | {
      /**
       * Işık odağı — eliptik radyal degrade.
       *
       * ⚠ Referanslarda zemini "yapılmış" gösteren şey buydu: ışık BİR YERDEN geliyor.
       * Merkezi ortada olan bir odak fark edilmiyor; asimetri gerekiyor.
       */
      readonly tip: 'isik'
      readonly x: number
      readonly y: number
      readonly capX: number
      readonly capY: number
      readonly renk: RampaTokeni
      /** Odak merkezindeki opaklık, 0–100. */
      readonly guc: number
    }
  | {
      /**
       * Tarama — tekrarlayan ince çizgi dokusu.
       *
       * ⚠ Panorama KOORDİNATINDA tekrarlıyor, slayt koordinatında değil: aralık kesim
       * çizgisinde sıfırlansaydı her slaytta yeni baştan başlar ve kesintisizlik
       * ritim düzeyinde kırılırdı.
       */
      readonly tip: 'tarama'
      readonly aci: number
      /** Çizgi merkezleri arası, px. */
      readonly aralik: number
      readonly kalinlik: number
      readonly renk: RampaTokeni
      readonly guc: number
    }
  | {
      /**
       * Kenar vinyeti — köşeleri koyulaştıran elips.
       *
       * ⚠ Panoramanın TAMAMINA uygulanıyor: slayt başına vinyet, her kesimde bir
       * karartma halkası demek olurdu ve dilimler ayrı ayrı çekilmiş gibi görünürdü.
       */
      readonly tip: 'vinyet'
      readonly guc: number
    }

/**
 * Zemin reçetesi.
 *
 * ⚠ ⚠ **GREN REÇETEDE YOK ve bu KASITLI.** `sablon-degrade.ts`in kaydı net: *"8-bit
 * bantlaşma gerçek bir kusur… gren katmanı bunu gizliyor — süs değil DÜZELTME. Degrade
 * açıksa gren de açık."* Gren bir alan olsaydı bir şablon degradeyi açıp greni kapatabilir
 * ve 1080 px'de şeritlenen bir zemin üretebilirdi. Burada karar reçetenin elinde değil:
 * `zeminCss` degrade gördüğü an greni KENDİ ekliyor. Kapatmanın yolu yok, çünkü alan yok.
 */
export interface ZeminResetesi {
  /** Taban dolgu — katmanların altında kalan renk. */
  readonly taban: RampaTokeni
  readonly katmanlar: readonly ZeminKatmani[]
}

const yuzde = (n: number): number => Math.max(0, Math.min(100, n))

/** `var(--ramp-x)` ya da yüzdeli hâli — opaklık verilmişse `color-mix`. */
const renk = (t: RampaTokeni, opaklik?: number): string =>
  opaklik === undefined || opaklik >= 100
    ? `var(${t})`
    : `color-mix(in oklab, var(${t}) ${yuzde(opaklik)}%, transparent)`

/**
 * Gren dokusu — `feTurbulence` bir veri URI'sinde.
 *
 * ⚠ ⚠ **DETERMİNİZM (R-06) BURADA BEDAVA DEĞİL, KONTROL EDİLDİ.** `feTurbulence`in
 * varsayılan `seed`i 0 ve SVG spesifikasyonu üreteci tam olarak tanımlıyor: aynı seed,
 * aynı frekans, aynı piksel. Yani `Math.random` yasağı (R-06) delinmiyor — gürültü
 * rastgele DEĞİL, yalnız rastgele GÖRÜNÜYOR. Seed açıkça yazılıyor ki varsayılan bir gün
 * değişirse çıktı sessizce kaymasın.
 *
 * ⚠ Bağımlılık yok: bir doku kütüphanesi ya da PNG varlığı yerine 300 baytlık bir SVG.
 */
const grenKatmani = (guc: number): string => {
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'>` +
    `<filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.82' ` +
    `numOctaves='3' seed='7' stitchTiles='stitch'/></filter>` +
    `<rect width='180' height='180' filter='url(%23g)' opacity='${(guc / 100).toFixed(3)}'/></svg>`
  return `url("data:image/svg+xml,${svg.replace(/#/g, '%23').replace(/"/g, "'")}")`
}

const katmanCss = (k: ZeminKatmani): string => {
  switch (k.tip) {
    case 'dogrusal':
      return (
        `linear-gradient(${k.aci}deg, ` +
        k.duraklar.map((d) => `${renk(d.renk, d.opaklik)} ${yuzde(d.konum)}%`).join(', ') +
        ')'
      )
    case 'isik':
      return (
        `radial-gradient(ellipse ${yuzde(k.capX)}% ${yuzde(k.capY)}% at ` +
        `${yuzde(k.x)}% ${yuzde(k.y)}%, ${renk(k.renk, k.guc)} 0%, transparent 72%)`
      )
    case 'tarama':
      return (
        `repeating-linear-gradient(${k.aci}deg, ${renk(k.renk, k.guc)} 0 ${k.kalinlik}px, ` +
        `transparent ${k.kalinlik}px ${Math.max(k.kalinlik + 1, k.aralik)}px)`
      )
    case 'vinyet':
      // ⚠ Karartma mürekkep rampasından: serbest `rgba(0,0,0,x)` yazmanın yolu yok.
      return (
        `radial-gradient(ellipse 78% 88% at 50% 46%, transparent 38%, ` +
        `${renk('--ramp-marka-ink-950', k.guc)} 100%)`
      )
  }
}

/**
 * Reçeteyi CSS `background` kısayoluna çevirir.
 *
 * ⚠ **KATMAN SIRASI TERS: ilk yazılan EN ÜSTTE.** CSS `background` çok katmanlıdır ve
 * ilk katman en öndedir. Reçete okunurken "önce taban, sonra üstüne" beklentisi doğal
 * olduğu için liste burada TERSİNE çevriliyor: reçetede önce yazılan, zeminde ALTTA.
 * Bu çevrim yapılmasaydı vinyet degradenin altında kalır ve hiç görünmezdi.
 */
export const zeminCss = (r: ZeminResetesi): string => {
  const degradeVar = r.katmanlar.some((k) => k.tip === 'dogrusal' || k.tip === 'isik')
  const katmanlar = [...r.katmanlar].reverse().map(katmanCss)
  // ⚠ Gren EN ÜSTTE: altta kalsaydı degradeyi kaplayamaz ve bantlaşmayı gizleyemezdi.
  const hepsi = degradeVar ? [grenKatmani(GREN_GUCU), ...katmanlar] : katmanlar
  return [...hepsi, `var(${r.taban})`].join(', ')
}

/**
 * Gren gücü — **ÖLÇÜLEREK seçildi, beğenilerek değil.**
 *
 * ⚠ ⚠ **DENEY:** 300×900 px, `#1a1e23 → #0e1116` düşük kontrastlı dikey degrade; tek bir
 * sütun boyunca aynı luminans değerinin üst üste kaç piksel sürdüğü sayıldı. Bir bandın
 * yüksekliği tam olarak budur.
 *
 * | Kurulum | ort. bant | **en uzun bant** | yatay std |
 * |---|---|---|---|
 * | grensiz | 1,98 px | **36 px** | 0,00 |
 * | gren + `overlay` | 1,48 px | **8 px** | 0,73 |
 * | gren + `normal` | 1,07 px | **3 px** | 6,04 |
 *
 * ⚠ **Yatay std 0,00 bantlaşmanın imzası:** satırın her pikseli birebir aynı, yani göz
 * 36 piksellik düz bir şerit görüyor. Gren o şeridi kırıyor.
 *
 * ⚠ ⚠ **`normal` DEĞİL `overlay` SEÇİLDİ ve gerekçe kayıtta.** `normal` bantlaşmayı
 * tamamen bitiriyor (3 px) ama yatay std'yi 6,04'e çıkarıyor — bu artık dither değil,
 * **görünür film greni**, yani bir süs. `sablon-degrade.ts`in kaydı greni bir DÜZELTME
 * olarak tanımlıyor; süse dönüştürmek o kaydı sessizce değiştirmek olurdu. `overlay`
 * bandı 36→8 px'e indiriyor ve dokuyu görünmez bırakıyor (0,73): işini yapıyor, kendini
 * göstermiyor. **Görünmez olması başarısızlık değil, şartname.**
 */
const GREN_GUCU = 26

/**
 * Katman başına karışım kipi — gren `overlay`, diğerleri `normal`.
 *
 * ⚠ ⚠ **AYRI BİR ÜRETİCİ DEĞİL, AYNI SIRANIN İKİNCİ YÜZÜ.** `background-blend-mode`
 * listesi `background-image` listesiyle BİREBİR aynı sırada olmak zorunda; ikisi ayrı
 * yerlerde kurulsaydı bir katman eklendiğinde biri güncellenir, öteki kayar ve karışım
 * yanlış katmana uygulanırdı — sessiz, bakınca bile zor görülür bir hata. Bu yüzden iki
 * fonksiyon aynı listeyi aynı kurala göre üretiyor ve testi ikisinin uzunluğunu eşliyor.
 */
export const zeminKarisimi = (r: ZeminResetesi): string => {
  const degradeVar = r.katmanlar.some((k) => k.tip === 'dogrusal' || k.tip === 'isik')
  const kipler = r.katmanlar.map(() => 'normal')
  return [...(degradeVar ? ['overlay'] : []), ...kipler, 'normal'].join(', ')
}

/** Reçetenin taban rengi — metin/aksan türetimi hâlâ buradan (koyu mu açık mı). */
export const zeminTabani = (r: ZeminResetesi): string => `var(${r.taban})`
