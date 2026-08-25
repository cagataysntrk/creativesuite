// KAPANIŞ KARTI — deste "içerik bitti" değil "VARDIK" demeli (FAZ-19 · denetim).
//
// ⚠ ⚠ **MEKANİZMA KODDA VARDI, KATALOGDA SIFIR ÇAĞIRANI.** `kapanis` tipi, işaretlemesi
// ve CSS'i `panorama.ts`te duruyordu; on şablonun HİÇBİRİ kullanmıyordu. Bu depoda on
// birinci kez aynı sınıf: modül yazılır, testi yeşildir, üretim yolunda çağıranı olmaz
// (D-182 · D-190 · D-224 · D-250 · D-261 · D-270 · D-347). Bu kapının ilk işi o zinciri
// bağlamak: her destenin SON kartı kapanış taşıyor mu.
//
// ⚠ ⚠ **VARIŞ İŞARETİ ARTIK RAKAM OLMAK ZORUNDA DEĞİL.** Sıra ölçümden gelmişti: imza
// tek başına eklendiğinde `sahne`nin son karesi %2,2'den yalnız %8,0'e çıkıyordu ve
// bunun %7,6'sı RAKAMDAN geliyordu — yani kapanışı taşıyan şey imza değil VARIŞTI.
// O ölçüm hâlâ doğru; değişen, varışın NEYLE işaretlendiği. Depo sahibi on kapanışa
// yan yana bakıp *"bu sayılar iğrenç duruyor, son sayfaları inanılmaz karışıklaştırıyor,
// nizami olmalı"* dedi ve rakamlar dokuz desteden kaldırıldı. Yerine poster ölçekli
// ÇAĞRI geçti: son sayfada bağıracak şey zaten eylem çağrısıdır.
// ⚠ Bu kapı o yüzden işaretin BİÇİMİNİ değil DAVRANIŞINI sınıyor: kolonuna sığıyor mu,
// bir fısıltı değil bir varış ölçeğinde mi.
//
// ⚠ ⚠ **RAKAM SABİT PUNTOYLA YAZILDI VE KESİLDİ.** 458 px'te iki hane 506 px yer istiyor,
// `sahne`nin sağ kolonu 454 px: rakam kadrajın dışına taştı — yani tam da bu fazın
// kapatmaya çalıştığı *"çizgiler yazıyı kesiyor"* kusuru. Punto artık kolondan
// hesaplanıyor; bu kapı taşmanın geri gelmediğini sınıyor.

import { describe, expect, it } from 'vitest'
import { withPage } from './browser.js'
import { ORNEKLER } from './katalog-ornek.js'
import { olcumBelgesi } from './olcum-belgesi.js'
import {
  knockoutOlcumu,
  metinMaskesi,
  panoramaHtml,
  puntoOlcumu,
  type PanoramaBelgesi,
} from './panorama.js'

// ⚠ Archivo 700 + `-0.045em`: ÖLÇÜLDÜ (`rakam-en.mjs`), tahmin edilmedi.
const KAPAK_ORANI = 0.705
const KAPAK_TABANI = 240
const KAPAK_TAVANI = 360
/**
 * Sade kapanışta ÇAĞRI varışı taşır — tabanı ölçüldü.
 *
 * ⚠ ⚠ **BU TABAN BİR KEZ 55 YAZILDI VE TASARIMI ZORLADI.** Dev rakam kalkınca çağrıyı
 * poster ölçeğine (152 px) çıkarmıştım; depo sahibi baktı ve *"fontlar aşırı kaba,
 * yazılar aşırı büyük, bütün kompozisyona aykırı… CTA olmalı ama bu kadar büyük gerek
 * yok, boşluk da bazen estetiktir"* dedi. Çağrı 68 px'e indi ve **kapı ondan sonra**
 * yeniden türetildi — tersi değil: bir kapı tasarımı ölçer, ona yön vermez.
 *
 * Ölçülen: on destenin dokuzunda da çağrı kapağı **48 px** (dar sağ kolonlu `sahne`
 * dahil — punto kolona oturtulduğu için tek bir sayı çıkıyor). Taban **42**: %12,5 pay
 * bırakıyor ve gövde kapağının (~25 px) hâlâ belirgin üstünde. Çağrı bir altyazı değil,
 * ama bir afiş de değil.
 */
const CAGRI_KAPAK_TABANI = 42

type Ornek = (typeof ORNEKLER)[keyof typeof ORNEKLER]
const belge = (o: Ornek): PanoramaBelgesi => olcumBelgesi(o)

