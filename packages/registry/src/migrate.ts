// Şema göç analizi — kaydetmeden ÖNCE kaç kayıt kırılacak (§3.3, §12.9 · FAZ-4.11).
//
// **"Şema veri, kod değil" (D-11) bir özgürlük değil, bir sorumluluktur.** Kullanıcı
// çalışma anında bir alanı zorunlu yapabiliyorsa, o alanı taşımayan her kaydı geçersiz
// kılabiliyor demektir — ve bunu SAYIYLA öğrenmeden yapmamalı.
//
// Editörün "kaydet" düğmesi bu modülün cevabına bağlıdır: `refusals` boş değilse kaydetme
// yapılamaz. Uyarı verip devam etmek, kullanıcının 40 kaydını sessizce geçersiz kılmaktır
// ve bunu ancak bir sonraki çalıştırma "kayıt bulunamadı" dediğinde fark eder.
//
// **Alan SİLİNMEZ, emekliye ayrılır** (`x-retired: true`). Tarihsel kayıtlar o alanı
// taşımaya devam eder ve okunabilir kalır; silinen bir alan, eski kayıtları okuyan her
// aracı "bilinmeyen alan" hatasına düşürür. Emeklilik silme değildir — R-12'nin şema
// seviyesindeki karşılığı.

import type { EntityTypeSchema, SchemaNode } from '@suite/kernel'

/**
 * Göç edilecek kayıt: id + **AÇILMIŞ** alanlar. Zarf alanları göçe girmez (D-41).
 *
 * ⚠ Alan adı bilerek `attributes` DEĞİL. Bu, mühürlü zarf alanı (`OpaqueAttributes`)
 * değil, çağıranın açıp verdiği düz veridir — aynı adı taşımak iki farklı şeyi
 * karıştırmak olurdu ve `attributes-acici` darboğazı (R-01) haklı olarak buna takıldı.
 * Mühürlü veriyi açan tek yer `attributes.ts`tir; burası yalnız açılmışı sayar.
 */
export interface MigrationRecord {
  readonly id: string
  readonly alanlar: Readonly<Record<string, unknown>>
}

export type SchemaChange =
  /** Güvenli: eski kayıtlar alanı taşımasa da geçerli kalır. */
  | { readonly kind: 'field_added_optional'; readonly field: string }
  /** Güvenli: alan duruyor, yalnız artık kullanılmıyor. */
  | { readonly kind: 'field_retired'; readonly field: string }
  /** Riskli: alanı taşımayan her kayıt geçersiz olur. */
  | { readonly kind: 'field_added_required'; readonly field: string }
  /** Riskli: değeri yeni tipe uymayan her kayıt geçersiz olur. */
  | {
      readonly kind: 'field_type_changed'
      readonly field: string
      readonly from: string
      readonly to: string
    }
  /** Riskli: kaldırılan enum değerini taşıyan kayıtlar geçersiz olur. */
  | { readonly kind: 'enum_narrowed'; readonly field: string; readonly removed: readonly string[] }
  /** YIKICI: tarihsel kayıt okunamaz hâle gelir. */
  | { readonly kind: 'field_removed'; readonly field: string }

export interface BrokenRecord {
  readonly recordId: string
  readonly field: string
  readonly reason: string
}

export interface Refusal {
  readonly change: SchemaChange
  readonly reason: string
  /** Ne yapılmalı — reddetmek yetmez, yolu göstermek gerekir. */
  readonly suggestion: string
}

export interface MigrationImpact {
  readonly changes: readonly SchemaChange[]
  readonly broken: readonly BrokenRecord[]
  readonly refusals: readonly Refusal[]
  /** Taranan kayıt sayısı — `broken: 0` ile "hiç kayıt yok" AYRI sonuçlar. */
  readonly scanned: number
  /** Kaydedilebilir mi. `refusals` boşsa VE kırılan kayıt yoksa. */
  readonly safe: boolean
}

const props = (s: EntityTypeSchema): Readonly<Record<string, SchemaNode>> => s.properties ?? {}
const req = (s: EntityTypeSchema): ReadonlySet<string> => new Set(s.required ?? [])

