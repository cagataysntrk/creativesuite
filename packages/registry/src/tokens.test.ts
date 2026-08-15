import { describe, expect, it } from 'vitest'
import { compileTokens, toBrandFacts, toCss, toTailwind } from './tokens.js'

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