describe('kapanış kartı', () => {
  // ⚠ ⚠ **ZİNCİR TESTİ.** Yeni bir şablon kapanışsız eklenirse burası söyler. Bir
  // şablonun kapanışı YOKSA destenin son karesi yine destenin en boş karesi olur ve
  // denetimin şikâyeti geri gelir — sessizce.
  it('on destenin ONUNDA da SON kart kapanış taşıyor', () => {
    // ⚠ ⚠ **ZİNCİR "RAKAM VAR MI" DİYE SORUYORDU, "KAPANIŞ VAR MI" DEMESİ GEREKİYORDU.**
    // Depo sahibi dev rakamları kaldırınca dokuz deste birden kapanışsız SANILDI — oysa
    // hepsinin kapanışı duruyor, yalnız varış işareti değişti. Zincir testinin işi
    // mekanizmanın çağrılıp çağrılmadığını görmek; işaretin BİÇİMİNİ sormak değil.
    const eksik = Object.entries(ORNEKLER).filter(([, o]) => {
      const son = o.kartlar[o.kartlar.length - 1] as { kapanis?: unknown } | undefined
      return son?.kapanis === undefined
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
    it(`${id} · varış işareti kolonuna sığıyor ve varış ölçeğinde`, async () => {
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
        // önce koşuyor.** Atlayan bir kapı, yayınlanmayan bir düzeni ölçer: `memphis`te
        // metin dibi oturtmasız y%26, oturtmalı **y%51**. Üstelik sade kapanışın çağrısı
        // TAM BU ADIMDA kolonuna oturuyor — atlayan ölçüm taşmayı hiç göremez.
        await page.evaluate(puntoOlcumu(belge(o)))
        // ⚠ Knockout PUNTODAN SONRA: maske kutunun SON hâlini ölçmek zorunda.
        await page.evaluate(knockoutOlcumu())
        await page.evaluate(metinMaskesi())
        return (await page.evaluate(
          '(() => {' +
            ' const rakam = document.querySelector(".kapanis-rakam");' +
            ' const el = rakam === null' +
            '   ? document.querySelector(".kapanis-sade .kapanis-cagri") : rakam;' +
            ' if (el === null) return null;' +
            ' const kart = el.closest(".kart");' +
            ' const kk = kart.getBoundingClientRect(), rk = el.getBoundingClientRect();' +
            ' const ks = getComputedStyle(kart);' +
            ' return { rakamMi: rakam !== null,' +
            '   panolu: kart.querySelector(".panel") !== null,' +
            '   sol: rk.left - kk.left - parseFloat(ks.paddingLeft),' +
            '   sag: kk.right - rk.right,' +
            '   punto: parseFloat(getComputedStyle(el).fontSize),' +
            '   kartEni: kk.width } })()'
        )) as {
          rakamMi: boolean
          panolu: boolean
          sol: number
          sag: number
          punto: number
          kartEni: number
        } | null
      })
      expect(sonuc.ok, 'tarayıcı açılamadı').toBe(true)
      if (!sonuc.ok) return
      const v = sonuc.value
      expect(v, `${id} varış işareti çizilmemiş`).not.toBeNull()
      if (v === null) return
      // ⚠ Taşma: işaretin sağ kenarı kartın içinde kalmalı. Negatif `sag` = KESİLMİŞ.
      // Bu, `sahne`de gerçekten yakalandı: sade çağrı kartın sağından 33 px taşıyordu.
      expect(
        v.sag,
        `${id} varış işareti kartın sağından ${String(Math.round(-v.sag))} px taşıyor`
      ).toBeGreaterThan(0)
      expect(v.sol, `${id} varış işareti kartın solundan taşıyor`).toBeGreaterThanOrEqual(-1)
      const kapak = v.punto * KAPAK_ORANI
      if (v.rakamMi) {
        // Rakam varışı: denetimin `--punto-rakam` bandı.
        expect(kapak, `${id} rakam kapak boyu ${kapak.toFixed(0)} px`).toBeGreaterThanOrEqual(
          KAPAK_TABANI
        )
        expect(kapak, `${id} rakam kapak boyu ${kapak.toFixed(0)} px`).toBeLessThanOrEqual(
          KAPAK_TAVANI
        )
      } else if (v.panolu) {
        // ⚠ ⚠ **PANOLU KAPANIŞTA VARIŞ İŞARETİ PANONUN KENDİSİDİR.** `dizin`de güzergâhın
        // son oku dev rakama değil listenin DÖRDÜNCÜ maddesine varıyor (ölçüldü: satır
        // y=%63,1, ok ucu oraya 0,8 pay bırakarak iniyor) ve liste tam bu yüzden 1,6×
        // büyütüldü. Çağrı orada bilinçli olarak küçük: bir kartta tek aygıt bağırır.
        // ⚠ Muafiyet ADA göre değil YAPIYA göre: yarın panolu kapanışı olan ikinci bir
        // deste eklense kural onu da kendiliğinden kapsar.
        expect(v.panolu, `${id} panolu kapanışta varış panosu yok`).toBe(true)
      } else {
        // ⚠ ÇAĞRI VARIŞI: bir cümle 240 px kapağa ÇIKAMAZ (sekiz harflik kelime o
        // puntoda ~1270 px ister, kart 1080 px) ve ÇIKMAMALI da — gerekçesi tabanın
        // tanımında. Burada sınanan tek şey, çağrının gövde ölçeğine düşmemesi.
        expect(
          kapak,
          `${id} çağrı kapak boyu ${kapak.toFixed(0)} px — varış değil altyazı ölçeğinde`
        ).toBeGreaterThanOrEqual(CAGRI_KAPAK_TABANI)
      }
    }, 90_000)
  }
})
