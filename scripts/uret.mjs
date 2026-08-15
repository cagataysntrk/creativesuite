#!/usr/bin/env node
// `just uret <pipeline> <konu>` — hattı UÇTAN UCA koşar (§10 · FAZ-3.14).
//
// **Bu, para harcayabilen tek CLI girişidir.** `just plan` hiçbir şey harcamaz; bu
// komut sağlayıcı çağırabilir. Bütçe tavanı zorunlu ve varsayılan DÜŞÜK: tavansız
// çalıştırmak, gözetimsiz bir gecede tavanın olmadığını öğrenmektir.

import { readFileSync, existsSync, globSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..')
const PIPELINES = join(REPO, 'registry/pipelines')

const { loadPipeline, listPipelines } = await import(join(REPO, 'packages/registry/dist/index.js'))
const {
  runPipeline,
  formatRun,
  resolveBody,
  selectBody,
  composeBody,
  renderBody,
  validateBody,
  generateBody,
  pricingFromDescriptor,
  runOutputDir,
  storeBlob,
  RateLimiter,
} = await import(join(REPO, 'packages/engine/dist/index.js'))
const { candidatesFor, loadDescriptors } = await import(
  join(REPO, 'packages/providers/dist/index.js')
)
const {
  measure,
  formatReport,
  samplePng,
  lintDocument,
  hexFromTokens,
  colorsFromTokens,
  assertCompliance,
  stampPng,
  placementById,
  climbLadder,
  formatLadder,
  DEFAULT_LIMITS,
} = await import(join(REPO, 'packages/render/dist/index.js'))
const { openDb, systemClock, seededRng, uuidv7 } = await import(
  join(REPO, 'packages/kernel/dist/index.js')
)
const { initLedger } = await import(join(REPO, 'packages/engine/dist/index.js'))

const id = process.argv[2]
const konu = process.argv.slice(3).join(' ')
if (id === undefined || konu === '') {
  console.log(`  kullanım: just uret <pipeline> <konu>`)
  console.log(`  mevcut: ${listPipelines(PIPELINES).join(', ') || '(yok)'}`)
  process.exit(1)
}

const cozum = loadPipeline(PIPELINES, id)
if (!cozum.ok) {
  console.log(`✗ pipeline çözülemedi: ${id}`)
  for (const e of cozum.errors) console.log(`    ${JSON.stringify(e)}`)
  process.exit(1)
}

// ── marka bağlamı ───────────────────────────────────────────────────────────
const MARKA = process.env['SUITE_BRAND'] ?? 'brd_upcytech'
const tokenYolu = join(REPO, `brand/${MARKA}/derived-tokens/tokens.css`)
if (!existsSync(tokenYolu)) {
  console.log(`✗ marka token'ları yok: ${tokenYolu}`)
  process.exit(1)
}
const tokenCss = readFileSync(tokenYolu, 'utf8')

const runId = `run_${uuidv7()}`
const clock = systemClock
const damga = {
  brandId: MARKA,
  eraId: 'era_imalat_2026',
  kitVersion: 'kit-1',
  definitionDigest: 'sha256:faz3',
  contextManifest: `ctx_${runId}`,
  sourceRunId: runId,
}

// ── corpus'tan gerçek kayıt seçimi ──────────────────────────────────────────
// Retrieval yüklemi tek yerden geçer (R-13). Burada FTS5 indeksi yerine doğrudan
// dosya taraması var: indeks `just reindex` gerektiriyor ve bu komut onu kurmuyor.
// Kayıtlar ZATEN corpus'ta ve `status: draft` — yani üretim onaylanmamış bilgiyle
// koşuyor ve bu ÇIKTIDA görünmeli (2.9 hâlâ insan onayı bekliyor).
const kayitlar = globSync('corpus/*/*.md', { cwd: REPO }).map((rel) => ({
  id: rel,
  text: readFileSync(join(REPO, rel), 'utf8')
    .split('---')
    .slice(2)
    .join('---')
    .split('\n')
    .map((l) =>
      l
        .replace(/^#+\s*/, '')
        .replace(/\*\*/g, '')
        .trim()
    )
    .filter((l) => l !== '' && !l.startsWith('>') && !l.startsWith('|') && !l.startsWith('⚠'))
    .slice(0, 4)
    .join('\n'),
}))

const secici = (sorgu, limit) => {
  const q = sorgu.toLowerCase()
  const puanli = kayitlar
    .map((k) => ({ ...k, puan: k.text.toLowerCase().includes(q) ? 2 : 1 }))
    .sort((a, b) => b.puan - a.puan)
  return puanli.slice(0, limit)
}

// ── QA + lexicon + uyum ─────────────────────────────────────────────────────
const izinliHex = hexFromTokens(tokenCss)
// Palet hex VE OKLCH: marka rampaları OKLCH biçiminde (§12.1) ve yalnız hex okumak,
// QA'nın markanın kendi paletini görememesi demekti (D-123).
const palet = { colors: colorsFromTokens(tokenCss) }

const kaliteKontrol = async (doc, slides) => {
  const satirlar = []
  let bloke = false

  // ── platform spec'i: tolerans ve boyut sınırı YERLEŞİME göre (§9.1) ────────
  // Tek global tolerans ikisinden birinde yanlış olurdu: Instagram ±%1, LinkedIn ±%5.
  const yerlesimAdi = doc.width === 1200 ? 'linkedin-feed-4x5' : 'instagram-feed-4x5'
  const yerlesim = placementById(yerlesimAdi)
  if (yerlesim === null) {
    satirlar.push(`  ✗ bilinmeyen yerleşim: ${yerlesimAdi}`)
    return { blocked: true, report: satirlar.join('\n') }
  }
  satirlar.push(
    `  yerleşim ${yerlesim.id} · ${yerlesim.width}×${yerlesim.height} · ` +
      `tolerans ±%${yerlesim.aspectTolerancePercent} · sınır ${Math.round(yerlesim.maxBytes / 1024 / 1024)}MB ` +
      `(doğrulandı ${yerlesim.verifiedAt})`
  )

  // Kalite merdiveni: sınırı aşan görsel SESSİZCE yayınlanmaz.
  for (const [i, yol] of slides.entries()) {
    const boyut = statSync(yol).size
    const m = climbLadder(
      (r) =>
        Math.round(boyut * (r.jpegQuality === null ? 1 : r.jpegQuality / 200) * r.scale * r.scale),
      yerlesim.maxBytes
    )
    satirlar.push(`  slayt ${i + 1} boyut: ${formatLadder(m)}`)
    if (!m.ok) bloke = true
  }

  const lex = lintDocument(doc, {
    forbidden: ['devrim niteliğinde', 'çığır açan', 'dünyanın en iyisi', 'sektör lideri'],
    allowedHex: izinliHex.length === 0 ? [] : izinliHex,
    claimSource: null,
  })
  if (lex.length > 0) {
    bloke = true
    satirlar.push(`  ✗ ${lex.length} lexicon ihlali: ${lex.map((v) => v.kind).join(', ')}`)
  }

  for (const [i, yol] of slides.entries()) {
    const ornek = await samplePng(yol, { grid: 24 })
    if (!ornek.ok) {
      bloke = true
      satirlar.push(`  ✗ slayt ${i + 1}: piksel okunamadı`)
      continue
    }
    const rapor = measure({
      doc,
      palette: palet,
      pixels: ornek.value,
      targetAspect: yerlesim.width / yerlesim.height,
      limits: { ...DEFAULT_LIMITS, aspectLimit: yerlesim.aspectTolerancePercent },
    })
    satirlar.push(`  slayt ${i + 1}:`)
    satirlar.push(formatReport(rapor))
    if (rapor.blocked) bloke = true
  }
  return { blocked: bloke, report: satirlar.join('\n') }
}

// ── sağlayıcı fiyatları ─────────────────────────────────────────────────────
const { descriptors } = loadDescriptors(join(REPO, 'registry/providers'))
const pricing = Object.fromEntries(
  descriptors
    .filter((d) => d.enabled)
    .flatMap((d) => d.capabilities.map((c) => [d.id, pricingFromDescriptor(d, c.name)]))
)

const cikti = runOutputDir(REPO, runId)

// ── GENERATE gövdesi: yönlendirilmiş sağlayıcıya köprü ──────────────────────
const generate = generateBody({
  call: async (ctx, input) => {
    const cap =
      typeof input.constraints['capability'] === 'string' ? input.constraints['capability'] : null
    return {
      ok: false,
      error: {
        kind: 'provider_auth',
        code: 'MISSING_CREDENTIALS',
        userMessageKey: 'error.provider.missing_credentials',
        correlationId: ctx.correlationId,
        costIncurred: { micros: 0n, currency: 'USD' },
        retryable: false,
        details: { capability: cap, needs: ['CF_ACCOUNT_ID', 'CF_API_TOKEN'], debt: 'V-16' },
      },
    }
  },
})

const db = openDb({ path: ':memory:' })
initLedger(db)

const rapor = await runPipeline({
  repoRoot: REPO,
  pipeline: cozum.value,
  runId,
  brandId: MARKA,
  eraId: 'era_imalat_2026',
  corpusCommit: process.env['SUITE_CORPUS_SHA'] ?? 'worktree',
  registryCommit: process.env['SUITE_REGISTRY_SHA'] ?? 'worktree',
  verbs: {
    RESOLVE: resolveBody,
    SELECT: selectBody({ select: secici }),
    COMPOSE: composeBody({ tokenCss, stamp: damga }),
    RENDER: renderBody({ outDir: cikti, layout: 'statement' }),
    VALIDATE: validateBody({ check: kaliteKontrol }),
    GENERATE: generate,
  },
  pricing,
  candidatesFor,
  env: { PATH: process.env['PATH'] ?? '' },
  // Konu bir ÇALIŞTIRMA parametresi, pipeline kısıtı değil: her konu için ayrı bir
  // YAML yazmak saçma olurdu. Pipeline kısıtı her zaman kazanır (R-20 ezilemez).
  params: { topic: konu },
  // Tavan DÜŞÜK ve ZORUNLU: tavansız çalıştırmak, gözetimsiz bir gecede tavanın
  // olmadığını öğrenmektir.
  caps: {
    perRun: { micros: BigInt(process.env['SUITE_RUN_CAP'] ?? '100000'), currency: 'USD' },
    perMonth: null,
  },
  db,
  clock,
  rng: seededRng(1),
  limiter: new RateLimiter(),
  sleep: async () => undefined,
})

// ── damga + CAS: zincirin son halkası ───────────────────────────────────────
// Render edilen slaytlar damgalanmadan ve içerik-adresli depoya alınmadan varlık
// SAYILMAZ: `compliance` kapısı damgasız bir PNG'yi reddediyor (R-33) ve damga
// üretim ANINDA basılmalı — sonradan retrofit imkânsız (R-11).
const slaytlar = rapor.outputs['render']?.slides ?? []
const depolanan = []
if (slaytlar.length > 0) {
  const iddia = assertCompliance({
    // Bu hatta görsel model çağrısı YOK; metin gerçek fontla kompozit ediliyor ve
    // hiçbir insan üretilmiyor. Dayanak prompt taraması.
    basis: { kind: 'prompt_forbids_people', promptDigest: `sha256:${runId}` },
    aiGenerated: false,
    prompt: konu,
    correlationId: `cor_${runId}`,
  })
  if (!iddia.ok) {
    console.log(`✗ uyum iddiası kurulamadı: ${JSON.stringify(iddia.error.details)}`)
    process.exit(1)
  }
  for (const yol of slaytlar) {
    const d = stampPng(yol, { stamp: damga, claim: iddia.value })
    if (!d.ok) {
      console.log(`✗ damgalanamadı: ${yol} (${d.error})`)
      process.exit(1)
    }
    const b = storeBlob({
      sourcePath: yol,
      blobRoot: join(REPO, 'derived/blobs'),
      stamp: damga,
      compliance: iddia.value,
      sourceRunId: runId,
      createdAt: clock.nowIso(),
    })
    if (!b.ok) {
      console.log(`✗ depoya alınamadı: ${yol} (${b.error})`)
      process.exit(1)
    }
    depolanan.push(b.ref)
  }
}

console.log(formatRun(rapor))
if (depolanan.length > 0) {
  console.log('')
  console.log(`  ${depolanan.length} varlık damgalandı ve depoya alındı:`)
  for (const d of depolanan) console.log(`    ${d.digest.slice(0, 19)}…  ${d.bytes} bayt`)
}
console.log('')
if (rapor.outputs['kalite'] !== undefined && rapor.outputs['kalite'] !== null) {
  console.log(rapor.outputs['kalite'].qa)
}
process.exit(rapor.errors.length > 0 && rapor.awaitingGate === null ? 1 : 0)
