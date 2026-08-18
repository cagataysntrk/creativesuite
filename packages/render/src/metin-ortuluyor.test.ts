// Metin görselin ALTINDA kalmıyor — katalog değişmezi (D-304 · FAZ-15.14).
//
// ⚠ ⚠ **BU DOSYA İKİ AYRI SESSİZ HATADAN DOĞDU ve ikisi de aynı sınıftan: ölçüm
// aletinin kendisi bozuktu.**
//
// 1. Gerçek bir koşuda iki kartın gövdesi kesik öznenin arkasında kaldı, bir üçüncüsü
//    yarıdan kırpıldı — ve denetim TEMİZ rapor verdi. Var olan hiçbir ölçüm örtülmeyi
//    göremiyordu: `tasma` kutu içi kırpılmayı ölçüyor, `kart-disi` tuvalden taşmayı,
//    `sus-baskin` yalnız alan oranını.
// 2. Düzenleyicinin kusur paneli `panoramaDenetle`yi yanlış çağırıyordu; tarayıcı
//    patlıyor, hata yutuluyor ve panel "✓ kusur yok" yazıyordu. Ölçüm yapılmamıştı.
//
// ⚠ Ve `panoramaDenetle`nin HİÇ TESTİ YOKTU — bütün kalite iddiası test edilmemiş bir
// alete dayanıyordu. Bu dosya önce aleti sınıyor, sonra katalogu.

import { describe, expect, it } from 'vitest'
import { ORNEKLER } from './katalog-ornek.js'
import { panoramaDenetle } from './panorama-denetim.js'
import { panoramaHtml, type PanoramaBelgesi } from './panorama.js'

const DAMGA = {
  brandId: 'brd_t',
  eraId: 'era_t',
  kitVersion: 'kit-1',
  definitionDigest: 'sha256:x',
  contextManifest: 'ctx_1',
  sourceRunId: 'run_t',
}

const belge = (o: (typeof ORNEKLER)[keyof typeof ORNEKLER]): PanoramaBelgesi =>
  ({ ...o, tokenCss: '', stamp: DAMGA }) as unknown as PanoramaBelgesi

describe('metin görselin altında kalmıyor', () => {
  // 🧪 ⚠ **ALET KANITI BİR TESTTEN DEĞİL, GERÇEK ÇIKTIDAN GELDİ.** Düzeltmeden ÖNCE
  // ölçüm altı şablonun ÜÇÜNDE (`sahne` %13, `memphis` %20, `donen` %6) ve iki gerçek
  // koşunun İKİSİNDE de örtülme buldu; düzeltmeden sonra hepsi temiz. Yani "kusur yok"
  // sonucu bir kez kırmızıyken görülmüş bir ölçümden geliyor.
  //
  // ⚠ Bu koşul artık SENTETİK olarak üretilemiyor: metin z-index 6, görseller 4 — hangi
  // yuvaya taşınırsa taşınsın metin üstte kalıyor. Bu yüzden alt sözleşme DOĞRUDAN
  // sınanıyor: katmanlanma bozulursa (biri metni indirir ya da görseli yükseltirse)
  // aşağıdaki altı ölçüm kendiliğinden kırmızıya döner, bu test ise SEBEBİ söyler.
  it('katmanlanma sözleşmesi: metin görsellerin ÜSTÜNDE', () => {
    const o = ORNEKLER['sahne']
    expect(o).toBeDefined()
    if (o === undefined) return
    const css = panoramaHtml(belge(o))
    const kat = (kural: RegExp): number => Number(kural.exec(css)?.[1] ?? -1)
    const metin = kat(/\.kart > \*:not\(\.hayalet\):not\(\.ray\) \{[^}]*z-index: (\d+)/)
    const gorsel = kat(/\.gorsel, \.gorsel-yer \{[^}]*z-index: (\d+)/)
    expect(metin).toBeGreaterThan(0)
    expect(gorsel).toBeGreaterThan(0)
    expect(metin).toBeGreaterThan(gorsel)
  })

  for (const [id, o] of Object.entries(ORNEKLER)) {
    it(`${id} · hiçbir metin örtülmüyor`, async () => {
      const r = await panoramaDenetle(belge(o))
      expect(r.ok).toBe(true)
      if (!r.ok) return
      const ortulu = r.value.filter((k) => k.tur === 'metin-ortuluyor')
      expect(ortulu.map((k) => `${k.kart}:${k.alan} ${k.aciklama}`)).toEqual([])
    }, 120_000)
  }
})
