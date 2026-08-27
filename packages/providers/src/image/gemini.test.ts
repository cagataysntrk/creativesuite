// Gemini görsel adaptörü — anahtar listesi ve rotasyon kararı.
//
// ⚠ ⚠ **BAŞARI YOLU BURADA SINANMIYOR ve bu bilinçli.** Faturalandırma kapalıyken
// gerçek uçtan 200 alınamıyor; başarılı yanıt şeklini bir cassette'e yazıp "doğrulandı"
// demek, komşu `cloudflare.ts`in kaydettiği hatanın birebir tekrarı olurdu: *"bir
// cassette, sağlayıcının davranışını değil senin varsayımını kaydeder."* Sınanan şey,
// ölçülebilen şey: kasadan anahtarların nasıl okunduğu ve hangi HTTP kodunda sıradaki
// anahtara geçileceği.

import { describe, expect, it } from 'vitest'
import { anahtarDegistir, anahtarlar, geminiImage } from './gemini.js'

describe('anahtarlar', () => {
  it('virgülle ayrılmış listeyi okuyor', () => {
    expect(anahtarlar({ GEMINI_API_KEYS: 'a,b,c' })).toEqual(['a', 'b', 'c'])
  })

  it('boşluk ve SONDAKİ VİRGÜL bir anahtar üretmiyor', () => {
    // Kasaya elle yazılan bir listede beklenen kaza; sessizce boş bir deneme olurdu.
    expect(anahtarlar({ GEMINI_API_KEYS: ' a , b ,, ' })).toEqual(['a', 'b'])
  })

  it('İKİ KEZ yapıştırılmış anahtar bir kez deneniyor', () => {
    expect(anahtarlar({ GEMINI_API_KEYS: 'a,b,a' })).toEqual(['a', 'b'])
  })

  it('değişken YOKSA liste boş — ve adaptör kullanılamaz diyor', () => {
    expect(anahtarlar({})).toEqual([])
    expect(geminiImage.available({})).toBe(false)
    expect(geminiImage.available({ GEMINI_API_KEYS: 'a' })).toBe(true)
  })
})

describe('anahtarDegistir', () => {
  it('KOTA ve YETKİ hatasında sıradaki anahtar deneniyor', () => {
    // Bu ikisi anahtara ÖZGÜ: başka bir anahtar başarabilir.
    expect(anahtarDegistir(429)).toBe(true)
    expect(anahtarDegistir(403)).toBe(true)
  })

  it('BOZUK İSTEM ve SUNUCU hatasında anahtar değişmiyor', () => {
    // ⚠ Anahtardan bağımsız: aynı isteği altı kez göndermek altı kez aynı cevabı alır,
    // sadece daha yavaş — ve altı anahtarın kotasını boşa yakar.
    expect(anahtarDegistir(400)).toBe(false)
    expect(anahtarDegistir(500)).toBe(false)
    expect(anahtarDegistir(404)).toBe(false)
  })
})

describe('şerit', () => {
  it('YALNIZ premium — bedava katmanda görsel kotası SIFIR ölçüldü', () => {
    // ⚠ ⚠ Altı anahtarın altısında da `limit: 0`; resmî fiyat sayfası da Nano Banana
    // satırında Free Tier için "Not available" diyor. Bedava şeride koymak,
    // yönlendiriciye her koşuda 429 yedirmek olurdu.
    const c = geminiImage.capabilities()
    expect(c).toHaveLength(1)
    expect(c[0]?.lanes).toEqual(['premium'])
  })

  it('anahtarsız çağrıda MISSING_CREDENTIALS — sessiz boş görsel değil', async () => {
    const vi = geminiImage.validate({
      capability: 'image.generate',
      lane: 'premium',
      prompt: 'a steel cube on plain ground',
      constraints: { aspect: '1:1', no_text: true },
      idempotencyKey: 'k1',
    })
    expect(vi.ok).toBe(true)
    if (!vi.ok) return
    const r = await geminiImage.start(vi.value, {
      correlationId: 'c1',
      env: {},
      signal: new AbortController().signal,
    })
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.error.code).toBe('MISSING_CREDENTIALS')
  })
})
