import { describe, expect, it } from 'vitest'
import {
  BOS_TAKVIM_GUN,
  haftalikOneriler,
  ONERI_TAVANI,
  oneriMesaji,
  type OneriGirdisi,
} from './oneri.js'

const BUGUN = '2026-08-16T10:00:00.000Z'
const temel = (o: Partial<OneriGirdisi> = {}): OneriGirdisi => ({
  yayinlar: [{ publishedAt: '2026-08-15T09:00:00.000Z' }],
  kazananlar: [],
  bugun: BUGUN,
  hat: 'instagram-post',
  ...o,
})

describe('haftalık öneriler', () => {
  it('taze takvimde öneri YOK — sessizlik de bir cevaptır', () => {
    expect(haftalikOneriler(temel()).oneriler).toEqual([])
  })

  it('bir haftadır yayın yoksa öneri doğuyor ve KANITI taşıyor', () => {
    const r = haftalikOneriler(temel({ yayinlar: [{ publishedAt: '2026-08-01T09:00:00.000Z' }] }))
    expect(r.oneriler).toHaveLength(1)
    expect(r.oneriler[0]!.kanit.kind).toBe('bos_takvim')
    expect(r.oneriler[0]!.neden).toContain('15 gün')
  })

  // **"Hiç yayın yok" ile "uzun süredir yayın yok" AYNI ŞEY DEĞİL.** İlkinde ölçüm
  // penceresi de hiç açılmamış demektir ve insight geriye dönük alınamaz (D-220).
  it('hiç yayın yoksa ayrı bir kanıt türü — en yüksek ağırlık', () => {
    const r = haftalikOneriler(temel({ yayinlar: [] }))
    expect(r.oneriler[0]!.kanit.kind).toBe('hic_yayin_yok')
    expect(r.oneriler[0]!.neden).toContain('geriye dönük')
  })

  // **Defter okunamadıysa öneri üretmek, bilinmeyene tavsiye vermektir.**
  it('defter okunamıyorsa öneri ÜRETİLMİYOR ve sebebi söyleniyor', () => {
    const r = haftalikOneriler(temel({ yayinlar: null }))
    expect(r.oneriler).toEqual([])
    expect(r.olculemeyen).toContain('bilinmeyene tavsiye')
  })

  it('tekrar kullanılmış kazanan önerilmiyor', () => {
    const r = haftalikOneriler(
      temel({
        kazananlar: [
          { externalId: 'a', deger: 900, metrik: 'reach', tekrarKullanildi: true },
          { externalId: 'b', deger: 400, metrik: 'reach', tekrarKullanildi: false },
        ],
      })
    )
    expect(r.oneriler).toHaveLength(1)
    expect(r.oneriler[0]!.neden).toContain('b')
  })

  // 🧪 **Gürültü freni.** Üçten fazlası liste olur ve liste okunmaz; düşenler
  // SESSİZCE kırpılmıyor — kapsam beyanı ayrı bir sayı.
  it('tavan aşılırsa en zayıflar düşüyor ve düşen sayısı BİLDİRİLİYOR', () => {
    const r = haftalikOneriler(
      temel({
        yayinlar: [{ publishedAt: '2026-08-01T09:00:00.000Z' }],
        kazananlar: [10, 20, 30, 40].map((d) => ({
          externalId: `id${d}`,
          deger: d,
          metrik: 'reach',
          tekrarKullanildi: false,
        })),
      })
    )
    expect(r.oneriler).toHaveLength(ONERI_TAVANI)
    expect(r.dusenSayisi).toBe(2)
    // En güçlü kanıt önce: 15 günlük boşluk (ağırlık 15) ve en yüksek ölçümler.
    expect(r.oneriler.map((o) => o.agirlik)).toEqual([40, 30, 20])
  })

  it('eşik altı sessizlik öneri doğurmuyor', () => {
    const gun = BOS_TAKVIM_GUN - 1
    const son = new Date(Date.parse(BUGUN) - gun * 86_400_000).toISOString()
    expect(haftalikOneriler(temel({ yayinlar: [{ publishedAt: son }] })).oneriler).toEqual([])
  })

  // 🧪 FAZ-8.5 ihlal testi: öneri ÇALIŞTIRILABİLİR bir şey taşımıyor. Tipte ne
  // fonksiyon var ne handle — "öneriyi çalıştır" çağrısı YAZILAMAZ (R-14).
  it('öneri çalıştırılabilir bir şey TAŞIMIYOR — yalnız veri', () => {
    const o = haftalikOneriler(temel({ yayinlar: [] })).oneriler[0]!
    for (const v of Object.values(o)) expect(typeof v).not.toBe('function')
    expect(Object.keys(o).sort()).toEqual(['agirlik', 'kanit', 'neden', 'pipeline'])
  })

  it('kanıt mesajları üç türü de ayırt ediyor', () => {
    expect(oneriMesaji({ kind: 'hic_yayin_yok' })).toContain('hiç yayın')
    expect(oneriMesaji({ kind: 'bos_takvim', gecenGun: 9, sonYayin: '2026-08-07' })).toContain('9')
  })
})
