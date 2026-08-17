// HEDEF: packages/engine/src/plan/denetim-turu.ts
//
// Son kontrol ve düzeltme turu — hat render'dan SONRA durmuyor (FAZ-15.8 · §11 · R-71).
//
// ⚠ ⚠ **TAVAN İKİ TUR ve bu bir kapasite kararı değil, bir DAVRANIŞ düzeltmesi.**
// "Sorun bul" diye görevlendirilmiş bir agent her turda sorun bulur; üçüncü tur, ikinci
// turda kalan gerçek kusurları değil, agentın kendi standardını arıtır. Kayıtlı ders
// (doğrulama turu tavanı) burada da geçerli. İki turdan sonra kalan kusur SUSTURULMUYOR:
// sonuçta rapor ediliyor ve insan onay kapısına gidiyor.
//
// ⚠ ⚠ **DÜZELTME UYARLAMA KATMANINDAN GEÇİYOR.** Agent'a "şu kusurları düzelt, belgeyi
// yeniden yaz" denseydi kompozisyonu da yeniden yazabilirdi — düzeltme adı altında
// tasarımı değiştirmek. Düzeltme çıktısı bir `Uyarlama`, yani yapısal alanları taşıyamaz;
// `uyarla` onu şablonun kompozisyonuyla birleştiriyor. Düzeltme turu bu yüzden şablonu
// bozamıyor: bozacak alanı yok.

import type { KatalogOrnegi } from '@suite/render'
import { uyarla, type Uyarlama } from './sablon-uyarla.js'

/** Denetimin döndürdüğü kusur — `@suite/render`'daki `Kusur` ile aynı şekil. */
export interface DenetimKusuru {
  readonly tur: string
  readonly kart: number | null
  readonly aciklama: string
  readonly alan: string | null
}

/** Bir belgeyi denetleyen işlev — gerçek hatta `panoramaDenetle`. */
export type Denetleyici = (belge: KatalogOrnegi) => Promise<readonly DenetimKusuru[]>

/**
 * Kusurları gören ve YENİ BİR UYARLAMA öneren işlev — gerçek hatta agent.
 *
 * `null` dönerse tur biter: agent düzeltilecek bir şey görmüyor demektir ve zorla bir
 * tur daha koşmak, düzeltilecek şey olmadığında değişiklik ÜRETİR.
 */
export type Duzeltici = (
  kusurlar: readonly DenetimKusuru[],
  onceki: Uyarlama
) => Promise<Uyarlama | null>

export interface TurKaydi {
  readonly tur: number
  readonly kusurSayisi: number
  readonly kusurlar: readonly DenetimKusuru[]
  /** Bu turda düzeltme denendi mi. */
  readonly duzeltildi: boolean
}

export interface DenetimSonucu {
  readonly belge: KatalogOrnegi
  readonly uyarlama: Uyarlama
  /** Son turda KALAN kusurlar — boş değilse insan görmeli. */
  readonly kalanKusurlar: readonly DenetimKusuru[]
  readonly defter: readonly TurKaydi[]
}

export const TUR_TAVANI = 2

/**
 * Denetle → düzelt → yeniden denetle.
 *
 * ⚠ ⚠ **DÜZELTME İYİLEŞTİRMİYORSA GERİ ALINIYOR.** Yeni uyarlama daha az kusur
 * ÜRETMİYORSA eskisine dönülüyor. Bu, "her tur iyileştirir" varsayımını reddediyor: bir
 * agent uzun bir başlığı kısaltırken kaynağı silebilir ve net sonuç kötüleşebilir.
 * Ölçüm olmadan iyileşme iddiası, iyileşme değildir.
 *
 * ⚠ Düzeltme `uyarla`dan geçemezse (kaynak silinmiş, panel tipi değişmiş) o tur
 * ATILIYOR ve önceki belge korunuyor — reddedilmiş bir düzeltme, yarı uygulanmaz.
 */
