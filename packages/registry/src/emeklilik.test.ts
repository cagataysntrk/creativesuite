// Emekli hat KOŞMADAN ÖNCE söyler ve NEREYE gidileceğini de söyler (R-108 · D-340).
//
// ⚠ ⚠ **BU KUSUR GERÇEK BİR KOŞUDA BULUNDU.** `instagram-carousel` 2026-08-18'de emekli
// edildi (D-268) ama `just uret` onu SESSİZCE çalıştırıyordu. İki hattın adı bir harfle
// ayrılıyor — biri İngilizce (`carousel`), biri Türkçe (`karosel`) — ve yanlış olanı
// koşan bir tur, katalog dışı bir yerleşimle, metin kontrastı **1,1:1** olan bir slayt
// üretti. Emeklilik yalnız YAML BAŞLIĞINDA yazıyordu; kimse koşmadan önce onu okumuyor.
//
// ⚠ **Emekli hat ÇALIŞTIRILABİLİR kalıyor** — Yasa 10: emeklilik silme değildir.
// Değişen tek şey: artık SÖYLÜYOR. Sessiz bir emeklilik, emeklilik değil bir tuzaktır.

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { hatDurumlari, loadPipeline } from './resolve.js'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '../../..')
const HATLAR = join(REPO, 'registry/pipelines')

describe('emeklilik makine okunur', () => {
  it('emekli hat YERİNE GEÇENİ de söylüyor — Yasa 10 iki parçalı', () => {
    const { emekli } = hatDurumlari(HATLAR)
    expect(emekli.length).toBeGreaterThan(0)
    for (const id of emekli) {
      const r = loadPipeline(HATLAR, id)
      expect(r.ok, id).toBe(true)
      if (!r.ok) continue
      // ⚠ `retired: true` tek başına yetmiyor: emekli olduğunu bilmek, NEREYE gideceğini
      // bilmek değildir. İkinci yarısı olmayan bir emeklilik, cevapsız bir soru bırakır.
      expect(r.value.supersededBy, `${id}: yerine geçen hat yazılı değil`).not.toBeNull()
      // Ve gösterdiği hat GERÇEKTEN var olmalı — ölü bir işaretçi, işaretçisizlikten kötü.
      const hedef = loadPipeline(HATLAR, r.value.supersededBy ?? '')
      expect(hedef.ok, `${id} → ${String(r.value.supersededBy)} çözülemedi`).toBe(true)
      expect(hedef.ok && hedef.value.retired, `${id} → emekli bir hatta işaret ediyor`).toBe(false)
    }
  })

  // ⚠ ⚠ **MODÜL DEĞİL ÇAĞRI SINANIYOR** (R-92'nin dersi): `uret.mjs` bir CLI ve emekliliği
  // BASMAZSA hiçbir davranış testi bunu göremez. Bu depoda "modül var, üretim yolu yok"
  // sekiz kez tekrarlandı.
  it('`uret.mjs` emekliliği KOŞMADAN ÖNCE basıyor', () => {
    const kaynak = readFileSync(join(REPO, 'scripts/uret.mjs'), 'utf8')
    const satirlar = kaynak.split('\n').filter((s) => !s.trim().startsWith('//'))
    expect(satirlar.some((s) => s.includes('cozum.value.retired === true'))).toBe(true)
    expect(satirlar.some((s) => s.includes('supersededBy'))).toBe(true)
    expect(kaynak).toContain('EMEKLİ bir hat')
  })
})
