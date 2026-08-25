// Zemin reçetesi — katman, sıra, karışım (FAZ-15.3 · §12.1).

import { describe, expect, it } from 'vitest'
import {
  YUZEYLER,
  grenKipi,
  grenOpakligi,
  yuzeyKatmanlari,
  zeminCss,
  zeminKarisimi,
  type ZeminResetesi,
} from './zemin.js'

// Örnek yüzey açıklığı — `--ramp-marka-ink-950` = `oklch(0.165)`.
const L = 0.165

const recete = (ek: Partial<ZeminResetesi> = {}): ZeminResetesi => ({
  taban: '--ramp-marka-ink-950',
  katmanlar: [
    {
      tip: 'dogrusal',
      aci: 104,
      duraklar: [
        { renk: '--ramp-marka-ink-950', konum: 0 },
        { renk: '--ramp-marka-ink-800', konum: 46 },
      ],
    },
    { tip: 'isik', x: 16, y: 24, capX: 52, capY: 78, renk: '--ramp-marka-bakir-500', guc: 17 },
    { tip: 'vinyet', guc: 34 },
  ],
  ...ek,
})

describe('zemin reçetesi', () => {
  it('taban EN ALTTA — katmanlar onun üstünde', () => {
    const css = zeminCss(recete(), L)
    expect(css.endsWith('var(--ramp-marka-ink-950)')).toBe(true)
  })

  // ⚠ CSS `background`ta İLK katman en öndedir; reçete "önce taban, sonra üstü" diye
  // okunuyor. Çevrim yapılmasaydı vinyet degradenin altında kalır ve HİÇ görünmezdi.
  it('reçetede SON yazılan katman zeminde EN ÜSTTE çıkıyor', () => {
    const css = zeminCss(recete(), L)
    const vinyet = css.indexOf('ellipse 78% 88%')
    const dogrusal = css.indexOf('linear-gradient(104deg')
    expect(vinyet).toBeGreaterThanOrEqual(0)
    expect(vinyet).toBeLessThan(dogrusal)
  })

  it('gren KENDİLİĞİNDEN ekleniyor — kapatma alanı yok', () => {
    expect(zeminCss(recete(), L)).toContain('feTurbulence')
  })

  // ⚠ ⚠ **BU TESTİN İDDİASI TERSİNE DÖNDÜ ve sebebi bir ÖLÇÜM (FAZ-19.4).** Eskiden
  // *"degrade yoksa gren de yok — dither edilecek bir bant yok"* diyordu. Degrade yasağı
  // (D-318) yürürlükteyken o koşul HİÇ sağlanmadı: on şablonun hiçbirinde gren olmadı ve
  // on kapağın %67,7–%92,3'ü tek bir RGB değerine düştü. **Düz zemin, dither edilecek
  // bant OLMAYAN zemin değildir — bandın en uzun olduğu zemindir.**
  it('degrade YOKKEN de gren VAR — düz zemin greni en çok isteyen zemindir', () => {
    const dokusuz = recete({ katmanlar: [{ tip: 'vinyet', guc: 20 }] })
    expect(zeminCss(dokusuz, L)).toContain('feTurbulence')
  })

  // ⚠ ⚠ **SESSİZ ARIZA KİLİDİ (R-85 sınıfı).** `baseFrequency` tam sayı olursa Perlin
  // kafesi piksel ızgarasına oturur ve gren σ 0,000'a düşer — HATA VERMEDEN. Ölçüm:
  // 0.99 → 4,10 · 1 → 0,000 · 1.01 → 4,11 · 2 → 0,000.
  it('`baseFrequency` TAM SAYI DEĞİL — tam sayıda gren sessizce ölür', () => {
    const m = /baseFrequency='([0-9.]+)'/.exec(zeminCss(recete(), L))
    expect(m, 'baseFrequency üretilen CSS`te yok').not.toBeNull()
    expect(Number.isInteger(Number(m?.[1]))).toBe(false)
  })

  // ⚠ ⚠ **KURAL VARDI, KAPSAMI TEK REÇETEYDİ.** Yukarıdaki iddia yalnız varsayılan
  // reçeteyi sınıyordu; oysa YEDİ yüzey ailesi var (19.4'te kuruldu) ve her biri kendi
  // dokusunu üretiyor. Bu deponun tekrar eden hatası tam olarak bu: bir kural doğru
  // yazılıyor, sonra sistem etrafında büyüyor ve kural yeni durumları kapsamıyor
  // (`kapanis-temiz` iki taşıyıcı tipi için yazılmıştı, beş tip vardı).
  // ⚠ Her yüzey ve iki uç luminans (koyu 0,18 · açık 0,92) taranıyor: gren opaklığı
  // luminansla değiştiği için frekans üretimi de zemine göre değişebilir.
  it('YEDİ yüzeyin YEDİSİNDE de baseFrequency tam sayı DEĞİL', () => {
    const kotu: string[] = []
    for (const y of YUZEYLER) {
      for (const isik of [0.18, 0.92]) {
        // ⚠ Yüzey `ZeminResetesi`nin alanı DEĞİL: doku katmanları ayrı üretiliyor.
        // İlk yazımda `recete({ yuzey })` denendi ve `types` kapısı TS2353 ile reddetti —
        // kural doğruydu, çağrı yanlıştı.
        const katmanlar = [
          zeminCss(recete(), isik),
          ...yuzeyKatmanlari(y, grenOpakligi(isik) * 100).katmanlar,
        ].join(' ')
        for (const m of katmanlar.matchAll(/baseFrequency='([0-9.\s]+)'/g)) {
          const parcalar = (m[1] ?? '').trim().split(/\s+/).map(Number)
          for (const n of parcalar)
            if (Number.isInteger(n)) kotu.push(`${y}@${String(isik)}: ${String(n)}`)
        }
      }
    }
    expect(
      kotu.join(' · '),
      'tam sayı baseFrequency: Perlin kafesi piksel ızgarasına oturur ve gren σ 0,000`a ' +
        'düşer — HATA VERMEDEN'
    ).toBe('')
  })

  // ⚠ Sabit opaklık koyu zeminde σ 0,70 üretiyor ve σ<1,0 gren JPEG tarafından SİLİNİYOR.
  it('gren opaklığı yüzey luminansıyla TERS ölçekliyor', () => {
    expect(grenOpakligi(0.18)).toBe(0.7)
    expect(grenOpakligi(0.3)).toBe(0.4)
    expect(grenOpakligi(0.5)).toBe(0.25)
    expect(grenOpakligi(0.8)).toBe(0.35)
    // Mürekkep zemin, orta zeminden DAHA ÇOK gren istiyor.
    expect(grenOpakligi(0.18)).toBeGreaterThan(grenOpakligi(0.5))
  })

  // ⚠ ⚠ **KİP DE LUMİNANSIN FONKSİYONU ve bunu ÖLÇÜM dayattı.** `soft-light` çarpımsal:
  // saf siyahta çarpacak bir şey yok, kâğıtta doyum var. On kapak render edilip düz
  // blokların medyan σ'sı ölçüldüğünde `#fafafa` şablonlarında blokların **%87'si
  // σ<0,5** çıktı — yani JPEG greni tamamen siliyordu. Uçlarda `normal` kullanılıyor;
  // `normal`ın σ'sı ölçüm tablosunda luminanstan BAĞIMSIZ.
  it('uçlarda `normal`, ortada `soft-light` — soft-light siyahta çarpacak şey bulmuyor', () => {
    expect(grenKipi(0.105)).toBe('normal') // #040404
    expect(grenKipi(0.98)).toBe('normal') // #fafafa
    expect(grenKipi(0.16)).toBe('soft-light')
    expect(grenKipi(0.5)).toBe('soft-light')
    // Uçta opaklık DÜŞÜK olmalı: `normal` dither eder ama görünür film grenine döner.
    expect(grenOpakligi(0.105)).toBeLessThan(grenOpakligi(0.18))
  })

  // ⚠ ⚠ **SIRA EŞLEŞMESİ.** `background-blend-mode` listesi `background` listesiyle
  // birebir aynı uzunlukta olmalı; kaydığı an karışım YANLIŞ katmana uygulanır ve bu
  // bakınca bile zor görülür.
  it('karışım listesi katman listesiyle aynı uzunlukta', () => {
    // ⚠ Düz `split(',')` işe yaramıyor: `linear-gradient(...)` kendi içinde virgül
    // taşıyor. İlk sürüm tam bunu yaptı ve 5 yerine 13 saydı — ölçüm aracının kendisi
    // bozuktu, ölçtüğü şey değil. Derinlik sayan bir ayırıcı gerekiyor.
    const ustDuzeyVirgul = (s: string): number => {
      let derinlik = 0
      let parca = 1
      for (const c of s) {
        if (c === '(') derinlik += 1
        else if (c === ')') derinlik -= 1
        else if (c === ',' && derinlik === 0) parca += 1
      }
      return parca
    }
    for (const r of [recete(), recete({ katmanlar: [{ tip: 'vinyet', guc: 20 }] })])
      expect(ustDuzeyVirgul(zeminKarisimi(r))).toBe(ustDuzeyVirgul(zeminCss(r, L)))
  })

  // ⚠ ⚠ **`overlay` DEĞİL `soft-light` — ve eski kayıt YANLIŞ DEĞİL EKSİKTİ.** Eski
  // ölçüm PNG alanında yapılmıştı; yayın JPEG (R-90). `overlay`+26, `#040404` zemininde
  // σ≈0,5 üretiyor ve q=82 onu TAMAMEN siliyor. `soft-light` + luminansa bağlı opaklık
  // σ≈2,0 tutuyor, düz plato %95'ten %20'ye iniyor.
  it('gren `soft-light` ile bindiriliyor — JPEG onu silmesin', () => {
    expect(zeminKarisimi(recete()).startsWith('soft-light')).toBe(true)
  })

  // ⚠ Serbest renk TEMSİL EDİLEMİYOR: her renk `--ramp-` ön ekli bir token.
  it('üretilen CSS`te rampa dışı renk literali yok', () => {
    const css = zeminCss(recete(), L)
    const renkler = css.match(/var\(--[a-z0-9-]+\)/g) ?? []
    expect(renkler.length).toBeGreaterThan(0)
    for (const r of renkler) expect(r.startsWith('var(--ramp-')).toBe(true)
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}(?![^(]*\.svg)/)
    expect(css).not.toMatch(/rgba?\(/)
  })

  it('gren determinist — seed açıkça yazılı (R-06)', () => {
    expect(zeminCss(recete(), L)).toContain("seed='7'")
  })
})
