import { describe, expect, it } from 'vitest'
import { compileTokens, inheritTokens, toBrandFacts, toCss, toTailwind } from './tokens.js'

// §12.1'in üç kademesi bir konvansiyon değil, MEKANİK bir kısıt. Bileşenin ham rampaya
// bağlanması markayı değiştirdiğinde o bileşeni eski renkte bırakır — ve bu hata
// çalışma zamanında değil gözle fark edilir, yani fark edilmez.

const agac = (): Record<string, unknown> => ({
  ramp: { gray: { '900': { $value: 'oklch(0.21 0.01 250)', $type: 'color' } } },
  role: { bg: { $value: '{ramp.gray.900}', $type: 'color' } },
  comp: { 'status-bar-bg': { $value: '{role.bg}', $type: 'color' } },
})

const derle = (t: Record<string, unknown>) => compileTokens(t)

describe('kademe zinciri ramp → role → comp', () => {
  it('geçerli zincir çözülüyor ve DEĞER en dibe iniyor', () => {
    const r = derle(agac())
    expect(r.ok).toBe(true)
    if (r.ok) {
      const comp = r.value.find((t) => t.path === 'comp.status-bar-bg')
      expect(comp?.resolved).toBe('oklch(0.21 0.01 250)')
      // Ham değer korunuyor: neyin neye bağlı olduğu çıktıda kaybolmuyor.
      expect(comp?.raw).toBe('{role.bg}')
    }
  })

  it('comp → ramp kademe ATLAMASI reddediliyor', () => {
    const t = agac()
    t['comp'] = { 'status-bar-bg': { $value: '{ramp.gray.900}', $type: 'color' } }
    const r = derle(t)
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.errors[0]?.kind).toBe('tier_violation')
      expect(r.errors[0]).toMatchObject({ path: 'comp.status-bar-bg', ref: 'ramp.gray.900' })
    }
  })

  it('role → comp TERS yön de reddediliyor', () => {
    const t = agac()
    t['role'] = { bg: { $value: '{comp.status-bar-bg}', $type: 'color' } }
    expect(derle(t).ok).toBe(false)
  })

  it('aynı kademe içi referans reddediliyor — kademe SIRALI bir zincirdir', () => {
    const t = agac()
    t['role'] = {
      bg: { $value: '{ramp.gray.900}', $type: 'color' },
      surface: { $value: '{role.bg}', $type: 'color' },
    }
    const r = derle(t)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.errors[0]?.kind).toBe('tier_violation')
  })

  it('ramp hiçbir şeye referans veremez — zincirin dibi', () => {
    const t = agac()
    t['ramp'] = { gray: { '900': { $value: '{role.bg}', $type: 'color' } } }
    expect(derle(t).ok).toBe(false)
  })

  it('bilinmeyen kademe reddediliyor — dördüncü kademe sessizce doğamaz', () => {
    const r = derle({ misc: { x: { $value: '#fff', $type: 'color' } } })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.errors[0]?.kind).toBe('unknown_tier')
  })

  it('var olmayan referans reddediliyor', () => {
    const t = agac()
    t['role'] = { bg: { $value: '{ramp.gray.999}', $type: 'color' } }
    const r = derle(t)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.errors[0]?.kind).toBe('unresolved_ref')
  })
})

