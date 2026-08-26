// KADRAJ — kartın kutusu değil, EKRANIN kutusu (R-93 · R-94 · R-95 · D-323 · D-324).
//
// ⚠ ⚠ **ÜÇ KUSUR, TEK KÖK.** Bu depodaki bütün panorama ölçümleri ögeleri KARTA göre
// okuyordu: taşma kart kutusunda, güvenli alan kart kenarından, metin payı kart alanına
// bölünerek. Üçü de kartın kendi içinde doğru; hiçbiri kartın YERİNİ, kesimle ilişkisini
// ya da kromun arkasındaki pikseli görmüyordu. Üçü de çıktıya BAKILARAK bulundu:
//
//   1. Sahne 21 px aşağı kaymıştı — sıfır boyutlu inline bir `<svg>` tanımı yüzünden.
//   2. "1↔2 kesimi" diye ADLANDIRILMIŞ özne kesimin 0,4 px solunda bitiyordu.
//   3. `01 / 04` ayakkabının üstünde okunmuyordu.
//
// ⚠ ⚠ **TEK DENETİM, ÜÇ İDDİA — ve bu bir üslup tercihi değil.** Üç ayrı dosya şablon
// başına üç tarayıcı denetimi açıyordu; tam paket 18 fazladan sayfa kurulumuyla zaman
// aşımına düşmeye başladı. Kırılgan bir kapı yeşil sayılmaz (R-80): denetim şablon
// başına BİR kez koşuyor, üç kusur aynı sonuçtan okunuyor.

import { describe, expect, it } from 'vitest'
import { withPage } from './browser.js'
import { ACIK_TEMA_KIMLIGI, FILTRE_TANIM_CSS, islemZinciri } from './gorsel-islem.js'
import { ORNEKLER } from './katalog-ornek.js'
import { olcumBelgesi } from './olcum-belgesi.js'
import { panoramaDenetle, type Kusur } from './panorama-denetim.js'
import {
  DIKIS_BANDI,
  EZICI_PAY,
  panoramaHtml,
  ZEMINDEN_AYRISMA,
  type PanoramaBelgesi,
} from './panorama.js'

type Ornek = (typeof ORNEKLER)[keyof typeof ORNEKLER]

/**
 * ⚠ ⚠ **TOKEN BOŞ BIRAKILAMAZ ve bunu ölçüm söyledi.** `tokenCss: ''` ile koşulan
 * belgede `--kart-metin` ve `--kart-zemin` çözülemiyor, her şey aynı renge düşüyor ve
 * krom ölçümü altı şablonda da **%100** veriyor. Renk ölçen bir kusuru renksiz bir
 * kurulumda sınamak, aleti değil kurulumu ölçmektir.
 *
 * ⚠ ⚠ **UYDURMA BİR PALET DE YETMEDİ.** Elle yazılmış on dokuz rol denendi ve dört koyu
 * şablon yine %100 verdi: `koyuMu()` kartın koyu mu açık mı olduğuna TOKEN METNİNDEN
 * karar veriyor ve uydurma değerlerle gerçekte çizilenden farklı karar veriyordu. Test
 * aletle değil kendi paletiyle kavga ediyordu.
 *
 * Palet ÜRETİLMİŞ dosyadan okunuyor — üretimde çizilen renkler bunlar. Marka paleti
 * kromu okunmaz yaparsa bu test kırmızıya döner; **dönmesi de gerekir.**
 */

/** Tek piksellik bir kaynak — `src` boş kalırsa yer tutucu çizilir ve zincir kurulmaz. */
const TEK_PIKSEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAA' +
  'DUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='

const belge = (o: Ornek): PanoramaBelgesi =>
  // ⚠ Ölçüm belgesi TEK yerden (`olcum-belgesi.ts`): belirteç + font + logo + damga.
  // Yedek fontla ölçen bir kapı, yayınlanmayan bir düzeni denetler.
  olcumBelgesi(o)

