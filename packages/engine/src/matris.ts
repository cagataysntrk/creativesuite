// Reklam varyant matrisi — DİKLİK mekanik olarak doğrulanır (§10 · D-4 · FAZ-8.1).
//
// **Üç ekseni birden değiştiren bir test hiçbir şey öğretmez.** Hook, copy ve visual
// aynı anda değişirse sonuç farkının hangisinden geldiği bilinemez; "kazanan" diye
// corpus'a yazılan şey bir yanılsama olur ve FAZ-7.9'un geri besleme yolu onu kalıcı
// hâle getirir.
//
// **İKİ MEŞRU TASARIM VAR ve ikisi farklı işler için:**
//
//   `ofat` (one-factor-at-a-time) — ÖĞRENMEK için. Bir temel (baseline) varyant, sonra
//     her eksende TEK eksen oynatılmış varyantlar. Diğer eksenler sabit olduğu için
//     fark doğrudan o eksene atfedilir. Maliyet: 1 + Σ(düzey−1).
//
//   `full` (tam kartezyen) — yalnız Meta `asset_feed_spec` için. Meta kombinasyonu
//     SUNUCUDA kuruyor: H+C+V bileşenlerini ayrı ayrı yüklersin, H×C×V kreatif
//     RENDER ETMEZSİN. Bunu yerelde tam ızgara render'ı sanmak, 3×3×3'te 27 render
//     ödemek ve 7'yle öğrenilecek şeyi öğrenmemektir.
//
// ⚠ İlk tasarımım "ızgara TAM olmalı" diyordu ve **yanlıştı**: tam ızgara, öğrenme
// tasarımı değil kombinatoryal test tasarımıdır ve maliyeti dört katına çıkarır.
// Araştırma bunu açıkça söylüyor (`docs/research/2-b2b-ve-seritler--*`, "VARIANT
// MATRIX"). Zarif olan ile doğru olan aynı şey değil.

export interface Eksen {
  readonly ad: string
  /** Düzeyler — en az iki, yoksa eksen değil sabittir. */
  readonly duzeyler: readonly string[]
}

export type MatrisModu = 'ofat' | 'full'

export interface Varyant {
  /** Eksen adı → düzey. Her eksende tam olarak bir değer. */
  readonly koordinat: Readonly<Record<string, string>>
}

export type MatrisHatasi =
  /** Bir eksenin tek düzeyi var: o eksen ölçülmüyor, sabitleniyor. */
  | { readonly kind: 'tek_duzeyli_eksen'; readonly eksen: string }
  /** Varyant bir eksende değer taşımıyor. */
  | { readonly kind: 'eksik_eksen'; readonly eksen: string; readonly anahtar: string }
  /** Eksende tanımlı olmayan düzey. */
  | { readonly kind: 'bilinmeyen_duzey'; readonly eksen: string; readonly duzey: string }
  /** Aynı hücre iki kez: fazladan varyant maliyet, ek bilgi değil. */
  | { readonly kind: 'yinelenen_hucre'; readonly anahtar: string }
  /**
   * **OFAT ihlali:** temelden İKİ ya da daha çok eksende ayrılan varyant. Faz
   * dosyasının ihlal testi tam olarak bu (`FAZ-8.1`): fark atfedilemez.
   */
  | {
      readonly kind: 'cok_eksenli_sapma'
      readonly anahtar: string
      readonly sapanEksenler: readonly string[]
    }
  /** OFAT: temel varyant yok — neye göre karşılaştırılacağı belirsiz. */
  | { readonly kind: 'temel_yok' }
  /** `full` modda eksik hücre — kombinatoryal tasarımın deliği. */
  | { readonly kind: 'eksik_hucre'; readonly koordinat: Readonly<Record<string, string>> }

const anahtarla = (eksenler: readonly Eksen[], k: Readonly<Record<string, string>>): string =>
  eksenler.map((e) => `${e.ad}=${k[e.ad] ?? '?'}`).join('|')

const izgara = (eksenler: readonly Eksen[]): Readonly<Record<string, string>>[] =>
  eksenler.reduce<Readonly<Record<string, string>>[]>(
    (acc, e) => acc.flatMap((satir) => e.duzeyler.map((d) => ({ ...satir, [e.ad]: d }))),
    [{}]
  )

const sapanEksenler = (eksenler: readonly Eksen[], temel: Varyant, v: Varyant): readonly string[] =>
  eksenler.filter((e) => v.koordinat[e.ad] !== temel.koordinat[e.ad]).map((e) => e.ad)

export interface MatrisGirdisi {
  readonly eksenler: readonly Eksen[]
  readonly varyantlar: readonly Varyant[]
  readonly mod: MatrisModu
  /** OFAT temeli — her eksenin ilk düzeyi. `full` modda yok sayılır. */
  readonly temel?: Varyant
}

/**
 * Matris geçerli mi — **veya nerede bozuk**.
 *
 * Hata döndürmek bir tercih değil: bozuk bir tasarım para harcar ve karşılığında
 * atfedilemeyen bir sonuç verir. Maliyet önce, bilgi sonra gelirse sistem öğrenmiyor,
 * yalnızca harcıyordur.
 */