/** İki şema arasındaki farkları çıkarır. Sıra deterministik: alan adına göre. */
export const diffSchemas = (
  eski: EntityTypeSchema,
  yeni: EntityTypeSchema
): readonly SchemaChange[] => {
  const e = props(eski)
  const y = props(yeni)
  const eskiReq = req(eski)
  const yeniReq = req(yeni)
  const changes: SchemaChange[] = []

  for (const alan of Object.keys(y).sort()) {
    const yn = y[alan]
    const en = e[alan]
    if (yn === undefined) continue

    if (en === undefined) {
      changes.push(
        yeniReq.has(alan)
          ? { kind: 'field_added_required', field: alan }
          : { kind: 'field_added_optional', field: alan }
      )
      continue
    }

    // Emeklilik ÖNCE bakılır: emekli bir alanın tipi değişse de kimse okumaz.
    if (yn['x-retired'] === true && en['x-retired'] !== true) {
      changes.push({ kind: 'field_retired', field: alan })
      continue
    }

    if (en.type !== yn.type) {
      changes.push({ kind: 'field_type_changed', field: alan, from: en.type, to: yn.type })
    }

    if (!eskiReq.has(alan) && yeniReq.has(alan)) {
      changes.push({ kind: 'field_added_required', field: alan })
    }

    const eskiEnum = en.enum
    const yeniEnum = yn.enum
    if (eskiEnum !== undefined && yeniEnum !== undefined) {
      const kalan = new Set(yeniEnum.map(String))
      const kaldirilan = eskiEnum.map(String).filter((v) => !kalan.has(v))
      if (kaldirilan.length > 0) {
        changes.push({ kind: 'enum_narrowed', field: alan, removed: kaldirilan })
      }
    }
  }

  for (const alan of Object.keys(e).sort()) {
    if (!(alan in y)) changes.push({ kind: 'field_removed', field: alan })
  }

  return changes
}

const tipUyar = (v: unknown, t: string): boolean => {
  if (t === 'string') return typeof v === 'string'
  if (t === 'number') return typeof v === 'number'
  if (t === 'integer') return typeof v === 'number' && Number.isInteger(v)
  if (t === 'boolean') return typeof v === 'boolean'
  if (t === 'array') return Array.isArray(v)
  if (t === 'object') return v !== null && typeof v === 'object' && !Array.isArray(v)
  return false
}

/**
 * Değişikliklerin gerçek corpus'a etkisi — **tahmin değil, sayım**.
 *
 * Her kırılan kayıt id'siyle listelenir: "12 kayıt kırılacak" bir uyarıdır, "şu 12 kayıt"
 * bir iş listesidir. Kullanıcı hangilerini düzelteceğini bilmeden karar veremez.
 */
export const migrationImpact = (
  changes: readonly SchemaChange[],
  kayitlar: readonly MigrationRecord[]
): MigrationImpact => {
  const broken: BrokenRecord[] = []
  const refusals: Refusal[] = []

  for (const c of changes) {
    switch (c.kind) {
      case 'field_removed':
        // Sayıdan bağımsız REDDEDİLİR: sıfır kayıt etkilense bile, alanı silmek
        // gelecekte yazılacak tarihsel okuyucuları da kırar (§3.3).
        refusals.push({
          change: c,
          reason: `'${c.field}' alanı SİLİNİYOR — tarihsel kayıtlar okunamaz hâle gelir`,
          suggestion: `alanı silmek yerine \`x-retired: true\` işaretleyin: kayıtlar okunabilir kalır, form ve LLM şeması onu artık sormaz`,
        })
        break

      case 'field_added_required':
        for (const k of kayitlar) {
          if (k.alanlar[c.field] === undefined) {
            broken.push({
              recordId: k.id,
              field: c.field,
              reason: `zorunlu oldu ama kayıtta yok`,
            })
          }
        }
        break

      case 'field_type_changed':
        for (const k of kayitlar) {
          const v = k.alanlar[c.field]
          if (v !== undefined && !tipUyar(v, c.to)) {
            broken.push({
              recordId: k.id,
              field: c.field,
              reason: `tip ${c.from} → ${c.to}, mevcut değer uymuyor`,
            })
          }
        }
        break

      case 'enum_narrowed': {
        const kaldirilan = new Set(c.removed)
        for (const k of kayitlar) {
          const v = k.alanlar[c.field]
          if (typeof v === 'string' && kaldirilan.has(v)) {
            broken.push({
              recordId: k.id,
              field: c.field,
              reason: `'${v}' değeri artık geçerli değil`,
            })
          }
        }
        break
      }

      case 'field_added_optional':
      case 'field_retired':
        // Güvenli: eski kayıtlar geçerli kalır.
        break
    }
  }

  return {
    changes,
    broken,
    refusals,
    scanned: kayitlar.length,
    safe: refusals.length === 0 && broken.length === 0,
  }
}

/** İnsan okunur özet — editör bunu doğrudan gösterir. */
export const impactMessage = (i: MigrationImpact): string => {
  if (i.refusals.length > 0) {
    return `✗ ${i.refusals.length} yıkıcı değişiklik — kaydetme REDDEDİLDİ`
  }
  if (i.broken.length > 0) {
    const kayit = new Set(i.broken.map((b) => b.recordId)).size
    return `✗ ${kayit} kayıt kırılacak (${i.scanned} tarandı) — codemod'suz kaydedilemez`
  }
  if (i.changes.length === 0) return `değişiklik yok (${i.scanned} kayıt tarandı)`
  return `✓ ${i.changes.length} değişiklik güvenli · ${i.scanned} kayıt tarandı, hiçbiri kırılmıyor`
}
