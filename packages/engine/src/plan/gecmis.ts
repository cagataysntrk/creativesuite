// Koşu geçmişi — "yeni bir tane üret" gerçekten YENİ olsun diye (FAZ-16.6 · D-308).
//
// ⚠ ⚠ **BU MODÜL BİR ÖLÇÜMDEN DOĞDU.** Defterdeki son üç karosel koşusunun ÜÇÜ de
// `sahne` şablonunu seçti ve konuları birbirinin kopyasıydı ("Geri kazanım oranı…").
// Sebep bir hata değil, seçimin doğru çalışmasıydı: seçim içeriğin ölçülen şeklinden
// deterministik çıkıyor, benzer konu benzer şekil verir, benzer şekil aynı şablonu
// seçer. Yani tekrar, sistemin kusuru değil TASARIM SONUCUYDU — ve düzeltmesi de
// tasarımda: seçim artık geçmişi de görüyor.
//
// ⚠ Rastgelelik EKLENMİYOR (R-06). Çeşitlilik kayıttan geliyor: son koşularda
// kullanılmış şablon, başka uygun aday varsa elenir. Aynı içerik + aynı geçmiş =
// aynı seçim; replay bozulmuyor.

import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export interface Gecmis {
  /** Kullanılmış şablonlar, EN YENİDEN eskiye. */
  readonly sablonlar: readonly string[]
  /** İşlenmiş konular, en yeniden eskiye. */
  readonly konular: readonly string[]
}

const BOS: Gecmis = { sablonlar: [], konular: [] }

/**
 * `derived/runs` altındaki defterleri okur.
 *
 * ⚠ Sıralama dosya adına göre: `run_<uuidv7>` zaman-sıralı bir id taşıyor, yani ad
 * sıralaması zaman sıralamasıdır. `mtime` kullanmak yanlış olurdu — bir defterin
 * kopyalanması ya da dokunulması sırayı bozardı ve "son üç koşu" başka bir şey olurdu.
 */
export const gecmisiOku = (runsDizini: string, tavan = 8): Gecmis => {
  let adlar: string[]
  try {
    adlar = readdirSync(runsDizini)
      .filter((a) => a.startsWith('run_'))
      .sort()
      .reverse()
  } catch {
    return BOS
  }
  const sablonlar: string[] = []
  const konular: string[] = []
  for (const ad of adlar) {
    if (sablonlar.length >= tavan) break
    let m: unknown
    try {
      m = JSON.parse(readFileSync(join(runsDizini, ad, 'manifest.json'), 'utf8'))
    } catch {
      continue
    }
    const kayit = m as { readonly pipeline?: string; readonly steps?: readonly unknown[] }
    if (kayit.pipeline !== 'instagram-karosel') continue
    for (const s of kayit.steps ?? []) {
      const adim = s as {
        readonly params?: Record<string, unknown>
        readonly output?: Record<string, unknown>
      }
      const konu = adim.params?.['topic']
      if (typeof konu === 'string' && konu !== '' && !konular.includes(konu)) konular.push(konu)
      const sablon = adim.output?.['sablonId']
      if (typeof sablon === 'string' && sablon !== '' && !sablonlar.includes(sablon)) {
        sablonlar.push(sablon)
      }
    }
  }
  return { sablonlar, konular }
}
