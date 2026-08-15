// Sağlayıcı sözleşme testi (§8.4 · R-42, R-43 · FAZ-3.6).
//
// Bu dosya TEK BİR sağlayıcıyı test etmez — **katalogdaki her adaptöre aynı sözleşmeyi
// uygular**. Yeni bir adaptör eklendiği gün, kimse yeni test yazmasa bile sözleşme
// otomatik olarak ona da sorulur. Adaptör başına elle yazılan testler, eklenen sonuncu
// adaptörü her seferinde atlar.
//
// **Ağ KAPALI koşar** ve bu iki katmanla ölçülür:
//   1. `onUnhandledRequest: 'error'` — istek reddedilir
//   2. `request:start` SAYACI — istek DENENDİĞİ anda sayılır
// İkincisi olmadan `fetch(...).catch(() => undefined)` yazan bir adaptör sessizce geçer:
// istek reddedilir, hata yutulur, test yeşil kalır. Denemenin kendisi ihlaldir; reddin
// yakalanıp yakalanmaması adaptörün insafına bırakılamaz.

import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { OFFLINE_LISTEN, offlineServer } from '@suite/kernel/testing'
import { ADAPTERS } from './registry.js'
import type { ProviderAdapter, ProviderInput } from './types.js'

// Hiç handler yok: HER istek "unhandled" ve `error` moduyla testi düşürür.
const server = offlineServer()
/** DENENEN her istek — yutulmuş olsa bile. */
const denenenIstekler: string[] = []

beforeAll(() => {
  server.listen(OFFLINE_LISTEN)
  server.events.on('request:start', ({ request }) => {
    denenenIstekler.push(`${request.method} ${request.url}`)
  })
})
afterEach(() => {
  server.resetHandlers()
})
afterAll(() => {
  server.close()
})

const girdi = (over: Partial<ProviderInput> = {}): ProviderInput => ({
  capability: 'text.generate',
  lane: 'free',
  prompt: 'Ölçemediğiniz fireyi yönetemezsiniz',
  constraints: {},
  idempotencyKey: 'idem_contract',
  ...over,
})

describe.each(ADAPTERS.map((a) => [a.id, a] as const))(
  'sözleşme: %s',
  (_id, adapter: ProviderAdapter) => {
    it('en az bir yetenek bildiriyor', () => {
      expect(adapter.capabilities().length).toBeGreaterThan(0)
    })

    it('yetenek adı FİİL adı DEĞİL (§3.10)', () => {
      // `GENERATE` bir fiil, `text.generate` bir yetenek. Karıştıran bir adaptör
      // yönlendiricinin hiç bulamayacağı bir aday olur.
      for (const c of adapter.capabilities()) {
        expect(c.name, c.name).not.toMatch(/^[A-Z]+$/)
        expect(c.name).toContain('.')
      }
    })

    it('şerit yalnız free|premium — üçüncü şerit sözleşmede yok (D-2)', () => {
      for (const c of adapter.capabilities()) {
        expect(c.lanes.length).toBeGreaterThan(0)
        for (const l of c.lanes) expect(['free', 'premium']).toContain(l)
      }
    })

    it('`estimate()` SENKRON — `Promise` dönerse R-42 çiğnenmiş', () => {
      const yetenek = adapter.capabilities()[0]
      const serit = yetenek?.lanes[0]
      if (yetenek === undefined || serit === undefined) return
      const v = adapter.validate(girdi({ capability: yetenek.name, lane: serit }))
      expect(v.ok, v.ok ? '' : JSON.stringify(v.error)).toBe(true)
      if (!v.ok) return
      const t = adapter.estimate(v.value)
      // Çalışma zamanı kanıtı: derleme hatası tip seviyesinde zaten var (types kapısı),
      // ama gövde `Promise` döndürüp tipi `as` ile bastırırsa derleyici susar.
      expect(t).not.toBeInstanceOf(Promise)
      expect(typeof t.low.micros).toBe('bigint')
      expect(t.high.micros).toBeGreaterThanOrEqual(t.low.micros)
    })

    it('`available()` SENKRON ve ağa çıkmıyor', () => {
      const r = adapter.available({})
      expect(r).not.toBeInstanceOf(Promise)
      expect(typeof r).toBe('boolean')
    })

    it('`validate()` FIRLATMIYOR — hata bir değerdir (§8.6)', () => {
      // Çöp girdiyle bile `Result` dönmeli. İstisna, çağıranın tip imzasında görünmez ve
      // gözetimsiz bir çalıştırmada defteri yarım bırakır.
      const cop = { capability: '', lane: 'free', prompt: '', constraints: {}, idempotencyKey: '' }
      expect(() => adapter.validate(cop as ProviderInput)).not.toThrow()
      expect(adapter.validate(cop as ProviderInput).ok).toBe(false)
    })

    it('bilinmeyen yeteneği REDDEDİYOR — sessizce kabul etmiyor', () => {
      const r = adapter.validate(girdi({ capability: 'protein.fold' }))
      expect(r.ok).toBe(false)
    })

    it('`id` ve `title` boş değil', () => {
      expect(adapter.id).not.toBe('')
      expect(adapter.title).not.toBe('')
    })
  }
)

describe('ağ sınırı', () => {
  it('sözleşme kontrolleri sırasında HİÇBİR istek DENENMEDİ', async () => {
    // Sıralama önemli: bu `describe` dosyanın SONUNDA ve yukarıdaki her `it` çalıştıktan
    // sonra koşar. Sayaç boş değilse hangi adaptörün nereye gitmeye çalıştığı yazılı.
    await Promise.resolve()
    expect(denenenIstekler, denenenIstekler.join(' · ')).toHaveLength(0)
  })
})

describe('katalog bütünlüğü', () => {
  it('adaptör id çakışması yok', () => {
    const idler = ADAPTERS.map((a) => a.id)
    expect(new Set(idler).size).toBe(idler.length)
  })

  it('katalog BOŞ DEĞİL — boş katalog bu dosyayı sessizce anlamsız yapardı', () => {
    // `describe.each([])` hiç test üretmez ve dosya YEŞİL raporlar. Bu satır olmadan
    // tüm adaptörler silinse bile sözleşme testi "geçti" derdi.
    expect(ADAPTERS.length).toBeGreaterThan(0)
  })
})
