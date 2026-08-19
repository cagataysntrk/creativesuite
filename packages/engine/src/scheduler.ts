// Adım zamanlama ve iptal yayılımı (§8.5, §13).
//
// Motor beş şeyi BİR KEZ yapar ve dokuz fiil de aynı yoldan geçer: bütçe kiralama →
// devre kesici → idempotency rezervasyonu → çağrı → defter kapatma. Her fiile ayrı dal
// yazılsaydı, o dallardan biri er geç defteri atlardı.
//
// **İptal bir KARARDIR.** `AbortSignal` uçtan uca taşınır ve iptal edilen adım yeniden
// DENENMEZ (`classify('cancelled').retryable === false`). Kullanıcının kararını yeniden
// denemeyle ezmek, iptal düğmesini yalan yapar.

import type {
  AppError,
  CorrelationId,
  CostEvent,
  Money,
  RunId,
  StepId,
  VerbName,
} from '@suite/contracts'
import { ZERO_USD, type Result } from '@suite/contracts'
import { classify, makeError, systemClock, systemRng } from '@suite/kernel'
import type { Clock, Db, Rng } from '@suite/kernel'
import { CircuitBreaker } from './breaker.js'
import { RateLimiter, rateLimitError } from './ratelimit.js'
import { decideRetry, DEFAULT_RETRY, type RetryPolicy } from './retry.js'
import * as budget from './budget.js'
import * as ledger from './cost/ledger.js'

export interface StepSpec {
  readonly runId: RunId
  readonly stepId: StepId
  readonly verb: VerbName
  readonly capability: string
  readonly providerId: string
  readonly metered: boolean
  readonly idempotencyKey: string
  readonly estimateHigh: Money
}

export interface CallOutcome {
  readonly amount: Money
  readonly chargeStatus: ledger.ChargeStatus
  readonly externalId: string | null
  readonly data: unknown
}

export interface StepCallContext {
  readonly signal: AbortSignal
  /**
   * Sağlayıcı iş tutamağını verir vermez ÇAĞIR. Motor onu deftere yazar; aradaki bir
   * çökme tutamağı kaybetmez ve yeniden başlatma çağrıyı tekrarlamaz (R-44).
   */
  readonly noteHandle: (externalId: string) => void
  /**
   * Önceki çalıştırmadan kalan tutamak. `null` değilse **yeni çağrı YAPMA** — bu işi
   * sağlayıcıya sor ve sonucunu bekle. Yeni çağrı yapmak, tam olarak çift ücrettir.
   */
  readonly resumeExternalId: string | null
}

/** Gerçek çağrı. Motor onu yalnız SARAR; ne yaptığını bilmez. */
export type StepCall = (c: StepCallContext) => Promise<Result<CallOutcome, AppError>>

export interface EngineDeps {
  readonly db: Db
  readonly breaker: CircuitBreaker
  readonly clock?: Clock
  readonly rng?: Rng
  readonly retry?: RetryPolicy
  /**
   * Yerel hız sınırı. Verilmezse sınır YOK — ve bu bilinçli: limiter'ı zorunlu kılmak,
   * onu yapılandırmayı unutan her çağrıyı sessizce yavaşlatırdı. Üretim yolu (`runPipeline`)
   * her zaman verir.
   */
  readonly limiter?: RateLimiter
  /** Test bunu 0 yapar; üretimde gerçekten bekler. */
  readonly sleep?: (ms: number, signal: AbortSignal) => Promise<void>
  /**
   * Bu adımın çıktısı diskte DURUYOR mu (`derived/runs/<run>/steps/<adim>.json`)?
   *
   * ⚠ Verilmezse `false` varsayılır — yani eski davranış: ücretsiz kapanmış kayıt
   * yeniden koşar. Zorunlu kılmak, çağıranın diski bilmesini şart koşardı; oysa
   * zamanlayıcı diski bilmiyor ve bilmemeli.
   */
  readonly ciktiVar?: (runId: RunId, stepId: StepId) => boolean
}

export interface StepResult {
  readonly outcome: CallOutcome | null
  readonly error: AppError | null
  readonly attempts: number
  readonly costs: readonly CostEvent[]
  /** Çağrı hiç yapılmadı çünkü defterde zaten vardı — çift ücret engellendi (R-44). */
  readonly replayedFromLedger: boolean
  readonly budget: budget.BudgetState
}

