// AKSAN DİSİPLİNİ — *"tek mavi anı işe yarayan şey NADİRLİĞİDİR"* (FAZ-19.6).
//
// Denetimin beşinci müdahalesi: *"Aksan dokuya dönüşmüş: mavi on kartta da aynı
// sözdizimsel yerde (serif satırın içinde bir-iki kelime). Her kartta aynı yerde duran
// aksan, aksan değildir."* Dört rol öneriyor: `vurgu` · `alan` · `isaret` · `yok`,
// bir karoselde `vurgu` ≤2 kez ve `yok` ≥1 kez.
//
// ⚠ ⚠ **ÖLÇÜLDÜ VE SAYISAL KURAL ZATEN SAĞLANIYOR — ama tam olarak sağlanması SORUNUN
// KENDİSİ.** On destenin ONUNDA da aksanlı başlık sayısı **tam 2**:
//   veri-hikayesi 2/9 · akan-alan 2/6 · sahne 2/4 · memphis 2/7 · donen 2/4 ·
//   editoryal 2/4 · kavis 2/5 · alinti 2/3 · karsilastirma 2/5 · dizin 2/7
// Yani `vurgu ≤2` ve `yok ≥1` tutuyor, ama on deste de AYNI sayıyı, aynı yerde
// kullanıyor. Denetimin dediği "doku" bu: kural değil TEKDÜZELİK.
//
// ⚠ Kalan üç rol (`alan` ≥%20 mavi alan üstünde oyulmuş beyaz · `isaret` tek küçük
// işaret · rolü açıkça `yok`) bir KOMPOZİSYON işi, renk işi değil — 19.7'ye bırakıldı ve
// `OLCUMLER.md`ye yazıldı. Bu kapı bugünkü kazanımı KİLİTLİYOR: sayı ikiyi aşarsa mavi
// an nadir olmaktan çıkar ve geri dönüş sessiz olur.

import { describe, expect, it } from 'vitest'
import { ORNEKLER } from './katalog-ornek.js'

/** Bir karoselde en çok kaç kart `**vurgu**` taşıyabilir (denetim: ≤2). */
const VURGU_TAVANI = 2

describe('aksan disiplini', () => {
  for (const [id, o] of Object.entries(ORNEKLER)) {
    it(`${id} · vurgu ≤${String(VURGU_TAVANI)} ve en az bir kart aksansız`, () => {
      const vurgulu = o.kartlar.filter((k) => k.baslik.includes('**'))
      expect(
        vurgulu.length,
        `${id}: ${String(vurgulu.length)} kartta vurgu var — ` +
          'tek mavi anı işe yarayan şey NADİRLİĞİDİR'
      ).toBeLessThanOrEqual(VURGU_TAVANI)
      // ⚠ `yok` ≥1: hiçbir aksan taşımayan en az bir kart. Bir destede her kart
      // vurguluysa vurgu bir ses değil bir ZEMİN olur.
      expect(
        o.kartlar.length - vurgulu.length,
        `${id}: aksansız kart yok — her kart vurguluysa vurgu ses olmaktan çıkar`
      ).toBeGreaterThanOrEqual(1)
    })
  }

  // ⚠ ⚠ **AKSAN RENGİ PALETTEN, MARKA MAVİSİNDEN DEĞİL.** `editoryal` ve `memphis`
  // reçetede açıkça *"mavi YOK"* diyor; ikisi de artık kâğıt paletinin oksitini
  // kullanıyor. Bu iddia olmadan bir sonraki tur ikisini de sessizce maviye çevirebilir.
  it('mavi YOK denen şablonlarda aksan mavi DEĞİL', () => {
    for (const id of ['editoryal', 'memphis']) {
      const o = ORNEKLER[id]
      expect(o, `${id} yok`).toBeDefined()
      expect(
        o?.aksan ?? '',
        `${id}: reçete bu şablonda MAVİ YOK diyor — paletten çıkışın kanıtı bu şablon`
      ).not.toContain('mavi')
    }
  })
})
