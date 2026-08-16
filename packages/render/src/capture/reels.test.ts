import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cropFor, deriveReels, reelsHataMesaji, textBand } from './reels.js'
import { loadTimeline, type CaptureTimeline } from './timeline.js'
import { placementById } from '../specs/placements.js'

const REELS = placementById('instagram-story-9x16')!
const REPO = join(import.meta.dirname, '../../../..')

const cizgi = (
  targets: { label: string; at: number; chapter: boolean; x?: number }[]
): CaptureTimeline => ({
  width: 1920,
  height: 1080,
  fps: 60,
  targets: targets.map((t) => ({
    label: t.label,
    at: t.at,
    box: { x: t.x ?? 860, y: 400, width: 200, height: 100 },
    chapter: t.chapter,
  })),
})

const ANLATI = { giris: 'Giriş metni', olcum: 'Ölçüm metni', kapanis: 'Kapanış metni' }

describe('9:16 kırpma penceresi', () => {
  it('genişlik ÇİFT — h264 tek boyutu sessizce yuvarlar', () => {
    // 1080 * 9/16 = 607.5 → 608 (çift).
    const c = cropFor({ width: 1920, height: 1080 }, REELS, 960)
    expect(c?.width).toBe(608)
    expect(c!.width % 2).toBe(0)
    expect(c?.height).toBe(1080)
  })

  it('hedefin MERKEZİNE oturuyor', () => {
    const c = cropFor({ width: 1920, height: 1080 }, REELS, 960)
    // 960 - 304 = 656
    expect(c?.x).toBe(656)
  })

  // 🧪 İHLAL TESTİ — kenetleme. Fikstür (D-181): biri kenarda biri ortada; kenetleme
  // kalkarsa kenardaki negatif x alır ve ffmpeg siyah kenar üretir.
  it('kenara yakın hedefte pencere KENETLENİYOR, kaynağın dışına çıkmıyor', () => {
    const sol = cropFor({ width: 1920, height: 1080 }, REELS, 50)
    expect(sol?.x).toBe(0)
    const sag = cropFor({ width: 1920, height: 1080 }, REELS, 1900)
    expect(sag?.x).toBe(1920 - 608)
    // Orta hedef kenetlenmiyor — yani kural gerçekten koşulu okuyor.
    expect(cropFor({ width: 1920, height: 1080 }, REELS, 960)?.x).toBe(656)
  })

  it('kaynak 9:16 için darsa null — sessizce esnetmiyor', () => {
    expect(cropFor({ width: 400, height: 1080 }, REELS, 200)).toBeNull()
  })
})

describe('deterministik türetme', () => {
  it('bölüm işareti YOKSA reddediyor — tahmin YAPMIYOR (adımın 🧪 kriteri)', () => {
    const r = deriveReels(cizgi([{ label: 'a', at: 0, chapter: false }]), 30, ANLATI, REELS)
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.errors).toEqual([{ kind: 'no_chapters' }])
    expect(reelsHataMesaji(r.errors[0]!)).toContain('tahmin yapmaz')
  })

  it('AYNI demo AYNI reels — deterministik', () => {
    const t = cizgi([
      { label: 'giris', at: 0, chapter: true },
      { label: 'olcum', at: 10, chapter: true },
    ])
    const a = deriveReels(t, 25, ANLATI, REELS)
    const b = deriveReels(t, 25, ANLATI, REELS)
    expect(a).toEqual(b)
    expect(a.ok && a.value.map((x) => [x.id, x.startSec, x.endSec])).toEqual([
      ['giris', 0, 10],
      ['olcum', 10, 25],
    ])
  })

  it('son bölüm zaman çizgisinin SONUNA kadar — son hedefin anına kadar değil', () => {
    const t = cizgi([{ label: 'giris', at: 0, chapter: true }])
    const r = deriveReels(t, 42, ANLATI, REELS)
    expect(r.ok && r.value[0]?.endSec).toBe(42)
  })

  it('çok KISA bölümü reddediyor — 3 sn altı klip değil, karedir', () => {
    const t = cizgi([
      { label: 'giris', at: 0, chapter: true },
      { label: 'olcum', at: 1, chapter: true },
    ])
    const r = deriveReels(t, 20, ANLATI, REELS)
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.errors.map((e) => e.kind)).toEqual(['too_short'])
  })

  it('çok UZUN bölümü reddediyor — nereden kesileceği bir KARAR', () => {
    const t = cizgi([{ label: 'giris', at: 0, chapter: true }])
    const r = deriveReels(t, 120, ANLATI, REELS)
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(reelsHataMesaji(r.errors[0]!)).toContain('bölümü ikiye ayırın')
  })

  it('anlatısı olmayan bölümü SESSİZ geçmiyor', () => {
    const t = cizgi([{ label: 'bilinmeyen', at: 0, chapter: true }])
    const r = deriveReels(t, 20, ANLATI, REELS)
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.errors.map((e) => e.kind)).toContain('no_narration')
  })

  it('gerçek `demos/upcyman` üçlüsünden reels türüyor', () => {
    const t = loadTimeline(
      (y) => readFileSync(y, 'utf8'),
      join(REPO, 'demos/upcyman/timeline.json')
    )
    expect(t.ok).toBe(true)
    if (!t.ok) return
    const anlatiHam = JSON.parse(
      readFileSync(join(REPO, 'demos/upcyman/narration.tr.json'), 'utf8')
    ) as { bolumler: { id: string; metin: string }[] }
    const anlati = Object.fromEntries(anlatiHam.bolumler.map((b) => [b.id, b.metin]))
    const r = deriveReels(t.value, 20, anlati, REELS)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.value.map((x) => x.id)).toEqual(['giris', 'olcum', 'kapanis'])
    // Her klip 9:16 kırpma penceresi taşıyor ve kaynağın içinde.
    for (const k of r.value) {
      expect(k.crop.width).toBe(608)
      expect(k.crop.x + k.crop.width).toBeLessThanOrEqual(1920)
    }
  })
})

describe('güvenli alan', () => {
  it('metin bandı Reels UI’ının dışında — %14 üst, %35 alt, %6 yan', () => {
    const b = textBand(REELS)
    expect(b.y).toBe(Math.round(0.14 * 1920))
    expect(b.x).toBe(Math.round(0.06 * 1080))
    // Kullanılabilir yükseklik: 1920 - %14 - %35 = %51
    expect(b.height).toBe(1920 - Math.round(0.14 * 1920) - Math.round(0.35 * 1920))
  })
})
