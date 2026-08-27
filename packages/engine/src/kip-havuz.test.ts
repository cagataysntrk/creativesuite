// KONU HAVUZU KALKTI — serbestlik konuda, kaynakta değil (FAZ-19.13).
//
// ⚠ ⚠ **DEPO SAHİBİ HAVUZUN NE ÜRETTİĞİNİ GÖRDÜ:** *"12 konu ile sınırlamak ve buradan
// seçtirmek sürekli aynı içeriklerin üretilmesine sebep olur… firma belli, ürünler
// belli, ne olduğu belli — istediği gibi konu seçsin."* On iki başlık, on iki konu
// demekti; yirminci karoselde havuz tükeniyor ve aynı başlık yeniden dolaşıma giriyor.
//
// ⚠ ⚠ **VE ASIL SINAMA: GROUNDING KAYBOLMADI MI.** Havuzu kaldırmak, markanın
// söylemeye yetkili olmadığı bir konuyu üretime sokmak DEĞİL. Konu serbest; kaynağı
// zorunlu ve denetleniyor.
import { describe, expect, it } from 'vitest'
import { konuSecimiCozumle, konuSecPromptu } from './plan/konu-sec.js'

const ADAYLAR = [
  { baslik: 'Excel ve vardiya defteri', tur: 'competitor' },
  { baslik: 'Veri katmanından karara', tur: 'positioning' },
  { baslik: 'Ürün demosu girişi', tur: 'offer' },
]

describe('konu havuzu kalktı', () => {
  it('TÜRETİLMİŞ konu DAYANAKLA kabul ediliyor — listede olmasa bile', () => {
    const c = konuSecimiCozumle(
      '{"konu": "Vardiya defterinden ölçülebilir hatta geçmenin ilk adımı", "dayanak": [1, 2], "gerekce": "iki kaydın kesişimi"}',
      ADAYLAR,
      'firma'
    )
    expect(c?.konu).toBe('Vardiya defterinden ölçülebilir hatta geçmenin ilk adımı')
  })

  it('DAYANAKSIZ konu REDDEDİLİYOR — kaynaksız konu üretime girmemeli', () => {
    expect(
      konuSecimiCozumle('{"konu": "Blokzincirle tedarik", "gerekce": "gündem"}', ADAYLAR, 'firma'),
      'dayanak yok'
    ).toBeNull()
    expect(
      konuSecimiCozumle(
        '{"konu": "Blokzincirle tedarik", "dayanak": [9], "gerekce": "gündem"}',
        ADAYLAR,
        'firma'
      ),
      'listede olmayan numara'
    ).toBeNull()
  })

  it('ESKİ numara yolu ÇALIŞMAYA DEVAM EDİYOR — defterdeki eski koşular okunabilsin', () => {
    expect(konuSecimiCozumle('{"secim": 2, "gerekce": "x"}', ADAYLAR, 'firma')?.konu).toBe(
      'Veri katmanından karara'
    )
  })

  it('YAKIN ZAMANDA YAYINLANANLAR isteme giriyor — en yenisi başta', () => {
    const p =
      konuSecPromptu({
        adaylar: ADAYLAR,
        islenmisSayisi: 3,
        kip: 'firma',
        yayinlananKonular: ['Dün yayınlanan konu', 'Geçen ay yayınlanan konu'],
      }) ?? ''
    expect(p).toContain('YAKIN ZAMANDA YAYINLANANLAR')
    expect(p).toContain('1. Dün yayınlanan konu')
    expect(p, 'yakınlık pahalı — istem bunu söylüyor').toContain('daha yeni gördü')
  })

  it('GENEL kipte de yayınlananlar isteme giriyor', () => {
    const p =
      konuSecPromptu({
        adaylar: [],
        islenmisSayisi: 0,
        kip: 'genel',
        yayinlananKonular: ['X konusu'],
      }) ?? ''
    expect(p).toContain('YAKIN ZAMANDA YAYINLANANLAR')
  })
})
