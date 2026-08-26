// YAYIN TAKVİMİ — çeşitlilik ve denge ÖLÇÜLEN sorundan doğdu (FAZ-19.12 · madde 10).
//
// ⚠ ⚠ **BU KAPI ÖLÇÜLEN SAYILARI DA KORUYOR.** Depodaki 19 yayına aday koşuda ardışık
// aynı şablon oranı **5/18** ölçüldü ve dengesizlik **4,0×** çıktı. Sorun varsayılmadı;
// kural o sayılardan doğdu ve kapı hem kuralı hem sayının nereden geldiğini koruyor.
//
// ⚠ ⚠ **VE PENCERE GENİŞLİĞİNİN BİR YARGI OLDUĞU BURADA DA YAZILI.** Pencere 1'den 5'e
// tarandı ve hepsi AYNI 5 ihlali verdi — bugünkü tekrarların hepsi hemen ardışık. Yani
// veri 1 ile 5'i ayırt edemiyor. Kapı `3`ü koruyor ama onun bir ÖLÇÜM değil bir TEDBİR
// olduğunu iddia metninde söylüyor; bu depoda tahminle yazılan eşikler defalarca
// yalanlandı ve fark burada kayda geçmeli.

import { describe, expect, it } from 'vitest'
import { TEKRAR_PENCERESI, yayinPlaniKur, type YayinAdayi } from './yayin-plani.js'

const aday = (runId: string, sablon: string, zaman: string): YayinAdayi => ({
  runId,
  sablon,
  hazirlanmaZamani: zaman,
})

/** Ölçülen dağılımın küçük ölçekli kopyası: sahne ağırlıklı, dizin tek. */
const HAVUZ: readonly YayinAdayi[] = [
  aday('r1', 'sahne', '2026-08-01T00:00:00Z'),
  aday('r2', 'sahne', '2026-08-02T00:00:00Z'),
  aday('r3', 'sahne', '2026-08-03T00:00:00Z'),
  aday('r4', 'veri-hikayesi', '2026-08-04T00:00:00Z'),
  aday('r5', 'veri-hikayesi', '2026-08-05T00:00:00Z'),
  aday('r6', 'dizin', '2026-08-06T00:00:00Z'),
]

