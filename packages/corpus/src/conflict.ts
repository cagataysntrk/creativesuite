// Çelişki tespiti ve tahkim kuyruğu (§5.5 · §5.6).
//
// **Model karar VERMEZ.** Sınıflandırıcı yalnız bir aday işaretler; `contradicts`
// bulunduğunda iki iddia, iki kaynak, iki tarih ve iki güven yan yana konur ve İNSAN
// seçer: eskiyi tut / yeniyi al / ikisini farklı kapsamlarda tut (§5.5).
//
// **Neden otomatik çözüm yok:** çelişen iki konumlandırmadan hangisinin doğru olduğu
// corpus'ta yazmıyor — dışarıda, gerçek dünyada yazıyor. Modelin seçmesi, bilmediği
// bir şeyi bildiğini iddia etmesidir ve yanlış seçim SESSİZCE her deck'e sızar.
//
// İki katman:
//   1. **Aday bulma — deterministik.** Aynı `(type, scope)` yuvasında FTS5 yakın-kopya.
//      Ucuz, tekrarlanabilir, ağsız. Model çağrısı yapılmadan önce koşar.
//   2. **Sınıflandırma — takılabilir.** `entails | contradicts | unrelated`. Gerçek
//      sınıflandırıcı FAZ-3.5'te bir `GENERATE` yeteneğine bağlanır; buradaki sözleşme
//      bugün sabit, böylece kuyruk ve tahkim akışı model olmadan test edilebiliyor.

import type { Db } from '@suite/kernel'
import { search } from './search.js'

export type Verdict = 'entails' | 'contradicts' | 'unrelated'

export interface ClaimRecord {
  readonly id: string
  readonly type: string
  readonly title: string
  readonly body: string
  /** Kaynak referansı — tahkimde İKİ kaynak yan yana konur (§5.5). */
  readonly sourceRef: string | null
  /** 0..1. Tahkimde gösterilir; otomatik seçim için KULLANILMAZ. */
  readonly confidence: number | null
  /** ISO 8601. Yeni olmak doğru olmak demek değildir — insan karar verir. */
  readonly recordedAt: string | null
}

/** Aynı yuvadaki iki kayıt. Sıra anlamlıdır: `incoming` yeni gelen, `existing` mevcut. */
export interface ConflictCandidate {
  readonly incoming: ClaimRecord
  readonly existing: ClaimRecord
  /** Aramadan gelen benzerlik sırası — düşük = daha benzer. */
  readonly rank: number
}

export interface ArbitrationItem {
  readonly candidate: ConflictCandidate
  readonly verdict: Verdict
  /** Sınıflandırıcının gerekçesi. İnsan bunu okuyup KENDİ kararını verir. */
  readonly rationale: string
}

/** Sınıflandırıcı sözleşmesi. FAZ-3.5'te gerçek model buraya takılır. */
export type Classifier = (c: ConflictCandidate) => { verdict: Verdict; rationale: string }

/**
 * Aynı `(type, scope)` yuvasındaki yakın-kopya adayları.
 *
 * **Neden kelime kelime arıyor:** `search()` sorguyu bir ÖBEK (phrase) olarak tırnaklar —
 * kullanıcı metni FTS5 operatörü olarak yorumlanmasın diye ve bu doğru. Ama tam cümleyi
 * öbek olarak aramak yalnız birebir kopyaları bulur; çelişki tam da **farklı yazılmış**
 * iki iddiadır. O yüzden anlamlı kelimeler ayrı ayrı aranır ve KAÇ kelimede eşleştiği
 * sayılır: iki kayıt ne kadar çok terim paylaşıyorsa o kadar yakın.
 *
 * Dört karakterden kısa kelimeler atılır ("ve", "bir", "%18" gibi) — hepsi her yerde
 * geçer ve sıralamayı gürültüye boğar.
 */
