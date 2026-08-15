// Run History / Provenance Browser (§13, §12.9 · D-38 · FAZ-4.15).
//
// Her manifest bir ZAMAN ÇİZGİSİDİR: hangi bilgi ağacından, hangi sağlayıcılarla, kaça,
// hangi insan kararlarıyla. Ayrı bir izleme altyapısı yok (Langfuse, MLflow, W&B — üçü de
// self-host'ta Postgres+ClickHouse demek, ilke 12'ye düşman). Defter zaten git'te.
//
// **`rerun` ve `replay` AYRI eylemlerdir ve bu ekran farkı gizlemez:**
//
//   rerun   → DONMUŞ planı tekrar koşar. Aynı sağlayıcı, aynı kısıt, aynı seed, aynı
//             kayıt kümesi. **Kararı tekrarlar.**
//   replay  → BUGÜNÜN tanımıyla yeniden planlar. Corpus değiştiyse yeni bilgi, sağlayıcı
//             fiyatı değiştiyse yeni maliyet, model emekliyse başka model.
//
// **Ve rerun bile aynı ESERİ vermez.** Medya uçlarının çoğu deterministik değil; aynı
// prompt aynı seed ile bile farklı byte üretebilir. Bunu söylemeyen bir ekran, kullanıcıyı
// "bu bir bug" sanmaya iter ve o an sistemin geri kalanına olan güvenini de kaybeder.
// Bu yüzden belirsizlik bir dipnot değil, ÖLÇÜLMÜŞ bir liste: hangi adımlar, neden.

import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { RUNS_DIR, costSummary, inspectManifest, type RunManifest } from '@suite/kernel'
import type { RunId } from '@suite/contracts'
import {
  costVariance,
  planStale,
  readFrozenPlan,
  readManifest,
  staleMessage,
  type FrozenPlan,
  type StaleCheck,
} from '@suite/engine'

/** Ekranın açıkça yazdığı cümle. Metin BURADA yaşar: iki yüzeyde iki farklı cümle olamaz. */
export const RERUN_UYARISI =
  'rerun kararı tekrarlar, ESERİ değil — aynı plan aynı byte’ları garanti etmez'

/**
 * Çıktısı dış dünyaya bağlı fiiller. Bir sağlayıcı ya da kanal çağıran adım, aynı
 * girdiyle bile farklı sonuç verebilir; `COMPOSE` (saf) ve `RENDER` (tek motor, aynı
 * font, aynı token) için bu geçerli değil — orada belirsizliğin kaynağı girdilerdir ve
 * girdiler donmuş plana zaten dahil.
 */
const DIS_DUNYA: ReadonlySet<string> = new Set(['GENERATE', 'INGEST', 'PUBLISH'])

export interface AdayGorunumu {
  readonly providerId: string
  readonly selected: boolean
  /** Elendiyse NEDEN — kaybedenleri saklamak yönlendirmeyi sihre çevirir (§4.4). */
  readonly rejectionReason: string | null
}

export interface AdimSatiri {
  readonly stepId: string
  readonly verb: string
  readonly status: 'ok' | 'failed' | 'skipped'
  readonly lane: 'free' | 'premium'
  readonly capability: string | null
  readonly providerId: string | null
  readonly model: string | null
  readonly seed: number | null
  readonly tahminAltMikros: string
  readonly tahminUstMikros: string
  /** Adım koşmadıysa `null` — `'0'` DEĞİL. "Bedavaya koştu" ile "hiç koşmadı" ayrı. */
  readonly gercekMikros: string | null
  readonly adaylar: readonly AdayGorunumu[]
  readonly startedAt: string | null
  readonly finishedAt: string | null
  /** Duvar saati, ms. Zaman damgalarından biri yoksa `null`. */
  readonly sureMs: number | null
  readonly ozet: Readonly<Record<string, unknown>> | null
}

export interface CalistirmaOzeti {
  readonly runId: string
  readonly pipeline: string
  readonly brandId: string
  readonly eraId: string
  readonly createdAt: string
  readonly corpusCommit: string
  readonly registryCommit: string
  readonly adimSayisi: number
  readonly tahminUstMikros: string
  readonly gercekMikros: string
  readonly sapmaYuzde: number | null
  readonly onemli: boolean
  readonly awaitingGate: string | null
  readonly stoppedAt: string | null
  readonly kararSayisi: number
  /** Manifest kusursuz mu (D-155). Kusurluysa çıktı yayınlanamaz. */
  readonly manifestSaglam: boolean
  /** Donmuş plan diskte var mı — **`rerun`un tek ön koşulu**. */
  readonly donmusPlanVar: boolean
}

