// Katalog dolu taslak — örnek ile kayıt arasında KAYMA olmasın (FAZ-15.4 · D-268).
//
// ⚠ Bu testin varlık sebebi somut: katalog kaydı `packages/contracts`ta, örnek belge
// `packages/render`da. İki liste iki ayrı dosyada ve **hiçbir derleme hatası onları
// birbirine bağlamıyor.** Bir şablon eklenip örneği unutulursa hat koşu anında — yani
// para harcandıktan sonra — patlar. Kapı burada.

import { describe, expect, it } from 'vitest'
import { KATALOG } from '@suite/contracts'
import { ORNEKLER, ornekBul, type KatalogOrnegi } from './katalog-ornek.js'
import { panoramaHtml, VARSAYILAN_TIPO } from './panorama.js'
import { ikonSec } from './sablon-ikon.js'

const ornekler = Object.entries(ORNEKLER)

describe('katalog ↔ örnek eşleşmesi', () => {
  it('katalogdaki her şablonun bir örneği var', () => {
    const eksik = KATALOG.filter((s) => ornekBul(s.id) === null).map((s) => s.id)
    expect(eksik).toEqual([])
  })

  it('her örneğin katalogda bir kaydı var — sahipsiz örnek yok', () => {
    const idler = new Set(KATALOG.map((s) => s.id))
    expect(Object.keys(ORNEKLER).filter((id) => !idler.has(id))).toEqual([])
  })

  it('slayt sayısı kataloğun ilan ettiği aralıkta', () => {
    for (const s of KATALOG) {
      const o = ornekBul(s.id)
      expect(o, s.id).not.toBeNull()
      expect((o as KatalogOrnegi).kartlar.length, s.id).toBeGreaterThanOrEqual(s.slayt.min)
      expect((o as KatalogOrnegi).kartlar.length, s.id).toBeLessThanOrEqual(s.slayt.max)
    }
  })

  // ⚠ ⚠ **BU TEST `toBeGreaterThan(0)` DİYORDU ve bir kusuru ALTI SLAYT boyunca
  // taşıdı.** Katalog `memphis` için `adet: 'slayt-basina'` ilan ediyordu; örnek altı
  // slayda ÜÇ yuva veriyordu ve test yeşildi. Sonuç ızgarada görüldü: özneler 1., 3. ve
  // 5. slayda düşüyor, 2., 4. ve 6. slaytta metin bitiyor ve altında hiçbir şey kalmıyor
  // — dördüncü slaydın **%53'ü** ölü kuşak (ailenin en kötüsü; düzeltince %27).
  // ⚠ Kapı VARDI ve beyanın YANLIŞ YARISINI ölçüyordu: `kirpma`yı doğruluyor, adedi
  // doğrulamıyordu. Yarım ölçülen bir beyan, ölçülmeyen bir beyandan tehlikelidir —
  // yeşil tik ikisini de kapsıyor sanılır.
  // ⚠ EŞİTLİK, yeterlilik değil: üretim yuva `i`ye görsel `i`yi koyuyor ve görsel
  // yetmezse yuva BOŞ kalıyor (`bodies.ts`). Fazla yuva da eksik yuva kadar kusurdur.
  it('görsel yuvası sayısı kataloğun İLAN ETTİĞİ kadar', () => {
    for (const s of KATALOG) {
      const o = ornekBul(s.id) as KatalogOrnegi
      if (s.gorsel === null) continue
      const gereken = s.gorsel.adet === 'slayt-basina' ? o.kartlar.length : s.gorsel.adet
      expect(o.gorseller.length, `${s.id}: katalog ${String(s.gorsel.adet)} ilan ediyor`).toBe(
        gereken
      )
      // ⚠ Kırpma kataloğun ilanıyla aynı olmalı: `daire` ilan edip `kesik` çizen bir
      // örnek, brief'i doğru üretilmiş bir görseli yanlış maskeye sokar.
      for (const g of o.gorseller) expect(g.kirpma, s.id).toBe(s.gorsel.kirpma)
    }
  })

  // ⚠ `alan` kaydı ayrı bir bant ögesi DEĞİL, iki alanı ayıran sınır demek: örnek
  // `bant: 'yok'` taşır ama `alanSiniri` taşımak ZORUNDADIR. Sürekliliği ilan edip
  // kurmamak, kurmamaktan kötüdür.
  it('bant tipi kataloğun ilanıyla aynı', () => {
    for (const s of KATALOG) {
      const o = ornekBul(s.id) as KatalogOrnegi
      if (s.bant.tip === 'alan') {
        expect(o.bant.tip, s.id).toBe('yok')
        expect(o.alanSiniri, s.id).toBeDefined()
        expect((o.alanSiniri?.noktalar ?? []).length, s.id).toBeGreaterThan(2)
      } else expect(o.bant.tip, s.id).toBe(s.bant.tip)
    }
  })
})

