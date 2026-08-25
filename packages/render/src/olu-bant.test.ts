// ÖLÜ BANT — bir slaytta içeriksiz yatay bandın tavanı (FAZ-19 · denetim).
//
// Denetim: *"panolar y≈%75'ten %45-60'a insin ve sürekli ögeye DEĞSİN."* Ölçüldüğünde
// asıl kusur daha basit çıktı: `dizin`in üç kartında en uzun boş bant y%51'de başlayıp
// %94'e iniyordu — kadrajın **%43'ü**. Sebep tek satırdı: `gorseller: []`. On şablonun
// tek görselsiz olanı, ve kapsamı %42 (aile ortalaması %70).
//
// ⚠ ⚠ **ÖLÇÜM ALETİ ÖNCE PİKSELLE YAZILDI VE YANLIŞTI.** Kenar sayımı `kavis`te her
// satırda 30-150‰ kenar buluyordu — o DOKUYDU, içerik değil; `memphis`te ise y%53-92
// arası sabit 15‰ tek bir 4 px'lik saç çizgisiydi ve bant "dolu" okunuyordu. Doku tanım
// gereği ZEMİNDİR. Bu yüzden ölçüm içerik kutuları + taşıyıcının GERÇEK geometrisi
// üzerinden yapılıyor.
//
// ⚠ SVG'de tuvali kaplayan konturSUZ dolgu (`alan-siniri`in `rect`i) İÇERİK SAYILMAZ:
// sayınca dört şablon "%100 dolu" göründü ve alet yalancı çıktı. Çizilmiş KENAR sayılır.

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { withPage } from './browser.js'
import { ORNEKLER } from './katalog-ornek.js'
import { fontCss } from './fonts.js'
import { panoramaHtml, type PanoramaBelgesi } from './panorama.js'

const KOK = join(dirname(fileURLToPath(import.meta.url)), '../../..')
const TOKEN = readFileSync(join(KOK, 'brand/brd_upcytech/derived-tokens/tokens.css'), 'utf8')
const DAMGA = {
  brandId: 'brd_t',
  eraId: 'era_t',
  kitVersion: 'kit-1',
  definitionDigest: 'sha256:x',
  contextManifest: 'ctx_1',
  sourceRunId: 'run_t',
}

const SEC =
  '.ust-baslik,.baslik,.govde,.panel,.sayilar,.etiketler,.kapanis,.gorsel,' +
  '.gorsel-yer,.olcek-durak,.olcek-etiket,.kilometre,.ray,.hayalet'