describe('çıktılar', () => {
  it('CSS değişken adında kademe KALIYOR — neyin ne olduğu görünür', () => {
    const r = derle(agac())
    expect(r.ok).toBe(true)
    if (r.ok) {
      const css = toCss(r.value)
      expect(css).toContain('--comp-status-bar-bg: oklch(0.21 0.01 250);')
      expect(css).toContain('--role-bg:')
      expect(css).toContain('ÜRETİLMİŞ')
    }
  })

  it('Tailwind temasında ham rampa YOK — bileşen ona erişemesin diye', () => {
    const r = derle(agac())
    if (r.ok) {
      const tw = toTailwind(r.value)
      expect(tw).toContain('role-bg')
      expect(tw).toContain('comp-status-bar-bg')
      expect(tw).not.toContain('ramp-gray-900')
    }
  })

  it('brand-facts renk DEĞERİ taşımıyor — model renk seçmez (R-20 kardeşi)', () => {
    const r = derle(agac())
    if (r.ok) {
      const facts = toBrandFacts(r.value, { brandId: 'brd_x', eraSlug: 'era-1' })
      expect(facts).toContain('role.bg')
      // Modele renk kodu vermek onu görselde kullanmaya davet eder; renk kompozit
      // aşamasında gerçek token'dan gelir.
      expect(facts).not.toContain('oklch')
      expect(facts).not.toContain('#')
    }
  })
})

describe('token kalıtımı — alt marka devralır, gerektiği kadar ezer (§4.2)', () => {
  const ana = (): Record<string, unknown> => ({
    ramp: {
      gray: { '900': { $value: 'oklch(0.21 0.01 250)', $type: 'color' } },
      signal: { ok: { $value: 'oklch(0.65 0.12 150)', $type: 'color' } },
    },
    role: {
      bg: { $value: '{ramp.gray.900}', $type: 'color' },
      'state-ok': { $value: '{ramp.signal.ok}', $type: 'color' },
    },
  })

  it('ezilmeyen token MİRASTIR — alt marka rol setini yeniden yazmıyor', () => {
    const alt = { role: { 'state-ok': { $value: '{ramp.signal.ok}', $type: 'color' } } }
    const { merged } = inheritTokens(ana(), alt)
    const r = derle(merged)
    expect(r.ok).toBe(true)
    if (r.ok) {
      // `role.bg` alt markada HİÇ yazılmadı ama derlemede var.
      expect(r.value.find((t) => t.path === 'role.bg')?.resolved).toBe('oklch(0.21 0.01 250)')
    }
  })

  it('ezilen token alt markanın değerini alıyor ve EZME LİSTELENİYOR', () => {
    const alt = {
      ramp: { signal: { ok: { $value: 'oklch(0.68 0.13 195)', $type: 'color' } } },
    }
    const { merged, overridden } = inheritTokens(ana(), alt)
    expect(overridden).toContain('ramp.signal.ok')
    const r = derle(merged)
    if (r.ok) {
      expect(r.value.find((t) => t.path === 'role.state-ok')?.resolved).toBe('oklch(0.68 0.13 195)')
    }
  })

  it('DERİN birleştirme: kardeş rampalar kaybolmuyor', () => {
    // Sığ birleştirme `ramp` nesnesinin tamamını değiştirir ve `gray` yok olurdu —
    // alt marka o gün ana markanın tüm rampasını yeniden yazmak zorunda kalırdı.
    const alt = { ramp: { signal: { ok: { $value: 'oklch(0.7 0.1 200)', $type: 'color' } } } }
    const { merged } = inheritTokens(ana(), alt)
    const r = derle(merged)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.value.some((t) => t.path === 'ramp.gray.900')).toBe(true)
  })

  it('yaprak düğüm MELEZLENMİYOR — $type ana markadan, $value alttan olmaz', () => {
    const alt = { role: { bg: { $value: 'oklch(0.1 0 0)', $type: 'color' } } }
    const { merged } = inheritTokens(ana(), alt)
    const rol = (merged['role'] as Record<string, Record<string, unknown>>)['bg']
    expect(rol?.['$value']).toBe('oklch(0.1 0 0)')
  })

  it('alt marka kademe kuralını AŞAMAZ — kalıtım muafiyet değildir', () => {
    const alt = { comp: { x: { $value: '{ramp.gray.900}', $type: 'color' } } }
    const { merged } = inheritTokens(ana(), alt)
    const r = derle(merged)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.errors[0]?.kind).toBe('tier_violation')
  })
})
