import { describe, expect, it } from 'vitest'
import { ok } from '@suite/contracts'
import { generateBody } from './bodies.js'
import type { ProviderAdapter } from '@suite/providers'

/**
 * Geçmiş red gerekçesi prompt'a nasıl giriyor (§12.9 · D-191).
 *
 * `validate()` burada sahte: gerçek adaptörün R-20 kurucusu ayrı test ediliyor.
 * Bu testin sorusu tek — **gerekçe hangi yeteneğe giriyor, hangisine girmiyor.**
 */
const yakalayan = (): { adapter: ProviderAdapter; gorulen: { prompt: string | null } } => {
  const gorulen: { prompt: string | null } = { prompt: null }
  const adapter = {
    id: 'p1',
    validate: (i: { prompt: string }) => {
      gorulen.prompt = i.prompt
      return ok(i)
    },
    start: () => Promise.resolve(ok({ handle: 'h' })),
    poll: () => Promise.resolve(ok({ state: 'failed', error: 'test' })),
  } as unknown as ProviderAdapter
  return { adapter, gorulen }
}

const kos = async (capability: string, kacinilacak?: string) => {
  const { adapter, gorulen } = yakalayan()
  const verb = generateBody({
    resolveAdapter: () => adapter,
    env: {},
    capability,
    sleep: () => Promise.resolve(),
  })
  await verb
    .run(
      {
        runId: 'run_x',
        stepId: 's',
        correlationId: 'c',
        clock: { nowIso: () => 'T', nowMs: () => 0 },
      } as never,
      {
        providerId: 'p1',
        constraints: {
          prompt: 'imalat sahnesi',
          ...(kacinilacak === undefined ? {} : { kacinilacak }),
        },
      } as never
    )
    .catch(() => undefined)
  return gorulen.prompt
}

describe('negatif kısıt enjeksiyonu', () => {
  it('METİN yeteneğinde geçmiş red gerekçesi prompt’a giriyor', async () => {
    const p = await kos('text.generate', 'başlık fazla iddialı')
    expect(p).toContain('imalat sahnesi')
    expect(p).toContain('KAÇIN: başlık fazla iddialı')
  })

  // 🧪 İHLAL TESTİ — GÖRSEL yeteneğine ASLA girmemeli.
  // Gerekçe serbest Türkçe nesir; görsel prompt'una eklemek ya R-20 kurucusunu
  // tetikler ya da metin isteyen bir cümleyi görsel modeline gönderir. Fikstür
  // (D-181): aynı gerekçe iki yetenekte AYRI sonuç vermeli — kural kalkarsa ikisi
  // de içerir ve test kırılır.
  it('GÖRSEL yeteneğinde gerekçe prompt’a GİRMİYOR (R-20)', async () => {
    const p = await kos('image.generate', 'başlık fazla iddialı')
    expect(p).toBe('imalat sahnesi')
    expect(p).not.toContain('KAÇIN')
  })

  it('gerekçe yoksa prompt hiç değişmiyor', async () => {
    expect(await kos('text.generate')).toBe('imalat sahnesi')
  })
})
