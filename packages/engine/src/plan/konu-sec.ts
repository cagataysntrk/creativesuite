// Konusuz üretim — konu UYDURULMAZ, markanın kendi kayıtlarından SEÇİLİR (R-13 · R-14).
//
// Depo sahibinin isteği: *"konuyu sistem seçsin diyince kutucuk boş gitsin, LLM
// içeriği zaten markayı bildiği için kendisi seçer."* İki okuma var ve ayrımı önemli:
//
//   · "konuyu ben yazmayayım" → doğru, insan yazmıyor.
//   · "konu hiç olmasın"      → mümkün değil: `SELECT` konusuz çalışamaz
//                                (`MISSING_TOPIC`) ve konusuz üretilen metin markadan
//                                değil modelin genel bilgisinden gelir.
//
// Çözüm: konu **hattın ilk adımında** seçiliyor. Adaylar corpus başlıkları — yani
// gerçek kayıtlar; model bir konu HAYAL ETMİYOR, aralarından SEÇİYOR ve gerekçe
// yazıyor. Geçmişte işlenmiş konular eleniyor (D-308'in konu tarafı: son üç koşunun
// üçü de aynı şablonu seçmişti ve konular kopyaydı).
//
// ⚠ Kaynaksız bir konu, kaynaksız bir iddianın başlangıcıdır (Yasa 8).

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { browseRecords, type SelectQuery } from '@suite/corpus'
import type { Db } from '@suite/kernel'
import { RUNS_DIR } from '@suite/kernel'

export interface KonuAdayGirdisi {
  readonly db: Db
  readonly query: SelectQuery
  readonly repoRoot: string
}

/** Prompt'a giren aday sayısı: hepsi girseydi seçim bir listeyi okumaya dönerdi. */
const ADAY_TAVANI = 12

/**
 * Geçmişte işlenmiş konular — manifestlerdeki `topic` parametreleri.
 *
 * ⚠ Dizin adına göre okunuyor (uuidv7 zaman sıralı); `mtime` bir dosyaya dokunulduğu
 * an sırayı bozardı.
 */
export const islenmisKonular = (repoRoot: string): ReadonlySet<string> => {
  const kok = join(repoRoot, RUNS_DIR)
  if (!existsSync(kok)) return new Set()
  const konular = new Set<string>()
  for (const ad of readdirSync(kok)) {
    const yol = join(kok, ad, 'manifest.json')
    if (!existsSync(yol)) continue
    try {
      const m = JSON.parse(readFileSync(yol, 'utf8')) as {
        steps?: readonly { params?: Record<string, unknown> }[]
      }
      for (const s of m.steps ?? []) {
        const t = s.params?.['topic']
        if (typeof t === 'string' && t.trim() !== '') konular.add(t)
      }
    } catch {
      // Bozuk manifest bir konuyu gizler, sonucu bozmaz: en kötü ihtimalle aynı konu
      // ikinci kez önerilir. Burada patlamak, tek bozuk dosyanın tüm üretimi
      // durdurması olurdu.
    }
  }
  return konular
}

/**
 * Aday konular — **indeksten**, dosya taramasından değil (R-13).
 *
 * Dosyaları taramak `draft` bir kaydı konu olarak önermek olurdu (R-14); indeks
 * retrieval yüklemini uygulayan tek yer.
 */
export const konuAdaylari = (g: KonuAdayGirdisi): readonly string[] => {
  const islenmis = islenmisKonular(g.repoRoot)
  const kayitlar = browseRecords(g.db, {
    brandId: g.query.brandId,
    eraId: g.query.eraId,
    asOf: g.query.asOf,
    type: '',
    status: '',
  }) as readonly { readonly title?: string }[]
  return [
    ...new Set(
      kayitlar
        .map((r) => r.title)
        .filter((t): t is string => typeof t === 'string' && t.trim() !== '')
        .filter((t) => !islenmis.has(t))
    ),
  ].slice(0, ADAY_TAVANI)
}

/**
 * Konu seçme istemi. Adaylar YOKSA `null` — ve `null` "atla" demek DEĞİL, çağıran
 * hattı durdurur: konusuz koşan bir hat, markadan gelmeyen bir metin üretir.
 */
export const konuSecPromptu = (g: {
  readonly adaylar: readonly string[]
  readonly islenmisSayisi: number
}): string | null => {
  if (g.adaylar.length === 0) return null
  return [
    'Bir Instagram karoseli için KONU seçeceksin.',
    '',
    'Aşağıdakiler markanın kendi kayıtlarının başlıkları. BİRİNİ seç — yeni bir konu',
    'UYDURMA, listede olmayan bir şey yazma.',
    '',
    ...g.adaylar.map((a, i) => `${String(i + 1)}. ${a}`),
    '',
    `Geçmişte ${String(g.islenmisSayisi)} konu işlendi ve onlar bu listede YOK.`,
    'Seçerken şunu sor: hangisi bugün en çok işe yarar ve hangisinden gerçekten',
    'gösterilecek bir şey çıkar?',
    '',
    'YALNIZ şu JSON ile cevapla, başka hiçbir şey yazma:',
    '{"konu": "<listeden birebir kopyala>", "gerekce": "<tek cümle, neden bu>"}',
  ].join('\n')
}

export interface KonuSecimi {
  readonly konu: string
  readonly gerekce: string
}

/**
 * Model çıktısını okur ve **adaylara karşı doğrular**.
 *
 * ⚠ Doğrulama şart: model listede olmayan bir konu yazarsa o konu bir KAYNAKTAN
 * gelmiyor demektir ve `SELECT` onunla hiçbir şey bulamaz. "Yakın olanı kabul et"
 * demek, sessizce uydurulmuş bir konuyla koşmaktır.
 */
export const konuSecimiCozumle = (ham: unknown, adaylar: readonly string[]): KonuSecimi | null => {
  const metin =
    typeof ham === 'string'
      ? ham
      : typeof (ham as { text?: unknown })?.text === 'string'
        ? (ham as { text: string }).text
        : JSON.stringify(ham ?? '')
  const eslesme = /\{[\s\S]*\}/.exec(metin)
  if (eslesme === null) return null
  let veri: unknown
  try {
    veri = JSON.parse(eslesme[0])
  } catch {
    return null
  }
  const o = veri as { konu?: unknown; gerekce?: unknown }
  if (typeof o.konu !== 'string') return null
  const konu = o.konu.trim()
  if (!adaylar.includes(konu)) return null
  return { konu, gerekce: typeof o.gerekce === 'string' ? o.gerekce.trim() : '' }
}
