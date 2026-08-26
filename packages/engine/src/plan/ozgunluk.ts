// HEDEF: packages/engine/src/plan/ozgunluk.ts
//
// Özgünlük — yeni üretim geçmiş bir üretimin tekrarı mı (FAZ-19.12 · madde 6).
//
// ⚠ ⚠ **BUGÜNE KADAR SAYISAL BİR ÖLÇÜM YOKTU.** Elde yalnız `son_kullanilan` (son
// koşuların ŞABLON adları) ve `kacinilacak` (geçmiş red gerekçeleri) vardı — ikisi de
// biçimi çeşitlendiriyor, İÇERİĞİ değil. Depo sahibi: *"yayınlananların aşırı benzeri
// tekrarına düşmemeliyiz, yeni üretimlerde özgünlük önemli"*.
//
// ⚠ ⚠ **EŞİK ÖLÇÜLDÜ, TAHMİN EDİLMEDİ — ve ölçüm iki dağılımın ÖRTÜŞTÜĞÜNÜ gösterdi.**
// Depodaki 51 koşunun metni çıkarıldı, 1275 çift karşılaştırıldı:
//
//   AYNI konulu çiftler (gerçek tekrar) : n=55  · min 0,120 · ortanca 0,207 · max 0,367
//   FARKLI konulu çiftler               : n=648 · min 0,000 · ortanca 0,024 · max 0,222
//
// 0,120–0,222 bandında İÇ İÇELER. Yani tek bir benzerlik eşiği ikisini temiz ayıramaz
// ve ayırdığını söylemek yalan olurdu. Eşik taraması:
//
//   0,20 → 1 yanlış red · 31/55 yakalar        0,25 → 0 yanlış red · 17/55
//   0,23 → 0 yanlış red · 21/55 yakalar        0,30 → 0 yanlış red ·  6/55
//
// ⚠ ⚠ **BU YÜZDEN İKİ KURAL VAR, BİR TANE DEĞİL.** Konu kimliği tekrarların %100'ünü
// tek başına yakalıyor ve hiçbir eşiğe ihtiyaç duymuyor — aynı konu, tekrardır. Metin
// benzerliği İKİNCİ savunma: konusu farklı yazılmış ama içeriği aynı olan üretimi
// yakalıyor. `0,23` yanlış red vermeyen EN YÜKSEK değer ve gözlenen farklı-konu
// tavanının (0,222) hemen üstünde.
//
// ⚠ **NE YAKALAMADIĞI DA SÖYLENİYOR:** metin kuralı aynı konulu çiftlerin %38'ini
// yakalıyor, kalanı konu kuralına düşüyor. İkisi birlikte ölçülen vakaları kapsıyor;
// "her tekrarı yakalar" demek ölçümün söylemediği bir şey olurdu.

/**
 * Türkçe duyarlı katlama — karşılaştırma için.
 *
 * ⚠ `toLocaleLowerCase('tr')` ŞART: `I` → `ı` ve `İ` → `i` dönüşümü yerelsiz yapılırsa
 * `ÖLÇÜM` ile `ölçüm` farklı iki dize olur ve kapı tekrarı görmez.
 */
export const katla = (s: string): string =>
  s
    .toLocaleLowerCase('tr')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()

/**
 * Kelime kümesi Jaccard benzerliği (0–1).
 *
 * ⚠ ⚠ **KÜME, DİZİ DEĞİL — ve sıra bilerek yok sayılıyor.** Aynı içeriği farklı
 * sırayla yazmak bir özgünlük değildir; sıraya duyarlı bir ölçüm (Levenshtein,
 * n-gram) cümleleri yer değiştiren bir tekrarı "yeni" sayardı.
 * ⚠ Üç harften kısa kelimeler ELENİYOR: Türkçede `bir`, `ve`, `bu` her metinde var ve
 * benzerliği tabandan şişirerek gerçek örtüşmeyi gizliyor.
 */
export const benzerlik = (a: string, b: string): number => {
  const kume = (s: string): ReadonlySet<string> =>
    new Set(
      katla(s)
        .split(' ')
        .filter((w) => w.length > 2)
    )
  const A = kume(a)
  const B = kume(b)
  if (A.size === 0 || B.size === 0) return 0
  let kesisim = 0
  for (const w of A) if (B.has(w)) kesisim += 1
  return kesisim / (A.size + B.size - kesisim)
}

/**
 * Metin benzerliği tavanı — **ÖLÇÜLDÜ**, dosya başındaki tabloya bak.
 *
 * 648 farklı-konu çiftinin hiçbiri bu eşiği geçmiyor (en yükseği 0,222); yani bu eşik
 * bugüne kadar hiçbir özgün üretimi reddetmezdi. Aşağı çekmek (0,20) ilk yanlış reddi
 * getiriyor.
 */
export const BENZERLIK_TAVANI = 0.23

export interface GecmisUretim {
  readonly runId: string
  readonly konu: string
  /** Kartların başlıkları ve gövdeleri — üretilen metnin kendisi. */
  readonly metin: string
}

export type OzgunlukSonucu =
  | { readonly ozgun: true }
  | {
      readonly ozgun: false
      /** Hangi kural düştü — ikisi ayrı güçte ve ayrı ayrı bildiriliyor. */
      readonly kural: 'konu-tekrari' | 'metin-benzerligi'
      readonly esleseN: string
      readonly skor: number
    }

