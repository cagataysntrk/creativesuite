// İkon dağarcığının değişmezleri (§7.1 · FAZ-11.3).

import { describe, expect, it } from 'vitest'
import { IKONLAR, ikonSec, ikonSvg } from './sablon-ikon.js'

describe('ikon dağarcığı', () => {
  // ⚠ Bu tablo, ilk sürümün ÇARPIŞMALARINI kilitliyor: `includes` ile "parametre"
  // içindeki "ara" arama ikonunu, "kazanç" içindeki "kaza" kalkanı getiriyordu.
  const TABLO: readonly (readonly [string, string | null])[] = [
    ['Duruş süresini yarıya indirdik', 'saat'],
    ['Parametre değişimi kayda geçmiyor', 'ayar'],
    ['Kazanç ilk çeyrekte göründü', 'artis'],
    ['Fire oranı artık ölçülüyor', 'dusus'],
    ['Kök neden analizi yapılmadı', 'arama'],
    ['Planlı bakım ertelendi', 'takvim'],
    ['Stok sayımı tutmuyor', 'kutu'],
    ['Vardiya devri sözlü yapılıyor', 'ekip'],
    ['Enerji tüketimi tavan yaptı', 'enerji'],
    ['Üretim hattı iki saat durdu', 'fabrika'],
    ['Kayıtlar hâlâ kâğıtta', 'belge'],
    ['Güvenlik önlemi alınmadı', 'kalkan'],
    ['Hedefe ne kadar kaldı', 'hedef'],
    ['Süreç her seferinde baştan kuruluyor', 'dongu'],
    ['Ölçüm cihazı kalibre değil', 'olcek'],
    ['Bugün hava çok güzeldi', null],
  ]

  it('gerçek Türkçe satırlarda DOĞRU ikonu seçiyor', () => {
    for (const [metin, beklenen] of TABLO)
      expect([metin, ikonSec(metin)]).toEqual([metin, beklenen])
  })

  it('kelime İÇİNDE eşleşmiyor — yalnız kelime BAŞINDA', () => {
    // Türkçe sonek dilidir: kök başta durur. "parametre" içindeki "ara" bir kök değildir.
    expect(ikonSec('parametre')).toBe('ayar')
    expect(ikonSec('kazanç')).toBe('artis')
    expect(ikonSec('artık')).toBeNull()
  })

  it('büyük harf ve Türkçe küçültme doğru', () => {
    // 'israf' → Türkçe büyük harfi 'İSRAF'tır, 'ISRAF' değil.
    expect(ikonSec('İSRAF ÖNLENEBİLİR')).toBe('dusus')
    expect(ikonSec('STOK SAYIMI')).toBe('kutu')
  })

  it('yanlış Türkçe büyük harf eşleşMEZ — ve bu DOĞRU davranış', () => {
    // ⚠ 'ISRAF' (noktasız I) Türkçede 'ısraf' diye küçülür ve öyle bir kelime yoktur.
    // `toLowerCase()` kullansaydık 'israf' çıkar ve eşleşirdi — yani YANLIŞ yazılmış bir
    // metni sessizce düzeltmiş olurduk. Kapı, kendi girdisini düzeltmez.
    expect(ikonSec('ISRAF ÖNLENEBİLİR')).toBeNull()
  })

  it('CÜMLENİN İLK kavramı kazanıyor, ikon listesinin sırası değil', () => {
    // İki kök birden geçiyor: 'üretim' (fabrika) ve 'saat' (saat).
    expect(ikonSec('Üretim hattı iki saat durdu')).toBe('fabrika')
    expect(ikonSec('İki saat üretim hattı durdu')).toBe('saat')
  })

  it('DETERMİNİSTİK — aynı metin hep aynı ikon', () => {
    for (let n = 0; n < 10; n += 1) expect(ikonSec('Planlı bakım ertelendi')).toBe('takvim')
  })

  it('dağarcık KAPALI ve yirmi öge', () => {
    expect(IKONLAR).toHaveLength(20)
    expect(new Set(IKONLAR).size).toBe(20)
  })

  it('her ikon GEÇERLİ svg üretiyor ve rengi çağırandan alıyor', () => {
    for (const ad of IKONLAR) {
      const svg = ikonSvg(ad, 'var(--role-text)', 28)
      expect(svg).toContain('var(--role-text)')
      expect(svg).toContain('viewBox="0 0 24 24"')
      expect(svg).toContain('aria-hidden="true"')
      // Boş gövde = görünmez ikon; bir tanesini unutmak sessizce boşluk bırakırdı.
      expect(svg.length).toBeGreaterThan(140)
    }
  })

  it('ikon 24x24 ızgaranın DIŞINA taşmıyor', () => {
    for (const ad of IKONLAR) {
      const svg = ikonSvg(ad, '#000', 28)
      for (const n of svg.matchAll(/(?:cx|cy|x1|y1|x2|y2|x|y)="([\d.]+)"/g)) {
        expect(Number(n[1])).toBeGreaterThanOrEqual(0)
        expect(Number(n[1])).toBeLessThanOrEqual(24)
      }
    }
  })
})

// ── Slayt bütünlüğü: HEPSİ ya da HİÇBİRİ (FAZ-14.4) ─────────────────────────
//
// ⚠ Üçüncü gözlemde yazıldı: gerçek bir koşuda aynı slaytta bir madde ikonlu, diğeri
// düz çizgiliydi. İki farklı işaret yan yana ritim değil gürültü üretiyor.

describe('ikon kararı SLAYTIN tamamına ait', () => {
  it('bir madde bile eşleşmiyorsa HİÇBİRİ ikon almıyor', async () => {
    const { toHtml } = await import('./static.js')
    const doc = {
      kind: 'post',
      width: 1080,
      height: 1350,
      tokenCss: ':root{--role-bg:#000;--role-text:#fff}',
      slayt: { role: 'govde', index: 1, total: 5, duzen: 'list' },
      blocks: [
        { type: 'body', text: 'Planlı bakım ertelendi', islev: 'gerilim' },
        { type: 'body', text: 'Bugün hava çok güzeldi', islev: 'kanit' },
      ],
    } as never
    expect(toHtml(doc)).not.toContain('class="ikonlu"')
  })

  it('hepsi eşleşiyorsa HEPSİ ikon alıyor', async () => {
    const { toHtml } = await import('./static.js')
    const doc = {
      kind: 'post',
      width: 1080,
      height: 1350,
      tokenCss: ':root{--role-bg:#000;--role-text:#fff}',
      slayt: { role: 'govde', index: 1, total: 5, duzen: 'list' },
      blocks: [
        { type: 'body', text: 'Planlı bakım ertelendi', islev: 'gerilim' },
        { type: 'body', text: 'Stok sayımı tutmuyor', islev: 'kanit' },
      ],
    } as never
    const h = toHtml(doc)
    expect((h.match(/class="ikonlu"/g) ?? []).length).toBe(2)
  })
})
