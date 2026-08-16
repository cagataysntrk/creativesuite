// KVKK silme talebi — emeklilikten AYRI yol (§5.1 · R-12 · FAZ-6.4).
//
// **İki farklı "kaldır" var ve karıştırılırsa biri mutlaka kaybolur:**
//
// | Yol | Ne yapar | Neden |
// |---|---|---|
// | `retireRecord` | `status: retired`, dosya kalır | eski varlıkların kökeni korunur (R-12) |
// | `kvkkErasure`  | kişisel alanları SİLER, mezar taşı bırakır | yasal yükümlülük |
//
// **Dosya silinmiyor, kişisel veri siliniyor.** Düz `unlink` iki şeyi birden bozardı:
// (1) o kaydı kaynak gösteren varlıkların kökeni kopar ve altı ay sonra bir deck'teki
// iddia kaynaksız kalır (2) silmenin YAPILDIĞINA dair hiçbir kanıt kalmaz — ve KVKK'da
// yükümlülüğü yerine getirdiğini gösteremiyorsan getirmemişsindir.
//
// Mezar taşı, kişisel veri taşımayan bir kayıttır: id, tip, marka, dönem, silme tarihi
// ve gerekçe. Şirketin ticaret unvanı bile silinir — talep şirketten geldiyse unvan da
// talebin konusudur; kalması gereken tek şey "burada bir kayıt vardı ve silindi"dir.
//
// **Bu modül dosya silmez.** Corpus'a yazan tek yol `write.ts`tir (`corpus-yazici`
// darboğazı) ve burası onu çağırır; `corpus-silici` darboğazı `izinli: []` ile
// `packages/corpus/` altında her `unlink`/`rm` çağrısını yasaklıyor.

import { existsSync, readFileSync } from 'node:fs'
import { parseFrontmatter } from './frontmatter.js'
import { recordPath, writeRecord } from './write.js'

/**
 * Silinecek alanlar.
 *
 * Liste **beyaz değil kara** listedir ve bu bilinçli: yeni bir kişisel veri alanı
 * eklendiğinde beyaz liste onu sessizce KORURDU. Kara listede unutulan alan, en
 * azından `prospect-kvkk` kapısında görünür.
 */
export const KISISEL_ALANLAR: readonly string[] = [
  'legal_name',
  'trade_name',
  'website',
  'city',
  'sector',
  'contact_role',
  'contact_name',
  'contact_email',
  'notes',
  'stage_reason',
  'source_url',
  'title',
]

/** Mezar taşının gövdesi. Kişisel veri taşımaz ve taşımamalıdır. */
export const MEZAR_TASI_GOVDE =
  'Bu kaydın içeriği KVKK silme talebi üzerine silindi. ' +
  'Kayıt kimliği, kökeni izleyen varlıklar için korunuyor; kişisel veri içermiyor.'

export type ErasureRefusal =
  | { readonly kind: 'not_found'; readonly path: string }
  | { readonly kind: 'unreadable'; readonly path: string }
  | { readonly kind: 'already_erased'; readonly path: string }
  /** Gerekçesiz silme, denetlenemeyen silmedir — yükümlülüğü gösteremezsin. */
  | { readonly kind: 'missing_reason' }

export type ErasureResult =
  | {
      readonly ok: true
      readonly path: string
      readonly frontmatter: Record<string, unknown>
      /** Gerçekten silinen alan adları — "0 alan silindi" bir uyarıdır, başarı değil. */
      readonly erasedFields: readonly string[]
    }
  | { readonly ok: false; readonly refusal: ErasureRefusal }

export interface ErasureInput {
  readonly root: string
  readonly entityType: string
  readonly slug: string
  /** ISO 8601 — çağıran verir. Bu modül saat OKUMAZ (R-06). */
  readonly at: string
  /** Talebin gerekçesi. Boş olamaz. */
  readonly reason: string
  /** Talebi kimin ilettiği (kişi adı DEĞİL: "ilgili kişi", "veri sorumlusu"). */
  readonly requestedBy: string
}

/**
 * KVKK silme talebini uygular.
 *
 * **`actor: 'human'`** — silme bir karardır ve agent karar veremez (R-14). Bir agent'ın
 * kişisel veri silebilmesi, bir agent'ın kişisel veri silmeyi UNUTABİLMESİ demektir.
 */
export const kvkkErasure = (input: ErasureInput): ErasureResult => {
  if (input.reason.trim() === '') return { ok: false, refusal: { kind: 'missing_reason' } }

  const path = recordPath(input.root, input.entityType, input.slug)
  if (!existsSync(path)) return { ok: false, refusal: { kind: 'not_found', path } }

  const p = parseFrontmatter(readFileSync(path, 'utf8'))
  if (!p.ok || p.value.frontmatter === null) {
    return { ok: false, refusal: { kind: 'unreadable', path } }
  }
  const fm = p.value.frontmatter
  if (fm['kvkk_erased_at'] !== undefined) {
    return { ok: false, refusal: { kind: 'already_erased', path } }
  }

  const silinen: string[] = []
  const yeni: Record<string, unknown> = { ...fm }
  for (const alan of KISISEL_ALANLAR) {
    if (yeni[alan] !== undefined) {
      delete yeni[alan]
      silinen.push(alan)
    }
  }

  // Emeklilik alanları da yazılıyor: silinmiş bir kayıt aynı zamanda geçersizdir ve
  // retrieval onu `expired_at` üzerinden zaten dışarıda bırakır (§5.2). İkisini ayrı
  // adımlara bölmek, arada bir çalıştırmanın silinmiş kaydı çekmesine izin verirdi.
  yeni['status'] = 'retired'
  yeni['expired_at'] = input.at
  yeni['kvkk_erased_at'] = input.at
  yeni['kvkk_erasure_reason'] = input.reason
  yeni['kvkk_requested_by'] = input.requestedBy
  // İmza artık geçersiz: içerik kasten değişti. Bırakılsaydı `x_signature` kontrolü
  // "elle düzenlenmiş" diye çalıştırmayı durdururdu (§4.6) — oysa bu meşru bir silme.
  delete yeni['x_signature']

  const w = writeRecord({
    root: input.root,
    entityType: input.entityType,
    slug: input.slug,
    frontmatter: yeni,
    body: MEZAR_TASI_GOVDE,
    actor: 'human',
  })
  return w.ok
    ? { ok: true, path: w.path, frontmatter: yeni, erasedFields: silinen }
    : { ok: false, refusal: { kind: 'unreadable', path } }
}

/** İnsan okunur ret açıklaması — UI bunu doğrudan gösterir. */
export const erasureMessage = (r: ErasureRefusal): string => {
  switch (r.kind) {
    case 'not_found':
      return `kayıt yok: ${r.path}`
    case 'unreadable':
      return `kayıt okunamadı (frontmatter bozuk): ${r.path}`
    case 'already_erased':
      return 'kayıt zaten KVKK silmesinden geçmiş — ikinci kez silinecek kişisel veri yok'
    case 'missing_reason':
      return 'gerekçe zorunlu: gerekçesiz silme denetlenemez, yükümlülüğü gösteremezsin'
  }
}
