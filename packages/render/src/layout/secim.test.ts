// Düzen seçimi — girdi→çıktı tablosu (§7.1 · FAZ-10.4).
//
// Tablo biçiminde, çünkü seçim kuralları bir ÖNCELİK SIRASI taşıyor ve sıranın kendisi
// bir karar: bir blok hem alıntı hem sayısal olabilir. Tek tek `it()` yazmak sırayı
// görünmez yapardı; tablo onu okunur kılıyor.

import { describe, expect, it } from 'vitest'
import type { Block } from '@suite/kernel'
import { duzenSec } from './secim.js'
import { LAYOUTS } from './adlar.js'

const b = (text: string): Block => ({ type: 'body', text })
const h = (text: string): Block => ({ type: 'heading', level: 1, text })

describe('duzenSec — içerikten düzen', () => {
  const tablo: readonly [string, readonly Block[], string][] = [
    ['tek güçlü cümle', [h('Ölçmediğiniz bir hattı iyileştiremezsiniz')], 'statement'],
    ['iddia + kanıt', [h('Fire azaldı'), b('Hurda oranı %4 seviyesine indi.')], 'claim-proof'],
    [
      'sayı ama birimsiz — iddia DEĞİL',
      [h('Sürüm 3 yayında'), b('Yeni ekran geldi.')],
      'statement',
    ],
    ['madde işaretli liste', [b('- ölç'), b('- karşılaştır'), b('- düzelt')], 'list'],
    ['numaralı liste', [b('1. vardiya girişi'), b('2. sayım'), b('3. mutabakat')], 'list'],
    ['üç gövde bloğu — liste sayılır', [b('bir'), b('iki'), b('üç')], 'list'],
    ['iki gövde bloğu — liste DEĞİL', [h('Başlık'), b('bir')], 'statement'],
    ['tırnakla başlayan alıntı', [b('"Ölçmeden yönetemezsiniz."')], 'quote'],
    ['Türkçe tırnak', [b('«Vardiya devri bir bilgi kaybıdır.»')], 'quote'],
    ['kaynak atfı', [b('Ölçüm bir disiplindir.'), b('— Üretim Müdürü')], 'quote'],
    ['boş içerik', [], 'statement'],
    ['yalnız görsel', [{ type: 'image', src: 'x.png', alt: 'a' } as Block], 'statement'],
  ]

  for (const [ad, bloklar, beklenen] of tablo) {
    it(`${ad} → ${beklenen}`, () => {
      expect(duzenSec(bloklar)).toBe(beklenen)
    })
  }

  it('ÖNCELİK: alıntı, sayısal iddiayı yener', () => {
    // Tırnak içindeki bir cümle, içinde yüzde geçse de alıntı olarak okunur —
    // biçim, içeriğe baskındır.
    expect(duzenSec([b('"Fire %4 seviyesine indi."')])).toBe('quote')
  })

  it('ÖNCELİK: liste, sayısal iddiayı yener', () => {
    expect(duzenSec([b('- fire %4'), b('- duruş 12 dakika'), b('- hurda 3 ton')])).toBe('list')
  })

  it('her zaman KAPALI enum içinden bir değer döner', () => {
    // Enum'a yeni değer eklemek bir KARAR; seçim fonksiyonunun onu sessizce
    // genişletmesi, kapalılığın anlamını yok ederdi.
    const ornekler: readonly Block[][] = [
      [],
      [h('x')],
      [b('- a'), b('- b')],
      [b('"alıntı"')],
      [b('%50 arttı')],
    ]
    for (const o of ornekler) expect(LAYOUTS).toContain(duzenSec(o))
  })

  it('DETERMİNİSTİK — aynı girdi hep aynı düzen', () => {
    // Golden test ve tekrar üretilebilirlik buna bağlı: seçim değişirse sayfalama
    // değişir, sayfalama değişirse slayt sayısı ve hayalet rakamlar değişir.
    const girdi = [h('Fire azaldı'), b('Hurda oranı %4 seviyesine indi.')]
    const ilk = duzenSec(girdi)
    for (let i = 0; i < 20; i += 1) expect(duzenSec(girdi)).toBe(ilk)
  })
})
