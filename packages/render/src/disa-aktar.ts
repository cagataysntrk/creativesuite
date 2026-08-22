// Dışa aktarma — **kesintisiz tek görsel** ya da **dilimlenmiş slaytlar** (§7.1).
//
// ⚠ ⚠ **ÇIKTIYI ALMANIN TEK YOLU KOŞU DİZİNİNE GİRMEKTİ.** Panelde slaytlar
// görünüyordu ama indirilemiyordu; editörde hiç yoktu. Depo sahibi: *"hem koşu tarafında
// hem editörde çıktı alma seçeneği olmalı, hem seamless tek görsel olarak hem de
// bölümleyerek."*
//
// ⚠ **NE ZAMAN HANGİSİ — karar kullanıcının, ama bilgi bizim:**
//
//   · `dilim` + `png`  → Instagram/LinkedIn karoseli. Platform slayt slayt yükleme
//     istiyor ve PNG kayıpsız: tipografi kenarları temiz kalır. **Yayın için bu.**
//   · `dilim` + `jpg`  → aynı slaytlar. **Yalnız FOTOĞRAF taşıyan slaytta küçülüyor** ve
//     bu ölçüldü (D-318): palet düzleşince düz kadrajda PNG 148 KB, JPEG 209 KB çıktı —
//     yani "JPEG her zaman hafif" tavsiyesi tasarım değiştiği an yalan oldu. Fotoğraflı
//     kadrajda sıra tersine dönüyor. Metin kenarlarında hafif bozulma her hâlükârda var.
//   · `butun` + `png`  → tek geniş tuval. Kesintisizliği GÖRMEK için: kesimi aşan ögenin
//     gerçekten aktığı ancak burada anlaşılır. Platforma yüklenmez.
//   · `butun` + `pdf`  → tek geniş sayfa. Baskı ve sunum eki; vektör metin taşır, yani
//     yakınlaştırınca tipografi bulanmaz.
//   · `dilim` + `pdf`  → her slayt AYRI SAYFA. Müşteriye tek dosya göndermenin en temiz
//     yolu: sıra korunur, sayfa sayısı slayt sayısıdır.
//
// ⚠ Tek render motoru (R-30): hepsi aynı Chromium'dan çıkıyor. İkinci bir üretici
// (örneğin bir PDF kütüphanesi) ikinci bir tipografi hata modu demekti.

// ⚠ `Page` tipi `browser.ts`ten geliyor, `playwright`ten DEĞİL: `chokepoints` kapısı
// `playwright` import'unu tarayıcı başlatma girişimi sayıyor ve haklı — tarayıcıya
// erişimin tek kapısı o dosya olmalı (R-30 · D-24).
import { withPage, type BrowserResult, type Oturum, type Page } from './browser.js'
import { panoramaHtml, type PanoramaBelgesi } from './panorama.js'

export type DisaTarz = 'butun' | 'dilim'
export type DisaBicim = 'png' | 'jpg' | 'pdf'

export interface DisaParca {
  /** Dosya adı — sıra korunuyor: `slayt-01.png`. */
  readonly ad: string
  readonly bayt: Buffer
  readonly mime: string
}

/** Biçim → MIME. Tek yerde: iki liste bir gün ayrışır. */
const MIME: Record<DisaBicim, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  pdf: 'application/pdf',
}

export const disaMime = (b: DisaBicim): string => MIME[b]

/**
 * Yazdırma HTML'i — dilimlenmiş PDF için slaytları ALT ALTA dizer.
 *
 * ⚠ ⚠ **PANORAMA YATAY, PDF DİKEY SAYFALARDAN OLUŞUR.** Aynı belgeyi yan yana bırakıp
 * `page.pdf` çağırmak tek uzun bir sayfa verir; slayt başına sayfa isteyen bir çıktı
 * için sahne her slaytta kaydırılıp AYRI bir kutuya alınıyor ve kutular arasına sayfa
 * sonu konuyor.
 *
 * ⚠ Sahne KOPYALANMIYOR, KAYDIRILIYOR: aynı DOM'u N kez basmak fontları N kez yükler
 * ve gömülü görselleri N kez taşır — dört slaytlık bir belgede onlarca megabayt.
 */
