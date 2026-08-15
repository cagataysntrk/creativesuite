// Dönem-aşırı kanıt aktarımı (§4.6 · R-11 · R-32).
//
// **Geri dönüşüm geçmişi yük değil kanıttır** — ama imalat sonucu gibi SUNULAMAZ.
// Şirket geri dönüşümden imalata konum değiştiriyor; eski dönemin sonuçları silinirse
// elde hiç kanıt kalmaz, olduğu gibi kullanılırsa ilk teknik soruda çöker.
//
// Doğru yol üçüncüsü: eski kanıt **daha zor bir vaka** olarak sunulur ve yanında
// agent'ın kelimesi kelimesine tekrarlaması gereken bir aktarım argümanı taşır.
// "Geri dönüşümde yaptık, imalatta da yaparız" bir argüman DEĞİLDİR; "servis tasarlayıp
// canlıya alan ve ayakta tutan bir ekip" argümandır — biri alan iddiası, diğeri
// mühendislik iddiası.
//
// Bu dosya o kuralı MEKANİK yapar: notsuz dönem-aşırı kanıt yayını bloklar.

/** Kanıtın bugünkü bağlama ne kadar taşındığı. Sıra ZAYIFLAYAN güvendir. */
export type TransferConfidence = 'direct' | 'analogous' | 'illustrative_only'

export interface ProofReference {
  readonly id: string
  /** Kanıtın ÜRETİLDİĞİ dönem. `'*'` dönemden bağımsız olgu demektir. */
  readonly eraOfOrigin: string
  /** Aktarım argümanı. Dönem-aşırı kullanımda ZORUNLU. */
  readonly generalisationNote: string | null
  readonly transferConfidence: TransferConfidence | null
  /** Sayısal iddia içeriyorsa kaynağı (R-32). */
  readonly claimSource: string | null
  /** Metinde sayı geçiyor mu — çağıran belirler (lexicon linter'ın işi). */
  readonly hasNumericClaim: boolean
}

export type TransferViolation =
  | {
      readonly kind: 'missing_generalisation_note'
      readonly proofId: string
      readonly eraOfOrigin: string
    }
  | { readonly kind: 'missing_transfer_confidence'; readonly proofId: string }
  | { readonly kind: 'note_too_thin'; readonly proofId: string; readonly length: number }
  | { readonly kind: 'illustrative_used_as_evidence'; readonly proofId: string }
  | { readonly kind: 'missing_claim_source'; readonly proofId: string }
  | {
      readonly kind: 'invalid_transfer_confidence'
      readonly proofId: string
      readonly value: string
    }

/**
 * Aktarım argümanının ASGARİ uzunluğu.
 *
 * Neden bir eşik var: "aktarılabilir" ya da "benzer" gibi tek kelimelik notlar kuralı
 * mekanik olarak geçer ama HİÇBİR ŞEY söylemez — ve kapı, geçilmek için doldurulmuş
 * bir alanla karşılaştığında hiçbir şey korumaz. 40 karakter bir cümle demektir.
 */
const ASGARI_NOT = 40

/** Tanınan değerler. Liste TAM'dır: dışındaki her şey hatadır, varsayılan değil. */
const GECERLI_GUVEN: readonly string[] = ['direct', 'analogous', 'illustrative_only']

export interface TransferContext {
  /** Varlığın üretildiği dönem. */
  readonly currentEra: string
  /**
   * Varlık prospect'e mi gidiyor. `illustrative_only` kanıt, iç sunumda örnek olabilir
   * ama adı geçen bir şirkete giden deck'te KANIT olarak kullanılamaz (§11.4).
   */
  readonly outboundToProspect: boolean
}

/**
 * Bir varlığın kullandığı kanıtları denetler.
 *
 * **Boş liste geçerlidir:** kanıt kullanmayan bir varlık kural ihlali değildir.
 * Kanıtsız iddia ayrı bir kuraldır (R-32) ve `hasNumericClaim` üzerinden burada da
 * kontrol edilir — ama kanıt YOKLUĞU değil, kaynak yokluğu cezalandırılır.
 */
