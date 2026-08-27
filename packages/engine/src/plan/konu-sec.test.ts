// Konu seçimi ADAYLARA karşı doğrulanıyor (§11.4 · D-308).
//
// ⚠ ⚠ Bu dosya gerçek bir koşu durduktan sonra yazıldı: istem adayları
// `[tur] baslik` diye listeliyordu ve model "başlığı birebir kopyala" talimatını
// harfiyen uygulayıp ÖN EKİ de kopyaladı. Doğrulama reddetti, hat durdu. Model
// yanlış davranmadı — istem belirsizdi. Ders: **kendi biçimimize toleranslıyız,
// uydurmaya değil.**

import { describe, expect, it } from 'vitest'
import { konuSecPromptu, konuSecimiCozumle, type KonuAdayi } from './konu-sec.js'

const ADAYLAR: readonly KonuAdayi[] = [
  { baslik: 'Veri katmanından karara', tur: 'positioning' },
  { baslik: 'Excel ve vardiya defteri', tur: 'competitor' },
]

describe('konu seçimi çözümleme', () => {
  it('temiz cevap kabul ediliyor', () => {
    const r = konuSecimiCozumle(
      '{"konu": "Veri katmanından karara", "gerekce": "kanıtı var"}',
      ADAYLAR
    )
    expect(r).toEqual({ konu: 'Veri katmanından karara', gerekce: 'kanıtı var' })
  })

  it('BİZİM süslemelerimiz soyuluyor — ön ek, tür parantezi, satır numarası', () => {
    for (const ham of [
      '{"konu": "[positioning] Veri katmanından karara"}',
      '{"konu": "Veri katmanından karara   (tür: positioning)"}',
      '{"konu": "3. Veri katmanından karara"}',
    ]) {
      expect(konuSecimiCozumle(ham, ADAYLAR)?.konu).toBe('Veri katmanından karara')
    }
  })

  it('UYDURULMUŞ konu REDDEDİLİYOR — kaynaksız konu, kaynaksız iddianın başlangıcı', () => {
    expect(konuSecimiCozumle('{"konu": "Bugün aklıma gelen bir şey"}', ADAYLAR)).toBeNull()
  })

  // ⚠ ⚠ **GERÇEK KOŞU:** model önce yanlış anahtarla yazdı, sonra "Düzeltme:" deyip
  // İKİNCİ bir JSON ekledi. Açgözlü `/\{[\s\S]*\}/` ikisini birden yutuyor, sonuç
  // geçersiz JSON ve adım duruyordu. Modelin SON sözü, düzeltmesidir.
  it('model kendini düzeltirse SON nesne okunuyor', () => {
    const ham =
      '{"konu": "Veri katmanından karara", "gerecke": "yanlış anahtar"} ' +
      'Düzeltme: {"konu": "Excel ve vardiya defteri", "gerekce": "doğrusu"}'
    expect(konuSecimiCozumle(ham, ADAYLAR)).toEqual({
      konu: 'Excel ve vardiya defteri',
      gerekce: 'doğrusu',
    })
  })

  it('önünde açıklama olan JSON okunuyor', () => {
    const ham = 'Seçimim şu: {"konu": "Veri katmanından karara", "gerekce": "kanıt"}'
    expect(konuSecimiCozumle(ham, ADAYLAR)?.konu).toBe('Veri katmanından karara')
  })

  it('JSON olmayan cevap reddediliyor', () => {
    expect(konuSecimiCozumle('Bence Excel konusu iyi olur.', ADAYLAR)).toBeNull()
  })

  it('istem başlığı ÖNCE, türü SONRA gösteriyor — belirsizliğin kaynağı buydu', () => {
    const p = konuSecPromptu({ adaylar: ADAYLAR, islenmisSayisi: 4 }) ?? ''
    expect(p).toContain('1. Veri katmanından karara')
    expect(p).toContain('(tür: positioning)')
    expect(p).not.toContain('[positioning]')
  })

  it('aday yoksa istem `null` — konusuz koşan hat markadan gelmeyen metin üretir', () => {
    expect(konuSecPromptu({ adaylar: [], islenmisSayisi: 0 })).toBeNull()
  })

  // ── numara yolu ────────────────────────────────────────────────────────────
  //
  // ⚠ ⚠ **GERÇEK KOŞU BURADA DURDU.** `run_01a016ee` ücretli `konu-sec` adımında
  // `TOPIC_NOT_IN_CANDIDATES` verdi: model sekiz başlığın hiçbirini yazmadı, kendi
  // cümlesini kurdu. Doğrulama haklıydı — ama İSTEM yanlış soruyu soruyordu.
  // Kopyalanması istenen her başlık, kopyalanırken bozulabilir.

  // ⚠ ⚠ **BU İDDİANIN ÖNCÜLÜ DEĞİŞTİ.** Eskiden konu LİSTEDEN seçiliyordu ve cevap bir
  // NUMARAYDI — gerekçesi geçerliydi: başlığı yeniden yazdırmak tire/büyük harf riski
  // taşıyor. Ama depo sahibi havuzun kendisini kaldırttı: *"12 konu ile sınırlamak
  // sürekli aynı içeriklerin üretilmesine sebep olur."* Konu artık kayıtlardan
  // TÜRETİLİYOR ve bir numarayla ifade edilemez.
  //
  // ⚠ Kopyalama riski KAYBOLMADI, TAŞINDI: kopyalanan şey artık başlık değil DAYANAK
  // numarası — ve numara kopyalanamaz, ya listededir ya değildir.
  it('istem KONU + DAYANAK istiyor — konu türetiliyor, kaynağı denetleniyor', () => {
    const p = konuSecPromptu({ adaylar: ADAYLAR, islenmisSayisi: 4 }) ?? ''
    expect(p).toContain('"konu"')
    expect(p).toContain('"dayanak"')
    expect(p, 'kayıtlar bir MENÜ değil').toContain('MENÜ DEĞİL')
    expect(p, 'dayanaksız konu reddedilecek').toContain('en az bir numara')
  })

  it('numarayla seçim başlığa çevriliyor', () => {
    expect(konuSecimiCozumle('{"secim": 2, "gerekce": "rakip anlatısı"}', ADAYLAR)).toEqual({
      konu: 'Excel ve vardiya defteri',
      gerekce: 'rakip anlatısı',
    })
  })

  it('numara DİZE olarak gelse de kabul ediliyor — anlamı değişmiyor', () => {
    expect(konuSecimiCozumle('{"secim": "1"}', ADAYLAR)?.konu).toBe('Veri katmanından karara')
  })

  it('listede olmayan numara REDDEDİLİYOR — uydurma numara da uydurmadır', () => {
    expect(konuSecimiCozumle('{"secim": 9}', ADAYLAR)).toBeNull()
    expect(konuSecimiCozumle('{"secim": 0}', ADAYLAR)).toBeNull()
  })

  it('TİRE farkı seçimi bozmuyor — daktilo farkı uydurma değildir', () => {
    // Başlıklarda uzun tire var; model kısa tire yazıyor. Anlam aynı.
    const adaylar: readonly KonuAdayi[] = [
      { baslik: 'Veri katmanından karara — Upcytech konumu', tur: 'positioning' },
    ]
    const r = konuSecimiCozumle('{"konu": "Veri katmanından karara - Upcytech konumu"}', adaylar)
    // Dönen başlık MODELİN yazdığı değil, LİSTEDEKİ — aşağı akış kayıtla eşleşmeli.
    expect(r?.konu).toBe('Veri katmanından karara — Upcytech konumu')
  })

  it('tire toleransı UYDURMAYI geçirmiyor', () => {
    expect(konuSecimiCozumle('{"konu": "Bambaşka - bir konu"}', ADAYLAR)).toBeNull()
  })
})

