// HEDEF: packages/engine/src/plan/sablon-uyarla.ts
//
// Şablon uyarlama — agent taslağı ÇOĞALTIP DÜZENLİYOR (FAZ-15.7 · D-268 · Yasa 13).
//
// ⚠ ⚠ **BU ADIMIN VARLIK SEBEBİ ŞU CÜMLE:** *"şablonu seçmek bu demek zaten; sıfırdan
// yapmayacak, olanı alıp düzenleyecek."* Agent boş bir tuvale kompozisyon kurmuyor;
// katalogdaki DOLU taslağı alıyor ve yalnız İÇERİĞİNİ değiştiriyor. Kompozisyon
// (bant geometrisi, görsel konumları, tipografi reçetesi, zemin dokusu, yerleşim)
// olduğu gibi geçiyor — çünkü kalitenin oynak olduğu yer tam orasıydı.
//
// ⚠ ⚠ **YAPISAL ALANLAR ŞEMADA YOK — "değiştirme" diye RİCA EDİLMİYOR.** `UyarlamaKarti`
// yalnız metin alanları taşıyor; agent bant noktası ya da görsel konumu yazmak istese
// koyacak alan bulamıyor. Bu, projenin her yerinde tekrar eden ilke: **en ucuz zorlama,
// ihlalin ifade edilemez olmasıdır** (aile garanti alanları, degrade durakları, damga).
// Bir `readonly` ya da bir "lütfen dokunma" yorumu, model çıktısında hiçbir şey zorlamaz.
//
// ⚠ ⚠ **PANEL TİPİ KİLİTLİ, PANEL VERİSİ SERBEST.** Çubuk grafik mi vafel mi — bu bir
// KOMPOZİSYON kararı ve şablonun kimliğinin parçası; içindeki satırlar İÇERİK. Uyarlama
// tipi değiştirmeye kalkarsa reddediliyor: `veri-hikayesi`nin dördüncü kartındaki vafel,
// oraya "20 hattan 13'ü" anlatısı için konuldu; bir etiket bulutuna dönüşürse şablon
// artık o şablon değil.

import type { KatalogOrnegi } from '@suite/render'
import type { Kart, Panel } from '@suite/render'

/** Uyarlamanın yazabildiği TEK şey — kompozisyon alanı yok. */
export interface UyarlamaKarti {
  readonly ustBaslik: string
  /** `**vurgu**` işareti korunuyor: vurgu bir içerik kararı. */
  readonly baslik: string
  readonly govde: string
  /** Arkadaki dev soluk metin — kısa olmalı (rakam, sembol, tek kelime). */
  readonly hayalet: string
  readonly rayaSol: string
  /**
   * Alt rayın orta alanı — **KAYNAK**.
   *
   * ⚠ ⚠ Şablon buraya `ÖRNEK VERİ` yazıyor ve uyarlamanın onu DEĞİŞTİRMESİ zorunlu.
   * Yasa 8: kaynaksız sayısal iddia yayınlanamaz. Örneğin işaretini olduğu gibi bırakan
   * bir uyarlama, "kaynak koymayı unuttum"u sessizce yayınlanabilir hâle getirirdi;
   * burada reddediliyor.
   */
  readonly rayaOrta: string
  /** Panel VERİSİ — tipi şablondan gelir, değiştirilemez. */
  readonly panel?: Panel | null
}

export interface Uyarlama {
  readonly sablonId: string
  readonly kartlar: readonly UyarlamaKarti[]
}

export type UyarlamaSonucu =
  | { readonly ok: true; readonly belge: KatalogOrnegi }
  | { readonly ok: false; readonly kusurlar: readonly string[] }

const ORNEK_ISARETI = 'ÖRNEK'

/**
 * Şablonun dolu taslağını uyarlamayla birleştirir.
 *
 * ⚠ ⚠ **BİRLEŞTİRME `...` İLE DEĞİL, ALAN ALAN.** `{ ...ornekKart, ...uyarlamaKarti }`
 * yazmak kısa olurdu ve tam olarak korumaya çalıştığımız şeyi delerdi: uyarlama nesnesi
 * fazladan bir `zemin` ya da `panel` alanı taşırsa yayılma operatörü onu SESSİZCE kabul
 * eder. Tipler derleme zamanında korur, çalışma zamanında gelen JSON'u korumaz — ve bu
 * veri bir model çıktısından geliyor. Alanlar tek tek yazılıyor.
 */
