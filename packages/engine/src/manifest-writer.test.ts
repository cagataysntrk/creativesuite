import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { makeTempDir, type TempDir } from '@suite/kernel/testing'
import { manifestPath, runDir } from '@suite/kernel'
import type { RunManifest, StepRecord } from '@suite/kernel'
import { usd, ZERO_USD, type BrandId, type EraId, type RunId, type StepId } from '@suite/contracts'
import { canPublish, costVariance, readManifest, writeManifest } from './manifest-writer.js'

const RUN = 'run_0192f3a1-0000-7000-8000-000000000050' as RunId

let tmp: TempDir
beforeEach(() => {
  tmp = makeTempDir('suite-manifest-')
})
afterEach(() => tmp.cleanup())

const adim = (over: Partial<StepRecord> = {}): StepRecord => ({
  stepId: 'stp_gorsel' as StepId,
  verb: 'GENERATE',
  lane: 'premium',
  capability: 'image.generate',
  providerId: 'fal-flux',
  model: null,
  seed: 42,
  params: { aspect: '4:5' },
  estimatedCost: { low: usd(25_000n), high: usd(50_000n) },
  actualCost: usd(28_000n),
  candidates: [
    {
      providerId: 'fal-flux',
      capability: 'image.generate',
      selected: true,
      rejectionReason: null,
      estimatedCost: { low: usd(25_000n), high: usd(50_000n) },
    },
    {
      providerId: 'cloudflare-workers-ai',
      capability: 'image.generate',
      selected: false,
      rejectionReason: 'premium şeridinde değil (desteklediği: free)',
      estimatedCost: null,
    },
  ],
  startedAt: '2026-08-15T09:00:00.000Z',
  finishedAt: '2026-08-15T09:00:12.000Z',
  ...over,
})

const manifest = (over: Partial<RunManifest> = {}): RunManifest => ({
  runId: RUN,
  brandId: 'brd_upcytech' as BrandId,
  eraId: 'era_imalat_2026' as EraId,
  pipeline: 'instagram-post',
  corpusCommit: 'abc1234',
  registryCommit: 'def5678',
  createdAt: '2026-08-15T09:00:00.000Z',
  steps: [adim()],
  decisions: [
    { gate: 'insan-onayi', decision: 'approved', at: '2026-08-15T09:05:00.000Z', note: null },
  ],
  context: [{ recordId: 'rec_1', section: 'konum', tokens: 120, reason: 'aktif konumlandırma' }],
  contextRetentionDays: 90,
  ...over,
})

describe('manifest yazımı', () => {
  it('temiz manifest yazılıyor ve GERİ OKUNUYOR', () => {
    const r = writeManifest({ repoRoot: tmp.path, manifest: manifest() })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.path).toBe(manifestPath(RUN))
    expect(existsSync(join(tmp.path, r.path))).toBe(true)

    const okunan = readManifest(tmp.path, RUN)
    expect(okunan?.corpusCommit).toBe('abc1234')
    // `bigint` gidiş-dönüş: `JSON.stringify` bigint'i ATAR ve manifest bu düzeltme
    // olmadan hiç yazılamıyordu. Number'a çevirmek de yasak — 2^53 üstü mikro
    // değerler sessizce yuvarlanır ve defter yanlış toplar.
    expect(typeof okunan?.steps[0]?.actualCost?.micros).toBe('bigint')
    expect(okunan?.steps[0]?.actualCost?.micros).toBe(28_000n)
    expect(okunan?.steps[0]?.estimatedCost.high.micros).toBe(50_000n)
    expect(okunan?.steps[0]?.candidates).toHaveLength(2)
    // KAYBEDEN gerekçesiyle yazılı — §8.2 aşama 5'in kalıcı hâli.
    expect(okunan?.steps[0]?.candidates[1]?.rejectionReason).toContain('şeridinde değil')
  })

  it('KUSURLU manifest HİÇ YAZILMIYOR', () => {
    // Yarım bir defter, defter olmadığını söylemez: "manifest var" kontrolü geçer ve
    // eksik ancak birileri açıp okuduğunda fark edilir.
    const r = writeManifest({ repoRoot: tmp.path, manifest: manifest({ corpusCommit: '' }) })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.defects.some((d) => d.kind === 'missing_field')).toBe(true)
    expect(existsSync(join(tmp.path, manifestPath(RUN)))).toBe(false)
  })

  it('adımsız manifest reddediliyor', () => {
    const r = writeManifest({ repoRoot: tmp.path, manifest: manifest({ steps: [] }) })
    expect(r.ok).toBe(false)
  })

  it('metered adım maliyetsiz YAZILAMIYOR', () => {
    const r = writeManifest({
      repoRoot: tmp.path,
      manifest: manifest({
        steps: [adim({ actualCost: null, finishedAt: '2026-08-15T09:01:00.000Z' })],
      }),
    })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.defects.some((d) => d.kind === 'metered_step_without_cost')).toBe(true)
  })
})