describe('örnek içeriği', () => {
  // ⚠ ⚠ **YASA 8 ÖRNEKTE DE GEÇERLİ.** Kaynaksız sayısal iddia yayınlanamaz; örnek
  // içerik de yayınlanabilir bir şeydir (agent onu çoğaltıyor). Gerçek bir kuruma
  // uydurma atıf yazmak "daha gerçekçi" olurdu ve tam olarak bu yüzden yasak.
  it('her kart kaynak beyan ediyor ve örnek verisi İŞARETLİ', () => {
    for (const [id, o] of ornekler)
      for (const k of o.kartlar) {
        expect(k.rayaOrta.trim(), id).not.toBe('')
        expect(k.rayaOrta, id).toContain('ÖRNEK')
      }
  })

  it('hiçbir kart boş başlıkla gelmiyor — taslak DOLU', () => {
    for (const [id, o] of ornekler)
      for (const k of o.kartlar) expect(k.baslik.trim().length, id).toBeGreaterThan(8)
  })

  // ⚠ ⚠ **ESKİ KURAL "her kartta üst başlık VAR" idi ve bir tasarım kararını sessizce
  // EVRENSELLEŞTİRİYORDU:** altı şablona tek bir iskelet dayatıyordu. Yeni kural aynı
  // niyeti (yarım dolu taslak yasak) koruyor ama DAHA SIKI: şablon bu ögeyi ya
  // kullanır ya kullanmaz — bazı kartlarda olup bazılarında olmaması, eskisinin
  // GEÇİRDİĞİ gerçek bir kusurdur. → D-312
  it('üst başlık şablon genelinde TUTARLI — ya hepsinde ya hiçbirinde', () => {
    for (const [id, o] of ornekler) {
      const dolu = o.kartlar.filter((k) => k.ustBaslik.trim() !== '').length
      expect([0, o.kartlar.length], `${id}: ${String(dolu)}/${String(o.kartlar.length)}`).toContain(
        dolu
      )
    }
  })

  // ⚠ Boş bir panel, panel başlığını çizip altını boş bırakıyor: "ÜÇ ÖNCELİK" yazıp
  // hiçbir şey göstermeyen bir kutu. İlk sürümde iki şablonda tam bu vardı.
  // ⚠ ⚠ **AİLEDEKİ İKİ HAYALETİN İKİSİ DE KENDİ ETİKETİNİ TEKRARLIYORDU.** Dev soluk
  // kelime bir KOMPOZİSYON ögesi; slaytta zaten yazan bir kelimeyi ikinci kez, bu kez
  // kadrajın üçte biri boyunda yazmak sıfır bilgi ekler. D-299 hayaleti altı şablonda
  // *yer olmadığı* için kapatmıştı — tekrarı hiç ölçmemişti.
  // ⚠ Karşılaştırma Türkçe kıvrımlı: `toLocaleLowerCase('tr')` (`İ` → `i`, `I` → `ı`)
  // ve noktalama atılıyor, yoksa `ADIM 01` ile `adım01` eşleşmez.
  it('hayalet slaytta zaten yazan bir kelimeyi TEKRARLAMIYOR', () => {
    const sadelestir = (t: string | null | undefined) =>
      String(t ?? '')
        .trim()
        .toLocaleLowerCase('tr')
        .replace(/[^\p{L}\p{N}]/gu, '')
    for (const [ad, o] of ornekler) {
      o.kartlar.forEach((k, i) => {
        const h = sadelestir(k.hayalet)
        if (h === '') return
        const nerede = ad + ' · kart' + String(i + 1) + ' · hayalet "' + String(k.hayalet) + '"'
        expect(sadelestir(k.ustBaslik), nerede + ' üst etiketi tekrarlıyor').not.toBe(h)
        expect(sadelestir(k.baslik).includes(h), nerede + ' başlıkta geçiyor').toBe(false)
        expect(sadelestir(k.govde).includes(h), nerede + ' gövdede geçiyor').toBe(false)
      })
    }
  })

  it('panel varsa İÇİ de var', () => {
    for (const [id, o] of ornekler)
      for (const k of o.kartlar) {
        if (k.panel === null) continue
        const p = k.panel
        if (p.tip === 'cubuklar') expect(p.satirlar.length, id).toBeGreaterThan(0)
        if (p.tip === 'liste') expect(p.ogeler.length, id).toBeGreaterThan(0)
        if (p.tip === 'sayilar') expect(p.ogeler.length, id).toBeGreaterThan(0)
        if (p.tip === 'etiketler') expect(p.ogeler.length, id).toBeGreaterThan(0)
        if (p.tip === 'vafel') expect(p.toplam, id).toBeGreaterThan(0)
      }
  })

  it('vurgu işareti çiftler hâlinde — yarım kalan `**` yok', () => {
    for (const [id, o] of ornekler)
      for (const k of o.kartlar)
        expect((k.baslik.match(/\*\*/g) ?? []).length % 2, `${id}: ${k.baslik}`).toBe(0)
  })
})

