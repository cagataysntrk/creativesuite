// ALAN SINIRI METNİ KESMİYOR — iki renk alanı arasındaki çizgi bir yazının içinden geçemez.
//
// ⚠ ⚠ **BU KUSURU HİÇBİR KAPI YAKALAMADI, GÖZ YAKALADI.** `alinti`nin mürekkep alanı
// büyütüldüğünde (sınır 94→72'den 78→62'ye) ölçüm İYİ çıktı — ölü bant %26'dan %10'a,
// kapsam %56'dan %66'ya. Sonra çizilene bakıldı: sınır kapanış kartının içinden geçiyor,
// dev "01" rakamının altı ve marka işareti koyu alanın üstünde kayboluyordu.
// `sus-metni` süs ögelerini ölçüyor, **alan sınırını değil**.
//
// ⚠ ⚠ **SEBEP KÖKTE ve yorumu bile yanlış varsayımı yazıyor:** `kartinZemini` *"iki alanlı
// zeminde metin ÜST alanın üstünde duruyor (kartlar üste yaslı)"* diyor ve rengi oradan
// türetiyor. `alinti` `yerlesim: 'orta'`, kapanış bloğu ise `margin-top: auto` ile DİBE
// yaslı: ikisi de o varsayımı çürütüyor. Metin rengi altındaki alanı takip etmediği sürece
// sınır, metnin bandına giremez.
//
// ⚠ Sınır GEOMETRİDEN örnekleniyor, `getBBox`tan değil: bbox panoramanın tamamına yayılır
// ve her kartı "kesiliyor" gösterirdi (aynı hata `olu-bant`ta bir kez yapıldı).

import { describe, expect, it } from 'vitest'
import { withPage } from './browser.js'
import { ORNEKLER } from './katalog-ornek.js'
import { olcumBelgesi } from './olcum-belgesi.js'
import { panoramaHtml, puntoOlcumu, type PanoramaBelgesi } from './panorama.js'

type Ornek = (typeof ORNEKLER)[keyof typeof ORNEKLER]
const belge = (o: Ornek): PanoramaBelgesi => olcumBelgesi(o)

// ⚠ ⚠ **YAPRAK ÖGELER, KAPSAYICI DEĞİL.** İlk sürüm `.panel` ve `.kapanis`i ölçtü ve
// dördünü birden kırmızıya çevirdi: `.kapanis` y652-1250 arası bir flex KUTUSU ve
// çocukları arasındaki boşluktan geçen bir sınır kusur değil. Kapsayıcıyı ölçmek,
// "kesiyor" ile "aralarından geçiyor"u ayırt edemez.
const SEC =
  '.ust-baslik,.baslik,.govde,.etiket,.liste-satir,.cubuk-satir,.sayi-kart,' +
  '.panel-baslik,.vafel,.kapanis-rakam,.kapanis-rakam-alt,.kapanis-cagri,.kapanis-isaret'

// ⚠ Pay 0 DEĞİL: sınır bir yazının 6 px yakınından geçiyorsa da onu kesiyor sayılır.
// Sıfır pay, "teknik olarak değmiyor ama okunmuyor" vakasını kaçırırdı.
const PAY = 6

