// Tarih yardımcıları — TEK yerde, her listede aynı (§12.4).
//
// ⚠ ⚠ **KOŞU LİSTESİNDE TARİH HİÇ YOKTU.** Tablo kimlik, hat, commit ve para
// gösteriyordu; "bu ne zaman koştu" sorusunun cevabı ekranda YOKTU ve insan koşu
// kimliğinin içindeki uuidv7 damgasını okumaya zorlanıyordu.

import { describe, expect, it } from 'vitest'
import { aralikta, tamTarih, tariheGore } from './tarih.js'

describe('tam tarih', () => {
  it('ISO → okunur Türkçe tarih, saat DAHİL', () => {
    const t = tamTarih('2026-08-22T11:09:12.417Z')
    // ⚠ Saat dilimi koşucuya göre değişir; ölçülen şey BİÇİM: yıl, ay adı ve saat var.
    expect(t).toContain('2026')
    expect(t).toMatch(/\d{2}:\d{2}/)
    expect(t).not.toContain('T')
  })

  it('boş ya da bozuk girdi `—` — olmayan bir gerçek UYDURULMUYOR', () => {
    expect(tamTarih('')).toBe('—')
    expect(tamTarih(null)).toBe('—')
    expect(tamTarih('bugün falan')).toBe('—')
  })
})

describe('tarihe göre sıralama', () => {
  const liste = [{ at: '2026-08-20T10:00:00Z' }, { at: '2026-08-22T10:00:00Z' }]

  it('iki yön de çalışıyor — sabit sıra iki sorudan birini yanlış yapardı', () => {
    expect(tariheGore(liste, (x) => x.at, 'yeni')[0]?.at).toBe('2026-08-22T10:00:00Z')
    expect(tariheGore(liste, (x) => x.at, 'eski')[0]?.at).toBe('2026-08-20T10:00:00Z')
  })

  it('girdi dizisi DEĞİŞMİYOR — sıralama bir görünüm kararı', () => {
    tariheGore(liste, (x) => x.at, 'eski')
    expect(liste[0]?.at).toBe('2026-08-20T10:00:00Z')
  })
})

describe('tarih aralığı', () => {
  it('boş uç SINIRSIZ', () => {
    expect(aralikta('2026-08-22T10:00:00Z', '', '')).toBe(true)
    expect(aralikta('2026-08-22T10:00:00Z', '2026-08-01', '')).toBe(true)
  })

  it('bitiş GÜN SONUNA kadar — kullanıcı o günü dışarıda bırakmak istemiyor', () => {
    // ⚠ Saat 23:00 olan bir kayıt, "22 Ağustos'a kadar" süzgecinde İÇERİDE olmalı.
    expect(aralikta('2026-08-22T23:00:00Z', '', '2026-08-22')).toBe(true)
  })

  it('aralık dışı REDDEDİLİYOR', () => {
    expect(aralikta('2026-07-01T10:00:00Z', '2026-08-01', '')).toBe(false)
    expect(aralikta('2026-09-01T10:00:00Z', '', '2026-08-22')).toBe(false)
  })
})