const defaultSleep = (ms: number, signal: AbortSignal): Promise<void> =>
  new Promise((resolve, reject) => {
    if (signal.aborted) return reject(signal.reason)
    const t = setTimeout(resolve, ms)
    signal.addEventListener('abort', () => {
      clearTimeout(t)
      reject(signal.reason)
    })
  })

export const runStep = async (
  deps: EngineDeps,
  spec: StepSpec,
  state: budget.BudgetState,
  call: StepCall,
  correlationId: CorrelationId,
  signal: AbortSignal
): Promise<StepResult> => {
  const clock = deps.clock ?? systemClock
  const rng = deps.rng ?? systemRng
  const policy = deps.retry ?? DEFAULT_RETRY
  const sleep = deps.sleep ?? defaultSleep

  const bos = (e: AppError | null, b: budget.BudgetState): StepResult => ({
    outcome: null,
    error: e,
    attempts: 0,
    costs: [],
    replayedFromLedger: false,
    budget: b,
  })

  // ── 1. iptal önce kontrol edilir: iptal edilmiş bir adım için bütçe kiralamak,
  //       kirayı asla kapatmayacak bir rezervasyon bırakır.
  if (signal.aborted) {
    return bos(
      makeError({
        kind: 'cancelled',
        code: 'STEP_CANCELLED',
        userMessageKey: 'error.cancelled',
        correlationId,
      }),
      state
    )
  }

  // ── 2. bütçe kiralama ──────────────────────────────────────────────────────
  let bState = state
  if (spec.metered) {
    const kira = budget.lease(state, spec.estimateHigh)
    if (!kira.ok) {
      return bos(
        makeError({
          kind: 'budget_exceeded',
          code: 'BUDGET_CAP_EXCEEDED',
          userMessageKey: 'error.budget.exceeded',
          correlationId,
          details: { reason: budget.refusalMessage(kira.refusal), kind: kira.refusal.kind },
        }),
        state
      )
    }
    bState = kira.state
  }

  // ── 3. idempotency: defterde varsa çağrı YAPILMAZ ──────────────────────────
  // Üç ayrı durum, üç ayrı davranış. İlk sürüm üçünü de "bitmiş" sayıyordu ve yarıda
  // kalan bir iş sessizce $0.00 maliyetle başarılı görünüyordu (D-103).
  let devamTutamak: string | null = null
  if (spec.metered) {
    const rez = ledger.reserve(deps.db, {
      idempotencyKey: spec.idempotencyKey,
      runId: spec.runId,
      stepId: spec.stepId,
      verb: spec.verb,
      providerId: spec.providerId,
      capability: spec.capability,
    })
    if (!rez.fresh) {
      const yarim = rez.entry.chargeStatus === 'possibly-charged'

      // ── (0) BAŞARISIZ kayıt: iş HİÇ OLMADI, tekrar denenmeli (D-242) ───────
      //
      // ⚠ **En sinsi hata buradaydı.** `not-charged` "çağrı uçmadı" demek — yani iş
      // yapılmadı. Eski kod onu `possibly-charged` DEĞİL diye "kapanmış" sayıyor ve
      // çağrıyı atlıyordu. Sonuç: bir kez hata veren adım, sonraki HER koşuda
      // `status: ok` + `output: null` ile 1 milisaniyede "başarılı" oluyordu.
      //
      // Ölçüldü: `metin-uret` `CAPABILITY_UNSUPPORTED` ile düştü, deftere
      // `not-charged` kapandı, bir sonraki koşuda hattı sessizce geçti ve `kompozit`
      // boş girdiyle devam etti. **Kırmızı bir adım, yeşile dönmüş bir adımdan
      // iyidir; asıl tehlike yeşile dönmesidir.**
      //
      // Defterin işi ÖDEMEYİ tekrarlamamak, İŞİ tekrarlamamak değil. Ödenmemiş bir
      // iş tekrar denenmeli — çift ödeme riski yok, çünkü ödeme hiç olmadı.
      if (rez.entry.chargeStatus === 'not-charged') {
        // Kayıt yeniden açılıyor ve **(b)/(c) dalları ATLANIYOR**: iş yapılmadığı
        // için sorulacak bir tutamak da, mutabakat gerektiren bir belirsizlik de yok.
        //
        // ⚠ İlk düzeltmemde `reopen`dan sonra akış (c)'ye düşüyordu ve adım
        // `NEEDS_RECONCILIATION` ile duruyordu — **açtığım kapıyı iki satır aşağıda
        // kendim kapatmışım.** Bir dalı eklerken diğer dalların koşullarını
        // güncellememek, düzeltmeyi düzeltmenin yokluğuna çevirir.
        ledger.reopen(deps.db, spec.idempotencyKey, spec.runId, spec.stepId)
      } else if (!yarim && rez.entry.amount.micros === 0n) {
        // ── (a0) ÜCRETSİZ kapanmış kayıt: atlamak KAYIP (D-247) ───────────────
        //
        // **Defter maliyeti saklıyor, ÇIKTIYI saklamıyor.** Kapanmış bir kaydı
        // atlayınca `data: null` dönüyor ve aşağı akış boş girdiyle kalıyor: ölçüldü,
        // `gorsel-brief` ✓ göründü ama `gorsel-uret` brief'i `null` aldı ve R-20
        // boş prompt'u reddetti.
        //
        // **Defterin işi çift ÖDEMEYİ önlemek.** Tutarı sıfır olan bir kayıtta
        // önlenecek ödeme yok — abonelik çağrısı (claude-code) ya da bedava katman
        // (Cloudflare). Atlamak hiçbir şey kazandırmıyor, çıktıyı kaybettiriyor.
        //
        // ⚠ ⚠ **O "doğru çözüm" ARTIK VAR ve bu dal onu bilmiyordu.** Çıktı
        // `derived/runs/<run>/steps/<adim>.json` altına yazılıyor (`adim-ciktisi.ts`).
        // Yani "atlarsak çıktıyı kaybederiz" gerekçesi ÖLÇÜLEREK çürüdü: çıktı
        // duruyorsa atlamak kayıp değil, TEKRAR ETMEK israf.
        //
        // Ölçüm: `run_01a01876` kapıdan sonra sürdürüldüğünde `konu-sec` GİRDİ özeti
        // `5a68ed27` ile aynıydı ama çıktı özeti değişti — `5e0f8c7d` → `e02f01c7`.
        // Yani model yeniden çağrılmış, yedi saniye ve gerçek token harcanmış,
        // üstelik BAŞKA bir cevap dönmüş. Bir kapıyı onaylamak, onayladığın metnin
        // değişmesine sebep oluyordu. (D19 · BORCLAR)
        //
        // Bugünkü kural: çıktı diskteyse ücretli daldaki gibi ATLA — aşağı akış onu
        // `adimCiktisiniOku` ile zaten diskten okuyor. Diskte yoksa eski davranış
        // aynen sürüyor; gerekçe hâlâ geçerli çünkü kaybedecek çıktı GERÇEKTEN var.
        if (deps.ciktiVar?.(spec.runId, spec.stepId) === true) {
          return {
            outcome: {
              amount: rez.entry.amount,
              chargeStatus: rez.entry.chargeStatus,
              externalId: rez.entry.externalId,
              data: null,
            },
            error: null,
            attempts: 0,
            costs: [],
            replayedFromLedger: true,
            budget: budget.settleLease(bState, spec.estimateHigh, rez.entry.amount),
          }
        }
        ledger.reopen(deps.db, spec.idempotencyKey, spec.runId, spec.stepId)
      } else if (!yarim) {
        // (a) KAPANMIŞ ve ÜCRETLİ kayıt: iş bitmiş, tutarı biliniyor. Çağrı atlanır.
        return {
          outcome: {
            amount: rez.entry.amount,
            chargeStatus: rez.entry.chargeStatus,
            externalId: rez.entry.externalId,
            data: null,
          },
          error: null,
          attempts: 0,
          costs: [],
          replayedFromLedger: true,
          budget: budget.settleLease(bState, spec.estimateHigh, rez.entry.amount),
        }
      } else if (rez.entry.externalId !== null) {
        // (b) YARIDA KALMIŞ ama tutamak var: sağlayıcıya SORULUR, yeniden çağrılmaz.
        devamTutamak = rez.entry.externalId
      } else {
        // (c) YARIDA KALMIŞ ve tutamak YOK: çağrının uçup uçmadığı bilinmiyor.
        // Burada tahmin etmek yasak — ikisi de yanlış: "uçmadı" dersek çift ödeme
        // riski, "uçtu" dersek üretilmemiş varlığı üretilmiş sayarız. İnsan bakar.
        if (spec.metered) ledger.settle(deps.db, spec.idempotencyKey, ZERO_USD, 'possibly-charged')
        return bos(
          makeError({
            kind: 'internal',
            code: 'NEEDS_RECONCILIATION',
            userMessageKey: 'error.ledger.needsReconciliation',
            correlationId,
            retryable: false,
            details: {
              // ⚠ ⚠ **TAM ANAHTAR YAZILMIYOR — `gitleaks` onu ANAHTAR SANDI.** `idem_`
              // + 32 hex, `generic-api-key` kuralına birebir uyuyor ve bu satır koşu
              // günlüğüne düşünce kapı kırmızıya döndü. Anahtar bir sır değil (plan
              // alanlarının sha256'sı) ama sürekli alarm veren kapı, kapatılan kapıdır
              // — ve muafiyet yazmak yerine ALARMIN SEBEBİNİ kaldırmak doğrusu.
              //
              // ⚠ Ön ek YETERLİ: defterde arama `LIKE 'idem_ab12%'` ile yapılıyor ve
              // 8 hex, bir koşudaki onlarca adımı ayırt etmeye fazlasıyla yeter.
              adimAnahtari: spec.idempotencyKey.slice(0, 13),
              providerId: spec.providerId,
              reason: 'çağrı uçtu mu bilinmiyor — sağlayıcı panelinden doğrulanmalı (§8.5)',
            },
          }),
          budget.settleLease(bState, spec.estimateHigh, ZERO_USD)
        )
      }
    }
  }

  // ── 4. devre kesici ────────────────────────────────────────────────────────
  const now = clock.now()
  if (!deps.breaker.allows(spec.providerId, spec.capability, now)) {
    const durum = deps.breaker.state(spec.providerId, spec.capability, now)
    if (spec.metered) ledger.settle(deps.db, spec.idempotencyKey, ZERO_USD, 'not-charged')
    return bos(
      makeError({
        kind: 'provider_unavailable',
        code: 'CIRCUIT_OPEN',
        userMessageKey: 'error.provider.circuitOpen',
        correlationId,
        retryable: true,
        details: { providerId: spec.providerId, capability: spec.capability, state: durum },
      }),
      budget.settleLease(bState, spec.estimateHigh, ZERO_USD)
    )
  }

  // ── 4b. yerel hız sınırı ───────────────────────────────────────────────────
  // Limiter çağrının ÖNÜNDE: 429 alıp yeniden denemek de mümkün ama bazı sağlayıcılar
  // reddedilen isteği de sayar. Kendi hızımızı kendimiz sınırlarsak sağlayıcının bizi
  // sınırlamasına gerek kalmaz.
  if (deps.limiter !== undefined) {
    const izin = deps.limiter.take(spec.providerId, spec.capability)
    if (!izin.allowed) {
      if (spec.metered) ledger.settle(deps.db, spec.idempotencyKey, ZERO_USD, 'not-charged')
      return bos(
        rateLimitError(spec.providerId, spec.capability, izin.retryAfterMs, correlationId),
        budget.settleLease(bState, spec.estimateHigh, ZERO_USD)
      )
    }
  }

  // ── 5. çağrı + yeniden deneme ──────────────────────────────────────────────
  let attempt = 0
  let sonHata: AppError | null = null

  while (attempt < policy.maxAttempts) {
    attempt += 1
    if (signal.aborted) {
      sonHata = makeError({
        kind: 'cancelled',
        code: 'STEP_CANCELLED',
        userMessageKey: 'error.cancelled',
        correlationId,
      })
      break
    }

    const sonuc = await call({
      signal,
      noteHandle: (externalId) => {
        if (spec.metered) ledger.noteHandle(deps.db, spec.idempotencyKey, externalId)
        // Tutamak AYNI `runStep` içindeki sonraki denemeye de taşınır. Taşınmasaydı
        // yeniden deneme sağlayıcıda İKİNCİ bir iş açardı — çökme senaryosunu
        // kapatıp retry döngüsünde aynı deliği açık bırakmak olurdu (D-103).
        devamTutamak = externalId
      },
      resumeExternalId: devamTutamak,
    })

    if (sonuc.ok) {
      deps.breaker.onSuccess(spec.providerId, spec.capability)
      if (spec.metered) {
        ledger.settle(
          deps.db,
          spec.idempotencyKey,
          sonuc.value.amount,
          sonuc.value.chargeStatus,
          sonuc.value.externalId
        )
      }
      return {
        outcome: sonuc.value,
        error: null,
        attempts: attempt,
        costs: spec.metered
          ? [
              {
                verb: spec.verb,
                capability: spec.capability,
                providerId: spec.providerId,
                amount: sonuc.value.amount,
                kind: 'actual',
              },
            ]
          : [],
        replayedFromLedger: false,
        budget: budget.settleLease(bState, spec.estimateHigh, sonuc.value.amount),
      }
    }

    sonHata = sonuc.error
    if (classify(sonuc.error.kind).trips) {
      deps.breaker.onFailure(spec.providerId, spec.capability, clock.now())
    }

    const karar = decideRetry(sonuc.error, attempt, rng, policy)
    if (!karar.retry) break
    try {
      await sleep(karar.delayMs, signal)
    } catch {
      sonHata = makeError({
        kind: 'cancelled',
        code: 'STEP_CANCELLED',
        userMessageKey: 'error.cancelled',
        correlationId,
        cause: sonHata,
      })
      break
    }
  }

  // Başarısız çağrı da PARA HARCAMIŞ olabilir (§8.6): hatanın taşıdığı `costIncurred`
  // deftere yazılır. Sıfır yazmak, üç görsel üretip 429 alan bir adımı bedava saymaktı.
  const harcanan = sonHata?.costIncurred ?? ZERO_USD
  if (spec.metered) {
    // Tutamak KORUNUR. `settle`in varsayılanı `null` ve onu geçmek, mutabakat için
    // özellikle yazdığımız tutamağı tam da ona ihtiyaç duyulan anda — başarısızlıkta —
    // silmek olurdu.
    // ÜÇ durum, üçü de farklı bir gerçeği anlatıyor:
    //   `charged`          hata geldi ama para harcandığını BİLİYORUZ (`costIncurred`)
    //   `possibly-charged` sağlayıcıda iş AÇILDI, âkıbeti bilinmiyor — tutamak var
    //   `not-charged`      hiç iş açılmadı, bu güvenle söylenebilir
    // Ortadakini `not-charged` yazmak iki yalan söyler: maliyet raporunu eksiltir ve
    // yeniden başlatmanın işi devam ettirmesini engeller (devam yolu tutamağa bakar).
    ledger.settle(
      deps.db,
      spec.idempotencyKey,
      harcanan,
      harcanan.micros > 0n ? 'charged' : devamTutamak !== null ? 'possibly-charged' : 'not-charged',
      devamTutamak
    )
  }

  return {
    outcome: null,
    error: sonHata,
    attempts: attempt,
    costs:
      spec.metered && harcanan.micros > 0n
        ? [
            {
              verb: spec.verb,
              capability: spec.capability,
              providerId: spec.providerId,
              amount: harcanan,
              kind: 'actual',
            },
          ]
        : [],
    replayedFromLedger: false,
    budget: budget.settleLease(bState, spec.estimateHigh, harcanan),
  }
}

/** İptal edilebilir bir çalıştırma kapsamı — `AbortSignal` uçtan uca (§8.5). */
export const runScope = (): { signal: AbortSignal; cancel: (reason?: unknown) => void } => {
  const ac = new AbortController()
  return {
    signal: ac.signal,
    // İptal sebebi bir DEĞERDİR; `abort()` çıplak çağrılırsa sebep `AbortError` olur ve
    // "kim neden iptal etti" manifest'e yazılamaz (§13).
    cancel: (reason?: unknown) => ac.abort(reason ?? new Error('kullanıcı iptal etti')),
  }
}
