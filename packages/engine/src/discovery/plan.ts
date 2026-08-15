// Keşif planı — **hiçbir şey harcamayan, hiçbir şey yazmayan** op listesi (§4.4 · D-6).
//
// `plan` bir ÖNERİ listesidir; `apply` onu uygular ve `apply` bile commit atmaz
// (onay insanın commit'i — R-14). Bu ayrım keşif motorunun tamamıdır: motor yazmaz,
// motor **fark üretir**.
//
// **Aynı yolları yeniden yazar** (D-30): `corpus/positioning/x.md` regenere edildiğinde
// yine `corpus/positioning/x.md` olur, `corpus/eras/2026/positioning/x.md` olmaz.
// Sebep işlevsel: `git diff` ancak aynı yol için satır bazlı fark gösterebilir.
// Klasör kopyalayan bir tasarımda her regenerasyon "N yeni dosya" olarak görünür,
// insan okumadan kabul eder ve yönetişim tiyatroya döner.

export type DiscoveryMode = 'merge' | 'mirror'

export type OpKind = 'create' | 'update' | 'retire' | 'skip'

export interface DiscoveryOp {
  readonly kind: OpKind
  /** Corpus'a göre yol — AYNI yol, dönem klasörü YOK. */
  readonly path: string
  readonly recordId: string
  /** Neden bu op önerildi. İnceleyen insan bunu okur. */
  readonly reason: string
  /** `skip` için: hangi imza eşleştiği. Idempotent atlamanın kanıtı. */
  readonly digest: string
}

export interface DiscoveryPlan {
  readonly runId: string
  readonly brandId: string
  readonly eraSlug: string
  readonly mode: DiscoveryMode
  readonly ops: readonly DiscoveryOp[]
  /** İnsanın okuyacağı özet. `skip` sayısı BURADA görünür: sıfır op da bir sonuçtur. */
  readonly summary: {
    readonly create: number
    readonly update: number
    readonly retire: number
    readonly skip: number
  }
}

/** Corpus'ta bugün var olan kayıt. */
export interface ExistingRecord {
  readonly id: string
  readonly path: string
  /** `zone: generated` kayıtların imzası; elle yazılmışlarda null. */
  readonly signature: string | null
  readonly zone: 'generated' | 'human' | 'imported'
}

/** Keşfin ürettiği aday kayıt. */
export interface CandidateRecord {
  readonly id: string
  readonly path: string
  /** `(input_hashes, prompt_hash, model_id, temperature, seed, retrieval_snapshot)` özeti. */
  readonly digest: string
}

/**
 * Op listesini üretir. **Saf**: dosya okumaz, ağ kullanmaz, saat okumaz.
 *
 * `merge` yalnız ekler ve günceller — silmez. Aylık tazeleme bu moddadır ve
 * varsayılandır: bir kayıt "artık üretilmiyor" diye silinirse, o kayda atıf veren
 * varlıklar sessizce dayanaksız kalır.
 *
 * `mirror` "hepsini baştan yap" düğmesidir: adayda olmayan üretilmiş kayıtlar
 * **emekliye ayrılır** (silinmez — R-12).
 */
export const buildPlan = (input: {
  readonly runId: string
  readonly brandId: string
  readonly eraSlug: string
  readonly mode: DiscoveryMode
  readonly existing: readonly ExistingRecord[]
  readonly candidates: readonly CandidateRecord[]
}): DiscoveryPlan => {
  const mevcut = new Map(input.existing.map((r) => [r.id, r]))
  const aday = new Map(input.candidates.map((r) => [r.id, r]))
  const ops: DiscoveryOp[] = []

  for (const c of input.candidates) {
    const e = mevcut.get(c.id)
    if (e === undefined) {
      ops.push({
        kind: 'create',
        path: c.path,
        recordId: c.id,
        reason: 'yeni kayıt',
        digest: c.digest,
      })
      continue
    }
    // Elle düzenlenmiş kayda motor DOKUNMAZ. `zone: human` kullanıcının emeğidir;
    // üzerine yazmak, sistemi bir daha açmamanın en kısa yoludur (§4.5).
    if (e.zone === 'human') {
      ops.push({
        kind: 'skip',
        path: e.path,
        recordId: e.id,
        reason: 'zone: human — motor elle yazılmış kayda dokunmaz',
        digest: c.digest,
      })
      continue
    }
    // **Idempotent atlama zorunlu altyapıdır** (§4.4): imza aynıysa op üretilmez.
    // Üretilseydi ikinci çalıştırma 900 op verirdi, insan hepsini kabul ederdi ve
    // "insan inceledi" güvencesi sahte olurdu.
    if (e.signature !== null && e.signature === c.digest) {
      ops.push({
        kind: 'skip',
        path: e.path,
        recordId: e.id,
        reason: 'imza aynı — değişmedi',
        digest: c.digest,
      })
      continue
    }
    ops.push({
      kind: 'update',
      path: c.path,
      recordId: c.id,
      reason: e.signature === null ? 'imzasız üretilmiş kayıt' : 'imza değişti',
      digest: c.digest,
    })
  }

  if (input.mode === 'mirror') {
    for (const e of input.existing) {
      if (aday.has(e.id)) continue
      // Elle yazılmış kayıt mirror'da da korunur: "hepsini baştan yap" kullanıcının
      // kendi yazdığını silmek demek değildir.
      if (e.zone === 'human') continue
      ops.push({
        kind: 'retire',
        path: e.path,
        recordId: e.id,
        reason: 'mirror modunda adayda yok — emekliye ayrılıyor (silinmiyor, R-12)',
        digest: e.signature ?? '',
      })
    }
  }

  const say = (k: OpKind): number => ops.filter((o) => o.kind === k).length
  return {
    runId: input.runId,
    brandId: input.brandId,
    eraSlug: input.eraSlug,
    mode: input.mode,
    ops,
    summary: {
      create: say('create'),
      update: say('update'),
      retire: say('retire'),
      skip: say('skip'),
    },
  }
}

/** İnsan gözü için. **Sıfır op da bir sonuçtur** ve öyle yazılır. */
export const formatPlan = (p: DiscoveryPlan): string => {
  const s = p.summary
  const degisen = s.create + s.update + s.retire
  const satirlar = [
    `  keşif planı · ${p.brandId} · dönem ${p.eraSlug} · mod ${p.mode}`,
    degisen === 0
      ? `  DEĞİŞİKLİK YOK — ${s.skip} kayıt imzası aynı (idempotent atlama çalışıyor)`
      : `  ${s.create} yeni · ${s.update} güncelleme · ${s.retire} emeklilik · ${s.skip} atlandı`,
  ]
  for (const o of p.ops) {
    if (o.kind === 'skip') continue
    satirlar.push(`    ${o.kind.padEnd(7)} ${o.path} — ${o.reason}`)
  }
  return satirlar.join('\n')
}
