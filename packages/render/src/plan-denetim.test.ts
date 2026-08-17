// Plan ↔ çıktı uyumu (§7.1 · FAZ-14.4).

import { describe, expect, it } from 'vitest'
import type { DocumentModel } from '@suite/kernel'
import type { TasarimPlani } from '@suite/contracts'
import { planDenetle, uyumsuzlukOzeti } from './plan-denetim.js'

const plan = (ogeler: readonly string[]): TasarimPlani => ({
  surum: 1,
  konu: 'k',
  aile: { deger: 'temel', gerekce: 'g' },
  yay: ['kanca', 'gerilim', 'kanit', 'donus', 'davet'],
  suslemeYogunlugu: { deger: 0.25, gerekce: 'g' },
  panorama: { deger: false, gerekce: 'g' },
  yuvaBicimi: { deger: 'alan', gerekce: 'g' },
  slaytlar: ogeler.map((o, i) => ({
    index: i,
    islev: (['kanca', 'gerilim', 'kanit', 'donus', 'davet'] as const)[i]!,
    oge: { deger: o as never, gerekce: 'g' },
  })),
})

const belge = (blocks: DocumentModel['blocks']): DocumentModel =>
  ({ kind: 'post', width: 1080, height: 1350, tokenCss: '', blocks }) as DocumentModel

const METIN: DocumentModel['blocks'] = [
  { type: 'heading', level: 1, text: 'Kanca', islev: 'kanca' },
  { type: 'body', text: 'Gerilim', islev: 'gerilim' },
  { type: 'body', text: 'Kanıt', islev: 'kanit' },
  { type: 'body', text: 'Dönüş', islev: 'donus' },
  { type: 'body', text: 'Davet', islev: 'davet' },
]

describe('plan ↔ çıktı uyumu', () => {
  it('uyumlu çıktıda bulgu YOK', () => {
    expect(planDenetle(plan(['yok', 'ikon', 'ikon', 'ikon', 'yok']), belge(METIN))).toEqual([])
  })

  it('plan DİYAGRAM dedi, çıktıda yok → uyumsuz', () => {
    const k = planDenetle(plan(['yok', 'ikon', 'diyagram', 'ikon', 'yok']), belge(METIN))
    expect(k.some((x) => x.alan === 'diyagram sayısı')).toBe(true)
  })

  it('FOTOĞRAF sessizce geri gelirse yakalanıyor', () => {
    // Fotoğraf varsayılan olmaktan çıktı (D-261). Plan yuva açmadıysa belgede görsel
    // BULUNMAMALI; bu denetim o dönüşü yakalayan tek yer.
    const doc = belge([
      ...METIN,
      { type: 'image', src: 'data:image/png;base64,A', alt: 'a', decorative: false },
    ])
    const k = planDenetle(plan(['yok', 'ikon', 'ikon', 'ikon', 'yok']), doc)
    expect(k.some((x) => x.alan === 'görsel yuvası sayısı' && x.bulunan === '1')).toBe(true)
  })

  it('ÜRÜN EKRAN ÇEKİMİ plana tabi DEĞİL — o bir iddiadır', () => {
    const doc = belge([
      ...METIN,
      {
        type: 'image',
        src: 'x.png',
        alt: 'a',
        decorative: false,
        role: 'product_screenshot',
      } as never,
    ])
    expect(planDenetle(plan(['yok', 'ikon', 'ikon', 'ikon', 'yok']), doc)).toEqual([])
  })

  it('DAMGASIZ metin bloğu yakalanıyor', () => {
    // Damgasız blok bütçesini slayt sırasından türetmeye geri döner ve o yol gerçek
    // bir koşuda yanlış ölçtü (FAZ-14.1).
    const doc = belge([...METIN.slice(0, 4), { type: 'body', text: 'Davet' }])
    const k = planDenetle(plan(['yok', 'ikon', 'ikon', 'ikon', 'yok']), doc)
    expect(k.some((x) => x.alan === 'işlev damgası')).toBe(true)
  })

  it('yayın UÇLARI sabit: kanca ilk, davet son', () => {
    const ters = [...METIN].reverse()
    const k = planDenetle(plan(['yok', 'ikon', 'ikon', 'ikon', 'yok']), belge(ters))
    expect(k.some((x) => x.alan === 'yay başı')).toBe(true)
    expect(k.some((x) => x.alan === 'yay sonu')).toBe(true)
  })

  it('İNDEKS eşleştirmesi YAPILMIYOR — sayfalama uyumu bozmuyor', () => {
    // Plan 5 satır, belge aynı 5 bloğu taşıyor ama sayfalayıcı bunları 3 slayda
    // bölebilir. Uyum konumdan bağımsız şeyleri karşılaştırıyor; indeks indekse
    // bakmak bu fazdaki birim uyuşmazlığının beşinci biçimi olurdu.
    const p = plan(['yok', 'ikon', 'diyagram', 'ikon', 'yok'])
    const doc = belge([
      METIN[0]!,
      { type: 'diagram', title: 'A', nodes: [{ label: 'a' }, { label: 'b' }] } as never,
      ...METIN.slice(1),
    ])
    expect(planDenetle(p, doc)).toEqual([])
  })

  it('özet insan okunur', () => {
    const k = planDenetle(plan(['yok', 'ikon', 'diyagram', 'ikon', 'yok']), belge(METIN))
    expect(uyumsuzlukOzeti(k)).toContain('beklenen 1, bulunan 0')
  })
})

describe('açıklanmış eksik', () => {
  // ⚠ Gerçek bir koşuda doğdu: `gorsel-uret` bedava şeritte sağlayıcı bulamadı, hat doğru
  // davranıp DEVAM etti, denetim yuvanın boşluğunu uyuşmazlık saydı ve `kalite` düştü.
  // Sağlayıcı yokluğu bir çalıştırma olgusudur, bir plan hatası değil.
  const planla = (yuva: boolean): TasarimPlani =>
    ({
      slaytlar: [{ oge: { deger: yuva ? 'gorsel-yuvasi' : 'yok', gerekce: 'g' }, islev: 'kanit' }],
      aile: { deger: 'temel', gerekce: 'g' },
    }) as unknown as TasarimPlani

  const belge = (gorselSayisi: number): DocumentModel =>
    ({
      width: 1080,
      height: 1350,
      blocks: Array.from({ length: gorselSayisi }, () => ({
        type: 'image',
        src: 'x',
        alt: 'a',
        yuva: 'alan',
      })),
    }) as unknown as DocumentModel

  it('üretici adım atlandıysa EKSİK yuva uyuşmazlık değil', () => {
    expect(planDenetle(planla(true), belge(0), { gorsel: true })).toEqual([])
  })

  it('atlanmadıysa EKSİK yuva hâlâ uyuşmazlık — garanti gevşemiyor', () => {
    expect(planDenetle(planla(true), belge(0)).some((u) => u.alan === 'görsel yuvası sayısı')).toBe(
      true
    )
  })

  it('FAZLA görsel her koşulda uyuşmazlık — fotoğraf sessizce geri gelemez', () => {
    // ⚠ Tek bir `!==` iki yönü aynı sayıyordu; atlama bahanesi fazlalığı da örterdi.
    expect(
      planDenetle(planla(false), belge(1), { gorsel: true }).some(
        (u) => u.alan === 'görsel yuvası sayısı'
      )
    ).toBe(true)
  })
})