// ── havuz tükenince ÜRETİM DURMAZ ──────────────────────────────────────────
//
// ⚠ ⚠ **BU DUVAR GERÇEKTEN VURULDU.** Panelden konusuz başlatma
// *"konu seçilemez: geçmişte işlenmemiş aday kayıt kalmadı"* diyerek üretimi tamamen
// durdurdu. Bir markanın kayıt sayısı SONLUDUR; N koşudan sonra kalıcı olarak duran
// bir sistem tasarımı gereği bozuktur. Çeşitlilik "bir daha asla" değil "en son
// kullanılan en sona" demek.
describe('aday havuzu tükendiğinde', () => {
  const ADAYLAR_TEKRAR: readonly KonuAdayi[] = [
    { baslik: 'Ölçüm pilotu', tur: 'offer', sonKosu: 'run_01a00000' },
    { baslik: 'Üretim müdürü', tur: 'persona', sonKosu: 'run_01a00001' },
  ]

  it('istem TEKRAR DOLAŞIMI açıkça söylüyor', () => {
    const p = konuSecPromptu({ adaylar: ADAYLAR_TEKRAR, islenmisSayisi: 77 }) ?? ''
    expect(p).toContain('HAVUZ TÜKENDİ')
    expect(p).toContain('EN ESKİ')
  })

  it('havuz DOLUYKEN eski istem korunuyor — gereksiz uyarı gürültüdür', () => {
    const p = konuSecPromptu({ adaylar: ADAYLAR, islenmisSayisi: 4 }) ?? ''
    expect(p).not.toContain('HAVUZ TÜKENDİ')
    expect(p).toContain('onlar bu listede YOK')
  })

  it('tekrar listesinden seçim yine NUMARAYLA çözülüyor', () => {
    expect(konuSecimiCozumle('{"secim": 2}', ADAYLAR_TEKRAR)?.konu).toBe('Üretim müdürü')
  })
})