const OLC = `(() => {
  const svg = document.querySelector('svg.alan-siniri')
  if (svg === null) return []
  // ⚠ Konturlu yol SINIRIN kendisi; dolgu yolları ALANLARDIR. Sınırı arıyoruz.
  const yollar = Array.from(svg.querySelectorAll('path')).filter(
    (p) => getComputedStyle(p).stroke !== 'none'
  )
  if (yollar.length === 0) return []
  const ctm = yollar[0].getScreenCTM()
  if (ctm === null) return []
  const L = yollar[0].getTotalLength()
  const nokta = []
  for (let i = 0; i <= 1600; i++) {
    const p = yollar[0].getPointAtLength((i / 1600) * L)
    nokta.push([p.x * ctm.a + p.y * ctm.c + ctm.e, p.x * ctm.b + p.y * ctm.d + ctm.f])
  }
  // KURAL KESISMEYE DEGIL OKUNABILIRLIGE BAGLI (R-98: bu blok sablon degismezinin
  // ICINDE, ters tirnak yazilamaz).
  //
  // Ilk surum "sinir metni kesiyorsa kusur" dedi ve DORT sablonu birden sucladi. Olcum
  // ayirdi: kesilen yazinin IKI alanda da okunmasi yetiyor.
  //   akan-alan k6 rakam      dL 0,845 / 0,590  okunuyor
  //   editoryal  k1-k4        dL 0,795 / 0,810  okunuyor (iki alan da acik gri)
  //   karsilastirma k4 rakam  dL 0,845 / 0,680  okunuyor (iki alan da koyu)
  //   alinti k3 marka isareti dL 0,795 / 0,000  ALT ALANDA GORUNMEZ
  // Tek gercek kusur sonuncusu ve gozun yakaladigi da oydu. Esik 0,30: en yakin gercek
  // vakadan (0,590) iki kat uzakta.
  //
  // Ilk surum ayrica dolguyu rgb sanip oklch'i 255'e boldu ve HERKESI gecti. Sessizce
  // her seyi gecen bir kapi, kapi degildir.
  // oklch VE oklab: ikisinde de L ilk sayi. Ilk surum yalniz oklch biliyordu ve
  // oklab(0.95 ... / 0.62) sayisal yedege dusup 0,95'i RGB sandi: uc SAHTE kusur
  // uretti (kasten sessiz etiketler). Bu kapinin dorduncu alet hatasi.
  const acikligi = (c) => {
    for (const ad of ['oklch(', 'oklab(']) {
      const k = c.indexOf(ad)
      if (k >= 0) return Number(c.slice(k + ad.length).split(' ')[0])
    }
    const sayi = c.replace(/[^0-9.]+/g, ' ').trim().split(' ').map(Number)
    if (sayi.length < 3) return null
    const d = sayi.slice(0, 3).map((v) => { const x = v / 255
      return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4) })
    return 0.2126 * d[0] + 0.7152 * d[1] + 0.0722 * d[2]
  }
  // ALFA GORMEZDEN GELINEMEZ: %62 opak bir etiket zemine karisiyor ve algilanan fark
  // tam olarak alfa katsayisi kadar kuculuyor. Bileske L = a*metin + (1-a)*alan, yani
  // |bileske - alan| = a * |metin - alan|. Kural sessiz etiketi susturmuyor, olcuyor.
  const alfasi = (c) => {
    const k = c.lastIndexOf('/')
    if (k < 0) return 1
    const v = Number(c.slice(k + 1).replace(')', '').trim())
    return isNaN(v) ? 1 : v
  }
  const ISIK = Array.from(svg.querySelectorAll('rect, path'))
    .filter((p) => getComputedStyle(p).fill !== 'none')
    .map((p) => acikligi(getComputedStyle(p).fill))
    .filter((v) => v !== null && !isNaN(v))
  if (ISIK.length < 2) return ['iki alan okunamadi: ' + ISIK.length + ' dolgu']
  const gorselIsigi = (img) => {
    const c = document.createElement('canvas')
    c.width = 64; c.height = 64
    const x = c.getContext('2d')
    if (x === null) return null
    try { x.drawImage(img, 0, 0, 64, 64) } catch (e) { return null }
    let d
    try { d = x.getImageData(0, 0, 64, 64).data } catch (e) { return null }
    let toplam = 0, adet = 0
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] < 40) continue
      const g = [d[i], d[i + 1], d[i + 2]].map((v) => { const t = v / 255
        return t <= 0.03928 ? t / 12.92 : Math.pow((t + 0.055) / 1.055, 2.4) })
      toplam += 0.2126 * g[0] + 0.7152 * g[1] + 0.0722 * g[2]
      adet++
    }
    return adet === 0 ? null : toplam / adet
  }
  const kusur = []
  Array.from(document.querySelectorAll('.kart')).forEach((k, i) => {
    for (const el of k.querySelectorAll(%SEC%)) {
      const r = el.getBoundingClientRect()
      if (r.width < 4 || r.height < 4) continue
      const icinde = nokta.filter(
        (n) => n[0] >= r.left && n[0] <= r.right && n[1] >= r.top - %PAY% && n[1] <= r.bottom + %PAY%
      )
      // HER OGE, USTUNDE DURDUGU ALANA KARSI OLCULUYOR (R-98: sablon degismezi ICINDE,
      // ters tirnak yok). Ilk surum yalniz SINIRIN KESTIGI ogeleri denetledi ve kendi
      // yazdigim bir gerilemeyi goremedi: kapanis blogunun tamami alt alanin rengini
      // alinca dev rakam ACIK alanda ACIK kaldi, ama sinir onu kesmedigi icin kapi
      // yesildi. Bir kapinin gormedigi yer, bir sonraki kusurun sakland1g1 yerdir.
      const merkezX = (r.left + r.right) / 2
      const merkezY = (r.top + r.bottom) / 2
      let sinirY = null
      for (const nk of nokta)
        if (sinirY === null || Math.abs(nk[0] - merkezX) < Math.abs(sinirY[0] - merkezX)) sinirY = nk
      const altta = sinirY !== null && merkezY > sinirY[1]
      // GORSELIN MURKEBI color OZELLIGINDEN OKUNMAZ (R-98: bu blok sablon degismezinin
      // ICINDE, ters tirnak yazilamaz). Marka isareti bir <img>; color onun devraldigi
      // METIN rengi ve goruntuyle ilgisi yok. Ilk surum bunu olctu ve renderer
      // duzeltildikten SONRA bile kirmizi kaldi: kapi yanlis ozelligi okuyordu.
      //
      // Ikinci deneme varyanti ADINDAN tahmin etti (token adinda ink- geciyor mu) ve
      // akan-alan'i kacirdi: onun alt alani murekkep-alan. Tahmin yerine GORSELIN KENDI
      // pikselleri olculuyor: saydam olmayan piksellerin ortalama isigi.
      const metin = el.tagName === 'IMG' ? gorselIsigi(el) : acikligi(getComputedStyle(el).color)
      if (metin === null || isNaN(metin)) continue
      // Kesilen oge IKI alana karsi, kesilmeyen yalniz USTUNDE DURDUGU alana karsi.
      const alanlar = icinde.length > 0
        ? ISIK
        : [altta ? Math.min.apply(null, ISIK) : Math.max.apply(null, ISIK)]
      const a = el.tagName === 'IMG' ? 1 : alfasi(getComputedStyle(el).color)
      const enYakin = Math.min.apply(null, alanlar.map((v) => a * Math.abs(metin - v)))
      if (enYakin < 0.30)
        kusur.push(
          'kart ' + (i + 1) + ' · ' + el.className.split(' ')[0] + ' ' +
          (icinde.length > 0 ? 'sinirin kestigi alanda' : (altta ? 'ALT' : 'UST') + ' alanda') +
          ' okunmuyor (dL ' + enYakin.toFixed(3) + ')'
        )
    }
  })
  return kusur
})()`

