// Varyant genişletme — hattı N varyanta açan TEK yer (§10 · D-225 · D-240 · FAZ-8.1b).
//
// **Neden tek yer:** `plan()` maliyeti çarpanla gösteriyordu, `runPipeline` tek varyant
// koşuyordu. İki ayrı hesap, bir gün ayrışır — ve ayrıştığı gün kullanıcı yedi varyantın
// parasını onaylayıp bir varyant alır ya da tersi. Bu dosya ikisinin de okuduğu tek
// kaynak: plan ne sayıyorsa koşu onu koşar.
//
// ## Üç kova, üç farklı davranış
//
// **Paylaşılan önek** — ücretli hiçbir adıma bağlı OLMAYAN adımlar. `RESOLVE` tarifi
// çözer, `SELECT` bağlamı seçer; yedi varyant aynı bağlamı paylaşır. Bunları yedi kez
// koşmak yedi kez aynı sorguyu atmaktır ve seçimin varyanttan varyanta değişme riski
// doğurur — oysa OFAT'ın tek vaadi diğer her şeyin SABİT kalmasıdır.
//
// **Varyant gövdesi** — ücretli bir adıma (transitif olarak) bağlı olan her adım.
// Yalnız ücretli adımları çoğaltmak yetmez: `COMPOSE` saf ve ücretsizdir ama her
// varyantın KENDİ belge modeli olmak zorunda, yoksa yedi render aynı belgeyi basar.
// Ücretsiz adımı çoğaltmak maliyeti değiştirmiyor (sıfır × yedi = sıfır); ücretli
// adımı çoğaltmamak ise ölçümü yok ediyor.
//
// **Toplayıcı** — `PROPOSE`. Yedi varyantlık bir set TEK öneridir: yedi ayrı öneri,
// insan kuyruğunu yedi kez aynı kararla meşgul eder ve "hangisi kazandı" sorusunu
// sorulamaz kılar. Bu adım tüm varyant yapraklarına bağlanır.

import { VERBS, type VerbName } from '@suite/contracts'
import { getVerb } from '@suite/kernel'
import type { Pipeline, PipelineStep } from '@suite/registry'
import { varyantUret, type Varyant } from './matris.js'

/** Varyant kopyalarının id ayracı. `#` seçildi: adım id'lerinde geçemez (slug kuralı). */
export const VARYANT_AYRAC = '#'

export interface GenisletmeSonucu {
  readonly pipeline: Pipeline
  /** Genişletilmiş adım id'si → hangi ORİJİNAL adımdan geldiği. */
  readonly kaynak: ReadonlyMap<string, string>
  /** Genişletilmiş adım id'si → varyant koordinatı (`null` = paylaşılan/toplayıcı). */
  readonly koordinat: ReadonlyMap<string, Readonly<Record<string, string>> | null>
  /** Kaç varyant üretildi — matrissiz hatta 1. */
  readonly varyantSayisi: number
}

const VERB_SET: ReadonlySet<string> = new Set<string>(VERBS)

const ucretliMi = (s: PipelineStep): boolean =>
  VERB_SET.has(s.verb) && getVerb(s.verb as VerbName).metered

/**
 * Bir adım varyant gövdesinde mi — kendisi ücretli, ya da ücretli bir adıma bağlı.
 *
 * Transitif: `render` ücretli değilse bile `gorsel-uret`e bağlıysa varyant başına
 * koşmalı. Yalnız doğrudan bağımlılığa bakmak, zincirin ortasındaki ücretsiz bir adımı
 * paylaşılan sanmak olurdu — ve o adım yedi varyantın hepsine aynı çıktıyı verirdi.
 */
const varyantGovdesi = (steps: readonly PipelineStep[]): ReadonlySet<string> => {
  const byId = new Map(steps.map((s) => [s.id, s]))
  const govde = new Set<string>()
  const bakiliyor = new Set<string>()

  const bulasik = (id: string): boolean => {
    if (govde.has(id)) return true
    // Döngü koruması: `parsePipeline` döngüyü zaten reddediyor ama bu fonksiyon
    // çağıranın verdiği her hatta koşuyor ve sonsuz özyineleme bir kapı değil, bir kilit.
    if (bakiliyor.has(id)) return false
    bakiliyor.add(id)
    const s = byId.get(id)
    if (s === undefined) return false
    const sonuc = ucretliMi(s) || s.needs.some((n) => bulasik(n))
    if (sonuc) govde.add(id)
    return sonuc
  }

  for (const s of steps) bulasik(s.id)
  return govde
}

