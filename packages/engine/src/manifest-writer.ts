// Run manifest yazıcı (§13 · R-11, R-52 · FAZ-3.13).
//
// **Manifest'siz çıktı bir hatadır.** Manifest, altı ay sonra "bu görsel neden böyle,
// ne kadara mal oldu, hangi bilgi ağacından üretildi" sorusunun tek cevabı. Corpus'tan
// üretilemez: bir çalıştırmanın maliyeti ve hangi sağlayıcıya ne gönderildiği başka
// hiçbir yerde yazmıyor (D-38). Bu yüzden `derived/runs/` **silinmez** (R-52).
//
// **Yol kernel'den gelir, burada KURULMAZ.** `manifest-yazici` darboğazı `derived/runs`
// dizesini `kernel/src/manifest.ts`e kilitliyor; yolu ikinci bir dosyaya yazmak defterin
// iki yere düşmesi ve birinin yedeklenmemesi demektir.
//
// **Tahmini vs gerçek maliyet ikisi de yazılır.** Tahmin gerçekten KOPYALANMAZ (§8.3):
// kopyalasaydık sapma raporu yapısal olarak sıfır çıkardı — yani hiç ölçmemekle aynı şey.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import type { Money, RunId } from '@suite/contracts'
import type { FrozenPlan } from './plan/freeze.js'
import { usd } from '@suite/contracts'
import {
  headSha,
  inspectManifest,
  isPublishable,
  manifestPath,
  planPath,
  runDir,
  type ManifestDefect,
  type RunManifest,
  type StepRecord,
} from '@suite/kernel'

// ── bigint serileştirme ──────────────────────────────────────────────────────
//
// **`JSON.stringify` bir `bigint`i serileştiremez — atar.** Para `bigint` USD mikro
// olduğu için (R-41) manifest bu düzeltme olmadan HİÇ yazılamıyordu; testi yazmasaydık
// bunu ancak ilk gerçek çalıştırmada, para harcandıktan sonra öğrenirdik.
//
// Sözleşme: `bigint` → **ondalık DİZE**. Number'a çevirmek yasak — 2^53 üstü mikro
// değerler sessizce yuvarlanır ve maliyet defteri yanlış toplar; dize hiçbir şey
// kaybetmez ve `git diff`te okunabilir kalır.

const bigintDizeye = (_k: string, v: unknown): unknown => (typeof v === 'bigint' ? v.toString() : v)

/**
 * Okurken geri çevirir. Şekil tabanlı: `{ micros: <dize>, currency: <dize> }` bir
 * `Money`dir. Alan ADINA göre çevirmek daha kırılgan olurdu — `micros` başka bir
 * bağlamda gerçekten dize olabilir; ikili şekil ise `Money`ye özgü.
 */
const dizeBiginte = (_k: string, v: unknown): unknown => {
  if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
    const o = v as Record<string, unknown>
    if (typeof o['micros'] === 'string' && typeof o['currency'] === 'string') {
      return { micros: BigInt(o['micros']), currency: o['currency'] }
    }
  }
  return v
}

export interface WriteInput {
  readonly repoRoot: string
  readonly manifest: RunManifest
}

export type WriteResult =
  | { readonly ok: true; readonly path: string }
  /** **Kusurlu manifest YAZILMAZ.** Yarım bir defter, defter olmadığını söylemez. */
  | { readonly ok: false; readonly defects: readonly ManifestDefect[] }

/**
 * Manifest'i `derived/runs/<run_id>/manifest.json` altına yazar.
 *
 * Yazmadan ÖNCE denetler: `inspectManifest` kusur bulursa dosya hiç oluşmaz. Kusurlu bir
 * manifest yazmak, en tehlikeli sonuç olurdu — "manifest var" kontrolü geçer ve içindeki
 * eksik, ancak birileri açıp okuduğunda fark edilir.
 */
export const writeManifest = (input: WriteInput): WriteResult => {
  const kusurlar = inspectManifest(input.manifest)
  if (kusurlar.length > 0) return { ok: false, defects: kusurlar }

  const rel = manifestPath(input.manifest.runId)
  const mutlak = join(input.repoRoot, rel)
  mkdirSync(dirname(mutlak), { recursive: true })
  writeFileSync(mutlak, `${JSON.stringify(input.manifest, bigintDizeye, 2)}\n`)
  return { ok: true, path: rel }
}

export const readManifest = (repoRoot: string, runId: RunId): RunManifest | null => {
  const mutlak = join(repoRoot, manifestPath(runId))
  if (!existsSync(mutlak)) return null
  try {
    return JSON.parse(readFileSync(mutlak, 'utf8'), dizeBiginte) as RunManifest
  } catch {
    return null
  }
}

/**
 * Varlık yayınlanabilir mi — **manifest'siz varlık yayınlanamaz** (§13).
 *
 * İki ayrı soru soruluyor: manifest VAR MI ve manifest TEMİZ Mİ. İkincisi olmadan boş
 * bir `{}` dosyası "manifest var" sayılırdı.
 */
