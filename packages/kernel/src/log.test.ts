import { afterEach, describe, expect, it } from 'vitest'
import type { CorrelationId } from '@suite/contracts'
import { log, setSink, type LogEvent } from './log.js'

// Doğrulama agent'ı 2026-08-15'te bu modülün hiç çalıştırılmadığını buldu: `console.log`
// yasağı çalışıyordu ama loggerın KENDİSİ sınanmamıştı. Redaksiyon test edilmeyen bir
// güvenlik özelliğidir — ve test edilmeyen redaksiyon, olmayan redaksiyondur (§14).

const KIMLIK = 'run_0198f000-0000-7000-8000-000000000001' as CorrelationId

const yakala = (): string[] => {
  const satirlar: string[] = []
  setSink((l) => satirlar.push(l))
  return satirlar
}

const olay = (o: Partial<LogEvent> = {}): LogEvent => ({
  level: 'info',
  event: 'verb.started',
  correlationId: KIMLIK,
  ...o,
})

afterEach(() => {
  setSink((line) => {
    process.stdout.write(`${line}\n`)
  })
})

describe('logger — tek satır NDJSON (§13 · §3.8)', () => {
  it('geçerli tek satır JSON basar', () => {
    const satirlar = yakala()
    log(olay(), '2026-08-15T10:00:00.000Z')
    expect(satirlar).toHaveLength(1)
    expect(satirlar[0]).not.toContain('\n')
    expect(JSON.parse(satirlar[0] ?? '')).toEqual({
      at: '2026-08-15T10:00:00.000Z',
      level: 'info',
      event: 'verb.started',
      correlationId: KIMLIK,
    })
  })

  it('saati KENDİ okumaz — zaman damgası çağırandan gelir (R-06)', () => {
    const satirlar = yakala()
    // Aynı olay iki farklı damgayla: logger `Date`e dokunsaydı ikisi de "şimdi" olurdu.
    log(olay(), '2020-01-01T00:00:00.000Z')
    log(olay(), '2030-01-01T00:00:00.000Z')
    expect(satirlar.map((s) => JSON.parse(s).at)).toEqual([
      '2020-01-01T00:00:00.000Z',
      '2030-01-01T00:00:00.000Z',
    ])
  })

  it('details yoksa anahtar hiç yazılmaz — boş nesne gürültüsü yok', () => {
    const satirlar = yakala()
    log(olay(), '2026-08-15T10:00:00.000Z')
    expect(Object.keys(JSON.parse(satirlar[0] ?? ''))).not.toContain('details')
  })

  it('korelasyon id null olabilir ama alan HER ZAMAN vardır', () => {
    const satirlar = yakala()
    log(olay({ correlationId: null }), '2026-08-15T10:00:00.000Z')
    const kayit = JSON.parse(satirlar[0] ?? '')
    expect('correlationId' in kayit).toBe(true)
    expect(kayit.correlationId).toBeNull()
  })
})

describe('redaksiyon — sızıntıyı raporlarken ikinci kez sızdırma (§14)', () => {
  it('bilinen hassas anahtarların DEĞERİ satıra hiç girmez', () => {
    const satirlar = yakala()
    log(
      olay({
        level: 'error',
        event: 'provider.rejected',
        details: {
          api_key: 'sk-ant-api03-COK-GIZLI',
          authorization: 'Bearer COK-GIZLI',
          prompt: 'müşterinin gizli brief metni',
          provider: 'anthropic',
          status: 429,
        },
      }),
      '2026-08-15T10:00:00.000Z'
    )
    const satir = satirlar[0] ?? ''
    expect(satir).not.toContain('COK-GIZLI')
    expect(satir).not.toContain('gizli brief')
    const d = JSON.parse(satir).details
    expect(d).toEqual({
      api_key: '<REDACTED>',
      authorization: '<REDACTED>',
      prompt: '<REDACTED>',
      provider: 'anthropic',
      status: 429,
    })
  })

  it('hassas olmayan alanlar OLDUĞU GİBİ kalır — redaksiyon her şeyi silmez', () => {
    const satirlar = yakala()
    log(olay({ details: { step: 'gorsel-uret', attempt: 2 } }), '2026-08-15T10:00:00.000Z')
    expect(JSON.parse(satirlar[0] ?? '').details).toEqual({ step: 'gorsel-uret', attempt: 2 })
  })

  it('camelCase ve snake_case iki yazım da yakalanır', () => {
    const satirlar = yakala()
    log(olay({ details: { apiKey: 'A', api_key: 'B' } }), '2026-08-15T10:00:00.000Z')
    expect(JSON.parse(satirlar[0] ?? '').details).toEqual({
      apiKey: '<REDACTED>',
      api_key: '<REDACTED>',
    })
  })
})
