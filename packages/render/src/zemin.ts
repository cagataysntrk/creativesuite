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
 * Gren frekansı — **TAM SAYI OLAMAZ ve bu sessiz bir arıza sınıfıdır (R-85 kardeşi).**
 *
 * ⚠ ⚠ **ÖLÇÜM:** `baseFrequency` 0.99 → σ 4,10 · **1 → σ 0,000** · 1.01 → σ 4,11 ·
 * **2 → σ 0,000**. Tam sayıda Perlin kafesi piksel ızgarasına birebir oturuyor ve
 * gürültü her pikselde AYNI değeri örnekliyor: gren **hata vermeden tamamen ölüyor.**
 * Değer bir gün "yuvarlansın" diye 1'e çekilse, çıktı sessizce grensiz kalır ve bunu
 * ancak bant sayan bir ölçüm görür. Kilidi `zemin.test.ts` tutuyor.
 */
const GREN_FREKANSI = 0.82

/**
 * Gren karışımı — **`overlay` DEĞİL `soft-light`, ve eski kayıt YANLIŞ DEĞİL EKSİKTİ.**
 *
 * ⚠ ⚠ Depodaki `GREN_GUCU = 26` + `overlay` kararı gerçek bir ölçüme dayanıyordu:
 * 300×900 px düşük kontrastlı degradede en uzun düz bant grensiz **36 px**, `overlay`
 * grenle **8 px**, `normal` ile 3 px. O ölçüm **PNG alanında** yapıldı ve kodlayıcıdan
 * geçirilmedi. Yayın JPEG (R-90) ve JPEG'te sonuç başka çıkıyor:
 *
 * | q | grensiz | σ=0,5 | σ=1,5 | σ=2,0 |
 * |---|---|---|---|---|
 * | 82 | %94,9 | %93,8 | %31,5 | %22,7 |
 * | 90 | %96,2 | %68,9 | %27,9 | **%20,1** |
 * | 95 | %95,9 | %43,6 | %21,3 | %16,7 |
 *
 * `overlay` + 26, `#040404` zemininde σ≈0,5 üretiyor → q=82'de **tamamen siliniyor**.
 * `soft-light` + luminansa bağlı opaklık σ≈2,0 tutuyor ve düz plato %95'ten %20'ye
 * iniyor. Ayrıca JPEG kalitesini yükseltmek tek başına HİÇBİR ŞEY çözmüyor
 * (q75→q95: %95,1→%95,9, dosya +%28): bant 8-bit kaynakta, kodlayıcıda değil.
 */
const GREN_KARISIMI = 'soft-light'

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
export const grenKatmani = (guc: number): string => {
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'>` +
    `<filter id='g' color-interpolation-filters='sRGB'>` +
    `<feTurbulence type='fractalNoise' baseFrequency='${GREN_FREKANSI}' ` +
    `numOctaves='4' seed='7' stitchTiles='stitch'/>` +
    `<feColorMatrix type='saturate' values='0'/>` +
    `<feComponentTransfer><feFuncA type='discrete' tableValues='1'/></feComponentTransfer>` +
    `</filter>` +
    `<rect width='180' height='180' filter='url(%23g)' opacity='${(guc / 100).toFixed(3)}'/></svg>`
  return `url("data:image/svg+xml,${svg.replace(/#/g, '%23').replace(/"/g, "'")}")`
}

/**
 * Gren opaklığı — **yüzey luminansının FONKSİYONU, sabit değil** (FAZ-19.4).
 *
 * ⚠ ⚠ **SABİT OPAKLIK KOYU ZEMİNDE BANTLANMAYI ÇÖZMÜYOR.** Ölçüm (σ, gren gücü sabitken
 * yüzey L'sine göre):
 *
 * | blend | L=8 | L=16 | L=32 | L=64 | L=128 | L=230 |
 * |---|---|---|---|---|---|---|
 * | `soft-light` .25 | 0,70 | 1,23 | 1,94 | 2,53 | 2,62 | 0,83 |
 * | `overlay` .25 | 0,51 | 0,77 | 1,46 | 2,87 | 5,72 | 1,18 |
 *
 * Yani tek bir opaklık, mürekkep zeminde σ 0,70 üretiyor — ve **σ<1,0 gren JPEG
 * tarafından siliniyor.** Opaklık luminansla TERS ölçeklenmek zorunda.
 */
