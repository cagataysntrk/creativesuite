// Kernel saflık kapısının ÜÇÜNCÜ katmanı: Proxy tuzağı (§3.2 · R-01 · FAZ-0.C.3).
//
// Üç katman var ve üçü farklı şeyi yakalar:
//   1. `OpaqueAttributes` markası → DERLEME hatası. Doğrudan erişimi ve destructuring'i
//      keser. Ama bir `as any` cast'i onu susturur.
//   2. `turkish-case`/`chokepoints` ailesinden grep → metinsel erişimi yakalar.
//      **Destructuring ile atlatılabilir** ve `const { attributes: a } = rec` yazan biri
//      grep'ten kaçar.
//   3. **Proxy tuzağı → ATLATILAMAZ.** `attributes` erişildiği ANDA patlayan bir kayıt
//      dokuz fiilden geçirilir. Hangi sözdizimiyle erişilirse erişilsin — nokta,
//      destructuring, `Reflect.get`, `Object.entries` — tuzak tetiklenir.
//
// Neden bu kadar önemli: kernel `attributes` okursa, sabit çekirdek BUGÜNKÜ kayıt tipine
// kaynak olur. Şirket bir yıl sonra tamamen dönüştüğünde Ring 1 kernel'e dokunmadan
// düzenlenemez — ve "her şey veri, kod değil" tezi (D-11) o gün çöker.

import { describe, expect, it } from 'vitest'
import type { BrandId, CorrelationId, EraId, RecordEnvelope, RunId, StepId } from '@suite/contracts'
import { VERBS } from '@suite/contracts'
import { InvariantViolation, panic } from '../errors/panic.js'
import { seededRng } from '../rng.js'
import { fixedClock } from '../time/clock.js'
import { VERB_TABLE } from './table.js'
import type { VerbContext } from './types.js'

// Tuzak `panic()` kullanır — `throw` eden TEK yer orası (§8.6 · chokepoints).
// Semantik olarak da doğrusu bu: kernel'in `attributes` okuması bir kullanıcı hatası
// değil, bir DEĞİŞMEZ İHLALİDİR. `chokepoints` kapısı testte elle yazılmış bir `throw`u
// haklı olarak reddetti; kural doğruydu, ilk yazdığım tuzak yanlıştı.

/**
 * `attributes`e HER TÜRLÜ erişimde patlayan kayıt.
 * `get` tuzağı nokta erişimini ve destructuring'i yakalar; `ownKeys`/`getOwnPropertyDescriptor`
 * ise `Object.keys`, `Object.entries`, spread ve `structuredClone` yollarını.
 */
const tuzakliKayit = (): RecordEnvelope =>
  new Proxy({} as Record<string, unknown>, {
    get(_t, prop) {
      if (prop === 'attributes') panic('kernel attributes okudu (R-01)')
      if (prop === 'id') return 'rec_tuzak'
      return undefined
    },
    has(_t, prop) {
      if (prop === 'attributes') panic('kernel attributes yokladı (R-01)')
      return false
    },
    ownKeys() {
      return panic('kernel kaydın anahtarlarını numaralandırdı (R-01)')
    },
  }) as unknown as RecordEnvelope

const ctx = (): VerbContext => ({
  runId: 'run_t' as RunId,
  stepId: 'stp_t' as StepId,
  brandId: 'brd_t' as BrandId,
  eraId: 'era_t' as EraId,
  correlationId: 'cor_t' as CorrelationId,
  clock: fixedClock('2026-08-15T09:00:00.000Z'),
  rng: seededRng(1),
})

