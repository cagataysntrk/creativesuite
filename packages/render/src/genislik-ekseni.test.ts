// GENİŞLİK EKSENİ — ilan edilen genişlik GERÇEKTEN uygulanıyor mu (FAZ-19.5).
//
// ⚠ ⚠ **BU KAPI ALETİN ONBİRİNCİ YALANINDAN DOĞDU.** `getComputedStyle().fontStretch`
// BİLDİRİLEN değeri döndürür — fontun o ekseni taşıyıp taşımadığını **söylemez.** Yani
// eksensiz bir yüze `font-stretch: 70%` yazılırsa computed 70% okunur ve hiçbir glif
// daralmaz. Tek dürüst ölçü ADVANCE: aynı dize, aynı punto, değişen genişlik.
//
// Ölçüldü (ısıtma turlu, ilk ölçüm yüz örneği yüklenmeden yedeği ölçüyordu):
//   `Marka Display` (Literata)   62:1083  100:1083  oran **1,000 — EKSEN YOK**
//   `Marka Baslik`  (Archivo)    62: 672  100: 974  oran 0,690
//   `Marka Metin`   (Archivo)    62: 672  100: 974  oran 0,690
//   `Marka Mono`    (Martian)    62:1440  100:1680  oran 0,857 (75 altı kırpık)
//
// ⚠ Bu yüzden genişlik yalnız Archivo rollerinde anlamlı. `.kart.ilk .baslik` — yani
// HER şablonun KAPAK başlığı — `Marka Display` ile çiziliyor ve orada eksen YOK; bir
// şablonun ilan ettiği genişlik kapağı değil GÖVDE kartlarının başlıklarını etkiliyor.
// Bu kusur değil: display serif kapak + dar grotesk iç başlık ayrı iki sestir.
//
// ⚠ ⚠ **VE MERCEK HATASI: `just izgara` yalnız KAPAKLARI çiziyor.** Bu değişikliği bir
// kez kapağa bakarak yargılayıp *"yarım kaldı"* dedim ve mekanizmayı söktüm. Değişikliğin
// düştüğü yeri göstermeyen bir mercek, o değişikliği yargılayamaz.

import { describe, expect, it } from 'vitest'
import { withPage } from './browser.js'
import { ORNEKLER } from './katalog-ornek.js'
import { olcumBelgesi } from './olcum-belgesi.js'
import { panoramaHtml, puntoOlcumu } from './panorama.js'

type Ornek = (typeof ORNEKLER)[keyof typeof ORNEKLER]

/**
 * Eksenin gerçekten ÇALIŞTIĞINI kabul etmek için gereken en küçük advance farkı.
 *
 * ⚠ ⚠ **BU KAPI ÖNCE "DARALTIYOR MU" DİYE SORDU ve kendi varsayımını açığa vurdu.**
 * İlk sürüm `1 - oran > 0,06` yazıyordu, yani genişliğin HEP daralttığını varsayıyordu.
 * Reçete `B` iki yöne de gidiyor: `karsilastirma` 88 (dar), `memphis` 125 (GENİŞ,
 * Anybody wdth 125'in Archivo karşılığı). İlk genişleyen çağrı yerinde kapı kırmızı
 * döndü — kusur şablonda değil KAPIDAYDI: oran 1,282 ölçüldü ve bu tam da istenen şey.
 * Kural artık yönü İLANDAN türetiyor: 100'ün altı daraltmalı, üstü genişletmeli.
 */
const EN_AZ_DEGISIM = 0.06

