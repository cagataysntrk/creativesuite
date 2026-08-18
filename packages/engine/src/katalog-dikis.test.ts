// Katalog merkezli hattın DİKİŞİ — üretim yolu gerçekten bağlı mı (FAZ-15.9 · D-268).
//
// ⚠ ⚠ **BU DOSYANIN VARLIK SEBEBİ ONUNCU ZİNCİR KOPUKLUĞU.** Panorama render'ı, altı
// şablonluk katalog, seçici, uyarlayıcı ve denetim yazıldı; hepsinin testi yeşildi;
// 42 kapı yeşildi. Ve `renderPanorama`nın üretim yolunda TEK BİR ÇAĞIRANI YOKTU.
// Modülleri test etmek zinciri test etmez: her halka sağlamken zincir kopuk olabilir.
// Buradaki testler modülleri değil, ARALARINDAKİ GEÇİŞLERİ sınıyor.

import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { loadPipeline } from '@suite/registry'
import { join } from 'node:path'
import { ornekBul, type KatalogOrnegi } from '@suite/render'
import { promptTuret, uyarlamayaCevir } from './verbs/bodies.js'
import { uyarla } from './plan/sablon-uyarla.js'

const REPO = join(import.meta.dirname, '../../..')

const girdi = (
  constraints: Record<string, unknown>,
  inputs: Record<string, unknown> = {}
): Parameters<typeof promptTuret>[1] =>
  ({ constraints, inputs, capability: 'text.generate' }) as never

const liste = [
  'Bir tekstil hattını döngüsel yapan beş şart',
  '1. Elyaf karışımı beyan edilecek',
  '2. Boya banyosu ayrı toplanacak',
  '3. Kesim firesi kaynakta ayrışacak',
  '4. Geri kazanılan elyafın alıcısı olacak',
  '5. Döngü kendi maliyetini karşılayacak',
]

describe('dikiş 1: hat dosyası → üretim yolu', () => {
  // ⚠ ⚠ Bir hattın var olması, adımlarının bağlanmış olması demek DEĞİL. Bu testin
  // sorduğu şey: katalog hattı gerçekten katalog dallarını tetikliyor mu.
  // ⚠ ⚠ **YAML DOSYASI ELLE OKUNMUYOR, RESMÎ ÇÖZÜCÜDEN GEÇİYOR.** İlk sürüm dosyayı
  // `readFileSync` ile okudu ve `chokepoints` kapısı onu İKİNCİ BİR YAPILANDIRMA
  // ÇÖZÜCÜSÜ sayıp reddetti — haklı olarak: registry iki yerde çözülürse UI'ın gördüğü
  // hat ile motorun koştuğu hat ayrışır. Test de bir tüketicidir; kuralın dışında değil.
  it('katalog hattı `sablon_uyarla` ve `katalog` kısıtlarını taşıyor', () => {
    const r = loadPipeline(join(REPO, 'registry/pipelines'), 'instagram-karosel')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const kisit = (id: string): Record<string, unknown> =>
      (r.value.steps.find((s) => s.id === id)?.constraints ?? {}) as Record<string, unknown>
    expect(kisit('sablon-uyarla')['sablon_uyarla']).toBe(true)
    expect(kisit('kompozit')['katalog']).toBe(true)
    // Sıra da sözleşme: uyarlama metinden SONRA, kompozit uyarlamadan sonra.
    const adimlar = r.value.steps.map((s) => s.id)
    expect(adimlar.indexOf('metin-uret')).toBeLessThan(adimlar.indexOf('sablon-uyarla'))
    expect(adimlar.indexOf('sablon-uyarla')).toBeLessThan(adimlar.indexOf('kompozit'))
    expect(adimlar.indexOf('kompozit')).toBeLessThan(adimlar.indexOf('render'))
  })

  // ⚠ `renderPanorama`nın çağıranı SAYILIYOR: sıfırdan büyük olmalı. Bu testin ilk
  // hâli sıfır sayardı ve mimarinin tamamı erişilemez durumdaydı.
  it('`renderPanorama` üretim kodundan çağrılıyor — sıfır çağıran DEĞİL', () => {
    const kok = join(REPO, 'packages/engine/src')
    const dosyalar = readdirSync(kok, { recursive: true, encoding: 'utf8' }).filter(
      (f) => f.endsWith('.ts') && !f.endsWith('.test.ts')
    )
    const cagiranlar = dosyalar.filter((f) =>
      readFileSync(join(kok, f), 'utf8').includes('renderPanorama(')
    )
    expect(cagiranlar.length).toBeGreaterThan(0)
  })
})

