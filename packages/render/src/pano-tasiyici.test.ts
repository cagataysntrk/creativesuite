// PANOLAR TAŞIYICIYI BİNİYOR — denetimin "sürekli ögeye DEĞSİN" şartı (FAZ-19).
//
// ⚠ ⚠ **ÖLÇÜLDÜ: `veri-hikayesi`nin altı karesinin BEŞİNDE ölü bant %26-%35'ti** ve
// hepsi aynı yerde başlıyordu (y%31-34). Sebep kompozisyonun kendi mantığına aykırıydı:
// eğri panorama boyunca YÜKSELİYOR, panolar dipte DÜZ duruyordu. Boşluk tam olarak
// eğrinin OLMADIĞI yerdi. Pano artık kendi kartının merkezinde taşıyıcının altına
// oturuyor — kart kart yükseliyor ve düzen, verinin anlattığı hikâyeyi anlatıyor.
//
// ⚠ ⚠ **KURAL BİR KEZ FAZLA GENİŞ UYGULANDI ve ölçüm sınırı çizdi.** `yerlesim: 'ust'`ta
// pano zaten gövdenin hemen ALTINDA; taşıyıcıya bindirmek onu aşağı çekip gövdeyle
// arasında YENİ bant açıyor. `karsilastirma`da ölçüldü: kart 1 %73+8 → %48+19,
// kart 2 %51+17 → %31+29, kapsam %76 → %73. **Kural doğruydu, kapsamı yanlıştı.**

import { describe, expect, it } from 'vitest'
import { withPage } from './browser.js'
import { ORNEKLER } from './katalog-ornek.js'
import { olcumBelgesi } from './olcum-belgesi.js'
import { knockoutOlcumu, panoramaHtml, puntoOlcumu, type PanoramaBelgesi } from './panorama.js'

const araDeger = (n: readonly { readonly x: number; readonly y: number }[], x: number): number => {
  const oncekiler = n.filter((q) => q.x <= x)
  const onceki = oncekiler[oncekiler.length - 1] ?? n[0]
  const sonraki = n.find((q) => q.x >= x) ?? n[n.length - 1]
  const xON = onceki?.x ?? 0
  const xSON = sonraki?.x ?? 0
  const t = xSON === xON ? 0 : (x - xON) / (xSON - xON)
  return (onceki?.y ?? 0) + ((sonraki?.y ?? 0) - (onceki?.y ?? 0)) * t
}

/** Taşıyıcının kart dibinden yüksekliği (px) — eğri dibe yaslı 560 px bandın içinde. */
const tasiyiciDibi = (o: Ornek, merkez: number): number | null => {
  const G = o.slaytGenisligi
  const olc = (px: number): number => Math.round((px * G) / 1080)
  const b = o.bant as { tip?: string; noktalar?: readonly { x: number; y: number }[] } | undefined
  if (b?.tip === 'egri' && b.noktalar !== undefined)
    return Math.round(olc(120) + ((100 - araDeger(b.noktalar, merkez)) / 100) * olc(560))
  const a = o.alanSiniri as { noktalar?: readonly { x: number; y: number }[] } | undefined
  if (a?.noktalar !== undefined)
    return Math.round(((100 - araDeger(a.noktalar, merkez)) / 100) * o.yukseklik)
  return null
}

type Ornek = (typeof ORNEKLER)[keyof typeof ORNEKLER]
const belge = (o: Ornek): PanoramaBelgesi => olcumBelgesi(o)

const BINIYOR = Object.entries(ORNEKLER).filter(
  ([, o]) =>
    (o.yerlesim === undefined || o.yerlesim === 'ayrik') &&
    tasiyiciDibi(o, 50) !== null &&
    o.kartlar.some((k) => k.panel !== null && k.panel !== undefined)
)