export const denetimTuru = async (
  ornek: KatalogOrnegi,
  ilkUyarlama: Uyarlama,
  denetle: Denetleyici,
  duzelt: Duzeltici,
  tavan: number = TUR_TAVANI
): Promise<DenetimSonucu | { readonly hata: string }> => {
  const ilk = uyarla(ornek, ilkUyarlama)
  if (!ilk.ok) return { hata: `ilk uyarlama reddedildi: ${ilk.kusurlar.join(' · ')}` }

  let uyarlama = ilkUyarlama
  let belge = ilk.belge
  let kusurlar = await denetle(belge)
  const defter: TurKaydi[] = [{ tur: 0, kusurSayisi: kusurlar.length, kusurlar, duzeltildi: false }]

  for (let t = 1; t <= tavan && kusurlar.length > 0; t += 1) {
    const yeni = await duzelt(kusurlar, uyarlama)
    if (yeni === null) {
      defter.push({ tur: t, kusurSayisi: kusurlar.length, kusurlar, duzeltildi: false })
      break
    }
    const birlesik = uyarla(ornek, yeni)
    if (!birlesik.ok) {
      // ⚠ Reddedilen düzeltme bir TUR harcıyor ve kaydı düşülüyor — sessizce yok
      // sayılsaydı agent aynı geçersiz düzeltmeyi sonsuza kadar önerebilirdi.
      defter.push({
        tur: t,
        kusurSayisi: kusurlar.length,
        kusurlar: [
          ...kusurlar,
          {
            tur: 'duzeltme-reddedildi',
            kart: null,
            alan: null,
            aciklama: birlesik.kusurlar.join(' · '),
          },
        ],
        duzeltildi: false,
      })
      continue
    }
    const yeniKusurlar = await denetle(birlesik.belge)
    defter.push({
      tur: t,
      kusurSayisi: yeniKusurlar.length,
      kusurlar: yeniKusurlar,
      duzeltildi: true,
    })
    // ⚠ ⚠ **YALNIZ KESİN İYİLEŞME KABUL EDİLİYOR (`>=`, `>` değil).** İlk sürüm eşit
    // kusur sayısını da kabul ediyordu ve test bunu yakaladı: bir kusuru düzeltip
    // başkasını üreten bir tur "değişmedi" değil, İKİ DEĞİŞİKLİK demek — biri iyi biri
    // kötü. Kazanç ölçülemiyorsa metni değiştirmemek daha güvenli: kabul edilen her
    // uyarlama insanın onayladığı metinden bir adım daha uzaklaşıyor.
    if (yeniKusurlar.length >= kusurlar.length) continue // iyileşme yok: eskisinde kal
    uyarlama = yeni
    belge = birlesik.belge
    kusurlar = yeniKusurlar
  }

  return { belge, uyarlama, kalanKusurlar: kusurlar, defter }
}

/** Agent'a verilecek düzeltme istemi — kusurlar ve DOKUNULABİLİR alanlar. */
export const duzeltmeIstemi = (kusurlar: readonly DenetimKusuru[]): string =>
  [
    'Render edilen karoselde aşağıdaki kusurlar ölçüldü. Yalnız METNİ ve panel verisini',
    'değiştirerek düzelt; kompozisyona dokunamazsın (zaten şemada alanı yok).',
    '',
    ...kusurlar.map(
      (k) => `- ${k.kart === null ? 'belge geneli' : `kart ${k.kart}`}: ${k.aciklama}`
    ),
    '',
    'Sık çözümler:',
    '- "tüm karoselin ölçeğini düşürüyor" → o karttaki en uzun kelimeyi daha kısa bir',
    '  eşanlamlıyla değiştir; başlığı bölmek yerine kelimeyi değiştir.',
    '- "panel dikeyde tuvali aşıyor" → panel satır sayısını azalt, veriyi özetle.',
    '- "kapsamı dışında" → marka fontunun desteklemediği karakteri metinden çıkar.',
    '- "hiçbir öge kesimi aşmıyor" → bu bir kompozisyon kusuru; metinle düzeltilemez,',
    '  raporla ve insana bırak.',
  ].join('\n')
