import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { chapters, loadTimeline, timelineHataMesaji, zoomOrigin } from './timeline.js'

const REPO = join(import.meta.dirname, '../../../..')
const oku = (yol: string): string | null => {
  try {
    return readFileSync(yol, 'utf8')
  } catch {
    return null
  }
}

describe('demo-video kalıcı üçlüsü', () => {
  // 🧪 İHLAL TESTİ — `timeline.json` YOKSA render yapılamaz (adımın 🧪 kriteri).
  // Fikstür (D-198 deseni): "dosya yok" ile "hedef yok" AYRI hatalar; kural tek
  // hataya sıkışırsa ayrım kaybolur ve hangisinin olduğu bilinmeden hata ayıklanır.
  it('timeline.json YOKSA reddediyor — hedefler bilinmeden zoom yapılamaz', () => {
    const r = loadTimeline(oku, join(REPO, 'demos/upcyman/OLMAYAN.json'))
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.errors.map((e) => e.kind)).toEqual(['missing_file'])
    expect(timelineHataMesaji(r.errors[0]!)).toContain('hiç koşmamış')
  })

  it('BOŞ zaman çizgisi AYRI bir hata — script koştu ama hedef bulamadı', () => {
    const r = loadTimeline(() => '{"width":1920,"height":1080,"fps":60,"targets":[]}', 'x')
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.errors.map((e) => e.kind)).toEqual(['no_targets'])
  })

  it('gerçek `demos/upcyman/timeline.json` GEÇERLİ', () => {
    const r = loadTimeline(oku, join(REPO, 'demos/upcyman/timeline.json'))
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.value.width).toBe(1920)
    expect(r.value.fps).toBe(60)
  })

  it('bölüm işaretleri anlatı bölümleriyle EŞLEŞİYOR', () => {
    const r = loadTimeline(oku, join(REPO, 'demos/upcyman/timeline.json'))
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const anlati = JSON.parse(
      readFileSync(join(REPO, 'demos/upcyman/narration.tr.json'), 'utf8')
    ) as {
      bolumler: { id: string }[]
    }
    // Eşleşme YOKSA video, anlatılmayan bir bölüm gösterir ya da anlatı boşluğa konuşur.
    expect(chapters(r.value).map((h) => h.label)).toEqual(anlati.bolumler.map((b) => b.id))
  })

  it('zoom odağı gerçek hedeften türüyor', () => {
    const r = loadTimeline(oku, join(REPO, 'demos/upcyman/timeline.json'))
    expect(r.ok).toBe(true)
    if (!r.ok) return
    // 'giris': x=760 w=400 → merkez 960 → %50; y=420 h=120 → merkez 480 → %44.4
    expect(zoomOrigin(r.value, r.value.targets[0]!)).toBe('50.0% 44.4%')
  })
})
