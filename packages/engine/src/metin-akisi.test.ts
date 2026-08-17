// Prompt kaynağı ve çıktı normalizasyonu ÖLÇÜLÜYOR (D-243).

import { describe, expect, it } from 'vitest'
import {
  duzMetin,
  gorselBriefPromptu,
  icerikPromptu,
  metneCevir,
  akisiAyir,
} from './metin-akisi.js'

const KAYITLAR = [
  { id: 'rec_pos', text: 'Veriyi karara çeviren ürünler üretiyoruz.' },
  { id: 'rec_msg', text: 'Veriniz yoksa önce veriyi kuruyoruz.' },
]

describe('içerik prompt`u', () => {
  it('konu ve kayıtları birlikte taşıyor', () => {
    const p = icerikPromptu({ konu: 'ölçüm', kayitlar: KAYITLAR })
    expect(p).toContain('KONU: ölçüm')
    expect(p).toContain('rec_pos')
    expect(p).toContain('Veriniz yoksa önce veriyi kuruyoruz.')
  })

  it('KAYIT YOKSA prompt kurulmuyor — bağlamsız metin markadan gelmez', () => {
    expect(icerikPromptu({ konu: 'ölçüm', kayitlar: [] })).toBeNull()
    expect(icerikPromptu({ konu: 'ölçüm', kayitlar: [{ id: 'x', text: '   ' }] })).toBeNull()
  })

  it('KONU YOKSA prompt kurulmuyor', () => {
    expect(icerikPromptu({ konu: '  ', kayitlar: KAYITLAR })).toBeNull()
  })

  it('sayısal iddia yasağı prompt`a YAZILIYOR — linter`i beklemiyor', () => {
    const p = icerikPromptu({ konu: 'ölçüm', kayitlar: KAYITLAR }) ?? ''
    expect(p).toContain('Hiçbir sayısal iddia yazma')
  })

  it('max_chars ve kacinilacak geçiyor', () => {
    const p =
      icerikPromptu({ konu: 'x', kayitlar: KAYITLAR, maxChars: 500, kacinilacak: 'başlık uzun' }) ??
      ''
    expect(p).toContain('En fazla 500 karakter')
    expect(p).toContain('başlık uzun')
  })
})

describe('görsel brief prompt`u', () => {
  // ⚠ Yuva ARTIK ZORUNLU (FAZ-14.3): yuvasız brief üretilmiyor, çünkü plan hiçbir
  // slaytta görsel işaretlemediyse görsel üretmek "her ihtimale karşı üret" demektir.
  const YUVA = {
    slaytIndex: 2,
    toplam: 6,
    islev: 'kanit',
    satir: 'Aynı arıza üç hafta sonra tekrarladı ve kimse bağlantısını kuramadı',
  }
  const p = gorselBriefPromptu({ konu: 'veri yoksa', kayitlar: KAYITLAR, yuva: YUVA }) ?? ''

  it('YUVA YOKSA brief de YOK — model boşuna çağrılmıyor', () => {
    // Zincirin sönme mekanizması bu: koşucuya "adım atla" yeteneği eklenmedi, brief
    // `null` dönünce `gorsel-uret` besinsiz kalıyor.
    expect(gorselBriefPromptu({ konu: 'veri yoksa', kayitlar: KAYITLAR })).toBeNull()
  })

  it('brief YUVAYI görüyor — konuyu değil O SATIRI destekliyor', () => {
    // Kusurun kökü: brief `bilgi-sec`ten besleniyordu ve görsel, altı slaytlık bir
    // karoselin hangi cümlesinin yanında duracağını bilmeden üretiliyordu.
    expect(p).toContain(YUVA.satir)
    expect(p).toContain('slide 3 of 6')
    expect(p).toContain('kanit')
  })

  it('İngilizce brief istiyor ve insansız/yazısız şart koşuyor', () => {
    expect(p).toContain('ENGLISH')
    expect(p).toContain('NO PEOPLE')
    expect(p).toContain('BARE and UNMARKED')
  })

  // ⚠ Bake-off ölçtü: yazı, sahnenin KENDİSİ tabela içerdiğinde sızıyor. Kantar
  // görselinde "FONTER" yazıyordu. Bu yüzden konu seçimi de kısıtlanıyor.
  it('yazı taşıyan konuları açıkça eliyor', () => {
    // ⚠ Eleme OLUMLU dille yapılıyor: "kontrol paneli, ekran, ambalaj, raf" — bunlar
    // istemsen de üzerinde işaret taşır. Yasak kelimeyi kullanmadan aynı işi görüyor.
    expect(p).toContain('control panels')
    expect(p).toContain('packaging and shelving')
  })

  it('modelin YANKILAMAMASI gereken kelimeleri açıkça sayıyor', () => {
    // ⚠ Bu test gerçek bir düşüşten sonra yazıldı: R-20 kapısı brief'i
    // `matched: "lettering"` diye reddetti. Kelime MODELİN uydurması değildi — bizim
    // talimatımızda geçiyordu ("naturally has no lettering in it") ve model onu
    // yankılamıştı. **Kapı haklıydı; hatalı olan, yasakladığı kelimeyi kullanan
    // talimattı.** Artık yasak liste açıkça veriliyor.
    expect(p).toContain('NEVER use these words')
    expect(p).toContain('lettering')
  })

  it('prompt yasak kelimeleri YALNIZ yasak listesinde kullanıyor', () => {
    // Talimatın gövdesi (yasak listesi hariç) tetikleyici kelimeleri içermemeli;
    // içerirse model onları yankılar ve kapı kendi talimatımızı reddeder.
    const govde = p.split('NEVER use these words')[0] ?? ''
    for (const k of ['lettering', 'signage', 'watermark', 'caption']) {
      expect(govde.toLowerCase()).not.toContain(k)
    }
  })
})

