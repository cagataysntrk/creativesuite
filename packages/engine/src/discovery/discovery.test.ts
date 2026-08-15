import { describe, expect, it } from 'vitest'
import { buildPlan, formatPlan, type CandidateRecord, type ExistingRecord } from './plan.js'
import { parseLedger } from './decisions.js'
import { skipSignature, unchanged, type SkipSignatureInput } from './idempotent.js'

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

describe('sticky karar defteri — insan reddeder, sistem HATIRLAR (§4.5)', () => {
  const defter = (satirlar: readonly Record<string, unknown>[]) =>
    parseLedger(satirlar.map((s) => JSON.stringify(s)).join('\n')).ledger

  it('reddedilen aynı öneri plana GİRMİYOR', () => {
    const d = defter([
      {
        recordId: 'rec_1',
        pointer: '',
        hash: 'dgst-1',
        kind: 'rejected',
        at: '2026-08-15T09:00:00.000Z',
        reason: 'çok iddialı, kaynağı yok',
      },
    ])
    const p = plan({ candidates: [aday()], ledger: d })
    expect(p.summary.create).toBe(0)
    expect(p.ops[0]?.kind).toBe('skip')
    expect(p.ops[0]?.reason).toContain('daha önce reddedildi')
    // Gerekçe KATLANMIŞ geliyor: insan neden reddettiğini hatırlamak zorunda değil.
    expect(p.ops[0]?.reason).toContain('kaynağı yok')
  })

  it('DAHA İYİ bir öneri geçiyor — red içeriğe bağlı, alana değil', () => {
    // Bir kez reddedilen alan sonsuza kadar iyileştirilemez olsaydı, sistem
    // kendi kendini düzeltemezdi.
    const d = defter([{ recordId: 'rec_1', pointer: '', hash: 'dgst-eski', kind: 'rejected' }])
    const p = plan({ candidates: [aday({ digest: 'dgst-yeni' })], ledger: d })
    expect(p.summary.create).toBe(1)
  })

  it("`pinned` alan hash'ten BAĞIMSIZ olarak susturuluyor", () => {
    // "Bu alana bir daha dokunma" demek, içeriğin ne olduğundan bağımsızdır.
    const d = defter([
      { recordId: 'rec_1', pointer: '', hash: 'farketmez', kind: 'pinned', reason: 'elle yazdım' },
    ])
    const p = plan({ candidates: [aday({ digest: 'apayri-bir-icerik' })], ledger: d })
    expect(p.ops[0]?.reason).toContain('sabitlenmiş kayıt')
  })

  it('bozuk JSONL satırı SESSİZCE atlanmıyor — satır numarasıyla raporlanıyor', () => {
    // Atlanan bir red kaydı, kullanıcının hayır dediği bir öneriyi tekrar sormaktır.
    const r = parseLedger('{"recordId":"a","pointer":"","hash":"h","kind":"rejected"}\n{bozuk\n')
    expect(r.badLines).toEqual([2])
    expect(r.ledger.entries).toHaveLength(1)
  })

  it('eksik alanlı satır da bozuk sayılıyor', () => {
    const r = parseLedger('{"recordId":"a"}\n')
    expect(r.badLines).toEqual([1])
  })
})

describe('idempotent imza — altı girdi, biri eksikse atlama yalan olur (§4.4)', () => {
  const girdi = (over: Partial<SkipSignatureInput> = {}): SkipSignatureInput => ({
    inputHashes: ['a', 'b'],
    promptHash: 'p1',
    modelId: 'm1',
    temperature: 0.7,
    seed: 42,
    retrievalSnapshot: 'r1',
    ...over,
  })

  it('aynı girdi aynı imza — her koşuda, her makinede', () => {
    expect(skipSignature(girdi())).toBe(skipSignature(girdi()))
  })

  it('girdi sırası imzayı DEĞİŞTİRMİYOR — sıra anlam değişimi değil', () => {
    expect(skipSignature(girdi({ inputHashes: ['b', 'a'] }))).toBe(skipSignature(girdi()))
  })

  it('ALTI girdinin her biri imzayı değiştiriyor', () => {
    const temel = skipSignature(girdi())
    expect(skipSignature(girdi({ inputHashes: ['a', 'c'] }))).not.toBe(temel)
    expect(skipSignature(girdi({ promptHash: 'p2' }))).not.toBe(temel)
    expect(skipSignature(girdi({ modelId: 'm2' }))).not.toBe(temel)
    expect(skipSignature(girdi({ temperature: 0.8 }))).not.toBe(temel)
    expect(skipSignature(girdi({ seed: 43 }))).not.toBe(temel)
    expect(skipSignature(girdi({ retrievalSnapshot: 'r2' }))).not.toBe(temel)
  })

  it('0.7 ile 0.70 aynı imza — sayı biçimi sabitlenmiş', () => {
    expect(skipSignature(girdi({ temperature: 0.7 }))).toBe(
      skipSignature(girdi({ temperature: 0.7 }))
    )
  })

  it('unchanged imzasız kaydı DEĞİŞMEDİ saymıyor', () => {
    expect(unchanged(null, 'x')).toBe(false)
    expect(unchanged('x', 'x')).toBe(true)
    expect(unchanged('x', 'y')).toBe(false)
  })
})