const suzgec = (kusurlar: readonly Kusur[], tur: Kusur['tur']): readonly string[] =>
  kusurlar.filter((k) => k.tur === tur).map((k) => `${k.alan ?? '-'} · ${k.aciklama}`)

describe('kadraj — altı şablon', () => {
  for (const [id, o] of Object.entries(ORNEKLER)) {
    it(`${id} · sahne yerinde, görseller banttan uzak, krom okunuyor`, async () => {
      const r = await panoramaDenetle(belge(o))
      expect(r.ok).toBe(true)
      if (!r.ok) return
      expect(suzgec(r.value, 'sahne-kaymis')).toEqual([])
      expect(suzgec(r.value, 'dikis-bandinda')).toEqual([])
      expect(suzgec(r.value, 'krom-okunmuyor')).toEqual([])
      expect(suzgec(r.value, 'gorsel-zemine-karismasin')).toEqual([])
      expect(suzgec(r.value, 'krom-seridine-giriyor')).toEqual([])
      expect(suzgec(r.value, 'kaynak-yok')).toEqual([])
      // ⚠ ⚠ **10 sn'lik VARSAYILAN tavan bu testte YANLIŞ BİRİMİ ölçüyordu.** Her
      // yineleme Chromium'da tam bir panorama çiziyor; dosya tek başına 42 sn sürüyor.
      // Tam paket paralel koşarken `veri-hikayesi` dilimi tavanı aştı ve kapı
      // KIRMIZI döndü — ama kırılan şey render değil, ZAMANLAYICIYDI. Kardeş render
      // testleri (`duzen-provasi.test.ts`) zaten 60_000 taşıyor; buradaki eksikti.
      // Gevşetme değil hizalama: yanlış alarm veren kapı beş gün içinde görmezden gelinir.
      // ⚠ ⚠ **TAVAN 60 → 120 s: TASARIM DEĞİL SAYAÇ.** Kapı grubunda paralel yük altında
      // `veri-hikayesi` 60007 ms sonunda düştü; tek başına hepsi geçiyor ve dosyanın tamamı
      // 92 s sürüyor. Bu iddia HER desteyi tarayıcıda tek tek açıyor ve desteler bu turda
      // ağırlaştı: alan sınırı noktaları arttı, beşinci görsel yuvası eklendi.
      // ⚠ Bir zaman aşımını kırmızı kapı sanıp tasarımı değiştirmek, bu fazda bir kez
      // daha yapılacak hataydı — ölçüldü, sayaç yükseltildi.
      // ⚠ ⚠ **YORUMDA KESME İŞARETİ YOK ve bu ZORUNLU:** `denetim-tavani` kaynağı naif
      // tarıyor; bir kesme işareti onun için dize başlangıcıdır ve kapanış parantezini
      // yutuyor. İlk yazımda ms + kesme işareti yazdım, kapı testi zaman aşımı yok diye
      // reddetti — kapı haklıydı, yorumun kendisi ölçümü bozuyordu.
    }, 120_000)
  }
})

