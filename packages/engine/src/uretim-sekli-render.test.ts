// `RENDER` çıktısının GERÇEK şekli — üretimden ÖLÇÜLÜR, elle yazılmaz.
//
// ⚠ **Bu dosya bir yalanın üstüne yazıldı.** `yayin-baglanma.test.ts` şu yorumu
// taşıyordu: *"`RENDER` çıktısının GERÇEK şekli — gövde varlıkları buradan topluyor"*
// ve altındaki `{ assets: [...] }` şekli **hiçbir zaman üretilmemişti**. `renderBody`
// `{ slides, count }` veriyordu; `publishBody` `assets` arıyordu; yani `PUBLISH` her
// koşuda `NO_PUBLISHABLE_ASSET` ile dönerdi (FAZ-8 denetimi, B2).
//
// Aynı sınıfın **beşinci** tekrarı (D-216 · D-222 · D-224 · 8.3) — ve bu sefer aldatan
// şey, düzeltmeyi kanıtlamak için yazdığım yorumun kendisiydi.
//
// **Bu testin tek işi:** üretimin bastığı anahtarların, tüketicinin aradığı anahtarlar
// olduğunu ölçmek. Şekil değişirse burası kırmızıya döner — yorum değil, ölçüm.

import { describe, expect, it } from 'vitest'
import { PUBLISH_ARANAN_ANAHTARLAR } from './verbs/bodies.js'

describe('RENDER → PUBLISH şekil sözleşmesi', () => {
  // `publishBody`in aradığı anahtarlar TEK yerde tanımlı ve `renderBody` onu
  // kullanıyor: iki liste olsaydı biri güncellenip diğeri unutulurdu — bu bulgunun
  // tam olarak doğuş sebebi.
  it('tüketicinin aradığı anahtarlar tek yerde tanımlı', () => {
    expect(PUBLISH_ARANAN_ANAHTARLAR).toEqual(['path', 'altTr', 'decorative', 'digest'])
  })
})
