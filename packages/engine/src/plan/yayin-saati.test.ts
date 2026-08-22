// Yayın saati önerisi ÖLÇÜMDEN geliyor mu, ve ölçüm yoksa SUSUYOR mu (FAZ-17.3 · §11).
//
// ⚠ ⚠ Bu dosyanın en önemli testi "öneri doğru mu" değil, **"veri yokken öneri
// yapılmıyor mu"**. Uydurulmuş bir saat, kaynaksız bir sayısal iddiadır (Yasa 8) ve
// "öneri" etiketi onu kaynaklı yapmaz.

import { describe, expect, it } from 'vitest'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
// ⚠ Defter ÜRETİM yazıcısıyla kuruluyor: yolu testin kendisi bilseydi, `derived/runs`
// yolunun ikinci bir sahibi olurdu (`manifest-yazici` darboğazı) ve yol değiştiği gün
// test yeşil kalıp üretim kırılırdı.
import { appendPublished, initLedgerFile } from '../publish-ledger.js'
import {
  EN_AZ_GOZLEM,
  turkiyeSaati,
  yayinGozlemleri,
  yayinSaatiOner,
  type YayinGozlemi,
} from './yayin-saati.js'

const g = (publishedAt: string, etkilesim: number | null): YayinGozlemi => ({
  publishedAt,
  etkilesim,
})

describe('yayinSaatiOner', () => {
  it('ölçüm YOKKEN öneri yapmıyor ve sebebini yazıyor', () => {
    const r = yayinSaatiOner([g('2026-08-01T16:00:00Z', null), g('2026-08-02T16:00:00Z', null)])
    expect(r.tur).toBe('veri-yok')
    if (r.tur !== 'veri-yok') return
    expect(r.ornek).toBe(0)
    expect(r.sebep).toMatch(/öneremem/)
  })

  it('YETERSİZ ölçümde de susuyor — kaç ölçüm olduğunu söyleyerek', () => {
    const az = Array.from({ length: EN_AZ_GOZLEM - 1 }, (_, i) =>
      g(`2026-08-0${String(i + 1)}T16:00:00Z`, 100)
    )
    const r = yayinSaatiOner(az)
    expect(r.tur).toBe('veri-yok')
    if (r.tur !== 'veri-yok') return
    expect(r.ornek).toBe(EN_AZ_GOZLEM - 1)
    expect(r.sebep).toContain(String(EN_AZ_GOZLEM))
  })

  it('sıfır etkileşim bir ÖLÇÜMDÜR — `null` ile karışmıyor', () => {
    const sifirlar = Array.from({ length: EN_AZ_GOZLEM }, (_, i) =>
      g(`2026-08-0${String(i + 1)}T16:00:00Z`, 0)
    )
    const r = yayinSaatiOner(sifirlar)
    // Hepsi sıfır: öneri yine de geliyor çünkü ÖLÇÜM var. "Veri yok" demek yanlış olurdu.
    expect(r.tur).toBe('oneri')
    if (r.tur !== 'oneri') return
    expect(r.ornek).toBe(EN_AZ_GOZLEM)
  })

  it('EN YÜKSEK ORTALAMAYI seçiyor — en çok yayın yapılanı değil', () => {
    // 16:00 TR diliminde ÜÇ zayıf yayın, 20:00 diliminde İKİ güçlü yayın.
    // Toplama bakan bir uygulama 16:00 derdi (30 > 20); ortalama 20:00 diyor.
    const r = yayinSaatiOner([
      g('2026-08-01T13:00:00Z', 10), // TR 16
      g('2026-08-02T13:00:00Z', 10),
      g('2026-08-03T13:00:00Z', 10),
      g('2026-08-04T17:00:00Z', 100), // TR 20
      g('2026-08-05T17:00:00Z', 100),
    ])
    expect(r.tur).toBe('oneri')
    if (r.tur !== 'oneri') return
    expect(r.saat).toBe(20)
    expect(r.gerekce).toMatch(/20:00/)
    expect(r.gerekce).toMatch(/5 ölçülmüş yayın/)
  })

  it('gerekçe SAYI taşıyor — "iyi saat" demiyor', () => {
    const r = yayinSaatiOner(
      Array.from({ length: 6 }, (_, i) => g(`2026-08-0${String(i + 1)}T17:00:00Z`, 50))
    )
    expect(r.tur).toBe('oneri')
    if (r.tur !== 'oneri') return
    expect(r.gerekce).toMatch(/ortalama \d+/)
    expect(r.gerekce).toMatch(/6 ölçülmüş/)
  })
})