describe('yayın takvimi', () => {
  it('pencere ÖLÇÜMÜN desteklediği asgarinin üstünde — ve bu bir tedbir', () => {
    // ⚠ Ölçüm 1 ile 5 arasını ayırt edemedi; 3 bir yargı. Sayı sessizce 1'e düşerse
    // "üst üste koyma" kuralı yalnız birebir ardışığı kapsar ve tedbir kaybolur.
    expect(TEKRAR_PENCERESI).toBe(3)
    expect(TEKRAR_PENCERESI, 'ölçümün desteklediği asgari 1').toBeGreaterThanOrEqual(1)
  })

  // ── ÇEŞİTLİLİK ───────────────────────────────────────────────────────────
  it('ARDIŞIK aynı şablon yok — ölçülen %28 sıfıra iniyor', () => {
    const p = yayinPlaniKur(HAVUZ, { haftadaKac: 3, baslangic: '2026-09-07' })
    const s = p.gonderiler.map((x) => x.sablon)
    let ardisik = 0
    for (let i = 1; i < s.length; i++) if (s[i] === s[i - 1]) ardisik += 1
    expect(ardisik, `plan: ${s.join(' → ')}`).toBe(0)
  })

  it('PENCERE boyunca da tekrar yok', () => {
    const s = yayinPlaniKur(HAVUZ, { haftadaKac: 3, baslangic: '2026-09-07' }).gonderiler.map(
      (x) => x.sablon
    )
    // ⚠ Havuzda sahne 3, veri-hikayesi 2, dizin 1 var — yani 3'lük pencere her yerde
    // sağlanamaz ve sağlanamadığı yerde UYARI bekleniyor, sessiz ihlal değil.
    const ihlal = s.filter((x, i) => s.slice(Math.max(0, i - TEKRAR_PENCERESI), i).includes(x))
    const p = yayinPlaniKur(HAVUZ, { haftadaKac: 3, baslangic: '2026-09-07' })
    if (ihlal.length > 0)
      expect(
        p.uyarilar.filter((u) => u.tur === 'pencere-saglanamadi').length,
        'pencere sağlanamıyorsa SESSİZ kalınmaz'
      ).toBeGreaterThan(0)
  })

  it('TAKVİMDEN ÖNCEKİ yayınlar da pencereye giriyor', () => {
    // ⚠ Takvimin ilk gönderisi, takvimden önceki son gönderiyle aynı şablonsa bu da bir
    // "üst üste" ihlalidir. Pencereyi takvimin başında sıfırlamak kesişme noktasını kör
    // bırakırdı.
    const p = yayinPlaniKur(HAVUZ, {
      haftadaKac: 3,
      baslangic: '2026-09-07',
      oncekiSablonlar: ['sahne'],
    })
    expect(
      p.gonderiler[0]?.sablon,
      'önceki gönderi sahne ise takvim sahne ile başlamamalı'
    ).not.toBe('sahne')
  })

  // ── DENGE ────────────────────────────────────────────────────────────────
  it('en az kullanılan önce seçiliyor — denge yapısal', () => {
    const p = yayinPlaniKur(HAVUZ, { haftadaKac: 3, baslangic: '2026-09-07' })
    // Havuzda sahne 3, veri-hikayesi 2, dizin 1 → plan hepsini kullanmak zorunda ama
    // SIRA dengeyi kuruyor: ilk üç gönderide üç FARKLI şablon çıkmalı.
    const ilkUc = new Set(p.gonderiler.slice(0, 3).map((x) => x.sablon))
    expect(ilkUc.size, 'ilk üç gönderi üç farklı şablon olmalı').toBe(3)
    expect(Object.values(p.dagilim).reduce((a, b) => a + b, 0)).toBe(HAVUZ.length)
  })

  it('dengesiz havuzda UYARI var — ama üretim atlanmıyor', () => {
    const p = yayinPlaniKur(HAVUZ, { haftadaKac: 3, baslangic: '2026-09-07' })
    expect(p.gonderiler.length, 'her aday takvime girmeli').toBe(HAVUZ.length)
    expect(p.uyarilar.some((u) => u.tur === 'dagilim-dengesiz')).toBe(true)
  })

  // ── TAKVİM ───────────────────────────────────────────────────────────────
  it('haftada 3 · 12 hazır → 4 hafta (depo sahibinin örneği)', () => {
    const oniki = Array.from({ length: 12 }, (_, i) =>
      aday(`r${String(i)}`, `s${String(i % 4)}`, `2026-08-${String(i + 1).padStart(2, '0')}`)
    )
    const p = yayinPlaniKur(oniki, { haftadaKac: 3, baslangic: '2026-09-07' })
    expect(p.gonderiler.length).toBe(12)
    expect(Math.max(...p.gonderiler.map((x) => x.hafta)), '12 / 3 = 4 hafta').toBe(4)
  })

  it('gönderiler hafta içinde YAYILIYOR — arka arkaya değil', () => {
    const p = yayinPlaniKur(HAVUZ, { haftadaKac: 3, baslangic: '2026-09-07' })
    const ilkHafta = p.gonderiler.filter((x) => x.hafta === 1).map((x) => x.tarih)
    // Pzt 07, Çrş 09, Cum 12 — aynı güne ya da arka arkaya iki güne yığılmıyor.
    expect(new Set(ilkHafta).size, 'aynı güne iki gönderi konmuyor').toBe(ilkHafta.length)
    expect(ilkHafta).toStrictEqual(['2026-09-07', '2026-09-09', '2026-09-12'])
  })

  it('tarih aritmetiği AY sınırını geçiyor', () => {
    // ⚠ UTC şart: yerel saat diliminde `setDate` yaz saati geçişinde bir gün kayabiliyor.
    const p = yayinPlaniKur([aday('a', 's1', '1'), aday('b', 's2', '2')], {
      haftadaKac: 1,
      baslangic: '2026-09-28',
    })
    expect(p.gonderiler.map((x) => x.tarih)).toStrictEqual(['2026-09-28', '2026-10-05'])
  })

  it('boş havuz boş plan — çökmüyor', () => {
    const p = yayinPlaniKur([], { haftadaKac: 3, baslangic: '2026-09-07' })
    expect(p.gonderiler).toStrictEqual([])
    expect(p.uyarilar).toStrictEqual([])
  })
})
