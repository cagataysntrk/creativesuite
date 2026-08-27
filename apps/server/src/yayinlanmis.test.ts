// YAYINLANMIŞLIK — aynı gönderi İKİNCİ KEZ yayına girebiliyor mu (FAZ-19.13 · UX-21).
//
// ⚠ ⚠ **BU KAPI BİR RİSKTEN DOĞDU ve riski depo sahibi adlandırdı:** *"böylece
// yayınlananlar belli olur ve tekrar yayına girmez bu çok önemli aynı şey tekrar
// paylaşılmamalı kesinlikle."* Aynı karoseli iki kez paylaşmak geri alınamaz.
//
// ⚠ ⚠ **VE ASIL SINAMA: ÜÇ DEFTERİN ÜÇÜ DE SAYILIYOR MU.** Yayınlanmışlık üç ayrı
// yerde yazılıydı (hat defteri · hedefin bildirdiği durum · insanın beyanı) ve hiçbiri
// ötekini bilmiyordu. Elle yayınlanmış bir gönderi `hazir` listesinde kalıyor, yeniden
// planlanabiliyordu. Aşağıdaki testler üçünü ayrı ayrı kapatıyor.

import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { Kutuphane, VarlikSatiri } from './kutuphane.js'
import { takvimeYaz } from './yayin-takvimi.js'
import { yayinDurumu, yayinlanmisMi } from './yayinlanmis.js'

const RUN = 'run_01a03e9e-7d62-7560-b44d-0cb7225e2883'
const AN = '2026-09-12T09:00:00.000Z'
const kok = (): string => mkdtempSync(join(tmpdir(), 'yayinlanmis-'))

/** Kütüphanenin YALNIZ bu testin okuduğu alanları — geri kalanı ilgisiz. */
const kutuphane = (o: {
  guncel?: { digest: string; yayinlandi: boolean }[]
  emekli?: { digest: string; yayinlandi: boolean }[]
}): Kutuphane => {
  const satir = (x: { digest: string; yayinlandi: boolean }): VarlikSatiri =>
    ({ digest: x.digest, sourceRunId: RUN, yayinlandi: x.yayinlandi }) as unknown as VarlikSatiri
  return {
    varliklar: (o.guncel ?? []).map(satir),
    emekliVarliklar: (o.emekli ?? []).map(satir),
    teslimatlar: [],
    damgasizVarlik: 0,
    karantina: 0,
    yayinDefteriYok: false,
    bosaHarcananMikros: '0',
  }
}