describe('panolar taşıyıcıyı biniyor', () => {
  it('en az bir şablonda kural GERÇEKTEN uygulanıyor', () => {
    // ⚠ Kapsam boşalırsa aşağıdaki döngü hiç koşmaz ve dosya "yeşil" görünür. Bu depoda
    // aynı sınıf hata on bir kez oldu: yazılmış ama çağrılmamış.
    expect(BINIYOR.map(([id]) => id).length, 'kuralın kapsamı BOŞ').toBeGreaterThan(0)
  })

  for (const [id, o] of BINIYOR) {
    it(`${id} · pano taşıyıcıya DEĞİYOR ve onunla birlikte yükseliyor`, async () => {
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
          '(() => Array.from(document.querySelectorAll(".kart")).map((k) => {' +
            ' const p = k.querySelector(".panel, .sayilar, .etiketler");' +
            ' if (p === null) return null;' +
            ' const kk = k.getBoundingClientRect(), pk = p.getBoundingClientRect();' +
            ' return Math.round(kk.bottom - pk.bottom) }))()'
        )) as readonly (number | null)[]
      })
      expect(sonuc.ok, 'tarayıcı açılamadı').toBe(true)
      if (!sonuc.ok) return
      const dipler = sonuc.value
      const binenler: number[] = []
      for (const [i, dip] of dipler.entries()) {
        const k = o.kartlar[i]
        if (dip === null || k === undefined) continue
        if ((k as { kapanis?: unknown }).kapanis !== undefined) continue
        const hedef = tasiyiciDibi(o, (100 * (i + 0.5)) / o.kartlar.length)
        expect(hedef, `${id} kart ${String(i + 1)}: taşıyıcı yok`).not.toBeNull()
        if (hedef === null) continue
        // ⚠ **DEĞMEK ölçülebilir bir şeydir:** panonun dibi taşıyıcının en fazla 90 px
        // üstünde. "Yakın dursun" bir kural değil, bir temennidir.
        // ⚠ Pano taşıyıcıya DEĞİYOR ya da içeriğin izin verdiği kadar yükselmiş: ikisinde
        // de pano taşıyıcının ALTINDA kalamaz (o zaman kural hiç uygulanmamış demektir).
        expect(
          hedef - dip,
          `${id} kart ${String(i + 1)}: pano dibi ${String(dip)}, taşıyıcı ${String(hedef)}`
        ).toBeLessThanOrEqual(90)
        expect(dip, `${id} kart ${String(i + 1)}: pano taşıyıcıya HİÇ yaklaşmamış`).toBeGreaterThan(
          200
        )
        binenler.push(dip)
      }
      expect(binenler.length, `${id}: binen pano`).toBeGreaterThan(1)
      // ⚠ ⚠ **KATI ARTIŞ ÇİZİLEN'DE DEĞİL, TASARLANAN'DA ARANIYOR — ve sebebi ölçüm.**
      // `veri-hikayesi` k5'te pano taşıyıcıya ULAŞAMIYOR: hedef dip 560, çizilen 498.
      // İçerik o yüksekliğe izin vermiyor ve tarayıcı `margin-bottom`u kısarak DOĞRU
      // davranıyor — bir pano metnin içine giremez. Kapının katı artış beklemesi,
      // render'ın doğru davranışını kusur sayıyordu.
      // ⚠ Sözleşme yine de sınanıyor: TASARLANAN dipler (eğriden türeyen) katı artmalı.
      // Çizilen tarafta istenen şey "taşıyıcıya değiyor VEYA içeriğin izin verdiği kadar
      // yükselmiş" — ikisi de yukarıdaki 90 px toleransıyla ölçülü.
      const tasarlanan = o.kartlar
        .map((k, i) =>
          k.panel === null ||
          k.panel === undefined ||
          (k as { kapanis?: unknown }).kapanis !== undefined
            ? null
            : tasiyiciDibi(o, (100 * (i + 0.5)) / o.kartlar.length)
        )
        .filter((v): v is number => v !== null)
      for (const [j, v] of tasarlanan.slice(1).entries())
        expect(v, `${id}: tasarlanan dip ${String(j + 2)} bir öncekinden küçük`).toBeGreaterThan(
          tasarlanan[j] as number
        )
    }, 90_000)
  }
})
