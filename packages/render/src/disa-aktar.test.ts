// Dışa aktarma — kesintisiz tek görsel ya da dilimlenmiş slaytlar (§7.1).
//
// ⚠ ⚠ **ÇIKTIYI ALMANIN TEK YOLU KOŞU DİZİNİNE GİRMEKTİ.** Panelde slaytlar görünüyordu
// ama indirilemiyordu; editörde hiç yoktu. Depo sahibi: *"hem koşu tarafında hem
// editörde çıktı alma seçeneği olmalı, hem seamless tek görsel olarak hem de
// bölümleyerek."*

import { describe, expect, it } from 'vitest'
import { ORNEK_SAHNE } from './katalog-ornek.js'
import { panoramaDisaAktar, type PanoramaBelgesi } from './index.js'

const DAMGA = { brandId: 'b', eraId: 'e', kitVersion: 'k' }
const BELGE = { ...ORNEK_SAHNE, tokenCss: '', stamp: DAMGA } as unknown as PanoramaBelgesi

describe('dışa aktarma', () => {
  it('DİLİM görsel: slayt sayısı kadar parça', async () => {
    const r = await panoramaDisaAktar(BELGE, { tarz: 'dilim', bicim: 'png' })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.value.length).toBe(ORNEK_SAHNE.kartlar.length)
    // ⚠ SIRA korunuyor: bir karosel sıralı okunur ve dosya adı o sırayı taşımalı.
    expect(r.value[0]?.ad).toBe('slayt-01.png')
    expect(r.value.every((p) => p.bayt.length > 1000)).toBe(true)
  }, 120_000)

  it('BÜTÜN görsel: TEK parça ve daha GENİŞ', async () => {
    const [dilim, butun] = await Promise.all([
      panoramaDisaAktar(BELGE, { tarz: 'dilim', bicim: 'jpg' }),
      panoramaDisaAktar(BELGE, { tarz: 'butun', bicim: 'jpg' }),
    ])
    expect(dilim.ok && butun.ok).toBe(true)
    if (!dilim.ok || !butun.ok) return
    expect(butun.value.length).toBe(1)
    // ⚠ Tek geniş tuval, tek slayttan BÜYÜK olmak zorunda: aynı boyut çıkarsa kesim
    // uygulanmamış demektir ve "kesintisiz" iddiası boşa düşer.
    expect(butun.value[0]?.bayt.length).toBeGreaterThan(dilim.value[0]?.bayt.length ?? 0)
  }, 120_000)

  // ⚠ ⚠ **PANORAMA YATAY, PDF DİKEY SAYFALARDAN OLUŞUR.** Aynı belgeyi olduğu gibi
  // yazdırmak TEK uzun sayfa verir; müşteriye gönderilecek dosyada istenen şey slayt
  // başına sayfa. Ölçülen şey SAYFA SAYISI.
  it('DİLİM pdf: slayt başına AYRI SAYFA', async () => {
    const r = await panoramaDisaAktar(BELGE, { tarz: 'dilim', bicim: 'pdf' })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const metin = r.value[0]?.bayt.toString('latin1') ?? ''
    const sayfa = (metin.match(/\/Type\s*\/Page[^s]/g) ?? []).length
    expect(sayfa).toBe(ORNEK_SAHNE.kartlar.length)
  }, 120_000)

  it('BÜTÜN pdf: TEK sayfa — kesintisizliğin kendisi', async () => {
    const r = await panoramaDisaAktar(BELGE, { tarz: 'butun', bicim: 'pdf' })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const metin = r.value[0]?.bayt.toString('latin1') ?? ''
    expect((metin.match(/\/Type\s*\/Page[^s]/g) ?? []).length).toBe(1)
  }, 120_000)

  it('JPEG belirgin biçimde KÜÇÜK — hızlı paylaşım için', async () => {
    const [png, jpg] = await Promise.all([
      panoramaDisaAktar(BELGE, { tarz: 'butun', bicim: 'png' }),
      panoramaDisaAktar(BELGE, { tarz: 'butun', bicim: 'jpg' }),
    ])
    expect(png.ok && jpg.ok).toBe(true)
    if (!png.ok || !jpg.ok) return
    expect(jpg.value[0]?.bayt.length ?? 0).toBeLessThan((png.value[0]?.bayt.length ?? 0) / 2)
  }, 120_000)
})
