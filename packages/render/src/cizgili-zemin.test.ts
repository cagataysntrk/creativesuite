// ÇİZGİLİ ZEMİN — kural ÇİZİLDİ mi, ve GÖRÜNÜYOR mu (FAZ-19.4).
//
// ⚠ ⚠ **ZİNCİRİN 14. KOPUKLUĞU BURADA KAPANDI.** `zemin.ts` bir `tip: 'tarama'` katmanı
// (`repeating-linear-gradient`) taşıyordu ve üretim yolunda **çağıranı yoktu.** Reçetenin
// `B` bölümü tam olarak bunu iki şablonda istiyor: `veri-hikayesi` 60 px mavi kopya
// ızgarası, `dizin` 48 px sıcak milimetrik defter.
//
// ⚠ ⚠ **VE ÇİZİLMEK YETMEDİ: İLK SÜRÜM ΔL 0,002 ÖLÇTÜ.** Kurallar `.ust-gren`e konmuştu;
// o eleman `soft-light` karışıyor ve reçetenin kendi tablosu (reçete 0.1⑤) o kipin gölgelerde
// çöktüğünü zaten ölçmüştü — L=8'de σ 0,70. Yani %9,5 alfa ekranda 0,002 kaldı:
// **çizilmişti, yoktu.** Bu kapı tam olarak o durumu yakalar; "katman üretiliyor mu"
// diye sormaz, "ekranda kaç birim" diye sorar.
//
// ⚠ Ölçüm FAZ tabanlı ve MEDYANLI, çünkü "en parlak N satır" ölçütü `veri-hikayesi`de
// parlak bir panel bloğunu (y 1065–1319) çizgi sanıp gerçek kuralları hiç görmedi.
// Satırlar periyoda göre fazlara ayrılıyor, her fazın medyanı alınıyor: bir panel bloğu
// medyanı kaydıramaz.
//
// Ölçülen (`OLCUMLER.md`): kopya yatay 0,0817 · dikey 0,0738 · defter yatay 0,0892 ·
// dikey 0,0424 · **çizgisiz `kavis` 0,0051** — kontrol ölçümü, on altı kat pay.

import { describe, expect, it } from 'vitest'
import { withPage } from './browser.js'
import { ORNEKLER } from './katalog-ornek.js'
import { olcumBelgesi } from './olcum-belgesi.js'
import { panoramaHtml, type PanoramaBelgesi } from './panorama.js'
import { cizgiKatmanlari, YUZEYLER, type Yuzey } from './zemin.js'

type Ornek = (typeof ORNEKLER)[keyof typeof ORNEKLER]
const belge = (o: Ornek): PanoramaBelgesi => olcumBelgesi(o)

/** Çizgili zemin taşıyan şablonlar ve reçetenin verdiği periyot. */
const CIZGILI: Readonly<Record<string, number>> = { 'veri-hikayesi': 60, dizin: 48 }

/**
 * Görünürlük bandı. Alt uç bu fazın ölçülmüş görünürlük eşiği (ışık çalışmasında
 * ΔL 0,028 GÖRÜNMEZ çıkmıştı, 0,06 görünür); üst uç ise ızgaranın zemin olmaktan çıkıp
 * DESEN olduğu yer — yasaklı "html css deseni".
 */
const ALT = 0.06
const UST = 0.11
/** Çizgisiz bir yüzeyin okuyabileceği en yüksek değer — gürültü tavanı. */
const GURULTU = 0.02

// ⚠ ⚠ **TARAYICI KODU TS SABİTİNİ GÖRMEZ.** Periyot yer tutucuyla enjekte ediliyor;
// doğrudan yazmak `%PERIYOT%` metnini bırakır ve ölçüm sessizce çöker.
const OLCUM = `(async (b64, yon, periyot) => {
  const im = new Image()
  im.src = 'data:image/png;base64,' + b64
  await im.decode()
  const c = document.createElement('canvas')
  c.width = im.width; c.height = im.height
  const g = c.getContext('2d')
  g.drawImage(im, 0, 0)
  const d = g.getImageData(0, 0, c.width, c.height).data
  const n = yon === 'satir' ? c.height : c.width
  const m = yon === 'satir' ? c.width : c.height
  const prof = []
  for (let i = 0; i < n; i++) {
    let t = 0
    for (let j = 0; j < m; j++) {
      const px = yon === 'satir' ? (i * c.width + j) * 4 : (j * c.width + i) * 4
      t += 0.2126 * d[px] + 0.7152 * d[px + 1] + 0.0722 * d[px + 2]
    }
    prof.push(t / m)
  }
  const medyan = (a) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)] }
  const fazlar = []
  for (let f = 0; f < periyot; f++) {
    const dilim = []
    for (let i = f; i < prof.length; i += periyot) dilim.push(prof[i])
    fazlar.push(medyan(dilim))
  }
  const en = fazlar.indexOf(Math.max(...fazlar))
  const zemin = medyan(fazlar.filter((_, i) => i !== en))
  return (fazlar[en] - zemin) / 255
})`

