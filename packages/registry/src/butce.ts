// Bütçe tavanları — Ring 1, kullanıcının alanı (§8.3 · D-17 · FAZ-4.12).
//
// **Tavan koda gömülmez, ortam değişkenine de saklanmaz.** `SUITE_RUN_CAP` bir env
// değişkeniydi: UI'dan değiştirilemez, git'te görünmez, iki makinede farklı olabilir ve
// "hangi tavanla koştu" sorusu cevapsız kalır. Tavan bir KARARDIR ve kararlar Ring 1'de,
// git'te yaşar (D-11).
//
// **`null` ile `0` KARIŞTIRILMAZ:** `null` = tavan yok, `0` = hiç harcama yapma.
// İkincisi meşru bir tercih (gözetimsiz bir gecede her şeyi kilitlemek) ve sessizce
// "tavansız"a çevrilirse tam ters etki yapar.

import { parseYaml } from '@suite/kernel'
import type { Money } from '@suite/contracts'

export interface ButceTavanlari {
  /** Tek çalıştırma tavanı, USD mikro. `null` = tavan yok. */
  readonly perRunMicros: bigint | null
  /** Aylık tavan. `null` = tavan yok. */
  readonly perMonthMicros: bigint | null
  /** Kim ne zaman değiştirdi — tavan bir karardır ve kararın tarihi olur. */
  readonly updatedAt: string
}

export type ButceHatasi =
  | { readonly kind: 'bozuk_yaml'; readonly message: string }
  | { readonly kind: 'negatif'; readonly field: string }
  | { readonly kind: 'sayi_degil'; readonly field: string }
  /** Çalıştırma tavanı aylıktan büyükse ikisinden biri anlamsız. */
  | { readonly kind: 'celiskili'; readonly perRun: string; readonly perMonth: string }

export type ButceSonuc =
  | { readonly ok: true; readonly value: ButceTavanlari }
  | { readonly ok: false; readonly errors: readonly ButceHatasi[] }

/** Dosya yoksa kullanılan tavan. **Tavansız DEĞİL** — gözetimsiz bir gece için düşük. */
export const VARSAYILAN: ButceTavanlari = {
  perRunMicros: 100_000n, // $0.10
  perMonthMicros: 5_000_000n, // $5.00
  updatedAt: '',
}

const sayiOku = (v: unknown, alan: string, errors: ButceHatasi[]): bigint | null | undefined => {
  if (v === null || v === undefined) return null
  if (typeof v === 'number' && Number.isInteger(v) && v >= 0) return BigInt(v)
  if (typeof v === 'string' && /^\d+$/.test(v)) return BigInt(v)
  if (typeof v === 'number' && v < 0) {
    errors.push({ kind: 'negatif', field: alan })
    return undefined
  }
  errors.push({ kind: 'sayi_degil', field: alan })
  return undefined
}

export const parseButce = (yaml: string): ButceSonuc => {
  const r = parseYaml(yaml)
  if (!r.ok) return { ok: false, errors: [{ kind: 'bozuk_yaml', message: r.message }] }

  const d = (r.value ?? {}) as Record<string, unknown>
  const errors: ButceHatasi[] = []
  const perRun = sayiOku(d['per_run_micros'], 'per_run_micros', errors)
  const perMonth = sayiOku(d['per_month_micros'], 'per_month_micros', errors)
  if (errors.length > 0) return { ok: false, errors }

  if (perRun !== undefined && perRun !== null && perMonth !== undefined && perMonth !== null) {
    if (perRun > perMonth) {
      errors.push({
        kind: 'celiskili',
        perRun: perRun.toString(),
        perMonth: perMonth.toString(),
      })
      return { ok: false, errors }
    }
  }

  return {
    ok: true,
    value: {
      perRunMicros: perRun ?? null,
      perMonthMicros: perMonth ?? null,
      updatedAt: typeof d['updated_at'] === 'string' ? d['updated_at'] : '',
    },
  }
}

/** YAML'a çevirir. Yorumlar KORUNMAZ — dosya üretilir, elle düzenleme de meşrudur. */
export const serializeButce = (b: ButceTavanlari): string =>
  [
    "# Bütçe tavanları (§8.3 · D-17). UI'dan düzenlenir, git'te yaşar.",
    '#',
    '# `null` = tavan yok · `0` = hiç harcama yapma. İkisi AYRI şeylerdir.',
    '# Birim: USD mikro (1_000_000 = $1.00). Float yok (R-41).',
    `per_run_micros: ${b.perRunMicros === null ? 'null' : b.perRunMicros.toString()}`,
    `per_month_micros: ${b.perMonthMicros === null ? 'null' : b.perMonthMicros.toString()}`,
    `updated_at: ${b.updatedAt === '' ? 'null' : b.updatedAt}`,
    '',
  ].join('\n')

/** Motorun beklediği biçim. `Money` USD mikro bigint (R-41). */
export const toBudgetCaps = (
  b: ButceTavanlari
): { readonly perRun: Money | null; readonly perMonth: Money | null } => ({
  perRun: b.perRunMicros === null ? null : { micros: b.perRunMicros, currency: 'USD' },
  perMonth: b.perMonthMicros === null ? null : { micros: b.perMonthMicros, currency: 'USD' },
})

export const butceHatasiMesaji = (e: ButceHatasi): string => {
  switch (e.kind) {
    case 'bozuk_yaml':
      return `bütçe dosyası okunamadı: ${e.message}`
    case 'negatif':
      return `${e.field} negatif olamaz — tavan bir sınırdır, bir borç değil`
    case 'sayi_degil':
      return `${e.field} tam sayı (USD mikro) ya da null olmalı`
    case 'celiskili':
      return `çalıştırma tavanı (${e.perRun}) aylık tavandan (${e.perMonth}) büyük — ikisinden biri anlamsız`
  }
}
