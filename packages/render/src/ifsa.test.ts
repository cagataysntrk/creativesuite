// Görünür AI ifşası ÖLÇÜLÜYOR (§11.3 · Md. 50 · D-311).
//
// ⚠ ⚠ **BU KATMAN HİÇ YOKTU ve depodaki 130 varlığın 130'u bu yüzden yayınlanamazdı.**
// `publish.ts` ifşa gereken varlıkta iki şey arıyor: makine-okunur damga (PNG'ye
// basılıyor) ve kreatifin üstünde GÖRÜNÜR ifşa. İkincisini üreten kod yoktu; kapı
// doğru çalışıyor, üretim eksik davranıyordu ve panel bunu "130 yayınlanamaz" diye
// sessizce gösteriyordu.
//
// ⚠ Test HTML'e değil GÖRÜNÜRLÜĞE bakıyor. Sıfır boyutlu, gizli ya da saydam bir
// etiket DOM'da vardır ve ifşa DEĞİLDİR; `visibleDisclosure: true` yazan bir sidecar
// da öyle — kimsenin bakmadığı bir kutucuğun işaretlenmesi (D-23).

import { describe, expect, it } from 'vitest'
import { ORNEK_SAHNE } from './katalog-ornek.js'
import { AI_IFSA_METNI, panoramaHtml, type PanoramaBelgesi } from './panorama.js'
import { panoramaDenetle } from './panorama-denetim.js'
import { withPage } from './browser.js'

/**
 * Belgeyi tarayıcıda kurup verilen ölçümü koşar.
 *
 * ⚠ Ayrı bir yardımcı: denetim kusur LİSTESİ döndürüyor, buradaki sorular ise
 * yerleşimle ilgili ve kusur türü açmayı hak etmiyor. Tarayıcı darboğazı yine
 * `withPage` (§3.8) — ikinci bir Chromium açan test, ölçtüğünü sandığı şeyi
 * başka bir ortamda ölçer.
 */
interface SeritOlcumu {
  readonly cakisma: readonly string[]
  readonly tasan: number
  readonly ifsaGenisligi: number
}

const olcumSayfasi = async (doc: PanoramaBelgesi, kod: string): Promise<SeritOlcumu | null> => {
  const r = await withPage(async (page) => {
    await page.setViewportSize({ width: doc.slaytGenisligi, height: doc.yukseklik })
    await page.setContent(panoramaHtml(doc), { waitUntil: 'load' })
    await page.evaluate('(async () => { await document.fonts.ready; return true })()')
    return (await page.evaluate(kod)) as SeritOlcumu
  })
  // ⚠ `throw` YOK: hata bir DEĞERDİR (§8.6) ve `chokepoints` kapısı testte de zorluyor.
  // `null` dönüyor; çağıran onu bir başarısızlık olarak SINIYOR.
  return r.ok ? r.value : null
}

const DAMGA = { brandId: 'b', eraId: 'e', kitVersion: 'k' }
const belge = (aiIfsasi: boolean): PanoramaBelgesi =>
  ({ ...ORNEK_SAHNE, tokenCss: '', stamp: DAMGA, aiIfsasi }) as unknown as PanoramaBelgesi

