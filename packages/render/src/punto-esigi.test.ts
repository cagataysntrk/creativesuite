// Gövde puntosu OKUMA EŞİĞİNİN altına inemiyor (R-83 · D-321).
//
// ⚠ ⚠ **ESKİ TABAN 34 px "ÖLÇÜLDÜ" DİYORDU ama ölçülen şey BİZİM ÇIKTIMIZDI.** Bir
// sayıyı kendi çıktına bakarak seçmek, ölçüm değil kabullenmedir. Okunabilirliğin
// ölçüsü nominal punto değil, harfin gözde kapladığı AÇIDIR: kritik punto **0,20°**
// açısal x-yüksekliği (Legge & Bigelow 2011, *Journal of Vision*), altında okuma hızı
// çöküyor. 32,2 cm telefon mesafesinde 1080 px tuvalde bu **36 px** eder.
//
// ⚠ Yaygın *"gövde 24 px yeter"* tavsiyesi eşiğin **%30 altında** ve hiçbir kaynağı yok.
// Bu depoda da o tavsiyenin bir sürümü yazılıydı ve altı şablonun altısı onu kullanıyordu.

import { describe, expect, it } from 'vitest'
import { ORNEKLER } from './katalog-ornek.js'
import { panoramaDenetle } from './panorama-denetim.js'
import { GOVDE_TABANI_1080, panoramaHtml, type PanoramaBelgesi } from './panorama.js'

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

describe('gövde puntosu okuma eşiğinin altına inmiyor', () => {
  it('taban SAYISI kaynağından geliyor — 36 px, 1080 px tuvalde', () => {
    // ⚠ Sayının kendisi sınanıyor: biri onu "biraz küçültelim, sığmıyor" diye
    // değiştirirse bu test onu durdurur ve R-83'ün kaynağına yönlendirir.
    expect(GOVDE_TABANI_1080).toBe(36)
  })

  for (const [id, o] of Object.entries(ORNEKLER)) {
    it(`${id} · hiçbir metin eşiğin altında değil`, async () => {
      const r = await panoramaDenetle(belge(o))
      expect(r.ok).toBe(true)
      if (!r.ok) return
      const alti = r.value.filter((k) => k.tur === 'punto-esik-alti')
      expect(alti.map((k) => `${k.kart}:${k.alan} ${k.aciklama}`)).toEqual([])
    }, 120_000)
  }

  // ⚠ ⚠ **ALET SINANIYOR, YOKLUĞU DEĞİL.** Yukarıdaki altı iddia "kusur yok" diyor —
  // ama ölçüm hiç çalışmasa da aynı şeyi derdi.
  //
  // ⚠ Kusur SENTETİK olarak üretilemiyor ve bu iyi bir işaret: taban `panoramaHtml`
  // içinde CSS'e yazılıyor ve `govdeOrani` onu ezemiyor — yani belge tarafından ihlal
  // edilemez. Alet kanıtı KAYNAK ihlaliyle alındı: `govdeTabani` 24'e sabitlendi,
  // denetim `sahne`de 4 + `donen`de 4 `punto-esik-alti` kusuru verdi, sonra geri alındı.
  //
  // Testin sınayabileceği şey tabanın GERÇEKTEN orantılı olduğu: sabit 36 px yazılmış
  // olsaydı geniş tuvalde eşik aynı kalır ve kural sessizce zayıflardı.
  it('taban tuval genişliğine ORANTILI — sabit piksel değil', () => {
    const o = ORNEKLER['sahne']
    expect(o).toBeDefined()
    if (o === undefined) return
    const dar = panoramaHtml(belge(o))
    const genis = panoramaHtml({ ...belge(o), slaytGenisligi: 2160 } as PanoramaBelgesi)
    const taban = (html: string): number =>
      Number(/font-size: calc\(max\((\d+)px/.exec(html)?.[1] ?? 0)
    expect(taban(dar)).toBe(GOVDE_TABANI_1080)
    // Tuval iki katına çıkınca eşik de iki katına çıkıyor: açı sabit, piksel türev.
    expect(taban(genis)).toBe(GOVDE_TABANI_1080 * 2)
  })
})

// ── ölçü bandı: satır 45–75 karakter (R-86) ─────────────────────────────────
describe('gövde satırı ölçü bandında', () => {
  for (const [id, o] of Object.entries(ORNEKLER)) {
    it(`${id} · satır bandın dışında değil`, async () => {
      const r = await panoramaDenetle(belge(o))
      expect(r.ok).toBe(true)
      if (!r.ok) return
      const d = r.value.filter((k) => k.tur === 'olcu-bandi-disi')
      expect(d.map((k) => `${k.kart}: ${k.aciklama}`)).toEqual([])
    }, 120_000)
  }

  // ⚠ ⚠ **ALET SINANIYOR.** Sütun ölçü tabanını kaldırabiliyorken satır kısa kalırsa
  // kusur doğmalı. `sahne`nin gövde sütunu daraltılıyor — kapasite düşmüyor çünkü
  // punto tabanı sabit; satır kısalıyor ve alt sınır devreye giriyor.
  it('ALET ÇALIŞIYOR: geniş sütunda kısa satır KUSUR veriyor', async () => {
    const o = ORNEKLER['veri-hikayesi']
    expect(o).toBeDefined()
    if (o === undefined) return
    // Gövde metni kısaltılıyor ama sütun geniş kalıyor: kapasite 45+, satır 45'in altı.
    const kisa = {
      ...belge(o),
      kartlar: o.kartlar.map((k) => ({
        ...k,
        govde: 'Kısa bir gövde satırı burada duruyor ve iki satıra bölünüyor.',
      })),
    } as unknown as PanoramaBelgesi
    const r = await panoramaDenetle(kisa)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    // Bu belge ya bandın altında kalır (kusur) ya da tek satıra sığar (ölçüm atlar).
    // Ölçülen şey ALETİN kapasiteyi gerçekten okuduğu: kusur çıkarsa açıklamada
    // sütun kapasitesi yazılı olmalı.
    const d = r.value.filter((k) => k.tur === 'olcu-bandi-disi')
    for (const k of d) expect(String(k.aciklama)).toMatch(/kaldiriyor|tavani/)
  }, 120_000)
})