export interface TekrarSecenegi {
  readonly kind: 'rerun' | 'replay'
  readonly mumkun: boolean
  /** Mümkün değilse NEDEN. Düğmeyi sessizce gizlemek, kullanıcıya seçeneği anlatmaz. */
  readonly neden: string | null
  readonly ne: string
}

export interface BelirsizAdim {
  readonly stepId: string
  readonly verb: string
  readonly seedli: boolean
  readonly neden: string
}

export interface TekrarKarsilastirmasi {
  readonly rerun: TekrarSecenegi
  readonly replay: TekrarSecenegi
  /**
   * Donmuş plan ile BUGÜNÜN dünyası arasındaki farklar.
   * `rerun` bunları YOK SAYAR (kararı tekrarlar), `replay` BENİMSER — fark tam da budur.
   */
  readonly sapmalar: readonly string[]
  /** Donmuş plan yoksa sapma HESAPLANAMAZ. Boş liste "fark yok" demek DEĞİLDİR (§12.6). */
  readonly sapmaOlculdu: boolean
  readonly belirsizAdimlar: readonly BelirsizAdim[]
  readonly uyari: string
}

export interface CalistirmaDetayi {
  readonly ozet: CalistirmaOzeti
  readonly adimlar: readonly AdimSatiri[]
  readonly kararlar: readonly {
    readonly gate: string
    readonly decision: string
    readonly at: string
    readonly note: string | null
  }[]
  /** Enjekte edilen bağlam — bölüm başına token toplamı ve kayıt id'leri (§5.3). */
  readonly baglam: readonly {
    readonly section: string
    readonly tokens: number
    readonly kayitlar: readonly { readonly recordId: string; readonly reason: string }[]
  }[]
  readonly tekrar: TekrarKarsilastirmasi
  /** Donmuş plandaki kayıt id'leri — `rerun` tam olarak bunlarla koşar. */
  readonly donmusKayitlar: readonly string[]
}

