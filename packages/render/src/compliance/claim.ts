// Uyum iddiası — KOD SEVİYESİNDE (§11.3 · R-33 · D-23).
//
// **Reklam Yönetmeliği Md. 27/12**, 1 Ağu 2026'dan yürürlükte: onay ima eden yapay insan
// üretilemez. Sentetik müşteri referansı, klonlanmış müşteri sesi, avatar testimonial —
// hepsi yasak. Adı geçen bir prospect'e giden deck'te AI ile üretilmiş bir "müşteri",
// tam olarak yasaklanan desendir.
//
// **İddia bir BAYRAK değil, bir TÜRDÜR.** `containsSyntheticPerson: boolean` olsaydı
// biri onu `false` yazar ve iş biterdi — beyan, doğrulamanın yerine geçerdi. Burada tip
// `false` **literal**i: `true` yazan bir iddia DERLENMEZ. Ve tek yapıcı bir `basis`
// (dayanak) istiyor: iddianın neye dayandığı kayda geçmeden iddia kurulamaz.
//
// **Üç meşru dayanak var, üçü de farklı bir gerçeği anlatır:**
//   1. `prompt_forbids_people` — prompt insan istemiyor (mekanik olarak tarandı)
//   2. `human_photograph`     — gerçek fotoğraf, model üretimi değil
//   3. `human_reviewed`       — insan baktı ve onayladı; kim, ne zaman yazılı
//
// Üçüncüsü olmadan sistem fazla katı olurdu (model prompt'ta istenmese de insan
// üretebilir); ilk ikisi olmadan her varlık insan gözü beklerdi ve kuyruk tıkanırdı.

import type { AppError } from '@suite/contracts'
import { err, ok, type Result } from '@suite/contracts'
import { foldForSearch, makeError } from '@suite/kernel'

/** İddianın neye dayandığı. Dayanaksız iddia kurulamaz. */
export type PersonBasis =
  | { readonly kind: 'prompt_forbids_people'; readonly promptDigest: string }
  | { readonly kind: 'human_photograph'; readonly sourceRef: string }
  | { readonly kind: 'human_reviewed'; readonly reviewer: string; readonly reviewedAt: string }

export interface ComplianceClaim {
  /**
   * ⚠ Tip `false` LİTERALİ. `true` yazan bir iddia derlenmez — yasak bir varlık için
   * "uyumlu" iddiası kurulamasın diye. Yasaklı varlık iddia ALMAZ, reddedilir.
   */
  readonly containsSyntheticPerson: false
  readonly basis: PersonBasis
  /** Varlık bir model tarafından mı üretildi. IPTC damgasına ve ifşaya girer. */
  readonly aiGenerated: boolean
  /**
   * EU AI Act Md. 50 ifşası gerekli mi (2 Ağu 2026'dan uygulanabilir).
   *
   * **Kayda değer istisna:** yeniden boyutlandırma, kırpma, renk düzeltme ve olayı
   * değiştirmeyen arka plan düzenlemeleri ifşa TETİKLEMİYOR — reframe/retouch hattımız
   * kapsam dışı. Bu yüzden `aiGenerated` tek başına yetmiyor.
   */
  readonly disclosureRequired: boolean
}

export type ComplianceRefusal =
  | { readonly kind: 'prompt_requests_person'; readonly matched: string }
  | { readonly kind: 'basis_missing' }
  | { readonly kind: 'reviewer_unnamed' }

/**
 * İnsan isteyen ifadeler. R-20'deki gibi **gövde ön eki** — Türkçe eklemeli:
 * `insan` · `insanlar` · `insanların` · `insanlarla`. Sonlu bir ek listesi her zaman
 * bir sonraki eki kaçırır.
 *
 * Liste özellikle **onay ima eden** rolleri hedefliyor (Md. 27/12'nin konusu):
 * müşteri, referans, testimonial, memnun kullanıcı. "Bir mühendis parçayı inceliyor"
 * da bir insandır ve o da yakalanır — kasıtlı: model üretimi bir insan, onay ima etme
 * riskini her zaman taşır ve `human_reviewed` dayanağıyla geçebilir.
 *
 * **Her desenin kendi `probe`'u var.** Sebebi bir ihlal testinde ortaya çıktı: kapının
 * öz-testi tek bir prompt kullanıyordu ve `müşteri` deseni silindiğinde `gülümse`
 * deseni aynı prompt'u yakalayıp kapıyı YEŞİL bırakıyordu. Yani desenlerin çoğu
 * silinebilir ve kapı hiçbir şey söylemezdi. Artık her desen kendi probe'uyla
 * ayrı ayrı kanıtlanıyor ve bir testi probe'ların TEK bir desene uyduğunu doğruluyor.
 */
