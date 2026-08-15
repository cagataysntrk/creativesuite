import { describe, expect, it } from 'vitest'
import type { AssetStamp, Block, DocumentModel } from '@suite/kernel'
import type { BrandId, EraId } from '@suite/contracts'
import { formatLexicon, hexFromTokens, lintDocument, type LexiconRules } from './linter.js'

const DAMGA: AssetStamp = {
  brandId: 'brd_upcytech' as BrandId,
  eraId: 'era_imalat_2026' as EraId,
  kitVersion: 'kit-1',
  definitionDigest: 'sha256:abc',
  contextManifest: 'ctx-1',
  sourceRunId: 'run_1',
}

const belge = (blocks: readonly Block[]): DocumentModel => ({
  kind: 'post',
  width: 1080,
  height: 1350,
  tokenCss: ':root { --role-bg: #101418; --role-text: #f2f4f7; }',
  stamp: DAMGA,
  blocks,
})

const govde = (text: string): Block => ({ type: 'body', text })

const KURAL: LexiconRules = {
  forbidden: ['devrim niteliğinde', 'çığır açan', 'dünyanın en iyisi'],
  allowedHex: ['#101418', '#f2f4f7', '#0091ff'],
  claimSource: null,
}

const tur = (b: readonly Block[], k: Partial<LexiconRules> = {}): readonly string[] =>
  lintDocument(belge(b), { ...KURAL, ...k }).map((v) => v.kind)

describe('yasak terim', () => {
  it('yakalanıyor', () => {
    expect(tur([govde('devrim niteliğinde bir çözüm')])).toContain('forbidden_term')
  })

  it('diyakritik ve büyük harf FARK ETMİYOR', () => {
    for (const t of ['DEVRİM NİTELİĞİNDE', 'devrim niteliginde', 'Devrim Niteliğinde']) {
      expect(tur([govde(t)]), t).toContain('forbidden_term')
    }
  })

  it('temiz metin geçiyor', () => {
    expect(tur([govde('imalatta fire oranını ölçüyoruz')])).toEqual([])
  })
})

describe('kaynaksız sayısal iddia (R-32)', () => {
  it('rakamlı iddia yakalanıyor', () => {
    for (const t of ['%40 azalttık', 'fire 3 kat düştü', '1.250 parça', '850 ton karbon']) {
      expect(tur([govde(t)]), t).toContain('unsourced_claim')
    }
  })

  it('RAKAMSIZ Türkçe iddia da yakalanıyor', () => {
    // Türkçe'nin İngilizce'den ayrıldığı yer: "yüzde kırk" içinde rakam yok ve
    // rakam arayan bir desen bunu tamamen kaçırır.
    for (const t of [
      'fireyi yüzde kırk azalttık',
      'üç kat daha hızlı',
      'yarım milyon parça işlendi',
      'iki misli verim',
    ]) {
      expect(tur([govde(t)]), t).toContain('unsourced_claim')
    }
  })

  it('`claim_source` VARSA geçiyor', () => {
    expect(tur([govde('%40 azalttık')], { claimSource: 'proof_asset:fire-2026' })).toEqual([])
  })

  it('yıl sayısal iddia DEĞİL', () => {
    // "2025'te kurulduk" bir performans iddiası değil; kaynak istemek linter'ı
    // kullanılamaz yapardı.
    expect(tur([govde('2025 yılında kurulduk')])).toEqual([])
    expect(tur([govde('1998 ve 2026 arası')])).toEqual([])
    // Ama yıl ARALIĞININ dışındaki dört hane iddiadır: "3500 parça" bir sayıdır.
    expect(tur([govde('3500 parça işlendi')])).toContain('unsourced_claim')
  })

  it('TIRNAK içi alıntı iddia DEĞİL — kuralı anlatan belge kuralı ihlal etmez', () => {
    // Corpus kayıtları sık sık ne YAPILMAMASI gerektiğini alıntılar. Alıntıyı iddia
    // saymak, kuralı anlatan belgeyi kuralın ihlali sayardı.
    expect(tur([govde('eski sitedeki "1.247 İlan" uydurma bir sayıydı')])).toEqual([])
    expect(tur([govde('“%40 azalttık” demek kaynak ister')])).toEqual([])
  })

  it('ARALIK iddia DEĞİL — tarif, performans değil', () => {
    expect(tur([govde('50-500 çalışanlı tesisler')])).toEqual([])
  })

  it('çıplak KÜÇÜK sayı iddia DEĞİL, BÜYÜK sayı iddiadır', () => {
    // `0.55` bir güven skoru, `1.5` bir oran; `1.247` bir iddia.
    expect(tur([govde('bu kayıt hipotezdir (confidence 0.55)')])).toEqual([])
    expect(tur([govde('1.247 kayıt işlendi')])).toContain('unsourced_claim')
    // Birimi olan küçük sayı YİNE iddiadır: eşik yalnız çıplak sayılar için.
    expect(tur([govde('%0,5 iyileşme')])).toContain('unsourced_claim')
  })

  it('HEX içindeki rakamlar iddia DEĞİL', () => {
    // `#101418` içindeki `101418` "kaynaksız sayısal iddia" olarak raporlanıyordu:
    // kendi token'ını yazan her metin linter'ı kırmızıya döndürürdü.
    expect(tur([govde('#101418 zemin kullanılıyor')])).toEqual([])
  })

  it('tek haneli gündelik sayı iddia DEĞİL', () => {
    // Yanlış pozitif de bir hatadır: sürekli alarm veren kapı, kapatılan kapıdır.
    expect(tur([govde('5 dakikada kuruluyor')])).toEqual([])
  })

  it('MİRAS yer tutucular `claim_source` VARSA BİLE yasak', () => {
    // Bunlar gerçek değil; kaynak göstermek onları gerçek yapmaz (§11.4).
    const k = { claimSource: 'proof_asset:her-ne-ise' }
    expect(tur([govde('1.247 ilan yayında')], k)).toContain('unsourced_claim')
    expect(tur([govde('1.234.567 ton CO2')], k)).toContain('unsourced_claim')
  })
})