const runIdleri = (repoRoot: string): readonly string[] => {
  const dizin = join(repoRoot, RUNS_DIR)
  if (!existsSync(dizin)) return []
  return readdirSync(dizin, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
}

const ozetle = (m: RunManifest, donmusPlanVar: boolean): CalistirmaOzeti => {
  const c = costSummary(m)
  const v = costVariance(m)
  return {
    runId: m.runId,
    pipeline: m.pipeline,
    brandId: m.brandId,
    eraId: m.eraId,
    createdAt: m.createdAt,
    corpusCommit: m.corpusCommit,
    registryCommit: m.registryCommit,
    adimSayisi: m.steps.length,
    tahminUstMikros: c.estimatedHigh.micros.toString(),
    gercekMikros: c.actual.micros.toString(),
    sapmaYuzde: v.variancePercent,
    onemli: v.significant,
    awaitingGate: m.awaitingGate ?? null,
    stoppedAt: m.stoppedAt ?? null,
    kararSayisi: m.decisions.length,
    manifestSaglam: inspectManifest(m).length === 0,
    donmusPlanVar,
  }
}

/** En YENİ üstte: geçmişe "en son ne koştu" diye bakılır. */
export const calistirmalar = (repoRoot: string): readonly CalistirmaOzeti[] => {
  const out: CalistirmaOzeti[] = []
  for (const id of runIdleri(repoRoot)) {
    const m = readManifest(repoRoot, id as RunId)
    if (m === null) continue
    out.push(ozetle(m, readFrozenPlan(repoRoot, id as RunId) !== null))
  }
  return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

/**
 * Aynı eseri veremeyecek adımlar — **ölçülmüş, varsayılmamış**.
 *
 * Seed'in varlığı belirsizliği KALDIRMAZ, azaltır: sağlayıcıların çoğu aynı seed için
 * aynı çıktıyı sözleşmeyle taahhüt etmiyor. İkisini tek etikete sıkıştırmak (D-177)
 * "seed verdim, garanti aldım" yanılgısını üretirdi.
 */
export const belirsizAdimlar = (m: RunManifest): readonly BelirsizAdim[] =>
  m.steps
    .filter((s) => DIS_DUNYA.has(s.verb))
    .map((s) => ({
      stepId: s.stepId,
      verb: s.verb,
      seedli: s.seed !== null,
      neden:
        s.seed === null
          ? 'seed yok — sağlayıcı her çağrıda başka bir eser üretebilir'
          : `seed ${String(s.seed)} sabit, ama sağlayıcı aynı seed için aynı çıktıyı taahhüt etmiyor`,
    }))

const REPLAY_NE =
  'bugünün corpus, registry ve sağlayıcı tanımıyla YENİDEN planlar — sonuç farklı olabilir, olması beklenir'
const RERUN_NE =
  'donmuş planı aynen koşar: aynı sağlayıcı, aynı kısıt, aynı seed, aynı kayıt kümesi'

export const tekrarSecenekleri = (
  m: RunManifest,
  frozen: FrozenPlan | null,
  dunya: StaleCheck | null
): TekrarKarsilastirmasi => {
  // Sapma ancak donmuş plan VE bugünün dünyası birlikte varsa ölçülebilir. Ölçülmediyse
  // boş liste gösterip "fark yok" izlenimi vermek, ölçmemekten daha kötü olurdu (D-175).
  const olculdu = frozen !== null && dunya !== null
  const sapmalar = olculdu ? planStale(frozen, dunya).map(staleMessage) : []

  return {
    rerun: {
      kind: 'rerun',
      mumkun: frozen !== null,
      neden:
        frozen === null
          ? 'donmuş plan diskte yok — bu çalıştırmanın KARARI kaydedilmemiş, tekrarlanamaz'
          : null,
      ne: RERUN_NE,
    },
    replay: {
      kind: 'replay',
      // Hattın adı manifest'te; bugün o hat hâlâ var mı sorusunun cevabı çalıştırma
      // anında verilir. Replay'i burada kilitlemek, "bugünün tanımı" fikrine aykırı.
      mumkun: true,
      neden: null,
      ne: REPLAY_NE,
    },
    sapmalar,
    sapmaOlculdu: olculdu,
    belirsizAdimlar: belirsizAdimlar(m),
    uyari: RERUN_UYARISI,
  }
}

const sureHesapla = (bas: string | null, bit: string | null): number | null => {
  if (bas === null || bit === null) return null
  const a = Date.parse(bas)
  const b = Date.parse(bit)
  return Number.isNaN(a) || Number.isNaN(b) ? null : b - a
}

export const calistirmaDetayi = (
  repoRoot: string,
  runId: string,
  dunya: StaleCheck | null
): CalistirmaDetayi | null => {
  const m = readManifest(repoRoot, runId as RunId)
  if (m === null) return null
  const frozen = readFrozenPlan(repoRoot, runId as RunId)

  const adimlar: AdimSatiri[] = m.steps.map((s) => ({
    stepId: s.stepId,
    verb: s.verb,
    status: s.status ?? 'ok',
    lane: s.lane,
    capability: s.capability,
    providerId: s.providerId,
    model: s.model,
    seed: s.seed,
    tahminAltMikros: s.estimatedCost.low.micros.toString(),
    tahminUstMikros: s.estimatedCost.high.micros.toString(),
    gercekMikros: s.actualCost === null ? null : s.actualCost.micros.toString(),
    adaylar: s.candidates.map((k) => ({
      providerId: k.providerId,
      selected: k.selected,
      rejectionReason: k.rejectionReason,
    })),
    startedAt: s.startedAt,
    finishedAt: s.finishedAt,
    sureMs: sureHesapla(s.startedAt, s.finishedAt),
    ozet: s.output ?? null,
  }))

  // Bağlam bölüm bazında toplanır: "hangi bölüm kaç token yedi" sorusu kayıt bazında
  // cevaplanamaz ve token bütçesi bölüm başınadır (§5.3).
  const bolumler = new Map<
    string,
    { tokens: number; kayitlar: { recordId: string; reason: string }[] }
  >()
  for (const e of m.context) {
    const mevcut = bolumler.get(e.section) ?? { tokens: 0, kayitlar: [] }
    mevcut.tokens += e.tokens
    mevcut.kayitlar.push({ recordId: e.recordId, reason: e.reason })
    bolumler.set(e.section, mevcut)
  }

  return {
    ozet: ozetle(m, frozen !== null),
    adimlar,
    kararlar: m.decisions.map((d) => ({
      gate: d.gate,
      decision: d.decision,
      at: d.at,
      note: d.note,
    })),
    baglam: [...bolumler.entries()].map(([section, v]) => ({
      section,
      tokens: v.tokens,
      kayitlar: v.kayitlar,
    })),
    tekrar: tekrarSecenekleri(m, frozen, dunya),
    donmusKayitlar: frozen?.recordIds ?? [],
  }
}
