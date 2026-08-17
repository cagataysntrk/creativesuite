// Tasarım planının değişmezleri (§7.1 · FAZ-14.2).

import { describe, expect, it } from 'vitest'
import { OGE_POLITIKALARI, planGecerli, planKusurlari, yay } from '@suite/contracts'
import { tasarla, type TasarlaGirdisi } from './tasarla.js'

const g = (over: Partial<TasarlaGirdisi> = {}): TasarlaGirdisi => ({
  konu: 'fire kayıtları nerede tutuluyor',
  satirlar: ['a', 'b', 'c', 'd', 'e', 'f'],
  akisVar: false,
  yuvaIstendi: false,
  ...over,
})

describe('tasarım planı', () => {
  it('her seçim GEREKÇELİ — gerekçesiz plan geçersiz', () => {
    // Gerekçe alanının varlık sebebi denetlenebilirlik. Tip sistemi boş dizeyi
    // engelleyemez, o yüzden kapı `planKusurlari`.
    const p = tasarla(g())
    expect(planGecerli(p)).toBe(true)
    const bozuk = { ...p, aile: { ...p.aile, gerekce: '   ' } }
    expect(planKusurlari(bozuk).some((k) => k.sebep === 'gerekce-bos')).toBe(true)
    expect(planGecerli(bozuk)).toBe(false)
  })

  it('slayt gerekçesi de zorunlu', () => {
    const p = tasarla(g())
    const s = p.slaytlar.map((x, i) => (i === 2 ? { ...x, oge: { ...x.oge, gerekce: '' } } : x))
    expect(planKusurlari({ ...p, slaytlar: s })).toHaveLength(1)
  })

  it('DETERMİNİSTİK — aynı girdi aynı plan', () => {
    expect(JSON.stringify(tasarla(g()))).toBe(JSON.stringify(tasarla(g())))
  })

  it('yay ile slayt işlevleri TUTARLI', () => {
    const p = tasarla(g())
    expect(p.yay).toEqual(yay(6))
    expect(p.slaytlar.map((s) => s.islev)).toEqual([...p.yay])
    const bozuk = {
      ...p,
      slaytlar: p.slaytlar.map((s, i) => (i === 1 ? { ...s, islev: 'davet' as const } : s)),
    }
    expect(planKusurlari(bozuk).some((k) => k.sebep === 'islev-uyusmuyor')).toBe(true)
  })

  it('KAPAK ve KAPANIŞ görsel öge ALMIYOR', () => {
    for (const gi of [g({ akisVar: true }), g({ yuvaIstendi: true }), g()]) {
      const p = tasarla(gi)
      expect(p.slaytlar[0]!.oge.deger).toBe('yok')
      expect(p.slaytlar[p.slaytlar.length - 1]!.oge.deger).toBe('yok')
    }
  })

  it('diyagram ve yuva AYRI slaytlarda — ikisi birden olabilir', () => {
    // ⚠ Eskiden ikisi AYNI indeks için yarışıyordu ve `icerikPromptu` her konuda AKIŞ
    // istediği için diyagram hep kazanıyordu: `gorsel_yuvasi` fiilen ÖLÜ bir kısıttı ve
    // altı gerçek koşuda `yuva-doldur` bir kez bile yuva doldurmadı. Bağımsız doğrulama
    // yakaladı. "Aynı slaytta iki görsel öge olmaz" kuralı SLAYT başınadır.
    const ikisi = tasarla(g({ akisVar: true, yuvaIstendi: true }))
    const ogeler = ikisi.slaytlar.map((s) => s.oge.deger)
    expect(ogeler.filter((o) => o === 'diyagram')).toHaveLength(1)
    expect(ogeler.filter((o) => o === 'gorsel-yuvasi')).toHaveLength(1)
    // Aynı slaytta değiller.
    expect(ogeler.indexOf('diyagram')).not.toBe(ogeler.indexOf('gorsel-yuvasi'))
  })

  it('yuva İSTENMEZSE açılmıyor', () => {
    const o = tasarla(g({ akisVar: true })).slaytlar.map((s) => s.oge.deger)
    expect(o).not.toContain('gorsel-yuvasi')
  })

  it('kısa karoselde iki görsel ögeye yer YOK', () => {
    const p = tasarla(g({ satirlar: ['a', 'b', 'c', 'd'], akisVar: true, yuvaIstendi: true }))
    const o = p.slaytlar.map((s) => s.oge.deger)
    expect(o.filter((x) => x === 'gorsel-yuvasi')).toHaveLength(0)
  })

  it('görsel öge GÖVDENİN ORTASINDA — sonda değil', () => {
    // Sona konduğunda sayfalayıcı onu kapanış slaydına taşıyor ve kapanış cümlesi
    // altına sıkışıyordu (FAZ-10.7'de ölçüldü).
    const p = tasarla(g({ akisVar: true }))
    const i = p.slaytlar.findIndex((s) => s.oge.deger === 'diyagram')
    expect(i).toBeGreaterThan(0)
    expect(i).toBeLessThan(p.slaytlar.length - 1)
  })

  it('öge politikaları KAPALI dağarcıktan', () => {
    for (const gi of [g(), g({ akisVar: true }), g({ yuvaIstendi: true })])
      for (const s of tasarla(gi).slaytlar) expect(OGE_POLITIKALARI).toContain(s.oge.deger)
  })

  it('her uzunlukta plan üretiliyor', () => {
    for (const n of [4, 5, 6, 7]) {
      const p = tasarla(g({ satirlar: Array.from({ length: n }, (_, i) => `s${i}`) }))
      expect(p.slaytlar).toHaveLength(n)
      expect(planGecerli(p)).toBe(true)
    }
  })

  it('DÜZEN planda YOK — ölçümden çıkıyor', () => {
    // `duzenSec` sayfalayıcının içinde, sayfa başına koşuyor: kaç bloğun sığdığını bilen
    // tek yer orası. Düzeni önden seçmek ya sayfalamayı ya düzeni yalan yapardı.
    const p = tasarla(g())
    expect(JSON.stringify(p)).not.toContain('duzen')
    expect(JSON.stringify(p)).not.toContain('layout')
  })
})
