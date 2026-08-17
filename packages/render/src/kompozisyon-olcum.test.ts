import { describe, expect, it } from 'vitest'
import type { DocumentModel, SlaytKimligi } from '@suite/kernel'
import {
  alanKutlesi,
  bileske,
  BOSLUK_OLCEGI,
  kompozisyonMerkezi,
  metinKutlesi,
  olcekDisiBosluklar,
  OPTIK_MERKEZ,
  rakamKutlesi,
  yolSapmasi,
} from './kompozisyon-olcum.js'
import { egriSagda } from './sablon.js'
import { tasarimOlc } from './tasarim-olcum.js'

const k = (index: number, role: SlaytKimligi['role'] = 'govde'): SlaytKimligi => ({
  role,
  index,
  total: 5,
  duzen: 'list',
})

const belge = (index: number, metin = 'Kanit satiri burada duruyor'): DocumentModel =>
  ({
    width: 1080,
    height: 1350,
    tokenCss: ':root{--role-bg:#e8a92a;--role-surface:#f5f3ee;--role-line-edge:#1b1b1b}',
    slayt: k(index),
    blocks: [{ type: 'body', text: metin }],
  }) as unknown as DocumentModel

describe('kütle', () => {
  it('dolgu kütlesi eğrinin DOLU tarafında', () => {
    for (let i = 0; i < 5; i += 1) {
      const m = alanKutlesi(k(i))
      expect(m.agirlik).toBeGreaterThan(0)
      expect(m.x > 50).toBe(egriSagda(k(i)))
    }
  })

  it('boş metin kütle taşımaz — alan değil DOLULUK ağırlık veriyor', () => {
    expect(metinKutlesi(belge(1, '')).agirlik).toBe(0)
  })

  it('tek slaytta hayalet rakam yok, kütlesi de yok', () => {
    expect(rakamKutlesi({ role: 'tek', index: 0, total: 1, duzen: 'list' }).agirlik).toBe(0)
  })

  it('bileşke ağırlıksız kütlelerde tuval merkezine düşer', () => {
    expect(bileske([{ x: 10, y: 10, agirlik: 0 }])).toEqual({ x: 50, y: 50 })
  })
})

describe('yolSapmasi', () => {
  it('gramerin dönüşümlü ritmi SAPMA değildir', () => {
    // ⚠ İlk sürüm zikzak sayıyordu ve beş slaytta 3/3 dönüş buluyordu — dolgu tarafı her
    // slaytta yer değiştirdiği için. Ölçüm aracı tasarımla çatışıyordu.
    const merkezler = [0, 1, 2, 3, 4].map((i) => ({ k: k(i), ...kompozisyonMerkezi(belge(i)) }))
    expect(yolSapmasi(merkezler)).toBe(0)
  })

  it('kütle yanlış tarafa kayarsa sayı artar', () => {
    expect(yolSapmasi([{ k: k(0), x: 20 }])).toBe(1)
    expect(yolSapmasi([{ k: k(1), x: 80 }])).toBe(1)
  })
})

describe('boşluk ölçeği', () => {
  it('ölçek Fibonacci ve kapalı', () => {
    expect(BOSLUK_OLCEGI).toEqual([8, 13, 21, 34, 55, 89])
  })

  it('bugünkü kenar payı ölçeğe OTURMUYOR ve ölçüm bunu görüyor', () => {
    // 88 ≈ 89: bir piksellik sapma. Düzeltmek bütün golden'ları yenilerdi — kayıtlı borç.
    expect(olcekDisiBosluklar([88, 55])).toEqual([88])
  })
})

describe('rapor, kapı değil', () => {
  it('dengesiz kompozisyon UYARI üretir ama okuma sınır dışına ÇIKMAZ', () => {
    const rapor = tasarimOlc({ slaytlar: [0, 1, 2, 3, 4].map((i) => belge(i)) })
    const optik = rapor.readings.filter((r) => r.metric === 'optical_offset')
    expect(optik.length).toBe(5)
    // ⚠ Estetiği zorunlu kılmak "kabul edilemez" ile "tercih edilmeyen"i karıştırmaktır.
    for (const r of optik) expect(r.status).not.toBe('out')
    // Ve ölçüm gerçekten bir şey söylüyor: bu gramer optik merkezin ALTINDA duruyor.
    expect(optik.some((r) => r.status === 'warn')).toBe(true)
    expect(OPTIK_MERKEZ).toBeLessThan(0.5)
  })
})
