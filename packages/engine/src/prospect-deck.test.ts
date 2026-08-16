import { describe, expect, it } from 'vitest'
import { DECK_KAPI_SIRASI, prospectDeckZinciri, type ProspectDeckInput } from './prospect-deck.js'

const SIMDI = '2026-08-16T12:00:00.000Z'

const temiz = (over: Partial<ProspectDeckInput> = {}): ProspectDeckInput => ({
  kaynaklar: [{ sourceRef: 'https://ornek.gecersiz/haber', fetchedAt: '2026-08-12T12:00:00.000Z' }],
  alanlar: [
    { id: 'a', label: 'Bursa tesisi', sourceRef: 'https://ornek.gecersiz/a', confidence: 'direct' },
    {
      id: 'b',
      label: 'İhale kapsamı',
      sourceRef: 'https://ornek.gecersiz/b',
      confidence: 'direct',
    },
  ],
  urunEkranlari: [{ aiGenerated: false, basis: { kind: 'product_capture' } }],
  lexiconIhlalleri: [],
  manifestKusurlari: [],
  now: SIMDI,
  ...over,
})

describe('prospect-deck zinciri', () => {
  it('temiz girdi BEŞ kapının hepsinden geçiyor', () => {
    const r = prospectDeckZinciri(temiz())
    expect(r.gecti).toBe(true)
    expect(r.kosulanKapilar).toEqual(DECK_KAPI_SIRASI)
  })

  // 🧪 Adımın kendi kriteri #1: 15 günlük kaynakla koş → tazelik reddediyor.
  it('bayat kaynak İLK kapıda durduruyor', () => {
    const r = prospectDeckZinciri(
      temiz({
        kaynaklar: [
          { sourceRef: 'https://ornek.gecersiz/eski', fetchedAt: '2026-08-01T12:00:00.000Z' },
        ],
      })
    )
    expect(r.gecti).toBe(false)
    if (r.gecti) return
    expect(r.kapi).toBe('tazelik')
    // Sonraki kapılar KOŞULMADI — zaten geçersiz bir belge hakkında bulgu üretmiyor.
    expect(r.kosulanKapilar).toEqual(['tazelik'])
    expect(r.mesaj).toContain('15 günlük')
  })

  // 🧪 Adımın kendi kriteri #2: kaynaksız sayı ekle → reddediliyor.
  it('kaynaksız iddia DÖRDÜNCÜ kapıda durduruyor', () => {
    const r = prospectDeckZinciri(temiz({ lexiconIhlalleri: [{ kind: 'unsourced_claim' }] }))
    expect(r.gecti).toBe(false)
    if (r.gecti) return
    expect(r.kapi).toBe('lexicon')
    expect(r.mesaj).toContain('R-32')
    // Üç kapı geçildi, dördüncüde durdu: "nereye kadar geldi" görünür.
    expect(r.kosulanKapilar).toHaveLength(4)
  })

  it('altı kişiselleştirme alanı İKİNCİ kapıda durduruyor', () => {
    const alanlar = ['a', 'b', 'c', 'd', 'e', 'f'].map((id) => ({
      id,
      label: `Alan ${id}`,
      sourceRef: 'https://ornek.gecersiz/x',
      confidence: 'direct' as const,
    }))
    const r = prospectDeckZinciri(temiz({ alanlar }))
    expect(r.gecti).toBe(false)
    if (r.gecti) return
    expect(r.kapi).toBe('kisisellestirme')
  })

  it('üretilmiş ürün ekranı ÜÇÜNCÜ kapıda durduruyor', () => {
    const r = prospectDeckZinciri(
      temiz({ urunEkranlari: [{ aiGenerated: true, basis: { kind: 'product_capture' } }] })
    )
    expect(r.gecti).toBe(false)
    if (r.gecti) return
    expect(r.kapi).toBe('urun-ekrani')
    expect(r.mesaj).toContain('ÜRETİLMİŞ')
  })

  it('dayanaksız ürün ekranı da durduruyor — "çekildi" demek yetmiyor', () => {
    const r = prospectDeckZinciri(temiz({ urunEkranlari: [{ aiGenerated: false }] }))
    expect(r.gecti).toBe(false)
    if (r.gecti) return
    expect(r.kapi).toBe('urun-ekrani')
  })

  it('kusurlu manifest SON kapıda durduruyor', () => {
    const r = prospectDeckZinciri(temiz({ manifestKusurlari: [{ kind: 'no_selected_provider' }] }))
    expect(r.gecti).toBe(false)
    if (r.gecti) return
    expect(r.kapi).toBe('yayinlanabilirlik')
    expect(r.kosulanKapilar).toEqual(DECK_KAPI_SIRASI)
  })

  it('SIRA maliyet sırası — ucuz ve kesin olan önce', () => {
    // Hem bayat kaynak hem kaynaksız iddia varsa TAZELİK konuşuyor: bir tarih
    // karşılaştırması, bütün belgeyi taramaktan ucuzdur.
    const r = prospectDeckZinciri(
      temiz({
        kaynaklar: [{ sourceRef: 'x', fetchedAt: '2026-01-01T12:00:00.000Z' }],
        lexiconIhlalleri: [{ kind: 'unsourced_claim' }],
      })
    )
    expect(r.gecti === false && r.kapi).toBe('tazelik')
  })
})
