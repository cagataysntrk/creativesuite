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
const ADAY_TAVANI = 18

/**
 * TÜR başına tavan — çeşitliliğin tek gerçek garantisi.
 *
 * ⚠ ⚠ İlk sürüm başlıkları sırayla alıyordu ve corpus'ta hangi tür önce
 * indekslendiyse aday listesi ondan doluyordu: her öneri "Excel ve vardiya defteri"
 * çıkıyordu. Depo sahibi bunu ilk denemede yakaladı. Bir listenin ilk N elemanı
 * "en iyi N" değildir; yalnız "ilk N"dir.
 */
const TUR_BASINA = 4

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
export interface KonuAdayi {
  readonly baslik: string
  /** Kayıt türü — ürün mü, strateji mi, kanıt mı; seçimin anlamı buna bağlı. */
  readonly tur: string
}

export const konuAdaylari = (g: KonuAdayGirdisi): readonly KonuAdayi[] => {
  const islenmis = islenmisKonular(g.repoRoot)
  const kayitlar = browseRecords(g.db, {
    brandId: g.query.brandId,
    eraId: g.query.eraId,
    asOf: g.query.asOf,
    type: '',
    status: '',
  }) as readonly { readonly title?: string; readonly type?: string }[]

  const turBasina = new Map<string, KonuAdayi[]>()
  const gorulen = new Set<string>()
  for (const k of kayitlar) {
    const baslik = k.title
    if (typeof baslik !== 'string' || baslik.trim() === '') continue
    if (islenmis.has(baslik) || gorulen.has(baslik)) continue
    const tur = typeof k.type === 'string' && k.type !== '' ? k.type : 'kayıt'
    const kova = turBasina.get(tur) ?? []
    if (kova.length >= TUR_BASINA) continue
    gorulen.add(baslik)
    kova.push({ baslik, tur })
    turBasina.set(tur, kova)
  }

  // Türler arasında SIRAYLA geziliyor: tek türün kovası listenin başını yemesin.
  const siralar = [...turBasina.values()]
  const sonuc: KonuAdayi[] = []
  for (let i = 0; i < TUR_BASINA; i++) {
    for (const kova of siralar) {
      const a = kova[i]
      if (a !== undefined) sonuc.push(a)
    }
  }
  return sonuc.slice(0, ADAY_TAVANI)
}

/**
 * Konu seçme istemi. Adaylar YOKSA `null` — ve `null` "atla" demek DEĞİL, çağıran
 * hattı durdurur: konusuz koşan bir hat, markadan gelmeyen bir metin üretir.
 */
export const konuSecPromptu = (g: {
  readonly adaylar: readonly KonuAdayi[]
  readonly islenmisSayisi: number
}): string | null => {
  if (g.adaylar.length === 0) return null
  return [
    'Bir Instagram karoseli için KONU seçeceksin.',
    '',
    'Aşağıdakiler markanın KENDİ kayıtlarının başlıkları — ürünler, strateji notları,',
    'kanıtlar. BİRİNİ seç: yeni bir konu UYDURMA, listede olmayan bir şey yazma.',
    '',
    ...g.adaylar.map((a, i) => `${String(i + 1)}. [${a.tur}] ${a.baslik}`),
    '',
    `Geçmişte ${String(g.islenmisSayisi)} konu işlendi ve onlar bu listede YOK.`,
    'Seçerken sırayla şunu sor:',
    '  · bundan gösterilecek somut bir şey çıkar mı, yoksa yalnız laf mı olur?',
    '  · marka bunu söylemeye yetkili mi — elinde kaydı var mı?',
    '  · bugünün gündemine bu liste içinde en yakın duran hangisi?',
    '',
    'YALNIZ şu JSON ile cevapla, başka hiçbir şey yazma:',
    '{"konu": "<listeden başlığı birebir kopyala>", "gerekce": "<tek cümle, neden bu>"}',
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
 *
 * ⚠ ⚠ **GİRDİ DÜZ METİN — sağlayıcı çıktısını burada ÇÖZMÜYORUZ.** İlk sürüm kendi
 * şekil tahminini yapıyordu (`.text`, sonra `JSON.stringify`) ve gerçek koşuda
 * `TOPIC_NOT_IN_CANDIDATES` ile düştü: claude-code çıktısı `{result: "..."}` şeklinde
 * geliyor. Sağlayıcı yanıt şekli TEK geçitten okunur (`metneCevir`/`duzMetin`);
 * ikinci bir çözücü, ikinci bir şekil varsayımı demektir (D-227).
 */
export const konuSecimiCozumle = (
  metin: string,
  adaylar: readonly (string | KonuAdayi)[]
): KonuSecimi | null => {
  const basliklar = adaylar.map((a) => (typeof a === 'string' ? a : a.baslik))
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
  if (!basliklar.includes(konu)) return null
  return { konu, gerekce: typeof o.gerekce === 'string' ? o.gerekce.trim() : '' }
}