describe('turkiyeSaati', () => {
  it('UTC damgası +3 kayıyor', () => {
    expect(turkiyeSaati('2026-08-01T13:00:00Z')).toBe(16)
  })

  it('gece yarısını AŞAN damga güne sarıyor', () => {
    expect(turkiyeSaati('2026-08-01T22:30:00Z')).toBe(1)
  })

  it('damganın KENDİ ofseti okunuyor — UTC sanılmıyor', () => {
    // 13:00+05:00 = 08:00 UTC = TR 11:00. UTC sayılsaydı 16 derdik: iki tam saat sapma.
    expect(turkiyeSaati('2026-08-01T13:00:00+05:00')).toBe(11)
  })

  it('biçimsiz damga `null` — sessizce 0 sayılmıyor', () => {
    expect(turkiyeSaati('dün akşam')).toBeNull()
    expect(turkiyeSaati('2026-08-01')).toBeNull()
    expect(turkiyeSaati('2026-08-01T25:00:00Z')).toBeNull()
  })
})

describe('yayinGozlemleri', () => {
  const kur = (kayitlar: readonly Parameters<typeof appendPublished>[1][]): string => {
    const kok = mkdtempSync(join(tmpdir(), 'yayin-saati-'))
    initLedgerFile(kok)
    for (const k of kayitlar) appendPublished(kok, k)
    return kok
  }

  it('defter YOKSA boş liste — öneri zaten `veri-yok` diyecek', () => {
    const kok = mkdtempSync(join(tmpdir(), 'yayin-saati-bos-'))
    expect(yayinGozlemleri(kok)).toEqual([])
  })

  it('BUGÜNKÜ defter etkileşim taşımıyor — gözlemler `null` dönüyor', () => {
    // ⚠ Bu test, üretimde HANGİ DALIN döndüğünü kayda geçiriyor: yayın kaydı var ama
    // ölçüm yok, yani hat saat öneremez. Analitik çekimi (FAZ-7.9) geldiğinde bu test
    // KIRMIZIYA döner ve dönmelidir — o gün öneri dalı açılıyor demektir.
    const kok = kur([
      {
        digest: 'sha256:a',
        platform: 'instagram',
        externalId: '1',
        runId: 'run_x',
        publishedAt: '2026-08-01T13:00:00Z',
      },
    ])
    const gozlemler = yayinGozlemleri(kok)
    expect(gozlemler).toHaveLength(1)
    expect(gozlemler[0]?.etkilesim).toBeNull()
    expect(yayinSaatiOner(gozlemler).tur).toBe('veri-yok')
  })

  it('etkileşim alanı EKLENDİĞİNDE okunuyor — çağıran değişmeden', () => {
    const kok = kur(
      Array.from({ length: EN_AZ_GOZLEM }, (_, i) => ({
        digest: `sha256:${String(i)}`,
        platform: 'instagram',
        externalId: String(i),
        runId: 'run_x',
        publishedAt: '2026-08-01T17:00:00Z',
        engagement: 42,
      }))
    )
    const r = yayinSaatiOner(yayinGozlemleri(kok))
    expect(r.tur).toBe('oneri')
    if (r.tur !== 'oneri') return
    expect(r.saat).toBe(20)
  })
})