export const grenOpakligi = (yuzeyL: number): number =>
  UCTA(yuzeyL) ? 0.1 : yuzeyL < 0.2 ? 0.7 : yuzeyL < 0.35 ? 0.4 : yuzeyL < 0.62 ? 0.25 : 0.35

/**
 * Yüzey `soft-light`in TUTAMADIĞI uçta mı — saf siyaha ya da kâğıda yakın.
 *
 * ⚠ ⚠ **ÖLÇÜLDÜ, VARSAYILMADI.** `soft-light` çarpımsal: siyah zeminde çarpacak bir şey
 * yok, beyaz zeminde doyum var. On kapak render edilip düz blokların medyan σ'sı
 * ölçüldüğünde tam bu ikilik çıktı:
 *
 * | zemin | L | `soft-light` σ | σ<0,5 olan blok |
 * |---|---|---|---|
 * | `sahne` `veri-hikayesi` | ~0,16 | 3,8 | %0,1 |
 * | `dizin` | ~0,17 | 2,9 | %1,2 |
 * | `akan-alan` `donen` `kavis` | ~0,105 (#040404) | **1,0** | %1,3 |
 * | `alinti` `editoryal` `memphis` | ~0,98 (#fafafa) | **0,24** | **%87** |
 *
 * Kâğıt şablonlarında düz blokların %87'si σ<0,5 — yani **JPEG onu tamamen siler** ve
 * gren hiç uygulanmamış gibi olur. Uçlarda `normal` kullanılıyor: ölçüm tablosunda
 * `normal` σ'sı luminanstan BAĞIMSIZ (L=8'de de L=230'da da 2,87), yalnız opaklık
 * düşük tutulmak zorunda ki dither kalsın, görünür film greni olmasın.
 */
const UCTA = (yuzeyL: number): boolean => yuzeyL < 0.14 || yuzeyL > 0.85

/** Gren karışım kipi — uçlarda `normal`, ortada `soft-light`. */
export const grenKipi = (yuzeyL: number): string => (UCTA(yuzeyL) ? 'normal' : GREN_KARISIMI)

/*
 * ⚠ ⚠ **BURAYA BİR TOKEN→AÇIKLIK ÇÖZÜCÜSÜ YAZILDI ve GERİ ALINDI (FAZ-19.4).**
 * `panorama.ts` zaten kaskadın doğru bloğunu (`[data-surface='kreatif']`) okumayı
 * öğrenmiş bir çözücü taşıyor; naif bir ikinci çözücü `--role-surface` için KONSOL
 * değerini okur ve greni yanlış eşiğe düşürürdü — sessizce. İki tanım, biri eskir
 * (R-05). Açıklık `zeminCss`e DIŞARIDAN veriliyor; bu dosya onu hesaplamıyor.
 */

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
export const zeminCss = (r: ZeminResetesi, yuzeyL: number): string => {
  const katmanlar = [...r.katmanlar].reverse().map(katmanCss)
  // ⚠ Gren EN ÜSTTE: altta kalsaydı degradeyi kaplayamaz ve bantlaşmayı gizleyemezdi.
  // ⚠ ⚠ **KOŞULSUZ — `degradeVar` kapısı KALKTI (FAZ-19.4).** Eski kural *"degrade
  // açıksa gren de açık"* diyordu; degrade yasağı (D-318) yürürlükteyken bu koşul HİÇ
  // sağlanmadı ve on şablonun hiçbirinde gren olmadı. Ölçüldü: on kapağın %67,7–%92,3'ü
  // tek bir RGB değeri. **Düz zemin greni EN ÇOK isteyen zemindir** — yasak, kendisini
  // telafi edecek tek mekanizmayı da kapatmıştı.
  const hepsi = [grenKatmani(grenOpakligi(yuzeyL) * 100), ...katmanlar]
  return [...hepsi, `var(${r.taban})`].join(', ')
}

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
  const kipler = r.katmanlar.map(() => 'normal')
  return [GREN_KARISIMI, ...kipler, 'normal'].join(', ')
}

/** Reçetenin taban rengi — metin/aksan türetimi hâlâ buradan (koyu mu açık mı). */
export const zeminTabani = (r: ZeminResetesi): string => `var(${r.taban})`