const kesenler = async (o: Ornek): Promise<readonly string[]> => {
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
    // ⚠ Punto oturtma ölçümün parçası — üretim onu her karede koşuyor.
    await page.evaluate(puntoOlcumu(belge(o)))
    return (await page.evaluate(
      OLC.replace('%SEC%', JSON.stringify(SEC)).replace(/%PAY%/g, String(PAY))
    )) as readonly string[]
  })
  // ⚠ HATAYI YUTMA: 'tarayıcı açılamadı' demek, sebebi saklamak demekti ve bir tur
  // boyunca gerçek sözdizimi hatasını görünmez yaptı. Kusur ADIYLA taşınır.
  return sonuc.ok ? sonuc.value : [`ölçüm koşmadı: ${JSON.stringify(sonuc.error)}`]
}

const ALANLI = Object.entries(ORNEKLER).filter(([, o]) => o.alanSiniri !== undefined)

describe('alan sınırının kestiği yazı İKİ alanda da okunuyor', () => {
  // ⚠ Kapsam boşalırsa döngü hiç koşmaz ve dosya "yeşil" görünür.
  it('alan sınırı taşıyan şablon VAR', () => {
    expect(ALANLI.map(([id]) => id).length, 'kuralın kapsamı BOŞ').toBeGreaterThan(0)
  })

  for (const [id, o] of ALANLI) {
    it(`${id} · sınırın kestiği her yazı iki alanda da okunuyor`, async () => {
      expect(await kesenler(o)).toEqual([])
    }, 90_000)
  }
})
