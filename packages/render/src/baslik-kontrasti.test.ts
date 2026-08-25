// BAŞLIK KONTRASTI — mürekkep, aksan ve göz kaşı, ARDINDAKİ yüzeye karşı (FAZ-19.10).
//
// ⚠ ⚠ **BU KAPI BİR KUSURDAN DEĞİL, İKİ ALETİN BİRBİRİNİ YALANLAMASINDAN DOĞDU.**
// `okuma-kontrasti` gövde ve liste metnini koruyor; BAŞLIK, GÖZ KAŞI ve DEV RAKAM
// kapsam dışıydı. Ölçmeye kalkınca iki yöntem de yalan söyledi:
//
//  1. **Yüzdelik yöntemi** (medyan = zemin varsayımı) `memphis`i **2,7** okudu. Sebep:
//     dev rakam kutusunda glif alanın YARIDAN fazlasını kaplıyor, medyan artık zemin
//     değil GLİF oluyor. Varsayım küçük metin için doğru, büyük metin için tersine dönüyor
//     — `okuma-kontrasti`nin seçicisi bu yüzden dar yazılmıştı.
//  2. **Analitik yöntem** (computed color) `akan-alan` kapağını **1,04** okudu. Sebep:
//     o başlığın rengi `rgba(0, 0, 0, 0)`; metin `background-clip: text` ile DEGRADEDEN
//     boyanıyor. Renk kutusunda okunacak bir şey yok.
//
// ⚠ ⚠ **DÜRÜST ALET İKİSİ DE DEĞİL: KUTU İKİ KEZ ÇEKİLİR — GÖRÜNÜR ve GİZLİ.** DEĞİŞEN
// piksel gliftir, DEĞİŞMEYEN zemindir. Degrade dolgulu knockout metinde de, dev rakamda
// da, SVG alan sınırının üstündeki metinde de çalışır; hiçbir model varsayımı taşımaz.
//
// ⚠ Glifin MEDYANI değil ÇEKİRDEĞİ okunur: değişen piksellerin çoğu kenar yumuşatma
// pikselidir ve ince tipografide medyan zemine doğru kayar — `editoryal` başlığı böyle
// **3,92** okumuştu, gerçeği **12,10**. Göz kenarı değil gövdeyi okur.
//
// ⚠ Alet çapraz doğrulandı: analitik yöntemin GEÇERLİ olduğu düz renkli başlıklarda iki
// yöntem aynı sayıyı veriyor (`memphis` 17–18, `alinti` 14,00, `editoryal` 12,10 ↔ 13,75).

import { describe, expect, it } from 'vitest'
import { withPage } from './browser.js'
import { ORNEKLER } from './katalog-ornek.js'
import { olcumBelgesi } from './olcum-belgesi.js'
import { knockoutOlcumu, metinMaskesi, panoramaHtml, puntoOlcumu } from './panorama.js'

/**
 * ⚠ ⚠ **AKSAN ALANI ÜZERİNDEKİ METİN AKSAN TABANINA TABİ.** Depo sahibi `sahne` k2 için
 * *"üstteki açık mavi aşırı cırtlak, koyu ile uyumsuz"* deyince alan doygun aksandan
 * alan dozuna çekildi; üstündeki knockout metin de artık alana göre SEÇİLİYOR. `alinti`
 * k2'de sonuç **6,70** — mürekkep tabanının (7) 0,3 altında ama aksan tabanının (4,5)
 * %49 üstünde. Kural burada fazla genişti: bir RENK ALANI okuma zemini değildir; büyük
 * başlık için WCAG'in kendi eşiği zaten 3,0. Kapsam yapıdan türüyor (kart `aksan-alan`
 * taşıyor VE öge alanın dibinin üstünde), addan değil.
 */