describe('token dışı renk', () => {
  it('palet dışı hex yakalanıyor', () => {
    expect(tur([govde('arka plan #FF00AA olsun')])).toContain('off_token_hex')
  })

  it('token hex geçiyor, büyük/küçük harf fark etmiyor', () => {
    expect(tur([govde('#101418 ve #F2F4F7')])).toEqual([])
  })

  it('palet TANIMSIZSA (`null`) denetim atlanıyor', () => {
    expect(tur([govde('#FF00AA')], { allowedHex: null })).toEqual([])
  })

  it('palet tanımlı ama HEX İÇERMİYORSA (`[]`) her hex token dışıdır', () => {
    // Bu projede varsayılan durum: marka token'ları OKLCH (§12.1). `[]`i `null` gibi
    // ele almak, denetimi tam da en çok gerektiği yerde kapatırdı.
    expect(tur([govde('#FF00AA')], { allowedHex: [] })).toContain('off_token_hex')
  })

  it("token CSS'inden liste çıkarılabiliyor", () => {
    const h = hexFromTokens(':root { --a: #101418; --b: #F2F4F7; --c: #101418; }')
    expect(h).toEqual(['#101418', '#f2f4f7'])
  })
})

describe('alt-text (R-34)', () => {
  it('içerik görselinde boş alt YAKALANIYOR', () => {
    expect(tur([{ type: 'image', src: 'a.png', alt: '  ', decorative: false }])).toContain(
      'missing_alt'
    )
  })

  it('dekoratif görselde boş alt MEŞRU', () => {
    expect(tur([{ type: 'image', src: 'a.png', alt: '', decorative: true }])).toEqual([])
  })
})

describe('locale-naif casing (R-21)', () => {
  it('`ISTANBUL` yakalanıyor — doğrusu `İSTANBUL`', () => {
    expect(tur([govde('ISTANBUL merkezli')])).toContain('naive_casing')
  })

  it('doğru casing geçiyor', () => {
    expect(tur([govde('İSTANBUL merkezli')])).toEqual([])
    expect(tur([govde('İstanbul merkezli')])).toEqual([])
  })
})

describe('rapor', () => {
  it('temizse tek satır', () => {
    expect(formatLexicon([])).toContain('lexicon temiz')
  })

  it('her ihlal tipi kural numarasıyla açıklanıyor', () => {
    const v = lintDocument(
      belge([
        govde('devrim niteliğinde %40 iyileşme, arka plan #FF00AA, ISTANBUL'),
        { type: 'image', src: 'x.png', alt: '', decorative: false },
      ]),
      KURAL
    )
    const s = formatLexicon(v)
    expect(s).toContain('R-32')
    expect(s).toContain('R-34')
    expect(s).toContain('R-21')
    expect(s).toContain('yasak terim')
    // Beş ihlal tipinin hepsi tek belgede yakalanıyor.
    expect(new Set(v.map((x) => x.kind)).size).toBe(5)
  })
})
