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
import { ORNEKLER, ornekBul, type KatalogOrnegi } from '@suite/render'
import { fixedClock, seededRng } from '@suite/kernel'
import { composeBody, promptTuret, uyarlamayaCevir } from './verbs/bodies.js'

const CTX = {
  runId: 'run_t',
  stepId: 'kompozit',
  brandId: 'brd_t',
  eraId: 'era_t',
  correlationId: 'cor_t',
  clock: fixedClock('2026-08-18T00:00:00.000Z'),
  rng: seededRng(1),
}
const DAMGA = {
  brandId: 'brd_t',
  eraId: 'era_t',
  kitVersion: 'kit-1',
  definitionDigest: 'sha256:x',
  contextManifest: 'ctx_1',
  sourceRunId: 'run_t',
}
import { uyarla, uyarlamaIstemi } from './plan/sablon-uyarla.js'

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

// ⚠ ⚠ **KIRPMA ADIMI KENDİ GÖRSELİNİ KIRPAR — `inputs` TÜM ÇIKTILARI TAŞIYOR.**
// `run.ts` her adıma `inputs: ciktilar` geçiyor; daraltmayı `needs`i okuyan gövde yapmak
// zorunda. "DAG zaten daraltıyor" varsayımı bir YORUM SATIRI olarak yazılmıştı ve yanlıştı:
// dört kırpma adımının dördü de listenin ilkini, yani 1. görseli kırpıyordu. Kırpılmış
// olan hamı ezdiği için dört yuvaya da AYNI figür giriyordu. Üç gerçek koşu boyunca
// görünen "dört özdeş fotoğraf" kusurunun kök sebebi buydu.
describe('dikiş 3g: kırpma adımı KENDİ görselini seçiyor', () => {
  const istem = (needs: readonly string[]): string =>
    promptTuret('image.matte', {
      capability: 'image.matte',
      constraints: {},
      needs,
      inputs: {
        'gorsel-uret': { format: 'base64', data: 'AAAA', width: 8, height: 8 },
        'gorsel-uret-2': { format: 'base64', data: 'BBBB', width: 8, height: 8 },
      },
    } as never)

  it('bağlı olmadığı görsel TEK BAŞINA istem üretmez', () => {
    // `gorsel-uret-3` hiç üretilmediyse (şablonun üç yuvası yok) kırpma adımı ATLANMALI —
    // ama `inputs`ta başkalarının görselleri duruyor ve daraltma olmazsa adım koşardı.
    expect(istem(['gorsel-uret-3'])).toBe('')
    expect(istem(['gorsel-uret-2'])).not.toBe('')
  })
})

// ⚠ ⚠ **DÖRT YUVA, DÖRT AYRI KADRAJ — ve bunu GERÇEK KOŞU öğretti.** İlk sürümde kadraj
// tarifi yalnız brief adımının istemine giriyordu: dört ayrı brief koştu, dördünün istemi
// farklıydı ve çıkan dört fotoğraf BİREBİR AYNIYDI. Metin modeli tarifi düzledi. Bir
// modele "şunu koru" demek bir RİCA; garanti yapıya gömülmeli.
describe('dikiş 3e: kadraj varyantı GÖRSEL istemine doğrudan giriyor', () => {
  const brief = 'a worker on a textile line, cinematic light'
  const istem = (sira: number): string =>
    promptTuret('image.generate', {
      capability: 'image.generate',
      constraints: { topic: 'konu', gorsel_sira: sira },
      needs: ['gorsel-brief', 'kompozit'],
      inputs: { 'gorsel-brief': { text: brief }, kompozit: { sablonId: 'sahne' } },
    } as never)

  it('her sıra AYRI bir kadraj cümlesi taşıyor', () => {
    const dort = [1, 2, 3, 4].map(istem)
    for (const p of dort) expect(p).toContain(brief)
    // Dördü de birbirinden farklı olmalı: eşitlik, dört özdeş fotoğraf demek.
    expect(new Set(dort).size).toBe(4)
  })

  it('`kompozit` bağı KOPARSA varyant düşer — bağın bedeli ölçülüyor', () => {
    // ⚠ Bu iddia bağın GEREKLİLİĞİNİ kanıtlıyor: `needs`ten `kompozit` çıkınca şablon
    // kimliği okunamaz ve istem yalnız brief'e iner.
    const kopuk = promptTuret('image.generate', {
      capability: 'image.generate',
      constraints: { topic: 'konu', gorsel_sira: 2 },
      needs: ['gorsel-brief'],
      inputs: { 'gorsel-brief': { text: brief } },
    } as never)
    expect(kopuk).toBe(brief)
    expect(istem(2)).not.toBe(kopuk)
  })
})

