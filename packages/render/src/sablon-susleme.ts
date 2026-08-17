// Süsleme dağarcığı — geometrik, KAPALI, deterministik (§7.1 · FAZ-11.2 · D-261).
//
// Referans örnek 4'ün dili: blob, nokta ızgarası, taralı daire, kontur halka, küçük kare.
// Hepsi SVG, sıfır bağımlılık. Konum ve ölçek `SlaytKimligi`den türetiliyor — aynı slayt
// her koşuda aynı süslemeyi alıyor (golden test çalışır) ama slayttan slayta değişiyor.
//
// ⚠ **SLAYT BAŞINA EN FAZLA İKİ ÖGE.** Referansta bol süsleme var ama o tasarımın zemini
// BEYAZ ve başka hiçbir şey yok. Bizde zaten iki renk alanı, akan bir eğri ve dev bir
// hayalet rakam var. Beş ögeyi birden koymak "zengin" değil KALABALIK olurdu — ve
// kalabalık, referans ailesinde bulunmayan tek şey.
//
// ⚠ **Süslemeler METİN SÜTUNUNA GİRMEZ.** Dolgu tarafına yerleşiyorlar, yani metnin
// karşısına. Girselerdi okunabilirliği düşürürlerdi ve bu faz tam da o sınıf kusuru
// kapatmak için var.

import type { SlaytKimligi } from '@suite/kernel'
import { SINIR_MAX } from './sablon.js'

/** Kapalı dağarcık. Altıncı öge bir KARAR ister, bir `case` değil. */
export const SUSLEME_TIPLERI = ['blob', 'nokta', 'tarama', 'halka', 'kare'] as const
export type SuslemeTipi = (typeof SUSLEME_TIPLERI)[number]

export interface Susleme {
  readonly tip: SuslemeTipi
  /** Yüzde, tuval genişliğine göre — dolgu tarafında. */
  readonly x: number
  readonly y: number
  /** Yüzde, tuval genişliğine göre. */
  readonly boyut: number
  readonly opaklik: number
  /**
   * Çizgisel şekillerin (şimdilik `tarama`) SIKLIĞI — 0 seyrek, 1 yoğun (D-262).
   *
   * ⚠ **Bu bir SABİT değil.** Aynı yoğun tarama kâğıt alanda kalabalık, koyu zeminli
   * yüksek enerjili bir kompozisyonda doğrudur. Dağarcık kapalı (beş şekil), parametreleri
   * açık. Ayırt edici soru: *"bu sayı her tasarımda aynı mı olmalı?"* — hayırsa sabit değil.
   */
  readonly yogunluk: number
}

/** Bugünkü ailenin yoğunluğu: açık kâğıt alan, ince kontur, havadar. */
export const YOGUNLUK_SEYREK = 0.25
/** Koyu zeminli, yüksek kontrastlı aileler için — henüz kullanılmıyor, ama ölçek burada. */
export const YOGUNLUK_YOGUN = 0.9

/**
 * Bir slaytın süslemeleri — bir ya da iki öge.
 *
 * Seçim ve konum indeksten TÜRETİLİYOR. Rastgele olsaydı iki koşu iki farklı çıktı verir
 * ve golden test kurulamazdı; sabit olsaydı beş kare beş kopya olurdu.
 */
export const suslemeler = (k: SlaytKimligi, sagda: boolean): readonly Susleme[] => {
  // Kapak SÜSSÜZ: ızgarada ilk kare bir cümledir, bir desen değil. Referansların
  // hepsinde kapak en sade karedir.
  if (k.role === 'kapak' || k.role === 'tek') return []

  const faz = k.index % SUSLEME_TIPLERI.length
  const ikinci = (faz + 2) % SUSLEME_TIPLERI.length
  const tip = SUSLEME_TIPLERI[faz] as SuslemeTipi
  const tip2 = SUSLEME_TIPLERI[ikinci] as SuslemeTipi

  // Dolgu tarafının ORTASI: metin karşı tarafta, hayalet rakam altta. Üst-orta bandı
  // boş kalan tek bölge ve süsleme oraya oturuyor.
  const merkez = sagda ? (100 + SINIR_MAX) / 2 : (100 - SINIR_MAX) / 2

  return [
    {
      tip,
      x: merkez,
      y: 22 + (k.index % 3) * 6,
      boyut: 13 + (k.index % 2) * 4,
      opaklik: 0.5,
      yogunluk: YOGUNLUK_SEYREK,
    },
    // İkinci öge yalnız TEK indekslerde: her slaytta iki öge, ritmi düzleştirir.
    ...(k.index % 2 === 1
      ? [
          {
            tip: tip2,
            x: merkez + (sagda ? -7 : 7),
            y: 44,
            boyut: 7,
            opaklik: 0.38,
            yogunluk: YOGUNLUK_SEYREK,
          },
        ]
      : []),
  ]
}

