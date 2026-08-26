// İÇERİK KİPİ — kip istemi GERÇEKTEN değiştiriyor mu (FAZ-19.12 · madde 7).
//
// ⚠ ⚠ **BU KAPI BİR YASAĞIN GEVŞETİLMESİNİ KORUYOR ve o yüzden var.** `SELECT` bağlamsız
// üretimi reddediyordu; gerekçesi kodda yazılıydı ve HÂLÂ doğru: *"bağlamsız üretilen
// metin markadan değil modelin genel bilgisinden gelir ve bunu çıktıya bakarak ayırt
// etmek zor."* Depo sahibi genel içerik istedi — ama tehlike genel içeriğin kendisi
// değil, marka kaydından gelenle KARIŞMASIYDI. Kip o ayrımı açık yapıyor; bu kapı da
// ayrımın gerçekten kurulduğunu sınıyor.
//
// ⚠ ⚠ **VE ASIL SINAMA: "iki istem farklı" demek YETMEZ.** İki istem birbirinden farklı
// ama İKİSİ DE yanlış olabilir. O yüzden her kipin kendi taahhüdü ayrı ayrı aranıyor:
// firma kipinde "uydurma" yasağı, genel kipte kapsamın AÇIK olduğu ve Yasa 8.

import { describe, expect, it } from 'vitest'
import { icerikKipiCozumle, kipTarifi, ICERIK_KIPLERI } from '@suite/contracts'
import { konuSecPromptu, konuSecimiCozumle } from './konu-sec.js'

const ADAYLAR = [
  { baslik: 'Geri kazanılmış polimerde nem oranı', tur: 'proof' },
  { baslik: 'Vardiya başına sayaç', tur: 'positioning' },
]

describe('içerik kipi', () => {
  it('bilinmeyen değer FİRMAYA düşüyor — yeni seçenek eski davranışı bozmaz', () => {
    for (const v of [undefined, null, '', 'FIRMA', 'genell', 42, {}]) {
      expect(icerikKipiCozumle(v), String(v)).toBe('firma')
    }
    expect(icerikKipiCozumle('genel')).toBe('genel')
    expect([...ICERIK_KIPLERI]).toStrictEqual(['firma', 'genel'])
  })

  // ── FİRMA: kayda bağlı, uydurma YASAK ────────────────────────────────────
  it('firma kipi konuyu KAYITLARA bağlıyor', () => {
    const p = konuSecPromptu({ adaylar: ADAYLAR, islenmisSayisi: 3, kip: 'firma' }) ?? ''
    expect(p).toContain('KENDİ')
    expect(p, 'firma kipinde uydurma yasağı istemde YAZILI olmalı').toMatch(/UYDURMA/)
    expect(p, 'firma kipinde cevap NUMARA — başlık kopyalatmak tire/harf riski taşır').toContain(
      'secim'
    )
  })

  it('firma kipinde aday yoksa istem YOK — boş listeyle konu seçilemez', () => {
    expect(konuSecPromptu({ adaylar: [], islenmisSayisi: 0, kip: 'firma' })).toBeNull()
  })

  // ── GENEL: kapsam AÇIK, ama Yasa 8 duruyor ───────────────────────────────
  it('genel kipin kapsamı KAPALI BİR LİSTE DEĞİL', () => {
    const p = konuSecPromptu({ adaylar: ADAYLAR, islenmisSayisi: 3, kip: 'genel' }) ?? ''
    // ⚠ ⚠ **ASIL İDDİA BU.** Depo sahibi: *"bunları tek tek seçmicez, genel bir
    // özgürlük olduğu belli olsun"*. Kapalı bir liste yazsaydım model listenin dışına
    // çıkmazdı ve "genel" adı taşıyan bir kip, on maddelik bir menüye dönerdi.
    expect(p, 'kapsamın MENÜ olmadığı açıkça söylenmeli').toMatch(/MENÜ DEĞİL/)
    expect(p).toMatch(/SINIRLI DEĞİL/)
    expect(p, 'listede olmayan konunun da seçilebildiği söylenmeli').toMatch(/listede olmayan/)
  })

  it('genel kipte YASA 8 duruyor — kaynaksız sayısal iddia yasak', () => {
    const p = konuSecPromptu({ adaylar: ADAYLAR, islenmisSayisi: 3, kip: 'genel' }) ?? ''
    expect(
      p,
      'genel kipte kaynak baskısı en düşük, uydurma sayı riski en yüksek — ' +
        'istemin sustuğu yerde model doldurur'
    ).toMatch(/Sayı, yüzde, tarih ya da sıralama UYDURMA/)
  })

  it('genel kipte aday YOKSA da istem üretiliyor', () => {
    const p = konuSecPromptu({ adaylar: [], islenmisSayisi: 0, kip: 'genel' })
    expect(p, 'kayıt olmadan da konu önerilebilmeli — kipin varlık sebebi bu').not.toBeNull()
  })

  // ── ÇÖZÜMLEYİCİ: serbestlik yalnız GENEL kipte ───────────────────────────
  it('firma kipinde listede OLMAYAN konu reddediliyor', () => {
    const ham = '{"konu": "tamamen alakasız bir konu", "gerekce": "x"}'
    expect(
      konuSecimiCozumle(ham, ADAYLAR, 'firma'),
      'kayda dayanmayan konu SELECT ile hiçbir şey bulamaz'
    ).toBeNull()
  })

  it('genel kipte serbest konu KABUL ediliyor — ama boş olan değil', () => {
    const ham = '{"konu": "ölçüm alışkanlığı bir hattı nasıl değiştirir", "gerekce": "x"}'
    expect(konuSecimiCozumle(ham, ADAYLAR, 'genel')?.konu).toBe(
      'ölçüm alışkanlığı bir hattı nasıl değiştirir'
    )
    expect(
      konuSecimiCozumle('{"konu": "   ", "gerekce": "x"}', ADAYLAR, 'genel'),
      'serbestlik, cevapsızlığı kabul etmek değil'
    ).toBeNull()
  })

  // ── İKİ TARİF GERÇEKTEN AYRIŞIYOR MU ─────────────────────────────────────
  it('iki kipin tarifi birbirinden AYRI', () => {
    const f = kipTarifi('firma').join(' ')
    const g = kipTarifi('genel').join(' ')
    expect(f).not.toBe(g)
    expect(f, 'firma kipi tanıtım işidir').toMatch(/tanıtım/)
    expect(g, 'genel kip tanıtım DEĞİL — bilgi veren içerik').toMatch(/tanıtımı DEĞİL/)
  })
})
