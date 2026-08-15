// Cost & Budget verisi (§8.3, §12.9 · D-17 · FAZ-4.12).
//
// Üç soru: **ne harcandı · tahmin ne kadar tuttu · tavan nerede.**
//
// **Tahmin bir BANT, gerçek bir NOKTA.** Sapma %20'yi aşan çalıştırmalar işaretlenir
// (§16): tek tek hiçbiri felaket değil, ama sistematik sapma fiyat modelinin yanlış
// olduğunu söyler ve bunu ancak yan yana koyunca görürsünüz.
//
// **Kota ÖLÇÜLMÜYOR ve bu söyleniyor.** Bedava katman sayaçları sağlayıcı API'lerinden
// gelir (FAZ 7); uydurulmuş bir "%80 dolu" göstergesi, hiç göstergesi olmamaktan
// tehlikelidir (D-175).

import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { RUNS_DIR, costSummary, type RunManifest } from '@suite/kernel'
import type { RunId } from '@suite/contracts'
import { costVariance, readManifest } from '@suite/engine'
import {
  butceHatasiMesaji,
  parseButce,
  serializeButce,
  VARSAYILAN_BUTCE,
  type ButceTavanlari,
} from '@suite/registry'

const BUTCE_YOLU = 'registry/butce.yaml'

export interface CalistirmaMaliyeti {
  readonly runId: string
  readonly pipeline: string
  readonly createdAt: string
  readonly tahminAltMikros: string
  readonly tahminUstMikros: string
  readonly gercekMikros: string
  /** Tahmin bandının üstünden yüzde sapma. `null` = tahmin sıfır, oran tanımsız. */
  readonly sapmaYuzde: number | null
  /** %20'yi aşan sapma — fiyat modeli şüpheli (§16). */
  readonly onemli: boolean
}

export interface ButcePanosu {
  readonly tavan: {
    readonly perRunMicros: string | null
    readonly perMonthMicros: string | null
    readonly updatedAt: string
    /** Dosya yoksa varsayılan kullanılıyor — ve bu SÖYLENİR. */
    readonly varsayilan: boolean
  }
  readonly calistirmalar: readonly CalistirmaMaliyeti[]
  readonly toplamGercekMikros: string
  /** Sapması %20'yi aşan çalıştırma sayısı. */
  readonly sapan: number
  /**
   * Bedava kota sayaçları. **`null` = ÖLÇÜLMÜYOR**, "kota bitti" değil.
   * Sağlayıcı kota uçları FAZ-7.8'de bağlanacak.
   */
  readonly kota: null
}

const manifestler = (repoRoot: string): readonly RunManifest[] => {
  const dizin = join(repoRoot, RUNS_DIR)
  if (!existsSync(dizin)) return []
  const out: RunManifest[] = []
  for (const d of readdirSync(dizin, { withFileTypes: true })) {
    if (!d.isDirectory()) continue
    const m = readManifest(repoRoot, d.name as RunId)
    if (m !== null) out.push(m)
  }
  return out
}

export const butceOku = (
  repoRoot: string
): {
  readonly value: ButceTavanlari
  readonly varsayilan: boolean
  readonly hata: string | null
} => {
  const yol = join(repoRoot, BUTCE_YOLU)
  if (!existsSync(yol)) return { value: VARSAYILAN_BUTCE, varsayilan: true, hata: null }
  const r = parseButce(readFileSync(yol, 'utf8'))
  // Bozuk dosya SESSİZCE varsayılana düşmez — hata görünür ve panoda yazar.
  return r.ok
    ? { value: r.value, varsayilan: false, hata: null }
    : {
        value: VARSAYILAN_BUTCE,
        varsayilan: true,
        hata: r.errors.map(butceHatasiMesaji).join(' · '),
      }
}

export const butcePanosu = (repoRoot: string): ButcePanosu => {
  const b = butceOku(repoRoot)
  const calistirmalar: CalistirmaMaliyeti[] = []
  let toplam = 0n

  for (const m of manifestler(repoRoot)) {
    const c = costSummary(m)
    const v = costVariance(m)
    toplam += c.actual.micros
    calistirmalar.push({
      runId: m.runId,
      pipeline: m.pipeline,
      createdAt: m.createdAt,
      tahminAltMikros: c.estimatedLow.micros.toString(),
      tahminUstMikros: c.estimatedHigh.micros.toString(),
      gercekMikros: c.actual.micros.toString(),
      sapmaYuzde: v.variancePercent,
      onemli: v.significant,
    })
  }

  // En YENİ üstte: "bu ay ne harcadım" sorusu geçmişten bugüne değil, bugünden geriye
  // sorulur.
  calistirmalar.sort((a, z) => z.createdAt.localeCompare(a.createdAt))

  return {
    tavan: {
      perRunMicros: b.value.perRunMicros === null ? null : b.value.perRunMicros.toString(),
      perMonthMicros: b.value.perMonthMicros === null ? null : b.value.perMonthMicros.toString(),
      updatedAt: b.value.updatedAt,
      varsayilan: b.varsayilan,
    },
    calistirmalar,
    toplamGercekMikros: toplam.toString(),
    sapan: calistirmalar.filter((x) => x.onemli).length,
    kota: null,
  }
}

export type TavanYazSonuc =
  { readonly ok: true; readonly yol: string } | { readonly ok: false; readonly hata: string }

/**
 * Tavanı yazar. **Git commit'i İNSANIN işidir** (R-14) — bu fonksiyon yalnız dosyayı
 * günceller; değişiklik `git diff`te görünür ve kullanıcı commit eder.
 *
 * Doğrulama YAZMADAN ÖNCE: geçersiz bir tavanı diske yazıp sonra reddetmek, bir sonraki
 * çalıştırmanın okuyamayacağı bir dosya bırakırdı.
 */
export const tavanYaz = (
  repoRoot: string,
  govde: { readonly perRunMicros?: string | null; readonly perMonthMicros?: string | null },
  simdi: string
): TavanYazSonuc => {
  const yeni = serializeButce({
    perRunMicros:
      govde.perRunMicros === null || govde.perRunMicros === undefined
        ? null
        : BigInt(govde.perRunMicros),
    perMonthMicros:
      govde.perMonthMicros === null || govde.perMonthMicros === undefined
        ? null
        : BigInt(govde.perMonthMicros),
    updatedAt: simdi,
  })

  const kontrol = parseButce(yeni)
  if (!kontrol.ok) {
    return { ok: false, hata: kontrol.errors.map(butceHatasiMesaji).join(' · ') }
  }

  writeFileSync(join(repoRoot, BUTCE_YOLU), yeni)
  return { ok: true, yol: BUTCE_YOLU }
}