// ⚠ Tarayıcıda koşan ölçüm; `page.evaluate` metin alıyor (R-98: şablon değişmezi içinde
// ters tırnak parçalanıyor, bu yüzden yer tutucu ile değiştiriliyor).
const OLC = `(() => {
  const G = %G%, H = %H%, N = %N%, SEC = %SEC%
  const dolu = Array.from(document.querySelectorAll('.kart')).map(() => new Uint8Array(H))
  const isaretle = (x0, y0, x1, y1) => {
    if (x1 - x0 < 3 || y1 - y0 < 2) return
    const k0 = Math.max(0, Math.floor(x0 / G)), k1 = Math.min(N - 1, Math.floor((x1 - 1) / G))
    for (let k = k0; k <= k1; k++) {
      const d = dolu[k]; if (d === undefined) continue
      for (let y = Math.max(0, Math.floor(y0)); y < Math.min(H, Math.ceil(y1)); y++) d[y] = 1
    }
  }
  for (const el of document.querySelectorAll(SEC)) {
    if (getComputedStyle(el).visibility === 'hidden') continue
    const r = el.getBoundingClientRect()
    isaretle(r.left, r.top, r.right, r.bottom)
  }
  for (const g of document.querySelectorAll('svg path, svg rect, svg circle, svg ellipse, svg polygon')) {
    const ctm = g.getScreenCTM(); if (ctm === null) continue
    const st = getComputedStyle(g)
    if (st.display === 'none' || Number(st.opacity) < 0.06) continue
    const kalin = st.stroke === 'none' ? 0 : Number(st.strokeWidth) || 0
    const kb = g.getBoundingClientRect()
    if (kalin === 0 && kb.height > H * 0.88 && kb.width > G * 0.88) continue
    if (typeof g.getTotalLength !== 'function' || g.getTotalLength() === 0) {
      isaretle(kb.left, kb.top, kb.right, kb.bottom); continue
    }
    const L = g.getTotalLength(), kova = new Map()
    for (let i = 0; i <= 900; i++) {
      const pt = g.getPointAtLength((i / 900) * L)
      const sx = pt.x * ctm.a + pt.y * ctm.c + ctm.e, sy = pt.x * ctm.b + pt.y * ctm.d + ctm.f
      const b = Math.floor(sx / 12), v = kova.get(b)
      if (v === undefined) kova.set(b, [sy, sy])
      else { if (sy < v[0]) v[0] = sy; if (sy > v[1]) v[1] = sy }
    }
    const yari = (kalin * Math.abs(ctm.d)) / 2
    for (const [b, ab] of kova) isaretle(b * 12, ab[0] - yari, b * 12 + 12, ab[1] + yari + 1)
  }
  return dolu.map((d) => {
    // ⚠ KENAR PAYI ÖLÜ BANT DEĞİLDİR: aranan şey ilk ve son dolu satır ARASINDAKİ boşluk.
    let ilk = -1, son = -1
    for (let y = 0; y < H; y++) if (d[y] === 1) { if (ilk < 0) ilk = y; son = y }
    if (ilk < 0) return 100
    let enUzun = 0, run = 0
    for (let y = ilk; y <= son; y++) {
      if (d[y] === 0) run++
      else { if (run > enUzun) enUzun = run; run = 0 }
    }
    return (100 * enUzun) / H
  })
})()`

type Ornek = (typeof ORNEKLER)[keyof typeof ORNEKLER]
// ⚠ ⚠ **FONT YÜKLENMEDEN ÖLÇÜLEN DÜZEN, ÜRETİMDEKİ DÜZEN DEĞİLDİR.** Kapı fontsuz
// ölçerken `veri-hikayesi` k1'i %29 buluyordu, alet (fontlu) %20. Yedek fontun satır
// metrikleri başka: bloklar kayıyor ve ölü bant uzuyor. Kapı ile alet aynı şeyi
// ölçmüyorsa ikisinden biri yalan söylüyor demektir.
const FONT_SONUCU = fontCss(join(KOK, 'brand/brd_upcytech/fonts'))
const belge = (o: Ornek): PanoramaBelgesi =>
  ({
    ...o,
    tokenCss: TOKEN,
    fontCss: FONT_SONUCU.ok ? FONT_SONUCU.css : '',
    stamp: DAMGA,
  }) as unknown as PanoramaBelgesi

const olc = async (o: Ornek): Promise<readonly number[]> => {
  const sonuc = await withPage(async (page) => {
    const G = o.slaytGenisligi
    await page.setViewportSize({ width: G, height: o.yukseklik })
    await page.setContent(panoramaHtml(belge(o)), { waitUntil: 'load' })
    await page.evaluate(
      '(async () => { await document.fonts.ready;' +
        ' const s = document.querySelector("#sahne");' +
        ' s.style.transform = "none"; document.body.style.width = s.style.width })()'
    )
    await page.setViewportSize({ width: G * o.kartlar.length, height: o.yukseklik })
    const kod = OLC.replace('%G%', String(G))
      .replace('%H%', String(o.yukseklik))
      .replace('%N%', String(o.kartlar.length))
      .replace('%SEC%', JSON.stringify(SEC))
    return (await page.evaluate(kod)) as readonly number[]
  })
  return sonuc.ok ? sonuc.value : []
}

