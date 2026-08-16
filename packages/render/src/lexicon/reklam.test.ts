import { describe, expect, it } from 'vitest'
import {
  bloklayici,
  KAPLAMA_UYARI_ORANI,
  KATLAMA_CAKISMASI,
  OZELLIK_ALANLARI,
  reklamIhlalMesaji,
  reklamLint,
} from './reklam.js'

const kaynaksiz = { claimSource: null }

describe('kişisel özellik kuralı', () => {
  // 🧪 FAZ-8.2 ihlal testi — faz dosyasının verdiği örnek cümle.
  it('"Borçlarınızdan kurtulun" reddediliyor ve ÇÖZÜMÜ söylüyor', () => {
    const i = reklamLint('Borçlarınızdan kurtulun, hemen başvurun.', kaynaksiz)
    expect(i).toHaveLength(1)
    expect(i[0]!.kind).toBe('personal_attribute')
    const mesaj = reklamIhlalMesaji(i[0]!)
    expect(mesaj).toContain('SESSİZCE')
    // Sebebini söylemeyen bir ret, sessiz reddin bizdeki kopyası olurdu.
    expect(mesaj).toContain('üçüncü şahsa çevir')
  })

  // **Asıl incelik:** saf ikinci şahıs yasak DEĞİL. Yalnız ikinci şahsa bakan bir
  // linter her reklamı reddeder ve ilk haftada kapatılır.
  it('özellik içermeyen ikinci şahıs GEÇİYOR', () => {
    expect(reklamLint('Demoyu izleyin, ölçümü kendiniz görün.', kaynaksiz)).toEqual([])
  })

  // Ters yön: üçüncü şahıs + alan sözcüğü meşrudur — çözümün kendisi bu.
  it('üçüncü şahıs + alan sözcüğü GEÇİYOR — önerilen çözüm bu', () => {
    expect(reklamLint('Borç yükünü azaltan imalatçılar için ölçüm altyapısı.', kaynaksiz)).toEqual(
      []
    )
  })

  it('sağlık alanı da yakalanıyor', () => {
    const i = reklamLint('Ağrılarınıza son verin.', kaynaksiz)
    expect(i[0]!.kind === 'personal_attribute' && i[0]!.alan).toBe('saglik')
  })

  // Diyakritiksiz yazım kuralı ATLATMAMALI: `borclariniz` da aynı cümledir.
  it('diyakritiksiz yazım kuralı atlatmıyor', () => {
    expect(reklamLint('Borclarinizdan kurtulun', kaynaksiz)).toHaveLength(1)
  })
})

describe('üstünlük ve dönüşüm', () => {
  it('kaynaksız üstünlük bloklanıyor, kaynaklı geçiyor', () => {
    expect(reklamLint('Türkiye’nin en hızlı ölçüm altyapısı.', kaynaksiz)).toHaveLength(1)
    expect(
      reklamLint('Türkiye’nin en hızlı ölçüm altyapısı.', { claimSource: 'rec_kanit_01' })
    ).toEqual([])
  })

  it('önce/sonra çerçevelemesi bloklanıyor', () => {
    const i = reklamLint('Öncesi ve sonrası: fire oranı yarıya indi.', kaynaksiz)
    expect(i.some((x) => x.kind === 'before_after')).toBe(true)
  })
})

describe('metin kaplama — UYARI, red DEĞİL', () => {
  // Meta %20 kuralını artık uygulamıyor; blocker yapmak geçerli reklamları
  // reddetmek olurdu (araştırma bunu açıkça söylüyor).
  it('eşik üstü kaplama uyarı veriyor ama BLOKLAMIYOR', () => {
    const i = reklamLint('Ölçüm altyapısı.', { claimSource: null, textCoverage: 0.35 })
    expect(i).toHaveLength(1)
    expect(bloklayici(i[0]!)).toBe(false)
    expect(reklamIhlalMesaji(i[0]!)).toContain('red sebebi değil')
  })

  // **Ölçülmediyse denetim ATLANIR** (D-175) — `undefined`ı eşik altı saymak,
  // hiç ölçülmemiş bir kreatifi temiz göstermek olurdu.
  it('kaplama ölçülmediyse denetim atlanıyor, "temiz" sayılmıyor', () => {
    expect(reklamLint('Ölçüm altyapısı.', kaynaksiz)).toEqual([])
    expect(KAPLAMA_UYARI_ORANI).toBe(0.2)
  })
})

describe('katlama çakışması — yanlış pozitif YAKALANMAZ', () => {
  // 🧪 İlk sürüm "Borçlarınızdan **kurtul**un" cümlesini köken ihlali sanıyordu:
  // `foldForSearch` `Kürt`ü de `kurtul-`u da `kurt`a düşürüyor. Diyakritik katlama
  // bir ayrımı yok ettiğinde, o terimi listede tutmak linter'ı gürültü kaynağına
  // çevirir — ve gürültülü linter kapatılır, kapatılmış linter hiçbir şey korumaz.
  it('imalatın günlük sözcükleri ihlal sayılmıyor', () => {
    for (const cumle of [
      'Zarar görmüş parçalarınızı ayırın.',
      'Sakatlık riskini ölçün.',
      'Kilogram başına maliyetinizi görün.',
    ]) {
      expect(reklamLint(cumle, kaynaksiz)).toEqual([])
    }
  })

  it('çakışan terimler listede DEĞİL ve bu açıkça yazılı', () => {
    const hepsi = Object.values(OZELLIK_ALANLARI).flat()
    for (const c of KATLAMA_CAKISMASI) expect(hepsi).not.toContain(c)
  })
})