const INSAN_ISTEYEN: readonly {
  readonly desen: RegExp
  readonly ornek: string
  /** Yalnız BU deseni tetikleyen örnek prompt — kapının öz-testi bunu kullanır. */
  readonly probe: string
}[] = [
  // Türkçe — gövde ön eki
  { desen: /\binsan\w*/, ornek: 'insan', probe: 'insanlarla dolu bir alan' },
  { desen: /\bkisi\w*/, ornek: 'kişi', probe: 'bir kişi duruyor' },
  { desen: /\bmusteri\w*/, ornek: 'müşteri', probe: 'müşterimiz memnun' },
  { desen: /\bkullanici\w*/, ornek: 'kullanıcı', probe: 'kullanıcılarımız' },
  { desen: /\bcalisan\w*/, ornek: 'çalışan', probe: 'çalışanların vardiyası' },
  { desen: /\bmuhendis\w*/, ornek: 'mühendis', probe: 'mühendisler hattı inceliyor' },
  { desen: /\bisci\w*/, ornek: 'işçi', probe: 'işçiler tezgâhta' },
  { desen: /\byonetici\w*/, ornek: 'yönetici', probe: 'yöneticiler toplantıda' },
  { desen: /\bportre\w*/, ornek: 'portre', probe: 'bir portre çekimi' },
  {
    desen: /\byuz\w*\s+(ifade|hat|goruntu)/,
    ornek: 'yüz ifadesi',
    probe: 'yüz ifadesi yakın plan',
  },
  { desen: /\bel\s+(sikis|sallama)\w*/, ornek: 'el sıkışma', probe: 'el sıkışma anı' },
  { desen: /\breferans\w*/, ornek: 'referans', probe: 'referans veren biri' },
  { desen: /\bgulumse\w*/, ornek: 'gülümseyen', probe: 'gülümseyen biri' },
  // İngilizce — prompt'lar karışık dilde yazılabiliyor
  {
    desen: /\b(person|people|human|man|woman|worker|engineer|customer|client)\b/,
    ornek: 'person',
    probe: 'a person standing',
  },
  {
    desen: /\b(portrait|face|smiling|handshake|testimonial|model|crowd|team)\b/,
    ornek: 'portrait',
    probe: 'a smiling portrait shot',
  },
  {
    desen: /\b(he|she)\s+(is|holds|stands|looks)\b/,
    ornek: 'he/she …',
    probe: 'he is holding the part',
  },
]

const reddet = (r: ComplianceRefusal, correlationId: string): AppError =>
  makeError({
    kind: 'policy_blocked',
    code: 'COMPLIANCE_BLOCKED',
    userMessageKey: 'error.compliance.blocked',
    correlationId: correlationId as AppError['correlationId'],
    details: {
      refusal: r,
      rule: 'R-33',
      law: 'Reklam Yönetmeliği Md. 27/12 (1 Ağu 2026)',
    },
  })

/** Prompt'ta insan isteği var mı — mekanik tarama, model yargısı DEĞİL. */
export const promptRequestsPerson = (prompt: string): string | null => {
  const katlanmis = foldForSearch(prompt)
  for (const { desen, ornek } of INSAN_ISTEYEN) {
    if (desen.test(katlanmis)) return ornek
  }
  return null
}

export interface ClaimInput {
  readonly basis: PersonBasis
  readonly aiGenerated: boolean
  /** Yalnız yeniden boyutlandırma/kırpma/renk düzeltme mi — Md. 50 istisnası. */
  readonly minorEditsOnly?: boolean
  /** `prompt_forbids_people` dayanağı için taranacak prompt. */
  readonly prompt?: string
  readonly correlationId: string
}

/**
 * Uyum iddiasını kurar — **veya reddeder**.
 *
 * `prompt_forbids_people` dayanağı iddia edilip prompt gerçekten insan istiyorsa iddia
 * KURULMAZ. Dayanak bir etiket değil, doğrulanabilir bir gerekçedir; doğrulanmayan bir
 * dayanak dayanak değildir.
 */
export const assertCompliance = (input: ClaimInput): Result<ComplianceClaim, AppError> => {
  const { basis } = input

  if (basis.kind === 'prompt_forbids_people') {
    const p = input.prompt ?? ''
    if (p.trim() === '') return err(reddet({ kind: 'basis_missing' }, input.correlationId))
    const eslesme = promptRequestsPerson(p)
    if (eslesme !== null) {
      return err(reddet({ kind: 'prompt_requests_person', matched: eslesme }, input.correlationId))
    }
  }

  if (basis.kind === 'human_reviewed' && basis.reviewer.trim() === '') {
    // İsimsiz onay onay değildir: denetimde "kim onayladı" sorusunun cevabı olmalı.
    return err(reddet({ kind: 'reviewer_unnamed' }, input.correlationId))
  }

  if (basis.kind === 'human_photograph' && basis.sourceRef.trim() === '') {
    return err(reddet({ kind: 'basis_missing' }, input.correlationId))
  }

  return ok({
    containsSyntheticPerson: false,
    basis,
    aiGenerated: input.aiGenerated,
    disclosureRequired: input.aiGenerated && input.minorEditsOnly !== true,
  })
}

/**
 * Her desen için bir probe. **Kapı bunları tek tek koşar**: bir desen silinirse kendi
 * probe'u geçer ve kapı kırmızıya döner.
 *
 * `probe`ların TEK bir desene uyduğu ayrı bir testle doğrulanıyor — üst üste binen
 * probe'lar, bu mekanizmayı ilk hâline geri götürürdü.
 */
export const PERSON_PROBES: readonly string[] = INSAN_ISTEYEN.map((x) => x.probe)

/** Bir prompt kaç deseni tetikliyor — probe bağımsızlığı testi için. */
export const personPatternHits = (prompt: string): number => {
  const katlanmis = foldForSearch(prompt)
  return INSAN_ISTEYEN.filter((x) => x.desen.test(katlanmis)).length
}
