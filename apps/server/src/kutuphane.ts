// Asset Library (§12.9, §3.5 · FAZ-4.14).
//
// Kütüphanenin tek işi **harcanmış paranın karşılığını görünür kılmak**: premium bir
// varlık üretilmiş ama hiç yayınlanmamışsa, o para değere dönüşmemiştir ve bunu ancak
// filtreleyerek görürsünüz.
//
// **Reuse birinci sınıf eylem.** Benzer bir iş geldiğinde LLM'i yeniden çalıştırmak
// yerine mevcut çalıştırmanın donmuş girdilerini kopyalayıp düzenlemek hem ucuz hem
// tutarlı (§4c). Kütüphane bu yüzden varlığı DEĞİL, varlığı ÜRETEN çalıştırmayı
// gösterir — kopyalanacak olan bayt değil, karardır.
//
// **Karantina kütüphaneye GİRMEZ ama SAYILIR.** `derived/karantina/`daki 14 varlık
// kusurlu manifest'lerden üretildi (D-155) ve yayınlanamaz. Listeye koymak onları
// kullanılabilir gösterirdi; hiç saymamak ise boş bir kütüphaneyi açıklanamaz yapardı.

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { RUNS_DIR, publishedLedgerPath, type RunManifest } from '@suite/kernel'
import type { RunId } from '@suite/contracts'
import { readManifest } from '@suite/engine'

/** `.meta.json` sidecar — biçim `blobs.ts`ten OKUNDU, uydurulmadı (D-163). */
interface BlobMeta {
  readonly digest: string
  readonly ext: string
  readonly bytes: number
  readonly sourceRunId: string
  readonly createdAt: string
  readonly stamp?: { readonly brandId?: string; readonly eraId?: string }
  readonly compliance?: { readonly containsSyntheticPerson?: boolean }
}

export interface VarlikSatiri {
  readonly digest: string
  readonly ext: string
  readonly bytes: number
  readonly createdAt: string
  readonly sourceRunId: string
  readonly brandId: string
  readonly eraId: string
  /** Üreten çalıştırmanın hattı — Reuse bunu kopyalar. */
  readonly pipeline: string
  /** Çalıştırma konusu (`params.topic`) — aramanın asıl hedefi. */
  readonly konu: string
  /** Bu varlığı üreten adımın şeridi. `null` = adım bulunamadı. */
  readonly lane: 'free' | 'premium' | null
  /** Üreten adımın GERÇEK maliyeti, USD mikro dize. */
  readonly harcananMikros: string
  /** Yayın defterinde var mı. Defter yoksa `false` — ve `defterYok` ayrı bildirilir. */
  readonly yayinlandi: boolean
  /** Manifest kusursuz mu (D-155). Kusurluysa varlık zaten yayınlanamaz. */
  readonly manifestSaglam: boolean
}

export interface Kutuphane {
  readonly varliklar: readonly VarlikSatiri[]
  /** Karantinadaki varlık sayısı — listeye GİRMEZ ama sayılır (D-155). */
  readonly karantina: number
  /**
   * Yayın defteri hiç YOK mu. `true` ise "yayınlanmadı" bilgisi bir ÖLÇÜM değil,
   * bir varsayımdır — ve fark söylenmeli (§12.6).
   */
  readonly yayinDefteriYok: boolean
  /** Premium üretilip yayınlanmamış varlıkların toplam maliyeti. */
  readonly bosaHarcananMikros: string
}

const metaOku = (yol: string): BlobMeta | null => {
  try {
    const d = JSON.parse(readFileSync(yol, 'utf8')) as BlobMeta
    return typeof d.digest === 'string' ? d : null
  } catch {
    return null
  }
}

const dosyalariGez = (kok: string): readonly string[] => {
  if (!existsSync(kok)) return []
  const out: string[] = []
  const yur = (d: string): void => {
    for (const ad of readdirSync(d)) {
      const t = join(d, ad)
      if (statSync(t).isDirectory()) yur(t)
      else if (ad.endsWith('.meta.json')) out.push(t)
    }
  }
  yur(kok)
  return out
}

/** Yayınlanmış digest'ler. Defter yoksa BOŞ küme — "hiçbiri yayınlanmadı" DEMEK DEĞİL. */
const yayinlananlar = (repoRoot: string): { set: ReadonlySet<string>; yok: boolean } => {
  const yol = join(repoRoot, publishedLedgerPath())
  if (!existsSync(yol)) return { set: new Set(), yok: true }
  const s = new Set<string>()
  for (const satir of readFileSync(yol, 'utf8').split('\n')) {
    if (satir.trim() === '') continue
    try {
      const d = JSON.parse(satir) as { digest?: string }
      if (typeof d.digest === 'string') s.add(d.digest)
    } catch {
      // Bozuk satır atlanır ama defter "yok" sayılmaz: dosya var, bir satırı bozuk.
    }
  }
  return { set: s, yok: false }
}

const manifestBul = (
  repoRoot: string,
  runId: string,
  onbellek: Map<string, RunManifest | null>
): RunManifest | null => {
  const v = onbellek.get(runId)
  if (v !== undefined) return v
  const m = readManifest(repoRoot, runId as RunId)
  onbellek.set(runId, m)
  return m
}

export const kutuphane = (repoRoot: string): Kutuphane => {
  const yayin = yayinlananlar(repoRoot)
  const onbellek = new Map<string, RunManifest | null>()
  const varliklar: VarlikSatiri[] = []
  let bosa = 0n

  for (const metaYolu of dosyalariGez(join(repoRoot, 'derived/blobs'))) {
    const meta = metaOku(metaYolu)
    if (meta === null) continue
    const m = manifestBul(repoRoot, meta.sourceRunId, onbellek)

    // Varlığı ÜRETEN adım: `output`unda bu digest'i taşıyan ya da metered olan ilk adım.
    const adim =
      m?.steps.find((s) => JSON.stringify(s.output ?? {}).includes(meta.digest)) ??
      m?.steps.find((s) => s.actualCost !== null) ??
      null

    const konu = (() => {
      for (const s of m?.steps ?? []) {
        const t = (s.params as { topic?: unknown } | undefined)?.topic
        if (typeof t === 'string' && t !== '') return t
      }
      return ''
    })()

    const yayinlandi = yayin.set.has(meta.digest)
    const harcanan = adim?.actualCost?.micros ?? 0n
    const lane = adim?.lane ?? null
    if (lane === 'premium' && !yayinlandi) bosa += harcanan

    varliklar.push({
      digest: meta.digest,
      ext: meta.ext,
      bytes: meta.bytes,
      createdAt: meta.createdAt,
      sourceRunId: meta.sourceRunId,
      brandId: meta.stamp?.brandId ?? '',
      eraId: meta.stamp?.eraId ?? '',
      pipeline: m?.pipeline ?? '',
      konu,
      lane,
      harcananMikros: harcanan.toString(),
      yayinlandi,
      manifestSaglam: m === null ? false : /^[0-9a-f]{40}$/.test(m.corpusCommit),
    })
  }

  // En YENİ üstte: kütüphaneye "en son ne ürettim" diye bakılır.
  varliklar.sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return {
    varliklar,
    karantina: dosyalariGez(join(repoRoot, 'derived/karantina')).length,
    yayinDefteriYok: yayin.yok,
    bosaHarcananMikros: bosa.toString(),
  }
}

/** `derived/runs/<id>` var mı — Reuse'ün ön koşulu. */
export const yenidenKullanilabilir = (repoRoot: string, runId: string): boolean =>
  existsSync(join(repoRoot, RUNS_DIR, runId, 'manifest.json'))
