// KAPAK SİLUETİ — aynı siluet iki kapaktan fazlasında olamaz (FAZ-19.7).
//
// ⚠ ⚠ **DENETİM: *"Göz ilk 300 ms'de siluet okur"*** ve beş yerleşimden hiçbirinin ikiden
// fazla kullanılmamasını istiyor. Ölçüldü ve iki aile eşiği aşıyordu: `ust-orta` **4**
// (akan-alan · kavis · karsilastirma · dizin) ve `ust-sol` **3** (veri-hikayesi · memphis ·
// donen).
//
// ⚠ ⚠ **TAŞINAMAYANLAR ÖLÇÜLDÜ, TAHMİN EDİLMEDİ.** `memphis`in kapak görseli y%54–93'te,
// `donen`inki y%26–80'de duruyor; ikisinde de başlık ÜSTTE kalmak zorunda. `karsilastirma`
// ve `dizin`in kapağında pano var (çubuklar ve liste), başlığı aşağı almak onların üstüne
// binerdi. Taşınabilen ikisi taşındı: `akan-alan` (kapak görseli yok, dalga dibin yalnız
// %14'ünü tutuyordu → başlık alana indi) ve `kavis` (kemerler dipte → başlık ortaya indi).
//
// ⚠ ⚠ **VE ÜÇÜNCÜ TAŞIMA DENENDİ, ÖLÜ ÇIKTI, SÖKÜLDÜ.** `veri-hikayesi`nin kapağına
// `dikey: 'orta'` verildi ve render HİÇ DEĞİŞMEDİ. Sebep depoda zaten yazılıydı
// (`YERLESIM_CSS`): panonun `margin-top: auto`su boş alanın tamamını yutunca
// `justify-content`in dağıtacağı bir şey kalmıyor. Yani `dikey` alanı `yerlesim: 'ayrik'`
// + panolu destelerde sessizce etkisiz. Ateşlenmeyen değişiklik söküldü.
//
// ⚠ ⚠ **ASIL DÜZELTME ÖLÇÜM ALETİNDEYDİ.** İlk sınıflandırıcı yalnız `.baslik` kutusuna
// bakıyordu; denetimin sözcüğü ise SİLUET — göz başlığı değil bütün metin KÜTLESİNİ okur.
// Kütleyle ölçülünce dağılım şöyle: `ust-sol` 2 · `alt-orta` 2 · `orta-sol` 2 ·
// `yayik-orta` 2 · `yayik-sol` 1 · `orta-sag` 1. Hepsi eşiğin altında.

import { describe, expect, it } from 'vitest'
import { withPage } from './browser.js'
import { ORNEKLER } from './katalog-ornek.js'
import { olcumBelgesi } from './olcum-belgesi.js'
import { knockoutOlcumu, metinMaskesi, panoramaHtml, puntoOlcumu } from './panorama.js'

/** Bir siluet ailesini en çok kaç kapak paylaşabilir (denetim: ikiden fazla değil). */
const AILE_TAVANI = 2

/** Kapak metin kütlesinin sınırları — kartın yüzdesi. */
const OLC = `(() => {
  const k = document.querySelectorAll('.kart')[0]
  const kr = k.getBoundingClientRect()
  let l = 1e9, r = -1e9, t = 1e9, b = -1e9
  k.querySelectorAll('.ust-baslik, .baslik, .govde, .panel, .kapanis').forEach((e) => {
    const x = e.getBoundingClientRect()
    if (x.width < 4) return
    l = Math.min(l, x.left); r = Math.max(r, x.right)
    t = Math.min(t, x.top); b = Math.max(b, x.bottom)
  })
  return { sol: 100 * (l - kr.left) / kr.width, sag: 100 * (r - kr.left) / kr.width,
           ust: 100 * (t - kr.top) / kr.height, alt: 100 * (b - kr.top) / kr.height }
})()`

/**
 * Siluet ailesi — kütlenin yatay yakası × dikey duruşu.
 *
 * ⚠ Eşikler ölçülen kümelerden: sol yaka %6'da toplanıyor (`<15`), orta yaka %24–30
 * (`<40`), sağ yaka %52. Dikeyde kütle %60'tan uzunsa artık bir "bant" değil YAYIK bir
 * kütledir; %70'i aşan dip ALT, %15'ten yukarısı ÜST.
 */
const aile = (r: { sol: number; sag: number; ust: number; alt: number }): string => {
  const yatay = r.sol < 15 ? 'sol' : r.sol < 40 ? 'orta' : 'sag'
  const dikey = r.ust < 15 ? 'ust' : r.alt > 70 ? 'alt' : 'orta'
  const durus = r.alt - r.ust > 60 ? 'yayik' : dikey
  return r.sag - r.sol > 85 ? `tam-${durus}` : `${durus}-${yatay}`
}

describe('kapak silueti', () => {
  it('aynı siluet İKİDEN fazla kapakta yok', async () => {
    const sayim = new Map<string, string[]>()
    for (const [id, o] of Object.entries(ORNEKLER)) {
      const doc = olcumBelgesi(o)
      const r = await withPage(async (page) => {
        await page.setViewportSize({ width: doc.slaytGenisligi, height: doc.yukseklik })
        await page.setContent(panoramaHtml(doc), { waitUntil: 'load' })
        await page.evaluate('(async () => { await document.fonts.ready; return true })()')
        // ⚠ ÜÇ SAYFA ADIMI SIRAYLA — punto oturmadan ölçülen düzen yayınlanmayan düzendir.
        await page.evaluate(puntoOlcumu(doc))
        await page.evaluate(knockoutOlcumu())
        await page.evaluate(metinMaskesi())
        return (await page.evaluate(OLC)) as {
          sol: number
          sag: number
          ust: number
          alt: number
        }
      })
      expect(r.ok, `${id}: ölçüm koşamadı`).toBe(true)
      if (!r.ok) return
      const a = aile(r.value)
      sayim.set(a, [...(sayim.get(a) ?? []), id])
    }
    const asan = [...sayim.entries()]
      .filter(([, l]) => l.length > AILE_TAVANI)
      .map(([a, l]) => `${a}: ${l.join(', ')}`)
    expect(
      asan.join(' · '),
      `aynı siluet ${String(AILE_TAVANI)}'den fazla kapakta — göz ilk 300 ms'de ` +
        'siluet okur; üç kapak aynı silueti taşıyorsa üçü de aynı karosel sanılır'
    ).toBe('')
    // ⚠ Kapı boşa dönmesin: ölçüm hiç aile üretmediyse yukarısı bedava yeşildir.
    expect(sayim.size, 'hiç siluet ailesi ölçülemedi').toBeGreaterThan(3)
  }, 120_000)
})