// ⚠ ⚠ **ÇIKTI SÖZLEŞMESİ PANELİ TARİF ETMELİ.** İstem "panel alanını da yaz, tipi aynı
// olsun" diyordu ama panelin ŞEKLİNİ hiç söylemiyordu; `veri-hikayesi`nin altı kartında
// BEŞ farklı panel tipi var ve gerçek koşu `ADAPTATION_UNPARSEABLE` ile durdu. Sözleşmenin
// bir yarısı (kart alanları) yazılmış, öteki yarısı (panel) unutulmuştu.
//
// ⚠ Liste VERİDEN türüyor: katalogda geçen her panel tipi istemde tarif edilmiş olmalı.
// Yeni bir panel tipi eklendiğinde bu test onu kendiliğinden kapsıyor.
describe('dikiş 3i: uyarlama istemi HER panel tipini tarif ediyor', () => {
  it('katalogdaki her panel tipi çıktı şemasında geçiyor', () => {
    const tipler = new Set<string>()
    for (const o of Object.values(ORNEKLER)) {
      for (const k of o.kartlar) if (k.panel !== null) tipler.add(k.panel.tip)
    }
    expect(tipler.size, 'katalogda hiç panel yok — test anlamsız').toBeGreaterThan(0)
    // Panel taşıyan HERHANGİ bir şablonun istemi tüm şemayı basıyor (şema sabit kısım).
    const istem = uyarlamaIstemi(
      ornekBul('veri-hikayesi') as KatalogOrnegi,
      'veri-hikayesi',
      'konu'
    )
    for (const tip of tipler) {
      expect(istem, `panel tipi '${tip}' çıktı şemasında tarif edilmemiş`).toContain(
        `"tip": "${tip}"`
      )
    }
  })
})

// ⚠ ⚠ **ÖRNEK BAŞLIĞIN METNİ İSTEME GİRMEZ — YALNIZ ŞEKLİ.** İstem "başlıkları konuya
// göre yeniden yaz, aynen bırakmak reddedilir" diyordu ve model İKİ AYRI GERÇEK KOŞUDA
// dördü de aynen döndürdü; `uyarla` reddetti, hat `kompozit`te öldü. Talimatı yükseltmek
// üçüncü kez denemek olurdu: kopyalanmasını istemediğimiz metni modelin önüne koyduğumuz
// sürece kopyalanıyor.
describe('dikiş 3h: uyarlama istemi örnek başlığı SIZDIRMIYOR', () => {
  for (const id of Object.keys(ORNEKLER)) {
    it(`${id} · başlık metinleri istemde yok, şekli var`, () => {
      const ornek = ornekBul(id) as KatalogOrnegi
      const istem = uyarlamaIstemi(ornek, id, 'bir konu')
      for (const k of ornek.kartlar) {
        // Vurgu işaretleri ve boşluklar atılmış hâliyle bile geçmemeli.
        const duz = k.baslik.replace(/\*\*/g, '')
        expect(istem, `${id}: "${duz}" isteme sızdı`).not.toContain(duz)
      }
      // Şekil bilgisi DURMALI: uzunluk ve vurgu yeri olmadan başlık disiplini kaybolur.
      expect(istem).toMatch(/başlık: \d+ kelime/)
    })
  }
})

// ⚠ ⚠ **HAYALETİ ŞABLON KARAR VERİR.** Örnekteki hayalet boşsa o şablon ögeyi
// kullanmıyor demektir; model doldurursa metnin arkasına dev soluk bir filigran düşüyor.
// Altı şablonun altısında öyleydi ve depo sahibi haklı olarak "neden hepsinde var,
// çoğunda yazıyla çakışıyor" dedi.
describe('dikiş 3j: hayalet kullanmayan şablonda model onu dolduramıyor', () => {
  for (const id of Object.keys(ORNEKLER)) {
    const ornek = ornekBul(id) as KatalogOrnegi
    const kullaniyor = ornek.kartlar.some((k) => k.hayalet.trim() !== '')
    it(`${id} · hayalet ${kullaniyor ? 'kullanıyor' : 'KULLANMIYOR'}`, () => {
      const r = uyarla(ornek, {
        sablonId: id,
        kartlar: ornek.kartlar.map((_, i) => ({
          ustBaslik: `ADIM ${i}`,
          baslik: 'Başlık **bir**',
          govde: 'Gövde.',
          hayalet: 'FİLİGRAN',
          rayaSol: 'X',
          rayaOrta: 'Gerçek kaynak, 2026',
        })),
      })
      expect(r.ok).toBe(true)
      if (!r.ok) return
      for (const [i, kart] of r.belge.kartlar.entries()) {
        if ((ornek.kartlar[i]?.hayalet ?? '').trim() === '') {
          expect(kart.hayalet, `${id} kart ${i + 1}: model hayalet SIZDIRDI`).toBe('')
        } else {
          expect(kart.hayalet).toBe('FİLİGRAN')
        }
      }
    })
  }
})

