// Karosel şablon grameri — slayt kimliğinden KOMPOZİSYON türetir (§7.1 · D-254).
//
// **Generative ile rastgele aynı şey değildir.** Buradaki her karar `SlaytKimligi`den
// hesaplanıyor: aynı slayt her koşuda aynı kompozisyonu verir (deterministik, golden
// test çalışır) ama slayttan slayta değişir (ritim doğar). Rastgelelik olsaydı ikisini
// birden kaybederdik: ne tekrar üretilebilirlik ne de kontrol.
//
// **Gramer KAPALI.** Referans karosellerin DNA'sı üç kuraldan ibaret ve hepsi burada:
//   1. İki renk alanı, aralarında **akan bir eğri** — taraf slayta göre dönüyor
//   2. **Hayalet rakam**: dev, yalnız kontur, kenardan kırpılmış
//   3. Renk rolü rotasyonu: kehribar → kâğıt → mürekkep
// Dördüncü bir kural eklemek bir KARAR ister; "biraz daha çeşitlilik" diye eklenen
// her öge, ızgaraya bakınca tek şey görünmesini bozar.
//
// **Neden `static.ts`te değil ayrı dosyada:** `static.ts` belge → HTML çevirisi yapıyor;
// burası tasarım kararı veriyor. Karışsalardı "bu rengi kim seçti" sorusu bir HTML
// şablonunun içinde kaybolurdu.

import type { SlaytKimligi } from '@suite/kernel'
import type { LayoutName } from './layout/adlar.js'

/** Renk rolü — hangi token'ın zemin, hangisinin metin olacağı. */
export interface AlanRolleri {
  readonly zemin: string
  readonly karsiAlan: string
  readonly metin: string
  readonly metinSoluk: string
  readonly motif: string
}

/**
 * Üç renkli rotasyon. **Kapak her zaman kehribar** — ızgarada ilk göze çarpan kare
 * markanın rengi olmalı; gövde slaytları kâğıt ve mürekkep arasında dönüyor.
 *
 * `index % 2` yerine açık bir tablo: modül aritmetiği "neden bu slayt siyah" sorusunu
 * cevaplayamaz, tablo cevaplar.
 */
export const alanRolleri = (k: SlaytKimligi): AlanRolleri => {
  const KEHRIBAR = 'var(--role-bg)'
  const KAGIT = 'var(--role-surface)'
  const MUREKKEP = 'var(--role-line-edge)'

  // ⚠ **Motif `karsiAlan`dan TÜRETİLİYOR, elle yazılmıyor.** Hayalet rakam zeminin
  // değil DOLGUNUN üstünde duruyor; rengi zemine göre seçilirse dolguyla aynı olabilir
  // ve rakam görünmez olur. Tam bu oldu: dört rolün ÜÇÜNDE motif dolgu rengiyle
  // aynıydı. Bant ortadayken (%44–56) kusur gizliydi — rakam iki alana birden taşıyor,
  // yarısı görünüyordu. Bant kenara kayınca (%69–78) rakam tamamen dolgunun içinde
  // kaldı ve tümüyle kayboldu. **Elle yazılan bir renk sütunu, komşu bir kararla
  // sessizce tutarsızlaşır**; türetilmiş olan tutarsızlaşamaz.
  const kontrast = (arka: string): string => (arka === MUREKKEP ? KEHRIBAR : MUREKKEP)

  if (k.role === 'kapak' || k.role === 'tek') {
    return {
      zemin: KEHRIBAR,
      karsiAlan: KAGIT,
      metin: 'var(--role-text)',
      metinSoluk: 'var(--role-text-muted)',
      motif: kontrast(KAGIT),
    }
  }
  if (k.role === 'kapanis') {
    // Kapanış mürekkep: ızgarada dizinin bittiği yer görsel olarak da bitmeli.
    return {
      zemin: MUREKKEP,
      karsiAlan: KEHRIBAR,
      metin: 'var(--role-surface)',
      metinSoluk: 'var(--role-surface)',
      motif: kontrast(KEHRIBAR),
    }
  }
  // Gövde: tek indeksler kâğıt, çiftler kehribar — komşu iki slayt asla aynı zemin.
  const kagitMi = k.index % 2 === 1
  return kagitMi
    ? {
        zemin: KAGIT,
        karsiAlan: KEHRIBAR,
        metin: 'var(--role-line-edge)',
        metinSoluk: 'var(--role-text-muted)',
        motif: kontrast(KEHRIBAR),
      }
    : {
        zemin: KEHRIBAR,
        karsiAlan: KAGIT,
        metin: 'var(--role-text)',
        metinSoluk: 'var(--role-text-muted)',
        motif: kontrast(KAGIT),
      }
}

