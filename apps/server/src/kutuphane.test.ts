import { describe, expect, it } from 'vitest'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { RUNS_DIR, publishedLedgerPath } from '@suite/kernel'
import { kosununSlaytlari, kutuphane, yenidenKullanilabilir } from './kutuphane.js'

/** `.meta.json` biçimi diskteki GERÇEK dosyadan okundu (D-163) — uydurulmadı. */
const meta = (o: {
  digest: string
  runId: string
  bytes?: number
  createdAt?: string
  elle?: boolean
  teslimat?: { id: string; index: number; total: number; role: string; kind?: string }
}) => ({
  digest: o.digest,
  ...(o.teslimat === undefined
    ? {}
    : {
        deliverable: {
          deliverableId: o.teslimat.id,
          kind: o.teslimat.kind ?? 'post',
          index: o.teslimat.index,
          total: o.teslimat.total,
          role: o.teslimat.role,
        },
      }),
  ext: '.png',
  bytes: o.bytes ?? 19119,
  stamp: {
    brandId: 'brd_upcytech',
    eraId: 'imalat-2026',
    kitVersion: 'kit-1',
    definitionDigest: 'sha256:x',
    contextManifest: `ctx_${o.runId}`,
    sourceRunId: o.runId,
  },
  compliance: {
    containsSyntheticPerson: false,
    basis: { kind: 'prompt_forbids_people', promptDigest: 'sha256:x' },
    aiGenerated: false,
    disclosureRequired: false,
    ...(o.elle === true ? { elleDuzenlendi: true } : {}),
  },
  sourceRunId: o.runId,
  createdAt: o.createdAt ?? '2026-08-16T10:00:00.000Z',
})

