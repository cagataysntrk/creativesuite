import { describe, expect, it } from 'vitest'
import { buildPlan, formatPlan, type CandidateRecord, type ExistingRecord } from './plan.js'

// §4.4'ün iki vaadi: (1) ikinci çalıştırma 0 op üretir, (2) elle düzenlenmiş kayda
// motor dokunmaz. İkisi de bu sistemin kullanılmaya devam edilip edilmeyeceğini
// belirliyor — üçüncü koşuda 900 op gören kullanıcı sistemi bir daha açmaz.

const mevcut = (over: Partial<ExistingRecord> = {}): ExistingRecord => ({
  id: 'rec_1',
  path: 'corpus/positioning/olcum.md',
  signature: 'dgst-1',
  zone: 'generated',
  ...over,
})

const aday = (over: Partial<CandidateRecord> = {}): CandidateRecord => ({
  id: 'rec_1',
  path: 'corpus/positioning/olcum.md',
  digest: 'dgst-1',
  ...over,
})

const plan = (o: Partial<Parameters<typeof buildPlan>[0]> = {}) =>
  buildPlan({
    runId: 'run_1',
    brandId: 'brd_upcytech',
    eraSlug: 'imalat-2026',
    mode: 'merge',
    existing: [],
    candidates: [],
    ...o,
  })

describe('idempotent atlama — ZORUNLU altyapı, optimizasyon değil (§4.4)', () => {
  it('imza aynıysa op üretilmiyor — ikinci çalıştırma SIFIR değişiklik', () => {
    const p = plan({ existing: [mevcut()], candidates: [aday()] })
    expect(p.summary).toEqual({ create: 0, update: 0, retire: 0, skip: 1 })
    expect(p.ops[0]?.reason).toContain('imza aynı')
  })

  it('sıfır op bir SONUÇTUR ve öyle yazılıyor', () => {
    const metin = formatPlan(plan({ existing: [mevcut()], candidates: [aday()] }))
    expect(metin).toContain('DEĞİŞİKLİK YOK')
    expect(metin).toContain('idempotent atlama çalışıyor')
  })

  it('imza değiştiyse güncelleme öneriliyor', () => {
    const p = plan({ existing: [mevcut()], candidates: [aday({ digest: 'dgst-2' })] })
    expect(p.summary.update).toBe(1)
    expect(p.ops[0]?.reason).toBe('imza değişti')
  })

  it('imzasız üretilmiş kayıt güncelleniyor ve sebebi AYRI yazılıyor', () => {
    const p = plan({ existing: [mevcut({ signature: null })], candidates: [aday()] })
    expect(p.ops[0]?.kind).toBe('update')
    expect(p.ops[0]?.reason).toBe('imzasız üretilmiş kayıt')
  })
})

describe('elle düzenlenmiş kayıt DOKUNULMAZ (§4.5)', () => {
  it('zone: human olan kayıt atlanıyor, imza farklı olsa bile', () => {
    const p = plan({
      existing: [mevcut({ zone: 'human', signature: 'elle-degisti' })],
      candidates: [aday({ digest: 'dgst-yeni' })],
    })
    expect(p.ops[0]?.kind).toBe('skip')
    expect(p.ops[0]?.reason).toContain('zone: human')
  })

  it('mirror modunda bile elle yazılmış kayıt emekliye ayrılmıyor', () => {
    // "Hepsini baştan yap", kullanıcının kendi yazdığını silmek demek değildir.
    const p = plan({ mode: 'mirror', existing: [mevcut({ id: 'rec_elle', zone: 'human' })] })
    expect(p.ops).toEqual([])
  })
})

describe('merge ve mirror farkı', () => {
  it('merge SİLMEZ — adayda olmayan kayıt olduğu gibi kalıyor', () => {
    const p = plan({ mode: 'merge', existing: [mevcut({ id: 'rec_eski' })], candidates: [] })
    expect(p.ops).toEqual([])
    expect(p.summary.retire).toBe(0)
  })

  it('mirror adayda olmayanı EMEKLİYE ayırıyor — silmiyor (R-12)', () => {
    const p = plan({ mode: 'mirror', existing: [mevcut({ id: 'rec_eski' })], candidates: [] })
    expect(p.summary.retire).toBe(1)
    expect(p.ops[0]?.kind).toBe('retire')
    expect(p.ops[0]?.reason).toContain('silinmiyor')
  })

  it('yeni kayıt her iki modda da create', () => {
    for (const mode of ['merge', 'mirror'] as const) {
      const p = plan({ mode, candidates: [aday({ id: 'rec_yeni' })] })
      expect(p.summary.create, mode).toBe(1)
    }
  })
})

describe('AYNI yol yeniden yazılıyor — dönem klasörü YOK (D-30)', () => {
  it('op yolu adayın yoludur ve dönem adı İÇERMEZ', () => {
    const p = plan({ candidates: [aday({ digest: 'yeni' })], existing: [mevcut()] })
    expect(p.ops[0]?.path).toBe('corpus/positioning/olcum.md')
    expect(p.ops[0]?.path).not.toContain('imalat-2026')
    expect(p.ops[0]?.path).not.toContain('eras/')
  })
})

describe('plan HİÇBİR ŞEY yazmaz', () => {
  it('dönen yapı yalnız VERİDİR — uygulayıcı fonksiyon taşımıyor', () => {
    const p = plan({ candidates: [aday()] })
    // Planın içinde çağrılabilir bir şey olsaydı, "plan hiçbir şey yapmaz" iddiası
    // bir konvansiyona düşerdi. JSON'a serileşebiliyorsa yan etkisi olamaz.
    expect(JSON.parse(JSON.stringify(p))).toEqual(p)
  })
})
