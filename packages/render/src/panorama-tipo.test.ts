// Panorama tipografi ekseni ve zeminden türeyen renk (FAZ-15.2 · §12.3 · R-23).
//
// ⚠ Bu dosya İKİ zincir kopukluğunu kapatan değişikliği bekliyor: (a) `Archivo`nun
// değişken genişlik ekseni depoda duruyordu ve panorama onu hiç kullanmıyordu,
// (b) panel/ray renkleri `rgba(255,255,255,…)` sabitiydi ve kâğıt zeminli şablonlarda
// görünmüyordu. İkisi de "modül var, üretim yolu yok" sınıfının üyesi (D-261).

import { describe, expect, it } from 'vitest'
import type { AssetStamp } from '@suite/kernel'
import type { BrandId, EraId } from '@suite/contracts'
import {
  panoramaHtml,
  puntoOlcumu,
  VARSAYILAN_TIPO,
  type PanoramaBelgesi,
  type Yerlesim,
  hayaletPuntosu,
} from './panorama.js'

const stamp: AssetStamp = {
  brandId: 'brd_upcytech' as BrandId,
  eraId: 'era_imalat_2026' as EraId,
  kitVersion: 'kit-1',
  definitionDigest: 'sha256:abc',
  contextManifest: 'ctx-1',
  sourceRunId: 'run_1',
}

const belge = (ek: Partial<PanoramaBelgesi> = {}): PanoramaBelgesi => ({
  slaytGenisligi: 1080,
  yukseklik: 1350,
  kartlar: [
    {
      ustBaslik: 'BÖLÜM 01',
      baslik: 'Geri kazanım **kapasitesi**',
      govde: 'Akış hacmi belirleyici oldu.',
      panel: {
        tip: 'cubuklar',
        baslik: 'AKIŞ',
        satirlar: [{ etiket: '2025', deger: 77, not: '77,4 bin ton', tahmin: true }],
      },
      hayalet: '77',
      rayaSol: 'UPCYTECH',
      rayaOrta: 'TÜİK 2025',
    },
  ],
  bant: { tip: 'yok' },
  gorseller: [],
  zemin: 'var(--role-surface)',
  tokenCss: ':root{--role-bg:#f2b705;--role-surface:#fff;--role-line-edge:#111}',
  stamp,
  ...ek,
})

describe('panorama tipografi ekseni', () => {
  // ⚠ ⚠ **DÖRT AİLE, DÖRT ROL (D-317).** Genişlik ekseni emekli oldu; onun yerine
  // ölçülen şey rollerin GERÇEKTEN ayrıldığı: kapak H1'i serif, gövde slaytları
  // Montserrat, eyebrow mono ve BÜYÜK HARF. Aynı yüzü her yere vermek sistemin en açık
  // kuralını sessizce silmek olurdu ve CSS'e bakmadan fark edilmezdi.
  it('KAPAK başlığı serif, gövde başlıkları Montserrat', () => {
    const html = panoramaHtml(belge())
    expect(html).toContain('.baslik { font-family: "Marka Baslik"')
    expect(html).toContain('.kart.ilk .baslik { font-family: "Marka Display"')
    // Emekli eksen hiçbir yerde kalmadı: kırpılan bir `font-stretch` reçeteyi
    // yalancı yapardı.
    expect(html).not.toContain('font-stretch')
    expect(html).not.toContain('--baslik-wdth')
  })

  it('eyebrow MONO ve BÜYÜK HARF, +0.08em', () => {
    const html = panoramaHtml(belge())
    expect(html).toContain('.ust-baslik { font-family: "Marka Mono"')
    expect(html).toContain('letter-spacing: 0.08em; text-transform: uppercase')
  })

  it('rakamlar MONO ve tabular — bir sayı bir kelime değil bir ÖLÇÜM', () => {
    const html = panoramaHtml(belge())
    expect(html).toContain('.sayi { font-family: "Marka Mono"')
    expect(html).toContain('font-variant-numeric: tabular-nums')
  })

  it('punto CSS`te sabit değil, değişkenden geliyor', () => {
    const html = panoramaHtml(belge())
    // ⚠ Punto artık elle ayar çarpanıyla sarılı (FAZ-16.1). Değişmez aynı — punto
    // SABİT değil, değişkenden geliyor — sadece formül bir çarpan kazandı.
    expect(html).toContain('font-size: calc(var(--baslik-punto) * var(--ayar-olcek, 1))')
    // 82 px'lik eski sabit hiçbir yerde kalmadı.
    expect(html).not.toContain('font-size: 82px')
  })

  it('tabular rakam açık — sayı sütunları hizalanıyor', () => {
    const html = panoramaHtml(belge())
    expect(html).toContain('font-variant-numeric: tabular-nums')
  })
})

