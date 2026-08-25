// RENDER gövdesi `prova` kısıtını GERÇEKTEN okuyor mu (D-347 · FAZ-18.18).
//
// **Bu bir bağlanma testidir, bir birim testi değil.** `duzenProvasi`nin doğru çalıştığı
// `packages/render/src/duzen-provasi.test.ts`te kanıtlı — eksik olan, üretim gövdesinin
// onu ÇAĞIRMASI. Bu depoda aynı sınıf hata on kez tekrarlandı: modül yazılır, testi
// yeşildir, üretim yolunda çağıranı olmaz (D-182 · D-190 · D-224 · D-250 · D-261 · D-270).
// `duzenProvasi`i yazıp orada bırakmak onun on birinci tekrarı olurdu.
//
// ⚠ Testin sayıları ÖLÇÜMDEN: R-89 tavanındaki metinle (başlık 8 + üst etiket 1 +
// gövde 19 = 28) on şablonun sekizi kırılıyor. `sahne`nin ölçülen kapasitesi 12 kelime.
// Kapasite tablosu `docs/kurallar/OLCUMLER.md`'de.

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { describe, expect, it } from 'vitest'
import { systemClock, systemRng } from '@suite/kernel'
import type { BrandId, CorrelationId, EraId, RunId, StepId } from '@suite/contracts'
import { fontCss, ornekBul, type KatalogOrnegi } from '@suite/render'
import { renderBody } from './bodies.js'

const KOK = join(dirname(fileURLToPath(import.meta.url)), '../../../..')
const TOKEN = readFileSync(join(KOK, 'brand/brd_upcytech/derived-tokens/tokens.css'), 'utf8')
const FONT_SONUCU = fontCss(join(KOK, 'brand/brd_upcytech/fonts'))
const FONT = FONT_SONUCU.ok ? FONT_SONUCU.css : ''

const DAMGA = {
  brandId: 'brd_upcytech' as BrandId,
  eraId: 'era_imalat_2026' as EraId,
  kitVersion: 'kit-1',
  definitionDigest: 'sha256:abc',
  contextManifest: 'ctx',
  sourceRunId: 'run_1',
}

const ctx = () => ({
  runId: 'run_test' as RunId,
  stepId: 'duzen-provasi' as StepId,
  brandId: 'brd_upcytech' as BrandId,
  eraId: 'imalat-2026' as EraId,
  correlationId: 'cor_test' as CorrelationId,
  clock: systemClock,
  rng: systemRng,
})

// R-89 tavaninda: baslik 8 + ust etiket 1 + govde 19 = 28 kelime
const BASLIK =
  'Sürdürülebilirlik raporlamasında **ölçülebilir** dönüşüm göstergeleri artık açıkça belgeleniyor'
const ETIKET = 'DEĞERLENDİRME'
const GOVDE =
  'Ölçüm noktaları yerleştirilmeden yapılan iyileştirme iddiaları denetlenebilir olmadığı için ' +
  'raporlamada kabul edilmiyor ve tedarik zincirinde güven kaybına yol açıyor'

const panorama = (yaz?: (k: unknown) => unknown): unknown => {
  // ⚠ ⚠ **`sahne` → `donen`: tuval 1080×1440'a çıkınca (D-348) `sahne` tam bütçeyi
  // TAŞIR oldu.** Bütçe tavanındaki kusur 36 → 24'e indi ve dört şablon kurtuldu; bu
  // testin iddiası yanlış değil, ÖRNEĞİ eskimişti. `donen` seçildi çünkü en ağır vaka
  // orada: `punto-esik-alti` ×3, yani gövde R-83'ün okunabilirlik tabanının ALTINDA.
  const o: KatalogOrnegi | null = ornekBul('donen')
  if (o === null) return null
  return {
    ...o,
    tokenCss: TOKEN,
    fontCss: FONT,
    stamp: DAMGA,
    ...(yaz === undefined ? {} : { kartlar: o.kartlar.map(yaz) }),
  }
}

