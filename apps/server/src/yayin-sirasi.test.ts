// YAYIN SIRASI — tarihsiz kuyruk, elle taşınır, sona eklenir (FAZ-19.14 · UX-22).
//
// ⚠ ⚠ **TAKVİM KALDIRILDI ve kararı depo sahibi verdi:** *"takvim eşitlemek saçmalık —
// sadece yayına hazır demek, yayın sırasına sokmak, tarihsiz, ve pushlamak önemli."*
// Tarih bir söz veriyordu ve tutamıyordu; sıra yalnız NE'DEN SONRA'yı söylüyor ve o
// her zaman doğru kalıyor.
//
// ⚠ ⚠ **VE ASIL SINAMA: SIRA KENDİLİĞİNDEN DEĞİŞMİYOR MU.** Eski planlayıcı her
// çağrıda yeniden hesaplıyordu; aynı gönderi bir gün ikinci, ertesi gün beşinciydi.
// Tek otomatik kural: yeni eklenen SONA gelir.

import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  siraOlaylari,
  siradaTasi,
  siradakiYer,
  siradanCikar,
  siraninSonunaEkle,
  yayinSirasi,
} from './yayin-sirasi.js'

const kok = (): string => mkdtempSync(join(tmpdir(), 'sira-'))
const R = (n: number): string => `run_01a0000${String(n)}-0000-7000-8000-00000000000${String(n)}`
const AN = (n: number): string => `2026-08-27T1${String(n)}:00:00.000Z`

const kur = (r: string, adet: number): void => {
  for (let i = 1; i <= adet; i++) siraninSonunaEkle(r, { runId: R(i), simdi: AN(i) })
}
const sirali = (r: string): string[] => yayinSirasi(r).map((x) => x.runId)

describe('yayın sırası', () => {
  it('defter yoksa BOŞ kuyruk — çökmüyor', () => {
    expect(yayinSirasi(kok())).toEqual([])
  })

  it('YENİ EKLENEN SONA gelir — tek otomatik kural', () => {
    const r = kok()
    kur(r, 3)
    expect(sirali(r)).toEqual([R(1), R(2), R(3)])
  })

  it('AYNI gönderi ikinci kez sıraya GİRMİYOR', () => {
    const r = kok()
    kur(r, 2)
    const y = siraninSonunaEkle(r, { runId: R(1), simdi: AN(9) })
    expect(y.ok, 'iki kez sıraya sokmak, iki kez yayınlamaya davettir').toBe(false)
    expect(sirali(r)).toHaveLength(2)
  })

  it('ELLE TAŞIMA sırayı değiştiriyor — ve YALNIZ tek satır yazıyor', () => {
    const r = kok()
    kur(r, 4)
    const onceki = siraOlaylari(r).olaylar.length
    expect(siradaTasi(r, { runId: R(4), hedefSira: 1, simdi: AN(5) }).ok).toBe(true)
    expect(sirali(r)).toEqual([R(4), R(1), R(2), R(3)])
    expect(siraOlaylari(r).olaylar.length - onceki, 'kesirli konum: komşulara dokunulmuyor').toBe(1)
  })

  it('ORTAYA taşıma komşuların arasına giriyor', () => {
    const r = kok()
    kur(r, 4)
    expect(siradaTasi(r, { runId: R(1), hedefSira: 3, simdi: AN(5) }).ok).toBe(true)
    expect(sirali(r)).toEqual([R(2), R(3), R(1), R(4)])
  })

  it('ARALIK DIŞI hedef REDDEDİLİYOR — sessizce en yakına koymuyor', () => {
    const r = kok()
    kur(r, 3)
    for (const h of [0, 4, -1]) {
      expect(siradaTasi(r, { runId: R(1), hedefSira: h, simdi: AN(5) }).ok, String(h)).toBe(false)
    }
    expect(sirali(r), 'sıra bozulmadı').toEqual([R(1), R(2), R(3)])
  })

  it('SIRADAN ÇIKARMA kuyruktan düşürüyor ama KAYDI silmiyor', () => {
    const r = kok()
    kur(r, 3)
    expect(siradanCikar(r, { runId: R(2), simdi: AN(5) }).ok).toBe(true)
    expect(sirali(r)).toEqual([R(1), R(3)])
    expect(siraOlaylari(r).olaylar.length, 'geçmiş korunuyor').toBe(4)
    expect(siradakiYer(r, R(2))).toBeNull()
  })

  it('ÇIKARILAN gönderi yeniden SONA eklenebiliyor', () => {
    const r = kok()
    kur(r, 3)
    siradanCikar(r, { runId: R(1), simdi: AN(5) })
    expect(siraninSonunaEkle(r, { runId: R(1), simdi: AN(6) }).ok).toBe(true)
    expect(sirali(r), 'başa değil SONA').toEqual([R(2), R(3), R(1)])
  })

  it('SIRA kendiliğinden DEĞİŞMİYOR — aynı defter her okumada aynı sıra', () => {
    const r = kok()
    kur(r, 5)
    siradaTasi(r, { runId: R(5), hedefSira: 2, simdi: AN(6) })
    const ilk = sirali(r)
    expect(sirali(r)).toEqual(ilk)
    expect(sirali(r)).toEqual(ilk)
  })

  it('geçersiz runId reddediliyor', () => {
    expect(siraninSonunaEkle(kok(), { runId: '../../etc', simdi: AN(1) }).ok).toBe(false)
  })
})
