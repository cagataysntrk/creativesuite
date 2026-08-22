// Düzeltme turunun ÇIKTISI zincire giriyor mu (§7.1 · D-268).
//
// ⚠ ⚠ **DÜZELTME ÜRETİLİYOR AMA KİMSE OKUMUYORDU.** Gerçek koşu: `sus-metni-kesiyor`
// iki kartta ölçüldü, `duzelt` adımı gövdeleri kısaltan geçerli bir uyarlama döndürdü,
// `render-son` AYNI kusurları AYNI yüzdeyle (%14,7 · %4,3) tekrar ölçtü. Yani düzeltme
// hiç uygulanmadı ve bir model çağrısı boşa gitti.
//
// Sebep: `uyarlamayaCevir` yalnız `sablon_uyarla` dalında çağrılıyordu. `duzelt` adımı
// `sablon_duzelt` taşıyor; çıktısı `{lines}` olarak kalıyor, `composeBody` `{uyarlama}`
// arıyor ve bulamayınca ÖNCEKİ uyarlamayla devam ediyordu.
//
// ⚠ Bugüne kadar görünmemesinin sebebi düzeltme turunun neredeyse hiç koşmamasıydı:
// ölçülen kusurlar `matlama-tutmuyor` gibi metinle düzelmeyen türlerdi ve
// `duzeltilebilir` onları eliyordu. Metinle düzelen ilk kusur türü eklenince kopukluk
// aynı gün ortaya çıktı — **kullanılmayan bir yol, bozuk olduğunu göstermez.**

import { describe, expect, it } from 'vitest'
import { ZERO_USD, ok, type CorrelationId, type RunId, type StepId } from '@suite/contracts'
import { fixedClock, seededRng } from '@suite/kernel'
import type { JobHandle, JobStatus, ProviderAdapter } from '@suite/providers'
import { elleGorselAdi, generateBody } from './verbs/bodies.js'

const UYARLAMA = {
  sablonId: 'sahne',
  kartlar: [
    {
      ustBaslik: 'GÖZLEM',
      baslik: 'Herkes **Farklı** Söylüyor',
      govde: 'Vardiya sonunda herkes kendi izlenimini anlatıyor.',
      hayalet: 'İzlenim',
      rayaSol: 'GÖZLEM',
      rayaOrta: 'Ortak cevap yok',
    },
  ],
}

/** Modelin cevabı: kod çiti içinde JSON — gerçek koşuda tam olarak böyle geliyor. */
const CEVAP = `\`\`\`json\n${JSON.stringify(UYARLAMA)}\n\`\`\``

const adapter: ProviderAdapter = {
  id: 'p_sahte',
  title: 'Sahte',
  islerKalici: false,
  capabilities: () => [{ name: 'text.generate', lanes: ['free'], supports: {} }],
  validate: (input) => ok({ ...input, _validated: true }),
  estimate: () => ({ low: ZERO_USD, high: ZERO_USD }),
  available: () => true,
  start: async () =>
    ok({
      providerId: 'p_sahte',
      externalId: 'ext_1',
      idempotencyKey: 'idem_1',
    } satisfies JobHandle),
  status: async () => ok({ state: 'succeeded', output: { result: CEVAP } } as JobStatus),
  cancel: async () => undefined,
  actualCost: async () => ZERO_USD,
}

const CTX = {
  runId: 'run_t' as RunId,
  stepId: 'duzelt' as StepId,
  brandId: 'brd_t',
  eraId: 'era_t',
  correlationId: 'cor_t' as CorrelationId,
  clock: fixedClock('2026-08-19T00:00:00.000Z'),
  rng: seededRng(1),
}

/** Düzeltme turunun GERÇEK girdileri: ölçülmüş kusur + önceki uyarlama. */
const GIRDILER = {
  render: {
    kusurlar: [
      // ⚠ Fikstür METİNLE DÜZELEN bir kusur taşıyor (`tasma`): `sus-metni-kesiyor`
      // ölçüldü ve metinle düzelmiyor — gövde kutusunun YERİ ızgaradan geliyor
      // (borç D23), o yüzden düzeltme turuna artık girmiyor.
      { tur: 'tasma', kart: 2, alan: 'govde', aciklama: '.govde yatayda 28 px taşıyor' },
    ],
  },
  'sablon-uyarla': {
    uyarlama: {
      ...UYARLAMA,
      kartlar: [{ ...UYARLAMA.kartlar[0], govde: 'Uzun ve kısaltılması gereken bir gövde.' }],
    },
  },
}

const kos = async (constraints: Record<string, unknown>): Promise<Record<string, unknown>> => {
  const v = generateBody({
    resolveAdapter: () => adapter,
    env: {},
    capability: 'text.generate',
    sleep: async () => undefined,
  })
  const r = await v.run(
    CTX as never,
    {
      capability: 'text.generate',
      providerId: 'p_sahte',
      constraints,
      inputs: GIRDILER,
      signal: new AbortController().signal,
    } as never
  )
  expect(r.ok).toBe(true)
  return (r.ok ? r.value.data : {}) as Record<string, unknown>
}