export const checkTransfer = (
  proofs: readonly ProofReference[],
  ctx: TransferContext
): readonly TransferViolation[] => {
  const ihlaller: TransferViolation[] = []

  for (const p of proofs) {
    // Sayısal iddianın kaynağı her dönemde zorunlu (R-32) — dönem-aşırı olmasa bile.
    if (p.hasNumericClaim && (p.claimSource === null || p.claimSource.trim() === '')) {
      ihlaller.push({ kind: 'missing_claim_source', proofId: p.id })
    }

    // Dönemden bağımsız olgu (`'*'`) ve aynı dönemden kanıt aktarım argümanı istemez.
    const donemAsiri = p.eraOfOrigin !== '*' && p.eraOfOrigin !== ctx.currentEra
    if (!donemAsiri) continue

    if (p.generalisationNote === null || p.generalisationNote.trim() === '') {
      ihlaller.push({
        kind: 'missing_generalisation_note',
        proofId: p.id,
        eraOfOrigin: p.eraOfOrigin,
      })
    } else if (p.generalisationNote.trim().length < ASGARI_NOT) {
      ihlaller.push({
        kind: 'note_too_thin',
        proofId: p.id,
        length: p.generalisationNote.trim().length,
      })
    }

    if (p.transferConfidence === null) {
      ihlaller.push({ kind: 'missing_transfer_confidence', proofId: p.id })
      continue
    }
    // Tanınmayan değer SESSİZCE kabul edilemez. Kapı `=== 'illustrative_only'`
    // karşılaştırmasıyla yetinseydi, "analogous.\n\n⚠ ..." gibi bozuk çıkarılmış bir
    // değer hem null olmaz hem enum'a uymaz — ve her kontrolden geçerdi. Kapının
    // yeşil raporlarken hiçbir şey korumamasının tam biçimi budur (2026-08-15).
    if (!GECERLI_GUVEN.includes(p.transferConfidence)) {
      ihlaller.push({
        kind: 'invalid_transfer_confidence',
        proofId: p.id,
        value: p.transferConfidence,
      })
      continue
    }

    // `illustrative_only` = "bu bir örnektir, kanıt değildir". Prospect'e giden bir
    // belgede kanıt olarak kullanılması, olgusal bir iddiadır ve yanlıştır (§11.4).
    if (p.transferConfidence === 'illustrative_only' && ctx.outboundToProspect) {
      ihlaller.push({ kind: 'illustrative_used_as_evidence', proofId: p.id })
    }
  }

  return ihlaller
}

/** İnsan gözü için. İhlal YOKSA boş dize döner — sessizlik geçti demektir. */
export const formatViolations = (v: readonly TransferViolation[]): string =>
  v
    .map((x) => {
      switch (x.kind) {
        case 'missing_generalisation_note':
          return `  ✗ ${x.proofId}: "${x.eraOfOrigin}" döneminden kanıt, generalisation_note YOK — eski sonuç yeni dönemin sonucu gibi sunulamaz (§4.6)`
        case 'note_too_thin':
          return `  ✗ ${x.proofId}: aktarım argümanı ${x.length} karakter — geçilmek için doldurulmuş bir alan hiçbir şey korumaz`
        case 'missing_transfer_confidence':
          return `  ✗ ${x.proofId}: transfer_confidence YOK (direct | analogous | illustrative_only)`
        case 'illustrative_used_as_evidence':
          return `  ✗ ${x.proofId}: illustrative_only kanıt prospect'e giden belgede KANIT olarak kullanılamaz (§11.4)`
        case 'missing_claim_source':
          return `  ✗ ${x.proofId}: sayısal iddia var, claim_source YOK (R-32)`
        case 'invalid_transfer_confidence':
          return `  ✗ ${x.proofId}: transfer_confidence tanınmıyor: "${x.value.slice(0, 40)}" — direct | analogous | illustrative_only`
      }
    })
    .join('\n')
