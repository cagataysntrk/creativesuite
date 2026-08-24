// AİLE SINAVI — on şablon tek Instagram ızgarasında (R-107 · D-339 · FAZ-18.17).
//
// ⚠ ⚠ **"BAKILIR" TEK BAŞINA BİR KAPI DEĞİL.** Faz adımının kendi testi *"bir şablonun
// aksanını değiştir → ızgarada hemen sırıtıyor"* diyor; yani aile tutarlılığının
// ÖLÇÜLEBİLİR olması bekleniyor. Göz onu her turda yeniden bakmadan koruyamaz.
//
// ⚠ Ölçülen üç şey, adımın kendi cümlesinden: *"ayrım layout'tan gelmeli; palet, tip
// ölçeği ve künye ORTAK kalmalı."*
//   · **Palet** — çizilen renkli piksellerin tonu. On şablonun onunda da ≥%86'sı tek
//     tonda toplanıyor; ikinci bir renk kümesi YOK.
//   · **Krom** — ray on yerde de birebir aynı: punto, üst kenar, çocuk sayısı.
//   · **Tip** — gövde puntosu okuma eşiğinin üstünde (R-83 zaten zorluyor).
//
// ⚠ H1 puntosu KASTEN serbest (74–151 px ölçüldü): başlık kadraja OTURUYOR, sabit bir
// punto taşımıyor. Sabitlemek uzun bir başlığı taşırır ya da kısa birini cüce bırakır —
// ortak olan ölçek, piksel değil.

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { withPage } from './browser.js'
import { ORNEKLER } from './katalog-ornek.js'
import { panoramaHtml, puntoOlcumu, type PanoramaBelgesi } from './panorama.js'

const TOKEN = readFileSync(
  join(
    dirname(fileURLToPath(import.meta.url)),
    '../../../brand/brd_upcytech/derived-tokens/tokens.css'
  ),
  'utf8'
)

const DAMGA = {
  brandId: 'brd_t',
  eraId: 'era_t',
  kitVersion: 'kit-1',
  definitionDigest: 'sha256:x',
  contextManifest: 'ctx_1',
  sourceRunId: 'run_t',
}

type Ornek = (typeof ORNEKLER)[keyof typeof ORNEKLER]

/** Kapağın krom ölçüleri ve renkli piksellerinin ton dağılımı. */
const OLCUM = `(() => {
  const al = (s, o) => {
    const e = document.querySelector(s)
    return e ? parseFloat(getComputedStyle(e)[o]) : null
  }
  const ray = document.querySelector('.ray')
  const rb = ray ? ray.getBoundingClientRect() : null
  return {
    govde: al('.govde', 'fontSize'),
    rayPunto: al('.ray', 'fontSize'),
    rayUst: rb ? Math.round(rb.top) : null,
    rayCocuk: ray ? ray.children.length : null,
    hizaSapmasi: (() => {
      let en = 0
      document.querySelectorAll('.kart').forEach((kart) => {
        const b = kart.querySelector('.baslik')
        if (!b) return
        const sol = b.getBoundingClientRect().left
        for (const sec of ['.ust-baslik', '.govde']) {
          const e = kart.querySelector(sec)
          if (!e) continue
          const r = e.getBoundingClientRect()
          if (r.width < 4) continue
          en = Math.max(en, Math.abs(Math.round(r.left - sol)))
        }
      })
      return en
    })(),
    etiketAcikligi: (() => {
      const ue = document.querySelector('.ust-baslik')
      const bs = document.querySelector('.baslik')
      if (!ue || !bs) return null
      return Math.round(bs.getBoundingClientRect().top - ue.getBoundingClientRect().bottom)
    })(),
  }
})()`

