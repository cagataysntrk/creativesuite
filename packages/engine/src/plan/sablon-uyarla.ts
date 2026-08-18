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

import { kapsamDisiKarakterler, type KatalogOrnegi } from '@suite/render'
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
  | {
      readonly ok: true
      readonly belge: KatalogOrnegi
      /**
       * Öldürücü OLMAYAN bulgular — koşu devam ediyor, insan görüyor.
       *
       * ⚠ ⚠ **REDDETMEK İLE UYARMAK ARASINDAKİ FARK, BEDELİ KİMİN ÖDEDİĞİDİR.** Bu depoda
       * ilke *"garantiyi yoklukla zorla"*: rampa dışı bir degrade durağı temsil bile
       * edilemiyor. O ilke YAZARI İNSAN OLAN kodda bedava — geliştirici düzeltip yeniden
       * derler. Ama yazarı MODEL olan bir koşuda aynı sertlik, tek bir `✓` karakteri
       * yüzünden ücretli bir koşuyu tamamen durdurur ve elde hiçbir çıktı kalmaz.
       * Tasarımın kendisi sağlamken bir karakter için her şeyi atmak orantısız.
       *
       * ⚠ Ayrım keskin: **kompozisyonu bozan şey REDDEDİLİR** (panel tipi, kart sayısı,
       * kaynağın silinmesi) çünkü onlar tasarımı tanınmaz yapar. **Kozmetik olan
       * UYARILIR** ve zaten render sonrası ölçülüyor (`eksik-glif`), düzeltme turuna
       * giriyor ve insan onay kapısında görünüyor.
       */
      readonly uyarilar: readonly string[]
    }
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

  // ⚠ ⚠ **MARKA FONTUNUN ÇİZEMEYECEĞİ KARAKTER SÖZLEŞMEDE YAKALANIYOR — gerçek koşu
  // bunu iki kez gösterdi.** Model metne `✓` ve `→` koydu; `@font-face`in `unicode-range`i
  // onları kapsamıyor ve tarayıcı sistem fontuna düşüyor. Kusur render sonrası
  // ölçülüyordu (`eksik-glif`) ve düzeltme turuna gidiyordu — yani bir render, bir model
  // çağrısı ve bir tur daha harcanıyordu. Oysa cevap ÜRETİM ANINDA biliniyor: karakterin
  // kapsamda olup olmadığı metne bakmakla belli. **Sonradan ölçmek yerine baştan
  // reddetmek**, bu depoda tekrar eden ilke (garanti yoklukla zorlanır).
  // ⚠ **REDDETMİYOR, UYARIYOR** — gerekçe `UyarlamaSonucu.uyarilar` üstünde. Denetimdeki
  // `eksik-glif` ölçümü de KALIYOR: sözleşme yalnız uyarlama yolunu görüyor.
  const kapsamDisi = kapsamDisiKarakterler(
    u.kartlar
      .map((k) => `${k.ustBaslik}${k.baslik}${k.govde}${k.hayalet}${k.rayaSol}${k.rayaOrta}`)
      .join('')
  )
  const uyarilar: string[] =
    kapsamDisi.length === 0
      ? []
      : [
          `marka fontu şu karakterleri çizemiyor: ${kapsamDisi.join(' ')} — ` +
            'metinden çıkar ya da yazıyla ifade et',
        ]

  // ⚠ ⚠ **ÖRNEK BAŞLIKLARIN AYNEN KALMASI DA BİR KUSUR — gerçek koşu bunu öğretti.**
  // `ÖRNEK VERİ` işareti kaynağı koruyordu ama METNİ korumuyordu: model gövdeleri konuya
  // uyarladı ve dört başlığın dördünü de şablondan aynen kopyaladı. Sonuç konuya değil
  // ŞABLONA ait bir karoseldi ve hiçbir kapı itiraz etmedi. Tek tek başlık eşleşmesi
  // meşru olabilir (kısa, jenerik bir kapanış); HEPSİNİN eşleşmesi uyarlamanın hiç
  // yapılmadığı anlamına gelir.
  const aynen = u.kartlar.filter((y, i) => y.baslik.trim() === ornek.kartlar[i]?.baslik.trim())
  if (aynen.length === u.kartlar.length)
    kusurlar.push(
      `başlıkların TAMAMI şablonun örneğiyle aynı (${aynen.length}/${u.kartlar.length}) — ` +
        'uyarlama yapılmamış; başlıklar konuya göre yeniden yazılmalı'
    )

  if (kusurlar.length > 0) return { ok: false, kusurlar }
  // ⚠ Şablonun geri kalanı DOKUNULMADAN geçiyor: bant, görseller, lekeler, alan sınırı,
  // tipografi, yerleşim, zemin dokusu, hayalet konumu, görsel işlemleri.
  return { ok: true, belge: { ...ornek, kartlar }, uyarilar }
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
    'Aşağıdaki DOLU taslağı bu konuya uyarla. BAŞLIKLARI DA konuya göre yeniden yaz —',
    'örnekteki başlıkları aynen bırakmak uyarlama sayılmaz ve reddedilir.',
    'Kompozisyonu değiştirme; yalnız metni ve',
    `panel verisini değiştir. Kart sayısı SABİT: tam ${ornek.kartlar.length} kart üret.`,
    'Kaynak metinde daha fazla madde varsa BİRLEŞTİR; daha az varsa madde UYDURMA —',
    'içeriği kartlara dağıtmak senin işin.',
    '',
    kartlar,
    '',
    'Kurallar:',
    '- Her kartın `rayaOrta` alanına GERÇEK kaynağı yaz. Şablondaki "ÖRNEK VERİ" ifadesi',
    '  kalırsa uyarlama reddedilir; kaynağı olmayan sayısal iddia kullanma.',
    '- Başlıkta vurgulanacak kelimeyi `**böyle**` işaretle; işaretler çift olmalı.',
    '- `hayalet` alanı kısa olmalı: bir rakam ya da tek kelime.',
    '- Yalnız Latin harfleri, Türkçe harfler, rakam ve normal noktalama kullan.',
    '  Ok, tik, kutucuk gibi semboller marka fontunda YOK ve uyarlama reddedilir.',
    '- Panel tipini değiştirme, yalnız içindeki veriyi değiştir.',
    '',
    // ⚠ ⚠ **ÇIKTI SÖZLEŞMESİ İLK SÜRÜMDE HİÇ YAZILMAMIŞTI ve gerçek koşu iki kez
    // `ADAPTATION_UNPARSEABLE` ile durdu.** İstem alanları ANLATIYORDU ama biçimi
    // söylemiyordu; model doğal olarak nesir döndürdü. Ayrıştırıcıyı gevşetmek yanlış
    // cevap olurdu — sözleşmeyi yazmayıp uyulmasını beklemek, kuralı koymadan ihlali
    // cezalandırmaktır. Şema burada, örnekle birlikte.
    'ÇIKTI BİÇİMİ — yalnız JSON döndür, önünde ve arkasında hiçbir açıklama olmasın:',
    '{',
    `  "sablonId": "${sablonId}",`,
    '  "kartlar": [',
    '    {',
    '      "ustBaslik": "BÖLÜM 01",',
    '      "baslik": "Kısa başlık, **vurgulu** kelimeyle",',
    '      "govde": "Tek cümlelik gövde.",',
    '      "hayalet": "1",',
    '      "rayaSol": "KONU ETİKETİ",',
    '      "rayaOrta": "Gerçek kaynak, tarih"',
    '    }',
    `    // … toplam ${ornek.kartlar.length} kart`,
    '  ]',
    '}',
    'Panel taşıyan kartlarda `panel` alanını da yaz; tipi ŞABLONDAKİYLE aynı olsun.',
  ].join('\n')
}