/** Tek bir süslemenin SVG'si. Renk çağırandan geliyor — token, sabit değil. */
export const suslemeSvg = (s: Susleme, renk: string): string => {
  const r = s.boyut / 2
  const o = `opacity="${s.opaklik}"`
  switch (s.tip) {
    case 'blob':
      // Yumuşak, düzensiz kütle — eğrinin kardeşi. Kontrol noktaları sabit: blob bir
      // imzadır, her seferinde farklı çizilirse imza olmaktan çıkar.
      return (
        `<path ${o} fill="${renk}" transform="translate(${s.x - r} ${s.y - r}) scale(${s.boyut / 100})" ` +
        `d="M 50 4 C 76 4, 96 22, 96 48 C 96 74, 74 96, 48 96 C 22 96, 4 76, 4 50 C 4 24, 24 4, 50 4 Z"/>`
      )
    case 'nokta': {
      // 4×4 nokta ızgarası — Memphis dilinin taşıyıcısı.
      const adim = s.boyut / 3
      const noktalar = []
      for (let i = 0; i < 4; i += 1)
        for (let j = 0; j < 4; j += 1)
          noktalar.push(
            `<circle cx="${s.x - r + i * adim}" cy="${s.y - r + j * adim}" r="${s.boyut / 22}"/>`
          )
      return `<g ${o} fill="${renk}">${noktalar.join('')}</g>`
    }
    case 'tarama': {
      // Taralı daire: eğik çizgiler, daire içine kırpılmış.
      const id = `t${s.tip}${Math.round(s.x)}${Math.round(s.y)}`
      const adet = Math.round(6 + 16 * s.yogunluk)
      return (
        `<defs><clipPath id="${id}"><circle cx="${s.x}" cy="${s.y}" r="${r}"/></clipPath></defs>` +
        // Kalınlık ve çizgi sayısı YOĞUNLUKTAN türer: seyrekte ince ve az, yoğunda kalın
        // ve çok. Ölçek 6→22 çizgi ve boyut/34→boyut/12 kalınlık arasında.
        `<g ${o} clip-path="url(#${id})" stroke="${renk}" stroke-width="${s.boyut / (34 - 22 * s.yogunluk)}">` +
        // ⚠ Çizgiler daireyi TAM kaplamak zorunda: 45° eğimde bir çizgi kutunun bir
        // köşesinden diğerine gider, yani tarama `x-2r`den `x+2r`ye uzamalı. İlk sürüm
        // `x-r`den başlıyordu ve dairenin sol alt yarısı boş kalıyordu — sonuç daire
        // değil KAMA gibi görünüyordu. Kırpma doğruydu, tarama eksikti.
        // ⚠ **Aralık ve kalınlık BAKINCA düzeltildi.** İlk sürüm 17 çizgiyi `boyut/16`
        // kalınlıkta çiziyordu: çizgiler birbirine değiyor ve daire TARALI değil DOLU
        // görünüyordu — kâğıt alanda koyu bir leke, hayalet rakamın üstünde. Referans
        // örnek 3'te aynı şekil ince çizgili ve havadar. On bir çizgi, `boyut/26`.
        Array.from({ length: adet }, (_, i) => {
          const d = s.x - 2 * r + (i * 4 * r) / (adet - 1)
          return `<line x1="${d}" y1="${s.y + r}" x2="${d + 2 * r}" y2="${s.y - r}"/>`
        }).join('') +
        `</g>`
      )
    }
    case 'halka':
      return `<circle ${o} cx="${s.x}" cy="${s.y}" r="${r}" fill="none" stroke="${renk}" stroke-width="${s.boyut / 14}"/>`
    case 'kare':
      return `<rect ${o} x="${s.x - r}" y="${s.y - r}" width="${s.boyut}" height="${s.boyut}" fill="${renk}"/>`
  }
}