describe('dikiş 2: metin → şablon seçimi → uyarlama istemi', () => {
  it('istem şablonu seçip DOLU taslağı anlatıyor', () => {
    const p = promptTuret(
      'text.generate',
      girdi({ sablon_uyarla: true, topic: 'Tekstil atığı' }, { m: { lines: liste } })
    )
    expect(p).toContain('akan-alan')
    expect(p).toContain('Tekstil atığı')
    expect(p).toContain('ÖRNEK VERİ')
    // Kaynak metin isteme giriyor: agent neyi uyarlayacağını görmeli.
    expect(p).toContain('Boya banyosu')
  })

  // ⚠ ⚠ Seçim yapılamıyorsa istem BOŞ — sessizce bir varsayılana düşmüyor.
  it('seçim yapılamazsa istem boş dönüyor', () => {
    // Alt sınırın altında: hiçbir şablon iki satırla kurulamıyor.
    const az = ['Tek satır', 'İki satır']
    expect(promptTuret('text.generate', girdi({ sablon_uyarla: true }, { m: { lines: az } }))).toBe(
      ''
    )
  })

  it('metin gelmemişse istem boş dönüyor', () => {
    expect(promptTuret('text.generate', girdi({ sablon_uyarla: true }, {}))).toBe('')
  })
})

// ⚠ ⚠ **BU DİKİŞ GERÇEK BİR KOŞUDA SESSİZCE KOPUKTU.** Hat uçtan uca YEŞİL koştu ve
// defterde `gorsel-brief` `{atlandi: true, sebep: 'prompt-yok'}` yazıyordu: brief
// kurucusu slayt-başına yolun `tasarimPlani`ni arıyordu, katalog yolunda o yok. Yeşil
// bir koşu, bağlı bir zincir demek değil.
describe('dikiş 2b: şablonun görsel ihtiyacı → brief istemi', () => {
  it('görsel ilan eden şablonda brief KURULUYOR', () => {
    const p = promptTuret(
      'text.generate',
      girdi(
        { gorsel_brief: true, topic: 'Geri kazanım' },
        { k: { sablonId: 'sahne' }, m: { lines: liste } }
      )
    )
    expect(p).not.toBe('')
    expect(p).toContain('plain solid black background')
    expect(p).toContain('Geri kazanım')
    // ⚠ ⚠ **R-20 İHLAL TESTİ: istemin KENDİSİ yasaklı sözcük taşımamalı.** İlk sürüm
    // *"do not ask for any lettering…"* yazıyordu; model bunu brief'e kopyaladı ve
    // muhafız `lettering` alt dizesini yakalayıp görsel adımını reddetti. Muhafız
    // olumsuzlamayı anlamıyor — istem de anmamalı.
    for (const yasak of ['lettering', 'caption', 'text', 'wording', 'sign'])
      expect(p.toLowerCase(), yasak).not.toContain(yasak)
  })

  it('görsel istemeyen şablonda brief YOK — kullanılmayacak görsele kota harcanmıyor', () => {
    for (const id of ['veri-hikayesi', 'akan-alan'])
      expect(
        promptTuret(
          'text.generate',
          girdi({ gorsel_brief: true, topic: 'x' }, { k: { sablonId: id } })
        ),
        id
      ).toBe('')
  })
})

// ⚠ ⚠ **ÖN EK TUZAĞI — bu dosyada uyarısı YAZILI olduğu hâlde tekrarlandı.**
// `bodies.ts`teki `image.critique` notu aynen şunu söylüyordu: *"ön ek eşleşmesiyle
// kurulan her dal, ön eki paylaşan ikinci bir yeteneğin geleceğini varsaymalı."*
// `image.matte` dalı yine de genel `image.*` dalından SONRA konuldu; gerçek koşuda
// `gorsel-kirp` atlandı ve arka plan silme hiç koşmadı.
describe('dikiş 2c: `image.matte` ön ek tuzağına düşmüyor', () => {
  it('görsel varsa istem KURULUYOR — genel `image.*` dalı yutmuyor', () => {
    const p = promptTuret(
      'image.matte',
      girdi({}, { g: { format: 'base64', data: 'AAAA', width: 8, height: 8 } })
    )
    expect(p).not.toBe('')
  })

  it('silinecek görsel yoksa istem BOŞ — bir önceki adımın düşmesi gizlenmiyor', () => {
    expect(promptTuret('image.matte', girdi({}, {}))).toBe('')
  })
})