describe('çıktı normalizasyonu', () => {
  it('Claude Code `result` zarfı tanınıyor', () => {
    expect(metneCevir({ result: 'birinci\n\nikinci' })).toEqual({ lines: ['birinci', 'ikinci'] })
  })

  it('ayrıştırılamayan çıktının `text` zarfı da tanınıyor', () => {
    expect(metneCevir({ text: 'tek satır' })).toEqual({ lines: ['tek satır'] })
  })

  it('boş çıktı `null` — "metin yok" sessizce ham kayıtlara düşmemeli', () => {
    expect(metneCevir({ result: '   ' })).toBeNull()
    expect(metneCevir(null)).toBeNull()
    expect(metneCevir('düz dize')).toBeNull()
  })

  it('`duzMetin` görsel brief`ini tek satıra indiriyor', () => {
    expect(duzMetin({ result: 'a\nb' })).toBe('a b')
  })

  // ⚠ Bu test bir kusurdan doğdu: `generateBody` metin çıktısını `{lines,raw}` yapıyor
  // ve bir sonraki adım onu okurken ham şekli arıyordu — kendi iki fonksiyonum
  // arasında şekil uyuşmazlığı. Zincirin İKİ ucu da ölçülmeli.
  it('ZATEN normalize edilmiş `{lines}` çıktısı da tanınıyor', () => {
    expect(metneCevir({ lines: ['a', 'b'] })).toEqual({ lines: ['a', 'b'] })
    expect(duzMetin({ lines: ['a', 'b'], raw: { result: 'a\nb' } })).toBe('a b')
    expect(metneCevir({ lines: [] })).toBeNull()
  })
})

describe('akış ayrıştırıcısı — fotoğrafın yerine geçen görsellik', () => {
  const G = [
    'Başlık',
    'gövde bir',
    'AKIŞ: Vardiya devri',
    '- Sayım | kayıtlar karşılaştırılır',
    '- Devir | açık işler aktarılır',
    'kapanış',
  ]

  it('akışı ayırıyor ve satırlardan ÇIKARIYOR', () => {
    // Çıkarılmazsa aynı bilgi hem diyagramda hem metinde görünür.
    const r = akisiAyir(G)
    expect(r.akis?.title).toBe('Vardiya devri')
    expect(r.akis?.nodes).toHaveLength(2)
    expect(r.satirlar).toEqual(['Başlık', 'gövde bir', 'kapanış'])
  })

  it('düğüm adını ve ayrıntısını `|` ile ayırıyor', () => {
    expect(akisiAyir(G).akis?.nodes[0]).toEqual({
      label: 'Sayım',
      detail: 'kayıtlar karşılaştırılır',
    })
  })

  it('ayrıntısız düğüm kabul ediliyor', () => {
    const r = akisiAyir(['B', 'AKIŞ: X', '- bir', '- iki'])
    expect(r.akis?.nodes[1]).toEqual({ label: 'iki' })
  })

  it('AKIŞ yoksa satırlar DOKUNULMADAN dönüyor', () => {
    const d = ['a', 'b']
    const r = akisiAyir(d)
    expect(r.akis).toBeNull()
    expect(r.satirlar).toBe(d)
  })

  it('TEK düğüm geçersiz — çizici de reddediyor', () => {
    // Sınır çiziciden (`MAX_DUGUM`) geliyor; iki yerde iki sayı tutulmuyor.
    const r = akisiAyir(['a', 'AKIŞ: X', '- tek'])
    expect(r.akis).toBeNull()
    // ⚠ Satırlar YİNE temizleniyor: yarım bir akış metne geri düşerse çöp görünür.
    expect(r.satirlar).toEqual(['a'])
  })

  it('ALTIDAN fazla düğüm geçersiz ve satırlar yine temizleniyor', () => {
    const cok = ['a', 'AKIŞ: X', ...Array.from({ length: 7 }, (_, i) => `- adım ${i}`)]
    const r = akisiAyir(cok)
    expect(r.akis).toBeNull()
    expect(r.satirlar).toEqual(['a'])
  })
})