/** `PROPOSE` = çalışma ağacına yazan tek fiil; yedi varyant TEK öneriye toplanır. */
const toplayiciMi = (s: PipelineStep): boolean => s.verb === 'PROPOSE'

const varyantId = (id: string, i: number): string => `${id}${VARYANT_AYRAC}${i + 1}`

/**
 * Hattı varyantlara açar. Matrissiz hatta hiçbir şey değişmez — ve bu yol
 * **aynı nesneyi** döndürür ki genişletmenin çağrılmadığı ile boş genişletme
 * karıştırılmasın.
 */
export const varyantlaGenislet = (p: Pipeline): GenisletmeSonucu => {
  const kaynak = new Map<string, string>()
  const koordinat = new Map<string, Readonly<Record<string, string>> | null>()

  if (p.matris === null) {
    for (const s of p.steps) {
      kaynak.set(s.id, s.id)
      koordinat.set(s.id, null)
    }
    return { pipeline: p, kaynak, koordinat, varyantSayisi: 1 }
  }

  const varyantlar: readonly Varyant[] = varyantUret(p.matris.eksenler, p.matris.mod)
  if (varyantlar.length <= 1) {
    for (const s of p.steps) {
      kaynak.set(s.id, s.id)
      koordinat.set(s.id, null)
    }
    return { pipeline: p, kaynak, koordinat, varyantSayisi: varyantlar.length }
  }

  const govde = varyantGovdesi(p.steps)
  const toplayicilar = new Set(p.steps.filter(toplayiciMi).map((s) => s.id))
  // Toplayıcı, gövdede olsa bile çoğaltılmaz.
  const cogaltilan = new Set([...govde].filter((id) => !toplayicilar.has(id)))

  const yeni: PipelineStep[] = []

  for (const s of p.steps) {
    if (!cogaltilan.has(s.id)) continue
    for (const [i, v] of varyantlar.entries()) {
      const id = varyantId(s.id, i)
      kaynak.set(id, s.id)
      koordinat.set(id, v.koordinat)
      yeni.push({
        ...s,
        id,
        // **Koordinat kısıtlara giriyor** — gövdeler onu buradan okur. Ayrı bir
        // parametre kanalı açmak, kısıtların "adımın tüm girdisi" olma vaadini bozardı.
        constraints: { ...s.constraints, varyant: v.koordinat },
        needs: s.needs.map((n) => (cogaltilan.has(n) ? varyantId(n, i) : n)),
      })
    }
  }

  for (const s of p.steps) {
    if (cogaltilan.has(s.id)) continue
    kaynak.set(s.id, s.id)
    koordinat.set(s.id, null)
    yeni.push({
      ...s,
      // Toplayıcı ve paylaşılan adımlar: çoğaltılmış bir bağımlılık TÜM kopyalara
      // dönüşür. Yalnız ilkine bağlamak, diğer altı varyantı sessizce atlanabilir
      // kılardı — ve atlanan bir varyant, ölçülmemiş bir eksendir.
      needs: s.needs.flatMap((n) =>
        cogaltilan.has(n) ? varyantlar.map((_, i) => varyantId(n, i)) : [n]
      ),
    })
  }

  return {
    pipeline: { ...p, steps: yeni },
    kaynak,
    koordinat,
    varyantSayisi: varyantlar.length,
  }
}

/**
 * Orijinal adım id'si → kaç kez koşacağı. `plan()` bunu ekranda gösteriyor.
 *
 * Sayım **genişletmenin kendisinden** türetiliyor, ayrı bir formülden değil: iki hesap
 * bir gün ayrışır ve o gün plan ile koşu farklı şeyler söyler.
 */
export const kosumSayilari = (g: GenisletmeSonucu): ReadonlyMap<string, number> => {
  const sayac = new Map<string, number>()
  for (const orijinal of g.kaynak.values()) {
    sayac.set(orijinal, (sayac.get(orijinal) ?? 0) + 1)
  }
  return sayac
}
