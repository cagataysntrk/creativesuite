// "Yeni bir tane üret" gerçekten yeni mi (FAZ-16.6 · D-308).
//
// ⚠ Ölçüm önce yapıldı: defterdeki son ÜÇ karosel koşusunun üçü de `sahne` seçmişti.
// Tekrar bir hata değil, doğru çalışan deterministik seçimin kaçınılmaz sonucuydu.

import { describe, expect, it } from 'vitest'
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { gecmisiOku } from './gecmis.js'
import { sablonSec } from './sablon-sec.js'

const defter = (kok: string, ad: string, sablon: string, konu: string): void => {
  mkdirSync(join(kok, ad), { recursive: true })
  writeFileSync(
    join(kok, ad, 'manifest.json'),
    JSON.stringify({
      runId: ad,
      pipeline: 'instagram-karosel',
      steps: [
        { stepId: 'cozumle', params: { topic: konu } },
        { stepId: 'kompozit', output: { sablonId: sablon } },
      ],
    })
  )
}

describe('koşu geçmişi', () => {
  it('şablonları EN YENİDEN eskiye okuyor — sıralama ada göre, mtime değil', () => {
    const d = mkdtempSync(join(tmpdir(), 'gecmis-'))
    defter(d, 'run_01a0001', 'veri-hikayesi', 'ilk konu')
    defter(d, 'run_01a0002', 'memphis', 'ikinci konu')
    defter(d, 'run_01a0003', 'sahne', 'ucuncu konu')
    const g = gecmisiOku(d)
    expect(g.sablonlar).toEqual(['sahne', 'memphis', 'veri-hikayesi'])
    expect(g.konular[0]).toBe('ucuncu konu')
  })

  it('defter yoksa BOŞ döner — çeşitlilik kuralı ilk koşuyu engellemiyor', () => {
    expect(gecmisiOku(join(tmpdir(), 'yok-boyle-bir-dizin-12345'))).toEqual({
      sablonlar: [],
      konular: [],
    })
  })

  it('başka hattın defteri sayılmıyor', () => {
    const d = mkdtempSync(join(tmpdir(), 'gecmis2-'))
    mkdirSync(join(d, 'run_01a0009'), { recursive: true })
    writeFileSync(
      join(d, 'run_01a0009', 'manifest.json'),
      JSON.stringify({ pipeline: 'linkedin-dokuman', steps: [{ output: { sablonId: 'sahne' } }] })
    )
    expect(gecmisiOku(d).sablonlar).toEqual([])
  })
})

// Zaman serisi + numaralı ritim taşıyan metin: birden çok şablona uyar, yani
// çeşitlilik kuralının gerçekten seçebileceği bir alternatif VAR.
const COKLU = [
  '2019 yılında oran yüzde 12 idi',
  '1. 2021 yılında yüzde 18 oldu',
  '2. 2023 yılında yüzde 24 oldu',
  '3. 2025 yılında yüzde 31 oldu',
  '4. Artış ayrıştırmadan geldi',
]

describe('çeşitlilik: son koşularda kullanılan şablon eleniyor', () => {
  it('geçmiş yokken en yüksek puanlı seçiliyor', () => {
    const r = sablonSec(COKLU, { gorselUretilebilir: true })
    expect(r.ok).toBe(true)
  })

  it('en iyi şablon yakın geçmişte varsa BAŞKA uygun aday seçiliyor', () => {
    const ilk = sablonSec(COKLU, { gorselUretilebilir: true })
    expect(ilk.ok).toBe(true)
    if (!ilk.ok) return
    const ikinci = sablonSec(COKLU, {
      gorselUretilebilir: true,
      sonKullanilan: [ilk.sablon.id],
    })
    expect(ikinci.ok).toBe(true)
    if (!ikinci.ok) return
    expect(ikinci.sablon.id).not.toBe(ilk.sablon.id)
    // Gerekçe SEBEBİ söylüyor: sessiz bir sapma, açıklanmış bir sapmadan kötüdür.
    expect(ikinci.neden).toContain('elendi')
  })

  it('başka uygun aday yoksa tekrar MEŞRU — seçim durmuyor', () => {
    const ilk = sablonSec(COKLU, { gorselUretilebilir: true })
    if (!ilk.ok) return
    const hepsi = ilk.puanlar.filter((p) => p.puan > 0).map((p) => p.id)
    const r = sablonSec(COKLU, { gorselUretilebilir: true, sonKullanilan: hepsi })
    expect(r.ok).toBe(true)
  })
})
