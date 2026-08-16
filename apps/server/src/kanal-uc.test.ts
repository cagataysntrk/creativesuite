import { describe, expect, it } from 'vitest'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { RateLimiter } from '@suite/engine'
import { publishedLedgerPath } from '@suite/kernel'
import { kanalPanosu, surumDurumu } from './kanal-uc.js'

const SIMDI = '2026-08-16T10:00:00.000Z'

const kur = (tokenlar?: readonly { provider: string; expiresAt: string }[]): string => {
  const root = mkdtempSync(join(tmpdir(), 'kanal-'))
  if (tokenlar !== undefined) {
    mkdirSync(join(root, 'secrets'), { recursive: true })
    writeFileSync(
      join(root, 'secrets/token-durumu.json'),
      JSON.stringify({
        kayitlar: tokenlar.map((t) => ({
          provider: t.provider,
          expiresAt: t.expiresAt,
          obtainedAt: '2026-06-01T00:00:00.000Z',
          scopes: [],
        })),
      })
    )
  }
  return root
}

const defterYaz = (root: string, satirlar: readonly string[]): void => {
  const yol = join(root, publishedLedgerPath())
  mkdirSync(dirname(yol), { recursive: true })
  writeFileSync(yol, satirlar.map((s) => `${s}\n`).join(''))
}

const kanal = (root: string, ad: string, limiter?: RateLimiter) => {
  const p = kanalPanosu(
    limiter === undefined
      ? { repoRoot: root, simdi: SIMDI }
      : { repoRoot: root, simdi: SIMDI, limiter }
  )
  return p.kanallar.find((k) => k.kanal === ad)!
}

describe('kanal durumu', () => {
  // 🧪 FAZ-7.7 kabul kriteri: token'ı 3 gün kalacak şekilde ayarla → UYARI durumu.
  // Ekran bu üç şeyi birden gösterir: glyph (⚠), okuma metni ve "yayın hâlâ mümkün".
  it('üç gün kalan token UYARI verir ama yayını BLOKLAMAZ', () => {
    const root = kur([{ provider: 'meta', expiresAt: '2026-08-19T10:00:00.000Z' }])
    const m = kanal(root, 'meta')
    expect(m.token.durum.kind).toBe('yenile')
    expect(m.token.bloklu).toBe(false)
    expect(m.yayinaUygun).toBe(true)
    expect(m.token.mesaj).toContain('YENİLEME ZAMANI')
  })

  it('ölmüş token yayını BLOKLAR ve engel listesine düşer', () => {
    const root = kur([{ provider: 'meta', expiresAt: '2026-07-01T00:00:00.000Z' }])
    const m = kanal(root, 'meta')
    expect(m.token.durum.kind).toBe('olmus')
    expect(m.yayinaUygun).toBe(false)
    expect(m.engeller.join(' ')).toContain('ÖLDÜ')
  })

  // **Kaydın YOKLUĞU "süresiz" değildir.** Dosyayı silmek, kontrolü kapatmanın en
  // kolay yolu olsaydı kontrol hiç var olmamış olurdu.
  it('kayıt yoksa durum BİLİNMİYOR ve yayın bloklu', () => {
    const p = kanalPanosu({ repoRoot: kur(), simdi: SIMDI })
    for (const k of p.kanallar) {
      expect(k.token.durum.kind).toBe('bilinmiyor')
      expect(k.yayinaUygun).toBe(false)
    }
  })

  // **Ölçülmeyen kota, dolu kota değildir** (D-175). Kovalar çalıştırma sürecinde
  // yaşıyor; sunucuda yeni bir limiter kurmak her seferinde "dolu" derdi.
  it('limiter verilmezse oran bütçesi ÖLÇÜLMEDİ, "dolu" değil', () => {
    const m = kanal(kur([]), 'meta')
    expect(m.oran.kalan).toBeNull()
    expect(m.oran.kapasite).toBeGreaterThan(0)
    expect(m.oran.yayinPuani).toBe(3)
  })

  it('limiter verilirse gerçek kalan puan okunur', () => {
    const l = new RateLimiter()
    l.take('meta', 'channel.publish', 3)
    const m = kanal(kur([]), 'meta', l)
    expect(m.oran.kalan).not.toBeNull()
    expect(m.oran.kalan!).toBeLessThan(m.oran.kapasite)
  })

  // **Defterin YOKLUĞU sıfır yayın değildir** (D-38): defter türetilemez ve yokluğu
  // bir kaza olabilir. Sıfır göstermek, yinelemeleri serbest bırakmış olurdu.
  it('yayın defteri yoksa geçmiş ÖLÇÜLEMEDİ olarak bildirilir', () => {
    const p = kanalPanosu({ repoRoot: kur([]), simdi: SIMDI })
    expect(p.gecmis).toBeNull()
    expect(p.gecmisNeden).toContain('ÖLÇÜLEMEDİ')
  })

  it('defter varsa toplam ve son yayın okunur', () => {
    const root = kur([])
    defterYaz(root, [
      JSON.stringify({
        digest: 'sha256:a',
        platform: 'instagram',
        externalId: '1',
        runId: 'run_1',
        publishedAt: '2026-08-15T09:00:00.000Z',
      }),
    ])
    const p = kanalPanosu({ repoRoot: root, simdi: SIMDI })
    expect(p.gecmis?.toplam).toBe(1)
    expect(p.gecmis?.sonYayin).toBe('2026-08-15T09:00:00.000Z')
  })

  // Hatırlatıcı eşikten ÖNCE konuşmalı: 90. günde kırmızı yanan bir gösterge,
  // yeniden kontrol için zaman bırakmaz.
  it('sürüm hatırlatıcısı eskimeden önce kalan günü söyler', () => {
    const s = surumDurumu(SIMDI)
    expect(s.eskimis).toBe(false)
    expect(s.kalanGun).not.toBeNull()
    expect(s.kalanGun!).toBeGreaterThan(0)
    // Eskiyince LinkedIn'de bir UYARI değil ENGEL olur: emekli sürüm 426 döner.
    const gec = surumDurumu('2027-08-16T10:00:00.000Z')
    expect(gec.eskimis).toBe(true)
    expect(gec.kalanGun!).toBeLessThan(0)
  })

  it('sürüm eskidiğinde LinkedIn yayını bloklanır, Meta etkilenmez', () => {
    const root = kur([
      { provider: 'meta', expiresAt: '2027-12-01T00:00:00.000Z' },
      { provider: 'linkedin', expiresAt: '2027-12-01T00:00:00.000Z' },
    ])
    const p = kanalPanosu({ repoRoot: root, simdi: '2027-08-16T10:00:00.000Z' })
    const li = p.kanallar.find((k) => k.kanal === 'linkedin')!
    const meta = p.kanallar.find((k) => k.kanal === 'meta')!
    expect(li.yayinaUygun).toBe(false)
    expect(li.engeller.join(' ')).toContain('sürüm sabiti')
    expect(meta.yayinaUygun).toBe(true)
  })

  // Zamanlayıcı YOK ve bu söyleniyor: boş bir liste, "var ama iş almadı" derdi.
  it('zamanlayıcının olmadığını açıkça bildirir', () => {
    expect(kanalPanosu({ repoRoot: kur([]), simdi: SIMDI }).zamanlamaVar).toBe(false)
  })
})