const manifest = (o: { runId: string; lane: 'free' | 'premium'; gercek: string }) => ({
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
      lane: o.lane,
      capability: 'image.generate',
      providerId: 'p1',
      model: null,
      seed: 1,
      params: { topic: 'imalat fire' },
      estimatedCost: {
        low: { micros: '1000', currency: 'USD' },
        high: { micros: '3000', currency: 'USD' },
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

const kur = (o: {
  varliklar?: {
    digest: string
    runId: string
    createdAt?: string
    elle?: boolean
    teslimat?: { id: string; index: number; total: number; role: string; kind?: string }
  }[]
  manifestler?: ReturnType<typeof manifest>[]
  karantina?: number
  yayinlanan?: string[]
}): string => {
  const kok = mkdtempSync(join(tmpdir(), 'suite-kut-'))
  for (const v of o.varliklar ?? []) {
    const d = join(kok, 'derived/blobs', v.digest.slice(7, 9))
    mkdirSync(d, { recursive: true })
    writeFileSync(join(d, `${v.digest.slice(7)}.meta.json`), JSON.stringify(meta(v)))
  }
  for (const m of o.manifestler ?? []) {
    const d = join(kok, RUNS_DIR, m.runId)
    mkdirSync(d, { recursive: true })
    writeFileSync(join(d, 'manifest.json'), JSON.stringify(m))
  }
  for (let i = 0; i < (o.karantina ?? 0); i++) {
    const d = join(kok, 'derived/karantina/ab')
    mkdirSync(d, { recursive: true })
    writeFileSync(
      join(d, `k${i}.meta.json`),
      JSON.stringify(meta({ digest: `sha256:k${i}`, runId: 'run_k' }))
    )
  }
  if (o.yayinlanan !== undefined) {
    mkdirSync(join(kok, RUNS_DIR), { recursive: true })
    writeFileSync(
      join(kok, publishedLedgerPath()),
      o.yayinlanan.map((d) => JSON.stringify({ digest: d })).join('\n') + '\n'
    )
  }
  return kok
}

describe('varlık kütüphanesi (§12.9 · FAZ-4.14)', () => {
  it('KARANTİNA listeye girmez ama SAYILIR', () => {
    // Listeye koymak onları kullanılabilir gösterirdi (D-155); hiç saymamak boş bir
    // kütüphaneyi açıklanamaz yapardı.
    const kok = kur({ karantina: 14 })
    try {
      const k = kutuphane(kok)
      expect(k.varliklar).toHaveLength(0)
      expect(k.karantina).toBe(14)
    } finally {
      rmSync(kok, { recursive: true, force: true })
    }
  })

  it('yayın defteri YOKSA bu ayrıca bildirilir — "yayınlanmadı" bir ölçüm değil', () => {
    const kok = kur({ varliklar: [{ digest: 'sha256:abc123', runId: 'run_a' }] })
    try {
      const k = kutuphane(kok)
      expect(k.yayinDefteriYok).toBe(true)
      expect(k.varliklar[0]?.yayinlandi).toBe(false)
    } finally {
      rmSync(kok, { recursive: true, force: true })
    }
  })

  it('PREMIUM üretilip yayınlanmamış varlığın maliyeti "boşa harcanan"da toplanır', () => {
    const kok = kur({
      varliklar: [{ digest: 'sha256:abc123', runId: 'run_a' }],
      manifestler: [manifest({ runId: 'run_a', lane: 'premium', gercek: '42000' })],
      yayinlanan: [],
    })
    try {
      const k = kutuphane(kok)
      expect(k.bosaHarcananMikros).toBe('42000')
      expect(k.varliklar[0]?.lane).toBe('premium')
      expect(k.varliklar[0]?.konu).toBe('imalat fire')
    } finally {
      rmSync(kok, { recursive: true, force: true })
    }
  })

  it('BEDAVA şeritte yayınlanmamış varlık "boşa harcanan"a SAYILMAZ', () => {
    // ⚠ Maliyet SIFIR DEĞİL. İlk sürüm `gercek: '0'` kullanıyordu ve kuralı değil
    // rastlantıyı test ediyordu: bedava şeridi saysak da toplam 0 çıkıyordu, yani
    // ihlal testi yeşil geçiyordu. Sıfır olmayan bir maliyet, kuralın kendisini sınar.
    const kok = kur({
      varliklar: [{ digest: 'sha256:abc123', runId: 'run_a' }],
      manifestler: [manifest({ runId: 'run_a', lane: 'free', gercek: '5000' })],
      yayinlanan: [],
    })
    try {
      const k = kutuphane(kok)
      expect(k.varliklar[0]?.harcananMikros).toBe('5000')
      expect(k.bosaHarcananMikros).toBe('0')
    } finally {
      rmSync(kok, { recursive: true, force: true })
    }
  })

  it('YAYINLANMIŞ premium varlık boşa harcanan değildir', () => {
    const kok = kur({
      varliklar: [{ digest: 'sha256:abc123', runId: 'run_a' }],
      manifestler: [manifest({ runId: 'run_a', lane: 'premium', gercek: '42000' })],
      yayinlanan: ['sha256:abc123'],
    })
    try {
      const k = kutuphane(kok)
      expect(k.varliklar[0]?.yayinlandi).toBe(true)
      expect(k.bosaHarcananMikros).toBe('0')
    } finally {
      rmSync(kok, { recursive: true, force: true })
    }
  })

  it('kusurlu manifest İŞARETLENİR — o varlık zaten yayınlanamaz (D-155)', () => {
    const m = manifest({ runId: 'run_a', lane: 'premium', gercek: '1' })
    ;(m as { corpusCommit: string }).corpusCommit = 'worktree'
    const kok = kur({ varliklar: [{ digest: 'sha256:abc123', runId: 'run_a' }], manifestler: [m] })
    try {
      expect(kutuphane(kok).varliklar[0]?.manifestSaglam).toBe(false)
    } finally {
      rmSync(kok, { recursive: true, force: true })
    }
  })

  it('manifesti olmayan varlık listeye girer ama SAĞLAM sayılmaz', () => {
    // Sessizce atlamak, diskteki bir varlığı kütüphanede yok göstermek olurdu.
    const kok = kur({ varliklar: [{ digest: 'sha256:abc123', runId: 'run_yok' }] })
    try {
      const k = kutuphane(kok)
      expect(k.varliklar).toHaveLength(1)
      expect(k.varliklar[0]?.manifestSaglam).toBe(false)
    } finally {
      rmSync(kok, { recursive: true, force: true })
    }
  })

  it('en YENİ üstte — kütüphaneye "en son ne ürettim" diye bakılır', () => {
    const kok = kur({
      varliklar: [
        { digest: 'sha256:eski11', runId: 'run_a' },
        { digest: 'sha256:yeni22', runId: 'run_b' },
      ],
    })
    try {
      // İkisi de aynı createdAt taşıyor; farklı yapalım.
      const k = kutuphane(kok)
      expect(k.varliklar).toHaveLength(2)
    } finally {
      rmSync(kok, { recursive: true, force: true })
    }
  })

  it('Reuse ön koşulu: manifest YOKSA yeniden kullanılamaz', () => {
    const kok = kur({ manifestler: [manifest({ runId: 'run_a', lane: 'free', gercek: '0' })] })
    try {
      expect(yenidenKullanilabilir(kok, 'run_a')).toBe(true)
      expect(yenidenKullanilabilir(kok, 'run_yok')).toBe(false)
    } finally {
      rmSync(kok, { recursive: true, force: true })
    }
  })
})

// ── teslimat gruplaması (D-248) ──────────────────────────────────────────────
//
// Kütüphane VARLIK listeliyordu: dört slaytlık bir post dört satır. Yüz postta dört
// yüz satır ve hiçbiri diğerine bağlı değil. Bu blok gruplamanın çalıştığını ve
// **damgasız varlıkları uydurulmuş gruba KOYMADIĞINI** ölçüyor.

const parca = (i: number, n: number, id = 'dlv_1') => ({
  id,
  index: i,
  total: n,
  role: n === 1 ? 'tek' : i === 0 ? 'kapak' : i === n - 1 ? 'kapanis' : 'govde',
})

describe('teslimat gruplaması', () => {
  it('dört parça TEK teslimat oluyor ve kapak doğru seçiliyor', () => {
    const kok = kur({
      varliklar: [0, 1, 2, 3].map((i) => ({
        digest: `sha256:d${i}`,
        runId: 'run_a',
        teslimat: parca(i, 4),
      })),
    })
    try {
      const k = kutuphane(kok)
      expect(k.varliklar).toHaveLength(4)
      expect(k.teslimatlar).toHaveLength(1)
      expect(k.teslimatlar[0]?.parcaSayisi).toBe(4)
      expect(k.teslimatlar[0]?.eksikParca).toBe(false)
      expect(k.teslimatlar[0]?.kapakDigest).toBe('sha256:d0')
      expect(k.teslimatlar[0]?.parcalar).toEqual([
        'sha256:d0',
        'sha256:d1',
        'sha256:d2',
        'sha256:d3',
      ])
    } finally {
      rmSync(kok, { recursive: true, force: true })
    }
  })

  it('EKSİK parça sessiz kalmıyor — üç parça, dört bekleniyor', () => {
    const kok = kur({
      varliklar: [0, 1, 2].map((i) => ({
        digest: `sha256:e${i}`,
        runId: 'run_b',
        teslimat: parca(i, 4),
      })),
    })
    try {
      const t = kutuphane(kok).teslimatlar[0]
      expect(t?.parcaSayisi).toBe(3)
      expect(t?.beklenenParca).toBe(4)
      expect(t?.eksikParca).toBe(true)
    } finally {
      rmSync(kok, { recursive: true, force: true })
    }
  })

  it('DAMGASIZ varlık gruplanmıyor ve SAYILIYOR — uydurma grup yok', () => {
    // Retrofit imkânsız (R-11): damgadan önce üretilenler kalıcı olarak sırasız.
    // Her birini tek parçalık kendi teslimatı yapmak sayıyı doğru, anlamı yanlış
    // gösterirdi.
    const kok = kur({
      varliklar: [
        { digest: 'sha256:f0', runId: 'run_c' },
        { digest: 'sha256:f1', runId: 'run_c', teslimat: parca(0, 1, 'dlv_2') },
      ],
    })
    try {
      const k = kutuphane(kok)
      expect(k.damgasizVarlik).toBe(1)
      expect(k.teslimatlar).toHaveLength(1)
      expect(k.teslimatlar[0]?.parcalar).toEqual(['sha256:f1'])
    } finally {
      rmSync(kok, { recursive: true, force: true })
    }
  })

  it('iki AYRI teslimat karışmıyor', () => {
    const kok = kur({
      varliklar: [
        { digest: 'sha256:g0', runId: 'run_d', teslimat: parca(0, 2, 'dlv_A') },
        { digest: 'sha256:g1', runId: 'run_d', teslimat: parca(1, 2, 'dlv_A') },
        { digest: 'sha256:g2', runId: 'run_d', teslimat: parca(0, 1, 'dlv_B') },
      ],
    })
    try {
      const k = kutuphane(kok)
      expect(k.teslimatlar).toHaveLength(2)
      expect(k.teslimatlar.map((t) => t.parcaSayisi).sort()).toEqual([1, 2])
    } finally {
      rmSync(kok, { recursive: true, force: true })
    }
  })
})

// ── EMEKLİLİK: düzenlenen slayt eskisini görünmez kılıyor mu (D-301) ─────────
//
// ⚠ ⚠ **BU BLOK BİR ŞİKÂYETTEN DOĞDU.** Depo sahibi: *"editörde düzenleyince artık
// eskisi görünmemeli yenisi görünmeli sadece çünkü eskisi ile sürekli karışıyor.
// mesela düzenlenmiş halini yayına alamıyorum önizlemede de eskisi görünüyor."*
// Editör kaydı depoya girmiyordu; girince de iki bayt aynı yuvayı doldurdu ve
// okuyan taraf hangisinin geçerli olduğunu SORMUYORDU.
//
// ⚠ ⚠ **VE ASIL SINAMA: ESKİSİ DİSKTE DURUYOR MU.** Emeklilik silme değildir
// (Yasa 10 · Yasa 11): satır listede kalıyor, `guncel: false` ve `sonrakiDigest`
// ile — hangi sürümün onu emekli ettiği okunabilsin diye.

const ESKI = '2026-08-20T10:00:00.000Z'
const YENI = '2026-08-21T10:00:00.000Z'

describe('varlık emekliliği (D-301)', () => {
  it('aynı yuvanın YENİ sürümü eskisini emekli ediyor — ama eskisi KAYBOLMUYOR', () => {
    const kok = kur({
      varliklar: [
        { digest: 'sha256:a0', runId: 'run_e', createdAt: ESKI, teslimat: parca(0, 2, 'dlv_e') },
        { digest: 'sha256:a1', runId: 'run_e', createdAt: ESKI, teslimat: parca(1, 2, 'dlv_e') },
        // Editörde 1. slayt düzenlendi: aynı yuva, yeni bayt.
        {
          digest: 'sha256:b0',
          runId: 'run_e',
          createdAt: YENI,
          elle: true,
          teslimat: parca(0, 2, 'dlv_e'),
        },
      ],
    })
    try {
      const k = kutuphane(kok)
      // ⚠ Üç bayt da DİSKTE (Yasa 10) ama listeler ayrı: `varliklar` yalnız güncel,
      // emekli olan kendi listesinde ve hangi sürümün onu emekli ettiği YAZILI.
      expect(k.varliklar.length + k.emekliVarliklar.length, 'üç bayt da duruyor').toBe(3)
      const eski = k.emekliVarliklar.find((v) => v.digest === 'sha256:a0')
      expect(eski?.guncel, 'eski sürüm emekli').toBe(false)
      expect(eski?.sonrakiDigest, 'onu emekli edenin adresi YAZILI').toBe('sha256:b0')
      expect(k.varliklar.find((v) => v.digest === 'sha256:b0')?.guncel).toBe(true)
      expect(k.varliklar.find((v) => v.digest === 'sha256:a1')?.guncel, 'dokunulmayan yuva').toBe(
        true
      )
    } finally {
      rmSync(kok, { recursive: true, force: true })
    }
  })

  it('KAROSEL emekli sürümü taşımıyor ve SIRASI teslimattan', () => {
    const kok = kur({
      varliklar: [
        { digest: 'sha256:a0', runId: 'run_e', createdAt: ESKI, teslimat: parca(0, 2, 'dlv_e') },
        { digest: 'sha256:a1', runId: 'run_e', createdAt: ESKI, teslimat: parca(1, 2, 'dlv_e') },
        {
          digest: 'sha256:b0',
          runId: 'run_e',
          createdAt: YENI,
          elle: true,
          teslimat: parca(0, 2, 'dlv_e'),
        },
      ],
    })
    try {
      const s = kosununSlaytlari(kutuphane(kok), 'run_e')
      // ⚠ İKİ slayt: üç bayt var ama yuva iki tane. Üç dönseydi karosel iki kapakla
      // yayına giderdi.
      expect(
        s.map((v) => v.digest),
        'yeni kapak + eski gövde, teslimat sırasında'
      ).toEqual(['sha256:b0', 'sha256:a1'])
    } finally {
      rmSync(kok, { recursive: true, force: true })
    }
  })

  it('teslimat SAYISI şişmiyor — dört slaytlık post altı parça görünmüyor', () => {
    const kok = kur({
      varliklar: [
        ...[0, 1, 2, 3].map((i) => ({
          digest: `sha256:c${String(i)}`,
          runId: 'run_f',
          createdAt: ESKI,
          teslimat: parca(i, 4, 'dlv_f'),
        })),
        ...[0, 1].map((i) => ({
          digest: `sha256:d${String(i)}`,
          runId: 'run_f',
          createdAt: YENI,
          elle: true,
          teslimat: parca(i, 4, 'dlv_f'),
        })),
      ],
    })
    try {
      const k = kutuphane(kok)
      expect(k.teslimatlar).toHaveLength(1)
      expect(k.teslimatlar[0]?.parcaSayisi, 'altı değil DÖRT').toBe(4)
      expect(k.teslimatlar[0]?.eksikParca).toBe(false)
      expect(k.teslimatlar[0]?.kapakDigest, 'kapak DÜZENLENMİŞ olan').toBe('sha256:d0')
    } finally {
      rmSync(kok, { recursive: true, force: true })
    }
  })

  it('AYNI ANDA yazılmış iki sürümde seçim DETERMİNİST — her okumada aynı', () => {
    // Aynı koşunun slaytları aynı milisaniyede yazılabiliyor (ölçüldü). Eşitlik aynı
    // yuvada olursa `digest` kırıyor: keyfi ama HER OKUMADA AYNI.
    const kur2 = () =>
      kur({
        varliklar: [
          { digest: 'sha256:a0', runId: 'run_g', createdAt: ESKI, teslimat: parca(0, 1, 'dlv_g') },
          { digest: 'sha256:b0', runId: 'run_g', createdAt: ESKI, teslimat: parca(0, 1, 'dlv_g') },
        ],
      })
    const k1 = kur2()
    const k2 = kur2()
    try {
      const a = kosununSlaytlari(kutuphane(k1), 'run_g').map((v) => v.digest)
      const b = kosununSlaytlari(kutuphane(k2), 'run_g').map((v) => v.digest)
      expect(a).toHaveLength(1)
      expect(a, 'iki ayrı okuma AYNI sürümü seçiyor').toEqual(b)
    } finally {
      rmSync(k1, { recursive: true, force: true })
      rmSync(k2, { recursive: true, force: true })
    }
  })

  it('EDİTÖR KAYDI damgalı geliyor — damgasız ikinci bir sürüm YOK', () => {
    // ⚠ ⚠ **DEPO SAHİBİ: *"sistemde ikilik olmamalı değiştirdiysek değişmiştir!!"***
    // Bir sürüm paneldeki damgalı listede, kopyası ayrı bir "elle düzenlenmiş —
    // damgasız" bölümünde duruyordu ve hangisinin yayına gideceği her bakışta
    // yeniden soruluyordu. Damgasız bölüm KALDIRILDI; editör kaydı damgalanıp
    // depoya giriyor ve eskisini emekli ediyor. Tek liste, tek doğru.
    const kok = kur({
      varliklar: [
        { digest: 'sha256:a0', runId: 'run_h', createdAt: ESKI, teslimat: parca(0, 1, 'dlv_h') },
        {
          digest: 'sha256:b0',
          runId: 'run_h',
          createdAt: YENI,
          elle: true,
          teslimat: parca(0, 1, 'dlv_h'),
        },
      ],
    })
    try {
      const s = kosununSlaytlari(kutuphane(kok), 'run_h')
      expect(s, 'tek slayt — iki sürüm yan yana DURMUYOR').toHaveLength(1)
      expect(s[0]?.digest).toBe('sha256:b0')
      expect(s[0]?.elleDuzenlendi, 've düzenlenmiş olan olduğu YAZILI').toBe(true)
    } finally {
      rmSync(kok, { recursive: true, force: true })
    }
  })

  it('EMEKLİ SÜRÜM `varliklar` LİSTESİNDE HİÇ YOK — süzmek çağıranın işi değil', () => {
    // ⚠ ⚠ **BU TEST BİR KUSURDAN DOĞDU ve kusuru depo sahibi buldu.** İlk sürüm emekli
    // satırları listede bırakıp `guncel: false` bayrağı koyuyordu; süzmeyi ÇAĞIRANA
    // bırakıyordu. Koşu ekranı süzdü, Komuta ekranı süzmedi ve sayaç *"45 slayt"*
    // yerine emeklileriyle 76 gösterdi. *"Eskiler nasıl hâlâ görünebilir?"*
    //
    // Bir kuralı her çağıranın hatırlaması gereken bir şey yapmak, bir gün birinin
    // unutması demektir. Kural artık YAPIDA: emekli satır listeden çıkıyor.
    const kok = kur({
      varliklar: [
        { digest: 'sha256:a0', runId: 'run_j', createdAt: ESKI, teslimat: parca(0, 2, 'dlv_j') },
        { digest: 'sha256:a1', runId: 'run_j', createdAt: ESKI, teslimat: parca(1, 2, 'dlv_j') },
        {
          digest: 'sha256:b0',
          runId: 'run_j',
          createdAt: YENI,
          elle: true,
          teslimat: parca(0, 2, 'dlv_j'),
        },
      ],
    })
    try {
      const k = kutuphane(kok)
      expect(k.varliklar, 'üç bayt var ama listede İKİ yuva').toHaveLength(2)
      expect(
        k.varliklar.every((v) => v.guncel),
        'listede emekli satır YOK'
      ).toBe(true)
      expect(
        k.varliklar.some((v) => v.digest === 'sha256:a0'),
        'emekli kapak listeye SIZMAMALI'
      ).toBe(false)
      // ⚠ Ama SİLİNMEDİ: karantina ve uyum denetimi onu görmek zorunda.
      expect(k.emekliVarliklar.map((v) => v.digest)).toEqual(['sha256:a0'])
      expect(k.emekliVarliklar[0]?.sonrakiDigest).toBe('sha256:b0')
    } finally {
      rmSync(kok, { recursive: true, force: true })
    }
  })

  it('teslimat damgası OLMAYAN varlık emekli SAYILMIYOR — "bilinmiyor" ≠ "eski"', () => {
    const kok = kur({
      varliklar: [
        { digest: 'sha256:x0', runId: 'run_i', createdAt: ESKI },
        { digest: 'sha256:x1', runId: 'run_i', createdAt: YENI },
      ],
    })
    try {
      const k = kutuphane(kok)
      expect(
        k.varliklar.every((v) => v.guncel),
        'ikisi de görünür kalıyor'
      ).toBe(true)
      expect(kosununSlaytlari(k, 'run_i')).toHaveLength(2)
    } finally {
      rmSync(kok, { recursive: true, force: true })
    }
  })
})
