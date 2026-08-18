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
