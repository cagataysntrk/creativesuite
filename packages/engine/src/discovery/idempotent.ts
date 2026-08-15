// İdempotent atlama imzası (§4.4 · D-6).
//
// **Zorunlu altyapı, optimizasyon DEĞİL.** İmza olmadan LLM her koşuda değişmemiş metni
// yeniden yazar, ikinci çalıştırma 900 op üretir, insan hepsini kabul eder ve
// "insan inceledi" güvencesi sahte olur. Yani bu dosya, yönetişimin tiyatroya
// dönmemesinin tek mekanik sebebi.
//
// İmza ALTI girdiden hesaplanır (§4.4). Biri bile eksik olsaydı:
//   - `inputHashes` yok  → kaynak değişince eski çıktı taze sanılır
//   - `promptHash` yok   → prompt düzeltmesi hiçbir şeyi tazelemez
//   - `modelId` yok      → sağlayıcı değişimi görünmez, çıktı sessizce başkalaşır
//   - `temperature` yok  → aynı prompt farklı dağılımla koşar, fark açıklanamaz
//   - `seed` yok         → deterministik yeniden üretim iddiası çöker
//   - `retrievalSnapshot` yok → corpus değişince bağlam değişir ama imza aynı kalır

import { createHash } from 'node:crypto'

export interface SkipSignatureInput {
  /** Girdi dosyalarının içerik özetleri — SIRALI, çünkü sıra değişimi anlam değişimi değildir. */
  readonly inputHashes: readonly string[]
  readonly promptHash: string
  readonly modelId: string
  readonly temperature: number
  readonly seed: number
  /** Retrieval sonucunun özeti: hangi kayıtlar hangi sırayla geldi (§5.2). */
  readonly retrievalSnapshot: string
}

/**
 * Deterministik imza. Aynı girdi → aynı dize, her makinede, her koşuda.
 *
 * `JSON.stringify` KULLANILMIYOR: anahtar sırası nesne oluşturma sırasına bağlıdır ve
 * iki eşdeğer nesne farklı dize üretebilir — imza o gün sessizce her şeyi "değişti"
 * gösterir ve atlama mekanizması ölür. Alanlar SABİT sırayla, açıkça birleştiriliyor.
 */
export const skipSignature = (i: SkipSignatureInput): string => {
  const govde = [
    [...i.inputHashes].sort().join(','),
    i.promptHash,
    i.modelId,
    // Sayı biçimi de sabitleniyor: `0.7` ile `0.70` aynı sayı, farklı dize olurdu.
    i.temperature.toFixed(4),
    String(i.seed),
    i.retrievalSnapshot,
  ].join('')
  return `sha256:${createHash('sha256').update(govde, 'utf8').digest('hex')}`
}

/** İmza eşitliği. Tek satır ama ADI olan bir kavram: "bu bölüm değişmedi". */
export const unchanged = (a: string | null, b: string): boolean => a !== null && a === b