// ⚠ ⚠ **TAVAN DÜRÜSTTÜR, HEDEF DEĞİL.** Ölçülen en kötü değer %37 (`karsilastirma` k2);
// %38 tavanı REGRESYONU durdurur, borcu KAPATMAZ. %25'in üstünde kalanlar — ve bu bir
// sessiz kırpma değil, yazılı borçtur:
//   memphis k4 %27 · alinti k1 %23 · veri-hikayesi %18-22 · akan-alan %21-23
// Her biri kapatıldıkça bu tavan aşağı çekilecek.
// ⚠ Tavan %38'den **%31'e** çekildi: `veri-hikayesi` (panolar eğriyi biniyor) ve
// `karsilastirma` (orta iki kart ölçüsünü aldı) kapandı. En kötü artık `kavis` k3 %30.
// ⚠ ⚠ **ÖLÇÜM DÜZELTİLDİ: KENAR PAYI ÖLÜ BANT DEĞİLDİR.** Eski hâl kartın üst payını
// da sayıyordu; `sahne` %13, `editoryal` k3 %29 ve `alinti` %27/%25 diye kayıtlıydı ve
// **üçü de kenar payıydı, kusur değil**. Bir sayfanın kenar payı bir tasarım kararıdır.
// ⚠ Arada bir GENİŞLİK EŞİĞİ (%18) de denendi ve geri alındı: `editoryal`in şeridi zaten
// kart genişliğinin %40'ı (eşik ona dokunmadı) ama eşik SİVRİ biçimleri eledi —
// `kavis`in sapan kemerinin ucu dar olduğu için o kart %17'den yine %30'a çıkıyordu.
// **%30 → %28.** Gerçek iç bantlar: `memphis` k4 %27 · `alinti` k1 %23 · `veri-hikayesi` %22.
const TAVAN = 28
// ⚠ Tavan 12 DENENDİ ve işe yaramazdı: kapak kartı `yayik` olmadan %12,01 ölçüyor —
// kapı 0,014 puanla kırmızıya dönüyordu, yani hiçbir şey söylemiyordu. Ölçülen %7,
// tavan 9: iki puanlık gerçek pay, ve ihlal (%12 · %43) açık farkla düşüyor.
const DIZIN_TAVANI = 9

describe('ölü bant', () => {
  for (const [id, o] of Object.entries(ORNEKLER)) {
    it(`${id} · hiçbir slaytta %${String(TAVAN)}'den uzun içeriksiz bant yok`, async () => {
      const b = await olc(o)
      expect(b.length, 'ölçüm alınamadı').toBe(o.kartlar.length)
      for (const [i, v] of b.entries())
        expect(v, `${id} kart ${String(i + 1)} ölü bant %${v.toFixed(0)}`).toBeLessThanOrEqual(
          TAVAN
        )
    }, 90_000)
  }

  // ⚠ ⚠ **ASIL KAZANÇ BURADA KİLİTLİ.** `yayik` liste maddeleri kadrajın boyuna
  // dağıtınca `dizin`in ölü bandı %43'ten %7'ye indi, kapsamı %42'den %74'e çıktı.
  // Doldurmak için hiçbir öge EKLENMEDİ — R-81'in saydığı "kodlanmış öge" artmadı;
  // var olan dört madde bir GÜZERGÂHA dönüştü.
  it('dizin · liste bir pencere ögesi değil, kadrajı inen bir güzergâh', async () => {
    const o = ORNEKLER['dizin']
    expect(o, 'dizin örneği yok').toBeDefined()
    if (o === undefined) return
    const b = await olc(o)
    expect(b.length).toBe(o.kartlar.length)
    for (const [i, v] of b.entries())
      expect(v, `dizin kart ${String(i + 1)} ölü bant %${v.toFixed(0)}`).toBeLessThanOrEqual(
        DIZIN_TAVANI
      )
  }, 90_000)
})
