import { describe, expect, it } from 'vitest'
import {
  PUAN_TAVANI,
  TASARIM_KATEGORILERI,
  tasarimYargiPromptu,
  tasarimYargisinaCevir,
  toplamPuan,
} from './tasarim-yargi.js'
import { promptTuret } from './verbs/bodies.js'

const BOYUT = { genislik: 1080, yukseklik: 1350 }
const tamPuanlar = (p = 4): unknown[] =>
  TASARIM_KATEGORILERI.map((kategori) => ({ kategori, puan: p, gerekce: 'gözlem' }))

const cevir = (o: unknown): ReturnType<typeof tasarimYargisinaCevir> =>
  tasarimYargisinaCevir({ result: JSON.stringify(o) }, 1, BOYUT)

describe('tasarimYargisinaCevir', () => {
  it('altı kategori puanlanınca toplam hesaplanır', () => {
    const y = cevir({ puanlar: tamPuanlar(4) })
    expect(y.puanlar.length).toBe(6)
    expect(y.reddedilen).toEqual([])
    expect(toplamPuan(y)).toBe(4)
  })

  it('EKSİK kategori sessizce 0 sayılmıyor, sessizce atlanmıyor da', () => {
    // ⚠ Sıfır saymak ölçülmemişi kötü ilan ederdi; atlamak ortalamayı ölçülenler
    // üstünden alıp eksikliği gizlerdi. İkisi de yalan.
    const y = cevir({ puanlar: tamPuanlar(4).slice(0, 5) })
    expect(y.puanlar.length).toBe(5)
    expect(y.reddedilen.some((r) => r.startsWith('kategori puanlanmadı'))).toBe(true)
    // ⚠ Eksik ölçümde toplam YOK: beş kategoriden ortalama, altıdan ortalamayla
    // karşılaştırılamaz ve FAZ-13.6 kör kabulü tam bunu yapacak.
    expect(toplamPuan(y)).toBeNull()
  })

  it('ondalık puan reddediliyor — olmayan hassasiyet iddia edilemez', () => {
    const y = cevir({ puanlar: [{ kategori: 'denge', puan: 3.7, gerekce: 'x' }] })
    expect(y.puanlar.length).toBe(0)
    expect(y.reddedilen[0]).toContain('tam sayı değil')
  })

  it('gerekçesiz puan reddediliyor', () => {
    const y = cevir({ puanlar: [{ kategori: 'denge', puan: 3, gerekce: '  ' }] })
    expect(y.reddedilen.some((r) => r.includes('gerekçe boş'))).toBe(true)
  })

  it('tekrar eden kategori reddediliyor — ortalamayı bir alan iki kez çekemez', () => {
    const y = cevir({
      puanlar: [...tamPuanlar(4), { kategori: 'denge', puan: 5, gerekce: 'yine' }],
    })
    expect(y.puanlar.length).toBe(6)
    expect(y.reddedilen.some((r) => r.includes('tekrar etti'))).toBe(true)
  })

  it('kutusuz bulgu reddediliyor — doğrulayıcı PAYLAŞILAN (R-05)', () => {
    const y = cevir({
      puanlar: tamPuanlar(2),
      bulgular: [{ kategori: 'denge', siddet: 'kritik', aciklama: 'dengesiz' }],
    })
    expect(y.bulgular.length).toBe(0)
    expect(y.reddedilen.some((r) => r.includes('sınırlayıcı kutu'))).toBe(true)
  })

  it('tuval dışı kutu reddediliyor', () => {
    const y = cevir({
      puanlar: tamPuanlar(2),
      bulgular: [{ bolge: [900, 0, 500, 100], kategori: 'denge', siddet: 'uyari', aciklama: 'x' }],
    })
    expect(y.reddedilen.some((r) => r.includes('tuval dışına'))).toBe(true)
  })

  it('kusur kategorileri BURADA geçerli değil — iki eksen karışmıyor', () => {
    // `kirpma` `image.critique`in kategorisi; estetik yargıya sızarsa iki rapor aynı
    // şeyi iki kez söyler ve çeliştiklerinde hangisinin doğru olduğu belirsizleşir.
    const y = cevir({ puanlar: [{ kategori: 'kirpma', puan: 3, gerekce: 'x' }] })
    expect(y.reddedilen.some((r) => r.includes('kapalı listede yok'))).toBe(true)
  })

  it('bozuk çıktı boş yargı verir, çökmez', () => {
    expect(tasarimYargisinaCevir({ result: 'merhaba' }, 1, BOYUT).reddedilen.length).toBe(1)
    expect(tasarimYargisinaCevir(null, 1, BOYUT).reddedilen[0]).toContain('metin alanı yok')
  })
})

describe('prompt', () => {
  it('KUSUR aramayı açıkça yasaklıyor ve altı kategoriyi sayıyor', () => {
    const p = tasarimYargiPromptu({
      yol: '/x/s1.png',
      slayt: 1,
      toplam: 5,
      genislik: 1080,
      yukseklik: 1350,
    })
    expect(p).toContain('KUSUR ARAMA')
    for (const k of TASARIM_KATEGORILERI) expect(p).toContain(k)
    expect(p).toContain(`0–${PUAN_TAVANI}`)
  })

  it('ÜRETİM YOLU bağlı: `design.critique` slayt yollarını görüyor', () => {
    // ⚠ Bu deponun en sık hatası: modül var, test yeşil, üretim yolu sıfır (D-261).
    const p = promptTuret('design.critique', {
      constraints: {},
      inputs: { render: { slides: ['/tmp/s1.png', '/tmp/s2.png'], width: 1080, height: 1350 } },
      needs: ['render'],
    } as never)
    expect(p).toContain('/tmp/s1.png')
    expect(p).toContain('2 slaytlık')
  })

  it('slayt yoksa prompt BOŞ — sessizce yanlış bir şey yargılanmıyor', () => {
    expect(promptTuret('design.critique', { constraints: {}, inputs: {} } as never)).toBe('')
  })
})
