// SAYILAN İDDİA — kapak "beş şart" diyorsa beşi de SAYILMALI (FAZ-19.7).
//
// ⚠ ⚠ **DENETİMİN BULGUSU:** *"`akan-alan`: altı karede SIFIR bilgi ögesi; 'beş şart'
// deniyor, 01–05 hiçbir yerde yok."* Ölçüldü ve doğruydu — beş kart zaten o beş şarttı
// (İZLENEBİLİRLİK · AYRIŞTIRMA · ÖLÇÜM · ALICI · FİNANS) ama hiçbiri numaralı değildi.
// Eksik olan içerik DEĞİL, SAYIMDI: okuyucu kaydırırken kaçıncı şartta olduğunu
// bilmiyordu ve kapağın "beş" iddiası hiçbir yerde doğrulanmıyordu.
//
// ⚠ Pano EKLENMEDİ ve bu bilinçli: reçete bu şablon için panosuzluğu açıkça onaylıyor
// (*"Görsel YOK — bu şablon saf tipografi + alan. Bugün de öyle; doğru olan bu."*).
// Kusur bilgi ögesinin YOKLUĞU değil, var olan bilginin SAYILMAMASIYDI.
//
// ⚠ Bu, `veri-egrisi` kapısıyla aynı aileden: **tipografi bir sayı söylüyorsa geometri
// ya da yapı onu doğrulamak zorunda.** Orada eğri "iki katına" iddiasını taşıyor,
// burada üst etiketler "beş" iddiasını taşıyor.

import { describe, expect, it } from 'vitest'
import { ORNEKLER } from './katalog-ornek.js'

/** Türkçe sayı sözcükleri — kapakta geçen bir sayım iddiası. */
const SAYILAR: Readonly<Record<string, number>> = {
  iki: 2,
  üç: 3,
  dört: 4,
  beş: 5,
  altı: 6,
  yedi: 7,
}

/**
 * Sayılabilir ÖGE adları. Bir sayı sözcüğü ancak bunlardan birini niteliyorsa SAYIM
 * iddiasıdır.
 *
 * ⚠ ⚠ **ÇARPAN SAYIM DEĞİLDİR — ve bunu kapının kendisi öğretti.** İlk sürüm yalnız sayı
 * sözcüğünü arıyordu ve `veri-hikayesi`yi kırmızıya çevirdi: kapağı *"Altı yılda **iki
 * katına** çıkan bir eğri"* diyor ve oradaki "iki" bir ORAN, iki madde değil. O iddiayı
 * zaten `veri-egrisi` kapısı taşıyor (eğri iki kat yükselmeli). Aynı sözcük, iki ayrı
 * iddia; ayıran şey NEYİ niteledigi.
 */
const OGELER = ['şart', 'adım', 'madde', 'soru', 'ilke', 'kural', 'neden', 'aşama', 'varsayım']

/** Kapak başlığında sayım iddiası var mı — varsa kaç. */
const iddiaEdilenSayi = (baslik: string): number | null => {
  const sade = baslik.replaceAll('*', '').toLocaleLowerCase('tr')
  for (const [sozcuk, n] of Object.entries(SAYILAR)) {
    // Sayı sözcüğünden sonraki iki kelimede sayılabilir bir öge adı aranıyor.
    const m = new RegExp(`(^|\\s)${sozcuk}\\s+(\\S+)(\\s+(\\S+))?`, 'u').exec(sade)
    if (m === null) continue
    const sonra = [m[2] ?? '', m[4] ?? '']
    if (sonra.some((w) => OGELER.some((o) => w.startsWith(o)))) return n
  }
  return null
}

describe('sayılan iddia', () => {
  let sinanan = 0
  for (const [id, o] of Object.entries(ORNEKLER)) {
    const kapak = o.kartlar[0]
    if (kapak === undefined) continue
    const n = iddiaEdilenSayi(kapak.baslik)
    if (n === null) continue
    // ⚠ İddia ancak deste O KADAR karta sahipse sayılabilir: kapak + n kart.
    if (o.kartlar.length < n + 1) continue
    sinanan += 1
    it(`${id} · kapak "${String(n)}" diyor — kartlar SAYIYOR`, () => {
      const sirali = o.kartlar
        .slice(1, n + 1)
        .map((k, i) => k.ustBaslik.includes(String(i + 1).padStart(2, '0')))
      expect(
        sirali.filter(Boolean).length,
        `${id}: kapak ${String(n)} şart diyor ama üst etiketler saymıyor — ` +
          `${o.kartlar
            .slice(1, n + 1)
            .map((k) => k.ustBaslik)
            .join(' · ')}`
      ).toBe(n)
    })
  }

  // ⚠ Kapı boşa dönmesin: hiçbir kapak sayım iddiası taşımıyorsa yukarıdaki döngü hiç
  // koşmaz ve yeşil hiçbir şey kanıtlamaz.
  it('sayım iddiası taşıyan kapak VAR', () => {
    expect(sinanan, 'hiçbir kapakta sayım iddiası bulunamadı — kapı boşa dönüyor').toBeGreaterThan(
      0
    )
  })
})