/**
 * Yeni üretim geçmişin tekrarı mı.
 *
 * ⚠ ⚠ **KONU KURALI ÖNCE ve eşiksiz.** Aynı konu tekrardır; bunu bir benzerlik
 * sayısına bağlamak, kesin olanı olasılığa çevirmek olurdu. Ölçümde konu kimliği
 * tekrarların %100'ünü tek başına yakaladı.
 * ⚠ Metin kuralı İKİNCİ: konusu farklı yazılmış ama içeriği aynı olan üretim için.
 */
export const ozgunlukDenetle = (
  yeni: { readonly konu: string; readonly metin: string },
  gecmis: readonly GecmisUretim[]
): OzgunlukSonucu => {
  const yeniKonu = katla(yeni.konu)
  if (yeniKonu !== '') {
    for (const g of gecmis) {
      if (katla(g.konu) === yeniKonu)
        return { ozgun: false, kural: 'konu-tekrari', esleseN: g.runId, skor: 1 }
    }
  }
  let enYakin: { runId: string; skor: number } | null = null
  for (const g of gecmis) {
    const s = benzerlik(yeni.metin, g.metin)
    if (enYakin === null || s > enYakin.skor) enYakin = { runId: g.runId, skor: s }
  }
  if (enYakin !== null && enYakin.skor >= BENZERLIK_TAVANI)
    return {
      ozgun: false,
      kural: 'metin-benzerligi',
      esleseN: enYakin.runId,
      skor: +enYakin.skor.toFixed(3),
    }
  return { ozgun: true }
}

// ── GEÇMİŞ ÜRETİMLERİ OKUMA ─────────────────────────────────────────────────
//
// ⚠ ⚠ **KARŞILAŞTIRMA KÜMESİ REDDEDİLENLERİ İÇERMİYOR.** Elenmiş bir koşu bir üretim
// değil, bir denemedir; ona benzemek bir tekrar sayılmaz. Aksi hâlde reddedilen bir
// çalışma, aynı konuyu bir daha DENEMEYİ imkânsız kılardı — oysa yeniden denemek tam
// olarak reddin amacı.
// ⚠ Kendi koşusu da elenmiş: bir üretim kendine benzemekten suçlu olamaz.

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { RUNS_DIR } from '@suite/kernel'

const oku = (yol: string): unknown => {
  if (!existsSync(yol)) return null
  try {
    return JSON.parse(readFileSync(yol, 'utf8'))
  } catch {
    return null
  }
}

/**
 * Geçmiş üretimler — reddedilmemiş ve metni okunabilen koşular.
 *
 * ⚠ Metin `sablon-uyarla` çıktısından geliyor: başlık ve gövde orada, uyarlanmış
 * hâliyle duruyor. Ham corpus kaydını okumak, üretilen metni değil KAYNAĞI
 * karşılaştırmak olurdu.
 */
export const gecmisUretimler = (
  repoRoot: string,
  haricRunId = '',
  /**
   * Karşılaştırılacak koşular — **plan anında dondurulmuş liste**.
   *
   * ⚠ ⚠ **DİZİNİ ÇALIŞMA ANINDA TARAMAK R-07'Yİ KIRARDI.** `derived/runs` her koşuda
   * büyüyor; aynı plan bugün 51, yarın 60 koşuyla karşılaştırılırsa AYNI GİRDİ FARKLI
   * ÇIKTI verir ve replay çöker. Aynı ders `son_kullanilan` için bir kez öğrenildi
   * (D-308): plan neyi gördüyse onu saklıyor.
   * ⚠ Liste verilmezse dizin taranıyor — CLI dışı çağrılar (test, elle çalıştırma)
   * için. Üretim yolu HER ZAMAN listeyi veriyor.
   */
  idler?: readonly string[]
): readonly GecmisUretim[] => {
  const kok = join(repoRoot, RUNS_DIR)
  if (!existsSync(kok)) return []
  const out: GecmisUretim[] = []
  for (const d of idler ?? readdirSync(kok)) {
    if (d === haricRunId) continue
    // ⚠ ⚠ **LİSTE VERİLDİYSE RED DENETİMİ YAPILMIYOR — ve bu bir R-07 sızıntısını
    // kapatıyor.** Liste plan anında zaten SÜZÜLEREK donduruldu. Burada bir kez daha
    // süzmek, plandan SONRA reddedilen bir koşunun kümeden düşmesi demekti: aynı plan,
    // aynı girdi, farklı karşılaştırma kümesi — yani farklı çıktı. Kararın ne zaman
    // verildiği plana ait, çalışmaya değil.
    if (idler === undefined) {
      const man = oku(join(kok, d, 'manifest.json')) as {
        decisions?: readonly { decision?: unknown }[]
      } | null
      if ((man?.decisions ?? []).some((x) => x.decision === 'rejected')) continue
    }
    const uy = oku(join(kok, d, 'steps/sablon-uyarla.json')) as {
      uyarlama?: { kartlar?: readonly { baslik?: unknown; govde?: unknown }[] }
    } | null
    const par = oku(join(kok, d, 'kosu-parametreleri.json')) as { topic?: unknown } | null
    const kartlar = uy?.uyarlama?.kartlar ?? []
    const metin = kartlar
      .flatMap((k) => [
        typeof k.baslik === 'string' ? k.baslik : '',
        typeof k.govde === 'string' ? k.govde : '',
      ])
      .filter((x) => x !== '')
      .join(' ')
    const konu = typeof par?.topic === 'string' ? par.topic : ''
    if (metin === '' && konu === '') continue
    out.push({ runId: d, konu, metin })
  }
  return out
}