describe('ikon katmanı — içerikten türüyor', () => {
  // ⚠ ⚠ **YİRMİ İKON YAZILMIŞTI ve panorama onları HİÇ ÇAĞIRMIYORDU** (FAZ-15.1
  // envanteri · D-269). Bağlandıktan sonra ikinci bir tuzak çıktı: kural "ya hepsi ya
  // hiçbiri" olduğu için hiçbir örnek listesi eşleşmiyordu ve katman BAĞLI AMA ÖLÜYDÜ.
  // Bağlanmış ama hiç ateşlemeyen bir zincir, bağlanmamıştan az farklıdır.
  it('liste taşıyan her örnekte TÜM satırlar ikon köküne oturuyor', () => {
    for (const [id, o] of ornekler)
      for (const k of o.kartlar) {
        if (k.panel?.tip !== 'liste') continue
        const ikonlar = k.panel.ogeler.map((x) => ikonSec(x.ad))
        expect(
          ikonlar.every((i) => i !== null),
          `${id}: ${ikonlar.join(' ')}`
        ).toBe(true)
      }
  })

  // ⚠ Eşleşmeyen tek satır varsa katman HİÇ açılmıyor: eksik ikon, listeyi kırık gösterir.
  it('bir satır bile eşleşmezse ikon basılmıyor', () => {
    const o = ornekBul('veri-hikayesi') as KatalogOrnegi
    const kart = o.kartlar.find((k) => k.panel?.tip === 'liste')
    expect(kart).toBeDefined()
    if (kart === undefined || kart.panel?.tip !== 'liste') return
    const bozuk = {
      ...o,
      kartlar: o.kartlar.map((k) =>
        k === kart && k.panel?.tip === 'liste'
          ? {
              ...k,
              panel: {
                ...k.panel,
                ogeler: [{ no: '01', ad: 'xyzzy qwerty' }, ...k.panel.ogeler],
              },
            }
          : k
      ),
    }
    // ⚠ ⚠ **İŞARET GÖVDEDE ARANIYOR, CSS'te DEĞİL.** İlk sürüm `'liste-ikon'` diye
    // arıyordu ve `.liste-ikon { … }` kuralı HER BELGEDE basılıyor: test, ikon çizilmese
    // bile eşleşiyordu. Ölçüm aracının kendisi bozuktu — bu oturumda tekrar eden sınıf.
    const DAMGA = { brandId: 'b', eraId: 'e', kitVersion: 'k' }
    const ISARET = '<span class="liste-ikon">'
    expect(panoramaHtml({ ...bozuk, tokenCss: '', stamp: DAMGA } as never)).not.toContain(ISARET)
    expect(panoramaHtml({ ...o, tokenCss: '', stamp: DAMGA } as never)).toContain(ISARET)
  })
})