export const canPublish = (repoRoot: string, runId: RunId): boolean =>
  isPublishable(readManifest(repoRoot, runId))

// ── donmuş plan: kararın diskteki hâli (§13 · R-07 · FAZ-4.15) ──────────────
//
// **Diske yazılmayan bir karar tekrarlanamaz.** Donmuş plan şimdiye kadar yalnız
// süreç belleğinde ve HTTP cevabında yaşıyordu: `launcherPlani` üretiyor, `runPipeline`
// geri alıyor, süreç bitince kayboluyordu. Yani `rerun` ("kararı tekrarla") diye bir
// düğme koysaydık, o düğme sessizce `replay`e ("bugünün tanımıyla koş") dönerdi ve
// ekran yalan söylerdi — tam da 4.15'in engellemek için var olduğu şey.
//
// Manifest'ten TÜRETİLEMEZ: manifest gerçekleşen adımı yazar, donmuş plan onay anındaki
// alternatifleri, kısıtları ve kayıt kümesini. Bu yüzden ayrı dosya, aynı append-only
// dizinde (D-38).

export const writeFrozenPlan = (
  repoRoot: string,
  plan: FrozenPlan
): { readonly ok: true; readonly path: string } => {
  const rel = planPath(plan.runId)
  const mutlak = join(repoRoot, rel)
  mkdirSync(dirname(mutlak), { recursive: true })
  writeFileSync(mutlak, `${JSON.stringify(plan, bigintDizeye, 2)}\n`)
  return { ok: true, path: rel }
}

/** `null` = donmuş plan YOK. "Boş plan" değil — rerun'un mümkün olmadığı anlamına gelir. */
export const readFrozenPlan = (repoRoot: string, runId: RunId): FrozenPlan | null => {
  const mutlak = join(repoRoot, planPath(runId))
  if (!existsSync(mutlak)) return null
  try {
    return JSON.parse(readFileSync(mutlak, 'utf8'), dizeBiginte) as FrozenPlan
  } catch {
    return null
  }
}

export interface CostVariance {
  readonly estimatedLow: Money
  readonly estimatedHigh: Money
  readonly actual: Money
  /** Gerçek / tahmin-üst oranı, yüzde. `null` = tahmin sıfır, oran tanımsız. */
  readonly variancePercent: number | null
  /** %20 üstü sapma `doctor` ekranına düşer (§16). */
  readonly significant: boolean
}

const topla = (steps: readonly StepRecord[], sec: (s: StepRecord) => bigint): Money =>
  usd(steps.reduce((t, s) => t + sec(s), 0n))

/**
 * Tahmini vs gerçek sapma.
 *
 * Oran **tahminin ÜST sınırına** göre: kullanıcı onaylarken gördüğü sayı odur ve sapma
 * "onayladığım rakamı aştı mı" sorusunu cevaplamalı. Ortalamaya göre hesaplasaydık her
 * çalıştırma yarı yarıya sapmış görünürdü ve %20 eşiği anlamını kaybederdi.
 */
export const costVariance = (m: RunManifest): CostVariance => {
  const low = topla(m.steps, (s) => s.estimatedCost.low.micros)
  const high = topla(m.steps, (s) => s.estimatedCost.high.micros)
  const actual = topla(m.steps, (s) => s.actualCost?.micros ?? 0n)

  const oran =
    high.micros === 0n
      ? null
      : Math.round((Number(actual.micros) / Number(high.micros)) * 10000) / 100 - 100

  return {
    estimatedLow: low,
    estimatedHigh: high,
    actual,
    variancePercent: oran,
    significant: oran !== null && Math.abs(oran) > 20,
  }
}

/**
 * Bilgi ağacı commit SHA'sı — replay'i GERÇEK yapan alan (§13).
 *
 * Git çağrısı `kernel/src/git.ts` üzerinden (`git-cagiran` darboğazı). Repo kirliyse
 * SHA yine döner ama o SHA çalışma ağacını TEMSİL ETMEZ; çağıran bunu bilmeli, o yüzden
 * `dirty` ayrı bir alan olarak dönüyor — sessizce yutmak, replay'in yalan söylemesidir.
 */
export const knowledgeCommit = async (
  repoRoot: string,
  env: Readonly<Record<string, string>>
): Promise<{ readonly sha: string; readonly ok: boolean }> => {
  // Ortam AÇIKÇA veriliyor (§14): `PATH` olmadan `git` bulunamaz ve `process.env`e
  // dokunmak `secret-okuyucu` darboğazını çiğnerdi.
  const r = await headSha({ cwd: repoRoot, env })
  return r.ok ? { sha: r.value, ok: true } : { sha: '', ok: false }
}

/** `derived/runs/<run_id>/` — varlık ve adım çıktıları buraya iner. */
export const runOutputDir = (repoRoot: string, runId: RunId): string =>
  join(repoRoot, runDir(runId))