// ⚠ ⚠ **KOMPOZİSYON ALANLARI UYARLAMADAN SAĞ ÇIKMALI — ALAN ALAN DEĞİL, LİSTEYLE.**
// Bu sınıf hata İKİ KEZ tekrarlandı: `kolon` taşınmadı (dört slaytta metin sola düşüp
// figürün üstüne bindi), sonra dersin HEMEN YANINA eklenen `elYazisi` de taşınmadı
// (kapak slaydındaki el yazısı vurgusu kayboldu). Üçüncüsünü bir yorum engellemez.
//
// ⚠ Liste VERİDEN türüyor: bir kartın İÇERİK alanları sabit ve bilinen; geri kalan her
// alan kompozisyondur. Yeni bir opsiyonel alan eklendiğinde bu test onu kendiliğinden
// kapsıyor — bakım gerektiren bir beyaz liste, unutulacak ikinci bir yerdir.
describe('dikiş 3f: kompozisyon alanları uyarlamadan sağ çıkıyor', () => {
  /** Uyarlamanın YAZDIĞI alanlar. Geri kalan her şey şablonun kompozisyonudur. */
  const ICERIK = new Set([
    'ustBaslik',
    'baslik',
    'govde',
    'panel',
    'hayalet',
    'rayaSol',
    'rayaOrta',
  ])

  for (const id of Object.keys(ORNEKLER)) {
    it(`${id} · şablonun kompozisyon alanları duruyor`, () => {
      const ornek = ornekBul(id) as KatalogOrnegi
      const r = uyarla(ornek, {
        sablonId: id,
        kartlar: ornek.kartlar.map((_, i) => ({
          ustBaslik: `ADIM ${i}`,
          baslik: 'Başlık **bir**',
          govde: 'Gövde.',
          hayalet: '',
          rayaSol: 'X',
          rayaOrta: 'Gerçek kaynak, 2026',
        })),
      })
      expect(r.ok, JSON.stringify((r as { kusurlar?: unknown }).kusurlar)).toBe(true)
      if (!r.ok) return
      for (const [i, kart] of ornek.kartlar.entries()) {
        const cikan = r.belge.kartlar[i] as unknown as Record<string, unknown>
        for (const [alan, deger] of Object.entries(kart as unknown as Record<string, unknown>)) {
          if (ICERIK.has(alan) || deger === undefined) continue
          expect(cikan[alan], `${id} kart ${i}: '${alan}' uyarlamada DÜŞTÜ`).toEqual(deger)
        }
      }
    })
  }
})

// ⚠ ⚠ **`kolon` KOMPOZİSYONDUR ve uyarlamada TAŞINMAK ZORUNDA.** Gerçek koşuda taşınmadı:
// dört slaytta da metin sola düştü ve figürün üstüne bindi. Ders bir satır yukarıda
// `zemin` için yazılıydı; yeni alan onu kendiliğinden almadı.
describe('dikiş 3f: `kolon` uyarlamadan sağ çıkıyor', () => {
  it('şablonun `kolon` alanı uyarlanmış belgede duruyor', () => {
    const ornek = ornekBul('sahne') as KatalogOrnegi
    const beklenen = ornek.kartlar.map((k) => k.kolon ?? null)
    // Şablonun kendisi en az bir `sag` taşımalı, yoksa test hiçbir şey ölçmez.
    expect(beklenen).toContain('sag')
    const r = uyarla(ornek, {
      sablonId: 'sahne',
      kartlar: ornek.kartlar.map((_, i) => ({
        ustBaslik: `ADIM ${i}`,
        baslik: 'Başlık **bir**',
        govde: 'Gövde.',
        hayalet: '',
        rayaSol: 'X',
        rayaOrta: 'Gerçek kaynak, 2026',
      })),
    })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.belge.kartlar.map((k) => k.kolon ?? null)).toEqual(beklenen)
  })
})

