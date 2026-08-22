// Defterdeki REFERANS biçimini gömülü byte'a çevirir (§7.1 · D-302).
//
// ⚠ ⚠ **DIŞA AKTARILAN SLAYTLARDA GÖRSELLER YOKTU.** Depo sahibi: *"görsel ögeler export
// olmuyor, sadece dosya adları ile export oluyor"*. Sebep tek satırdı: koşu defterindeki
// belge görseli `src: "gorsel-01.png"` diye taşıyor — bir DOSYA ADI, bir veri değil.
// Belge diskten okunup doğrudan render'a verildiğinde Chromium'un o adı çözecek bir
// taban adresi yok ve `<img>` boş kalıyor. Slayt çiziliyor, kesik özne yok.
//
// ⚠ **Defterin referans tutması DOĞRU** (D-302): 4 MB'lık base64'ü `git`e giren bir
// JSON'a gömmek `derived/runs`u okunamaz yapardı. Eksik olan, okuma tarafındaki çeviri.
//
// ⚠ ⚠ **BU ÇEVİRİ EDİTÖRDE ZATEN VARDI ve orada kalmıştı.** `duzenleyici.mjs` kendi
// `kosuBelgesi()` içinde aynı işi yapıyordu; sunucunun dışa aktarma yolu onu bilmiyordu.
// Aynı dönüşümün iki kopyası, bir gün birinin düzeltilip ötekinin unutulması demektir —
// bu depoda tam olarak böyle oldu. Artık TEK yer burası.

import { asciiLower } from '@suite/contracts'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

/** Uzantı → MIME. Kısa ve KAPALI: bilinmeyen uzantı PNG sayılmıyor, ATLANIYOR. */
const MIME: Readonly<Record<string, string>> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
}

/** Dosya adı GÜVENLİ mi — defter dizininin dışına çıkan bir ad okunmaz. */
const guvenliAd = (ad: string): boolean => /^[A-Za-z0-9._-]+$/.test(ad) && !ad.includes('..')

/**
 * Belgedeki görsel referanslarını `data:` URI'ye çevirir.
 *
 * ⚠ Zaten gömülü (`data:`) ya da boş olan `src` DOKUNULMADAN geçiyor: editörde
 * düzenlenmiş bir belge çoktan gömülüdür ve onu yeniden okumaya kalkmak, olmayan bir
 * dosyayı aramak olurdu.
 *
 * ⚠ Dosya YOKSA `src` BOŞ bırakılıyor, uydurma bir yer tutucu konmuyor: eksik olan şey
 * görünsün. Sessizce bir şey çizmek, "görsel üretildi" yanılgısı üretirdi.
 */
export const gorselleriGom = <T extends { readonly gorseller?: readonly unknown[] }>(
  doc: T,
  dizin: string
): T => {
  const gorseller = doc.gorseller
  if (!Array.isArray(gorseller) || gorseller.length === 0) return doc
  return {
    ...doc,
    gorseller: gorseller.map((g) => {
      if (g === null || typeof g !== 'object') return g
      const o = g as { src?: unknown }
      const src = typeof o.src === 'string' ? o.src : ''
      if (src === '' || src.startsWith('data:')) return g
      if (!guvenliAd(src)) return { ...o, src: '' }
      // ⚠ `asciiLower`: dosya UZANTISI Türkçe metin değil, bir protokol token'ıdır.
      // Türkçe kuralıyla küçültmek `.PNG` → `.pnğ` sınıfından hatalar üretir.
      const uzanti = asciiLower(src.split('.').pop() ?? '')
      const mime = MIME[uzanti]
      const yol = join(dizin, src)
      if (mime === undefined || !existsSync(yol)) return { ...o, src: '' }
      try {
        return { ...o, src: `data:${mime};base64,${readFileSync(yol).toString('base64')}` }
      } catch {
        return { ...o, src: '' }
      }
    }),
  }
}
