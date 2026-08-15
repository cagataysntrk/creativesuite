// TEK YAML ayrıştırıcı (§3.8 · chokepoints.json → `frontmatter-ayristirici`).
//
// **Neden Ring 0'da:** iki taraf YAML okuyor — `corpus/frontmatter.ts` (kayıt zarfları)
// ve `registry/resolve.ts` (pipeline ve varlık tipi tanımları). İkisi KARDEŞ halkadır ve
// birbirini import edemez (§3.6); ayrıştırıcı birinde kalsaydı diğeri kendi kütüphanesini
// kurardı. İki ayrıştırıcı bir dosyayı indekste geçerli, pipeline'da geçersiz yapar — ve
// hata dosyada değil, İKİSİNİN ARASINDA olur.
//
// Seçenekler burada SABİTLENİR. Aynı kütüphanenin farklı seçeneklerle çağrılması da iki
// ayrıştırıcıdır: biri `1.20` sürümünü sayı, diğeri dize okur ve fark aylar sonra çıkar.

import { parse as yamlParse, stringify as yamlStringify } from 'yaml'

export type YamlParseResult =
  { readonly ok: true; readonly value: unknown } | { readonly ok: false; readonly message: string }

/**
 * Ayrıştırır. `throw` ETMEZ — bozuk bir YAML bir istisna değil, bir VERİ durumudur ve
 * çağıran onu kullanıcıya gösterip diğer dosyalara devam edebilmeli (§8.6).
 */
export const parseYaml = (text: string): YamlParseResult => {
  try {
    return { ok: true, value: yamlParse(text, { strict: true }) }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : String(e) }
  }
}

/** `lineWidth: 0` = satır sarma yok. Sarma, `git diff`i gereksiz gürültüye boğar. */
export const stringifyYaml = (value: unknown): string => yamlStringify(value, { lineWidth: 0 })