describe('dikiş 3: model çıktısı → uyarlama nesnesi', () => {
  const gecerli = JSON.stringify({
    sablonId: 'akan-alan',
    kartlar: Array.from({ length: 6 }, (_, i) => ({
      ustBaslik: `ŞART ${i}`,
      baslik: `Başlık **${i}**`,
      govde: 'Gövde.',
      hayalet: String(i),
      rayaSol: 'TEKSTİL',
      rayaOrta: 'Saha ölçümü 2026',
    })),
  })

  it('düz JSON ayrıştırılıyor', () => {
    expect(uyarlamayaCevir(gecerli)?.kartlar).toHaveLength(6)
  })

  // ⚠ ⚠ Bu üç şekil GERÇEK bir koşuda öğrenildi: `claude-code` `{result}` döndürüyor
  // ve ilk sürüm yalnız `{text}` biliyordu — hat `ADAPTATION_UNPARSEABLE` ile durdu.
  it('sağlayıcının `result`/`text`/`content` şekillerini tanıyor', () => {
    for (const a of ['result', 'text', 'content'])
      expect(uyarlamayaCevir({ [a]: gecerli })?.sablonId, a).toBe('akan-alan')
  })

  it('kod bloğu içindeki JSON da ayrıştırılıyor', () => {
    expect(uyarlamayaCevir('```json\n' + gecerli + '\n```')?.sablonId).toBe('akan-alan')
  })

  // ⚠ ⚠ `as Uyarlama` çalışma zamanında hiçbir şey kontrol etmiyor. Model `kartlar`
  // yerine `cards` yazarsa nesne "geçerli" görünür ve boş kart dizisiyle devam edilir.
  it('yanlış anahtarlı çıktı REDDEDİLİYOR', () => {
    expect(uyarlamayaCevir(JSON.stringify({ sablonId: 'akan-alan', cards: [] }))).toBeNull()
  })

  it('eksik alanlı kart REDDEDİLİYOR', () => {
    const eksik = JSON.stringify({
      sablonId: 'akan-alan',
      kartlar: [{ ustBaslik: 'A', baslik: 'B' }],
    })
    expect(uyarlamayaCevir(eksik)).toBeNull()
  })

  it('JSON olmayan çıktı REDDEDİLİYOR', () => {
    expect(uyarlamayaCevir('Tabii, işte uyarlama:')).toBeNull()
  })
})

// ⚠ ⚠ **İKİ PANORAMA VAR ve render DOĞRU OLANI almak zorunda.** `inputs` tüm önceki
// adımların çıktısını taşıyor; `kompozit` görselsiz, `yuva-doldur` görselli panorama
// üretiyor. `.find()` ilkini alıyordu ve gerçek koşuda görsel üretildiği hâlde YER
// TUTUCU render edildi. Aynı tuzak `document` yolunda kayıtlıydı (D-259) — yeni dal
// o dersi kendiliğinden almadı.
describe('dikiş 3b: iki panorama arasından SONUNCUSU seçiliyor', () => {
  it('render gövdesi son üreticiye bakıyor', () => {
    const kaynak = readFileSync(join(REPO, 'packages/engine/src/verbs/bodies.ts'), 'utf8')
    // İlk eşleşeni alan bir `find` panorama dalında kalmamalı.
    expect(kaynak).toContain('panoramalar[panoramalar.length - 1]')
    expect(kaynak).toContain('panoramaListesi[panoramaListesi.length - 1]')
    // ⚠ Uyarlamada da aynı desen: `duzelt` ikinci bir uyarlama üretiyor ve ilkini almak,
    // düzeltme turunun işini sessizce çöpe atmak olurdu.
    expect(kaynak).toContain('uyarlamalar[uyarlamalar.length - 1]')
  })
})

