// KAPANIŞ KARTI — deste "içerik bitti" değil "VARDIK" demeli (FAZ-19 · denetim).
//
// ⚠ ⚠ **MEKANİZMA KODDA VARDI, KATALOGDA SIFIR ÇAĞIRANI.** `kapanis` tipi, işaretlemesi
// ve CSS'i `panorama.ts`te duruyordu; on şablonun HİÇBİRİ kullanmıyordu. Bu depoda on
// birinci kez aynı sınıf: modül yazılır, testi yeşildir, üretim yolunda çağıranı olmaz
// (D-182 · D-190 · D-224 · D-250 · D-261 · D-270 · D-347). Bu kapının ilk işi o zinciri
// bağlamak: her destenin SON kartı kapanış taşıyor mu.
//
// ⚠ ⚠ **SIRA ÖLÇÜMDEN GELİYOR.** İmza tek başına eklendiğinde `sahne`nin son karesi
// %2,2'den yalnız %8,0'e çıktı ve bunun %7,6'sı RAKAMDAN, %0,4'ü işaretten geldi.
// Kapanışı taşıyan şey imza değil, VARILAN SAYIdır — bu yüzden rakam işaretten önce.
//
// ⚠ ⚠ **RAKAM SABİT PUNTOYLA YAZILDI VE KESİLDİ.** 458 px'te iki hane 506 px yer istiyor,
// `sahne`nin sağ kolonu 454 px: rakam kadrajın dışına taştı — yani tam da bu fazın
// kapatmaya çalıştığı *"çizgiler yazıyı kesiyor"* kusuru. Punto artık kolondan
// hesaplanıyor; bu kapı taşmanın geri gelmediğini sınıyor.

import { describe, expect, it } from 'vitest'
import { withPage } from './browser.js'
import { ORNEKLER } from './katalog-ornek.js'
import { olcumBelgesi } from './olcum-belgesi.js'
import { knockoutOlcumu, panoramaHtml, puntoOlcumu, type PanoramaBelgesi } from './panorama.js'

// ⚠ Archivo 700 + `-0.045em`: ÖLÇÜLDÜ (`rakam-en.mjs`), tahmin edilmedi.
const KAPAK_ORANI = 0.705
const KAPAK_TABANI = 240
const KAPAK_TAVANI = 360

type Ornek = (typeof ORNEKLER)[keyof typeof ORNEKLER]
const belge = (o: Ornek): PanoramaBelgesi => olcumBelgesi(o)

