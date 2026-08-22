// Yayın saati — bir ÖNERİ, bir otomasyon değil (§11 · R-46 · FAZ-17.3).
//
// ⚠ ⚠ **HAT SAATİ SEÇMEZ, ÖNERİR.** Otomatik yayın Yasa 2'nin ihlalidir: agent önerir,
// insan uygular. Bu modül bir saat DEĞERİ üretir; o değeri bir yayına çeviren tek şey
// insanın onayıdır.
//
// ⚠ ⚠ **ÖNERİNİN KAYNAĞI ÖLÇÜM OLMALI.** "Salı 19:00 iyidir" cümlesi internette
// yüzlerce kez yazılmış ve HİÇBİRİ bu markanın hesabını ölçmemiştir. Kaynağı
// olmayan bir saat, kaynaksız bir sayısal iddiadır (Yasa 8) — ve bir iddianın
// "öneri" diye sunulması onu kaynaklı yapmaz.
//
// Bu yüzden modülün en önemli dalı ÖNERMEME dalıdır: yayın defterinde etkileşim
// ölçümü yoksa cevap `veri-yok`tur ve SEBEBİ yazılıdır. Bugün üretimde dönen dal
// budur — `derived/runs/published.ndjson` yayın ZAMANINI tutuyor ama etkileşimi
// tutmuyor; analitik çekimi (FAZ-7.9) yazılmadı. Yani hat şu an dürüstçe
// *"veri yok, saat öneremem"* diyor ve bu bir eksiklik değil, doğru cevaptır.

import { readLedger, type PublishedEntry } from '../publish-ledger.js'

/** Bir yayının ÖLÇÜLMÜŞ sonucu. `etkilesim` yoksa gözlem sayılmaz. */
export interface YayinGozlemi {
  /** ISO-8601 damga — defterden geliyor, uydurulmuyor. */
  readonly publishedAt: string
  /**
   * Ölçülmüş etkileşim. **`null` "sıfır" DEĞİLDİR**: sıfır etkileşim bir ölçümdür,
   * `null` ölçüm yokluğudur. İkisini karıştırmak, hiç ölçülmemiş bir hesabı
   * "her saat kötü" diye okumak olurdu.
   */
  readonly etkilesim: number | null
}

export type YayinSaatiOnerisi =
  | {
      readonly tur: 'oneri'
      /** Türkiye yerel saati, 0–23. */
      readonly saat: number
      readonly gerekce: string
      /** Öneriyi besleyen gözlem sayısı — okuyan "kaç ölçümden" diye sorabilsin. */
      readonly ornek: number
    }
  | {
      readonly tur: 'veri-yok'
      readonly sebep: string
      /** Etkileşimi ölçülmüş gözlem sayısı — sıfır olabilir. */
      readonly ornek: number
    }

/**
 * Öneri için gereken EN AZ gözlem.
 *
 * ⚠ Üç yayınla "en iyi saat" söylemek, üç zar atıp zarın hilesini açıklamaktır.
 * Beş de az; ama tavanı yükseltmek öneriyi hiç gelmeyecek bir şeye çevirir. Beşte
 * durup ÖRNEK SAYISINI gerekçeye yazmak, okuyana kararı bırakır.
 */
export const EN_AZ_GOZLEM = 5

/**
 * ISO damgadan Türkiye yerel SAATİ.
 *
 * ⚠ `new Date` KULLANILMIYOR (R-06): motorun içinde duran her `Date` bir gün duvar
 * saatine dokunur ve replay'i bozar. Dize biçimsel olarak ayrıştırılıyor.
 *
 * ⚠ Türkiye 2016'dan beri KALICI UTC+3, yaz saati uygulaması yok. Bu yüzden dönüşüm
 * sabit bir toplama — bir zaman dilimi kütüphanesi (ve bir bağımlılık) gerekmiyor.
 * Kural değişirse burası değişir ve tek yerdir.
 */
export const turkiyeSaati = (iso: string): number | null => {
  const m =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/.exec(iso)
  if (m === null) return null
  const saat = Number(m[4])
  const dakika = Number(m[5])
  if (!Number.isInteger(saat) || saat > 23 || !Number.isInteger(dakika) || dakika > 59) return null
  const ofset = m[6] ?? 'Z'
  // Damga kendi ofsetini taşıyorsa önce UTC'ye indiriliyor: `+05:00` yazan bir kayıt
  // UTC değildir ve UTC sanmak öneriyi iki saat kaydırırdı.
  const ofsetDk = ofset === 'Z' ? 0 : Number(ofset.slice(1, 3)) * 60 + Number(ofset.slice(4, 6))
  const isaret = ofset.startsWith('-') ? -1 : 1
  const utcDk = saat * 60 + dakika - isaret * ofsetDk
  const trDk = utcDk + 3 * 60
  return ((Math.floor(trDk / 60) % 24) + 24) % 24
}