// ⚠ ⚠ **DÜZELTME TURU: kusur YOKSA istem BOŞ.** Zorla koşan bir tur, düzeltilecek şey
// olmadığında değişiklik üretir ve insanın onayladığı metinden uzaklaşır.
describe('dikiş 3c: denetim kusurları → düzeltme istemi', () => {
  const uyarlama = {
    sablonId: 'sahne',
    kartlar: Array.from({ length: 4 }, (_, i) => ({
      ustBaslik: `ADIM ${i}`,
      baslik: `Başlık **${i}**`,
      govde: 'Gövde.',
      hayalet: '',
      rayaSol: 'X',
      rayaOrta: 'Kaynak 2026',
    })),
  }

  it('kusur varsa istem kusurları ve ÖNCEKİ uyarlamayı taşıyor', () => {
    const p = promptTuret(
      'text.generate',
      girdi(
        { sablon_duzelt: true },
        {
          u: { uyarlama },
          r: {
            kusurlar: [{ tur: 'eksik-glif', kart: null, alan: null, aciklama: 'kapsam dışı: ✓' }],
          },
        }
      )
    )
    expect(p).toContain('kapsam dışı: ✓')
    expect(p).toContain('"sablonId": "sahne"')
    expect(p).toContain('kompozisyona dokunamazsın')
  })

  // ⚠ ⚠ **GERÇEK KOŞUDAN:** dört kusurun dördü de `matlama-tutmuyor`du (görsel zemini
  // siyah değil) ve tur yine koştu — agent'a çözemeyeceği bir görev, boşa bir çağrı.
  it('yalnız METİNLE düzelir kusur varsa tur koşuyor', () => {
    const gorselKusuru = {
      tur: 'matlama-tutmuyor',
      kart: null,
      alan: null,
      aciklama: 'köşe parlaklığı 101/255',
    }
    expect(
      promptTuret(
        'text.generate',
        girdi({ sablon_duzelt: true }, { u: { uyarlama }, r: { kusurlar: [gorselKusuru] } })
      )
    ).toBe('')
    // Metinle düzelir bir kusur eklenince tur koşuyor ve YALNIZ onu taşıyor.
    const p = promptTuret(
      'text.generate',
      girdi(
        { sablon_duzelt: true },
        {
          u: { uyarlama },
          r: {
            kusurlar: [
              gorselKusuru,
              { tur: 'tasma', kart: 2, alan: 'baslik', aciklama: 'yatayda 40 px taşıyor' },
            ],
          },
        }
      )
    )
    expect(p).toContain('yatayda 40 px')
    expect(p).not.toContain('köşe parlaklığı')
  })

  it('kusur yoksa istem BOŞ — tur koşmuyor', () => {
    expect(
      promptTuret(
        'text.generate',
        girdi({ sablon_duzelt: true }, { u: { uyarlama }, r: { kusurlar: [] } })
      )
    ).toBe('')
  })

  it('önceki uyarlama yoksa tur koşmuyor', () => {
    expect(
      promptTuret(
        'text.generate',
        girdi({ sablon_duzelt: true }, { r: { kusurlar: [{ aciklama: 'x' }] } })
      )
    ).toBe('')
  })
})

describe('dikiş 4: uyarlama → panorama belgesi', () => {
  it('birleştirilmiş belge şablonun kompozisyonunu taşıyor', () => {
    const u = uyarlamayaCevir(
      JSON.stringify({
        sablonId: 'akan-alan',
        kartlar: Array.from({ length: 6 }, (_, i) => ({
          ustBaslik: `ŞART ${i}`,
          baslik: `Başlık **${i}**`,
          govde: 'Gövde.',
          hayalet: String(i),
          rayaSol: 'TEKSTİL',
          rayaOrta: 'Saha ölçümü 2026',
        })),
      })
    )
    expect(u).not.toBeNull()
    if (u === null) return
    const ornek = ornekBul('akan-alan') as KatalogOrnegi
    const r = uyarla(ornek, u)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    // Kompozisyon şablondan, içerik uyarlamadan.
    expect(r.belge.alanSiniri).toEqual(ornek.alanSiniri)
    expect(r.belge.tipografi).toEqual(ornek.tipografi)
    expect(r.belge.kartlar[0]?.baslik).toBe('Başlık **0**')
  })
})
