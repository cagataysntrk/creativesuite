// ÜÇ KATMAN AYRI: uyum HATA, metrik RET, estetik ÖNERİ (§7.1 · FAZ-14.4).
//
// ⚠ Ayrımın yeri hata TAKSONOMİSİ. Aynı kovaya konsalardı bir render hatası "tolerans
// dışı" diye görülür ve içerik suçlanırdı — FAZ-10'da ölçenin hatası tam olarak böyle
// ölçülenin hatası sanılmıştı.
//
// ⚠ Bu dosya `validateBody`yi ÇAĞIRIYOR, `planDenetle`yi değil: modülü test edip
// zinciri test etmemek bu fazda dört kez tekrarladı (D-261).

import { describe, expect, it } from 'vitest'
import type { BrandId, EraId, RunId, StepId } from '@suite/contracts'
import { fixedClock, seededRng } from '@suite/kernel'
import type { TasarimPlani } from '@suite/contracts'
import { validateBody } from './verbs/bodies.js'

const ctx = {
  runId: 'run_t' as RunId,
  stepId: 'kalite' as StepId,
  brandId: 'brd_t' as BrandId,
  eraId: 'era_t' as EraId,
  correlationId: 'cor_t' as never,
  clock: fixedClock('2026-08-17T00:00:00.000Z'),
  rng: seededRng(1),
}

const PLAN = (diyagram: number): TasarimPlani => ({
  surum: 1,
  konu: 'k',
  aile: { deger: 'temel', gerekce: 'g' },
  yay: ['kanca', 'gerilim', 'kanit', 'donus', 'davet'],
  suslemeYogunlugu: { deger: 0.25, gerekce: 'g' },
  panorama: { deger: false, gerekce: 'g' },
  yuvaBicimi: { deger: 'alan', gerekce: 'g' },
  slaytlar: (['kanca', 'gerilim', 'kanit', 'donus', 'davet'] as const).map((islev, i) => ({
    index: i,
    islev,
    oge: { deger: (i === 2 && diyagram > 0 ? 'diyagram' : 'yok') as never, gerekce: 'g' },
  })),
})

const BELGE = {
  kind: 'post',
  width: 1080,
  height: 1350,
  tokenCss: '',
  blocks: [
    { type: 'heading', level: 1, text: 'Kanca', islev: 'kanca' },
    { type: 'body', text: 'Gerilim', islev: 'gerilim' },
    { type: 'body', text: 'Kanıt', islev: 'kanit' },
    { type: 'body', text: 'Dönüş', islev: 'donus' },
    { type: 'body', text: 'Davet', islev: 'davet' },
  ],
}

const kos = async (plan: TasarimPlani, blocked: boolean) => {
  const body = validateBody({
    lint: () => [],
    check: async () => ({ blocked, report: 'rapor' }),
  } as never)
  return body.run(
    ctx as never,
    {
      constraints: {},
      inputs: {
        'yuva-doldur': { document: BELGE, tasarimPlani: plan },
        render: { slides: ['a.png'] },
      },
    } as never
  )
}

describe('üç katman ayrı kalıyor', () => {
  it('UYUMSUZLUK bir HATADIR — `internal` / PLAN_MISMATCH', async () => {
    // Plan bir diyagram söz verdi, belgede yok: render planı uygulamadı, yani KOD bozuk.
    const r = await kos(PLAN(1), false)
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.error.code).toBe('PLAN_MISMATCH')
    expect(r.error.kind).toBe('internal')
  })

  it('METRİK ihlali bir RETTİR — `policy_blocked`, uyum yeşilken bile', async () => {
    const r = await kos(PLAN(0), true)
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.error.code).toBe('QA_OUT_OF_TOLERANCE')
    expect(r.error.kind).toBe('policy_blocked')
  })

  it('UYUMSUZLUK metrikten ÖNCE — kod hatası içerik hatası gibi görünmüyor', async () => {
    // İkisi de bozukken uyum kazanmalı: yoksa bir render hatası "tolerans dışı" diye
    // raporlanır ve içerik suçlanırdı.
    const r = await kos(PLAN(1), true)
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.error.code).toBe('PLAN_MISMATCH')
  })

  it('uyumluysa denetim GEÇİYOR', async () => {
    const r = await kos(PLAN(0), false)
    expect(r.ok).toBe(true)
  })

  it('PLAN YOKSA denetim atlanıyor — eski belgeler ve PDF yolu bozulmuyor', async () => {
    const body = validateBody({
      lint: () => [],
      check: async () => ({ blocked: false, report: 'r' }),
    } as never)
    const r = await body.run(
      ctx as never,
      { constraints: {}, inputs: { k: { document: BELGE }, render: { slides: ['a'] } } } as never
    )
    expect(r.ok).toBe(true)
  })

  it('EN SON belge denetleniyor — ilki değil (bağımsız doğrulama bulgusu)', async () => {
    // ⚠ `inputs` bütün üst akış çıktılarını taşır ve topolojik sırada dolar. `.find()`
    // ilk eşleşeni alıyordu: `kompozit`in belgesini, `render`ın tükettiği
    // `yuva-doldur` belgesini değil. Yuva dolduğunda plan 1 görsel bekler, denetlenen
    // belgede 0 vardır → yanlış `PLAN_MISMATCH`.
    const gorselli = {
      ...BELGE,
      blocks: [
        ...BELGE.blocks,
        { type: 'image', src: 'x', alt: 'a', decorative: false, yuva: 'alan' },
      ],
    }
    const planYuvali: TasarimPlani = {
      ...PLAN(0),
      slaytlar: PLAN(0).slaytlar.map((s, i) =>
        i === 2 ? { ...s, oge: { deger: 'gorsel-yuvasi' as const, gerekce: 'g' } } : s
      ),
    }
    const body = validateBody({
      lint: () => [],
      check: async () => ({ blocked: false, report: 'r' }),
    } as never)
    const r = await body.run(
      ctx as never,
      {
        constraints: {},
        inputs: {
          // Sıra ÖNEMLİ: kompozit önce (görselsiz), yuva-doldur sonra (görselli).
          kompozit: { document: BELGE, tasarimPlani: planYuvali },
          'yuva-doldur': { document: gorselli, tasarimPlani: planYuvali },
          render: { slides: ['a.png'] },
        },
      } as never
    )
    // İlk belge alınsaydı "görsel yuvası sayısı: beklenen 1, bulunan 0" ile düşerdi.
    expect(r.ok).toBe(true)
  })
})
