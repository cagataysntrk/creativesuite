// Tolerans okuması — sistemin imza öğesi (§11.1 · §12 · §4b).
//
// **Rozet göstermiyoruz, ÖLÇÜM gösteriyoruz.** "Marka uyumu ✓" hiçbir şey söylemez:
// sınırın hemen içinde mi, çok uzağında mı, hangi yönde hareket ediyor — hiçbiri
// görünmez. `ΔE 2.4 / limit 5.0` bunların hepsini tek satırda söyler.
//
// Bu bir estetik tercih değil, müşterinin kendi dünyasının dili: imalatta bir parça
// "uygun ✓" damgası almaz, **tolerans bandında bir okuma** alır. Aynı mantık her yerde
// tekrarlanır — maliyet bir bant, ETA bir p20–p80 aralığı, kota bir doluluk göstergesi.
//
// **Uyarı eşiği limitten AYRI.** Yalnız limit olsaydı sistem "geçti/kaldı" ikilisine
// düşerdi ve limite doğru sürüklenme görünmezdi. Sürüklenme, tek tek hiçbir varlığın
// düşmediği ama ortalamanın kenara yaslandığı durumdur — ve fark edilmediğinde marka
// yavaşça bozulur.

// Tipler Ring -1'de (D-175): tarayıcı halkası `render`ı import EDEMEZ ama aynı yapıyı
// konuşmak zorunda. Burada KURMA ve BİÇİMLENDİRME mantığı var, tanım değil.
import type { QaReport, ToleranceReading, ToleranceStatus } from '@suite/contracts'

export type { QaReport, ToleranceReading, ToleranceStatus }

export const reading = (spec: Omit<ToleranceReading, 'status'>): ToleranceReading => ({
  ...spec,
  status: durum(spec),
})

const durum = (s: Omit<ToleranceReading, 'status'>): ToleranceStatus => {
  if (s.direction === 'lower') {
    if (s.value > s.limit) return 'out'
    return s.value > s.warn ? 'warn' : 'in'
  }
  if (s.value < s.limit) return 'out'
  return s.value < s.warn ? 'warn' : 'in'
}

/**
 * Sayı biçimi `tr-TR`: binlik nokta, ondalık virgül (§12.2).
 *
 * `Intl` kullanılıyor, elle `replace('.', ',')` DEĞİL: elle çevirim binlik ayıracını
 * kaçırır ve `1.234,5` yerine `1234,5` üretir — ölçüm ekranında okunabilirliği
 * doğrudan düşürür.
 */
const sayi = (v: number, basamak: number): string =>
  new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: basamak,
    maximumFractionDigits: basamak,
  }).format(v)

const GENISLIK = 20

/**
 * Tek satırlık bant çizimi:
 * `ΔE 2000            2,4 │──────●────┊─────╎────│ limit 5,0  ✓ tolerans içi`
 *
 * `●` ölçüm · `┊` uyarı eşiği · `╎` limit · `│` bandın kendi kenarı.
 *
 * Dört işaret dört ayrı karakter: ilk sürümde limit ile bant kenarı aynı `┤` idi ve
 * sınır dışı bir okumada iki `┤` yan yana çıkıyordu — "limit nerede" sorusu tam da
 * limitin aşıldığı anda okunamaz hâle geliyordu.
 *
 * Bant **her zaman** limitin ötesine kadar çizilir ki sınır dışı bir okuma da içeride
 * görünsün: kenardan taşan bir işaret "ne kadar dışında" sorusunu cevaplayamaz.
 */
export const formatReading = (r: ToleranceReading, basamak = 1): string => {
  const tavan = r.direction === 'lower' ? r.limit * 1.25 : Math.max(r.value, r.limit) * 1.25
  const konum = (v: number): number =>
    Math.max(0, Math.min(GENISLIK - 1, Math.round((v / (tavan || 1)) * (GENISLIK - 1))))

  const hucreler = Array.from({ length: GENISLIK }, () => '─')
  hucreler[konum(r.warn)] = '┊'
  hucreler[konum(r.limit)] = '╎'
  // Ölçüm EN SON yazılıyor: eşiklerin üstüne biner. Tersi olsaydı tam limitte duran bir
  // ölçüm görünmez olurdu — ve o, en çok bakılması gereken okuma.
  hucreler[konum(r.value)] = '●'

  const isaret = r.status === 'in' ? '✓' : r.status === 'warn' ? '!' : '✗'
  const soz =
    r.status === 'in' ? 'tolerans içi' : r.status === 'warn' ? 'uyarı bandında' : 'SINIR DIŞI'

  return (
    `${r.label.padEnd(18)}${sayi(r.value, basamak).padStart(7)}${r.unit} ` +
    `│${hucreler.join('')}│ limit ${sayi(r.limit, basamak)}${r.unit}  ${isaret} ${soz}`
  )
}

export const report = (readings: readonly ToleranceReading[]): QaReport => ({
  readings,
  blocked: readings.some((r) => r.status === 'out'),
  warnings: readings.filter((r) => r.status === 'warn').length,
})

export const formatReport = (r: QaReport): string => {
  const satirlar = r.readings.map((x) => `  ${formatReading(x)}`)
  satirlar.push('')
  satirlar.push(
    r.blocked
      ? `  ✗ ${r.readings.filter((x) => x.status === 'out').length} okuma SINIR DIŞI — varlık yayınlanamaz`
      : r.warnings > 0
        ? `  ! ${r.warnings} okuma uyarı bandında — limite sürükleniyor`
        : '  ✓ bütün okumalar tolerans içi'
  )
  return satirlar.join('\n')
}
