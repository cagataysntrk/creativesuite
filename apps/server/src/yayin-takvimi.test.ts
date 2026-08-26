// YAYIN TAKVİMİ DEFTERİ — insanın kararı YAŞIYOR mu (FAZ-19.13 · UX-6, UX-9).
//
// ⚠ ⚠ **BU DEFTER BİR BOŞLUKTAN DOĞDU.** `yayinPlaniKur` her çağrıda takvimi sıfırdan
// hesaplıyordu: aynı girdiye aynı takvim, ama İNSANIN verdiği hiçbir karar yaşamıyordu.
// Depo sahibi: *"yayında crud işlemleri manuel düzenleme silme geri alma değiştirme
// platform seçme vs her şey olmalı"*.
//
// ⚠ ⚠ **VE ASIL SINAMA: GERİ ALMA GERÇEKTEN GERİ ALIYOR MU.** Ekleme kolay, geri alma
// zor: kaydı SİLMEDEN kararı geri almak gerekiyor, yoksa *"bu neden 12'sine alınmıştı"*
// sorusu cevapsız kalır. Kapı hem kararın kalktığını hem KAYDIN durduğunu sınıyor.

import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { gecerliKararlar, takvimOlaylari, takvimeYaz } from './yayin-takvimi.js'

const kok = (): string => mkdtempSync(join(tmpdir(), 'takvim-'))
const R1 = 'run_01a03e9e-7d62-7560-b44d-0cb7225e2883'
const R2 = 'run_01a03e7d-5855-7c19-b0a9-d367ea0d2e57'
const AN = '2026-08-27T09:00:00.000Z'

describe('yayın takvimi defteri', () => {
  it('defter yoksa BOŞ döner — çökmüyor', () => {
    const r = kok()
    expect(takvimOlaylari(r)).toStrictEqual({ olaylar: [], bozuk: 0 })
    expect(gecerliKararlar(r).size).toBe(0)
  })

  it('elle planlama yazılıyor ve okunuyor', () => {
    const r = kok()
    const y = takvimeYaz(r, {
      runId: R1,
      karar: 'planla',
      tarih: '2026-09-12',
      platformlar: ['instagram', 'x'],
      simdi: AN,
    })
    expect(y.ok).toBe(true)
    const k = gecerliKararlar(r).get(R1)
    expect(k?.tarih).toBe('2026-09-12')
    expect(k?.platformlar).toStrictEqual(['instagram', 'x'])
  })

  it('SON SÖZ kazanıyor — ama önceki kayıt DURUYOR', () => {
    const r = kok()
    takvimeYaz(r, { runId: R1, karar: 'planla', tarih: '2026-09-12', simdi: AN })
    takvimeYaz(r, { runId: R1, karar: 'planla', tarih: '2026-09-19', simdi: AN })
    expect(gecerliKararlar(r).get(R1)?.tarih, 'geçerli olan sonuncusu').toBe('2026-09-19')
    // ⚠ Üstüne yazan bir kayıt "bu neden 19'una alındı" sorusunu cevapsız birakirdi.
    expect(takvimOlaylari(r).olaylar.length, 'iki karar da defterde').toBe(2)
  })

  it('GERİ ALMA kararı kaldırıyor ama KAYDI silmiyor', () => {
    const r = kok()
    takvimeYaz(r, { runId: R1, karar: 'planla', tarih: '2026-09-12', simdi: AN })
    takvimeYaz(r, { runId: R1, karar: 'geri-al', simdi: AN })
    expect(
      gecerliKararlar(r).has(R1),
      'geri alınan koşu otomatik takvime DÖNMELİ — yani elle kararı kalmamalı'
    ).toBe(false)
    expect(takvimOlaylari(r).olaylar.length, 'geçmiş korunuyor').toBe(2)
  })

  it('takvimden ÇIKARMA üretimi silmiyor, sıradan alıyor', () => {
    const r = kok()
    takvimeYaz(r, { runId: R1, karar: 'cikar', not: 'bu ay yayınlamayalım', simdi: AN })
    expect(gecerliKararlar(r).get(R1)?.karar).toBe('cikar')
    expect(gecerliKararlar(r).get(R1)?.not).toBe('bu ay yayınlamayalım')
  })

  it('koşular birbirini ETKİLEMİYOR', () => {
    const r = kok()
    takvimeYaz(r, { runId: R1, karar: 'planla', tarih: '2026-09-12', simdi: AN })
    takvimeYaz(r, { runId: R2, karar: 'cikar', simdi: AN })
    const k = gecerliKararlar(r)
    expect(k.get(R1)?.karar).toBe('planla')
    expect(k.get(R2)?.karar).toBe('cikar')
  })

  // ── DOĞRULAMA: uç doğrudan da çağrılabiliyor ─────────────────────────────
  it('geçersiz tarih REDDEDİLİYOR — takvim NaN ile dolmasın', () => {
    const r = kok()
    for (const t of ['', '12.09.2026', '2026-9-12', 'yarın']) {
      expect(takvimeYaz(r, { runId: R1, karar: 'planla', tarih: t, simdi: AN }).ok, t).toBe(false)
    }
    expect(takvimOlaylari(r).olaylar, 'reddedilen karar deftere GİRMEMELİ').toStrictEqual([])
  })

  it('bilinmeyen karar ve geçersiz runId reddediliyor', () => {
    const r = kok()
    expect(takvimeYaz(r, { runId: R1, karar: 'sil-gitsin', simdi: AN }).ok).toBe(false)
    expect(takvimeYaz(r, { runId: '../../etc', karar: 'cikar', simdi: AN }).ok).toBe(false)
  })

  it('`cikar` ve `geri-al` TARİH İSTEMİYOR', () => {
    const r = kok()
    expect(takvimeYaz(r, { runId: R1, karar: 'cikar', simdi: AN }).ok).toBe(true)
    expect(takvimeYaz(r, { runId: R1, karar: 'geri-al', simdi: AN }).ok).toBe(true)
  })

  // ── ALET SINAMASI ────────────────────────────────────────────────────────
  it('bozuk satır SAYILIYOR, defteri düşürmüyor', () => {
    const r = kok()
    takvimeYaz(r, { runId: R1, karar: 'planla', tarih: '2026-09-12', simdi: AN })
    // Elle bozuk bir satır ekleniyor — gerçekte bir yarım yazma böyle görünür.
    const yol = join(r, 'derived/yayin-takvimi.ndjson')
    const mevcut = readFileSync(yol, 'utf8')
    writeFileSync(yol, mevcut + '{bozuk json\n', 'utf8')
    const o = takvimOlaylari(r)
    expect(o.bozuk, 'atlanan satır SAYILIYOR — sessizce yutulmuyor').toBe(1)
    expect(o.olaylar.length, 'sağlam satır korunuyor').toBe(1)
  })

  it('zaman ÇAĞIRANDAN geliyor — defter yeniden oynatılabilir (R-06)', () => {
    const r = kok()
    takvimeYaz(r, { runId: R1, karar: 'planla', tarih: '2026-09-12', simdi: AN })
    expect(takvimOlaylari(r).olaylar[0]?.at, 'sunucu kendi saatini SORMAMALI').toBe(AN)
  })
})
