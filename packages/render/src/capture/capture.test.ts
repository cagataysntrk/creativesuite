import { describe, expect, it } from 'vitest'
import { captureArgs, captureHataMesaji, xvfbArgs, type CaptureOptions } from './ffmpeg.js'
import {
  chapters,
  timelineHataMesaji,
  validateTimeline,
  zoomOrigin,
  type CaptureTimeline,
} from './timeline.js'

const OPTS: CaptureOptions = {
  width: 1920,
  height: 1080,
  fps: 60,
  display: ':99',
  outPath: '/tmp/demo.mp4',
}

const hedef = (o: {
  label: string
  at: number
  x?: number
  y?: number
  w?: number
  h?: number
  chapter?: boolean
}) => ({
  label: o.label,
  at: o.at,
  box: { x: o.x ?? 100, y: o.y ?? 100, width: o.w ?? 200, height: o.h ?? 50 },
  chapter: o.chapter ?? false,
})

const cizgi = (targets: ReturnType<typeof hedef>[]): CaptureTimeline => ({
  width: 1920,
  height: 1080,
  fps: 60,
  targets,
})

describe('x11grab argümanları', () => {
  it('imleç ÇİZİLMİYOR — karar yakalama anında verilir', () => {
    const r = captureArgs(OPTS)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const i = r.value.indexOf('-draw_mouse')
    expect(i).toBeGreaterThan(-1)
    expect(r.value[i + 1]).toBe('0')
  })

  it('yuv420p — "daha iyi ama oynamıyor", oynamıyor demektir', () => {
    const r = captureArgs(OPTS)
    expect(r.ok && r.value.includes('yuv420p')).toBe(true)
  })

  // 🧪 İHLAL TESTİ — tek boyut sessizce yuvarlanmamalı. Fikstür (D-181): aynı
  // çağrıda biri çift biri tek; kural kalkarsa ikisi de geçer.
  it('TEK boyutu reddediyor, çift boyutu kabul ediyor', () => {
    const tek = captureArgs({ ...OPTS, width: 1921 })
    expect(tek.ok).toBe(false)
    if (tek.ok) return
    expect(tek.errors.map((e) => e.kind)).toEqual(['odd_dimension'])
    expect(captureHataMesaji(tek.errors[0]!)).toContain('sessizce yuvarlar')
    // Çift boyut geçiyor — yani kural boyutu gerçekten okuyor.
    expect(captureArgs({ ...OPTS, width: 1920 }).ok).toBe(true)
  })

  it('geçersiz ekran adını reddediyor', () => {
    expect(captureArgs({ ...OPTS, display: 'ekran99' }).ok).toBe(false)
    expect(captureArgs({ ...OPTS, display: ':99.0' }).ok).toBe(true)
  })

  it('Xvfb 24 bit derinlik istiyor — 16 bit renk bantlaması ΔE ölçümünü bozar', () => {
    expect(xvfbArgs(OPTS)).toContain('1920x1080x24')
  })
})

describe('timeline.json', () => {
  it('zoom odağı hedefin MERKEZİ — köşe verirsek yakınlaşınca kadraj dışına iter', () => {
    const t = cizgi([hedef({ label: 'düğme', at: 1, x: 860, y: 490, w: 200, h: 100 })])
    // merkez (960, 540) → tam orta.
    expect(zoomOrigin(t, t.targets[0]!)).toBe('50.0% 50.0%')
  })

  // 🧪 İHLAL TESTİ — sıfır alanlı kutu SESSİZ geçmemeli.
  // `boundingBox()` görünmeyen öğe için bunu döndürür ve zoom köşeye gider.
  it('sıfır alanlı kutuyu reddediyor, dolu kutuyu kabul ediyor', () => {
    const bos = validateTimeline(cizgi([hedef({ label: 'gizli', at: 1, w: 0, h: 0 })]))
    expect(bos.ok).toBe(false)
    if (bos.ok) return
    expect(bos.errors.map((e) => e.kind)).toEqual(['empty_box'])
    expect(timelineHataMesaji(bos.errors[0]!)).toContain('boundingBox() boş döndü')
    expect(validateTimeline(cizgi([hedef({ label: 'görünür', at: 1 })])).ok).toBe(true)
  })

  it('ekran dışındaki hedefi reddediyor — zoom oraya giderse siyah kare', () => {
    const r = validateTimeline(cizgi([hedef({ label: 'taşan', at: 1, x: 1900, w: 100 })]))
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.errors.map((e) => e.kind)).toEqual(['out_of_bounds'])
  })

  it('zamanı geriye giden hedefi reddediyor', () => {
    const r = validateTimeline(cizgi([hedef({ label: 'a', at: 5 }), hedef({ label: 'b', at: 2 })]))
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.errors.map((e) => e.kind)).toEqual(['out_of_order'])
  })

  it('bölüm işaretleri süzülüyor — reels klipleri BUNDAN türer, ses enerjisinden değil', () => {
    const t = cizgi([
      hedef({ label: 'giriş', at: 0, chapter: true }),
      hedef({ label: 'ara tıklama', at: 2 }),
      hedef({ label: 'ölçüm', at: 5, chapter: true }),
    ])
    expect(chapters(t).map((h) => h.label)).toEqual(['giriş', 'ölçüm'])
  })

  it('hedefsiz zaman çizgisi bir HATA — zoom türetilemez', () => {
    const r = validateTimeline(cizgi([]))
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.errors).toEqual([{ kind: 'no_targets' }])
  })
})