// ⚠ ⚠ **N GÖRSEL → N YUVA, SIRAYA GÖRE (borç A8).** `composeBody` tek görseli HER yuvaya
// yayıyordu: iki yuvalı bir şablon aynı figürü iki kez çiziyordu ve çıktı tasarım değil
// hata gibi okunuyordu. Bu testin sorduğu şey davranışın kendisi, kaynak metni değil.
describe('dikiş 3d: üretilen görseller yuvalara SIRAYLA dağılıyor', () => {
  // İki farklı base64: aynı olsalardı "yayma" ile "eşleştirme" ayırt EDİLEMEZDİ.
  const A = 'iVBORw0KGgoAAAA='
  const B = 'iVBORw0KGgoBBBB='

  // ⚠ ⚠ **ŞABLON, YUVA SAYISI ≥2 OLDUĞU İÇİN SEÇİLİYOR — `sahne` DEĞİL.** İlk sürüm
  // `sahne` kullanıyordu (TEK yuva) ve testi `if (s.length < 2) return` ile koruyordu:
  // koruma her koşuda devreye giriyor, hiçbir iddia çalışmıyor ve test YEŞİL kalıyordu.
  // Kendi kendini boşa düşüren bir ölçüm, ölçüm değildir. Kart sayısı da şablondan
  // türüyor: `uyarla` sayı uyuşmazlığını reddediyor ve sabit 4 yazmak testi kırılgan yapar.
  const SABLON = 'editoryal'
  const ornek = ornekBul(SABLON) as KatalogOrnegi
  const belge = (): Record<string, unknown> => ({
    'metin-uret': { lines: ['Bir', 'İki', 'Üç'] },
    'sablon-uyarla': {
      uyarlama: {
        sablonId: SABLON,
        kartlar: ornek.kartlar.map(() => ({
          ustBaslik: 'X',
          baslik: 'Başlık **bir**',
          govde: 'Gövde.',
          hayalet: '',
          rayaSol: 'X',
          rayaOrta: 'Kaynak 2026',
        })),
      },
    },
  })

  const srcler = async (inputs: Record<string, unknown>): Promise<readonly string[]> => {
    const body = composeBody({ tokenCss: ':root{--role-bg:#000}', stamp: DAMGA as never })
    const r = await body.run(
      CTX as never,
      {
        constraints: { topic: 'konu', width: 1080, height: 1350, katalog: true },
        inputs,
      } as never
    )
    expect(r.ok).toBe(true)
    if (!r.ok) return []
    const pano = (r.value.data as { panorama: { gorseller: { src: string }[] } }).panorama
    return pano.gorseller.map((g) => g.src)
  }

  it('iki yuva, iki görsel → İKİSİ FARKLI (klon değil)', async () => {
    const s = await srcler({
      ...belge(),
      'gorsel-uret': { format: 'base64', data: A, width: 8, height: 8 },
      'gorsel-uret-2': { format: 'base64', data: B, width: 8, height: 8 },
    })
    // İDDİA, koruma değil: yuva sayısı 2'nin altına düşerse test KIRILMALI.
    expect(s.length).toBeGreaterThanOrEqual(2)
    expect(s[0]).toContain(A)
    expect(s[1]).toContain(B)
    expect(s[0]).not.toBe(s[1])
  })

  it('öbek içinde KIRPILMIŞ olan hamı eziyor — sonek eşleştirmesiyle', async () => {
    // ⚠ Kırpılmış `-2`, ham `-3`ten ÖNCE geliyor. "Sonuncuyu al" burada 3'ün hamını seçip
    // 2'nin kırpılmışını çöpe atardı: arka plan silme koşar, sonucu kullanılmazdı.
    const s = await srcler({
      ...belge(),
      'gorsel-uret': { format: 'base64', data: A, width: 8, height: 8 },
      'gorsel-kirp': { format: 'base64', data: B, width: 8, height: 8, matlandi: true },
    })
    expect(s.length).toBeGreaterThanOrEqual(2)
    expect(s[0]).toContain(B)
    // İkinci yuvaya görsel gelmedi: BOŞ kalmalı, birincinin KLONU değil.
    expect(s[1]).toBe('')
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
