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

// ── metin GÖRSELİN üstünde duruyor mu — ayrı bir soru, ayrı bir alet ────────
//
// ⚠ ⚠ **ÜSTTE OLMAK OKUNABİLİRLİK DEĞİLDİR ve bunu gerçek bir koşu gösterdi.**
// `run_01a02ade` çıktısında başlıklar okunmuyordu; yukarıdaki `metin-ortuluyor`
// ölçümü TEMİZ çıkıyordu ve doğru çalışıyordu — metin gerçekten üstteydi. Yanlış
// olan SORUYDU: bir fotoğrafın üstündeki metin, fotoğraf dokulu olduğu ölçüde okunmaz
// ve kesik özne tanımı gereği dokuludur. Ölçüldü: metin alanının %29'u görselin
// üstünde.
//
// ⚠ Bu blok önce ALETİ sınıyor (kusur gerçekten kırmızıya dönüyor mu, ve temiz bir
// yerleşimde susuyor mu), sonra katalogu. Sınanmamış bir alet, "kusur yok" diyen bir
// sessizlikten başka bir şey üretmiyor.
describe('metin görselin ÜSTÜNDE durmuyor', () => {
  const sahneli = ORNEKLER['sahne']

  /** Belgeyi tek görselle kurar — verilen panorama x'inde, tam boy. */
  const tekGorsel = (x: number): PanoramaBelgesi =>
    ({
      ...sahneli,
      gorseller: [
        { src: '', alt: 'ölçüm', x, y: 18, genislik: 12, yukseklik: 78, kirpma: 'kesik' },
      ],
      tokenCss: '',
      stamp: DAMGA,
    }) as unknown as PanoramaBelgesi

  it('ALET ÇALIŞIYOR: metin kolonunun üstündeki görsel KUSUR veriyor', async () => {
    // Kart 1'in sol yarısı metin kolonu (0–%54). Panorama %0–25 = kart 1, yani x=2
    // görseli doğrudan başlığın üstüne koyuyor.
    const r = await panoramaDenetle(tekGorsel(2))
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const c = r.value.filter((k) => k.tur === 'metin-gorsel-cakisiyor')
    expect(c.length).toBeGreaterThan(0)
  }, 120_000)

  it('ALET SUSUYOR: metin kolonunun DIŞINDAKİ görsel kusur vermiyor', async () => {
    // x=19 → kart 1'in sağ çeyreği ve kesimin üstü: metin kolonuna girmiyor.
    const r = await panoramaDenetle(tekGorsel(19))
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const c = r.value.filter((k) => k.tur === 'metin-gorsel-cakisiyor' && k.kart === 1)
    expect(c.map((k) => `${k.alan} ${k.aciklama}`)).toEqual([])
  }, 120_000)

  // ⚠ ⚠ Katalogun kendisi: bir şablon eklendiğinde ya da bir görsel kaydırıldığında
  // bu liste kendiliğinden genişliyor. Elle yazılan bir şablon listesi, yedinci şablon
  // eklendiği gün sessizce eksik kalırdı.
  for (const [id, o] of Object.entries(ORNEKLER)) {
    it(`${id} · metin bloğu görselin üstünde durmuyor`, async () => {
      const r = await panoramaDenetle(belge(o))
      expect(r.ok).toBe(true)
      if (!r.ok) return
      const c = r.value.filter((k) => k.tur === 'metin-gorsel-cakisiyor')
      expect(c.map((k) => `${k.kart}:${k.alan} ${k.aciklama}`)).toEqual([])
    }, 120_000)
  }
})
