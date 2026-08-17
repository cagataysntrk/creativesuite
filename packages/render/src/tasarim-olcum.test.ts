// Token çözümü — ÜÇ KADEME ve YÜZEY KAPSAMI (§12.1 · FAZ-10.7).
//
// Bu dosya, kontrast okumasının üretimde hiç ÜRETİLMEDİĞİ bulunduktan sonra yazıldı.
// Kapı yeşildi çünkü okuma yoktu; yokluk, geçme sanılıyordu.

import { describe, expect, it } from 'vitest'
import type { DocumentModel } from '@suite/kernel'
import { tasarimOlc } from './tasarim-olcum.js'

// Gerçek token dosyasının yapısı: rampalar `:root`ta, roller yüzey bloklarında ve
// roller RAMPAYA işaret ediyor — yani çözüm iki adım.
const CSS = `
:root {
  --ramp-gray-950: oklch(0.16 0.010 250);
  --ramp-marka-amber-500: oklch(0.80 0.156 87);
  --ramp-marka-ink-950: oklch(0.18 0.012 60);
  --role-bg: var(--ramp-gray-950);
  --role-text: var(--ramp-gray-50);
}
[data-surface='kreatif'] {
  --role-bg: var(--ramp-marka-amber-500);
  --role-text: var(--ramp-marka-ink-950);
}
[data-surface='studio'] {
  --role-bg: var(--ramp-gray-300);
  --role-text: var(--ramp-gray-950);
}
`

const belge = (tokenCss = CSS): DocumentModel => ({
  kind: 'post',
  width: 1080,
  height: 1350,
  tokenCss,
  stamp: {
    brandId: 'b',
    eraId: 'e',
    kitVersion: 'k',
    definitionDigest: 'd',
    contextManifest: 'c',
    sourceRunId: 'r',
  } as DocumentModel['stamp'],
  slayt: { role: 'kapak', index: 0, total: 3 },
  blocks: [{ type: 'heading', level: 1, text: 'Test' }],
})

const kontrast = (doc: DocumentModel) =>
  tasarimOlc({ slaytlar: [doc] }).readings.find((r) => r.metric === 'contrast_ratio')

describe('token çözümü', () => {
  it('İKİ KADEME çözülüyor: rol → rampa → renk', () => {
    // Tek adım çözen bir sürüm burada `undefined` verir — ilk sürüm tam olarak öyleydi
    // ve üretimde kontrast okuması HİÇ üretilmiyordu.
    const r = kontrast(belge())
    expect(r).toBeDefined()
    expect(r!.value).toBeGreaterThan(4.5)
  })

  it('KREATİF yüzeyi seçiliyor, son tanım DEĞİL', () => {
    // `studio` bloğu dosyada sonuncu. "Son tanım kazanır" deseydik ölçüm doğru bir sayı
    // üretip YANLIŞ şeyi ölçerdi: karosel `kreatif` yüzeyinde çiziliyor.
    // Kreatif: ink (0.18) üstünde amber (0.80) → yüksek kontrast.
    // Studio olsaydı: gray-950 metin, gray-300 zemin → farklı ve burada TANIMSIZ ramp.
    const r = kontrast(belge())
    expect(r!.value).toBeGreaterThan(8)
  })

  it('çözülemeyen token SIFIR yazmıyor — okuma HİÇ üretilmiyor', () => {
    // Ölçülemeyeni sıfır yazmak "mükemmel kontrast" göstermek olurdu.
    expect(
      kontrast(belge(':root{ --role-bg: var(--yok); --role-text: var(--yok2); }'))
    ).toBeUndefined()
  })

  it('döngüsel tanım SONSUZ DÖNGÜYE girmiyor', () => {
    const dongu =
      ':root{ --a: var(--b); --b: var(--a); --role-bg: var(--a); --role-text: var(--a); }'
    expect(kontrast(belge(dongu))).toBeUndefined()
  })
})

// ── Yay bütçesi: ritim ÖLÇÜLÜYOR (FAZ-14.1) ──────────────────────────────────

const kelimeler = (n: number): string => Array.from({ length: n }, () => 'kelime').join(' ')

const govdeSlayt = (index: number, metin: string): DocumentModel => ({
  ...belge(),
  slayt: { role: 'govde', index, total: 6 },
  blocks: [{ type: 'body', text: metin }],
})

const butce = (doc: DocumentModel) =>
  tasarimOlc({ slaytlar: [doc] }).readings.find((r) => r.metric === 'word_budget')

describe('yay bütçesi — ritim ölçüme giriyor', () => {
  it('AYNI metin, FARKLI slayt: gerilim aşıyor, kanıt aşmıyor', () => {
    // 25 kelime `kanit` (30) için meşru, `gerilim` (21) için aşım. Eski ölçüm ikisine de
    // 30 uyguluyordu; dört gövde satırı dört EŞİT paragraftı ve ritim ölçülemiyordu.
    const m = kelimeler(25)
    const gerilim = butce(govdeSlayt(1, m)) // yay(6)[1] = gerilim
    const kanit = butce(govdeSlayt(2, m)) // yay(6)[2] = kanit
    expect(gerilim).toBeDefined()
    expect(kanit).toBeDefined()
    expect(gerilim!.value).toBeGreaterThan(100)
    expect(kanit!.value).toBeLessThanOrEqual(100)
  })

  it('DÖNÜŞ en sıkı gövde işlevi', () => {
    const m = kelimeler(20)
    expect(butce(govdeSlayt(4, m))!.value).toBeGreaterThan(100) // donus (18)
    expect(butce(govdeSlayt(2, m))!.value).toBeLessThanOrEqual(100) // kanit (30)
  })

  it('D-260 KORUNDU: kapaktaki destek satırı başlık bütçesine karşı ölçülmez', () => {
    // Kapak slaydında bir GÖVDE satırı 21 kelime olabilir ve meşrudur; 8'e karşı
    // ölçülseydi gerçek bir koşu yine yanlış yere düşerdi.
    const kapak: DocumentModel = {
      ...belge(),
      slayt: { role: 'kapak', index: 0, total: 6 },
      blocks: [
        { type: 'heading', level: 1, text: kelimeler(5) },
        { type: 'body', text: kelimeler(21) },
      ],
    }
    expect(butce(kapak)!.value).toBeLessThanOrEqual(100)
  })

  it('yay DIŞI slayt sayısında eski ROL davranışı sürüyor', () => {
    // Ölçüm, ölçemediği yerde eskisini bozmuyor.
    const disarida: DocumentModel = {
      ...belge(),
      slayt: { role: 'govde', index: 8, total: 6 },
      blocks: [{ type: 'body', text: kelimeler(25) }],
    }
    expect(butce(disarida)!.value).toBeLessThanOrEqual(100)
  })
})