describe('zeminden türeyen renk', () => {
  // ⚠ ⚠ **İHLAL TESTİ: tek bir sabit beyaz bile kaldıysa kırmızı.** Kural "çoğu yerde
  // düzeltildi" değil; kâğıt zeminde görünmeyen TEK bir öge, o şablonu eksik yapar.
  it('panoramada hiçbir sabit rgba(255,255,255) kalmadı', () => {
    const html = panoramaHtml(belge())
    expect(html).not.toMatch(/rgba\(255,\s*255,\s*255/)
  })

  // ⚠ Eskiden `color-mix(in oklab, var(--pano-metin)` aranıyordu; o kullanım
  // `.madalyon-ad`daydı ve madalyon silindi (D-306). Değişmez aynı — kart DIŞI ögelerin
  // rengi belgeden türüyor — ama kanıtı artık DOĞRUDAN kullanımda: `.kilometre-etiket`.
  // Silinen bir ögenin izini aramak, kuralı değil o ögeyi test etmek olurdu.
  it('kart dışı ögeler `--pano-metin`den türüyor', () => {
    const html = panoramaHtml(belge())
    expect(html).toContain('--pano-metin:')
    expect(html).toContain('color: var(--pano-metin)')
    // Kart dışı hiçbir öge sabit renk taşımıyor.
    expect(html).not.toMatch(/\.kilometre-etiket[^}]*color:\s*#/)
  })

  // ⚠ ⚠ **KOYU ZEMİN METNİ ARTIK KENDİ TOKEN'I (D-318).** Eskiden "açık olan neyse metin
  // odur" diye kâğıt rengine bağlıydı; sistem ikisini ayırıyor — kâğıt #fafafa, koyu
  // zemin metni #eeeeee. Fark küçük ve kasıtlı: saf beyaza yakın metin OLED'de halasyon
  // yapıyor. Test iki YÜZEYİN AYRI token okuduğunu ölçüyor.
  it('kâğıt zeminde metin MÜREKKEP, koyu zeminde kendi metin token`ı', () => {
    const acik = panoramaHtml(belge({ zemin: 'var(--role-surface)' }))
    const koyu = panoramaHtml(belge({ zemin: 'var(--role-line-edge)' }))
    expect(acik).toContain('--kart-metin:var(--role-line-edge)')
    expect(koyu).toContain('--kart-metin:var(--role-metin-koyu')
  })

  // ⚠ Kâğıtta aksan artık MAVİ (5.34:1), mürekkep değil: sistemin kâğıt için ayrı bir
  // aksan adımı var ve karosel tek bir aksanla konuşuyor.
  it('kâğıt zeminde aksan MAVİ — karosel tek aksanla konuşuyor', () => {
    const acik = panoramaHtml(belge({ zemin: 'var(--role-surface)' }))
    expect(acik).toContain('--kart-aksan:var(--role-vurgu-acik')
  })

  // ⚠ Vurgu çipi emekli: aksan asla bir zemin ya da büyük yüzey değil.
  it('vurgu bir KUTU değil RENK — çip kalmadı', () => {
    const html = panoramaHtml(belge({ zemin: 'var(--role-surface)' }))
    expect(html).not.toContain('--kart-cip')
    expect(html).toContain('.baslik strong { color: var(--kart-aksan)')
  })
})

// ⚠ ⚠ **SINIF ADI ÇAKIŞMASI — gerçek bir görsel kusurun kaynağıydı.** Kesim ayracı
// `.kesik` sınıfını kullanıyordu ve kırpma biçimi de görsele `class="gorsel kesik"`
// yazıyor; ayracın %6 beyaz zemini görselin TÜM kutusuna uygulanıp kesik öznenin
// arkasında dev bir dikdörtgen bırakıyordu. Ölçüldü: yuva içi/dışı farkı +9,9 → −1,2.
// ⚠ ⚠ **KESİM AYRACI KALDIRILDI (D-300)** — üretim dilimlerine sızıyordu: `left: i × G`
// konumundaki 1 px'lik çizgi, dilimlemeden sonra (i+1). slaydın sıfırıncı sütunu oluyor
// ve gerçek üretim slaytlarında +11,3 parlaklık farkı ölçüldü. Eski test ayracın VARLIĞINI
// doğruluyordu; artık YOKLUĞUNU doğruluyor.
describe('kesim ayracı üretim çıktısına SIZMIYOR', () => {
  it('panorama HTML hiçbir ayraç düğümü basmıyor', () => {
    const iki = belge()
    const html = panoramaHtml({ ...iki, kartlar: [...iki.kartlar, ...iki.kartlar] })
    expect(html).not.toContain('class="kesim"')
    expect(html).not.toMatch(/[\s,]\.kesim \{/)
  })
})

// ⚠ ⚠ **GERÇEK KOŞUDAN: model hayalete KELİME yazıyor.** Sözleşme "kısa: rakam/sembol"
// diyor ama bu bir RİCA; 470px sabit puntoda "Kopukluk" üç slaydı kat edip başlıkla
// yarıştı. Ölçek uyarlanıyor, uyarlama reddedilmiyor (D-273).
describe('hayalet puntosu uzunluğa göre küçülüyor', () => {
  it('rakam DEV kalıyor, kelime bir slayda iniyor', () => {
    expect(hayaletPuntosu('2×', 1)).toBe(470)
    expect(hayaletPuntosu('01', 1)).toBe(470)
    // Altı harfli bir kelime yarıdan aza inmeli, yoksa kesimleri kat eder.
    expect(hayaletPuntosu('Hafıza', 1)).toBeLessThan(470 * 0.55)
    // Taban var: sonsuza kadar küçülüp süse dönüşmemeli.
  })

  // ⚠ ⚠ **ÜÇ KARAKTERLİK BİR KELİME, ÜÇ KARAKTERLİK BİR SAYI DEĞİLDİR.** İlk kural adet
  // sayıyordu ve `TEK` de `01` gibi tam punto alıp 729 px'e çıktı — bir slaydı kaplayıp
  // başlığın üstüne bindi. Gerçek koşuda `sus-baskin` yakaladı (süs %41, içerik %27).
  it('rakam ile aynı uzunlukta KELİME aynı puntoyu almıyor', () => {
    const rakam = hayaletPuntosu('01', 1)
    const kelime = hayaletPuntosu('TEK', 1)
    expect(rakam).toBeGreaterThan(kelime)
    // Kelime bir slaydın %86'sını aşmamalı: em tahmini × punto ≤ 1080 × 0,86.
    expect(kelime * 3 * 0.72).toBeLessThanOrEqual(1080 * 0.87)
  })

  it('ölçek çarpanı korunuyor', () => {
    expect(hayaletPuntosu('01', 0.5)).toBe(235)
  })
})

// ⚠ ⚠ **ZEMİN KOYULUĞU ADDAN DEĞİL AÇIKLIKTAN.** Eski sürüm token ADINDA 'ink' ya da
// 'line-edge' arıyordu; `memphis`e lacivert bir kart zemini (`--ramp-marka-mavi-700`)
// eklenince sessizce "açık" dedi ve koyu mavi üstüne koyu metin çizdi — slayt okunmaz
// oldu. **Adı ölçmek, şeyi ölçmek değildir.**
describe('kart metni zeminin AÇIKLIĞINA göre seçiliyor', () => {
  const token =
    ':root{--ramp-marka-mavi-700: oklch(0.408 0.092 252);' +
    '--ramp-marka-kagit: oklch(0.962 0.006 90);--kart: var(--ramp-marka-mavi-700)}'
  const kur = (zemin: string) => {
    const b = belge()
    return panoramaHtml({
      ...b,
      tokenCss: token,
      kartlar: b.kartlar.map((k) => ({ ...k, zemin })),
    })
  }

  it('lacivert kart KOYU sayılıyor — adında ink/line-edge geçmese bile', () => {
    // Koyu kartta `acik` sınıfı OLMAMALI: o sınıf metni mürekkebe çeviriyor.
    expect(kur('var(--ramp-marka-mavi-700)')).not.toContain('class="kart acik')
  })

  it('kâğıt kart AÇIK sayılıyor', () => {
    expect(kur('var(--ramp-marka-kagit)')).toContain('class="kart acik')
  })

  // ⚠ ⚠ **KASKAT OKUNMALI, DOSYA DEĞİL.** `tokens.css` dört yüzey bloğu taşıyor ve aynı
  // değişken hepsinde yeniden tanımlı. İlk sürüm ilk eşleşmeyi alıyordu: `--role-surface`
  // için KONSOL değerini (koyu) okuyup `donen`in kâğıt kartını "koyu" sandı, metni beyaz
  // yaptı ve başlık beyaz zeminde KAYBOLDU. Render `data-surface="kreatif"` ile çiziliyor.
  it('kreatif bloğu okunuyor — konsol bloğu DEĞİL', () => {
    const ikiBlok =
      ':root{--role-surface: oklch(0.21 0.010 250)}' +
      "[data-surface='console']{--role-surface: oklch(0.21 0.010 250);}" +
      "[data-surface='kreatif']{--role-surface: oklch(0.97 0.004 90);}"
    const b = belge()
    const html = panoramaHtml({
      ...b,
      tokenCss: ikiBlok,
      kartlar: b.kartlar.map((k) => ({ ...k, zemin: 'var(--role-surface)' })),
    })
    // Kreatif değeri 0,97 → AÇIK. Konsolunki 0,21 okunsaydı koyu sayılırdı.
    expect(html).toContain('class="kart acik')
  })
})

describe('çubuk paneli', () => {
  // ⚠ Yuva olmadan `width: %` esnek kapsayıcıda çözülmüyordu ve üç satır da aynı boyda
  // küçük kare çiziyordu: grafik hiçbir şey anlatmıyordu.
  it('çubuk bir yuvanın İÇİNDE — yüzde oranlanacak bir kutuya sahip', () => {
    const html = panoramaHtml(belge())
    expect(html).toContain('<span class="cubuk-yuva"><span class="cubuk')
    expect(html).toContain('.cubuk-yuva { flex: 1')
  })
})

describe('yerleşim', () => {
  const bekleme: readonly (readonly [Yerlesim, string])[] = [
    ['ust', 'flex-start'],
    ['ayrik', 'flex-start'],
    ['orta', 'center'],
    ['alt', 'flex-end'],
    // ⚠ ⚠ **`space-between` → `flex-start` (R-112).** Eşit dağılım boşluğu dört ögeye TEK
    // TEK bölüyordu ve üst etiketi başlığından koparıyordu: `donen`de açıklık 369 px,
    // ailenin sekizinde 14 px. Yayılma öbek-farkında yapıldı — gövde `margin-top: auto`
    // ile dibe iniyor, başlık öbeği üstte tek parça kalıyor.
    ['yayik', 'flex-start'],
  ]
  for (const [y, css] of bekleme)
    it(`\`${y}\` → justify-content: ${css}`, () => {
      expect(panoramaHtml(belge({ yerlesim: y }))).toContain(`justify-content: ${css}`)
    })

  // ⚠ `ust` ile `ayrik` aynı `justify-content`i veriyor ama panelde AYRIŞIYOR: ikisini
  // tek değerde tutmak, üstte hizalanıp panelini dipte istemeyen şablonu ifade edilemez
  // yapıyordu (`memphis`in paneli kesik öznenin arkasına düşüyordu).
  it('panel yalnız `ayrik`ta dibe itiliyor', () => {
    // ⚠ ⚠ **İDDİA AYNI, YAZIMI DEĞİŞTİ.** Bildirim artık `var(--pano-ust, …)` üzerinden
    // geçiyor (panolar taşıyıcıyı biniyor); dipe itme o değişkenin VARSAYILANINDA duruyor.
    // Metnin birebir kendisini aramak, kuralı değil noktalama işaretlerini sınamaktı.
    const dibe = 'margin-top: var(--pano-ust, auto)'
    expect(panoramaHtml(belge({ yerlesim: 'ayrik' }))).toContain(dibe)
    for (const y of ['ust', 'orta', 'alt', 'yayik'] as const)
      expect(panoramaHtml(belge({ yerlesim: y })), y).not.toContain(dibe)
  })
})

describe('punto ölçümü', () => {
  // ⚠ ⚠ **KENDİNİ ÖLÇEN METRİK TUZAĞI.** `.baslik` flex sütununda içeriğine göre daralıyor;
  // sınır `getBoundingClientRect` ile okunsaydı her puntoda "sığıyor" cevabı gelirdi ve
  // ölçüm asla kırmızıya dönmezdi. Bu oturumda aynı sınıf hata üç ayrı yerde çıktı.
  it('sütun sınırı ÖLÇÜLMÜYOR, sabit olarak gömülüyor', () => {
    const kod = puntoOlcumu(belge())
    expect(kod).not.toContain('getBoundingClientRect')
    // 1080 × 0,86 − 128 = 801
    expect(kod).toContain('const sinir = 801')
  })

  it('pay puntoyu çarpıyor — `editoryal` fısıldayabiliyor', () => {
    expect(puntoOlcumu(belge({ tipografi: { ...VARSAYILAN_TIPO, baslikPayi: 0.38 } }))).toContain(
      '* 0.38'
    )
  })
})
