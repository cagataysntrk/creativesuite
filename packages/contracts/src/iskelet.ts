// HEDEF: packages/contracts/src/iskelet.ts
//
// Kompozisyon iskeleti — TASARIMIN KENDİSİ veri (FAZ-13 · §7.1 · D-254).
//
// ⚠ ⚠ **BU DOSYA BİR DÜZELTMEDEN DOĞDU.** Yedi aile tanımlandı ve render edildi; ızgaraya
// bakınca yedi TASARIM değil, tek tasarımın yedi BOYASI göründü. Sebep: aile yalnız renk,
// süsleme yoğunluğu ve tipografi ölçeği söyleyebiliyordu — **tuvalin nasıl bölündüğü,
// hangi ögenin nereye oturduğu, çizginin hangi açıyla geçtiği `sablon.ts`'e GÖMÜLÜYDÜ.**
// Bir şablonu şablon yapan şey rengi değil; çizgileri, açıları, bölmeleri ve akışıdır.
//
// ⚠ **Neden bu ayrım kritik:** "yeni bir referans at, sistem onu ailesine katsın" ancak
// iskelet VERİ ise mümkün. İfade edemediğin şeyi ölçemez, ölçemediğin şeyi üretemezsin.
// Bu dosya o yolun ön şartı.
//
// ⚠ ⚠ **GARANTİ KATMANI YİNE DIŞARIDA.** İskelet yalnız NEREYE koyduğunu söylüyor; ne
// kontrast eşiği, ne kelime bütçesi, ne chroma tavanı taşıyor. Metnin çizgiye girmemesi
// bir aile tercihi değil bir garanti — `iskeletKusurlari` onu iskeletin KENDİSİNDE
// sınıyor, yani ihlal eden bir iskelet kabul edilmiyor (FAZ-12.7'nin yerleşim karşılığı).

/** Normalize dikdörtgen — tuval yüzdesi (0–100). */
export interface Bolge {
  readonly x: number
  readonly y: number
  readonly genislik: number
  readonly yukseklik: number
}

/**
 * Çizgi dili — tuvali bölen şeyin GRAMERİ.
 *
 * ⚠ **Beş referansın beşi burada ayrışıyor:** biri akan eğri, biri hiç bölmüyor, biri
 * ortogonal kurallarla bölüyor, biri sert köşegen isterdi. Bu ayrımı bir `boolean`
 * (`ikiAlan`) taşıyamaz — bir dil ister.
 */
export type CizgiDili =
  | {
      /** Akan eğri — organik, yumuşak, slayttan slayta kayan. */
      readonly tip: 'egri'
      /** Merkez konumu yüzde; salınım genliği yüzde. */
      readonly merkez: number
      readonly genlik: number
    }
  | {
      /** Sert köşegen — yönlü, poster dili. */
      readonly tip: 'kosegen'
      readonly merkez: number
      /** Eğim yüzde: üst ile alt uç arasındaki fark. */
      readonly egim: number
    }
  | {
      /** Ortogonal kılcal kurallar — görünür modüler ızgara. */
      readonly tip: 'izgara'
      /** Yatay çizgilerin y konumları, yüzde. */
      readonly yatay: readonly number[]
      /** Dikey çizgilerin x konumları, yüzde. */
      readonly dikey: readonly number[]
    }
  | {
      /** Bölme yok — tuval tek yüzey, kimliği başka şey taşıyor. */
      readonly tip: 'yok'
    }

/** Tipografi ilişkisi — ölçek ve karşıtlık, mutlak punto değil. */
export interface TipoIliskisi {
  /**
   * Başlık puntosunun ÖLÇÜLEN tavana oranı (0–1].
   *
   * ⚠ Tavan ailenin DEĞİL: en uzun Türkçe kelimenin güvenli sütuna sığdığı en büyük değer
   * (R-23) ve bir garanti. Aile yalnız ALTINDA kalmayı seçebilir; aşmak temsil edilemez.
   */
  readonly baslikPayi: number
  /** Gövde/başlık ölçek oranı. Küçük değer = sert hiyerarşi, büyük = düz. */
  readonly govdeOrani: number
  /** Satır aralığı çarpanı — sıkı (0.9) ya da havadar (1.6). */
  readonly satirAraligi: number
}

/**
 * Kompozisyon iskeleti — bir şablonun ÖLÇÜLEBİLİR tarifi.
 *
 * ⚠ Bölgeler yüzde: 1:1, 4:5 ve 9:16 aynı iskeleti paylaşabilsin. Piksel yazsaydık her
 * en-boy için ayrı iskelet gerekirdi ve "aynı tasarım, farklı format" imkânsız olurdu.
 */
