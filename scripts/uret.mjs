#!/usr/bin/env node
// `just uret <pipeline> <konu>` — hattı UÇTAN UCA koşar (§10 · FAZ-3.14).
//
// **Bu, para harcayabilen tek CLI girişidir.** `just plan` hiçbir şey harcamaz; bu
// komut sağlayıcı çağırabilir. Bütçe tavanı zorunlu ve varsayılan DÜŞÜK: tavansız
// çalıştırmak, gözetimsiz bir gecede tavanın olmadığını öğrenmektir.

import { readFileSync, existsSync, statSync, mkdirSync } from 'node:fs'
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
  knowledgeCommit,
  RateLimiter,
} = await import(join(REPO, 'packages/engine/dist/index.js'))
const { candidatesFor, loadDescriptors, adapterById } = await import(
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
  DEFAULT_LIMITS,
} = await import(join(REPO, 'packages/render/dist/index.js'))
const { openDb, systemClock, seededRng, newId, readEnv } = await import(
  join(REPO, 'packages/kernel/dist/index.js')
)
const { initLedger } = await import(join(REPO, 'packages/engine/dist/index.js'))
const { selectRecords, selectSearch } = await import(join(REPO, 'packages/corpus/dist/index.js'))

const id = process.argv[2]
// `--devam <run_id>`: mevcut bir çalıştırmanın KARARLARINI okuyup hattı sürdürür.
// Kararlar manifest'ten gelir; bu betik onları ÜRETMEZ, yalnız OKUR (R-14 · D-145).
const devamIndeks = process.argv.indexOf('--devam')
const devamRunId = devamIndeks > 0 ? process.argv[devamIndeks + 1] : undefined
const konu = process.argv
  .slice(3)
  .filter((a, i, arr) => a !== '--devam' && arr[i - 1] !== '--devam')
  .join(' ')
