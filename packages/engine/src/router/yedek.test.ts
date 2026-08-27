// Yedek zinciri kuralları — hangi hata yedeği HAK EDER, zincir nasıl kurulur.
//
// ⚠ Bu dosya `run.ts`teki döngüyü değil, döngünün KARARINI sınıyor. Karar saf bir
// fonksiyonda olduğu için burada ölçülebiliyor; döngünün kendisi `run.test.ts`te
// gerçek bir sahte sağlayıcıyla sınanıyor.

import { describe, expect, it } from 'vitest'
import { makeError } from '@suite/kernel'
import type { AppError } from '@suite/contracts'
import { yedegeGec, yedekZinciri } from './yedek.js'

const e = (kind: AppError['kind']): AppError =>
  makeError({
    kind,
    code: 'X',
    userMessageKey: 'error.x',
    correlationId: 'c' as AppError['correlationId'],
  })

describe('yedegeGec', () => {
  it('SAĞLAYICIYA ÖZGÜ arızada yedeğe geçiliyor', () => {
    // Ortak yanları: BAŞKA BİR SAĞLAYICI BAŞARABİLİR.
    for (const k of [
      'provider_rate_limit',
      'provider_auth',
      'provider_bad_response',
      'io',
    ] as const)
      expect(yedegeGec(e(k)), k).toBe(true)
  })

  it('İSTEM/BÜTÇE/İPTAL hatasında yedeğe GEÇİLMİYOR', () => {
    // ⚠ ⚠ **AYRIM BURADA ve yanlış yapılırsa yedek zinciri PARA YAKAR.** İstem R-20'ye
    // takıldıysa ikinci sağlayıcı da reddeder — aynı duvara üç kez çarpmanın tek etkisi
    // gecikme. Bütçe tavanı dolduysa yedeğe geçmek tavanı DELMEK olur. İptal bir
    // KARARDIR ve karara yedek aranmaz.
    for (const k of ['validation', 'cancelled', 'config', 'internal'] as const)
      expect(yedegeGec(e(k)), k).toBe(false)
  })
})

describe('yedekZinciri', () => {
  it('kazanan ÖNCE, yedekler skor sırasıyla', () => {
    expect(yedekZinciri('a', ['b', 'c'])).toEqual(['a', 'b', 'c'])
  })

  it('kazanan yedek listesinde de varsa İKİ KEZ denenmiyor', () => {
    // İkinci deneme birinciyle aynı sonucu verir — sadece parayı ve süreyi ikiye katlar.
    expect(yedekZinciri('a', ['a', 'b'])).toEqual(['a', 'b'])
  })

  it('zincir TAVANLA sınırlı — sekiz sağlayıcı sekiz çağrılık gecikme olmaz', () => {
    expect(yedekZinciri('a', ['b', 'c', 'd', 'e'])).toEqual(['a', 'b', 'c'])
    expect(yedekZinciri('a', ['b', 'c', 'd'], 2)).toEqual(['a', 'b'])
  })

  it('yedek YOKSA zincir yalnız kazanandır — boş dönmüyor', () => {
    // Boş bir zincir, adımı hiç denemeden düşürürdü.
    expect(yedekZinciri('a', [])).toEqual(['a'])
    expect(yedekZinciri('a', [], 0)).toEqual(['a'])
  })
})