describe('kapanış kartı', () => {
  // ⚠ ⚠ **ZİNCİR TESTİ.** Yeni bir şablon kapanışsız eklenirse burası söyler. Bir
  // şablonun kapanışı YOKSA destenin son karesi yine destenin en boş karesi olur ve
  // denetimin şikâyeti geri gelir — sessizce.
  it('on destenin ONUNDA da SON kart kapanış taşıyor', () => {
    const eksik = Object.entries(ORNEKLER).filter(([, o]) => {
      const son = o.kartlar[o.kartlar.length - 1] as { kapanis?: { rakam?: string } } | undefined
      return son?.kapanis?.rakam === undefined
    })
    expect(
      eksik.map(([id]) => id),
      'kapanışsız şablon'
    ).toEqual([])
  })

  // ⚠ Kapanış SONDADIR: ortadaki bir karta konursa "varış" anlamını kaybeder ve deste
  // iki kez kapanır. Bir kural, ihlalinin ölçülebildiği yerde kuraldır.
  it('kapanış YALNIZ son kartta', () => {
    const yanlis: string[] = []
    for (const [id, o] of Object.entries(ORNEKLER))
      o.kartlar.slice(0, -1).forEach((k, i) => {
        if ((k as { kapanis?: unknown }).kapanis !== undefined)
          yanlis.push(`${id}#${String(i + 1)}`)
      })
    expect(yanlis, 'son kart olmayan yerde kapanış').toEqual([])
  })

  // ⚠ ⚠ **KAPANIŞ KARTI FOTOĞRAF TAŞIMAZ ve bu bir KOLAYLIK DEĞİL, ÖLÇÜLMÜŞ bir karar.**
  // Kapanış gövdeyi yukarı itiyor (rakama yer açmak için); `donen`de gövde tam o
  // yükseklikte duran görselin üstüne bindi (%47) ve `memphis`te aynı şey %19 oldu.
  // ⚠ Önce metin kolonunu görsele kadar DARALTMAK denendi ve daha kötü çıktı: `memphis`in
  // gövdesi dört satıra sardı, kart TAŞTI ve çağrı rayın altında kesildi. Varış
  // tipografiktir; fotoğraf rakamla aynı karede yarışıyor.
  // ⚠ ⚠ **KURAL ÖNCE FAZLA GENİŞ YAZILDI ve kendi kapısı düzeltti.** İlk hâli *"kapanış
  // kartında fotoğraf olmaz"* diyordu; `editoryal`i kırmızıya çevirdi. Oysa `editoryal`in
  // görseli tuval boyunca uzanan bir KOLON ŞERİDİ (y0-93) ve metnin girmediği bir bantta
  // duruyor — çarpışmıyor, `metin-gorsel-cakisiyor` da temiz. İki dakika önce yazdığım bir
  // kural uğruna çalışan bir kompozisyonu silmek, tam da "sessiz düzeltme" olurdu.
  // ⚠ Ölçümün DESTEKLEDİĞİ ayrım şu: kapanış kartında **yüzen kesik özne** olmaz; tam boy
  // şerit olur. Üç vakanın üçü de bunu söylüyor —
  //   `donen` y23-77 kesik → gövdenin %47'si üstüne bindi → kaldırıldı
  //   `memphis` y53-93 kesik → %19 → kaldırıldı
  //   `editoryal` y0-93 tam şerit → çakışma yok → DURUYOR
  // Kesimi AŞAN görsel de muaf: o, önceki kartın sürekliliğidir.
  it('kapanış kartında YÜZEN kesik özne yok — tam boy şerit serbest', () => {
    const yanlis: string[] = []
    for (const [id, o] of Object.entries(ORNEKLER)) {
      const n = o.kartlar.length
      const sol = (100 * (n - 1)) / n
      for (const g of o.gorseller ?? [])
        if (g.x > sol && g.x + g.genislik <= 100.001 && !(g.y <= 5 && g.yukseklik >= 90))
          yanlis.push(`${id}: x%${String(g.x)} y%${String(g.y)}+${String(g.yukseklik)}`)
    }
    expect(yanlis, 'kapanış kartında yüzen kesik özne').toEqual([])
  })

  for (const [id, o] of Object.entries(ORNEKLER)) {
    it(`${id} · varış rakamı kolonuna sığıyor, kapak boyu ölçüde, imzadan ÖNCE`, async () => {
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
        // ⚠ ⚠ **PUNTO OTURTMA ADIMI ÖLÇÜMÜN PARÇASI — üretim onu HER ekran görüntüsünden
        // önce koşuyor (`panoramaCiz`).** Atlayan bir kapı, yayınlanmayan bir düzeni ölçer:
        // `memphis`te metin dibi oturtmasız y%26, oturtmalı **y%51**. Kapı ile üretim aynı
        // düzeni görmüyorsa kapı hiçbir şey kanıtlamıyordur.
        await page.evaluate(puntoOlcumu(belge(o)))
        // ⚠ Knockout PUNTODAN SONRA: maske kutunun SON hâlini ölçmek zorunda.
        await page.evaluate(knockoutOlcumu())
        return (await page.evaluate(
          '(() => {' +
            ' const r = document.querySelector(".kapanis-rakam");' +
            ' if (r === null) return null;' +
            ' const kart = r.closest(".kart");' +
            ' const kk = kart.getBoundingClientRect(), rk = r.getBoundingClientRect();' +
            ' const im = r.closest(".kapanis").querySelector(".kapanis-isaret, .kapanis-cagri");' +
            ' const imk = im === null ? null : im.getBoundingClientRect();' +
            ' return { sol: rk.left - kk.left, sag: kk.right - rk.right,' +
            '   punto: parseFloat(getComputedStyle(r).fontSize),' +
            '   kartEni: kk.width, imzaUstu: imk === null ? null : imk.top - kk.top,' +
            '   rakamAlti: rk.bottom - kk.top } })()'
        )) as {
          sol: number
          sag: number
          punto: number
          kartEni: number
          imzaUstu: number | null
          rakamAlti: number
        } | null
      })
      expect(sonuc.ok, 'tarayıcı açılamadı').toBe(true)
      if (!sonuc.ok) return
      const v = sonuc.value
      expect(v, `${id} kapanış rakamı çizilmemiş`).not.toBeNull()
      if (v === null) return
      // ⚠ Taşma: rakamın sağ kenarı kartın içinde kalmalı. Negatif `sag` = KESİLMİŞ.
      expect(v.sag, `${id} rakam kartın sağından ${String(-v.sag)} px taşıyor`).toBeGreaterThan(0)
      expect(v.sol, `${id} rakam kartın solundan taşıyor`).toBeGreaterThanOrEqual(0)
      const kapak = v.punto * KAPAK_ORANI
      expect(kapak, `${id} kapak boyu ${kapak.toFixed(0)} px`).toBeGreaterThanOrEqual(KAPAK_TABANI)
      expect(kapak, `${id} kapak boyu ${kapak.toFixed(0)} px`).toBeLessThanOrEqual(KAPAK_TAVANI)
      // ⚠ Rakam imzadan ÖNCE: ölçüm bu sırayı dayattı (yukarıdaki not).
      if (v.imzaUstu !== null)
        expect(v.rakamAlti, `${id} imza rakamın üstünde`).toBeLessThanOrEqual(v.imzaUstu + 4)
    }, 90_000)
  }
})
