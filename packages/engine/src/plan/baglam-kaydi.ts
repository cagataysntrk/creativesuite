// Bağlam manifesti — **TEK yerde** kurulur (§5.3 · R-07 · R-13).
//
// ⚠ ⚠ **PANELDEN BAŞLATMANIN İKİNCİ KOPUK HALKASI.** Donmuş plan özeti `recordIds`i
// kapsıyor. `scripts/uret.mjs` tarife göre gerçek kayıtları çekip donduruyordu;
// sunucunun launcher'ı `recordIds: []` donduruyordu. İki özet asla eşleşmiyor ve
// R-07 kapısı — doğru biçimde — her koşuyu reddediyordu.
//
// Bu, bugün ölçülen ÜÇÜNCÜ aynı-sınıf hata: sağlayıcı ortamı (D-237), çalıştırma
// parametreleri (`kosuParametreleri`) ve bağlam kayıtları. Üçünde de iki çağıran
// aynı şeyi ayrı ayrı hesaplıyordu; üçünde de biri eksik hesaplıyordu.
//
// ⚠ Adaylar retrieval yükleminden gelir (`selectRecords`) — ikinci bir yol YOK (R-13).
// Dosyaları elle taramak, `draft` bir kaydı bağlama sokmak olurdu (R-14).

import { selectRecords, type SelectQuery } from '@suite/corpus'
import type { Db, ContextManifestEntry } from '@suite/kernel'
import { listRecipes, loadRecipe } from '@suite/registry'
import { assembleContext, toManifestEntries } from '../context/assemble.js'

export interface BaglamKaydiGirdisi {
  readonly db: Db
  readonly recipesDir: string
  /** Tarif id'si = hat id'si. Tarif yoksa bağlam BOŞ kalır ve bu dürüsttür. */
  readonly recipeId: string
  readonly query: SelectQuery
}

/** Bölüm başına aday havuzu. Yirmiden fazlası bütçeye zaten sığmıyor. */
const ADAY_TAVANI = 20

/**
 * Plana donacak bağlam satırları.
 *
 * Tarif yoksa **boş** döner: uydurma bir bağlam kaydı, olmayan bir denetim izidir.
 */
export const baglamKayitlari = (g: BaglamKaydiGirdisi): readonly ContextManifestEntry[] => {
  if (!listRecipes(g.recipesDir).includes(g.recipeId)) return []
  const tarif = loadRecipe(g.recipesDir, g.recipeId)
  if (!tarif.ok) return []

  const adaylar: Record<
    string,
    readonly { id: string; title: string; type: string; body: string }[]
  > = {}
  for (const b of tarif.value.sections) {
    adaylar[b.entityType] = selectRecords(g.db, {
      brandId: g.query.brandId,
      eraId: g.query.eraId,
      asOf: g.query.asOf,
      type: b.entityType,
      limit: ADAY_TAVANI,
    }).map((k) => ({
      id: k.id,
      title: k.title ?? k.id,
      type: k.type,
      body: k.body ?? '',
    }))
  }
  return toManifestEntries(assembleContext(tarif.value, adaylar))
}
