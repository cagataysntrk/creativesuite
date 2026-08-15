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

// Tipler Ring -1'de (D-176): önizleme ekranı `render`ı import edemez ama aynı yapıyı
// çizmek zorunda. Burada VERİ ve doğrulama mantığı var, tanım değil.
import type { Placement, SafeArea, SafeBand } from '@suite/contracts'

export type { Placement, SafeArea, SafeBand }

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
    // Feed görselinde platform chrome'u görselin ÜSTÜNE binmez, altında/üstünde durur.
    safeArea: null,
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
    // Story/Reels'te UI görselin ÜSTÜNDE: üstte profil ve kapatma, altta etkileşim
    // düğmeleri ve açıklama. 1080×1920'de kullanılabilir bant 950×979 (§9.1).
    safeArea: {
      topPercent: 14,
      bottomPercent: 35,
      sidePercent: 6,
      sourceUrl: 'https://about.meta.com/brand/resources/instagram/reels/',
      verifiedAt: '2026-08-16',
    },
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
    safeArea: null,
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
    safeArea: null,
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

// ── güvenli alan (§9.1) ──────────────────────────────────────────────────────
//
// **Güvenli alan yapısaldır, sonradan doğrulanan bir şey değil.** Reels'te platform UI'ı
// görselin ÜSTÜNE biner: üstte profil ve kapatma, altta etkileşim düğmeleri ve açıklama.
// Başlık o bantlara düşerse okunmaz — ve bunu ancak yayınladıktan sonra fark edersiniz.
//
// İçerik kutusu bu koordinatlarda TANIMLANIR; "sonra bakarız" demek, her Reels'te aynı
// hatayı yapıp her seferinde yeniden keşfetmektir.

/** Kullanılabilir bant, piksel. Güvenli alanı olmayan yerleşimde tuvalin tamamı. */
export const safeBand = (p: Placement): SafeBand => {
  if (p.safeArea === null) return { x: 0, y: 0, width: p.width, height: p.height }
  const yan = Math.round((p.safeArea.sidePercent / 100) * p.width)
  const ust = Math.round((p.safeArea.topPercent / 100) * p.height)
  const alt = Math.round((p.safeArea.bottomPercent / 100) * p.height)
  return {
    x: yan,
    y: ust,
    width: p.width - yan * 2,
    height: p.height - ust - alt,
  }
}

export interface Rect {
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

export type SafeAreaViolation =
  | { readonly edge: 'top'; readonly overflowPx: number }
  | { readonly edge: 'bottom'; readonly overflowPx: number }
  | { readonly edge: 'start'; readonly overflowPx: number }
  | { readonly edge: 'end'; readonly overflowPx: number }

/**
 * Bir içerik kutusu güvenli bandın DIŞINA taşıyor mu.
 *
 * Her kenar AYRI raporlanır ve taşma PİKSELLE söylenir: "taşıyor" tek başına
 * düzeltilebilir bir bilgi değil, "üstten 42px taşıyor" düzeltilebilir bir bilgidir.
 */
export const safeAreaViolations = (p: Placement, r: Rect): readonly SafeAreaViolation[] => {
  const b = safeBand(p)
  const v: SafeAreaViolation[] = []
  if (r.y < b.y) v.push({ edge: 'top', overflowPx: b.y - r.y })
  if (r.x < b.x) v.push({ edge: 'start', overflowPx: b.x - r.x })
  const altTasma = r.y + r.height - (b.y + b.height)
  if (altTasma > 0) v.push({ edge: 'bottom', overflowPx: altTasma })
  const sagTasma = r.x + r.width - (b.x + b.width)
  if (sagTasma > 0) v.push({ edge: 'end', overflowPx: sagTasma })
  return v
}

export const safeAreaMessage = (v: SafeAreaViolation): string => {
  const kenar =
    v.edge === 'top'
      ? 'üstten'
      : v.edge === 'bottom'
        ? 'alttan'
        : v.edge === 'start'
          ? 'soldan'
          : 'sağdan'
  return `içerik güvenli alandan ${kenar} ${v.overflowPx}px taşıyor — platform UI'ı örtecek (§9.1)`
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