const kos = async (p: unknown) => {
  const outDir = mkdtempSync(join(tmpdir(), 'prova-'))
  return renderBody({ outDir, layout: 'statement' }).run(ctx(), {
    constraints: { prova: true },
    inputs: { kompozit: { panorama: p } },
  })
}

describe('RENDER gövdesi · düzen provası (bağlanma)', () => {
  it('örnek metinle GEÇİYOR ve defter için `provaGecti` basıyor', async () => {
    const p = panorama()
    expect(p, 'donen örneği yok').not.toBeNull()
    if (p === null) return
    const r = await kos(p)
    // ⚠ ⚠ **ALET KENDİ HATA MESAJINDA ÇÖKÜYORDU.** Düz `JSON.stringify` hata
    // nesnesindeki `BigInt`e çarpıp *"Do not know how to serialize a BigInt"*
    // fırlatıyor ve GERÇEK kusuru gizliyordu: kırmızı bir test, sebebini
    // söyleyemiyorsa yarısı kadar işe yarar.
    const anlat = (d: unknown): string =>
      JSON.stringify(d, (_k, v) => (typeof v === 'bigint' ? `${String(v)}n` : v)) ?? ''
    expect(r.ok, r.ok ? '' : anlat(r.error)).toBe(true)
    if (!r.ok) return
    expect((r.value.data as Record<string, unknown>)['provaGecti']).toBe(true)
  }, 60_000)

  // ⚠ ⚠ **KASTEN İHLAL — yeşil bir test bir şey kanıtlamaz.** Aşağıdaki metin R-89'u
  // İHLAL ETMİYOR: başlık 8, üst etiket 1, gövde 19 — tam 28. Yani `uyarla` onu
  // geçirirdi ve eski hatta dört görsel üretilirdi. Prova durduruyor.
  it('bütçenin İZİN VERDİĞİ metinde LAYOUT_REJECTED ile DURUYOR', async () => {
    const p = panorama((k) => ({
      ...(k as Record<string, unknown>),
      ustBaslik: ETIKET,
      baslik: BASLIK,
      govde: GOVDE,
    }))
    expect(p, 'donen örneği yok').not.toBeNull()
    if (p === null) return
    const r = await kos(p)
    expect(r.ok, 'prova bütçe tavanındaki metni geçirdi').toBe(false)
    if (r.ok) return
    // ⚠ ⚠ `JSON.stringify` DENENDİ ve patladı: hata nesnesi BigInt taşıyor (zaman damgası).
    // Serileştirmeye dayanan bir iddia, ölçtüğü şeyi değil serileştiriciyi sınar.
    const h = r.error as { readonly code?: unknown; readonly details?: Record<string, unknown> }
    expect(h.code, 'hata kodu').toBe('LAYOUT_REJECTED')
    // ⚠ Kusurlar ADIYLA taşınıyor: "sığmadı" tek başına düzeltilemez bir geri bildirimdir.
    const kusurlar = h.details?.['kusurlar']
    expect(Array.isArray(kusurlar), 'kusur listesi hata yükünde').toBe(true)
    expect((kusurlar as readonly { tur?: string }[])[0]?.tur, 'ilk kusurun adı').toBeTruthy()
  }, 60_000)

  // ⚠ Kısıt OKUNMAZSA bu test yeşil kalırdı: `prova` yokken gövde normal render'a düşer
  // ve dosya yazar. Kısıtın gerçekten dallandığını görmenin yolu, dallanmadığı hâli
  // ayrıca sınamaktır.
  it('`prova` kısıtı YOKKEN prova dalına girmiyor', async () => {
    const p = panorama()
    expect(p, 'donen örneği yok').not.toBeNull()
    if (p === null) return
    const outDir = mkdtempSync(join(tmpdir(), 'prova-yok-'))
    const r = await renderBody({ outDir, layout: 'statement' }).run(ctx(), {
      constraints: {},
      inputs: { kompozit: { panorama: p } },
    })
    if (!r.ok) return
    expect((r.value.data as Record<string, unknown>)['provaGecti']).toBeUndefined()
  }, 120_000)
})
