// HEDEF: apps/server/src/kosu-sablonu.ts
//
// Bir koşunun HANGİ ŞABLONDAN üretildiğinin **tek** cevabı (FAZ-19.12).
//
// ⚠ ⚠ **BU DOSYA BİR YANLIŞ RAPORDAN DOĞDU.** Kuyruk şablon adını
// `kosu-parametreleri.json`daki `sablon` alanından okuyordu. O alan yalnız panel ya da
// CLI onu YAZDIYSA dolu; sistem şablonu kendi seçtiğinde (kısıt olarak yalnız
// *"şunları kullanma"* verildiğinde) alan BOŞ kalıyor. Sonuç: bir koşu devir belgesinde
// `veri-hikayesi` diye listelendi, adım çıktısı okununca `sahne` olduğu görüldü — yani
// on üretimde `veri-hikayesi` HİÇ yoktu ve `sahne` iki kez vardı. Etiket bir şey
// bağlamayınca sessizce kaydı.
//
// ⚠ ⚠ **TEK OKUYUCU DEĞİL, İKİ OKUYUCU VAR: kuyruk ve kütüphane.** Aynı soruyu iki
// yerde ayrı ayrı cevaplamak, bu depoda tekrar eden sınıf — biri düzelir, öteki
// unutulur. O yüzden cevap burada bir kez veriliyor.
//
// ⚠ Niyet ile gerçek AYRI iki şey ve ikisi de taşınıyor: `istenen` insanın ne
// istediğini, `gercek` hattın ne ürettiğini söylüyor. İkisi ayrışıyorsa bunu görmek
// bir kusurdur — gizlemek değil.

import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { RUNS_DIR } from '@suite/kernel'

export interface KosuSablonu {
  /** Hattın GERÇEKTE uyguladığı şablon — `sablon-uyarla` adımının kendi çıktısı. */
  readonly gercek: string | null
  /** İnsanın ya da panelin İSTEDİĞİ şablon; sistem seçtiyse `null`. */
  readonly istenen: string | null
  /** Koşu konusu. */
  readonly konu: string | null
}

const oku = (yol: string): unknown => {
  if (!existsSync(yol)) return null
  try {
    return JSON.parse(readFileSync(yol, 'utf8'))
  } catch {
    return null
  }
}

const dize = (v: unknown): string | null => (typeof v === 'string' && v.trim() !== '' ? v : null)

/**
 * Koşunun şablonu — **gerçek** ve **istenen** ayrı ayrı.
 *
 * ⚠ Adım çıktısı yoksa `gercek` `null` döner ve bu DÜRÜST: koşu `sablon-uyarla`ya
 * varmadan düştüyse ortada uygulanmış bir şablon yoktur. Boş dize döndürmek "şablonsuz
 * üretildi" derdi; `null` "bilinmiyor" diyor.
 */
export const kosuSablonu = (repoRoot: string, runId: string): KosuSablonu => {
  const dizin = join(repoRoot, RUNS_DIR, runId)
  const adim = oku(join(dizin, 'steps/sablon-uyarla.json')) as {
    uyarlama?: { sablonId?: unknown }
  } | null
  const par = oku(join(dizin, 'kosu-parametreleri.json')) as Record<string, unknown> | null
  return {
    gercek: dize(adim?.uyarlama?.sablonId),
    istenen: dize(par?.['sablon']),
    konu: dize(par?.['topic']),
  }
}