if (id === undefined || (konu === '' && devamRunId === undefined)) {
  console.log(`  kullanım: just uret <pipeline> <konu>`)
  console.log(`  devam:    just uret <pipeline> --devam <run_id>   (konu manifest'ten okunur)`)
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
// Ortam TEK okuyucudan (`secret-okuyucu` darboğazı, §14): dağılmış `process.env`,
// bir ay ihmalden sonra sistemi başlatamamanın en sık sebebi.
const MARKA = readEnv('SUITE_BRAND') ?? 'brd_upcytech'

// Dönem `brand/<id>/current`tan OKUNUR, gömülmez (D-167).
//
// 2026-08-15'e kadar burada `'era_imalat_2026'` yazıyordu; dönemin gerçek adı
// `imalat-2026`. Altı corpus kaydı da aynı yanlış dizeyi taşıyordu, yani retrieval
// yüklemi hiçbirini GÖRMÜYORDU — ve hepsi `draft` olduğu için bu maskeliydi. Onay
// verildiği gün kayıtlar `active` olacak ve HÂLÂ görünmeyecekti.
const AKTIF_DONEM = readFileSync(join(REPO, `brand/${MARKA}/current`), 'utf8').trim()
const tokenYolu = join(REPO, `brand/${MARKA}/derived-tokens/tokens.css`)
if (!existsSync(tokenYolu)) {
  console.log(`✗ marka token'ları yok: ${tokenYolu}`)
  process.exit(1)
}
const tokenCss = readFileSync(tokenYolu, 'utf8')

// Ön ekli kimlik kernel'den (R-06 · `id-uretici` darboğazı): ikinci bir üreteç,
// sıralanamayan ve tipi anlaşılmayan id üretir.
// `--devam` AYNI runId'yi kullanır: idempotency defteri o kimliğe bağlı ve yeni bir
// kimlik, ödenmiş adımları yeniden ödemek demektir (R-44).
const runId = devamRunId ?? newId('RunId')

let kararlar = []
let oncekiManifest = null
let devamKonu = null
if (devamRunId !== undefined) {
  const { readManifest } = await import(join(REPO, 'packages/engine/dist/index.js'))
  oncekiManifest = readManifest(REPO, devamRunId)
  if (oncekiManifest === null) {
    console.log(`✗ devam edilecek çalıştırma bulunamadı: ${devamRunId}`)
    process.exit(1)
  }
  kararlar = oncekiManifest.decisions ?? []
  if (kararlar.length === 0) {
    console.log(`✗ ${devamRunId}: hiç kapı kararı yok — önce: just onay ${devamRunId} onayla`)
    process.exit(1)
  }
  // ── DONMUŞ GİRDİLER yeniden kullanılır (R-07 · D-154) ────────────────────
  //
  // Devam etmek AYNI çalıştırmayı sürdürmektir; girdileri yeniden çözmek başka bir
  // çalıştırma yapmaktır. `idempotencyKey` `corpusCommit` ve `topic` içeriyor
  // (`run.ts`): ikisi değişirse bütün anahtarlar değişir ve **ödenmiş adımlar yeniden
  // ödenir** — R-44'ün tam tersi. `just onay` araya `just save` öneriyor, yani
  // corpus SHA'sının değişmesi olağan bir senaryo.
  const konuKaydi = (oncekiManifest.steps ?? []).find(
    (st) => typeof st.params?.topic === 'string' && st.params.topic !== ''
  )
  devamKonu = konuKaydi?.params.topic ?? null
  console.log(
    `  ${devamRunId} sürdürülüyor · ${kararlar.length} kapı kararı · ` +
      `donmuş girdiler yeniden kullanılıyor (corpus ${oncekiManifest.corpusCommit.slice(0, 8)}` +
      `${devamKonu === null ? '' : `, konu "${devamKonu}"`})`
  )
}
const clock = systemClock
const damga = {
  brandId: MARKA,
  eraId: AKTIF_DONEM,
  kitVersion: 'kit-1',
  definitionDigest: 'sha256:faz3',
  contextManifest: `ctx_${runId}`,
  sourceRunId: runId,
}

// ── corpus: TEK retrieval yükleminden (R-13, R-14) ──────────────────────────
//
// ⚠ Buranın ilk hâli `globSync('corpus/*/*.md')` ile İKİNCİ BİR YÜKLEM kuruyordu ve
// yedi `status: draft` kaydı üretime sokuyordu. İki BLOCKING kural birden çiğneniyordu:
// R-13 (retrieval yüklemi kodda tek yerde) ve R-14 (agent önerir, insan uygular —
// draft retrieval'a GÖRÜNMEZ). Doğrulama agent'ı 2026-08-15'te yakaladı (D-134).
//
// Şimdi `selectRecords` çağrılıyor: `status IN ('active','pinned')` yüklemin İÇİNDE.
// Onaylanmamış corpus'ta bu SIFIR kayıt döndürür ve hat `NO_CONTEXT` ile durur —
// **doğru davranış budur.** Onay insanın işidir (FAZ-2.9) ve o kapı atlanamaz.
const indeksYolu = join(REPO, 'derived/index/suite.db')
if (!existsSync(indeksYolu)) {
  console.log(`✗ türetilmiş indeks yok: ${indeksYolu}`)
  console.log('  önce: just reindex')
  process.exit(1)
}
const corpusDb = openDb({ path: indeksYolu })

const secici = (sorgu, limit) => {
  const q = {
    brandId: MARKA,
    eraId: AKTIF_DONEM,
    // Saat ÇAĞIRANDAN gelir; yüklem saat okumaz (R-06).
    asOf: clock.nowIso(),
    limit,
  }
  // Önce arama (FTS5 + yüklem), sonuç yoksa yüklemin kendisi: konuya değmeyen ama
  // ONAYLI bir kayıt, konuya değen ama onaysız bir kayıttan iyidir.
  const hits = selectSearch(corpusDb, q, sorgu, limit)
  const kayitlar = hits.length > 0 ? hits : selectRecords(corpusDb, q)
  return kayitlar.map((k) => ({
    id: k.id,
    text: (k.body ?? k.snippet ?? '')
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

  // Boyut GERÇEKTEN ölçülür. Merdiven `RENDER` adımında uygulandı (D-139); burada
  // yalnız sonucu doğruluyoruz — sınırı aşan bir dosya buraya hiç ulaşmamalı.
  //
  // ⚠ İlk hâli `climbLadder`ı UYDURMA bir formülle çağırıyordu
  // (`boyut × kalite/200 × ölçek²`) — `static.ts`in bizzat "uydurma" dediği şey.
  // D-139 gövdeyi düzeltti ama CLI raporunu düzeltmemişti; 2. doğrulama turu yakaladı
  // (D-153). Tahmin edilen bir boyut, ölçülebilir bir şeyi tahmin etmektir.
  for (const [i, yol] of slides.entries()) {
    const boyut = statSync(yol).size
    const uygun = boyut <= yerlesim.maxBytes
    const uzanti = yol.split('.').pop()
    satirlar.push(
      `  slayt ${i + 1} boyut: ${uygun ? '✓' : '✗'} ${Math.round(boyut / 1024)}KB / ` +
        `${Math.round(yerlesim.maxBytes / 1024)}KB · ${uzanti}`
    )
    if (!uygun) bloke = true
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

// ── bağlam manifesti (§5.3) ─────────────────────────────────────────────────
// Tarif varsa gerçek bir manifest üretilir; yoksa BOŞ kalır ve bu dürüsttür —
// uydurma bir bağlam kaydı, olmayan bir denetim izidir.
let bagamManifesti = []
{
  const { loadRecipe, listRecipes } = await import(join(REPO, 'packages/registry/dist/index.js'))
  const { assembleContext, toManifestEntries } = await import(
    join(REPO, 'packages/engine/dist/index.js')
  )
  const RECIPES = join(REPO, 'registry/recipes')
  if (listRecipes(RECIPES).includes(id)) {
    const tarif = loadRecipe(RECIPES, id)
    if (tarif.ok) {
      // Adaylar retrieval yükleminden gelir — ikinci bir yol YOK (R-13).
      const adaylar = {}
      for (const b of tarif.value.sections) {
        adaylar[b.entityType] = selectRecords(corpusDb, {
          brandId: MARKA,
          eraId: AKTIF_DONEM,
          asOf: clock.nowIso(),
          type: b.entityType,
          limit: 20,
        }).map((k) => ({
          id: k.id,
          title: k.title ?? k.id,
          type: k.type,
          body: k.body ?? '',
        }))
      }
      bagamManifesti = toManifestEntries(assembleContext(tarif.value, adaylar))
    }
  }
}

const cikti = runOutputDir(REPO, runId)

const bilgi = await knowledgeCommit(REPO, { PATH: readEnv('PATH') ?? '' })
if (!bilgi.ok) {
  console.log("✗ bilgi ağacı commit SHA'sı okunamadı — replay yapılamaz (§13)")
  console.log("  git deposu değil mi, yoksa `git` PATH'te mi yok?")
  process.exit(1)
}
const bilgiSha = bilgi.sha

// ── GENERATE: GERÇEK adaptöre gider ────────────────────────────────────────
//
// ⚠ İlk hâli sabit `MISSING_CREDENTIALS` döndüren SAHTE bir köprüydü: `cloudflareImage`
// ve `falImage` adaptörlerine hiç ulaşılmıyor, "iki şerit de görsel üretiyor" iddiası
// hiç sınanmıyordu (D-141). Artık yönlendiricinin seçtiği adaptöre gidiyor; anahtar
// yoksa ADAPTÖRÜN KENDİSİ `MISSING_CREDENTIALS` diyor — ve bu fark önemli: hata artık
// gerçek bir kod yolundan geliyor.
const generate = generateBody({
  resolveAdapter: adapterById,
  env: {
    PATH: readEnv('PATH') ?? '',
    // Sağlayıcı anahtarları AÇIKÇA aktarılır (§14). Yoksa adaptör kendi hatasını verir.
    ...(readEnv('FAL_KEY') === undefined ? {} : { FAL_KEY: readEnv('FAL_KEY') }),
    ...(readEnv('CF_ACCOUNT_ID') === undefined ? {} : { CF_ACCOUNT_ID: readEnv('CF_ACCOUNT_ID') }),
    ...(readEnv('CF_API_TOKEN') === undefined ? {} : { CF_API_TOKEN: readEnv('CF_API_TOKEN') }),
  },
  capability: 'image.generate',
})

// ── maliyet defteri KALICI olmak zorunda (R-44 · D-137) ────────────────────
//
// İlk hâli `:memory:` idi: defter süreçle birlikte ölüyordu. Yani SIGKILL sonrası
// yeniden başlatma idempotency kaydını bulamıyor ve **aynı çağrı tekrar uçuyordu** —
// FAZ-3.6'nın "çift ücret yok" iddiasının tam tersi. `scheduler.ts` doğru yazılmıştı;
// üretim yolu ona boş bir defter veriyordu.
//
// `derived/index/` gitignore'lu ve yeniden üretilebilir; defter oraya DEĞİL, çalıştırma
// dizinine yakın ve kalıcı bir yere gider. Şimdilik `derived/index/ledger.db` — indeksle
// aynı dizinde ama AYRI dosya ve `just reindex` onu silmez (FAZ-4'te ayrı yola taşınır).
const ledgerYolu = join(REPO, 'derived/index/ledger.db')
mkdirSync(dirname(ledgerYolu), { recursive: true })
const db = openDb({ path: ledgerYolu })
initLedger(db)

const rapor = await runPipeline({
  repoRoot: REPO,
  pipeline: cozum.value,
  runId,
  brandId: MARKA,
  eraId: AKTIF_DONEM,
  // **Bilgi ağacı commit SHA'sı — replay'i GERÇEK yapan alan** (§13).
  // İlk hâli `'worktree'` sabitiydi: `knowledgeCommit()` yazılmıştı ama sıfır çağıranı
  // vardı ve 11 manifest'in hepsinde alan sahteydi (D-138). Artık git'ten okunuyor;
  // okunamazsa çalıştırma DURUR — sahte bir SHA, replay'in yalan söylemesidir.
  // Devam ediyorsa DONMUŞ SHA; yoksa bugünün ağacı. Yeniden çözmek, aynı çalıştırmayı
  // farklı bir bilgi ağacında koşturmak olurdu (R-07).
  corpusCommit: oncekiManifest?.corpusCommit ?? bilgiSha,
  registryCommit: oncekiManifest?.registryCommit ?? bilgiSha,
  verbs: {
    RESOLVE: resolveBody,
    SELECT: selectBody({ select: secici }),
    COMPOSE: composeBody({ tokenCss, stamp: damga }),
    RENDER: renderBody({
      outDir: cikti,
      layout: 'statement',
      // Sınır YERLEŞİMDEN gelir (§9.1): LinkedIn 5MB, Instagram 8MB.
      maxBytes: (
        placementById(id.startsWith('linkedin') ? 'linkedin-feed-4x5' : 'instagram-feed-4x5') ?? {
          maxBytes: 8 * 1024 * 1024,
        }
      ).maxBytes,
    }),
    VALIDATE: validateBody({ check: kaliteKontrol }),
    GENERATE: generate,
  },
  pricing,
  candidatesFor,
  env: { PATH: readEnv('PATH') ?? '' },
  // Konu bir ÇALIŞTIRMA parametresi, pipeline kısıtı değil: her konu için ayrı bir
  // YAML yazmak saçma olurdu. Pipeline kısıtı her zaman kazanır (R-20 ezilemez).
  params: { topic: devamKonu ?? konu },
  // Kararlar manifest'ten OKUNUR; motor yalnız yazılmış olanı görür.
  decisions: kararlar,
  // **Bağlam manifesti** (§5.3): hangi kayıt enjekte edildi, hangisi bütçeye sığmadı.
  // İlk sürümde `context: []` sabit koduydu ve "bu çıktı neden böyle" sorusunun cevabı
  // hiçbir yerde yoktu (D-146).
  context: bagamManifesti,
  previous: oncekiManifest,
  // Tavan DÜŞÜK ve ZORUNLU: tavansız çalıştırmak, gözetimsiz bir gecede tavanın
  // olmadığını öğrenmektir.
  caps: {
    perRun: { micros: BigInt(readEnv('SUITE_RUN_CAP') ?? '100000'), currency: 'USD' },
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
    // Özet `assertCompliance` tarafından TARANAN prompt'tan hesaplanır; buradaki
    // değer yok sayılır (D-143). Yer tutucu bırakmak, iddianın kendi dayanağını
    // yazdığı izlenimini verirdi.
    basis: { kind: 'prompt_forbids_people', promptDigest: '' },
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
