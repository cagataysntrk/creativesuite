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

  // ⚠ ⚠ **BU TESTİN İDDİASI DEĞİŞTİ ve değişme sebebi bir ÖLÇÜMDÜ (D-318).** Eski hâli
  // "JPEG her zaman çok daha küçük" diyordu; bu, zemini degrade ve gren taşıyan eski
  // tasarımda doğruydu. Palet dizayn sistemine geçince zemin DÜZLEŞTİ ve ölçüm tersine
  // döndü: düz renkli bir kadrajda PNG 148 KB, JPEG 209 KB. Yani tavsiyenin kendisi
  // içeriğe bağlı ve testin bunu söylemesi gerekiyor.
  //
  // Kural: **fotoğraf taşıyan slaytta JPEG küçük, düz tasarımda PNG küçük.** İkisi de
  // ölçülüyor — biri diğerinin yerine geçen bir varsayım olmasın.
  // ⚠ ⚠ **BU TESTİN İDDİASI TERSİNE DÖNDÜ ve sebebi bir TASARIM KARARI (FAZ-19.4).**
  // Eskiden *"DÜZ tasarımda PNG küçük — JPEG düz alanda kazanmıyor"* diyordu ve DOĞRUYDU:
  // panorama düz renk alanlarından oluşuyordu, PNG onları bedavaya sıkıştırıyordu.
  // **Artık düz panorama diye bir şey yok:** gren koşulsuz ve panoramanın tamamına tek
  // katman. Ölçüldü — düz blok medyan σ'sı 2,26–3,85. Yüksek frekanslı doku tam olarak
  // PNG'nin sıkıştıramadığı, JPEG'in ise var olma sebebi olan şeydir.
  // **Test yanlış değildi; ölçtüğü DÜNYA değişti.** R-90 (yayın yalnız JPEG) artık
  // yalnız Graph API kısıtı değil, sıkıştırma gerçeği.
  it('gren sonrası JPEG HER YERDE kazanıyor — düz panorama diye bir şey kalmadı', async () => {
    const [png, jpg] = await Promise.all([
      panoramaDisaAktar(BELGE, { tarz: 'butun', bicim: 'png' }),
      panoramaDisaAktar(BELGE, { tarz: 'butun', bicim: 'jpg' }),
    ])
    expect(png.ok && jpg.ok).toBe(true)
    if (!png.ok || !jpg.ok) return
    expect(jpg.value[0]?.bayt.length ?? 0).toBeLessThan(png.value[0]?.bayt.length ?? 0)
  }, 120_000)

  it('FOTOĞRAF taşıyan slaytta JPEG belirgin biçimde küçük', async () => {
    // ⚠ Sahte bir "fotoğraf": `feTurbulence` ile TAM KADRAJ yüksek frekanslı doku.
    // Gerçek bir fotoğrafın sıkıştırma davranışı budur — bitişik pikseller arasında
    // yüksek frekanslı fark. PNG bunu sıkıştıramaz, JPEG tam da bunun için vardır.
    // ⚠ DETERMİNİST: `feTurbulence`ın tohumu varsayılan 0 ve aynı girdi aynı dokuyu
    // veriyor (R-06); testte rastgelelik yok.
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" width="540" height="675">` +
      `<filter id="d"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4"/></filter>` +
      `<rect width="100%" height="100%" filter="url(#d)"/></svg>`
    const b64 = Buffer.from(svg).toString('base64')
    const fotografli = {
      ...BELGE,
      gorseller: [
        {
          src: `data:image/svg+xml;base64,${b64}`,
          alt: 'ölçüm dokusu',
          x: 0,
          y: 0,
          genislik: 100,
          yukseklik: 100,
          kirpma: 'tam' as const,
        },
      ],
    } as unknown as PanoramaBelgesi
    const [png, jpg] = await Promise.all([
      panoramaDisaAktar(fotografli, { tarz: 'butun', bicim: 'png' }),
      panoramaDisaAktar(fotografli, { tarz: 'butun', bicim: 'jpg' }),
    ])
    expect(png.ok && jpg.ok).toBe(true)
    if (!png.ok || !jpg.ok) return
    expect(jpg.value[0]?.bayt.length ?? 0).toBeLessThan(png.value[0]?.bayt.length ?? 0)
  }, 120_000)
})