export const findCandidates = (
  db: Db,
  incoming: ClaimRecord,
  havuz: readonly ClaimRecord[],
  limit = 5
): readonly ConflictCandidate[] => {
  const ilkCumle = incoming.body.split(/[.!?\n]/)[0] ?? ''
  const kelimeler = [...new Set(`${incoming.title} ${ilkCumle}`.split(/[^\p{L}\p{N}]+/u))]
    .filter((k) => k.length >= 4)
    .slice(0, 8)
  if (kelimeler.length === 0) return []

  const byId = new Map(havuz.map((r) => [r.id, r]))
  /** id → kaç terimde eşleşti + en iyi sıra. */
  const skor = new Map<string, { hits: number; bestRank: number }>()
  for (const k of kelimeler) {
    for (const [i, hit] of search(db, k, limit * 3).entries()) {
      if (hit.id === incoming.id) continue // kendisi
      const existing = byId.get(hit.id)
      if (existing === undefined) continue
      // Yalnız AYNI TİP karşılaştırılır: bir persona ile bir konumlandırma çelişemez,
      // farklı şeyler söylüyorlar. Tipler arası "çelişki" yalnız gürültü üretir.
      if (existing.type !== incoming.type) continue
      const onceki = skor.get(hit.id)
      skor.set(hit.id, {
        hits: (onceki?.hits ?? 0) + 1,
        bestRank: Math.min(onceki?.bestRank ?? i, i),
      })
    }
  }

  // En az İKİ terim paylaşmayan kayıt aday değil: tek ortak kelime tesadüftür.
  return [...skor.entries()]
    .filter(([, v]) => v.hits >= 2)
    .sort((a, b) => b[1].hits - a[1].hits || a[1].bestRank - b[1].bestRank)
    .slice(0, limit)
    .flatMap(([id, v]) => {
      const existing = byId.get(id)
      return existing === undefined ? [] : [{ incoming, existing, rank: v.bestRank }]
    })
}

/**
 * Adayları sınıflandırır ve **yalnız `contradicts` olanları** kuyruğa koyar.
 *
 * `entails` (aynı şeyi söylüyor) kuyruğa girmez: her yakın kaydı insana sormak,
 * kuyruğu kullanılamaz yapar ve kuyruk kullanılmazsa gerçek çelişki de görülmez.
 */
export const arbitrationQueue = (
  adaylar: readonly ConflictCandidate[],
  classify: Classifier
): readonly ArbitrationItem[] =>
  adaylar.map((c) => ({ candidate: c, ...classify(c) })).filter((x) => x.verdict === 'contradicts')

/**
 * Sayısal çelişki dedektörü — **deterministik, modelsiz**.
 *
 * Aynı olgunun iki farklı sayısı en sık ve en tehlikeli çelişki türü: "%18 fire
 * azalması" ile "%31 fire azalması" ikisi de `active` kalırsa hangisinin deck'e
 * gireceği ARAMA SIRASINA bağlı olur — yani rastgele.
 *
 * Model gerekmez: sayılar karşılaştırılabilir. Bu yüzden bu kontrol her zaman koşar,
 * sınıflandırıcı takılı olmasa bile.
 */
export const numericConflict = (a: ClaimRecord, b: ClaimRecord): boolean => {
  const sayilar = (r: ClaimRecord): string[] =>
    // Yüzde ve ondalık: `%18`, `18%`, `18,5`, `18.5`. Türkçe ondalık ayırıcı VİRGÜL —
    // `18,5` sayısını `18` ve `5` diye ikiye bölmek, çelişkiyi kaçırmanın kolay yolu.
    (`${r.title} ${r.body}`.match(/\d+(?:[.,]\d+)?/g) ?? []).map((s) => s.replace(',', '.'))

  const A = new Set(sayilar(a))
  const B = new Set(sayilar(b))
  if (A.size === 0 || B.size === 0) return false
  // Hiç ortak sayı yoksa ve ikisi de sayı içeriyorsa: aynı yuvada iki farklı ölçüm.
  for (const x of A) if (B.has(x)) return false
  return true
}