describe('düzeltme turu çıktısı', () => {
  it('`sablon_duzelt` çıktısı UYARLAMAYA çevriliyor — zincire giriyor', async () => {
    const d = await kos({ sablon_duzelt: true })
    const u = d['uyarlama'] as { kartlar?: { govde?: string }[] } | undefined
    expect(u?.kartlar?.[0]?.govde).toBe('Vardiya sonunda herkes kendi izlenimini anlatıyor.')
  })

  // ⚠ Bayrak YOKSA çeviri de YOK: metin adımlarının çıktısı bir uyarlama değildir ve
  // her çıktıyı uyarlamaya çevirmeye çalışmak, metin adımını hataya düşürürdü.
  it('bayrak yoksa uyarlama ÜRETİLMİYOR', async () => {
    const d = await kos({})
    expect(d['uyarlama']).toBeUndefined()
  })
})

// ── elle yüklenen görsel ÜRETİMİN YERİNE geçiyor (FAZ-17.3) ────────────────
//
// ⚠ ⚠ **ÜRÜN TANITIMINDA MODEL GÖRSELİ YANLIŞ CEVAPTIR.** Gerçek ürünün fotoğrafı
// varken onu üretmeye çalışmak hem para harcar hem yanlış ürünü çizer. Depo sahibi:
// *"panelden yüklenen görsel üretime dahil edilmeli"*.
describe('elle yüklenen görsel adı', () => {
  it('yuvaya özel ad okunuyor', () => {
    expect(elleGorselAdi({ elle_gorsel_2: 'elle-gorsel-02.png' }, 2)).toBe('elle-gorsel-02.png')
  })

  it('tek dosya yalnız BİRİNCİ yuvaya geçiyor', () => {
    expect(elleGorselAdi({ elle_gorsel: 'a.png' }, 1)).toBe('a.png')
    // ⚠ İkinci yuvaya da geçseydi, tek fotoğraf dört slaytta tekrarlanırdı — bu
    // deponun "aynı figür yan yana" kusuru.
    expect(elleGorselAdi({ elle_gorsel: 'a.png' }, 2)).toBeNull()
  })

  it('YOL AYRACI taşıyan ad REDDEDİLİYOR — çalıştırma dizininin dışına çıkılmaz', () => {
    expect(elleGorselAdi({ elle_gorsel: '../../etc/passwd' }, 1)).toBeNull()
    expect(elleGorselAdi({ elle_gorsel: 'alt/dizin.png' }, 1)).toBeNull()
    expect(elleGorselAdi({ elle_gorsel: '..' }, 1)).toBeNull()
  })

  it('parametre yoksa `null` — varsayılan davranış ÜRETİM', () => {
    expect(elleGorselAdi({}, 1)).toBeNull()
  })
})

// ── ifşa KOŞULLU: görselin KAYNAĞI (§11.3 · Md. 50) ────────────────────────
//
// ⚠ ⚠ Elle yüklenen ürün fotoğraflarıyla kurulmuş bir karosel yapay zekâ ürünü
// DEĞİLDİR; ona "yapay zekâ görseli" yazmak doğru olmayan bir beyandır. Ama biri bile
// model üretimiyse ifşa GEREKİR — karışık bir kreatifte "biraz yapay" yoktur.
describe('yüklenen görselin uyum sonucu', () => {
  it('çıktı `yapayZeka: false` TAŞIYOR — ifşa kararı buradan doğuyor', async () => {
    const { mkdtempSync, writeFileSync } = await import('node:fs')
    const { tmpdir } = await import('node:os')
    const { join } = await import('node:path')
    const d = mkdtempSync(join(tmpdir(), 'elle-gorsel-'))
    // Gerçek PNG imzası: gövde önemli değil, KAYNAK önemli.
    writeFileSync(join(d, 'elle-gorsel-01.png'), Buffer.from('89504e470d0a1a0a', 'hex'))

    const v = generateBody({
      resolveAdapter: () => adapter,
      env: {},
      capability: 'image.generate',
      runDir: d,
    })
    const r = await v.run(
      CTX as never,
      {
        capability: 'image.generate',
        providerId: 'p_sahte',
        constraints: { gorsel_sira: 1 },
        inputs: {},
        signal: new AbortController().signal,
      } as never
    )
    expect(r.ok).toBe(true)
    const data = (r.ok ? r.value.data : {}) as Record<string, unknown>
    expect(data['yapayZeka']).toBe(false)
    expect(data['elleYuklendi']).toBe(true)
    // ⚠ Sağlayıcıya HİÇ gidilmedi: maliyet listesi boş.
    expect((r.ok ? r.value.costs : ['x']).length).toBe(0)
  })
})