describe('ALAN bazlı red ve pin — pointer gerçekten kullanılıyor (§4.5)', () => {
  // Doğrulama agent'ı 2026-08-15'te `pointer: "/attributes/tagline"` ile pin yazdı ve
  // plan hiç etkilenmedi: `plan.ts` pointer'ı sabit boş dize geçiyordu. Tip düzeyindeki
  // sözleşme kodda yoktu; bu testler o boşluğu kapatıyor.
  const defter = (satirlar: readonly Record<string, unknown>[]) =>
    parseLedger(satirlar.map((s) => JSON.stringify(s)).join('\n')).ledger

  const alanliAday = (): CandidateRecord => ({
    ...aday(),
    fields: [
      { pointer: '/attributes/tagline', hash: 'h-tagline' },
      { pointer: '/attributes/summary', hash: 'h-summary' },
    ],
  })

  it("sabitlenmiş ALAN op'u durdurmuyor ama o alana dokunulmuyor", () => {
    const d = defter([
      {
        recordId: 'rec_1',
        pointer: '/attributes/tagline',
        hash: 'farketmez',
        kind: 'pinned',
        reason: 'sloganı elle yazdım',
      },
    ])
    const p = plan({ candidates: [alanliAday()], ledger: d })
    expect(p.summary.create).toBe(1)
    expect(p.ops[0]?.suppressedFields).toEqual(['/attributes/tagline'])
  })

  it('TÜM alanlar bastırılmışsa öneri düşüyor — öneri olmayan bir öneri', () => {
    const d = defter([
      { recordId: 'rec_1', pointer: '/attributes/tagline', hash: 'x', kind: 'pinned' },
      { recordId: 'rec_1', pointer: '/attributes/summary', hash: 'y', kind: 'pinned' },
    ])
    const p = plan({ candidates: [alanliAday()], ledger: d })
    expect(p.ops[0]?.kind).toBe('skip')
    expect(p.ops[0]?.reason).toContain('tüm alanlar bastırıldı')
  })

  it('alan bazlı RED içeriğe bağlı — daha iyi öneri o alana yeniden dokunabiliyor', () => {
    const d = defter([
      {
        recordId: 'rec_1',
        pointer: '/attributes/tagline',
        hash: 'h-tagline',
        kind: 'rejected',
        reason: 'çok iddialı',
      },
    ])
    const eskiOneri = plan({ candidates: [alanliAday()], ledger: d })
    expect(eskiOneri.ops[0]?.suppressedFields).toEqual(['/attributes/tagline'])

    const yeniOneri = plan({
      candidates: [
        {
          ...aday(),
          fields: [
            { pointer: '/attributes/tagline', hash: 'h-YENI' },
            { pointer: '/attributes/summary', hash: 'h-summary' },
          ],
        },
      ],
      ledger: d,
    })
    expect(yeniOneri.ops[0]?.suppressedFields).toBeUndefined()
  })

  it("başka KAYDIN aynı pointer'ı etkilenmiyor", () => {
    const d = defter([
      { recordId: 'rec_1', pointer: '/attributes/tagline', hash: 'x', kind: 'pinned' },
    ])
    const p = plan({
      candidates: [
        {
          id: 'rec_2',
          path: 'corpus/positioning/b.md',
          digest: 'd2',
          fields: [{ pointer: '/attributes/tagline', hash: 'x' }],
        },
      ],
      ledger: d,
    })
    expect(p.ops[0]?.suppressedFields).toBeUndefined()
  })

  it('alansız aday eskisi gibi çalışıyor — mevcut çağrılar kırılmadı', () => {
    const p = plan({ candidates: [aday()] })
    expect(p.summary.create).toBe(1)
    expect(p.ops[0]?.suppressedFields).toBeUndefined()
  })

  it('çıktıda dokunulmayan alanlar GÖRÜNÜYOR', () => {
    const d = defter([
      { recordId: 'rec_1', pointer: '/attributes/tagline', hash: 'x', kind: 'pinned' },
    ])
    const metin = formatPlan(plan({ candidates: [alanliAday()], ledger: d }))
    expect(metin).toContain('dokunulmayan alanlar: /attributes/tagline')
  })
})