/**
 * Akan eğri — süreklilik motifi.
 *
 * **Referansın asıl mekanizması bu.** Beş kareye yan yana bakıldığında "tek şey"
 * görünmesini sağlayan şey ne renk ne tipografi: her karede aynı el yazısıyla çizilmiş
 * bir eğrinin dönüşümlü olarak sağda ve solda durması.
 *
 * Eğri `SlaytKimligi`den TÜRETİLİYOR: kontrol noktaları indeksle kayıyor, yani her
 * slaytta biraz farklı ama aynı aileden. Sabit bir path olsaydı beş kare beş kopya
 * olurdu; rastgele olsaydı aile dağılırdı.
 *
 * Genişlik/yükseklik 100 birimlik bir kutuda; `preserveAspectRatio="none"` ile geriliyor.
 */
export const akanEgri = (k: SlaytKimligi): string => {
  // Faz indeksle kayıyor — aynı aile, farklı nefes. `% 5`: beş slaytlık bir karoselde
  // her slayt farklı, altıncıda aile başa dönüyor.
  const faz = k.index % 5

  // ⚠ **Salınım DAR bir bantta tutuluyor** ve bu ölçülmüş bir düzeltme. İlk sürümde
  // eğri genişliğin %60'ına taşıyordu ve metin sınırı geçiyordu: yazının yarısı
  // kehribar, yarısı kâğıt üstünde kalıyor, okunabilirlik düşüyor ve kompozisyon
  // kazara duruyordu. Referansta metin HER ZAMAN tek alanda.
  //
  // Bant `SINIR_MIN..SINIR_MAX`; `guvenliMetinYuzdesi` bu bandın dışını hesaplıyor.
  // İkisi tek yerde tanımlı — ayrı olsalardı biri değişip diğeri unutulurdu.
  const merkez = SINIR_MIN + ((SINIR_MAX - SINIR_MIN) * faz) / 4
  const genlik = 5

  // ⚠ **Eğri, dolduracağı tarafa göre AYNALANIYOR.** Bant artık simetrik değil (%69–78):
  // metin sütunu geniş tarafta duruyor ve o taraf %62. Yansıma olmasaydı `egriSagda`
  // false olduğunda dolgu geniş tarafı kaplar, metne dar taraf kalır ve sütun %62
  // olamazdı — yani dönüşümlü ritim ile geniş metin sütunu birbirini dışlardı.
  const X = (v: number): number => (egriSagda(k) ? v : 100 - v)

  // Dikey S: üstten alta akan, iki kez bükülen tek eğri. Kontrol noktaları merkez
  // etrafında ±genlik — aile aynı, nefes farklı.
  return (
    `M ${X(merkez)} 0 ` +
    `C ${X(merkez + genlik)} 24, ${X(merkez - genlik)} 42, ${X(merkez + genlik * 0.4)} 60 ` +
    `C ${X(merkez + genlik * 1.4)} 78, ${X(merkez - genlik * 0.6)} 90, ${X(merkez)} 100`
  )
}

/**
 * Eğri sınırının salınım bandı, yüzde olarak.
 *
 * Metin bu bandın DIŞINDA kalmak zorunda; iki sabit tek yerde durur ki biri değişince
 * diğeri unutulmasın.
 */
export const SINIR_MIN = 69
export const SINIR_MAX = 78

/**
 * Metin sütununun güvenli genişliği, yüzde.
 *
 * Eğri bir kübik Bézier: kontrol noktalarının dışbükey zarfını AŞMAZ. En içerideki
 * kontrol noktası `merkez - genlik`, yani eğrinin metne en çok yaklaştığı yer
 * `SINIR_MIN - 5`. Sütun oradan 2 puan daha geride duruyor.
 *
 * ⚠ **Bu sayı ÖLÇÜLDÜ, seçilmedi** (`docs/referans/tip-olcegi.md`). Önceki değer 36 idi
 * ve o ayarda **hiçbir punto sığmıyordu**: `taşıyabileceğimizin` h1'in 76 px'inde 665 px
 * yer kaplıyor, sütunun içerik genişliği ise 301 px'ti — %120 taşma. Kutuyu daraltmak
 * metni daraltmıyor çünkü **kelime bölünmez**; taşma yalnız yer değiştiriyordu (R-23).
 * %62'de içerik 582 px ve ölçülen en büyük sığan punto 64 px — `static.ts` h1'i o.
 * Referansın metin alanı da karenin ~%62'si; dar sütun bizim SAPMAMIZDI.
 */
export const guvenliMetinYuzdesi = SINIR_MIN - 7

/** Eğri hangi tarafta — dönüşümlü. Sağ/sol dönüşü ritmin ikinci ayağı. */
export const egriSagda = (k: SlaytKimligi): boolean => k.index % 2 === 0