describe('Proxy tuzağı — kernel attributes okumaz (R-01)', () => {
  it('tuzak gerçekten çalışıyor — önce tuzağı test et', () => {
    const rec = tuzakliKayit()
    expect(() => rec.attributes).toThrow(InvariantViolation)
    // Destructuring de aynı tuzağa düşer: grep'in kaçırdığı yol budur.
    expect(() => {
      const { attributes } = rec
      return attributes
    }).toThrow(InvariantViolation)
    // Reflect.get ve Object.keys de.
    expect(() => Reflect.get(rec as object, 'attributes')).toThrow(InvariantViolation)
    expect(() => Object.keys(rec as object)).toThrow(InvariantViolation)
  })

  // Tuzak DÖRT şekilde geçirilir. Sebep somut: ilk sürümde yalnız `{ record }`
  // sarmalayıcısı deneniyordu ve `input['attributes']` okuyan bir ihlal tuzağı hiç
  // tetiklemiyordu — tuzak yeşil raporluyordu (R-71). Kaydın fiile ulaşabileceği her
  // biçim denenmezse tuzak yalnız denenen biçimi korur.
  //
  // ⚠ Biçimler ETİKETLİ tutulur ve etiket girdiden TÜRETİLMEZ. İlk sürümde hata mesajı
  // `Object.keys(girdi)` çağırıyordu ve tuzağı TESTİN KENDİSİ patlatıyordu — temiz kodda
  // bile kırmızı. Daima kırmızı bir kapı, daima yeşil olan kadar işe yaramaz (D-57).
  const girdiBicimleri = (): readonly [string, unknown][] => [
    ['çıplak kayıt', tuzakliKayit()],
    ['{ record }', { record: tuzakliKayit() }],
    ['{ records: [] }', { records: [tuzakliKayit()] }],
    ['iç içe payload', { payload: { nested: tuzakliKayit() } }],
  ]

  it('tuzaklı kayıt dokuz fiilin PLAN ikizinden geçer, hiçbiri patlatmaz', () => {
    for (const name of VERBS) {
      const verb = VERB_TABLE[name]
      for (const [etiket, girdi] of girdiBicimleri()) {
        expect(() => verb.plan(ctx(), girdi), `${name} / ${etiket}`).not.toThrow()
      }
    }
  })

  it('tuzaklı kayıt dokuz fiilin RUN yolundan geçer, hiçbiri patlatmaz', async () => {
    for (const name of VERBS) {
      const verb = VERB_TABLE[name]
      for (const [, girdi] of girdiBicimleri()) await verb.run(ctx(), girdi)
      const sonuc = await verb.run(ctx(), { record: tuzakliKayit() })
      // Gövdeler henüz yok: hepsi VERB_NOT_IMPLEMENTED döner. Önemli olan, dönerken
      // `attributes`e DOKUNMAMIŞ olmaları — tuzak patlasaydı test burada düşerdi.
      expect(sonuc.ok, name).toBe(false)
      if (!sonuc.ok) expect(sonuc.error.code, name).toBe('VERB_NOT_IMPLEMENTED')
    }
  })

  it('kayıt bağlamda taşınsa bile numaralandırılmıyor', () => {
    const rec = tuzakliKayit()
    // Motorun tipik yaptığı: kaydı bir nesneye koyup fiile geçirmek. Spread yapmak
    // tuzağı patlatırdı — bu test o refleksin kernel'e girmediğini de doğrular.
    expect(() => VERB_TABLE.COMPOSE.plan(ctx(), { records: [rec], extra: 1 })).not.toThrow()
  })
})

describe('fiil sözleşmesi (§3.10)', () => {
  it('tam olarak dokuz fiil', () => {
    expect(Object.keys(VERB_TABLE)).toHaveLength(9)
    expect(VERBS).toHaveLength(9)
  })

  it('plan ikizi SENKRON — async olsaydı I/O sızardı', () => {
    for (const name of VERBS) {
      const sonuc = VERB_TABLE[name].plan(ctx(), {})
      expect(sonuc, name).not.toBeInstanceOf(Promise)
      expect(sonuc.verb, name).toBe(name)
    }
  })

  it('plan ikizi fiilin yan etki sınıfını AYNEN taşır', () => {
    for (const name of VERBS) {
      const verb = VERB_TABLE[name]
      expect(verb.plan(ctx(), {}).effectClass, name).toBe(verb.effectClass)
    }
  })

  it('metered fiiller yan etki sınıfıyla tutarlı', () => {
    const harcayan = new Set(['network-model', 'browser', 'network-channel', 'network-source'])
    for (const name of VERBS) {
      const verb = VERB_TABLE[name]
      expect(verb.metered, name).toBe(harcayan.has(verb.effectClass))
    }
  })
})