export interface Iskelet {
  /** Metin sütunu. */
  readonly metin: Bolge
  /** Dev rakam — `null` ise bu tasarımda yok. */
  readonly rakam: Bolge | null
  /** Görsel yuvası — `null` ise tasarım görselsiz. */
  readonly gorsel: Bolge | null
  /** Süslemelerin oturacağı bant. */
  readonly susleme: Bolge
  /** Tuvali bölen çizgi dili. */
  readonly cizgi: CizgiDili
  /** Tipografi ilişkileri. */
  readonly tipo: TipoIliskisi
}

/** Bir iskeletin kabul edilemez olduğu hâller. */
export interface IskeletKusuru {
  readonly alan: string
  readonly sebep: 'tuval-disi' | 'cizgiyi-kesiyor' | 'sifir-alan'
}

const icerideMi = (b: Bolge): boolean =>
  b.x >= 0 &&
  b.y >= 0 &&
  b.genislik > 0 &&
  b.yukseklik > 0 &&
  b.x + b.genislik <= 100 &&
  b.y + b.yukseklik <= 100

/**
 * Çizginin metin bölgesine en çok yaklaştığı x — yoksa `null`.
 *
 * ⚠ Zarf mantığı FAZ-12.10'la aynı: geniş yanılmak GÜVENLİ, dar yanılmak metni çizginin
 * içine sokar. `izgara` dilinde dikey çizgiler bölmüyor, üstünden geçiyor — metin onlara
 * OTURUYOR, onlardan kaçmıyor; o yüzden kesişme kusuru sayılmıyor.
 */
const cizgiSiniri = (c: CizgiDili): { readonly min: number; readonly max: number } | null =>
  c.tip === 'egri'
    ? { min: c.merkez - c.genlik, max: c.merkez + c.genlik }
    : c.tip === 'kosegen'
      ? { min: c.merkez - Math.abs(c.egim), max: c.merkez + Math.abs(c.egim) }
      : null

/**
 * İskeleti doğrular — **garanti burada, ailede değil.**
 *
 * ⚠ ⚠ Bir aile istediği kompozisyonu tarif edebilir ama metni çizginin içine SOKAMAZ.
 * Kural iskeletin kendisinde sınanıyor: ihlal eden bir iskelet kabul edilmiyor, yani
 * "yeni aile" bir kısıtı delmenin yolu olamıyor (FAZ-12.7'nin yerleşim karşılığı).
 */
export const iskeletKusurlari = (i: Iskelet): readonly IskeletKusuru[] => {
  const k: IskeletKusuru[] = []
  const bolgeler: readonly (readonly [string, Bolge | null])[] = [
    ['metin', i.metin],
    ['rakam', i.rakam],
    ['gorsel', i.gorsel],
    ['susleme', i.susleme],
  ]
  for (const [ad, b] of bolgeler) {
    if (b === null) continue
    if (b.genislik <= 0 || b.yukseklik <= 0) {
      k.push({ alan: ad, sebep: 'sifir-alan' })
      continue
    }
    // ⚠ ⚠ **RAKAM TAŞABİLİR, METİN VE GÖRSEL TAŞAMAZ — ve bu bir tasarım kuralı.**
    // Dev rakam referansta KASTEN kenardan kırpılıyor; taşmasını kusur saymak, tasarımın
    // kendisini kusur saymak olurdu. İlk sürüm ayrım yapmıyordu ve üç ailede yanlış
    // pozitif verdi. Metnin ya da görselin kırpılması ise her zaman kusur: yarım bir
    // cümle okunmaz, yarım bir fotoğraf kaza görünür.
    const tasabilir = ad === 'rakam' || ad === 'susleme'
    if (!tasabilir && !icerideMi(b)) k.push({ alan: ad, sebep: 'tuval-disi' })
    // Taşabilen ögede yine de BAŞLANGIÇ tuvalde olmalı: tamamen dışarıdaki bir öge
    // çizilmiyor demektir ve bu bir tasarım değil bir hatadır.
    if (tasabilir && (b.x >= 100 || b.y >= 100 || b.x + b.genislik <= 0 || b.y + b.yukseklik <= 0))
      k.push({ alan: ad, sebep: 'tuval-disi' })
  }
  const s = cizgiSiniri(i.cizgi)
  if (s !== null) {
    const sol = i.metin.x
    const sag = i.metin.x + i.metin.genislik
    // Metin bölgesi çizgi bandıyla ÖRTÜŞÜYORSA kusur: yarısı bir zeminde, yarısı ötekinde
    // kalan bir satırın kontrastı satır ortasında değişir.
    if (sol < s.max && sag > s.min) k.push({ alan: 'metin', sebep: 'cizgiyi-kesiyor' })
  }
  return k
}
