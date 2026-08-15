// Eleme gerekçelerinin Türkçe karşılığı (§8.2 aşama 5 · §12).
//
// Gerekçe **kullanıcıya gösterilir** ve her biri farklı bir eylem yaptırır. Tek bir
// "uygun sağlayıcı bulunamadı" mesajı, çözülebilir bir sorunu (anahtar tanımlı değil)
// çözülemez bir sorundan (bu yeteneği kimse yapmıyor) ayırt edilemez kılar.

import type { RejectionReason } from './route.js'
import { displayUsd } from './rate.js'

export const rejectionMessage = (r: RejectionReason): string => {
  switch (r.kind) {
    case 'lane_mismatch':
      return `${r.wanted} şeridinde değil (desteklediği: ${r.has.join(', ') || 'hiçbiri'})`
    case 'unavailable':
      return `şu an kullanılamıyor — ${r.detail}`
    case 'constraint_unsupported':
      return `'${r.constraint}: ${String(r.wanted)}' desteklenmiyor (desteklediği: ${r.supported.map(String).join(', ') || 'liste boş'})`
    case 'no_pricing':
      return 'fiyat formülü yok — fiyatı bilinmeyen sağlayıcı aday olamaz'
    case 'formula_error':
      return `maliyet formülü hesaplanamadı (${r.detail})`
    case 'over_step_cap':
      return `adım tavanını aşıyor: ${displayUsd(r.cost)} > ${displayUsd(r.cap)}`
  }
}
