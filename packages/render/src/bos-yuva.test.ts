import { describe, expect, it } from 'vitest'
import { ORNEKLER, type KatalogOrnegi } from './katalog-ornek.js'
import { olcumBelgesi } from './olcum-belgesi.js'
import { panoramaHtml, type PanoramaBelgesi } from './panorama.js'

// ── BOŞ YUVA: son çıktıda YER TUTUCU YOK, editörde VAR (FAZ-19.13) ──────────
//
// ⚠ ⚠ **DEPO SAHİBİ: *"bir görsel yuvasını boş bırakınca 'yuva 3' gibi etiket ve
// çerçeve ile basılıyor, hiç yokmuş gibi render olmalı!! bilerek boş bırakıyorum, o
// sadece editörde görünmeli."*** Yer tutucu bir DÜZENLEME YARDIMI; yayına giden
// karoselde kesikli bir kutu tasarımın parçası sanılıyordu.
//
// ⚠ ⚠ **VE ASIL SINAMA: ÖLÇÜM KÖRLEŞMEDİ Mİ.** Yer tutucu üç yerde iş yapıyor (düzen
// provası, denetim, editör). Varsayılanı kapatmak bu üçünü sessizce kör ederdi — o
// yüzden varsayılan AÇIK, yalnız son çıktı kapatıyor.
describe('boş görsel yuvası (D-268)', () => {
  // ⚠ Ölçüm belgesi TEK yerden (`olcum-belgesi.ts`): belirteç + font + logo + damga.
  const dolu = (): PanoramaBelgesi => olcumBelgesi(ORNEKLER['donen'] as KatalogOrnegi)
  const bosYuvali = (): PanoramaBelgesi => {
    const d = dolu()
    return {
      ...d,
      gorseller: d.gorseller.map((g, i) => (i === 0 ? { ...g, src: '', alt: 'yuva 1' } : g)),
    }
  }

  it('VARSAYILAN: yer tutucu ÇİZİLİYOR — editör ve ölçüm onu görmek zorunda', () => {
    expect(panoramaHtml(bosYuvali())).toContain('gorsel-yer')
  })

  it('`yerTutucu: false`: kesikli kutu da ETİKETİ de YOK', () => {
    const html = panoramaHtml(bosYuvali(), { yerTutucu: false })
    expect(html, 'kesikli kutu çizilmemeli').not.toContain('class="gorsel-yer')
    expect(html, 'yuva etiketi basılmamalı').not.toContain('yuva 1')
  })

  it('DOLU yuvalar iki modda da AYNI — bayrak yalnız boş yuvayı etkiliyor', () => {
    // ⚠ Katalog taslağının yuvaları BOŞ doğuyor (`src: ''`): görseli her koşu kendi
    // üretiyor. Bu iddia bayrağın DOLU yuvaya dokunmadığını ölçüyor, o yüzden hepsi
    // önce dolduruluyor.
    const d = dolu()
    const hepsiDolu: PanoramaBelgesi = {
      ...d,
      gorseller: d.gorseller.map((g) => ({ ...g, src: 'data:image/png;base64,iVBORw0KGgo=' })),
    }
    expect(panoramaHtml(hepsiDolu, { yerTutucu: false })).toBe(panoramaHtml(hepsiDolu))
  })
})
