// Platform yerleşim spec'leri — **KOD OLARAK** (§9.1 · FAZ-3.15).
//
// Her satır `sourceUrl` + `verifiedAt` taşır ve üç aylık bir iş kaynakları yeniden
// çekip diff'ler. Neden bu kadar titiz: **platform ölçüleri sessizce değişiyor.**
// Meta feed'i 1:1'den 4:5'e taşıdı ve şimdi Instagram feed videosunda bile 9:16
// öneriyor. Tarihsiz bir spec, ne zaman doğru olduğunu söylemez.
//
// **Tolerans platforma göre farklı**: Instagram ±%1, Facebook ±%3, LinkedIn ±%5.
// "Yeterince yakın" bir yeniden boyutlandırma Facebook'tan geçip Instagram'dan
// **reddedilir** — tek bir global tolerans, iki platformdan birinde yanlış olurdu.
//
// **Boyut sınırı bir kalite merdivenidir, bir hata değil.** LinkedIn 5MB'ı aşan bir
// görseli reddeder; sessizce yayınlamaya çalışmak, "3 varlık ürettim" sanıp sıfır
// yayınlamaktır. Merdiven kaliteyi kademeli düşürür ve HANGİ kademede durulduğunu
// söyler.

export interface Placement {
  readonly id: string
  readonly platform: 'instagram' | 'linkedin'
  readonly width: number
  readonly height: number
  /** En-boy sapma toleransı, yüzde. Platforma göre FARKLI (§9.1). */
  readonly aspectTolerancePercent: number
  /** Bayt. Aşılırsa kalite merdiveni devreye girer. */
  readonly maxBytes: number
  /** Kaynak ve doğrulama tarihi — tarihsiz spec, ne zaman doğru olduğunu söylemez. */
  readonly sourceUrl: string
  readonly verifiedAt: string
}

const MB = 1024 * 1024

export const PLACEMENTS: readonly Placement[] = [
  {
    id: 'instagram-feed-4x5',
    platform: 'instagram',
    width: 1080,
    height: 1350,
    aspectTolerancePercent: 1,
    maxBytes: 8 * MB,
    sourceUrl: 'https://help.instagram.com/1631821640426723',
    verifiedAt: '2026-08-15',
  },
  {
    id: 'instagram-story-9x16',
    platform: 'instagram',
    width: 1080,
    height: 1920,
    aspectTolerancePercent: 1,
    maxBytes: 8 * MB,
    sourceUrl: 'https://help.instagram.com/1631821640426723',
    verifiedAt: '2026-08-15',
  },
  {
    id: 'linkedin-feed-4x5',
    platform: 'linkedin',
    width: 1200,
    height: 1500,
    // LinkedIn ±%5: Instagram'ın beş katı. Tek global tolerans ikisinden birinde
    // yanlış olurdu.
    aspectTolerancePercent: 5,
    maxBytes: 5 * MB,
    sourceUrl: 'https://www.linkedin.com/help/linkedin/answer/a563309',
    verifiedAt: '2026-08-15',
  },
  {
    id: 'linkedin-feed-1x1',
    platform: 'linkedin',
    width: 1200,
    height: 1200,
    aspectTolerancePercent: 5,
    maxBytes: 5 * MB,
    sourceUrl: 'https://www.linkedin.com/help/linkedin/answer/a563309',
    verifiedAt: '2026-08-15',
  },
]

export const placementById = (id: string): Placement | null =>
  PLACEMENTS.find((p) => p.id === id) ?? null

/** Spec kaç gün önce doğrulandı — `doctor` üç aylık drift denetimini bununla yapar. */
export const specAgeDays = (p: Placement, today: string): number => {
  const a = Date.parse(`${p.verifiedAt}T00:00:00Z`)
  const b = Date.parse(`${today}T00:00:00Z`)
  if (!Number.isFinite(a) || !Number.isFinite(b)) return Number.POSITIVE_INFINITY
  return Math.floor((b - a) / 86_400_000)
}

// ── kalite merdiveni ─────────────────────────────────────────────────────────

export interface QualityRung {
  /** JPEG kalitesi 1-100. `null` = PNG (kayıpsız), merdivenin ilk basamağı. */
  readonly jpegQuality: number | null
  /** Uzun kenar çarpanı. `1` = orijinal boyut. */
  readonly scale: number
}

/**
 * Basamaklar sırayla denenir; ilk sığan kazanır.
 *
 * **Ölçek en SON düşer.** Önce sıkıştırma kalitesi, sonra boyut: 1200px genişlikte
 * %70 JPEG, 900px genişlikte %90 JPEG'den okunaklıdır ve tipografi ölçek düşünce
 * doğrudan zarar görür (§7.1'in "küçültme yok" ilkesinin yayın tarafındaki karşılığı).
 */
export const QUALITY_LADDER: readonly QualityRung[] = [
  { jpegQuality: null, scale: 1 },
  { jpegQuality: 92, scale: 1 },
  { jpegQuality: 85, scale: 1 },
  { jpegQuality: 75, scale: 1 },
  { jpegQuality: 85, scale: 0.8 },
  { jpegQuality: 75, scale: 0.8 },
]

export type LadderResult =
  | {
      readonly ok: true
      readonly rung: QualityRung
      readonly index: number
      readonly bytes: number
    }
  /** Merdivenin sonu geldi ve hâlâ sığmıyor. **Sessizce yayınlanmaz.** */
  | { readonly ok: false; readonly bytes: number; readonly limit: number }

/**
 * Merdiveni yürür ve sığan ilk basamağı döner.
 *
 * `measureBytes` çağırana ait: bu fonksiyon saf ve senkron kalsın diye. Gerçek
 * sıkıştırma Chromium'da olur (`RENDER`ın işi); burada yalnız KARAR var.
 */
export const climbLadder = (
  measureBytes: (rung: QualityRung) => number,
  limit: number
): LadderResult => {
  let sonBoyut = 0
  for (const [i, rung] of QUALITY_LADDER.entries()) {
    const b = measureBytes(rung)
    sonBoyut = b
    if (b <= limit) return { ok: true, rung, index: i, bytes: b }
  }
  return { ok: false, bytes: sonBoyut, limit }
}

/** İnsan okunur özet — merdivende NEREDE durulduğu görünmeli. */
export const formatLadder = (r: LadderResult): string => {
  if (!r.ok) {
    return (
      `✗ kalite merdiveni tükendi: ${Math.round(r.bytes / 1024)}KB > ` +
      `${Math.round(r.limit / 1024)}KB — içerik azaltılmalı, sessizce yayınlanmaz`
    )
  }
  const k = r.rung.jpegQuality === null ? 'PNG (kayıpsız)' : `JPEG %${r.rung.jpegQuality}`
  const o = r.rung.scale === 1 ? '' : ` · ölçek ×${r.rung.scale}`
  return `✓ basamak ${r.index + 1}/${QUALITY_LADDER.length}: ${k}${o} · ${Math.round(r.bytes / 1024)}KB`
}
