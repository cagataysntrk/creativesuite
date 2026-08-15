// HEDEF: packages/engine/src/verbs/registry.ts
//
// Fiil GÖVDELERİNİN motora bağlandığı yer (§3.10 · R-02, R-04).
//
// **Neden kernel'de değil:** `RENDER`ın gövdesi Chromium'a dokunur ve o kod
// `packages/render`ta (Ring 1) yaşar. Kernel Ring 0'dır ve yalnız `contracts` import
// edebilir — kernel'in içine `RENDER` gövdesi koymak halka yönünü tersine çevirirdi.
// Aynısı `GENERATE` (providers), `PUBLISH` (channels), `INGEST` (providers) için de geçerli.
//
// Yani kernel'in `VERB_TABLE`ı **sözleşmedir**: dokuz fiil, her birinin yan etki sınıfı
// ve metered bayrağı. Motor gövdeleri o sözleşmenin üstüne yerleştirir.
//
// **Gövde sözleşmeyi DEĞİŞTİREMEZ.** Enjekte edilen bir gövde `metered: false` diyerek
// bütçe kapısını atlayabilseydi (D-17), tavan sessizce devre dışı kalırdı — ve bu,
// "çalıştırma öncesi maliyet tahmini dürüsttür" iddiasının çöktüğü an olurdu.
// `resolveVerb` bunu her çağrıda doğrular.

import type { CorrelationId, VerbName } from '@suite/contracts'
import { getVerb, makeError, type Verb } from '@suite/kernel'
import type { AppError } from '@suite/contracts'
import { err, ok, type Result } from '@suite/contracts'

export type VerbImplementations = Partial<Record<VerbName, Verb>>

/**
 * Kernel sözleşmesi + enjekte edilen gövde.
 *
 * Gövde yoksa kernel iskeleti döner ve o iskelet `notImplemented` verir — **sessizce
 * başarılı DÖNMEZ**. Boş bir başarı, üretilmemiş bir varlığı üretilmiş sanmanın en
 * hızlı yoludur; kapalı bir kapı, aralık bir kapıdan iyidir.
 */
export const resolveVerb = (
  name: VerbName,
  impls: VerbImplementations,
  correlationId: CorrelationId
): Result<Verb, AppError> => {
  const sozlesme = getVerb(name)
  const govde = impls[name]
  if (govde === undefined) return ok(sozlesme)

  // Gövde sözleşmeyle UYUŞMAK zorunda: yan etki sınıfı ve metered bayrağı kernel'in
  // dediğidir, gövdenin değil.
  if (govde.name !== name) {
    return err(uyusmazlik(name, `gövde kendini '${govde.name}' sanıyor`, correlationId))
  }
  if (govde.effectClass !== sozlesme.effectClass) {
    return err(
      uyusmazlik(
        name,
        `yan etki sınıfı '${govde.effectClass}', sözleşme '${sozlesme.effectClass}' diyor (R-04)`,
        correlationId
      )
    )
  }
  if (govde.metered !== sozlesme.metered) {
    return err(
      uyusmazlik(
        name,
        `metered=${govde.metered}, sözleşme ${sozlesme.metered} diyor — bütçe kapısı atlanamaz (D-17)`,
        correlationId
      )
    )
  }
  return ok(govde)
}

const uyusmazlik = (name: VerbName, neden: string, correlationId: CorrelationId): AppError =>
  makeError({
    kind: 'internal',
    code: 'VERB_CONTRACT_MISMATCH',
    userMessageKey: 'error.verb.mismatch',
    correlationId,
    details: { verb: name, reason: neden },
  })
