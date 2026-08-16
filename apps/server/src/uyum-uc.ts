// Compliance Panel verisi (§11.3 · R-33 · D-23 · FAZ-8.3).
//
// **Rozet değil, LİMİT KARŞISINDA OKUMA** (§4b). "Uyumlu ✓" hiçbir şey söylemez;
// hangi iddianın neye dayandığı ve neyin ölçülmediği söylenir. Bu ekranın var olma
// sebebi bir onay damgası basmak değil, **hangi varlığın hangi kanıtla yayınlanabilir
// olduğunu** göstermek.
//
// **Üç ayrı bilinmezlik, üç ayrı cümle** (D-175):
//   1. sidecar YOK          → uyum ÖLÇÜLEMEDİ; "uyumsuz" da değil, "uyumlu" da değil
//   2. iddia var, dayanak yok → iddia BEYANDIR; dayanaksız iddia denetlenemez
//   3. ifşa gerekli, damga yok → yayın BLOKLU (Md. 50(2))
//
// **EU AI Act Md. 50, 2 Ağu 2026'dan beri uygulanabilir** — bu panel bir gelecek işi
// değil, iki haftadır yürürlükte olan bir yükümlülüğün görünür yüzü.

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

/** `derived/blobs` yürüyüşü — `kutuphane.ts` ile aynı desen, aynı sidecar biçimi. */
const sidecarlar = (kok: string): readonly string[] => {
  if (!existsSync(kok)) return []
  const out: string[] = []
  const yur = (d: string): void => {
    for (const ad of readdirSync(d)) {
      const t = join(d, ad)
      if (statSync(t).isDirectory()) yur(t)
      else if (ad.endsWith('.meta.json')) out.push(t)
    }
  }
  yur(kok)
  return out
}

export type UyumDurumu =
  /** Sidecar okundu, iddia tam ve dayanaklı. */
  | { readonly kind: 'tam'; readonly dayanak: string }
  /** Sidecar var ama iddia eksik — beyan, iddia değil. */
  | { readonly kind: 'dayanaksiz' }
  /** İfşa gerekli, makine-okunur damga yok → yayın bloklu. */
  | { readonly kind: 'ifsa_eksik' }
  /** Sidecar yok. **Ölçülemedi** — "uyumsuz" DEĞİL. */
  | { readonly kind: 'olculemedi'; readonly neden: string }

export interface UyumSatiri {
  readonly digest: string
  readonly sourceRunId: string
  readonly durum: UyumDurumu
  /** Model üretimi mi — ifşa kararının girdisi, kararın kendisi değil. */
  readonly aiGenerated: boolean | null
  readonly disclosureRequired: boolean | null
  /** Yayınlanabilir mi — uyum tarafının cevabı (kota/token ayrı kapılar). */
  readonly yayinlanabilir: boolean
}

export interface UyumPanosu {
  readonly satirlar: readonly UyumSatiri[]
  /** Ölçülemeyen varlık sayısı — panonun kapsamı, ayrı sayılıyor. */
  readonly olculemeyen: number
  readonly blokluSayisi: number
}

interface Sidecar {
  readonly digest?: string
  readonly sourceRunId?: string
  readonly compliance?: {
    readonly containsSyntheticPerson?: boolean
    readonly basis?: { readonly kind?: string }
    readonly aiGenerated?: boolean
    readonly disclosureRequired?: boolean
  }
}

const durumla = (s: Sidecar): UyumDurumu => {
  const c = s.compliance
  if (c === undefined) return { kind: 'olculemedi', neden: 'sidecar uyum kaydı taşımıyor' }
  // Dayanaksız iddia BEYANDIR: `containsSyntheticPerson: false` tek başına, kimsenin
  // bakmadığı bir kutucuğun işaretlenmesidir (D-23).
  if (typeof c.basis?.kind !== 'string') return { kind: 'dayanaksiz' }
  if (c.disclosureRequired === true) return { kind: 'ifsa_eksik' }
  return { kind: 'tam', dayanak: c.basis.kind }
}

export const uyumPanosu = (repoRoot: string): UyumPanosu => {
  const satirlar: UyumSatiri[] = []

  for (const yol of sidecarlar(join(repoRoot, 'derived/blobs'))) {
    const dosya = yol.split('/').pop() ?? yol
    {
      let s: Sidecar
      try {
        s = JSON.parse(readFileSync(yol, 'utf8')) as Sidecar
      } catch {
        // Okunamayan sidecar "uyumsuz" değil, ÖLÇÜLEMEDİ.
        satirlar.push({
          digest: dosya.replace('.meta.json', ''),
          sourceRunId: '—',
          durum: { kind: 'olculemedi', neden: 'sidecar okunamadı' },
          aiGenerated: null,
          disclosureRequired: null,
          yayinlanabilir: false,
        })
        continue
      }
      const durum = durumla(s)
      satirlar.push({
        digest: s.digest ?? dosya.replace('.meta.json', ''),
        sourceRunId: s.sourceRunId ?? '—',
        durum,
        aiGenerated: s.compliance?.aiGenerated ?? null,
        disclosureRequired: s.compliance?.disclosureRequired ?? null,
        // **Ölçülemeyen varlık yayınlanamaz.** Bilinmeyen uyum, uyum değildir; ve
        // yayınlanmış bir postun uyum kaydı sonradan üretilemez.
        yayinlanabilir: durum.kind === 'tam',
      })
    }
  }

  return {
    satirlar,
    olculemeyen: satirlar.filter((x) => x.durum.kind === 'olculemedi').length,
    blokluSayisi: satirlar.filter((x) => !x.yayinlanabilir).length,
  }
}

export const uyumMesaji = (d: UyumDurumu): string => {
  switch (d.kind) {
    case 'tam':
      return `iddia dayanaklı: ${d.dayanak}`
    case 'dayanaksiz':
      return 'iddia var ama DAYANAK yok — dayanaksız iddia bir beyandır, denetlenemez (D-23)'
    case 'ifsa_eksik':
      return 'AI ifşası gerekli — makine-okunur damga basılana kadar yayın BLOKLU (Md. 50(2))'
    case 'olculemedi':
      return `uyum ÖLÇÜLEMEDİ (${d.neden}) — "uyumsuz" değil, "uyumlu" da değil`
  }
}