/**
 * Rol tabanları — ÜÇÜ DE ÖLÇÜLDÜ, hiçbiri tahmin değil.
 *
 * ⚠ ⚠ **İLK YAZILAN 11 TABANI YANLIŞTI VE SEBEBİ ÖĞRETİCİ.** Faz maddesi *"bg/ink ≥12"*
 * diyordu; ölçülen mürekkep kümesi 12,10–18,48 görünüyor, aksan kümesi 4,90–9,64
 * görünüyordu ve 11 ikisini temiz ayırıyordu. Ama o ayrım SAHTEYDİ: jeton probu
 * `document.body`ye ekleniyordu, oysa palet KARTA bağlı — `kavis`in mürekkep başlığı
 * "aksan" sanılıp kümenin dışında kalmıştı. Prob kartın içine alınınca gerçek görüldü:
 * `kavis` başlıkları jetonla BİREBİR mürekkep (`oklch(0.95 0.006 75)`) ve **7,99–8,65**
 * okuyor. Yani iki küme aslında ayrık değil; 11 tabanı ölçüme değil ölçüm HATASINA
 * dayanıyordu.
 *
 * ⚠ MÜREKKEP TABANI 7 — WCAG **AAA** sayısı. Başlık büyük metindir ve AA'sı 3,0'dır;
 * katalogdaki en düşük mürekkep başlığı **7,99** olduğu için kapı gereğinin iki katından
 * fazlasını tutuyor. Pay %12,4.
 * ⚠ AKSAN TABANI 4,5 — WCAG AA; ölçülen en düşük **4,90**, pay %8,9.
 * ⚠ GÖZ KAŞI TABANI 4,2 — `okuma-kontrasti` ile AYNI sayı (aynı sınıf metin, aynı eşik);
 *   ölçülen en düşük **4,74**, pay %12,9.
 */
const TABAN = { ink: 7, aksan: 4.5, soluk: 4.2 }

/** Glifin kutuda kaplayabileceği en büyük pay — üstü "metin değil yüzey" demektir. */
const KAPLAMA_TAVANI = 0.7

const KUTULAR = `(() => {
  // ⚠ ⚠ **JETON KARTIN ICINDE OLCULUR.** Ilk surum probu document.body'ye ekliyordu ve
  // her kartin KENDI paleti oldugu icin aksan basligini "murekkep" saniyordu: bes deste
  // birden yalanci kirmizi dondu. Palet karta bagliysa prob da karta bagli olmali.
  const cv = document.createElement('canvas')
  cv.width = 1; cv.height = 1
  const cx = cv.getContext('2d', { willReadFrequently: true })
  const lin = (c) => { const x = c / 255
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4) }
  const oku = (kart, v) => {
    const p = document.createElement('span')
    p.style.color = 'var(' + v + ')'
    kart.appendChild(p)
    const renk = getComputedStyle(p).color
    p.remove()
    cx.clearRect(0, 0, 1, 1)
    cx.fillStyle = '#000'
    cx.fillStyle = renk
    cx.fillRect(0, 0, 1, 1)
    const d = cx.getImageData(0, 0, 1, 1).data
    return 0.2126 * lin(d[0]) + 0.7152 * lin(d[1]) + 0.0722 * lin(d[2])
  }
  const out = []
  document.querySelectorAll('.kart').forEach((k, i) => {
    const ink = oku(k, '--kart-metin'), aksan = oku(k, '--kart-aksan')
    k.querySelectorAll('.ust-baslik, .baslik, .kapanis-rakam').forEach((e) => {
      const b = e.getBoundingClientRect()
      if (b.width < 8 || b.height < 8) return
      e.setAttribute('data-olc', String(out.length))
      // AKSAN ALANININ USTUNDE Mi: kart aksan-alan tasiyorsa ve ogenin dibi alanin
      // dibinden yukarida kaliyorsa, o metin okuma zemininde degil AKSANIN uzerinde.
      const dibiYuzde = parseFloat(getComputedStyle(k).getPropertyValue('--aksan-dibi'))
      const alandaMi = k.classList.contains('aksan-alan') && Number.isFinite(dibiYuzde) &&
        (b.bottom - k.getBoundingClientRect().top) <= k.getBoundingClientRect().height * dibiYuzde / 100 + 8
      out.push({ k: i + 1, c: e.className.split(' ')[0], ink: ink, aksan: aksan, alandaMi: alandaMi,
                 x: Math.round(b.left), y: Math.round(b.top),
                 w: Math.round(b.width), h: Math.round(b.height) })
    })
  })
  return out
})()`