/** Bir şablonun yatay ve dikey kural kontrastı — 0..1 luma farkı. */
const kuralKontrasti = async (o: Ornek, periyot: number): Promise<[number, number]> => {
  const doc = belge(o)
  const r = await withPage(async (page) => {
    await page.setViewportSize({ width: doc.slaytGenisligi, height: doc.yukseklik })
    await page.setContent(panoramaHtml(doc), { waitUntil: 'load' })
    await page.evaluate('(async () => { await document.fonts.ready; return true })()')
    const dikey = await page.screenshot({ clip: { x: 0, y: 0, width: 40, height: doc.yukseklik } })
    const yatay = await page.screenshot({
      clip: { x: 0, y: 0, width: doc.slaytGenisligi, height: 40 },
    })
    const s = (await page.evaluate(
      `${OLCUM}(${JSON.stringify(dikey.toString('base64'))}, 'satir', ${String(periyot)})`
    )) as number
    const k = (await page.evaluate(
      `${OLCUM}(${JSON.stringify(yatay.toString('base64'))}, 'sutun', ${String(periyot)})`
    )) as number
    return [s, k] as [number, number]
  })
  // Hata bir DEGERDIR (Result), kontrol akisi sicramasi degil: `throw` darbogazi
  // bu depoda tek dosyaya kilitli. Basarisizlik ASSERT olarak bildiriliyor.
  expect(r.ok, `olcum kosamadi: ${JSON.stringify(r.ok ? null : r.error)}`).toBe(true)
  return r.ok ? r.value : [0, 0]
}

describe('çizgili zemin', () => {
  it('yedi yüzey — çizgili ikili dağarcığa GİRDİ', () => {
    expect([...YUZEYLER].sort()).toEqual([
      'beton',
      'celik',
      'defter',
      'halftone',
      'kagit',
      'kopya',
      'tas',
    ])
  })

  // ⚠ Çizgi yalnız iki ailede. Üçüncü bir aile çizgi kazanırsa bu kapı söyler: çizgili
  // zemin bir SÜS değil bir kimlik, herkese verilirse kimseyi ayırmaz.
  it('kural katmanı YALNIZ `kopya` ve `defter`de', () => {
    for (const y of YUZEYLER) {
      const c = cizgiKatmanlari(y as Yuzey)
      expect(c !== null, `${y}: kural katmanı`).toBe(y === 'kopya' || y === 'defter')
      if (c !== null) expect(c.length, `${y}: iki eksen`).toBe(2)
    }
  })

  // ⚠ Reçete `veri-hikayesi` için *"12 px'lik ince alt ızgara EKLENMEYECEK — JPEG'te
  // moire yapar"* diyor. Periyot 24'ün altına inerse o uyarı çiğnenmiş olur.
  it('periyot moire bandının ÜSTÜNDE', () => {
    for (const y of ['kopya', 'defter'] as const) {
      const c = cizgiKatmanlari(y)
      expect(c).not.toBeNull()
      for (const k of c ?? []) {
        const m = /transparent 1px (\d+)px/.exec(k)
        expect(m, `${y}: adım okunamadı`).not.toBeNull()
        expect(Number(m?.[1] ?? 0), `${y}: adım moire bandında`).toBeGreaterThanOrEqual(24)
      }
    }
  })

  for (const [id, periyot] of Object.entries(CIZGILI)) {
    it(`${id} · kural ÇİZİLİYOR ve GÖRÜNÜYOR (periyot ${String(periyot)})`, async () => {
      const o = ORNEKLER[id]
      expect(o, `${id}: şablon yok`).toBeDefined()
      if (o === undefined) return
      const [yatay, dikey] = await kuralKontrasti(o, periyot)
      // ⚠ Yatay kural ASLA gizli eksen değil: iki şablonda da o baskın olan.
      expect(yatay, `${id}: yatay kural ΔL ${yatay.toFixed(4)}`).toBeGreaterThan(ALT)
      expect(yatay, `${id}: yatay kural DESEN olmuş`).toBeLessThan(UST)
      // ⚠ Dikey eksen `defter`de kasten zayıf (α×0,55): eşit olsaydı `kopya`dan
      // ayırt edilemezdi. Bu yüzden alt sınır yatayınkinin YARISI.
      expect(dikey, `${id}: dikey kural ΔL ${dikey.toFixed(4)}`).toBeGreaterThan(ALT / 2)
      expect(dikey, `${id}: dikey kural DESEN olmuş`).toBeLessThan(UST)
    }, 60_000)
  }

  // ⚠ ⚠ **KONTROL ÖLÇÜMÜ — bu olmadan yukarıdaki dört iddia hiçbir şey kanıtlamaz.**
  // Alet gürültüyü kural sanıyorsa çizgisiz bir şablon da geçerdi. `kavis` (beton, en
  // kaba doku, σ 14,9) kasten seçildi: gürültüyü kural sayan bir alet önce burada patlar.
  it('çizgisiz `kavis` kural OKUMUYOR — aletin kendi kapısı', async () => {
    const o = ORNEKLER['kavis']
    expect(o, 'kavis yok').toBeDefined()
    if (o === undefined) return
    const [yatay, dikey] = await kuralKontrasti(o, 60)
    expect(yatay, `kavis: yatay ${yatay.toFixed(4)} — alet gürültüyü kural sanıyor`).toBeLessThan(
      GURULTU
    )
    expect(dikey, `kavis: dikey ${dikey.toFixed(4)} — alet gürültüyü kural sanıyor`).toBeLessThan(
      GURULTU
    )
  }, 60_000)
})
