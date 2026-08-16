import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  KISISELLESTIRME_TAVANI,
  tavanKapisi,
  tavanaIndir,
  type KisiselAlan,
} from './personalization.js'

const alan = (id: string, confidence: KisiselAlan['confidence'] = 'pointer'): KisiselAlan => ({
  id,
  label: `Alan ${id}`,
  sourceRef: `https://ornek.gecersiz/${id}`,
  confidence,
})

describe('kişiselleştirme tavanı', () => {
  it('tavan 5 ve kaynağı KURALLAR.md R-36', () => {
    expect(KISISELLESTIRME_TAVANI).toBe(5)
    const kurallar = readFileSync(join(import.meta.dirname, '../../..', 'KURALLAR.md'), 'utf8')
    // Sayı kural kitabında YAZIYOR olmalı — kapı da bunu okuyor (D-214).
    expect(kurallar).toMatch(/R-36 · kisisellestirme-tavani-5/)
    expect(kurallar).toMatch(/en fazla \*\*5\*\*/)
  })

  it('beş alan geçiyor', () => {
    const a = ['a', 'b', 'c', 'd', 'e'].map((x) => alan(x))
    expect(tavanKapisi(a)).toBe(true)
    expect(tavanaIndir(a).tavanAsildi).toBe(false)
  })

  // 🧪 İHLAL TESTİ — altıncı alan REDDEDİLİYOR ve hangi beşinin kaldığı YAZILIYOR.
  // Fikstür (D-181): tam tavan+1; kural kalkarsa altı alan sessizce deck'e girer ve
  // "bunları nereden biliyorsun" sorusu görüşmede sorulur.
  it('altıncı alan REDDEDİLİYOR ve kalan beş GÖSTERİLİYOR', () => {
    const a = ['a', 'b', 'c', 'd', 'e', 'f'].map((x) => alan(x))
    const r = tavanKapisi(a)
    expect(r).not.toBe(true)
    if (r === true) return
    expect(r.kind).toBe('personalization_cap')
    expect(r.count).toBe(6)
    expect(r.cap).toBe(5)
    expect(r.mesaj).toContain('Kalan:')
    expect(r.mesaj).toContain('Elenen:')
    expect(r.mesaj).toContain('R-36')
  })

  it('kanıtı GÜÇLÜ olan kalıyor — zayıf kanıt güçlüsünü eleyemiyor', () => {
    const a = [
      alan('zayif1', 'pointer'),
      alan('zayif2', 'pointer'),
      alan('zayif3', 'pointer'),
      alan('zayif4', 'pointer'),
      alan('zayif5', 'pointer'),
      alan('guclu', 'direct'),
    ]
    const r = tavanaIndir(a)
    // Girişte SON sıradaydı ama kanıtı en güçlü olduğu için kalıyor.
    expect(r.kabul.map((x) => x.id)).toContain('guclu')
    expect(r.elenen).toHaveLength(1)
  })

  it('eşit güvende GİRİŞ SIRASI korunuyor — sıralama kararlı', () => {
    const a = ['a', 'b', 'c', 'd', 'e', 'f'].map((x) => alan(x, 'direct'))
    expect(tavanaIndir(a).kabul.map((x) => x.id)).toEqual(['a', 'b', 'c', 'd', 'e'])
  })

  it('kapı KIRPMIYOR, REDDEDİYOR — sessiz kırpma tavandan kötü', () => {
    const a = ['a', 'b', 'c', 'd', 'e', 'f'].map((x) => alan(x))
    // `tavanaIndir` bir öneri (UI önizlemesi), `tavanKapisi` bir kapı. İkisi ayrı.
    expect(tavanaIndir(a).kabul).toHaveLength(5)
    expect(tavanKapisi(a)).not.toBe(true)
  })

  it('boş liste geçiyor — kişiselleştirmemek bir ihlal değil', () => {
    expect(tavanKapisi([])).toBe(true)
  })
})

// ── BAĞLANMA TESTİ: kapı yayın yükleminin İÇİNDE mi (D-199 · D-182) ──────────
import { inspectManifest, isPublishable } from './manifest.js'

const manifest = (alanSayisi: number): Parameters<typeof inspectManifest>[0] =>
  ({
    runId: 'run_1',
    brandId: 'brd_upcytech',
    eraId: 'imalat-2026',
    pipeline: 'prospect-deck',
    corpusCommit: '1f0e3dad99908345f7439f8ffabdffc418ac0d5f',
    registryCommit: '2b0e3dad99908345f7439f8ffabdffc418ac0d60',
    createdAt: '2026-08-16T12:00:00.000Z',
    decisions: [],
    context: [],
    contextRetentionDays: null,
    steps: [
      {
        stepId: 'kompozit',
        verb: 'COMPOSE',
        providerId: null,
        candidates: [],
        startedAt: '2026-08-16T12:00:00.000Z',
        finishedAt: '2026-08-16T12:00:00.000Z',
        estimatedCost: {
          low: { micros: 0n, currency: 'USD' },
          high: { micros: 0n, currency: 'USD' },
        },
        actualCost: null,
        status: 'ok',
        output: {
          personalizationFields: Array.from({ length: alanSayisi }, (_, i) => `alan-${i}`),
        },
      },
    ],
  }) as never

describe('tavan YAYIN YÜKLEMİNE bağlı mı', () => {
  it('beş alanla manifest YAYINLANABİLİR', () => {
    expect(isPublishable(manifest(5))).toBe(true)
  })

  // 🧪 Asıl sınav: `tavanKapisi`nin doğru cevap vermesi yetmez, `PUBLISH` yükleminin
  // tavanı BİLMESİ gerekir. Elle düzenlenmiş bir IR `COMPOSE` kapısını atlayabilir.
  it('altı alanla manifest YAYINLANAMAZ', () => {
    const m = manifest(6)
    expect(isPublishable(m)).toBe(false)
    const kusur = inspectManifest(m).find((d) => d.kind === 'personalization_cap')
    expect(kusur?.kind === 'personalization_cap' && kusur.count).toBe(6)
  })
})