export const matrisDenetle = (g: MatrisGirdisi): readonly MatrisHatasi[] => {
  const hatalar: MatrisHatasi[] = []
  const { eksenler, varyantlar } = g

  for (const e of eksenler) {
    if (e.duzeyler.length < 2) hatalar.push({ kind: 'tek_duzeyli_eksen', eksen: e.ad })
  }

  const gorulen = new Set<string>()
  for (const v of varyantlar) {
    const k = anahtarla(eksenler, v.koordinat)
    for (const e of eksenler) {
      const d = v.koordinat[e.ad]
      if (d === undefined) {
        hatalar.push({ kind: 'eksik_eksen', eksen: e.ad, anahtar: k })
      } else if (!e.duzeyler.includes(d)) {
        hatalar.push({ kind: 'bilinmeyen_duzey', eksen: e.ad, duzey: d })
      }
    }
    if (gorulen.has(k)) hatalar.push({ kind: 'yinelenen_hucre', anahtar: k })
    gorulen.add(k)
  }

  if (g.mod === 'full') {
    for (const hucre of izgara(eksenler)) {
      if (!gorulen.has(anahtarla(eksenler, hucre))) {
        hatalar.push({ kind: 'eksik_hucre', koordinat: hucre })
      }
    }
    return hatalar
  }

  // ── OFAT ────────────────────────────────────────────────────────────────
  const temel = g.temel ?? varyantlar[0]
  if (temel === undefined) {
    hatalar.push({ kind: 'temel_yok' })
    return hatalar
  }
  for (const v of varyantlar) {
    const sapan = sapanEksenler(eksenler, temel, v)
    if (sapan.length > 1) {
      hatalar.push({
        kind: 'cok_eksenli_sapma',
        anahtar: anahtarla(eksenler, v.koordinat),
        sapanEksenler: sapan,
      })
    }
  }
  return hatalar
}

/**
 * Beklenen varyant sayısı — çalıştırmadan ÖNCE maliyet tahmini bunu çarpan alır.
 *
 * Fark küçük değil: 3×3×3'te OFAT **7**, tam ızgara **27**. Dört katı maliyet,
 * öğrenme açısından sıfır ek bilgi (Meta kombinasyonu zaten sunucuda kuruyor).
 */
export const varyantSayisi = (eksenler: readonly Eksen[], mod: MatrisModu): number =>
  mod === 'full'
    ? eksenler.reduce((n, e) => n * e.duzeyler.length, 1)
    : 1 + eksenler.reduce((n, e) => n + (e.duzeyler.length - 1), 0)

export const matrisHataMesaji = (h: MatrisHatasi): string => {
  switch (h.kind) {
    case 'tek_duzeyli_eksen':
      return `'${h.eksen}' ekseninin tek düzeyi var — bu eksen değil sabit; etkisi ölçülemez`
    case 'eksik_eksen':
      return `${h.anahtar}: '${h.eksen}' ekseninde değer yok`
    case 'bilinmeyen_duzey':
      return `'${h.eksen}' ekseninde tanımsız düzey: ${h.duzey}`
    case 'yinelenen_hucre':
      return `hücre iki kez: ${h.anahtar} — fazladan varyant maliyet, ek bilgi değil`
    case 'cok_eksenli_sapma':
      return `${h.anahtar}: temelden ${h.sapanEksenler.length} eksende ayrılıyor (${h.sapanEksenler.join(', ')}) — fark hangi eksene ait, ATFEDİLEMEZ`
    case 'temel_yok':
      return 'OFAT temeli yok — neye göre karşılaştırılacağı belirsiz'
    case 'eksik_hucre':
      return `tam ızgarada delik: ${JSON.stringify(h.koordinat)}`
  }
}

/**
 * Varyantları eksenlerden ÜRETİR — elle yazdırmaz.
 *
 * **En güçlü koruma, ihlali yazılamaz kılmaktır.** Elle yazılan bir varyant listesinde
 * iki eksenli sapma her zaman mümkündür ve ancak denetimle yakalanır; türetilen bir
 * listede o varyant hiç doğmaz. `matrisDenetle` yine de duruyor: hat dosyası elle
 * `varyantlar` verirse (Meta `asset_feed_spec` yolu) doğrulama gerekiyor.
 *
 * OFAT sırası anlamlı: **önce temel**, sonra eksen eksen. Manifest'te bu sırayla
 * görünüyor ve "hangi varyant neyi sınıyor" okunabilir kalıyor.
 */
export const varyantUret = (eksenler: readonly Eksen[], mod: MatrisModu): readonly Varyant[] => {
  const temel: Record<string, string> = {}
  for (const e of eksenler) {
    const ilk = e.duzeyler[0]
    if (ilk === undefined) return []
    temel[e.ad] = ilk
  }
  if (mod === 'full') return izgara(eksenler).map((k) => ({ koordinat: k }))

  const sonuc: Varyant[] = [{ koordinat: { ...temel } }]
  for (const e of eksenler) {
    for (const d of e.duzeyler.slice(1)) {
      sonuc.push({ koordinat: { ...temel, [e.ad]: d } })
    }
  }
  return sonuc
}
