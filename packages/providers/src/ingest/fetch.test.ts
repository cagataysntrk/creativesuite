import { describe, expect, it } from 'vitest'
import type { CorrelationId } from '@suite/contracts'
import { fetchSource, htmlToText, isIngestFailure, slugFor } from './fetch.js'

describe('HTML → metin', () => {
  // 🧪 İHLAL TESTİ — script/style gövdesi metne SIZMIYOR. Fikstür (D-181): ikisi de
  // ayırt edilebilir dize taşıyor; kural kalkarsa JavaScript kaynak kodu modele giden
  // metnin içine düşer ve enjeksiyon yüzeyini büyütür.
  it('script ve style gövdeleri TAMAMEN atılıyor', () => {
    const t = htmlToText('<style>.x{color:red}</style><script>window.kotu=1</script><p>İçerik</p>')
    expect(t).toBe('İçerik')
    expect(t).not.toContain('window.kotu')
    expect(t).not.toContain('color:red')
  })

  it('Türkçe varlıklar çözülüyor', () => {
    expect(htmlToText('<p>Kalite &amp; &#199;ğüşiöı</p>')).toBe('Kalite & Çğüşiöı')
  })

  it('blok sonları satıra dönüyor, boş satır kalmıyor', () => {
    expect(htmlToText('<h1>Bir</h1>  <p>İki</p><br><p></p>')).toBe('Bir\nİki')
  })
})

describe('slug', () => {
  it('yoldan türetiliyor, saat kullanılmıyor (R-06)', () => {
    expect(slugFor('https://a.gecersiz/Hakkimizda/Biz')).toBe('hakkimizda-biz')
    expect(slugFor('https://a.gecersiz/')).toBe('kok')
  })

  it('aynı URL AYNI slug — iki kez çekmek iki dosya yapmıyor', () => {
    expect(slugFor('https://a.gecersiz/x')).toBe(slugFor('https://a.gecersiz/x'))
  })
})

describe('yasaklı kaynak', () => {
  // 🧪 İHLAL TESTİ — LinkedIn kazıma AĞA ÇIKMADAN reddediliyor.
  it('istek GÖNDERİLMEDEN reddediliyor', async () => {
    const r = await fetchSource({
      url: 'https://www.linkedin.com/in/biri',
      sourceId: 'own-site',
      confidence: 'direct',
      fetchedAt: '2026-08-16T00:00:00.000Z',
      correlationId: 'cor_test' as CorrelationId,
    })
    expect(isIngestFailure(r)).toBe(true)
    if (!isIngestFailure(r)) return
    // Ret AĞ katmanından değil, kural katmanından geldi: `transport` değil.
    expect(r.kind).toBe('forbidden_source')
  })
})
