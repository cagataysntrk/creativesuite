import { describe, expect, it } from 'vitest'
import { mkdirSync, mkdtempSync, readdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { RUNS_DIR, manifestPath, publishedLedgerPath } from '@suite/kernel'
import { doktorMetni, doktorRaporu } from './doktor.js'

const BUGUN = '2026-08-16'

/** Manifest kablo biçimi diskteki gerçek dosyadan okundu (D-174). */
const manifest = (o: { runId: string; tahminUst: string; gercek: string }) => ({
  runId: o.runId,
  brandId: 'brd_upcytech',
  eraId: 'imalat-2026',
  pipeline: 'instagram-post',
  corpusCommit: 'a'.repeat(40),
  registryCommit: 'b'.repeat(40),
  createdAt: '2026-08-16T09:00:00.000Z',
  decisions: [],
  context: [],
  contextRetentionDays: null,
  steps: [
    {
      stepId: 'gorsel',
      verb: 'GENERATE',
      lane: 'premium',
      capability: 'image.generate',
      providerId: 'p1',
      model: null,
      seed: 1,
      params: {},
      estimatedCost: {
        low: { micros: '1000', currency: 'USD' },
        high: { micros: o.tahminUst, currency: 'USD' },
      },
      actualCost: { micros: o.gercek, currency: 'USD' },
      candidates: [
        {
          providerId: 'p1',
          capability: 'image.generate',
          selected: true,
          rejectionReason: null,
          estimatedCost: null,
        },
      ],
      startedAt: 'S',
      finishedAt: 'S',
    },
  ],
})

const kur = (): string => mkdtempSync(join(tmpdir(), 'suite-dok-'))

const manifestYaz = (kok: string, m: ReturnType<typeof manifest>): void => {
  mkdirSync(join(kok, RUNS_DIR, m.runId), { recursive: true })
  writeFileSync(join(kok, manifestPath(m.runId)), JSON.stringify(m))
}

describe('doctor', () => {
  it('koşan ve ATLANAN denetimleri ayrı bildirir — atlanan denetim "temiz" değildir', () => {
    const r = doktorRaporu({ repoRoot: kur(), bugun: BUGUN })
    // İndeks ve git verilmedi: rapor bunu söylemeli, sessizce temiz göstermemeli.
    expect(r.atlananDenetimler.map((a) => a.ad).sort()).toEqual([
      'defter/git',
      'fiyat',
      'indeks',
      // `insight` de atlanıyor: yayın defteri yok, yani ölçülecek varlık da yok.
      // Post atmamış bir sistemde "insight alınmadı" demek yanlış alarmdır ve
      // yanlış alarm doğru alarmı öldürür (FAZ-7.8).
      'insight',
      'kayit',
      // `token` de atlanıyor: fikstür deposunda `secrets/token-durumu.json` yok ve
      // dosyanın YOKLUĞU "token sağlıklı" DEĞİL, "denetlenemedi" demek (FAZ-7.6).
      'token',
    ])
    expect(r.kosanDenetimler).toContain('spec')
  })

  // 🧪 İHLAL TESTİ — %20 eşiği GERÇEKTEN ölçülüyor mu.
  // Fikstür (D-181): iki çalıştırma, biri eşiğin altında biri üstünde. Eşik kalkarsa
  // ikisi de raporlanır; eşik hep doğru dönerse hiçbiri raporlanmaz. Her iki bozulma
  // da testi kırar.
  it('%20 üstü maliyet sapmasını raporlar, altındakini raporlamaz', () => {
    const kok = kur()
    // tahmin üst 1000, gerçek 1100 → %10 sapma (eşiğin ALTINDA)
    manifestYaz(kok, manifest({ runId: 'run_az', tahminUst: '1000', gercek: '1100' }))
    // tahmin üst 1000, gerçek 2000 → %100 sapma (eşiğin ÜSTÜNDE)
    manifestYaz(kok, manifest({ runId: 'run_cok', tahminUst: '1000', gercek: '2000' }))

    const r = doktorRaporu({ repoRoot: kok, bugun: BUGUN })
    const maliyet = r.bulgular.filter((b) => b.alan === 'maliyet')
    expect(maliyet.map((b) => b.hedef)).toEqual(['run_cok'])
    expect(maliyet[0]?.mesaj).toContain('%100.0 sapma')
  })

  it('manifest YOKSA ve varlık VARSA öksüz raporlar; boş dizini raporlamaz', () => {
    const kok = kur()
    mkdirSync(join(kok, RUNS_DIR, 'run_bos'), { recursive: true })
    mkdirSync(join(kok, RUNS_DIR, 'run_oksuz'), { recursive: true })
    writeFileSync(join(kok, RUNS_DIR, 'run_oksuz', 'slayt.png'), 'x')

    const r = doktorRaporu({ repoRoot: kok, bugun: BUGUN })
    const defter = r.bulgular.filter((b) => b.alan === 'defter')
    expect(defter.map((b) => b.hedef)).toEqual(['run_oksuz'])
    expect(defter[0]?.siddet).toBe('kritik')
  })

  it('upstream yoksa KRİTİK — `git clone` ile kurtarma imkânsız (12. yasa)', () => {
    const yok = doktorRaporu({
      repoRoot: kur(),
      bugun: BUGUN,
      git: { pushEdilmemis: null, commitlenmemisDefterSatiri: 0 },
    })
    expect(yok.bulgular.some((b) => b.siddet === 'kritik' && b.mesaj.includes('upstream'))).toBe(
      true
    )

    // Güncel bir repo hiçbir defter bulgusu üretmemeli — yani kural sabit değil, ölçüm.
    const guncel = doktorRaporu({
      repoRoot: kur(),
      bugun: BUGUN,
      git: { pushEdilmemis: 0, commitlenmemisDefterSatiri: 0 },
    })
    expect(guncel.bulgular.filter((b) => b.alan === 'defter')).toEqual([])
  })

  it('metin çıktısı atlanan denetimleri GİZLEMEZ', () => {
    const metin = doktorMetni(doktorRaporu({ repoRoot: kur(), bugun: BUGUN }))
    expect(metin).toContain('⊘ indeks atlandı')
    expect(metin).toContain('koşan:')
  })

  it('hiçbir dosya değiştirmez — dizin içeriği raporlamadan önce ve sonra AYNI', () => {
    const kok = kur()
    manifestYaz(kok, manifest({ runId: 'run_a', tahminUst: '1000', gercek: '5000' }))
    writeFileSync(join(kok, RUNS_DIR, 'run_a', 'slayt.png'), 'x')
    const once = readdirSync(join(kok, RUNS_DIR, 'run_a')).sort()

    doktorRaporu({ repoRoot: kok, bugun: BUGUN })

    expect(readdirSync(join(kok, RUNS_DIR, 'run_a')).sort()).toEqual(once)
  })

  // 🧪 FAZ-7.8 ihlal testi: ölçüm işini DURDUR → doctor susmamalı.
  //
  // Fikstür bir yayın taşıyor ve hiç ölçüm yok. İkisi birden gerekli: yayın olmadan
  // denetim atlanır (doğru davranış), yayın varken susmak ise sessiz veri kaybıdır.
  it('ölçüm işi durduğunda insight bulgusu KRİTİK olur ve kalıcı kaybı ayırır', () => {
    const kok = kur()
    mkdirSync(join(kok, RUNS_DIR), { recursive: true })
    writeFileSync(
      join(kok, publishedLedgerPath()),
      `${JSON.stringify({
        digest: 'sha256:a',
        platform: 'instagram',
        externalId: '179',
        runId: 'run_x',
        publishedAt: '2026-04-01T09:00:00.000Z',
      })}\n`
    )
    const r = doktorRaporu({ repoRoot: kok, bugun: BUGUN })
    const insight = r.bulgular.filter((b) => b.alan === 'insight')
    expect(r.kosanDenetimler).toContain('insight')
    expect(insight.some((b) => b.siddet === 'kritik' && b.mesaj.includes('backfill'))).toBe(true)
    // **Kurtarılamayan kayıp ayrı sayılır.** "Eksik veri" demek, bir gün
    // doldurulacağını ima ederdi; 90 günü geçen gün bitmiştir.
    expect(insight.some((b) => b.mesaj.includes('KALICI'))).toBe(true)
  })
})