/**
 * Gözlemlerden saat önerir — ya da ÖNERMEZ ve sebebini yazar.
 *
 * ⚠ Ortalama alınıyor, toplam değil: bir saatte iki yayın varsa toplamı doğal olarak
 * daha büyüktür ve "en çok yayın yaptığın saat" ile "en iyi saat" karışırdı.
 */
export const yayinSaatiOner = (gozlemler: readonly YayinGozlemi[]): YayinSaatiOnerisi => {
  const olculen = gozlemler.filter(
    (g): g is YayinGozlemi & { etkilesim: number } =>
      typeof g.etkilesim === 'number' && Number.isFinite(g.etkilesim) && g.etkilesim >= 0
  )
  const saatli = olculen.flatMap((g) => {
    const s = turkiyeSaati(g.publishedAt)
    return s === null ? [] : [{ saat: s, etkilesim: g.etkilesim }]
  })

  if (saatli.length < EN_AZ_GOZLEM) {
    return {
      tur: 'veri-yok',
      ornek: saatli.length,
      sebep:
        saatli.length === 0
          ? 'etkileşimi ölçülmüş yayın yok — saat öneremem'
          : `yalnız ${String(saatli.length)} ölçülmüş yayın var, en az ${String(EN_AZ_GOZLEM)} gerekiyor — saat öneremem`,
    }
  }

  const kova = new Map<number, { toplam: number; adet: number }>()
  for (const g of saatli) {
    const k = kova.get(g.saat) ?? { toplam: 0, adet: 0 }
    kova.set(g.saat, { toplam: k.toplam + g.etkilesim, adet: k.adet + 1 })
  }
  // Sıralama DETERMİNİST: eşit ortalamada küçük saat kazanıyor. `sort` kararsız olsaydı
  // aynı defter iki koşuda iki farklı saat önerirdi.
  const siralı = [...kova.entries()]
    .map(([saat, k]) => ({ saat, ort: k.toplam / k.adet, adet: k.adet }))
    .sort((a, b) => (b.ort === a.ort ? a.saat - b.saat : b.ort - a.ort))

  const en = siralı[0]
  if (en === undefined) {
    return { tur: 'veri-yok', ornek: 0, sebep: 'etkileşimi ölçülmüş yayın yok — saat öneremem' }
  }
  const genelOrt = saatli.reduce((t, g) => t + g.etkilesim, 0) / saatli.length
  const fark = genelOrt === 0 ? 0 : Math.round(((en.ort - genelOrt) / genelOrt) * 100)
  return {
    tur: 'oneri',
    saat: en.saat,
    ornek: saatli.length,
    // ⚠ Gerekçe SAYIYLA konuşuyor: "bu saat iyi" değil, "şu kadar ölçümde ortalama şu".
    gerekce:
      `${String(saatli.length)} ölçülmüş yayında en yüksek ortalama etkileşim ` +
      `saat ${String(en.saat).padStart(2, '0')}:00 diliminde (${String(en.adet)} yayın, ` +
      `ortalama ${String(Math.round(en.ort))}; genel ortalamanın %${String(fark)} üstü).`,
  }
}

/**
 * Yayın defterinden gözlemleri okur.
 *
 * ⚠ ⚠ **DEFTER ETKİLEŞİM TUTMUYOR ve bu bilinçli olarak `null` dönüyor.** Yayın
 * kaydı (`PublishedEntry`) yalnız "ne, nereye, ne zaman" diyor; "ne oldu" sorusunun
 * cevabı analitik çekimiyle gelecek (FAZ-7.9). O gün geldiğinde bu fonksiyon
 * `etkilesim` alanını doldurur ve öneri dalı KENDİLİĞİNDEN açılır — çağıranların
 * hiçbiri değişmez.
 *
 * ⚠ Defter YOKSA boş liste dönüyor: bu okuma bir yayın kararı vermiyor, bir öneri
 * hazırlıyor. `lookupPublished`ün "defter yok ≠ boş defter" katılığı ORADA doğru,
 * burada bir öneriyi engellemek için sebep değil — zaten `veri-yok` diyeceğiz.
 */
export const yayinGozlemleri = (repoRoot: string): readonly YayinGozlemi[] => {
  const r = readLedger(repoRoot)
  if (!r.ok) return []
  return r.entries.map((e: PublishedEntry) => ({
    publishedAt: e.publishedAt,
    etkilesim: etkilesimOku(e),
  }))
}

/**
 * Kayıttaki ölçülmüş etkileşim — bugün hiçbir yazıcı doldurmuyor.
 *
 * ⚠ Alan defterin ŞEMASINDA (`PublishedEntry.engagement`): kaçamak bir cast ile
 * okumak, defterin sözleşmesini kodun dışında tutmak olurdu. Analitik çekimi
 * (FAZ-7.9) geldiğinde yazıcı alanı doldurur ve öneri dalı kendiliğinden açılır.
 */
const etkilesimOku = (e: PublishedEntry): number | null =>
  typeof e.engagement === 'number' && Number.isFinite(e.engagement) ? e.engagement : null
