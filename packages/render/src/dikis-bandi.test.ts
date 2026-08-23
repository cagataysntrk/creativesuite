// Dikiş dışlama bandı ve krom okunurluğu — kataloğun iki değişmezi (R-94 · R-95 · D-324).
//
// ⚠ ⚠ **İKİSİ DE ÜRETİM ÇIKTISINA BAKILARAK BULUNDU, ÖLÇÜMLE DEĞİL.** Kesik özneler
// küçük kalıyordu; büyütünce "1↔2 kesimi" diye ADLANDIRILMIŞ öznenin kesimi hiç
// aşmadığı ortaya çıktı — 0,4 px solunda bitiyordu. `kesintisizlik-yok` sessizdi çünkü
// kesimi başka bir taşıyıcı geçiyordu: **kesimde bir şeyin bulunması, doğru şeyin
// bulunması demek değil.** Büyütme bu kez rayı deldi ve `01 / 04` okunmaz oldu.
//
// ⚠ Bu dosya önce ALETİ sınıyor: kural iptal edilince ölçüm gerçekten kırmızıya
// dönüyor mu. Dönmeyen bir ölçüm, ölçüm değildir (R-71).

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { DIKIS_BANDI, EZICI_PAY, panoramaHtml, type PanoramaBelgesi } from './panorama.js'
import { ORNEKLER } from './katalog-ornek.js'
import { panoramaDenetle } from './panorama-denetim.js'

const DAMGA = {
  brandId: 'brd_t',
  eraId: 'era_t',
  kitVersion: 'kit-1',
  definitionDigest: 'sha256:x',
  contextManifest: 'ctx_1',
  sourceRunId: 'run_t',
}

type Ornek = (typeof ORNEKLER)[keyof typeof ORNEKLER]

/**
 * ⚠ ⚠ **TOKEN BOŞ BIRAKILAMAZ ve bunu ölçüm söyledi.** `tokenCss: ''` ile koşulan
 * belgede `--kart-metin` ve `--kart-zemin` çözülemiyor, her şey aynı renge düşüyor ve
 * krom ölçümü altı şablonda da **%100** veriyor. Renk ölçen bir kusuru renksiz bir
 * kurulumda sınamak, aleti değil kurulumu ölçmektir.
 *
 * ⚠ ⚠ **UYDURMA BİR PALET DE YETMEDİ.** Elle yazılmış on dokuz rol denendi ve dört
 * koyu şablon yine %100 verdi: `koyuMu()` kartın koyu mu açık mı olduğuna TOKEN
 * METNİNDEN karar veriyor ve uydurma değerlerle gerçekte çizilenden farklı karar
 * veriyordu. Yani test, aletle değil kendi paletiyle kavga ediyordu.
 *
 * Palet ÜRETİLMİŞ dosyadan okunuyor — üretimde çizilen renkler bunlar. Marka paleti
 * kromu okunmaz yaparsa bu test kırmızıya döner; **dönmesi de gerekir.**
 */
const TOKEN = readFileSync(
  join(
    dirname(fileURLToPath(import.meta.url)),
    '../../../brand/brd_upcytech/derived-tokens/tokens.css'
  ),
  'utf8'
)

const belge = (o: Ornek): PanoramaBelgesi =>
  ({ ...o, tokenCss: TOKEN, stamp: DAMGA }) as unknown as PanoramaBelgesi

/**
 * Bir görseli kesime DAYAYAN belge — "arada kalan" hâlin ta kendisi.
 *
 * ⚠ `throw` YOK (§8.6 · `chokepoints` kapısı): görselsiz bir örnek verilirse belge
 * olduğu gibi dönüyor ve çağıran test kırmızıya dönüyor. Bir test yardımcısının
 * istisna fırlatması da bu deponun tek fırlatma yasağına giriyor.
 */