const cozumle = (gorunur: string, gizli: string, kutular: unknown) =>
  `(async () => {
      const yukle = async (b64) => {
        const im = new Image()
        im.src = 'data:image/png;base64,' + b64
        await im.decode()
        const cv = document.createElement('canvas')
        cv.width = im.width; cv.height = im.height
        const cx = cv.getContext('2d', { willReadFrequently: true })
        cx.drawImage(im, 0, 0)
        return cx
      }
      const A = await yukle('${gorunur}')
      const B = await yukle('${gizli}')
      const lin = (c) => { const x = c / 255
        return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4) }
      const L = (d, i) => 0.2126 * lin(d[i]) + 0.7152 * lin(d[i + 1]) + 0.0722 * lin(d[i + 2])
      return ${JSON.stringify(kutular)}.map((v) => {
        const da = A.getImageData(v.x, v.y, v.w, v.h).data
        const db = B.getImageData(v.x, v.y, v.w, v.h).data
        const glif = [], zem = []
        for (let i = 0; i < da.length; i += 4) {
          const la = L(da, i), lb = L(db, i)
          if (Math.abs(la - lb) > 0.02) glif.push(la); else zem.push(lb)
        }
        const kap = glif.length / (glif.length + zem.length)
        if (glif.length < 20 || zem.length < 20) return { k: v.k, c: v.c, kap, o: null, rol: null }
        zem.sort((x, y) => x - y)
        const z = zem[Math.floor(zem.length / 2)]
        // Glifin CEKIRDEGI: zeminden en uzak yondeki dilim. Kenar yumusatma pikseli
        // gorunur ama OKUNMAZ; goz govdeyi okur.
        glif.sort((x, y) => x - y)
        const alt = glif[Math.floor(glif.length * 0.1)]
        const ust = glif[Math.floor(glif.length * 0.9)]
        const g = Math.abs(alt - z) > Math.abs(ust - z) ? alt : ust
        // Rol, RENK KUTUSUNDAN degil OLCULEN luminanstan: degrade dolgulu knockout
        // metinde computed color saydamdir ve siniflandirma orada coker.
        // GOZ KASI rolunu ELEMANDAN alir: soluk jetonunun luminansi murekkep jetonuna
        // yakin dustugu icin luminans siniflandirmasi onu "murekkep" sanip 11 tabani
        // uyguluyordu. Rol belliyse tahmin etme.
        // AKSAN ALANI UZERINDEKI metin AKSAN baglaminda okunur: o yuzey okuma zemini
        // degil, aksanin kendisidir. Tabani da aksan tabani (WCAG AA 4,5) — murekkep
        // tabani (AAA 7) bir RENK ALANI icin fazla genis yazilmis olurdu.
        if (v.alandaMi) return { k: v.k, c: v.c, kap, rol: 'aksan',
          o: (Math.max(g, z) + 0.05) / (Math.min(g, z) + 0.05) }
        if (v.c === 'ust-baslik') return { k: v.k, c: v.c, kap, rol: 'soluk',
          o: (Math.max(g, z) + 0.05) / (Math.min(g, z) + 0.05) }
        const rol = Math.abs(g - v.aksan) < Math.abs(g - v.ink) ? 'aksan' : 'ink'
        return { k: v.k, c: v.c, kap, rol, o: (Math.max(g, z) + 0.05) / (Math.min(g, z) + 0.05) }
      })
    })()`