/**
 * Hayalet rakam — dev, yalnız kontur, kenardan kırpılmış.
 *
 * `total > 1` şartı: tek slaytlık bir postta "1" basmak anlamsız, hatta yanıltıcı
 * (bir dizi olduğunu ima eder).
 */
export const hayaletRakam = (k: SlaytKimligi): string | null =>
  k.total > 1 ? String(k.index + 1) : null

/** Sayaç etiketi — `#003` biçimi referanstan. */
export const sayacEtiketi = (k: SlaytKimligi): string | null =>
  k.total > 1 ? `#${String(k.index + 1).padStart(3, '0')}` : null

/**
 * Navigasyon işareti. Son slaytta yön DEĞİŞİR — referansta `<< Back`.
 * Sonda hâlâ "kaydır" demek, olmayan bir slayta işaret etmektir.
 */
export const navIsareti = (k: SlaytKimligi): string | null => {
  if (k.total <= 1) return null
  return k.index === k.total - 1 ? '‹‹ başa' : 'kaydır ››'
}

/**
 * Düzenin GÖRSEL kompozisyonu (FAZ-10.4b).
 *
 * **Neden gerekiyordu:** `LAYOUT_SPECS` üç alan taşıyordu — `maxBlocks`,
 * `headingBudget`, `bodyBudget` — ve üçü de yalnız BÖLME kararına giriyordu. `static.ts`
 * `layout`u hiç görmüyordu. Yani `quote` seçmek alıntı gibi GÖRÜNMÜYOR, sadece daha uzun
 * bir başlığa izin veriyordu. Adlar bir kompozisyon vaat ediyor, motor sayfalama bütçesi
 * veriyordu — ve iki farklı şeyin aynı adı taşıması, ikisini de yanlış anlatır.
 *
 * **Gramer KAPALI kalıyor** (D-254): burada dört düzenin dört biçimi var, beşincisi bir
 * KARAR ister. Belge modeline işaretleme sokulmadı — model `duzen: 'quote'` taşıyor,
 * tırnağı bu tablo çiziyor.
 */
export interface DuzenBicimi {
  /** Başlık puntosu, px. Ölçülen tavan 64 (`docs/referans/tip-olcegi.md`) — AŞILAMAZ. */
  readonly baslikPx: number
  readonly baslikYukseklik: number
  /** Gövde puntosu, px. */
  readonly govdePx: number
  /** İçeriğin dikey yaslanması. */
  readonly yaslama: 'flex-start' | 'center' | 'flex-end'
  /** Dev açılış tırnağı — yalnız `quote`. */
  readonly tirnak: boolean
  /** Her gövde bloğunun önünde ritim çizgisi — yalnız `list`. */
  readonly maddeRitmi: boolean
  /** İlk gövde bloğu bir KANIT şeridi olarak ayrılıyor — yalnız `claim-proof`. */
  readonly kanitSeridi: boolean
}

const TAVAN_PX = 64

export const duzenBicimi = (d: LayoutName | undefined): DuzenBicimi => {
  switch (d) {
    case 'quote':
      // Alıntı nefes ister: az kelime, büyük punto, ortada. Tırnak bir süs değil,
      // "bu cümle bana ait değil" işareti — atıf satırı onunla birlikte okunuyor.
      return {
        baslikPx: TAVAN_PX,
        baslikYukseklik: 1.16,
        govdePx: 30,
        yaslama: 'center',
        tirnak: true,
        maddeRitmi: false,
        kanitSeridi: false,
      }
    case 'list':
      // Liste çok satır taşıyor: başlık küçülür, gövde ritim kazanır. Başlığı büyük
      // tutmak listeyi ikinci slayda iterdi — sayfalama zaten `list` bütçesini seçti.
      return {
        baslikPx: 46,
        baslikYukseklik: 1.1,
        govdePx: 32,
        yaslama: 'flex-start',
        tirnak: false,
        maddeRitmi: true,
        kanitSeridi: false,
      }
    case 'claim-proof':
      // İddia üstte büyük, kanıt altında AYRI bir şeritte. Ayrım görsel olmazsa iddia
      // ile kanıt aynı sesle okunur ve kanıt kanıt olmaktan çıkar.
      return {
        baslikPx: 56,
        baslikYukseklik: 1.08,
        govdePx: 32,
        yaslama: 'center',
        tirnak: false,
        maddeRitmi: false,
        kanitSeridi: true,
      }
    default:
      // `statement` ve tanımsız: tek büyük cümle, alta yaslı. Tanımsızın buraya düşmesi
      // bilinçli — eski belgeler (düzen damgası taşımayanlar) aynen çalışmaya devam eder.
      return {
        baslikPx: TAVAN_PX,
        baslikYukseklik: 1.08,
        govdePx: 34,
        yaslama: 'flex-end',
        tirnak: false,
        maddeRitmi: false,
        kanitSeridi: false,
      }
  }
}