describe('`bigint` para gidiş-dönüşü (R-41)', () => {
  it('dosyada DİZE olarak yazılıyor — okunabilir ve kayıpsız', () => {
    writeManifest({ repoRoot: tmp.path, manifest: manifest() })
    const ham = readFileSync(join(tmp.path, manifestPath(RUN)), 'utf8')
    expect(ham).toContain('"micros": "28000"')
    expect(ham).not.toContain('"micros": 28000')
  })

  it('2^53 üstü tutar KAYIPSIZ dönüyor', () => {
    // Number'a çevrilseydi bu değer sessizce yuvarlanırdı.
    const buyuk = 9_007_199_254_740_993n
    writeManifest({
      repoRoot: tmp.path,
      manifest: manifest({ steps: [adim({ actualCost: usd(buyuk) })] }),
    })
    expect(readManifest(tmp.path, RUN)?.steps[0]?.actualCost?.micros).toBe(buyuk)
  })

  it('okunan manifest üstünde `costVariance` ÇALIŞIYOR', () => {
    // Revive olmasaydı `micros` dize kalır ve `+` toplama yerine BİRLEŞTİRME yapardı:
    // "28000" + "10000" = "2800010000" — sessiz ve felaket.
    writeManifest({ repoRoot: tmp.path, manifest: manifest() })
    const okunan = readManifest(tmp.path, RUN)
    expect(okunan).not.toBeNull()
    if (okunan === null) return
    expect(costVariance(okunan).actual.micros).toBe(28_000n)
  })
})

describe("manifest'siz varlık YAYINLANAMAZ (§13)", () => {
  it('manifest yoksa yayın yok', () => {
    expect(canPublish(tmp.path, RUN)).toBe(false)
  })

  it('BOŞ `{}` dosyası manifest SAYILMIYOR', () => {
    // İki ayrı soru: manifest VAR MI ve manifest TEMİZ Mİ. İkincisi olmadan boş bir
    // dosya "manifest var" sayılırdı.
    const y = join(tmp.path, manifestPath(RUN))
    mkdirSync(join(tmp.path, runDir(RUN)), { recursive: true })
    writeFileSync(y, '{}')
    expect(canPublish(tmp.path, RUN)).toBe(false)
  })

  it('BOZUK JSON manifest SAYILMIYOR', () => {
    const y = join(tmp.path, manifestPath(RUN))
    mkdirSync(join(tmp.path, runDir(RUN)), { recursive: true })
    writeFileSync(y, '{ bozuk')
    expect(readManifest(tmp.path, RUN)).toBeNull()
    expect(canPublish(tmp.path, RUN)).toBe(false)
  })

  it('temiz manifest yayına izin veriyor', () => {
    writeManifest({ repoRoot: tmp.path, manifest: manifest() })
    expect(canPublish(tmp.path, RUN)).toBe(true)
  })
})

describe('tahmini vs gerçek maliyet sapması', () => {
  it('sapma tahminin ÜST sınırına göre', () => {
    // Kullanıcı onaylarken gördüğü sayı üst sınırdır; sapma "onayladığım rakamı aştı mı"
    // sorusunu cevaplamalı. Ortalamaya göre hesaplasaydık her çalıştırma yarı yarıya
    // sapmış görünürdü ve %20 eşiği anlamını kaybederdi.
    const v = costVariance(manifest())
    expect(v.estimatedHigh.micros).toBe(50_000n)
    expect(v.actual.micros).toBe(28_000n)
    expect(v.variancePercent).toBeCloseTo(-44, 0)
    expect(v.significant).toBe(true)
  })

  it('tahmine yakın gerçek sapma SAYILMIYOR', () => {
    const v = costVariance(manifest({ steps: [adim({ actualCost: usd(45_000n) })] }))
    expect(v.variancePercent).toBeCloseTo(-10, 0)
    expect(v.significant).toBe(false)
  })

  it('tahmini AŞAN gerçek pozitif sapma veriyor', () => {
    const v = costVariance(manifest({ steps: [adim({ actualCost: usd(70_000n) })] }))
    expect(v.variancePercent).toBeCloseTo(40, 0)
    expect(v.significant).toBe(true)
  })

  it('sıfır tahminde oran TANIMSIZ — bölme hatası değil', () => {
    const v = costVariance(
      manifest({
        steps: [adim({ estimatedCost: { low: ZERO_USD, high: ZERO_USD }, actualCost: ZERO_USD })],
      })
    )
    expect(v.variancePercent).toBeNull()
    expect(v.significant).toBe(false)
  })

  it('çok adımlı çalıştırmada maliyetler TOPLANIYOR', () => {
    const v = costVariance(
      manifest({
        steps: [
          adim({ stepId: 'a' as StepId, actualCost: usd(10_000n) }),
          adim({ stepId: 'b' as StepId, actualCost: usd(20_000n) }),
        ],
      })
    )
    expect(v.actual.micros).toBe(30_000n)
    expect(v.estimatedHigh.micros).toBe(100_000n)
  })
})