// ⚠ TS sabiti tarayıcı koduna GEÇMEZ; genişlik yer tutucuyla enjekte ediliyor.
const OLC = `(async (w) => {
  await document.fonts.ready
  const b = document.querySelector('.kart:not(.ilk) .baslik')
  if (b === null) return null
  const s = getComputedStyle(b)
  // ⚠ ISITMA: yüz örneği ilk çizimde yüklenmemiş olabiliyor ve YEDEK ölçülür.
  const o = document.createElement('span')
  // ⚠ AILE DOGRUDAN ATANIYOR, metin olarak ENJEKTE EDILMIYOR. Ilk surum
  // JSON.stringify(s.fontFamily) ile yaziyordu; s.fontFamily zaten TIRNAKLI bir liste
  // ('"Marka Baslik", "Marka Metin", sans-serif') ve stringify onu bir kez daha
  // tirnaklayinca CSS GECERSIZ oldu, olcum YEDEK fonta dustu ve iki genislik BIREBIR
  // ayni cikti (1308/1308) — cizimde daralma acikca gorunurken kapi "eksen yok" dedi.
  o.style.cssText = 'position:absolute;left:-9999px;white-space:nowrap;font-size:100px'
  o.style.fontFamily = s.fontFamily
  o.style.fontWeight = s.fontWeight
  o.textContent = 'Ölçüm hattı ŞĞİ karşılaştırma'
  document.body.appendChild(o)
  o.style.fontStretch = '100%'
  o.getBoundingClientRect()
  o.style.fontStretch = w + '%'
  o.getBoundingClientRect()
  o.style.fontStretch = '100%'
  const yuz = o.getBoundingClientRect().width
  o.style.fontStretch = w + '%'
  const dar = o.getBoundingClientRect().width
  o.remove()
  return { bildirilen: s.fontStretch, yuz, dar, aile: (s.fontFamily.split(',')[0] || '').replace(/["']/g, '') }
})`

const olc = async (
  o: Ornek,
  w: number
): Promise<{ bildirilen: string; yuz: number; dar: number; aile: string } | null> => {
  const doc = olcumBelgesi(o)
  const r = await withPage(async (page) => {
    await page.setViewportSize({ width: doc.slaytGenisligi, height: doc.yukseklik })
    await page.setContent(panoramaHtml(doc), { waitUntil: 'load' })
    await page.evaluate('(async () => { await document.fonts.ready; return true })()')
    await page.evaluate(puntoOlcumu(doc))
    return (await page.evaluate(`${OLC}(${String(w)})`)) as {
      bildirilen: string
      yuz: number
      dar: number
      aile: string
    } | null
  })
  expect(r.ok, `ölçüm koşamadı: ${JSON.stringify(r.ok ? null : r.error)}`).toBe(true)
  return r.ok ? r.value : null
}

const genislikli = Object.entries(ORNEKLER).filter(
  ([, o]) => o.tipografi?.baslikGenislik !== undefined
)

describe('genişlik ekseni', () => {
  // ⚠ Kapı boşa dönmesin: en az bir şablon ekseni İSTEMELİ, yoksa aşağıdaki döngü
  // hiç koşmaz ve yeşil hiçbir şey kanıtlamaz.
  it('en az bir şablon genişlik ilan ediyor', () => {
    expect(genislikli.map(([id]) => id).join(','), 'hiçbir şablon eksene talip değil').not.toBe('')
  })

  for (const [id, o] of genislikli) {
    const w = o.tipografi?.baslikGenislik ?? 100
    it(`${id} · ilan edilen genişlik ${String(w)} GERÇEKTEN uygulanıyor`, async () => {
      const m = await olc(o, w)
      expect(m, `${id}: gövde kartı başlığı bulunamadı`).not.toBeNull()
      if (m === null) return
      expect(m.bildirilen, `${id}: bildirim ögeye ulaşmıyor`).toBe(`${String(w)}%`)
      // ⚠ ⚠ **ASIL İDDİA BU.** Bildirim ulaşmış olabilir ve yüz ekseni taşımıyor
      // olabilir; o zaman `dar` ile `yuz` BİREBİR aynı çıkar ve kapı kırmızı döner.
      const oran = m.dar / m.yuz
      const yon = w < 100 ? 'daralt' : 'genişlet'
      expect(
        Math.abs(1 - oran),
        `${id}: "${m.aile}" yüzünde genişlik ${String(w)} advance'ı değiştirmiyor ` +
          `(${m.yuz.toFixed(0)} → ${m.dar.toFixed(0)} px, oran ${oran.toFixed(3)}) — ` +
          'yüz bu ekseni TAŞIMIYOR olabilir'
      ).toBeGreaterThan(EN_AZ_DEGISIM)
      // ⚠ Yön de sınanıyor: 88 ilan edip GENİŞLEYEN bir yüz, ekseni taşıyor ama
      // TERS taşıyor demektir ve bu sessiz bir yalandır.
      expect(
        w < 100 ? oran < 1 : oran > 1,
        `${id}: genişlik ${String(w)} "${yon}" demeli ama oran ${oran.toFixed(3)} çıktı`
      ).toBe(true)
    }, 60_000)
  }
})
