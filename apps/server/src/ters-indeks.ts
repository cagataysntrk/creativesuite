// Ters indeks — "bu kaydı hangi çalıştırma kullandı" (§12.9, §13 · FAZ-4.4).
//
// **Bir olguyu düzeltmek, hangi çıktıların yanlış olduğunu bilmeden düzeltmektir.**
// Bir persona kaydındaki hatayı fark ettiğinizde asıl soru "bu kaydı düzelttim" değil,
// "bu kayıtla ÜRETİLMİŞ ne var ve hangileri prospect'e gitti" sorusudur. Cevap manifest
// `context` alanında zaten yazıyor — yalnız ters yönde okunmuyordu.
//
// **Türetilmiş, saklanan değil.** Bu indeks manifest'lerden HER İSTEKTE hesaplanır ve
// hiçbir yere yazılmaz: yazılsaydı ikinci bir gerçek olurdu ve manifest'le ayrıştığında
// hangisinin doğru olduğu anlaşılmazdı (§13: manifest bir çalıştırmanın TEK kanıtıdır).
// Çalıştırma sayısı binlere çıktığında burada bir indeks gerekir; o gün geldiğinde
// `derived/index` zaten var ve kaynak yine manifest olur.

import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { RUNS_DIR, type RunManifest } from '@suite/kernel'
import type { RunId } from '@suite/contracts'
import { readManifest } from '@suite/engine'

export interface Kullanim {
  readonly runId: string
  readonly pipeline: string
  readonly createdAt: string
  /** Kayıt bağlamın HANGİ bölümüne girdi — "neden dahil edildi"nin yarısı. */
  readonly section: string
  readonly reason: string
  readonly tokens: number
  /** Çalıştırma yayınlanabilir mi — kusurlu manifest'le üretilmiş varlık yayınlanamaz. */
  readonly manifestSaglam: boolean
}

export interface TersIndeksSonuc {
  readonly recordId: string
  readonly kullanimlar: readonly Kullanim[]
  /** Taranan çalıştırma sayısı — "0 kullanım" ile "hiç çalıştırma yok" AYRI. */
  readonly taranan: number
}

const manifestler = (repoRoot: string): readonly RunManifest[] => {
  const dizin = join(repoRoot, RUNS_DIR)
  if (!existsSync(dizin)) return []
  const cikti: RunManifest[] = []
  for (const d of readdirSync(dizin, { withFileTypes: true })) {
    if (!d.isDirectory()) continue
    const m = readManifest(repoRoot, d.name as RunId)
    if (m !== null) cikti.push(m)
  }
  return cikti
}

/**
 * Bir kaydın etkilediği çalıştırmalar, en YENİDEN eskiye.
 *
 * Sıralama kasıtlı: "bu olgu yanlıştı" dendiğinde ilk sorulan şey en son ne ürettiğidir
 * — dün gönderilen deck, altı ay önceki bir denemeden daha acildir.
 */
export const tersIndeks = (repoRoot: string, recordId: string): TersIndeksSonuc => {
  const hepsi = manifestler(repoRoot)
  const kullanimlar: Kullanim[] = []

  for (const m of hepsi) {
    for (const c of m.context) {
      if (c.recordId !== recordId) continue
      kullanimlar.push({
        runId: m.runId,
        pipeline: m.pipeline,
        createdAt: m.createdAt,
        section: c.section,
        reason: c.reason,
        tokens: c.tokens,
        // `corpusCommit` bir SHA değilse manifest kusurludur (D-155) ve o çalıştırmanın
        // çıktısı yayınlanamaz. Ters indekste bunu göstermek şart: "bu kayıt şu varlığı
        // etkiledi" derken varlığın zaten yayınlanamaz olduğunu söylememek yarım cevap.
        manifestSaglam: /^[0-9a-f]{40}$/.test(m.corpusCommit),
      })
    }
  }

  kullanimlar.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  return { recordId, kullanimlar, taranan: hepsi.length }
}

/**
 * İnsan okunur özet. **"Etkisi yok" AÇIKÇA yazılır** — boş bir liste sessiz kalırsa
 * operatör "henüz yüklenmedi" ile "hiç kullanılmadı"yı ayıramaz ve ikisi çok farklı
 * şeylerdir: birincisi beklemek, ikincisi kaydı gözden geçirmek demektir.
 */
export const tersIndeksOzeti = (s: TersIndeksSonuc): string => {
  if (s.taranan === 0) return 'hiç çalıştırma yok — ters indeks kurulamıyor'
  if (s.kullanimlar.length === 0) {
    return `etkisi yok: ${s.taranan} çalıştırmanın hiçbiri bu kaydı kullanmadı`
  }
  const kusurlu = s.kullanimlar.filter((k) => !k.manifestSaglam).length
  const ek = kusurlu === 0 ? '' : ` · ${kusurlu} tanesi KUSURLU manifest (yayınlanamaz)`
  return `${s.kullanimlar.length} çalıştırma bu kaydı kullandı (${s.taranan} tarandı)${ek}`
}
