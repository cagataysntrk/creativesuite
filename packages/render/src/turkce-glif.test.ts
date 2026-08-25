// TÜRKÇE HARF MARKA FONTUNDAN ÇİZİLİR — sessiz yedeğe düşüş YASAK (FAZ-19.10).
//
// ⚠ ⚠ **BU, YASA 3'ÜN RENDER TARAFINDAKİ KARŞILIĞI.** Yasa görsel modeline Türkçe metin
// çizdirmeyi yasaklıyor; ama metni biz çizsek bile font `Ş`i taşımıyorsa tarayıcı SESSİZCE
// sistem fontuna düşer ve karosel bir anda "başka bir yazı" olur. Arıza gürültüsüz: hata
// yok, uyarı yok, yalnız harfin biçimi değişir.
//
// ⚠ Ölçüm advance-width karşılaştırması: aynı karakter marka ailesinde ve bilinen bir
// yedekte ölçülür; glif eksikse tarayıcı zaten yedeği kullanır ve iki ölçüm BİREBİR eşit
// çıkar. Ölçülen bugünkü durum: `Ö Ç Ü Ş Ğ İ ı ş ğ ç ö ü` — on iki harfin on ikisi de üç
// ailede (`Marka Baslik` · `Marka Display` · `Marka Mono`) marka fontundan geliyor.
//
// ⚠ ⚠ **KAPI KENDİ KALİBRASYONUNU TAŞIYOR — ve sebebi bu fazın en pahalı dersi.** "İhlal
// yok" sonucu, aletin BOZUK olmasından da gelebilir; bu fazda ölçüm üç kez yalan söyledi.
// Bu yüzden aşağıdaki ikinci iddia, fontta KESİNLİKLE bulunmayan karakterlerin (`漢` `✓`
// `→` `Ω`) yedeğe düştüğünü GÖRMEK zorunda. Alet körelirse birinci iddia bedava yeşil
// kalır, ikincisi ise hemen kırmızı döner.
//
// ⚠ `✓` ve `→` yedeğe düşüyor ve bu BİLİNEN bir durum: `unicode-range` onları kapsamıyor,
// üretim yolunda `kapsamDisiKarakterler` zaten yakalıyor. Burada onlar KUSUR değil, aletin
// çalıştığının KANITI.

import { describe, expect, it } from 'vitest'
import { withPage } from './browser.js'
import { ORNEKLER } from './katalog-ornek.js'
import { olcumBelgesi } from './olcum-belgesi.js'
import { panoramaHtml } from './panorama.js'

/** Türkçenin marka fontundan gelmesi gereken harfleri. */
const TURKCE = ['Ö', 'Ç', 'Ü', 'Ş', 'Ğ', 'İ', 'ı', 'ş', 'ğ', 'ç', 'ö', 'ü']

/** Fontta bulunmadığı BİLİNEN karakterler — aletin çalıştığının kanıtı. */
const YOK = ['漢', '✓', '→', 'Ω']

const OLC = `(() => {
  const c = document.createElement('canvas').getContext('2d')
  const aile = ['Marka Baslik', 'Marka Display', 'Marka Mono']
  // ISINMA: her ailenin ILK olcumu yedegi olcuyor; bu depoda bir kez uc aile de
  // ayni genisligi okumus ve olcum bir yalana donusmustu.
  for (const a of aile) { c.font = '200px ' + JSON.stringify(a) + ', monospace'; c.measureText('Hgİ') }
  const yedekMi = (a, h) => {
    c.font = '200px ' + JSON.stringify(a) + ', serif'
    const w1 = c.measureText(h).width
    c.font = '200px serif'
    const w2 = c.measureText(h).width
    return Math.abs(w1 - w2) < 0.01
  }
  const dusen = []
  const yakalanan = []
  for (const a of aile) {
    for (const h of %TURKCE%) if (yedekMi(a, h)) dusen.push(a + ':' + h)
    for (const h of %YOK%) if (yedekMi(a, h)) yakalanan.push(a + ':' + h)
  }
  return { dusen, yakalanan }
})()`

describe('türkçe glif', () => {
  it('Türkçe harfler MARKA fontundan çiziliyor', async () => {
    const doc = olcumBelgesi(ORNEKLER['veri-hikayesi'] ?? Object.values(ORNEKLER)[0]!)
    const r = await withPage(async (page) => {
      await page.setViewportSize({ width: doc.slaytGenisligi, height: doc.yukseklik })
      await page.setContent(panoramaHtml(doc), { waitUntil: 'load' })
      await page.evaluate('(async () => { await document.fonts.ready; return true })()')
      return (await page.evaluate(
        OLC.replace('%TURKCE%', JSON.stringify(TURKCE)).replace('%YOK%', JSON.stringify(YOK))
      )) as { dusen: string[]; yakalanan: string[] }
    })
    expect(r.ok, `ölçüm koşamadı: ${JSON.stringify(r.ok ? null : r.error)}`).toBe(true)
    if (!r.ok) return
    expect(
      r.value.dusen.join(' · '),
      'Türkçe harf sistem fontuna düşüyor — arıza gürültüsüz, yalnız harfin biçimi değişir'
    ).toBe('')
    // ⚠ ALETİN KENDİSİ SINANIYOR: fontta olmayan karakterler YAKALANMAK zorunda.
    // Yakalanmıyorsa yukarıdaki yeşil hiçbir şey kanıtlamaz.
    expect(
      r.value.yakalanan.length,
      'ölçüm aleti körelmiş: fontta bulunmayan karakterleri bile "marka fontunda" okuyor'
    ).toBeGreaterThan(0)
  }, 45_000)
})
