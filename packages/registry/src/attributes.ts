// `attributes`ı AÇAN TEK DOSYA (§3.2 · R-01 · chokepoints.json → `attributes-acici`).
//
// `OpaqueAttributes` markası kernel'in `record.attributes`a dokunmasını DERLEME
// hatası yapar (§3.2). Ama veriye bir yerde erişilmesi gerekiyor — yoksa kullanıcının
// tanımladığı alanlar hiç kullanılamaz. O yer BURASI ve başka hiçbir yer değil.
//
// **Yasal yol:** `SELECT` kaydı corpus'tan çeker → `unsealAttributes` açar →
// `COMPOSE` (saf) belge modelini üretir → `RENDER` yalnız belge modelini görür,
// `RecordEnvelope`'ı asla.
//
// **Neden Ring 1'de, kernel'de değil:** kernel SABİTTİR ve bugünkü kayıt tipine kaynak
// olamaz (§3.1). Açma işlemi kullanıcının tanımladığı şemayı bilmek zorunda; o bilgi
// Ring 1'in işidir. Kernel açsaydı, şirket bir yıl sonra dönüştüğünde kernel de
// değişirdi ve "her şey veri, kod değil" tezi çökerdi.
//
// Bu dosya 2026-08-15'e kadar YOKTU: dört ayrı belge onu "tek yasal yol" diye
// gösteriyordu ama ne kodu ne darboğazı vardı. Bağımsız doğrulama agent'ı buldu (D-73).

import type { RecordEnvelope } from '@suite/contracts'

/** Açılmış attributes — artık okunabilir, ama hâlâ `unknown` değerli. */
export type UnsealedAttributes = Readonly<Record<string, unknown>>

/**
 * Zarfın kullanıcı bölgesini açar.
 *
 * Tek `as unknown as` cast'i burada yaşar ve **kasıtlıdır**: `OpaqueAttributes`
 * markası tam da bunu engellemek için var, bu dosya da tam da o engeli aşmaya
 * yetkili tek yer. Başka bir yerde aynı cast'i yazmak darboğaz ihlalidir.
 */
export const unsealAttributes = (record: RecordEnvelope): UnsealedAttributes => {
  const acik = record.attributes as unknown as Record<string, unknown>
  // Donduruluyor: açılan attributes OKUNUR, üzerine yazılmaz. Yazma tek noktadan
  // (`corpus/write.ts`) geçer ve oradan geçmeyen bir değişiklik onay kuyruğunu atlar (§5.4).
  return Object.freeze({ ...acik })
}

/**
 * Tek alan okur. Değer `unknown`; çağıran daraltmak ZORUNDA.
 * `as` ile daraltmak yerine tip koruyucu kullanılmalı — sessiz bir cast, şema
 * değiştiğinde çalışma zamanında patlar, derleme zamanında değil.
 */
export const attribute = (record: RecordEnvelope, key: string): unknown =>
  unsealAttributes(record)[key]
