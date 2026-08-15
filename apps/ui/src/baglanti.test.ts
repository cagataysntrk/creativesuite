import { describe, expect, it } from 'vitest'
import {
  BAYAT_KAT,
  KOPUK_KAT,
  baglantiDurumu,
  durumIsareti,
  gosterilecekDeger,
  usdBicimle,
} from './baglanti.js'
import { eslestir, kaydir, type Komut } from './palet.js'

const NABIZ = 5000

describe('bağlantı durumu', () => {
  it('hiç olay gelmediyse KOPUK — açılışta canlı varsayılmaz', () => {
    // Canlı varsaysaydık sunucu hiç ayakta değilken şerit yeşil başlardı; ve ilk
    // izlenim en çok güvenilen izlenimdir.
    expect(baglantiDurumu({ sonOlayMs: null, simdiMs: 1000, nabizAraligiMs: NABIZ })).toBe('kopuk')
  })

  it('nabız zamanında geldiyse canlı', () => {
    expect(baglantiDurumu({ sonOlayMs: 1000, simdiMs: 3000, nabizAraligiMs: NABIZ })).toBe('canli')
  })

  it('bir nabız kaçınca BAYAT — değer durur ama eski olduğu bilinir', () => {
    const simdi = 1000 + NABIZ * BAYAT_KAT
    expect(baglantiDurumu({ sonOlayMs: 1000, simdiMs: simdi, nabizAraligiMs: NABIZ })).toBe('bayat')
  })

  it('sunucu susunca KOPUK ve DEĞER GÖSTERİLMEZ', () => {
    const simdi = 1000 + NABIZ * KOPUK_KAT
    const d = baglantiDurumu({ sonOlayMs: 1000, simdiMs: simdi, nabizAraligiMs: NABIZ })
    expect(d).toBe('kopuk')
    // Kabul kriterinin çekirdeği: son değer canlı gibi GÖSTERİLMEZ.
    expect(gosterilecekDeger(d, '$12.34')).toBeNull()
    expect(durumIsareti(d).metin).toBe('bağlantı yok')
  })

  it('bayatken değer GÖSTERİLİR — bayatlık soldurmayla değil metinle bildirilir', () => {
    expect(gosterilecekDeger('bayat', '$12.34')).toBe('$12.34')
    expect(durumIsareti('bayat').metin).toBe('bayat')
  })

  it('eşikler nabız aralığının KATI — sunucu nabzını değiştirince kırılmaz', () => {
    // Sabit eşik olsaydı 30 sn'lik nabızda her nabız "kopuk" okunurdu.
    const yavas = 30_000
    expect(baglantiDurumu({ sonOlayMs: 0, simdiMs: 20_000, nabizAraligiMs: yavas })).toBe('canli')
    expect(baglantiDurumu({ sonOlayMs: 0, simdiMs: 20_000, nabizAraligiMs: 5000 })).toBe('kopuk')
  })

  it('her durumun glyph + metin + rengi VAR — renk tek başına anlam taşımaz', () => {
    for (const d of ['canli', 'bayat', 'kopuk'] as const) {
      const i = durumIsareti(d)
      expect(i.glyph.length).toBeGreaterThan(0)
      expect(i.metin.length).toBeGreaterThan(0)
      expect(i.rolToken).toContain('var(--role-')
    }
  })
})

describe('para biçimi', () => {
  it('bigint üzerinden böler — 2^53 üstünde yuvarlamaz', () => {
    expect(usdBicimle('9007199254740993000000')).toBe('$9007199254740993.00')
    // Number ile bölünseydi bu değer bozulurdu:
    expect(String(Number('9007199254740993000000') / 1e6)).not.toBe('9007199254740993')
  })

  it('kuruş hanesi doğru', () => {
    expect(usdBicimle('0')).toBe('$0.00')
    expect(usdBicimle('1500000')).toBe('$1.50')
    expect(usdBicimle('3500')).toBe('$0.00') // 0,0035 dolar — iki hanede sıfır görünür
    expect(usdBicimle('1234567')).toBe('$1.23')
  })

  it('geçersiz girdi "—" — sıfır DEĞİL', () => {
    // "0" göstermek "ölçüm var ve sıfır" demektir; oysa ölçüm yok.
    expect(usdBicimle('abc')).toBe('—')
  })
})

const KOMUTLAR: readonly Komut[] = [
  { id: 'instagram-post', etiket: 'Instagram postu üret', grup: 'Üretim' },
  { id: 'instagram-carousel', etiket: 'Instagram carousel üret', grup: 'Üretim' },
  { id: 'linkedin-post', etiket: 'LinkedIn postu üret', grup: 'Üretim' },
  { id: 'onay-kuyrugu', etiket: 'Onay kuyruğu', grup: 'Gözden geçir', anahtarlar: ['approve'] },
  { id: 'icerik-tarayici', etiket: 'İçerik tarayıcı', grup: 'Bilgi' },
]

describe('komut paleti', () => {
  it('boş sorgu her şeyi döner — palet açılışta liste gösterir', () => {
    expect(eslestir(KOMUTLAR, '')).toHaveLength(KOMUTLAR.length)
  })

  it('alt dizi eşleşir: harflerin bitişik olması gerekmez', () => {
    const s = eslestir(KOMUTLAR, 'igp')
    expect(s[0]?.komut.id).toBe('instagram-post')
  })

  it('Türkçe İ/ı ayrımına TAKILMAZ — `.toLowerCase()` olsaydı takılırdı', () => {
    // `'İçerik'.toLowerCase()` → `i̇çerik` (birleşik nokta) ve eşleşme kaçardı (R-21).
    expect(eslestir(KOMUTLAR, 'icerik')[0]?.komut.id).toBe('icerik-tarayici')
    expect(eslestir(KOMUTLAR, 'İÇERİK')[0]?.komut.id).toBe('icerik-tarayici')
    expect(eslestir(KOMUTLAR, 'ıcerık')[0]?.komut.id).toBe('icerik-tarayici')
  })

  it('ek anahtarlar aranır — İngilizce karşılık da bulur', () => {
    expect(eslestir(KOMUTLAR, 'approve')[0]?.komut.id).toBe('onay-kuyrugu')
  })

  it('eşleşmeyen sorgu BOŞ döner — palet uydurmaz', () => {
    expect(eslestir(KOMUTLAR, 'zzzz')).toHaveLength(0)
  })

  it('sıralama DETERMİNİSTİK — kas hafızası kurulabilsin diye', () => {
    const a = eslestir(KOMUTLAR, 'post').map((e) => e.komut.id)
    const b = eslestir(KOMUTLAR, 'post').map((e) => e.komut.id)
    expect(a).toEqual(b)
  })

  it('seçim SARMALIYOR — listenin sonunda takılmaz', () => {
    expect(kaydir(0, -1, 5)).toBe(4)
    expect(kaydir(4, 1, 5)).toBe(0)
    expect(kaydir(0, 1, 0)).toBe(0)
  })
})