/**
 * ⚠ ⚠ **EŞİK HSL DOYGUNLUĞU DEĞİL OKLCH KROMASI — ve birimi ÖLÇÜM değiştirdi.**
 * Eski eşik `s ≥ 0,25` (HSL) idi ve nötr rampanın chroma'sı 0 iken doğru çalışıyordu.
 * FAZ-19.6'da nötrler kasten ısıtıldı (gölge h=250, ışık h=75, C 0,005–0,014) ve ölçüm
 * çöktü: `sahne`nin baskın ton payı %60'a düştü. Sebep aritmetik —
 *
 * | token | OKLCH kroma | HSL doygunluk |
 * |---|---|---|
 * | `oklch(0.105 0.014 250)` | 0,014 | **0,609** |
 * | `oklch(0.165 0.013 250)` | 0,013 | **0,325** |
 * | `oklch(0.485 0.008 250)` | 0,008 | 0,041 |
 *
 * HSL doygunluğu `(mx−mn)/(1−|2l−1|)`: çok koyu bir renkte payda sıfıra gidiyor ve
 * MİNİCİK bir kroma %61 doygunluk gibi görünüyor. **Kâğıt üstünde nötr sayılan bir ton,
 * siyahın dibinde "renk" sayılıyor.** Tasarım OKLCH'te yazılıyor; ölçüm de orada
 * yapılmalı. Eşik `C ≥ 0,03`: kasıtlı ısı (≤0,014) dışarıda, marka mavisi (0,206) içeride.
 */
const TON = (b64: string): string => `(async () => {
  const im = new Image()
  im.src = 'data:image/png;base64,${b64}'
  await im.decode()
  const c = document.createElement('canvas')
  c.width = im.width; c.height = im.height
  const x = c.getContext('2d')
  x.drawImage(im, 0, 0)
  const d = x.getImageData(0, 0, c.width, c.height).data
  const kova = new Map()
  let renkli = 0
  for (let i = 0; i < d.length; i += 28) {
    const r = d[i]/255, g = d[i+1]/255, b = d[i+2]/255
    const mx = Math.max(r,g,b), mn = Math.min(r,g,b), l = (mx+mn)/2
    // sRGB → OKLab → kroma. Tasarım OKLCH'te yazılıyor; "renk mi" sorusu da orada sorulur.
    const li = (v) => v <= 0.04045 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4)
    const R = li(r), G = li(g), B = li(b)
    const l_ = Math.cbrt(0.4122214708*R + 0.5363325363*G + 0.0514459929*B)
    const m_ = Math.cbrt(0.2119034982*R + 0.6806995451*G + 0.1073969566*B)
    const s_ = Math.cbrt(0.0883024619*R + 0.2817188376*G + 0.6299787005*B)
    const oa = 1.9779984951*l_ - 2.4285922050*m_ + 0.4505937099*s_
    const ob = 0.0259040371*l_ + 0.7827717662*m_ - 0.8086757660*s_
    const kroma = Math.sqrt(oa*oa + ob*ob)
    if (kroma < 0.03 || l < 0.06 || l > 0.96) continue
    renkli += 1
    let h = 0
    if (mx === r) h = 60*(((g-b)/(mx-mn))%6)
    else if (mx === g) h = 60*(((b-r)/(mx-mn))+2)
    else h = 60*(((r-g)/(mx-mn))+4)
    if (h < 0) h += 360
    const k = Math.round(h/10)*10
    kova.set(k, (kova.get(k)||0)+1)
  }
  if (renkli === 0) return { renkli: 0, tepe: null, pay: 0 }
  const sirali = [...kova.entries()].sort((a,b)=>b[1]-a[1])
  return { renkli: renkli, tepe: sirali[0][0], pay: Math.round(sirali[0][1]/renkli*100) }
})()`

interface Olcu {
  readonly govde: number
  readonly rayPunto: number
  readonly rayUst: number
  readonly rayCocuk: number
  readonly etiketAcikligi: number | null
  readonly hizaSapmasi: number
  readonly renkli: number
  readonly tepe: number | null
  readonly pay: number
}

const kapagiOlc = async (o: Ornek, token = TOKEN): Promise<Olcu> => {
  const doc = { ...o, tokenCss: token, stamp: DAMGA } as unknown as PanoramaBelgesi
  const r = await withPage(async (page) => {
    await page.setViewportSize({ width: doc.slaytGenisligi, height: doc.yukseklik })
    await page.setContent(panoramaHtml(doc), { waitUntil: 'load' })
    await page.evaluate('(async () => { await document.fonts.ready; return true })()')
    await page.evaluate(puntoOlcumu(doc))
    const olcu = await page.evaluate(OLCUM)
    const png = await page.screenshot()
    const ton = await page.evaluate(TON(png.toString('base64')))
    return { ...(olcu as object), ...(ton as object) } as Olcu
  })
  expect(r.ok).toBe(true)
  return r.ok ? r.value : ({} as Olcu)
}