const kesimeDaya = (o: Ornek): PanoramaBelgesi => {
  const kesim = o.slaytGenisligi
  const toplam = o.slaytGenisligi * o.kartlar.length
  const g = o.gorseller[0]
  return g === undefined
    ? belge(o)
    : {
        ...belge(o),
        // Kutunun SAĞ kenarı kesime tam oturuyor: ne aşıyor ne uzak.
        gorseller: [{ ...g, x: ((kesim - (g.genislik / 100) * toplam) / toplam) * 100 }],
      }
}

describe('dikiş dışlama bandı', () => {
  it('eşikler ARAŞTIRMADAN geliyor — 93 px ve %40', () => {
    expect(DIKIS_BANDI).toBe(93)
    expect(EZICI_PAY).toBe(0.4)
  })

  for (const [id, o] of Object.entries(ORNEKLER)) {
    it(`${id} · her görsel ya uzak ya ezici`, async () => {
      const r = await panoramaDenetle(belge(o))
      expect(r.ok).toBe(true)
      if (!r.ok) return
      expect(r.value.filter((k) => k.tur === 'dikis-bandinda').map((k) => k.aciklama)).toEqual([])
    })
  }

  // 🧪 ⚠ **KASTEN İHLAL** (R-71): görsel kesime DAYANIYOR. Ölçüm bunu görmezse
  // yukarıdaki altı yeşil hiçbir şey kanıtlamaz.
  it('kesime dayanan görsel KIRMIZI — ölçüm boş değil', async () => {
    const o = ORNEKLER['sahne']
    expect(o).toBeDefined()
    if (o === undefined) return
    const r = await panoramaDenetle(kesimeDaya(o))
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const bulgu = r.value.filter((k) => k.tur === 'dikis-bandinda')
    expect(bulgu.length).toBeGreaterThan(0)
    expect(bulgu[0]?.aciklama).toContain('px')
  })
})

describe('krom okunuyor', () => {
  // 🧪 ⚠ ⚠ **ALET KANITI SENTETİK BİR TESTTEN DEĞİL, GERÇEK ÇIKTIDAN GELDİ** — ve bu
  // `metin-ortuluyor.test.ts`teki durumun aynısı. Kusur `sahne`nin kapağında GÖZLE
  // görüldü (`01 / 04` ayakkabının üstünde okunmuyordu), ölçüm onu **%10** olarak
  // buldu, özne rayın üstüne çekilince **%0**'a döndü. Diğer 89 krom kutusu zaten %0.
  //
  // ⚠ Sentetik ihlal DENENDİ ve tutmadı: tam kadraj BEYAZ bir görselle bile kusur
  // çıkmıyor, çünkü rayın perdesi o yükseklikte zemini yeterince bastırıyor. Yani
  // sistem doğru davranıyor ve sahte bir ihlal ancak perdeyi kaldırarak kurulabilirdi.
  // Bu yüzden ALT SÖZLEŞME doğrudan sınanıyor: perde kalkarsa aşağıdaki altı ölçüm
  // kendiliğinden kırmızıya döner, bu test ise SEBEBİ söyler.
  it('perde sözleşmesi: ray kendi zeminini TAŞIYOR', () => {
    const o = ORNEKLER['sahne']
    expect(o).toBeDefined()
    if (o === undefined) return
    const css = panoramaHtml(belge(o))
    const kural = /\.ray \{ padding-bottom[^}]*background: linear-gradient\(to top,/.exec(css)
    expect(kural).not.toBeNull()
    expect(css).toContain('var(--kart-zemin)')
  })

  for (const [id, o] of Object.entries(ORNEKLER)) {
    it(`${id} · ray metni zemine karışmıyor`, async () => {
      const r = await panoramaDenetle(belge(o))
      expect(r.ok).toBe(true)
      if (!r.ok) return
      expect(r.value.filter((k) => k.tur === 'krom-okunmuyor').map((k) => k.aciklama)).toEqual([])
    })
  }
})