// ── Gömülü yük elemesi: R-52 ile R-64 çakışması (FAZ-14.1) ──────────────────
//
// Gerçek koşuda ölçüldü: manifest 580 KB çıktı ve R-64'ün 512 KB tavanını aştı — yani
// defteri commit'lemek (R-52) ile büyük dosyayı git'e sokmamak (R-64) çakıştı.
// Şişiren iki alan: `fontCss` 414 KB (her koşuda AYNI, zaten `brand/` altında izlenen
// marka fontu) ve bir görselin `src` data URI'si 385 KB.
//
// ⚠ Test MODÜLÜ değil ÜRETİM YOLUNU sınıyor: `writeManifest` çağrılıyor ve dosya
// diskten geri okunuyor. Bu fazda tam tersi hata üç kez yaşandı — modül yeşil, üretim
// yolu hiç çağırmıyor (D-261).

describe('defter KANIT tutar, yük değil', () => {
  // Gerçek koşuda ölçülen iki alan: gömülü font 414 KB, görsel data URI 385 KB.
  const FONT = `@font-face{src:url(data:font/woff2;base64,${'A'.repeat(414_000)})}`
  const GORSEL = `data:image/jpeg;base64,${'C'.repeat(385_000)}`
  const QA = 'B'.repeat(3_000)

  const yukluManifest = (): RunManifest =>
    manifest({
      steps: [
        adim({
          output: {
            document: { fontCss: FONT, tokenCss: QA, blocks: [{ type: 'image', src: GORSEL }] },
          },
        }),
      ],
    })

  it('8 KB üstü dize DIGEST ile eleniyor, altı AYNEN kalıyor', () => {
    const r = writeManifest({ repoRoot: tmp.path, manifest: yukluManifest() })
    expect(r.ok).toBe(true)
    const ham = readFileSync(join(tmp.path, manifestPath(RUN)), 'utf8')
    // 400 KB'lık font gitmiş, yerinde digest var.
    expect(ham).not.toContain('A'.repeat(200))
    expect(ham).not.toContain('C'.repeat(200))
    expect(ham).toContain('«elenmis sha256:')
    expect(ham).toContain(`${FONT.length}B`)
    // 3 KB'lık `tokenCss` KANIT ve korunuyor — eşik kanıtı yükten ayırıyor.
    expect(ham).toContain('B'.repeat(200))
  })

  it('manifest R-64 tavanının ALTINDA kalıyor', () => {
    // Elemesiz hâlde bu manifest ~800 KB olurdu — gerçek koşuda 580 KB ölçüldü ve
    // `repo-hygiene` kapısını kırmızıya düşürdü. Eleme kaldırılırsa bu test kırmızı.
    writeManifest({ repoRoot: tmp.path, manifest: yukluManifest() })
    const boyut = readFileSync(join(tmp.path, manifestPath(RUN))).length
    expect(boyut).toBeLessThan(512 * 1024)
    expect(FONT.length + GORSEL.length).toBeGreaterThan(512 * 1024)
  })

  it('DIGEST içeriğe bağlı — hangi byte olduğu KANITLANABİLİYOR', () => {
    const oku = (dolgu: string): string => {
      writeManifest({
        repoRoot: tmp.path,
        manifest: manifest({ steps: [adim({ output: { x: dolgu.repeat(9_000) } })] }),
      })
      return readFileSync(join(tmp.path, manifestPath(RUN)), 'utf8')
    }
    const a = oku('A')
    const b = oku('B')
    expect(a).not.toBe(b)
    expect(oku('A')).toBe(a) // deterministik
  })

  it('para HÂLÂ ondalık dize — bigint davranışı bozulmadı', () => {
    writeManifest({ repoRoot: tmp.path, manifest: yukluManifest() })
    const geri = readManifest(tmp.path, RUN)
    expect(geri?.steps[0]?.estimatedCost.low.micros).toBe(25_000n)
  })
})