export const uyarla = (ornek: KatalogOrnegi, u: Uyarlama): UyarlamaSonucu => {
  const kusurlar: string[] = []

  if (u.kartlar.length !== ornek.kartlar.length)
    return {
      ok: false,
      kusurlar: [
        `kart sayısı şablonla uyuşmuyor: uyarlama ${u.kartlar.length}, şablon ${ornek.kartlar.length}`,
      ],
    }

  const kartlar: Kart[] = []
  for (const [i, y] of u.kartlar.entries()) {
    const o = ornek.kartlar[i] as Kart
    const yer = `kart ${i + 1}`

    if (y.baslik.trim() === '') kusurlar.push(`${yer}: başlık boş`)
    if ((y.baslik.match(/\*\*/g) ?? []).length % 2 !== 0)
      kusurlar.push(`${yer}: yarım kalan \`**\` vurgu işareti`)
    if (y.ustBaslik.trim() === '') kusurlar.push(`${yer}: üst başlık boş`)
    // ⚠ Örnek işareti kalmışsa kaynak GİRİLMEMİŞ demektir (Yasa 8).
    if (y.rayaOrta.includes(ORNEK_ISARETI))
      kusurlar.push(`${yer}: kaynak hâlâ "${y.rayaOrta}" — şablonun örnek işareti değiştirilmeli`)
    if (y.rayaOrta.trim() === '') kusurlar.push(`${yer}: kaynak boş`)

    // Panel TİPİ şablondan; uyarlama yalnız veriyi değiştirebiliyor.
    const panel = ((): Panel | null => {
      if (y.panel === undefined) return o.panel
      if (o.panel === null && y.panel !== null) {
        kusurlar.push(`${yer}: şablonda panel yok, uyarlama panel eklemeye çalışıyor`)
        return null
      }
      if (o.panel !== null && y.panel === null) {
        kusurlar.push(`${yer}: şablonda panel var, uyarlama onu siliyor`)
        return o.panel
      }
      if (o.panel !== null && y.panel !== null && o.panel.tip !== y.panel.tip) {
        kusurlar.push(
          `${yer}: panel tipi değiştirilemez — şablon "${o.panel.tip}", uyarlama "${y.panel.tip}"`
        )
        return o.panel
      }
      return y.panel
    })()

    kartlar.push({
      ustBaslik: y.ustBaslik,
      baslik: y.baslik,
      govde: y.govde,
      hayalet: y.hayalet,
      rayaSol: y.rayaSol,
      rayaOrta: y.rayaOrta,
      panel,
      // ⚠ Kartın kendi zemini KOMPOZİSYON: `donen`in kimliği tam olarak o rotasyon.
      // Uyarlamadan değil şablondan geliyor.
      ...(o.zemin === undefined ? {} : { zemin: o.zemin }),
    })
  }

  if (kusurlar.length > 0) return { ok: false, kusurlar }
  // ⚠ Şablonun geri kalanı DOKUNULMADAN geçiyor: bant, görseller, lekeler, alan sınırı,
  // tipografi, yerleşim, zemin dokusu, hayalet konumu, görsel işlemleri.
  return { ok: true, belge: { ...ornek, kartlar } }
}

/**
 * Uyarlama isteminin sabit kısmı — agent'a NE yapacağı ve ne YAPAMAYACAĞI.
 *
 * ⚠ İstem şablonun kompozisyonunu ANLATMIYOR, çünkü agent onu değiştiremiyor zaten.
 * Anlatılan tek şey içeriğin şekli: kaç kart, her kartın rolü, hangi kartta hangi panel
 * tipi var. Değiştirilemeyen bir şeyi tarif etmek, modele orada bir seçim varmış gibi
 * gösterir ve o seçimi yapmaya çalışır.
 */
export const uyarlamaIstemi = (ornek: KatalogOrnegi, sablonId: string, konu: string): string => {
  const kartlar = ornek.kartlar
    .map((k, i) => {
      const p = k.panel === null ? 'panel yok' : `panel: ${k.panel.tip} (tipi DEĞİŞTİRİLEMEZ)`
      return `${i + 1}. ${k.ustBaslik} — "${k.baslik}" · ${p}`
    })
    .join('\n')
  return [
    `Konu: ${konu}`,
    `Şablon: ${sablonId} · ${ornek.kartlar.length} kart`,
    '',
    'Aşağıdaki DOLU taslağı bu konuya uyarla. Kompozisyonu değiştirme; yalnız metni ve',
    'panel verisini değiştir. Kart sayısı sabit.',
    '',
    kartlar,
    '',
    'Kurallar:',
    '- Her kartın `rayaOrta` alanına GERÇEK kaynağı yaz. Şablondaki "ÖRNEK VERİ" ifadesi',
    '  kalırsa uyarlama reddedilir; kaynağı olmayan sayısal iddia kullanma.',
    '- Başlıkta vurgulanacak kelimeyi `**böyle**` işaretle; işaretler çift olmalı.',
    '- `hayalet` alanı kısa olmalı: bir rakam, bir sembol ya da tek kelime.',
    '- Panel tipini değiştirme, yalnız içindeki veriyi değiştir.',
  ].join('\n')
}
