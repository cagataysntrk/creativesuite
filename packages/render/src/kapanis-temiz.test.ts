// KAPANIŞ KARTI TEMİZ OLMAK ZORUNDA — iki kural, tek kapı (FAZ-19.5).
//
// ⚠ ⚠ **BU KAPI BİR GÖZDEN DOĞDU, BİR ÖLÇÜMDEN DEĞİL.** Depo sahibi ızgaraya baktı ve
// *"son sayfalardaki büyük sayılar çok kötü duruyorlar"* + *"veri akışında alttan akan,
// son sayfalara doğru yazılara giriyor"* dedi. İki ayrı sebep bulundu, ikisi de sistemik.
//
// ── KURAL 1: kapanış kartı içerik PANOSU taşımaz ────────────────────────────
// Ölçüldü: `veri-hikayesi`nin kapanış kartı hem üç maddelik bir liste panosunu hem de
// kapanış jestini (dev rakam + okuma satırı + imza + çağrı) taşıyordu ve içeriğin dibi
// kartın ALT KENARINI aşıyordu — **%103,2.** Rakam kesiliyor, künye şeridine biniyordu.
// **On destenin BEŞİNDE aynı ihlal vardı.** Denetimin kapanış tarifi zaten bunu
// söylüyordu: *"Kapanış iskeleti kullanmaz, KIRAR. Şerit yok, üç satır başlık yok,
// ALT PANO YOK."* Pano kalkınca dip %103,2 → **%86,8.**
//
// ── KURAL 2: sürekli öge kapanış kartını KAT ETMEZ ──────────────────────────
// Pano kalktıktan sonra ikinci kusur açığa çıktı: yükselen alan sınırı son kartın tam
// ORTASINDAN geçiyordu, dev rakam iki tonun arasında ikiye bölünüyordu ve eğrinin
// kilometre etiketi (`2025`) rakamın ÜZERİNE düşüyordu. Ölçülen çarpışma (eğri tepesi ↔
// içerik dibi, üstten %): k1-k4 **+2,3 … +2,9** (tutarlı, tasarlanmış pay) ama k5 **−4,3**
// ve k6 **−32,9**. Yani kural zaten dört slaytta yazılıydı, son ikisinde bozuluyordu.
// Denetim: *"y %0-28 · Varış. Sürekli öge burada BİTER."* Eğri son kartın başında
// (x %83) durduruldu, kilometre etiketi kartın dışına çekildi.

import { describe, expect, it } from 'vitest'
import { ORNEKLER } from './katalog-ornek.js'

describe('kapanış temiz', () => {
  const kapanisli = Object.entries(ORNEKLER).filter(([, o]) =>
    o.kartlar.some((k) => (k.kapanis?.rakam ?? '').trim() !== '')
  )

  // ⚠ Kapı boşa dönmesin: kapanış rakamı taşıyan deste yoksa aşağıdaki iddialar
  // hiç koşmaz ve yeşil hiçbir şey kanıtlamaz.
  it('kapanış rakamı taşıyan deste VAR', () => {
    expect(kapanisli.length, 'hiçbir destede kapanış rakamı yok').toBeGreaterThan(5)
  })

  for (const [id, o] of kapanisli) {
    it(`${id} · kapanış kartı içerik panosu TAŞIMIYOR`, () => {
      // ⚠ ⚠ **`dizin` MUAF ve muafiyet KURALI DARALTIYOR, delmiyor.** O şablonun kimliği
      // *"dört maddenin dördü HER kartta"* (dizin-butunlugu kapısı bunu zorluyor) ve son
      // kart o bütünlüğün TAMAMLANDIĞI yer. Listesi bir içerik panosu değil, destenin
      // TAŞIYICISI. Kuralı ona da uygulayınca kapı haklı olarak kırmızı döndü.
      if (id === 'dizin') return
      for (const k of o.kartlar) {
        if ((k.kapanis?.rakam ?? '').trim() === '') continue
        expect(
          k.panel,
          `${id}: kapanış kartı hem pano hem kapanış jesti taşıyor — ölçüldü, içeriğin ` +
            'dibi kartın alt kenarını aşıyor ve dev rakam kesiliyor'
        ).toBeNull()
      }
    })
  }

  // ⚠ ⚠ **SÜREKLİ ÖGE SON KARTI KAT ETMEZ.** Taşıyıcı panorama yüzdesiyle tanımlı;
  // son kart `(n-1)/n` yüzdesinde başlıyor. Bir nokta oradan sonraya düşüyorsa taşıyıcı
  // kapanışın üstünden geçiyor demektir.
  // ⚠ Kural yalnız DESTEYİ KAT EDEN taşıyıcılara: `egri` ve `alanSiniri`. Kart içinde
  // kalan süsler (leke, kemer) bu kuralın konusu değil.
  for (const [id, o] of Object.entries(ORNEKLER)) {
    const n = o.kartlar.length
    const sonKartBasi = ((n - 1) / n) * 100
    const noktalar = o.bant.tip === 'egri' ? (o.bant.noktalar ?? []) : []
    if (noktalar.length === 0) continue
    it(`${id} · sürekli öge kapanış kartını kat ETMİYOR`, () => {
      const asan = noktalar.filter((p) => p.x > sonKartBasi + 0.5)
      expect(
        asan.map((p) => `x${String(p.x)}`).join(','),
        `${id}: taşıyıcı son kartın (x>%${sonKartBasi.toFixed(0)}) üstünden geçiyor — ` +
          'dev rakam iki tonun arasında ikiye bölünür'
      ).toBe('')
      // Kilometre etiketleri de kartın dışında kalmalı: biri rakamın üstüne düşmüştü.
      // ⚠ `kilometre` yalnız `egri` bandında var; birleşim tipi daraltılmadan okunamaz.
      const km_ler = o.bant.tip === 'egri' ? (o.bant.kilometre ?? []) : []
      for (const km of km_ler)
        expect(
          km.x,
          `${id}: "${km.etiket}" kilometre etiketi kapanış kartının üstünde`
        ).toBeLessThanOrEqual(sonKartBasi + 0.5)
    })
  }
})