describe('yayınlanmışlık — üç defter, tek cevap', () => {
  it('hiçbir defterde yoksa YAYINLANMADI — ve kapı AÇIK', () => {
    const r = kok()
    const k = kutuphane({ guncel: [{ digest: 'sha256:a', yayinlandi: false }] })
    expect(yayinDurumu(r, RUN, k).yayinlandi).toBe(false)
    expect(yayinlanmisMi(r, RUN, k).engelli).toBe(false)
  })

  it('HAT DEFTERİ yazdıysa kapı KAPALI', () => {
    const r = kok()
    const k = kutuphane({ guncel: [{ digest: 'sha256:a', yayinlandi: true }] })
    const d = yayinDurumu(r, RUN, k)
    expect(d.yayinlandi).toBe(true)
    expect(d.kaynak).toBe('defter')
    const g = yayinlanmisMi(r, RUN, k)
    expect(g.engelli).toBe(true)
    if (g.engelli) expect(g.hata).toContain('ZATEN YAYINLANDI')
  })

  it('ELLE İŞARETLEME kapıyı kapatıyor — sistem göndermedi ama gönderi YAYINDA', () => {
    const r = kok()
    takvimeYaz(r, { runId: RUN, karar: 'elle-yayinlandi', tarih: '2026-09-12', simdi: AN })
    const k = kutuphane({ guncel: [{ digest: 'sha256:a', yayinlandi: false }] })
    const d = yayinDurumu(r, RUN, k)
    expect(d.kaynak).toBe('elle')
    expect(d.tarih).toBe('2026-09-12')
    expect(yayinlanmisMi(r, RUN, k).engelli).toBe(true)
  })

  it('EMEKLİ sürüm yayınlandıysa kapı yine KAPALI — düzenlemek yayından kaldırmaz', () => {
    // ⚠ ⚠ **BU EN SESSİZ SIZINTIYDI.** Yayınlanmış bir karoseli editörde düzeltince
    // eski bayt emekliye düşüyor; yalnız GÜNCEL sürüme bakan bir kural o gönderiyi
    // "hiç yayınlanmamış" sayar ve ikinci kez paylaşırdı.
    const r = kok()
    const k = kutuphane({
      guncel: [{ digest: 'sha256:yeni', yayinlandi: false }],
      emekli: [{ digest: 'sha256:eski', yayinlandi: true }],
    })
    expect(yayinDurumu(r, RUN, k).yayinlandi).toBe(true)
    expect(yayinlanmisMi(r, RUN, k).engelli).toBe(true)
  })

  it('HEDEFE GÖNDERİLMİŞ olmak YAYINLANMIŞ DEĞİLDİR — `planlandi` kapıyı kapatmıyor', () => {
    // ⚠ Yerel paket hedefi `planlandi` yazıyor: klasör hazır, hiçbir yere gitmedi.
    // Onu yayın saymak, indirilmiş bir dosyayı paylaşılmış sanmaktı.
    const r = kok()
    takvimeYaz(r, {
      runId: RUN,
      karar: 'senkron',
      not: 'yerel:planlandi — paket hazır: derived/yayin-paketleri/x',
      simdi: AN,
    })
    const k = kutuphane({ guncel: [{ digest: 'sha256:a', yayinlandi: false }] })
    expect(yayinDurumu(r, RUN, k).yayinlandi).toBe(false)
    expect(yayinlanmisMi(r, RUN, k).engelli).toBe(false)
  })

  it('HEDEF `yayinlandi` bildirdiyse kapı KAPALI', () => {
    const r = kok()
    takvimeYaz(r, {
      runId: RUN,
      karar: 'senkron',
      tarih: '2026-09-12',
      not: 'metricool:yayinlandi:post_991 — gönderi yayında',
      simdi: AN,
    })
    const k = kutuphane({ guncel: [{ digest: 'sha256:a', yayinlandi: false }] })
    const d = yayinDurumu(r, RUN, k)
    expect(d.yayinlandi).toBe(true)
    expect(d.kaynak).toBe('hedef')
  })

  it('BİLİNMEYEN hedef durumu yayın SAYILMIYOR — emin olmadığımız yayın, yayın değildir', () => {
    const r = kok()
    takvimeYaz(r, {
      runId: RUN,
      karar: 'senkron',
      not: 'metricool:kuyrukta:post_991 — sırada',
      simdi: AN,
    })
    const k = kutuphane({ guncel: [{ digest: 'sha256:a', yayinlandi: false }] })
    expect(yayinDurumu(r, RUN, k).yayinlandi).toBe(false)
  })

  it('YANLIŞ İŞARET GERİ ALINABİLİR — kilit kalıcı değil', () => {
    // ⚠ "Yanlışlıkla işaretledim" düzeltilebilir bir hata olmalı; "yanlışlıkla ikinci
    // kez paylaştım" değil. Kapının tek yönlü olması, ilkini kalıcı yapardı.
    const r = kok()
    const k = kutuphane({ guncel: [{ digest: 'sha256:a', yayinlandi: false }] })
    takvimeYaz(r, { runId: RUN, karar: 'elle-yayinlandi', tarih: '2026-09-12', simdi: AN })
    expect(yayinlanmisMi(r, RUN, k).engelli).toBe(true)
    takvimeYaz(r, { runId: RUN, karar: 'geri-al', simdi: AN })
    expect(yayinlanmisMi(r, RUN, k).engelli, 'karar geri alındı, kapı AÇILDI').toBe(false)
  })
})
