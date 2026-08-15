import { describe, expect, it } from 'vitest'
import { butceHatasiMesaji, parseButce, serializeButce, toBudgetCaps } from './butce.js'

describe('bütçe tavanları (§8.3 · D-17)', () => {
  it('`null` ile `0` KARIŞTIRILMAZ — biri tavansız, diğeri "hiç harcama"', () => {
    const yok = parseButce('per_run_micros: null\nper_month_micros: null\n')
    const sifir = parseButce('per_run_micros: 0\nper_month_micros: 0\n')
    expect(yok.ok && yok.value.perRunMicros).toBeNull()
    expect(sifir.ok && sifir.value.perRunMicros).toBe(0n)
    // Motora giden biçimde de ayrım korunur.
    expect(yok.ok && toBudgetCaps(yok.value).perRun).toBeNull()
    expect(sifir.ok && toBudgetCaps(sifir.value).perRun?.micros).toBe(0n)
  })

  it('tavan `bigint` — 2^53 üstünde bile bozulmaz (R-41)', () => {
    const r = parseButce('per_run_micros: "9007199254740993"\nper_month_micros: null\n')
    expect(r.ok && r.value.perRunMicros).toBe(9007199254740993n)
  })

  it('negatif tavan REDDEDİLİR — tavan bir sınırdır, bir borç değil', () => {
    const r = parseButce('per_run_micros: -5\n')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(butceHatasiMesaji(r.errors[0]!)).toContain('negatif')
  })

  it('çalıştırma tavanı aylıktan BÜYÜK olamaz — ikisinden biri anlamsız olurdu', () => {
    const r = parseButce('per_run_micros: 9000\nper_month_micros: 1000\n')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.errors[0]?.kind).toBe('celiskili')
  })

  it('bozuk YAML sessizce varsayılana DÜŞMEZ', () => {
    // Sessiz düşüş, kullanıcının koyduğu tavanın yerine başka bir tavanla koşmaktır.
    const r = parseButce('per_run_micros: [bu bir liste\n')
    expect(r.ok).toBe(false)
  })

  it('yaz-oku turu değeri korur', () => {
    const b = { perRunMicros: 250_000n, perMonthMicros: 3_000_000n, updatedAt: '2026-08-16' }
    const r = parseButce(serializeButce(b))
    expect(r.ok && r.value.perRunMicros).toBe(250_000n)
    expect(r.ok && r.value.perMonthMicros).toBe(3_000_000n)
  })

  it('null yaz-oku turu de korunur', () => {
    const r = parseButce(
      serializeButce({ perRunMicros: null, perMonthMicros: null, updatedAt: '' })
    )
    expect(r.ok && r.value.perRunMicros).toBeNull()
  })
})
