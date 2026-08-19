// Konu seçimi ADAYLARA karşı doğrulanıyor (§11.4 · D-308).
//
// ⚠ ⚠ Bu dosya gerçek bir koşu durduktan sonra yazıldı: istem adayları
// `[tur] baslik` diye listeliyordu ve model "başlığı birebir kopyala" talimatını
// harfiyen uygulayıp ÖN EKİ de kopyaladı. Doğrulama reddetti, hat durdu. Model
// yanlış davranmadı — istem belirsizdi. Ders: **kendi biçimimize toleranslıyız,
// uydurmaya değil.**

import { describe, expect, it } from 'vitest'
import { konuSecPromptu, konuSecimiCozumle, type KonuAdayi } from './konu-sec.js'

const ADAYLAR: readonly KonuAdayi[] = [
  { baslik: 'Veri katmanından karara', tur: 'positioning' },
  { baslik: 'Excel ve vardiya defteri', tur: 'competitor' },
]

describe('konu seçimi çözümleme', () => {
  it('temiz cevap kabul ediliyor', () => {
    const r = konuSecimiCozumle(
      '{"konu": "Veri katmanından karara", "gerekce": "kanıtı var"}',
      ADAYLAR
    )
    expect(r).toEqual({ konu: 'Veri katmanından karara', gerekce: 'kanıtı var' })
  })

  it('BİZİM süslemelerimiz soyuluyor — ön ek, tür parantezi, satır numarası', () => {
    for (const ham of [
      '{"konu": "[positioning] Veri katmanından karara"}',
      '{"konu": "Veri katmanından karara   (tür: positioning)"}',
      '{"konu": "3. Veri katmanından karara"}',
    ]) {
      expect(konuSecimiCozumle(ham, ADAYLAR)?.konu).toBe('Veri katmanından karara')
    }
  })

  it('UYDURULMUŞ konu REDDEDİLİYOR — kaynaksız konu, kaynaksız iddianın başlangıcı', () => {
    expect(konuSecimiCozumle('{"konu": "Bugün aklıma gelen bir şey"}', ADAYLAR)).toBeNull()
  })

  // ⚠ ⚠ **GERÇEK KOŞU:** model önce yanlış anahtarla yazdı, sonra "Düzeltme:" deyip
  // İKİNCİ bir JSON ekledi. Açgözlü `/\{[\s\S]*\}/` ikisini birden yutuyor, sonuç
  // geçersiz JSON ve adım duruyordu. Modelin SON sözü, düzeltmesidir.
  it('model kendini düzeltirse SON nesne okunuyor', () => {
    const ham =
      '{"konu": "Veri katmanından karara", "gerecke": "yanlış anahtar"} ' +
      'Düzeltme: {"konu": "Excel ve vardiya defteri", "gerekce": "doğrusu"}'
    expect(konuSecimiCozumle(ham, ADAYLAR)).toEqual({
      konu: 'Excel ve vardiya defteri',
      gerekce: 'doğrusu',
    })
  })

  it('önünde açıklama olan JSON okunuyor', () => {
    const ham = 'Seçimim şu: {"konu": "Veri katmanından karara", "gerekce": "kanıt"}'
    expect(konuSecimiCozumle(ham, ADAYLAR)?.konu).toBe('Veri katmanından karara')
  })

  it('JSON olmayan cevap reddediliyor', () => {
    expect(konuSecimiCozumle('Bence Excel konusu iyi olur.', ADAYLAR)).toBeNull()
  })

  it('istem başlığı ÖNCE, türü SONRA gösteriyor — belirsizliğin kaynağı buydu', () => {
    const p = konuSecPromptu({ adaylar: ADAYLAR, islenmisSayisi: 4 }) ?? ''
    expect(p).toContain('1. Veri katmanından karara')
    expect(p).toContain('(tür: positioning)')
    expect(p).not.toContain('[positioning]')
  })

  it('aday yoksa istem `null` — konusuz koşan hat markadan gelmeyen metin üretir', () => {
    expect(konuSecPromptu({ adaylar: [], islenmisSayisi: 0 })).toBeNull()
  })
})
