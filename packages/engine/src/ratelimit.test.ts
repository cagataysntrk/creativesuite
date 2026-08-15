import { describe, expect, it } from 'vitest'
import { manualClock } from '@suite/kernel'
import { RateLimiter } from './ratelimit.js'

describe('token kovası', () => {
  it('kapasite kadar ani yük geçiyor, sonraki reddediliyor', () => {
    const c = manualClock('2026-08-15T09:00:00.000Z')
    const l = new RateLimiter({ capacity: 3, refillPerSecond: 1 }, c)
    for (let i = 0; i < 3; i++) expect(l.take('p', 'image.generate').allowed, `#${i}`).toBe(true)
    const r = l.take('p', 'image.generate')
    expect(r.allowed).toBe(false)
    if (!r.allowed) expect(r.retryAfterMs).toBe(1000)
  })

  it('zaman geçince doluyor', () => {
    const c = manualClock('2026-08-15T09:00:00.000Z')
    const l = new RateLimiter({ capacity: 2, refillPerSecond: 2 }, c)
    l.take('p', 'x')
    l.take('p', 'x')
    expect(l.take('p', 'x').allowed).toBe(false)
    c.ilerlet(500) // 0.5sn × 2 token/sn = 1 token
    expect(l.take('p', 'x').allowed).toBe(true)
  })

  it('reddedilen istek de saati ilerletiyor — kova DONMUYOR', () => {
    // Reddederken `lastMs` güncellenmeseydi kova bir daha hiç dolmazdı ve ilk 429
    // kalıcı bir kilit olurdu.
    const c = manualClock('2026-08-15T09:00:00.000Z')
    const l = new RateLimiter({ capacity: 1, refillPerSecond: 1 }, c)
    l.take('p', 'x')
    c.ilerlet(100)
    expect(l.take('p', 'x').allowed).toBe(false)
    c.ilerlet(1000)
    expect(l.take('p', 'x').allowed).toBe(true)
  })

  it('kovalar `(providerId, capability)` bazında AYRI', () => {
    const c = manualClock('2026-08-15T09:00:00.000Z')
    const l = new RateLimiter({ capacity: 1, refillPerSecond: 1 }, c)
    expect(l.take('p', 'image.generate').allowed).toBe(true)
    // Aynı sağlayıcının başka ucu etkilenmiyor: tek kova olsaydı görsel üretimi
    // metin üretimini aç bırakırdı.
    expect(l.take('p', 'text.generate').allowed).toBe(true)
    expect(l.take('q', 'image.generate').allowed).toBe(true)
    expect(l.take('p', 'image.generate').allowed).toBe(false)
  })

  it('kapasite aşılamıyor — uzun boşluk sonsuz kredi vermiyor', () => {
    const c = manualClock('2026-08-15T09:00:00.000Z')
    const l = new RateLimiter({ capacity: 2, refillPerSecond: 10 }, c)
    l.take('p', 'x')
    c.ilerlet(60_000) // bir dakika bekle
    expect(l.available('p', 'x')).toBe(2)
    expect(l.take('p', 'x').allowed).toBe(true)
    expect(l.take('p', 'x').allowed).toBe(true)
    expect(l.take('p', 'x').allowed).toBe(false)
  })

  it('`available` yan etkisiz — gözlem token yakmıyor', () => {
    const c = manualClock('2026-08-15T09:00:00.000Z')
    const l = new RateLimiter({ capacity: 3, refillPerSecond: 1 }, c)
    l.available('p', 'x')
    l.available('p', 'x')
    expect(l.available('p', 'x')).toBe(3)
  })
})