describe('aile sınavı — on şablon tek ızgarada', () => {
  const olculer: Record<string, Olcu> = {}

  for (const [id, o] of Object.entries(ORNEKLER)) {
    it(`${id} · kromu ve paleti aileye ait`, async () => {
      const v = await kapagiOlc(o)
      olculer[id] = v
      // ── palet: TEK ton ──────────────────────────────────────────────────
      // ⚠ İkinci bir renk kümesi ailenin en görünür kırılması: ızgarada bir şablon
      // "başka bir marka" gibi durur ve bunu ancak yan yana konunca fark edersin.
      if (v.renkli > 200) {
        expect(v.pay, `${id}: baskın ton payı %${String(v.pay)}`).toBeGreaterThanOrEqual(80)
      }
      // ── tip: okuma eşiği (R-83) ────────────────────────────────────────
      expect(v.govde, `${id} gövde puntosu`).toBeGreaterThanOrEqual(36)
    })
  }

  // ⚠ ⚠ **KROM MUTLAK BİR SAYIYLA DEĞİL, EŞİTLİKLE SINANIYOR.** İlk sürüm
  // `rayCocuk === 4` yazıyordu ve on şablonda birden kırmızıya döndü: öge sayısı logo
  // verilip verilmemesine bağlı, yani o iddia şablonu değil FIXTURE'ı ölçüyordu. Ailenin
  // tanımı "krom dört ögedir" değil, **"krom her şablonda AYNIDIR"**.
  it('krom on şablonda BİREBİR aynı — punto, üst kenar, öge sayısı', () => {
    const hepsi = Object.entries(olculer)
    expect(hepsi.length).toBe(Object.keys(ORNEKLER).length)
    const ilk = hepsi[0]?.[1]
    expect(ilk).toBeDefined()
    if (ilk === undefined) return
    for (const [id, v] of hepsi) {
      expect(v.rayPunto, `${id} ray puntosu`).toBe(ilk.rayPunto)
      expect(v.rayUst, `${id} ray üst kenarı`).toBe(ilk.rayUst)
      expect(v.rayCocuk, `${id} ray öge sayısı`).toBe(ilk.rayCocuk)
    }
  })

  // ⚠ ⚠ **ÜST ETİKET BAŞLIĞIN ADIDIR — onları bağlayan tek şey YAKINLIK.** `donen`de
  // etiket kadrajın tepesinde yapayalnız duruyordu: etiket→başlık **369 px**, ailenin
  // öteki sekizinde her kartta tam **14 px**. Varyasyon değil, bambaşka bir ilişki.
  // ⚠ Sebep `yerlesim: 'yayik'` = `space-between` idi: boşluğu dört ögeye TEK TEK
  // dağıtıyor ve ilk kurban etiket oluyordu. Yayılma kaldırılmadı, öbek-farkında yapıldı.
  // ⚠ Ölçü EŞİTLİK, tavan değil: bu aralık ailenin ortak tipografik DNA'sı, ayrım
  // yerleşimden gelir (R-107). Bir tavan yazmak 300 px'lik bir kaymayı meşru kılardı.
  it('üst etiket başlığından KOPMUYOR — açıklık on şablonda aynı', () => {
    const olculu = Object.entries(olculer).filter(([, v]) => v.etiketAcikligi !== null)
    expect(olculu.length, 'üst etiket taşıyan şablon').toBeGreaterThan(1)
    const ilk = olculu[0]?.[1].etiketAcikligi
    for (const [id, v] of olculu) {
      expect(v.etiketAcikligi, `${id} etiket→başlık açıklığı`).toBe(ilk)
    }
  })

  // ⚠ ⚠ **SAĞ YASLI KART BİR SÜTUN DEĞİL, "SAĞA İTİLMİŞ KUTULAR" İDİ.** `align-items:
  // flex-end` her bloğu ayrı ayrı sağa itiyor; kutular içeriklerine göre daraldığı için
  // üç bloğun ÜÇ AYRI sol kenarı oluyordu. Ölçüldü: sol yaslı kartların hepsinde sapma
  // 0, sağ yaslı DÖRT kartın dördünde de kaymış — `sahne` 2/4 (+343), `kavis` 3 (+538,
  // gövde −64), `karsilastirma` 2 (+597, gövde +108). Üç şablon, tek sebep.
  // ⚠ Ölçü MUTLAK sıfır: bir metin bloğunun sol kenarı ya ötekilerle aynıdır ya değildir.
  // Tolerans yazmak 300 px'lik bir kaymayı "biraz" yapardı.
  it('metin blokları TEK sol kenarı paylaşıyor — sağ yaslı kartta da', () => {
    for (const [id, v] of Object.entries(olculer)) {
      expect(v.hizaSapmasi, `${id}: etiket/gövde başlığın sol kenarından kaymış`).toBe(0)
    }
  })

  // ⚠ ⚠ **İDDİA DEĞİŞTİ: "hepsi aynı renkte mi" → "rengini İCAT mı etti" (D-349).**
  // Eski ölçüt on şablonun baskın tonunu ±15°'de tutuyordu ve D-318'in "tek karneli
  // aksan" kararının ölçüm karşılığıydı. FAZ-19.6'da `alinti` P3'e (kâğıt+oksit, **mavi
  // YOK**), `kavis` P4'e (beton+amber) geçince kırıldı — haklı olarak: oksit 32°,
  // amber 80°, marka mavisi 262°.
  //
  // ⚠ ⚠ **ÖLÇÜLEN BOŞLUK BU DEĞİŞİMİ ZORLADI.** `tas` ve `beton` yüzeyleri σ'da
  // ayrılmıyordu (5,10 / 5,00): iki malzeme, tek görünüm. Doku farkı yetmiyor; ayrımın
  // taşıyıcısı RENK. Tek palet kuralı, yüzey ailelerini yarım bırakıyordu.
  //
  // ⚠ Bu bir gevşetme DEĞİL. Ailelik artık ortak iskeletten okunuyor (ızgara, güvenli
  // alan, künye geometrisi, gövde ailesi, gren) — ve onların hepsi bu dosyada ayrıca
  // sınanıyor. Aksana gelen kısıt: **keyfî olamaz.** Bir şablon renk dünyasını SEÇER,
  // İCAT ETMEZ; aksan `--ramp-*` token'larından gelmek zorunda.
  it('şablon aksanı rampadan geliyor — renk SEÇİLİR, icat EDİLMEZ (D-349)', () => {
    for (const [id, o] of Object.entries(ORNEKLER)) {
      const a = (o as { readonly aksan?: string }).aksan
      if (a === undefined) continue
      expect(a, `${id}: aksan serbest renk — rampadan gelmeli`).toMatch(
        /^var\(--ramp-[a-z0-9-]+\)$/
      )
    }
  })

  // ⚠ Palet SAYISI da serbest değil: iki şablon aynı paleti kullanabilir, ama on ayrı
  // renk icadı "on marka" demek olurdu. Bugün iki palet var; tavan reçetenin beşi.
  it('kullanılan palet sayısı BEŞİ aşmıyor — on tema, beş renk dünyası', () => {
    const paletler = new Set(
      Object.values(ORNEKLER)
        .map((o) => (o as { readonly aksan?: string }).aksan)
        .filter((a): a is string => a !== undefined)
    )
    expect(paletler.size, `kullanılan aksan: ${[...paletler].join(' · ')}`).toBeLessThanOrEqual(5)
  })

  // 🧪 ⚠ **KASTEN İHLAL** — adımın kendi testi: *"bir şablonun aksanını değiştir →
  // ızgarada hemen sırıtıyor."* Aksan turuncuya çevriliyor ve ölçüm onu YAKALIYOR.
  it('aksanı değişen şablon ızgarada SIRITIYOR', async () => {
    const o = ORNEKLER['dizin']
    expect(o).toBeDefined()
    if (o === undefined) return
    const bozuk = TOKEN.replace(
      /--ramp-marka-mavi-500:[^;]+;/g,
      '--ramp-marka-mavi-500: oklch(0.70 0.190 50);'
    )
    expect(bozuk).not.toBe(TOKEN)
    const v = await kapagiOlc(o, bozuk)
    const saglam = olculer['dizin']
    expect(saglam).toBeDefined()
    if (saglam === undefined) return
    expect(
      Math.abs((v.tepe ?? 0) - (saglam.tepe ?? 0)),
      `bozuk ${String(v.tepe)}° · sağlam ${String(saglam.tepe)}°`
    ).toBeGreaterThan(15)
  })
})