describe('sözleşmeler — kural CSS’te duruyor mu', () => {
  const kapak = (): PanoramaBelgesi => belge(ORNEKLER['sahne'] as Ornek)

  it('eşikler ARAŞTIRMADAN ve ÖLÇÜMDEN geliyor — 93 px, %40, 120 luma', () => {
    expect(DIKIS_BANDI).toBe(93)
    expect(EZICI_PAY).toBe(0.4)
    expect(ZEMINDEN_AYRISMA).toBe(120)
    // ⚠ ⚠ **TAVAN 60 → 120 s: TASARIM DEĞİL SAYAÇ.** Kapı grubunda paralel yük altında
    // `veri-hikayesi` 60007 ms sonunda düştü; tek başına hepsi geçiyor ve dosyanın tamamı
    // 92 s sürüyor. Bu iddia HER desteyi tarayıcıda tek tek açıyor ve desteler bu turda
    // ağırlaştı: alan sınırı noktaları arttı, beşinci görsel yuvası eklendi.
    // ⚠ Bir zaman aşımını kırmızı kapı sanıp tasarımı değiştirmek, bu fazda bir kez
    // daha yapılacak hataydı — ölçüldü, sayaç yükseltildi.
    // ⚠ ⚠ **YORUMDA KESME İŞARETİ YOK ve bu ZORUNLU:** `denetim-tavani` kaynağı naif
    // tarıyor; bir kesme işareti onun için dize başlangıcıdır ve kapanış parantezini
    // yutuyor. İlk yazımda ms + kesme işareti yazdım, kapı testi zaman aşımı yok diye
    // reddetti — kapı haklıydı, yorumun kendisi ölçümü bozuyordu.
  }, 120_000)

  it('tanım ögeleri akışın DIŞINDA — sahneyi kaydıramazlar', () => {
    expect(panoramaHtml(kapak())).toContain(FILTRE_TANIM_CSS.trim())
  })

  // ⚠ Krom için SENTETİK ihlal DENENDİ ve tutmadı: tam kadraj BEYAZ bir görselle bile
  // kusur çıkmıyor, çünkü rayın perdesi zemini yeterince bastırıyor. Sistem doğru
  // davranıyor; sahte bir ihlal ancak perdeyi kaldırarak kurulabilirdi. Bu yüzden ALT
  // SÖZLEŞME sınanıyor: perde kalkarsa yukarıdaki altı ölçüm kendiliğinden kırmızıya
  // döner, bu test ise SEBEBİ söyler.
  it('perde sözleşmesi: ray kendi zeminini TAŞIYOR', () => {
    const css = panoramaHtml(kapak())
    expect(/\.ray \{ padding-bottom[^}]*background: linear-gradient\(to top,/.test(css)).toBe(true)
    expect(css).toContain('var(--kart-zemin)')
  })
})

describe('kasten ihlal — ölçüm gerçekten kırmızıya dönüyor mu (R-71)', () => {
  it('kesime DAYANAN görsel yakalanıyor', async () => {
    const o = ORNEKLER['sahne']
    expect(o).toBeDefined()
    if (o === undefined) return
    const g = o.gorseller[0]
    expect(g).toBeDefined()
    if (g === undefined) return
    const toplam = o.slaytGenisligi * o.kartlar.length
    // Kutunun SAĞ kenarı kesime tam oturuyor: ne aşıyor ne uzak — yasak bölge.
    const daya = ((o.slaytGenisligi - (g.genislik / 100) * toplam) / toplam) * 100
    const r = await panoramaDenetle({ ...belge(o), gorseller: [{ ...g, x: daya }] })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(suzgec(r.value, 'dikis-bandinda').length).toBeGreaterThan(0)
    // ⚠ ⚠ **TAVAN 60 → 120 s: TASARIM DEĞİL SAYAÇ.** Kapı grubunda paralel yük altında
    // `veri-hikayesi` 60007 ms sonunda düştü; tek başına hepsi geçiyor ve dosyanın tamamı
    // 92 s sürüyor. Bu iddia HER desteyi tarayıcıda tek tek açıyor ve desteler bu turda
    // ağırlaştı: alan sınırı noktaları arttı, beşinci görsel yuvası eklendi.
    // ⚠ Bir zaman aşımını kırmızı kapı sanıp tasarımı değiştirmek, bu fazda bir kez
    // daha yapılacak hataydı — ölçüldü, sayaç yükseltildi.
    // ⚠ ⚠ **YORUMDA KESME İŞARETİ YOK ve bu ZORUNLU:** `denetim-tavani` kaynağı naif
    // tarıyor; bir kesme işareti onun için dize başlangıcıdır ve kapanış parantezini
    // yutuyor. İlk yazımda ms + kesme işareti yazdım, kapı testi zaman aşımı yok diye
    // reddetti — kapı haklıydı, yorumun kendisi ölçümü bozuyordu.
  }, 120_000)

  // ⚠ ⚠ **BU KUSUR SENTETİK OLARAK ÜRETİLEMİYOR ve denemesi öğreticiydi:** `tema-uyum`
  // listeden düşürülünce görsel HAM çiziliyor ve ham hâli düzeltilmişten biraz KOYU —
  // yani ölçüm yeşil kalıyor. Kusuru üreten şey işlemin yokluğu değil, YANLIŞ KUTUPTA
  // uygulanması. O da ancak kaynağı bozarak kurulabilir; elle yapıldı ve ölçüm üç
  // görselde 60 · 44 · 82 verdi (eşik 120), diğerleri sessiz kaldı.
  //
  // Bu yüzden burada ZİNCİR sınanıyor: kutup bilgisi üretim yoluna gerçekten ULAŞIYOR
  // mu. Kopan bir zincirde yukarıdaki altı ölçüm kendiliğinden kırmızıya döner.
  // 🧪 ⚠ **KASTEN İHLAL** (R-71): şerit tam boya çıkarılıyor — düzeltmeden önceki hâl.
  // ⚠ Bu kural D-324'ün KENDİ CÜMLESİNİ bozuyor: *"tam kadraj fotoğrafın üstünde künye
  // meşrudur"* denmişti ve ölçülmemişti. Üç slaytta yanlış çıktı.
  it('tam boy şerit krom bandına giriyor — ölçüm boş değil', async () => {
    const o = ORNEKLER['editoryal']
    expect(o).toBeDefined()
    if (o === undefined) return
    const tamBoy = { ...belge(o), gorseller: o.gorseller.map((g) => ({ ...g, yukseklik: 100 })) }
    const r = await panoramaDenetle(tamBoy)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const bulgu = suzgec(r.value, 'krom-seridine-giriyor')
    expect(bulgu.length).toBeGreaterThan(0)
    expect(bulgu[0]).toContain('px')
    // ⚠ ⚠ **TAVAN 60 → 120 s: TASARIM DEĞİL SAYAÇ.** Kapı grubunda paralel yük altında
    // `veri-hikayesi` 60007 ms sonunda düştü; tek başına hepsi geçiyor ve dosyanın tamamı
    // 92 s sürüyor. Bu iddia HER desteyi tarayıcıda tek tek açıyor ve desteler bu turda
    // ağırlaştı: alan sınırı noktaları arttı, beşinci görsel yuvası eklendi.
    // ⚠ Bir zaman aşımını kırmızı kapı sanıp tasarımı değiştirmek, bu fazda bir kez
    // daha yapılacak hataydı — ölçüldü, sayaç yükseltildi.
    // ⚠ ⚠ **YORUMDA KESME İŞARETİ YOK ve bu ZORUNLU:** `denetim-tavani` kaynağı naif
    // tarıyor; bir kesme işareti onun için dize başlangıcıdır ve kapanış parantezini
    // yutuyor. İlk yazımda ms + kesme işareti yazdım, kapı testi zaman aşımı yok diye
    // reddetti — kapı haklıydı, yorumun kendisi ölçümü bozuyordu.
  }, 120_000)

  // 🧪 ⚠ **KASTEN İHLAL** (R-71): kaynak satırı boşaltılıyor. Düzeltmeden önce bu hâl
  // SESSİZDİ — boş bir `<span>` çiziliyor, slayt kusursuz görünüyor ve kaynağını
  // kaybetmiş oluyordu. Sistemin tek imzası kaynak satırıdır (§8).
  it('boş kaynak satırı GÖRÜNÜR bir kutu bırakıyor ve raporlanıyor', async () => {
    const o = ORNEKLER['veri-hikayesi']
    expect(o).toBeDefined()
    if (o === undefined) return
    const kaynaksiz = {
      ...belge(o),
      kartlar: o.kartlar.map((k, i) => (i === 0 ? { ...k, rayaOrta: '' } : k)),
    } as unknown as PanoramaBelgesi
    // Önce ÇİZİLİYOR mu: sessiz bir boşluk hiçbir ölçümü tetiklemez.
    expect(panoramaHtml(kaynaksiz)).toContain('ray-orta-bos')
    const r = await panoramaDenetle(kaynaksiz)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const bulgu = r.value.filter((k) => k.tur === 'kaynak-yok')
    expect(bulgu.length).toBe(1)
    expect(bulgu[0]?.kart).toBe(1)
    // ⚠ ⚠ **TAVAN 60 → 120 s: TASARIM DEĞİL SAYAÇ.** Kapı grubunda paralel yük altında
    // `veri-hikayesi` 60007 ms sonunda düştü; tek başına hepsi geçiyor ve dosyanın tamamı
    // 92 s sürüyor. Bu iddia HER desteyi tarayıcıda tek tek açıyor ve desteler bu turda
    // ağırlaştı: alan sınırı noktaları arttı, beşinci görsel yuvası eklendi.
    // ⚠ Bir zaman aşımını kırmızı kapı sanıp tasarımı değiştirmek, bu fazda bir kez
    // daha yapılacak hataydı — ölçüldü, sayaç yükseltildi.
    // ⚠ ⚠ **YORUMDA KESME İŞARETİ YOK ve bu ZORUNLU:** `denetim-tavani` kaynağı naif
    // tarıyor; bir kesme işareti onun için dize başlangıcıdır ve kapanış parantezini
    // yutuyor. İlk yazımda ms + kesme işareti yazdım, kapı testi zaman aşımı yok diye
    // reddetti — kapı haklıydı, yorumun kendisi ölçümü bozuyordu.
  }, 120_000)

  it('kutup zinciri: açık kartın görseli açık tema kimliğini ÇAĞIRIYOR', () => {
    expect(islemZinciri(['tema-uyum'], true)).toContain(ACIK_TEMA_KIMLIGI)
    expect(islemZinciri(['tema-uyum'], false)).not.toContain(ACIK_TEMA_KIMLIGI)
    // ⚠ Kataloğun `src`i BOŞ ve boş `src` yer tutucuya düşüyor — yer tutucunun filtre
    // zinciri yok. Zincir ancak GERÇEK bir görselde kuruluyor, o yüzden tek piksellik
    // bir kaynak veriliyor: ölçülen şey `<img>` yolunun ta kendisi.
    const gorselli = (o: Ornek): PanoramaBelgesi => ({
      ...belge(o),
      gorseller: o.gorseller.map((g) => ({ ...g, src: TEK_PIKSEL })),
    })
    // `memphis` kâğıt kartlarda özne taşıyor: üretilen HTML açık varyantı çağırmalı.
    const acik = ORNEKLER['memphis']
    expect(acik).toBeDefined()
    if (acik === undefined) return
    expect(panoramaHtml(gorselli(acik))).toContain(`url(#${ACIK_TEMA_KIMLIGI})`)
    // `sahne` koyu kartlarda: açık varyant HİÇ çağrılmamalı.
    const koyu = ORNEKLER['sahne']
    expect(koyu).toBeDefined()
    if (koyu === undefined) return
    expect(panoramaHtml(gorselli(koyu))).not.toContain(`url(#${ACIK_TEMA_KIMLIGI})`)
  })

  it('kural iptal edilince sahne GERÇEKTEN kayıyor', async () => {
    const o = ORNEKLER['sahne']
    expect(o).toBeDefined()
    if (o === undefined) return
    const bozuk = panoramaHtml(belge(o)).replace(
      '</style>',
      '.filtre-tanim { position: static; width: auto; height: auto }</style>'
    )
    const r = await withPage(async (page) => {
      await page.setViewportSize({ width: o.slaytGenisligi, height: o.yukseklik })
      await page.setContent(bozuk, { waitUntil: 'load' })
      return page.evaluate(
        `(() => Math.round(document.getElementById('sahne').getBoundingClientRect().top))()`
      )
    })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.value as number).toBeGreaterThan(0)
  })
})