describe('şablonlar birbirinin boyası DEĞİL', () => {
  // ⚠ ⚠ **KULLANICININ "REZALET" DEDİĞİ ŞEYİN TESTİ.** Yedi aile üretilmişti ve ızgaraya
  // bakınca yedi TASARIM değil tek tasarımın yedi BOYASI görünmüştü. Aynı tipografi
  // reçetesini paylaşan iki şablon, katalogda iki satır ama tasarımda bir tanedir.
  it('her şablon KENDİ tipografi reçetesini taşıyor', () => {
    // ⚠ ⚠ **GENİŞLİK EKSENİ İMZADAN ÇIKTI (D-317).** Markanın dizayn sisteminin dört
    // ailesinin hiçbirinde `wdth` yok; imzayı olmayan bir eksene dayamak, ölçülmeyen
    // bir şeyi ölçüyormuş gibi yapmaktı. Ayrım artık ağırlık · punto payı · satır
    // aralığı · harf arası · gövde oranı · sütun genişliğinden geliyor — hepsi
    // GERÇEKTEN çizime giren değerler.
    const imzalar = ornekler.map(([id, o]) => {
      const t = o.tipografi ?? VARSAYILAN_TIPO
      return [
        id,
        `${t.baslikAgirlik}/${t.baslikPayi}/${t.satirAraligi}/${t.harfArasi}/${t.govdeOrani}/${t.baslikSutunu}`,
      ] as const
    })
    expect(new Set(imzalar.map(([, i]) => i)).size).toBe(imzalar.length)
  })

  // ⚠ ⚠ **SESİN YÜKSEKLİĞİ GERÇEKTEN DEĞİŞİYOR MU.** Genişlik ekseni emekli olunca
  // (D-317) ayrımı taşıyan iki eksen kaldı: punto payı ve ağırlık. İkisi de bir yerde
  // toplanırsa altı şablon yine tek tasarımın altı boyası olur — ve bu depoda bir kez
  // tam olarak öyle oldu.
  it('punto payı yayılıyor — hepsi aynı sesle konuşmuyor', () => {
    const p = ornekler.map(([, o]) => (o.tipografi ?? VARSAYILAN_TIPO).baslikPayi)
    expect(Math.max(...p) - Math.min(...p)).toBeGreaterThanOrEqual(0.15)
  })

  it('ağırlık yayılıyor — en az üç farklı değer', () => {
    const a = ornekler.map(([, o]) => (o.tipografi ?? VARSAYILAN_TIPO).baslikAgirlik)
    expect(new Set(a).size).toBeGreaterThanOrEqual(3)
  })

  // ⚠ ⚠ **BU TESTİN OLMAMASI, BİR AYNILIĞI YEŞİL GEÇİRDİ.** Üstteki testler tipografi
  // İMZASINA bakıyor ve altı şablon farklı imza taşıyordu — ama ızgaraya bakınca hepsi
  // aynı iskeleti kuruyordu: el yazısı → kaps etiket → sol üst iri başlık → gövde.
  // Ölçüldü: altı şablonun BEŞİ birebir aynı öge envanterine sahipti. Punto farkı bir
  // tasarım farkı değildir; ölçülmeyen şey, olmayan şeydir.
  //
  // ⚠ **Ama envanter çeşitliliği de görsel ayrımın VEKİLİ değil** ve bu bir denemeyle
  // öğrenildi: `memphis`ten el yazısını silmek envanteri farklılaştırdı ve şablonu
  // ayırt edici DEĞİL, sıradan yaptı. Bu yüzden ölçülen şey İSKELET = envanter + çapa;
  // ayrımı iki eksenden biri sağlayabilir.
  it('şablonlar tek bir İSKELET üzerine kurulmamış', () => {
    const OGELER = ['elYazisi', 'ustBaslik', 'baslik', 'govde', 'hayalet', 'panel'] as const
    const iskelet = ornekler.map(([id, o]) => {
      const k = o.kartlar[0] as unknown as Record<string, unknown>
      const env = OGELER.filter((a) => {
        const v = k[a]
        if (v === undefined || v === null) return false
        return typeof v === 'object' ? true : String(v).trim() !== ''
      }).join('+')
      return [id, `${env}@${o.yerlesim ?? 'ust'}`] as const
    })
    // Altı şablonun en az dördü farklı iskelet kurmalı: ikisi aynı kalabilir (bir
    // iskeletin iki farklı tipografik sesi meşrudur), altısı aynı olamaz.
    expect(new Set(iskelet.map(([, i]) => i)).size).toBeGreaterThanOrEqual(4)
  })

  it('yerleşim tek bir değerde toplanmamış', () => {
    expect(new Set(ornekler.map(([, o]) => o.yerlesim ?? 'ust')).size).toBeGreaterThanOrEqual(3)
  })

  it('şablon damga/token TAŞIMIYOR — Yasa 7', () => {
    for (const [id, o] of ornekler) {
      expect(o, id).not.toHaveProperty('stamp')
      expect(o, id).not.toHaveProperty('tokenCss')
      expect(o, id).not.toHaveProperty('fontCss')
    }
  })
})