describe('görünür AI ifşası', () => {
  it('bayrak yokken şerit HİÇ çizilmiyor — ifşa gerekmeyen işi kirletmez', () => {
    // ⚠ ELEMENT aranıyor, sınıf ADI değil: `.ray-ifsa` kuralı stil sayfasında her
    // zaman var ve ilk sürüm bu yüzden kırmızıydı — test yanlıştı, kod değil.
    expect(panoramaHtml(belge(false))).not.toContain('class="ray-ifsa"')
    expect(panoramaHtml(belge(false))).not.toContain(AI_IFSA_METNI)
  })

  it('bayrak varken HER slaytta çiziliyor — tek slayt paylaşılabiliyor', () => {
    const html = panoramaHtml(belge(true))
    const sayi = (html.match(/class="ray-ifsa"/g) ?? []).length
    expect(sayi).toBe(ORNEK_SAHNE.kartlar.length)
    expect(html).toContain(AI_IFSA_METNI)
  })

  it('şerit DOM ölçümünde görünür sayılıyor — kusur ÜRETMİYOR', async () => {
    const r = await panoramaDenetle(belge(true))
    expect(r.ok).toBe(true)
    const kusurlar = r.ok ? r.value : []
    expect(kusurlar.filter((k) => k.tur === 'ifsa-gorunmuyor')).toEqual([])
  }, 30_000)

  // ⚠ ⚠ **İFŞA ŞERİDİ EKLEMEK KÜNYEYİ TAŞIRDI ve bunu ölçüm DEĞİL göz yakaladı.**
  // Gerçek çıktıda uzun bir kaynak metni ifşanın altından geçti: flex öğeleri
  // `min-width: 0` olmadan içeriklerinin altına inmiyor. Küçülme hakkı kaynak
  // metnine ait; ifşa ve sayaç sabit — ifşanın kırpılması Md. 50 açısından kabul
  // edilemez, kaynak metninin kırpılması ise anlamı yok etmez.
  it('uzun kaynak metniyle bile şeritte ÇAKIŞMA yok', async () => {
    const uzun = 'Excel, vardiya defteri ya da hiçbir şey — imalatta ölçüm başlangıcı'
    const doc = {
      ...belge(true),
      kartlar: ORNEK_SAHNE.kartlar.map((k) => ({ ...k, rayaOrta: uzun })),
    } as unknown as PanoramaBelgesi
    const r = await olcumSayfasi(
      doc,
      `(() => {
      const ray = document.querySelector('.kart .ray')
      const c = [...ray.children].map((e) => {
        const r = e.getBoundingClientRect()
        return { sinif: e.className, sol: r.left, sag: r.right }
      })
      const cakisma = []
      for (let i = 1; i < c.length; i++) if (c[i].sol < c[i-1].sag - 1) cakisma.push(c[i-1].sinif)
      const rr = ray.getBoundingClientRect()
      const ifsa = c.find((x) => x.sinif === 'ray-ifsa')
      return { cakisma, tasan: c.filter((x) => x.sag > rr.right + 1).length,
               ifsaGenisligi: ifsa === undefined ? 0 : ifsa.sag - ifsa.sol }
    })()`
    )
    expect(r).not.toBeNull()
    expect(r?.cakisma).toEqual([])
    expect(r?.tasan).toBe(0)
    // İfşa KIRPILMAMIŞ: genişliği metnin gerçek genişliği kadar.
    expect(r?.ifsaGenisligi ?? 0).toBeGreaterThan(100)
  }, 30_000)

  it('şerit GİZLENİRSE ölçüm YAKALIYOR — varlık değil görünürlük ölçülüyor', async () => {
    // ⚠ Şerit HTML'de duruyor, ekranda yok. "Elementi ara" biçiminde bir kontrol
    // bunu yeşil geçerdi ve ifşasız bir gönderi yayına giderdi. `tokenCss` belgenin
    // `<style>`ına giriyor; gizleme oradan yapılıyor — yani senaryo gerçekçi:
    // marka tokenlarına eklenen tek bir satır ifşayı sessizce kapatabilir.
    const gizli = {
      ...belge(true),
      tokenCss: '.ray-ifsa { display: none !important }',
    } as unknown as PanoramaBelgesi
    const r = await panoramaDenetle(gizli)
    expect(r.ok).toBe(true)
    const kusurlar = r.ok ? r.value : []
    const ifsa = kusurlar.filter((k) => k.tur === 'ifsa-gorunmuyor')
    expect(ifsa.length).toBe(ORNEK_SAHNE.kartlar.length)
  }, 30_000)
})

// ── künye SADELEŞTİ: kategori etiketi boşsa çizilmiyor ─────────────────────
//
// ⚠ ⚠ Depo sahibi: *"İDDİA · upcyman.com, api.upcyman.com · yapay zekâ görseli — bu
// tarz footerları kaldır, tek konuyla alakalı mesele upcyman.com yazsın yeter"*.
// Kategori etiketi zaten kartın ÜST BAŞLIĞINDA duruyor; aynı bilgiyi iki kez basmak
// künyeyi gürültüye çevirir.
//
// ⚠ **AI İFŞASI KALIYOR** ve bu bir tercih değil: model görseli kullanan bir kreatifte
// Md. 50 görünür ifşa istiyor (Yasa 9). Kaldırılan şey gürültü, yükümlülük değil.
describe('künye sadeliği', () => {
  const raysiz = (): PanoramaBelgesi =>
    ({
      ...ORNEK_SAHNE,
      tokenCss: '',
      stamp: DAMGA,
      aiIfsasi: false,
      kartlar: ORNEK_SAHNE.kartlar.map((k) => ({ ...k, rayaSol: '' })),
    }) as unknown as PanoramaBelgesi

  it('`rayaSol` boşsa HİÇ çizilmiyor — boş bir etiket de yer kaplar', () => {
    expect(panoramaHtml(raysiz())).not.toContain('class="ray-sol"')
  })

  it('doluysa çiziliyor — şablonu olan kayıt onu kullanabilir', () => {
    const doc = {
      ...raysiz(),
      kartlar: ORNEK_SAHNE.kartlar.map((k) => ({ ...k, rayaSol: 'GERİ KAZANIM' })),
    } as unknown as PanoramaBelgesi
    expect(panoramaHtml(doc)).toContain('class="ray-sol"')
  })

  it('ifşa AI görselinde KALIYOR — kaldırılan gürültü, yükümlülük değil', () => {
    const doc = { ...raysiz(), aiIfsasi: true } as unknown as PanoramaBelgesi
    expect(panoramaHtml(doc)).toContain(AI_IFSA_METNI)
  })
})