describe('başlık kontrastı', () => {
  for (const [id, o] of Object.entries(ORNEKLER)) {
    it(`${id} · başlık ve göz kaşı ARDINDAKİ yüzeye karşı okunuyor`, async () => {
      const doc = olcumBelgesi(o)
      const cekim = await withPage(async (page) => {
        await page.setViewportSize({ width: doc.slaytGenisligi, height: doc.yukseklik })
        await page.setContent(panoramaHtml(doc), { waitUntil: 'load' })
        await page.evaluate('(async () => { await document.fonts.ready; return true })()')
        // ⚠ Panorama AÇILIYOR: kaydırılmış sahnede sonraki kareler kadraj dışında kalır ve
        // ölçüm tek renk okur — `okuma-kontrasti` bu tuzağa düşüp on desteyi de yalancı
        // kırmızı yapmıştı.
        await page.evaluate(
          '(() => { const s = document.querySelector("#sahne");' +
            ' s.style.transform = "none"; document.body.style.width = s.style.width })()'
        )
        await page.setViewportSize({
          width: doc.slaytGenisligi * o.kartlar.length,
          height: doc.yukseklik,
        })
        // ⚠ ÜÇ SAYFA ADIMI SIRAYLA — punto oturmadan ölçülen düzen yayınlanmayan düzendir.
        await page.evaluate(puntoOlcumu(doc))
        await page.evaluate(knockoutOlcumu())
        await page.evaluate(metinMaskesi())
        const kutular = await page.evaluate(KUTULAR)
        const gorunur = (await page.screenshot({ fullPage: false })).toString('base64')
        await page.evaluate(
          '(() => { document.querySelectorAll("[data-olc]")' +
            '.forEach((e) => { e.style.visibility = "hidden" }) })()'
        )
        const gizli = (await page.screenshot({ fullPage: false })).toString('base64')
        return { kutular, gorunur, gizli }
      })
      expect(cekim.ok, `${id}: çekim koşamadı`).toBe(true)
      if (!cekim.ok) return
      const olcum = await withPage(async (page) => {
        return (await page.evaluate(
          cozumle(cekim.value.gorunur, cekim.value.gizli, cekim.value.kutular)
        )) as { k: number; c: string; kap: number; rol: string | null; o: number | null }[]
      })
      expect(olcum.ok, `${id}: piksel çözümü koşamadı`).toBe(true)
      if (!olcum.ok) return
      expect(olcum.value.length, `${id}: hiç başlık kutusu bulunamadı`).toBeGreaterThan(0)

      // ── ALET SINANIYOR: fark hiç piksel bulmuyorsa aşağıdaki yeşil bedavadır ────
      // Bu fazda "ihlal yok" sonucu ÜÇ kez aletin körlüğünden geldi.
      const kor = olcum.value
        .filter((x) => x.o === null || x.kap <= 0 || x.kap > KAPLAMA_TAVANI)
        .map((x) => `k${String(x.k)} ${x.c} %${String(Math.round(x.kap * 100))}`)
      expect(
        kor.join(' · '),
        `${id}: ölçüm aleti körelmiş — görünür/gizli farkı metin bulamıyor ya da ` +
          'kutunun tamamını metin sanıyor; bu hâlde kontrast sayısı hiçbir şey anlatmaz'
      ).toBe('')

      const dusuk = olcum.value
        .filter((x) => x.o !== null && x.rol !== null && x.o < TABAN[x.rol as keyof typeof TABAN])
        .map((x) => `k${String(x.k)} ${x.c} ${x.rol ?? ''} ${(x.o ?? 0).toFixed(2)}`)
      expect(
        dusuk.join(' · '),
        `${id}: başlık ardındaki yüzeye karşı rol tabanının altında ` +
          `(mürekkep ${String(TABAN.ink)} · aksan ${String(TABAN.aksan)} · ` +
          `soluk ${String(TABAN.soluk)}) — okunmayan başlık, yazılmamış başlıktır`
      ).toBe('')
    }, 90_000)
  }
})