const yazdirmaHtml = (doc: PanoramaBelgesi): string => {
  const n = doc.kartlar.length
  const ic = panoramaHtml(doc)
  const pencereler = Array.from(
    { length: n },
    (_, i) =>
      `<div class="sayfa"><div class="pencere" style="--kaydir:${-i * doc.slaytGenisligi}px">` +
      `<div class="ic">__ICERIK__</div></div></div>`
  ).join('')
  // ⚠ İçerik bir kez üretiliyor, N kez GÖMÜLMÜYOR: yer tutucu tek kopyayı işaret ediyor
  // ve `iframe`siz, `srcdoc`suz, tek belgede kalıyoruz.
  return (
    `<!doctype html><meta charset="utf-8"><style>` +
    `@page { size: ${doc.slaytGenisligi}px ${doc.yukseklik}px; margin: 0 }` +
    `html,body { margin:0; padding:0; background:#000 }` +
    `.sayfa { inline-size:${doc.slaytGenisligi}px; block-size:${doc.yukseklik}px; overflow:hidden;` +
    ` break-after:page; page-break-after:always }` +
    `.pencere { inline-size:${doc.slaytGenisligi}px; block-size:${doc.yukseklik}px; overflow:hidden }` +
    `.ic { transform: translateX(var(--kaydir)) }` +
    `</style>${pencereler.split('__ICERIK__').join(ic)}`
  )
}

/**
 * Belgeyi dışa aktarır. Dönen liste `dilim` + görsel biçiminde N parça, ötekilerde tek.
 *
 * ⚠ `throw` yok: hata bir DEĞERDİR (§8.6) ve çağıran onu bir sonuç olarak görüyor.
 */
export const panoramaDisaAktar = async (
  doc: PanoramaBelgesi,
  secim: { readonly tarz: DisaTarz; readonly bicim: DisaBicim },
  oturum?: Oturum
): Promise<BrowserResult<readonly DisaParca[]>> => {
  const n = doc.kartlar.length
  const toplam = doc.slaytGenisligi * n
  const calistir = <T>(fn: (page: Page) => Promise<T>): Promise<BrowserResult<T>> =>
    oturum === undefined ? withPage(fn) : oturum.sayfaIle(fn)

  return calistir(async (page) => {
    const hazirla = async (html: string, genislik: number): Promise<void> => {
      await page.setViewportSize({ width: genislik, height: doc.yukseklik })
      await page.setContent(html, { waitUntil: 'load' })
      await page.evaluate('(async () => { await document.fonts.ready; return true })()')
      // ⚠ Görsellerin ÇÖZÜLMESİ bekleniyor: `naturalWidth` 0 olan bir `<img>` ekran
      // görüntüsüne boş girer ve bu depoda bir kez tam olarak öyle oldu.
      await page.evaluate(
        `(async () => { await Promise.all(Array.from(document.images).map((i) => i.decode().catch(() => undefined))); return true })()`
      )
    }

    if (secim.tarz === 'dilim' && secim.bicim === 'pdf') {
      await hazirla(yazdirmaHtml(doc), doc.slaytGenisligi)
      const bayt = await page.pdf({
        width: `${doc.slaytGenisligi}px`,
        height: `${doc.yukseklik}px`,
        printBackground: true,
        pageRanges: `1-${n}`,
      })
      return [{ ad: 'karosel-slaytlar.pdf', bayt, mime: MIME.pdf }]
    }

    if (secim.tarz === 'butun') {
      await hazirla(panoramaHtml(doc), toplam)
      if (secim.bicim === 'pdf') {
        const bayt = await page.pdf({
          width: `${toplam}px`,
          height: `${doc.yukseklik}px`,
          printBackground: true,
          pageRanges: '1',
        })
        return [{ ad: 'karosel-kesintisiz.pdf', bayt, mime: MIME.pdf }]
      }
      const bayt = await page.screenshot({
        type: secim.bicim === 'jpg' ? 'jpeg' : 'png',
        ...(secim.bicim === 'jpg' ? { quality: 92 } : {}),
        clip: { x: 0, y: 0, width: toplam, height: doc.yukseklik },
      })
      return [
        {
          ad: `karosel-kesintisiz.${secim.bicim}`,
          bayt,
          mime: MIME[secim.bicim],
        },
      ]
    }

    // dilim + png/jpg: sahne kaydırılıp her slayt ayrı çekiliyor — `renderPanorama` ile
    // AYNI teknik. İkinci bir dilimleme yolu, iki farklı kesim demekti.
    await hazirla(panoramaHtml(doc), doc.slaytGenisligi)
    const parcalar: DisaParca[] = []
    for (let i = 0; i < n; i++) {
      await page.evaluate(
        `document.getElementById('sahne').style.transform = 'translateX(${-i * doc.slaytGenisligi}px)'`
      )
      const bayt = await page.screenshot({
        type: secim.bicim === 'jpg' ? 'jpeg' : 'png',
        ...(secim.bicim === 'jpg' ? { quality: 92 } : {}),
      })
      parcalar.push({
        ad: `slayt-${String(i + 1).padStart(2, '0')}.${secim.bicim}`,
        bayt,
        mime: MIME[secim.bicim],
      })
    }
    return parcalar
  })
}
