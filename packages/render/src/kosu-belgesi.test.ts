// Editör DÜZENLENMİŞ belgeyi mi açıyor (§7.1 · D-301 · D-302).
//
// ⚠ ⚠ Depo sahibi: *"editörde düzenleyince elle düzenlenmiş versiyon koşu sayfasına
// geliyor ama tekrar koşuyu editörde aç deyince eskisini açıyor."* Yapılan iş diskte
// duruyordu; okuyan taraf onu hiç sormuyordu. Bu dosya, sorulduğunu ölçüyor.

import { describe, expect, it } from 'vitest'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { ASIL_BELGE, ELLE_BELGE, kosuBelgeYolu, kosuBelgesiniOku } from './kosu-belgesi.js'

const kur = (dosyalar: Readonly<Record<string, unknown>>): string => {
  const kok = mkdtempSync(join(tmpdir(), 'kosu-belgesi-'))
  for (const [ad, icerik] of Object.entries(dosyalar)) {
    writeFileSync(join(kok, ad), JSON.stringify(icerik))
  }
  return kok
}

describe('kosuBelgeYolu', () => {
  it('ELLE düzenlenmiş varsa O geçerli — insanın kararı hattın çıktısını ezer', () => {
    const d = kur({ [ASIL_BELGE]: { kim: 'hat' }, [ELLE_BELGE]: { kim: 'insan' } })
    expect(kosuBelgeYolu(d)).toBe(join(d, ELLE_BELGE))
  })

  it('elle sürüm yoksa ASIL belge', () => {
    const d = kur({ [ASIL_BELGE]: { kim: 'hat' } })
    expect(kosuBelgeYolu(d)).toBe(join(d, ASIL_BELGE))
  })

  it('hiçbiri yoksa `null` — boş bir yol dönmüyor', () => {
    expect(kosuBelgeYolu(kur({}))).toBeNull()
  })

  it('`sadeceAsil` elle sürümü GÖRMEZDEN geliyor — sıfırlama düğmesi için', () => {
    const d = kur({ [ASIL_BELGE]: { kim: 'hat' }, [ELLE_BELGE]: { kim: 'insan' } })
    expect(kosuBelgeYolu(d, true)).toBe(join(d, ASIL_BELGE))
  })
})

describe('kosuBelgesiniOku', () => {
  it('elle sürümü okuyor ve BUNU söylüyor', () => {
    const d = kur({
      [ASIL_BELGE]: { kim: 'hat', gorseller: [] },
      [ELLE_BELGE]: { kim: 'insan', gorseller: [] },
    })
    const r = kosuBelgesiniOku<{ kim: string }>(d)
    expect(r?.belge.kim).toBe('insan')
    expect(r?.elle).toBe(true)
  })

  it('sıfırlama yolunda ASIL belge dönüyor', () => {
    const d = kur({
      [ASIL_BELGE]: { kim: 'hat', gorseller: [] },
      [ELLE_BELGE]: { kim: 'insan', gorseller: [] },
    })
    const r = kosuBelgesiniOku<{ kim: string }>(d, true)
    expect(r?.belge.kim).toBe('hat')
    expect(r?.elle).toBe(false)
  })

  it('görseller GÖMÜLÜ dönüyor — çağıran ikinci bir çeviri yazmasın', () => {
    const d = kur({ [ASIL_BELGE]: { gorseller: [{ src: 'yok.png' }] } })
    // Dosya yok: `src` BOŞ. Ölçülen şey çevirinin KOŞTUĞU — dosya adı olduğu gibi
    // kalsaydı Chromium onu çözemez ve slayt görselsiz çıkardı.
    const r = kosuBelgesiniOku<{ gorseller: { src: string }[] }>(d)
    expect(r?.belge.gorseller[0]?.src).toBe('')
  })

  it('bozuk JSON `null` — yarım belge çizime verilmiyor', () => {
    const kok = mkdtempSync(join(tmpdir(), 'kosu-belgesi-bozuk-'))
    writeFileSync(join(kok, ASIL_BELGE), '{ yarım')
    expect(kosuBelgesiniOku(kok)).toBeNull()
  })
})
